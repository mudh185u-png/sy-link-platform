import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { FaUsers, FaLink, FaChartBar, FaUserShield, FaSignOutAlt, FaExternalLinkAlt, FaTrash, FaUserSlash, FaCheckCircle, FaSearch, FaCogs, FaPalette, FaUpload, FaSpinner, FaHammer, FaBroadcastTower, FaFileAlt, FaShieldAlt, FaRocket } from 'react-icons/fa'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ThemeEditor from '../components/ThemeEditor'

const Dashboard = () => {
    const { t, language } = useLanguage()
    const [activeTab, setActiveTab] = useState('users')
    const [selectedUser, setSelectedUser] = useState(null)
    const [settings, setSettings] = useState({
        support_email: '',
        maintenance_mode: false,
        registration_enabled: true,
        system_announcement: { message: '', color: '#ff2d55', active: false },
        promo_announcement: { message: '', image_url: '', active: false },
        profile_ad_announcement: { message: '', image_url: '', target_url: '', active: false, inject_index: 3 },
        profile_ads: [], // Multi-ad support
        hidden_skins: [],
        disabled_pages: []
    })
    const [users, setUsers] = useState([])
    const [links, setLinks] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [stats, setStats] = useState({ totalUsers: 0, totalLinks: 0, totalClicks: 0 })
    const [pageBackgrounds, setPageBackgrounds] = useState({
        global: { type: 'animated', value: '#ff2d55' },
        landing: { type: 'animated', value: '#ff2d55', use_global: true },
        login: { type: 'animated', value: '#ff2d55', use_global: true },
        dashboard: { type: 'animated', value: '#ff2d55', use_global: true },
        links: { type: 'animated', value: '#ff2d55', use_global: true },
        profile: { type: 'animated', value: '#ff2d55', use_global: true },
        appearance: { type: 'animated', value: '#ff2d55', use_global: true }
    })
    const [loading, setLoading] = useState(true)
    const [uploadingBg, setUploadingBg] = useState(null)



    const fetchSettings = useCallback(async () => {
        const { data } = await supabase.from('platform_settings').select('*')
        if (data) {
            setSettings(prev => {
                const newSettings = { ...prev }
                data.forEach(s => {
                    if (s.key === 'support_email') newSettings.support_email = s.value
                    if (s.key === 'maintenance_mode') newSettings.maintenance_mode = s.value === 'true'
                    if (s.key === 'registration_enabled') newSettings.registration_enabled = s.value === 'true'
                    if (s.key === 'system_announcement') {
                        try {
                            newSettings.system_announcement = JSON.parse(s.value)
                        } catch { /* Ignore parse error */ }
                    }
                    if (s.key === 'promo_announcement') {
                        try {
                            newSettings.promo_announcement = JSON.parse(s.value)
                        } catch { /* Ignore parse error */ }
                    }
                    if (s.key === 'profile_ad_announcement') {
                        try {
                            newSettings.profile_ad_announcement = JSON.parse(s.value)
                        } catch { /* Ignore parse error */ }
                    }
                    if (s.key === 'profile_ads') {
                        try {
                            newSettings.profile_ads = JSON.parse(s.value)
                        } catch { /* Ignore parse error */ }
                    }
                    if (s.key === 'hidden_skins') {
                        try {
                            newSettings.hidden_skins = JSON.parse(s.value)
                        } catch { /* Ignore parse error */ }
                    }
                    if (s.key === 'disabled_pages') {
                        try {
                            newSettings.disabled_pages = JSON.parse(s.value)
                        } catch { /* Ignore parse error */ }
                    }
                })
                return newSettings
            })

            // Fetch background settings
            const bgData = data.find(s => s.key === 'page_backgrounds')?.value
            if (bgData) {
                try {
                    setPageBackgrounds(JSON.parse(bgData))
                } catch { /* Ignore parse error */ }
            }
        }
    }, [])

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)

            // 1. Fetch users (Independent)
            const { data: usersData, error: usersError } = await supabase
                .from('profiles')
                .select('*')
                .order('is_master', { ascending: false })

            if (!usersError) {
                setUsers(usersData || [])
            } else {
                console.error('Users fetch error:', usersError)
            }

            // 2. Fetch links with owner info (Joint)
            // If this fails due to relationship error, we'll fetch them separately as fallback
            const { data: linksData, error: linksError } = await supabase
                .from('links')
                .select(`
                    *,
                    profiles (
                        username,
                        full_name
                    )
                `)
                .order('created_at', { ascending: false })

            if (linksError) {
                console.warn('Joint fetch failed, attempting independent fetch:', linksError)
                const { data: simpleLinks } = await supabase.from('links').select('*').order('created_at', { ascending: false })
                setLinks(simpleLinks || [])
            } else {
                setLinks(linksData || [])
            }

            // 3. Fetch generic stats
            const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
            const { count: linkCount } = await supabase.from('links').select('*', { count: 'exact', head: true })

            // Calculate total clicks from links (whether joint or simple)
            const totalC = (linksData || []).reduce((acc, curr) => acc + (curr.click_count || 0), 0)

            setStats({
                totalUsers: userCount || 0,
                totalLinks: linkCount || 0,
                totalClicks: totalC || 0
            })

        } catch (err) {
            console.error('Master Admin Global Fetch Error:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
        fetchSettings()
    }, [fetchData, fetchSettings])

    const toggleSuspension = async (user) => {
        const newStatus = !user.is_suspended
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_suspended: newStatus })
                .eq('id', user.id)

            if (error) throw error
            setUsers(users.map(u => u.id === user.id ? { ...u, is_suspended: newStatus } : u))
        } catch (err) {
            alert(t.deleteFailed + err.message)
        }
    }

    const toggleVerification = async (user) => {
        const newStatus = !user.is_verified
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_verified: newStatus })
                .eq('id', user.id)

            if (error) throw error
            setUsers(users.map(u => u.id === user.id ? { ...u, is_verified: newStatus } : u))
        } catch (err) {
            alert(err.message)
        }
    }

    const deleteUser = async (id) => {
        if (!window.confirm(t.deleteConfirm)) return
        try {
            const { error } = await supabase.from('profiles').delete().eq('id', id)
            if (error) throw error
            setUsers(users.filter(u => u.id !== id))
        } catch (err) {
            alert(t.deleteFailed + err.message)
        }
    }

    const deleteLink = async (id) => {
        if (!window.confirm(t.deleteConfirm)) return
        try {
            const { error } = await supabase.from('links').delete().eq('id', id)
            if (error) throw error
            setLinks(links.filter(l => l.id !== id))
            setStats(prev => ({ ...prev, totalLinks: prev.totalLinks - 1 }))
        } catch (err) {
            alert(t.deleteFailed + err.message)
        }
    }

    const logout = async () => {
        await supabase.auth.signOut()
        window.location.reload()
    }

    const updateSettings = async () => {
        try {
            const { error } = await supabase
                .from('platform_settings')
                .upsert({ key: 'support_email', value: settings.support_email }, { onConflict: 'key' })

            if (error) throw error
            alert(t.settingsUpdated)
        } catch (err) {
            alert('Error: ' + err.message)
        }
    }

    const handleSettingToggle = async (key, currentValue) => {
        const newValue = !currentValue
        try {
            const { error } = await supabase
                .from('platform_settings')
                .upsert({ key, value: String(newValue) }, { onConflict: 'key' })

            if (error) throw error
            setSettings(prev => ({ ...prev, [key]: newValue }))
        } catch (err) {
            alert('Error: ' + err.message)
        }
    }

    const saveComplexSetting = async (key, value) => {
        try {
            const { error } = await supabase
                .from('platform_settings')
                .upsert({ key, value: JSON.stringify(value) }, { onConflict: 'key' })

            if (error) throw error
            setSettings(prev => ({ ...prev, [key]: value }))
        } catch (err) {
            alert('Error: ' + err.message)
        }
    }

    const saveBackgroundConfigs = async () => {
        try {
            const { error } = await supabase
                .from('platform_settings')
                .upsert({ key: 'page_backgrounds', value: JSON.stringify(pageBackgrounds) }, { onConflict: 'key' })

            if (error) throw error
            alert(t.settingsUpdated)
        } catch (err) {
            alert('Error: ' + err.message)
        }
    }

    const handleFileUpload = async (e, page) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            setUploadingBg(page)
            const fileExt = file.name.split('.').pop()
            const fileName = `bg-${page}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `platform-bgs/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            setPageBackgrounds(prev => ({
                ...prev,
                [page]: { ...prev[page], value: publicUrl }
            }))

            alert(t.settingsUpdated)
        } catch (err) {
            alert('Upload error: ' + err.message)
        } finally {
            setUploadingBg(null)
        }
    }

    const handlePromoImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            setUploadingBg('promo')
            const fileExt = file.name.split('.').pop()
            const fileName = `promo-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `promos/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            setSettings(prev => ({
                ...prev,
                promo_announcement: { ...prev.promo_announcement, image_url: publicUrl }
            }))

            alert(t.settingsUpdated)
        } catch (err) {
            alert('Upload error: ' + err.message)
        } finally {
            setUploadingBg(null)
        }
    }

    const handleMultiAdImageUpload = async (e, adId) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            setUploadingBg(`ad-${adId}`)
            const fileExt = file.name.split('.').pop()
            const fileName = `ad-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `promos/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            setSettings(prev => ({
                ...prev,
                profile_ads: prev.profile_ads.map(ad =>
                    ad.id === adId ? { ...ad, image_url: publicUrl } : ad
                )
            }))

            alert(t.settingsUpdated)
        } catch (err) {
            alert('Upload error: ' + err.message)
        } finally {
            setUploadingBg(null)
        }
    }

    const addNewAd = () => {
        const newAd = {
            id: Date.now(),
            message: '',
            image_url: '',
            target_url: '',
            active: true,
            inject_index: 3,
            placement: 'profile'
        }
        setSettings(prev => ({
            ...prev,
            profile_ads: [...(prev.profile_ads || []), newAd]
        }))
    }

    const removeAd = (id) => {
        if (!window.confirm(t.deleteConfirm)) return
        setSettings(prev => ({
            ...prev,
            profile_ads: prev.profile_ads.filter(ad => ad.id !== id)
        }))
    }

    const handleAdChange = (id, field, value) => {
        setSettings(prev => ({
            ...prev,
            profile_ads: prev.profile_ads.map(ad =>
                ad.id === id ? { ...ad, [field]: value } : ad
            )
        }))
    }

    const filteredUsers = users.filter(u =>
        (u.username?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const filteredLinks = links.filter(l =>
        (l.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.url?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const userSpecificLinks = selectedUser ? links.filter(l => l.user_id === selectedUser.id) : []

    return (
        <div style={{ padding: '40px 5%', maxWidth: '1400px', margin: '0 auto', direction: language === 'ar' ? 'rtl' : 'ltr', minHeight: '100vh' }}>
            <LanguageSwitcher />

            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
                    <h1 className="brand-logo" style={{ fontSize: '2.5rem' }}>{t.masterTitle}</h1>
                    <p style={{ opacity: 0.5, fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.masterSubtitle}</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <a href="https://sy-links.com" target="_blank" rel="noreferrer" className="glass-btn" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}>
                        <FaExternalLinkAlt /> {t.livePlatform}
                    </a>
                    <button onClick={logout} className="glass-btn" style={{ background: 'rgba(255, 45, 85, 0.1)', color: '#ff2d55', border: '1px solid rgba(255, 45, 85, 0.2)' }}>
                        <FaSignOutAlt /> {t.terminateSession}
                    </button>
                </div>
            </nav>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                <StatsCard icon={<FaUsers />} label={t.totalUsers} value={stats.totalUsers} color="#ff2d55" />
                <StatsCard icon={<FaLink />} label={t.totalLinks} value={stats.totalLinks} color="#4ade80" />
                <StatsCard icon={<FaChartBar />} label={t.engagement} value={stats.totalClicks} color="#60a5fa" />
            </div>

            {/* Tab Controls */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
                <TabBtn active={activeTab === 'users'} onClick={() => { setActiveTab('users'); setSelectedUser(null); }} icon={<FaUsers />} label={t.userManagement} />
                <TabBtn active={activeTab === 'links'} onClick={() => { setActiveTab('links'); setSelectedUser(null); }} icon={<FaLink />} label={t.linkOversight} />
                <TabBtn active={activeTab === 'command_center'} onClick={() => { setActiveTab('command_center'); setSelectedUser(null); }} icon={<FaShieldAlt />} label={t.commandCenter} />
                <TabBtn active={activeTab === 'backgrounds'} onClick={() => { setActiveTab('backgrounds'); setSelectedUser(null); }} icon={<FaPalette />} label={t.aestheticControl} />
                <TabBtn active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setSelectedUser(null); }} icon={<FaCogs />} label={t.strategicConfig} />
            </div>

            {/* Search Bar */}
            <div className="glass-panel" style={{ padding: '0.8rem 1.5rem', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ background: 'none', border: 'none', color: '#fff', width: '100%', fontSize: '0.9rem', outline: 'none' }}
                />
            </div>

            {/* Main Content Area */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '30px', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem', opacity: 0.5 }}>{t.syncing}</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        {activeTab === 'backgrounds' ? (
                            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h2 style={{ fontSize: '1.2rem', fontWeight: '900' }}>{t.pageBackgrounds}</h2>
                                    <button onClick={saveBackgroundConfigs} className="glass-btn" style={{ background: 'var(--accent-gradient)', border: 'none' }}>
                                        {t.saveBackgrounds}
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                    {Object.entries(pageBackgrounds).map(([page, config]) => (
                                        <div key={page} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '1rem', textTransform: 'capitalize', color: 'var(--accent-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                {t[page + 'Page'] || t[page + 'Bg'] || page}
                                                {page !== 'global' && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setPageBackgrounds({ ...pageBackgrounds, [page]: { ...config, use_global: !config.use_global } })}>
                                                        <span style={{ fontSize: '0.65rem', color: '#fff', opacity: config.use_global ? 1 : 0.3 }}>{t.inheritGlobal}</span>
                                                        <div style={{ width: '32px', height: '16px', borderRadius: '10px', background: config.use_global ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'all 0.3s' }}>
                                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: config.use_global ? '18px' : '2px', transition: 'all 0.3s' }}></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </h3>

                                            <div style={{ opacity: page !== 'global' && config.use_global ? 0.3 : 1, pointerEvents: page !== 'global' && config.use_global ? 'none' : 'auto' }}>
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <label style={{ display: 'block', opacity: 0.5, fontSize: '0.7rem', fontWeight: '800', marginBottom: '8px' }}>{t.bgType}</label>
                                                    <select
                                                        value={config.type}
                                                        onChange={(e) => setPageBackgrounds({ ...pageBackgrounds, [page]: { ...config, type: e.target.value } })}
                                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '12px', color: '#fff' }}
                                                    >
                                                        <option value="animated">{t.animatedImage}</option>
                                                        <option value="brand">{t.brandBg}</option>
                                                        <option value="cosmic">{t.cosmicBg}</option>
                                                        <option value="gradient">Gradient</option>
                                                        <option value="solid">Solid Color</option>
                                                        <option value="image">{t.staticImage}</option>
                                                        <option value="video">Background Video</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label style={{ display: 'block', opacity: 0.5, fontSize: '0.7rem', fontWeight: '800', marginBottom: '8px' }}>{t.bgValue}</label>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <input
                                                            type="text"
                                                            value={config.value}
                                                            onChange={(e) => setPageBackgrounds({ ...pageBackgrounds, [page]: { ...config, value: e.target.value } })}
                                                            placeholder={config.type === 'solid' ? '#000000' : 'URL or Gradient code'}
                                                            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '12px', color: '#fff' }}
                                                        />
                                                        {['image', 'animated-image', 'video'].includes(config.type) && (
                                                            <div style={{ position: 'relative' }}>
                                                                <button
                                                                    disabled={!!uploadingBg}
                                                                    className="glass-btn"
                                                                    style={{ padding: '0.8rem', borderRadius: '12px', background: 'rgba(255,255,255,0.1)' }}
                                                                    onClick={() => document.getElementById(`upload-${page}`).click()}
                                                                >
                                                                    {uploadingBg === page ? <FaSpinner className="spin" /> : <FaUpload />}
                                                                </button>
                                                                <input
                                                                    id={`upload-${page}`}
                                                                    type="file"
                                                                    hidden
                                                                    accept={config.type === 'video' ? 'video/*' : 'image/*'}
                                                                    onChange={(e) => handleFileUpload(e, page)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : activeTab === 'command_center' ? (
                            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: '950', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <FaShieldAlt color="var(--accent-color)" /> {t.commandCenter}
                                </h2>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px' }}>
                                    {/* Platform Vitals */}
                                    <div className="glass-panel" style={{ padding: '2rem', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '900', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FaHammer /> {t.platformVitals}
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <SettingToggle
                                                icon={<FaShieldAlt />}
                                                label={t.maintenanceMode}
                                                desc={t.maintenanceDesc}
                                                enabled={settings.maintenance_mode}
                                                onToggle={() => handleSettingToggle('maintenance_mode', settings.maintenance_mode)}
                                            />
                                            <SettingToggle
                                                icon={<FaUsers />}
                                                label={t.registrationEnabled}
                                                desc={t.registrationDesc}
                                                enabled={settings.registration_enabled}
                                                onToggle={() => handleSettingToggle('registration_enabled', settings.registration_enabled)}
                                            />
                                        </div>
                                    </div>

                                    {/* Broadcast Center */}
                                    <div className="glass-panel" style={{ padding: '2rem', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '900', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FaBroadcastTower /> {t.broadcastCenter}
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <div>
                                                <label style={{ display: 'block', opacity: 0.5, fontSize: '0.75rem', fontWeight: '800', marginBottom: '10px' }}>{t.announcementMessage}</label>
                                                <textarea
                                                    value={settings.system_announcement.message}
                                                    onChange={(e) => setSettings({ ...settings, system_announcement: { ...settings.system_announcement, message: e.target.value } })}
                                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '15px', color: '#fff', fontSize: '0.9rem', minHeight: '80px' }}
                                                    placeholder={t.announcementPlaceholder}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <input
                                                    type="color"
                                                    value={settings.system_announcement.color}
                                                    onChange={(e) => setSettings({ ...settings, system_announcement: { ...settings.system_announcement, color: e.target.value } })}
                                                    style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <SettingToggle
                                                        icon={<FaBroadcastTower />}
                                                        label={t.announcementActive}
                                                        desc={t.broadcastDesc}
                                                        enabled={settings.system_announcement.active}
                                                        onToggle={() => {
                                                            const newVal = { ...settings.system_announcement, active: !settings.system_announcement.active }
                                                            saveComplexSetting('system_announcement', newVal)
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => saveComplexSetting('system_announcement', settings.system_announcement)}
                                                className="glass-btn"
                                                style={{ width: '100%', background: 'var(--accent-gradient)', border: 'none' }}
                                            >
                                                {t.updateBroadcast}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Promotional Splash */}
                                    <div className="glass-panel" style={{ padding: '2rem', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '900', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FaRocket color="#f9d423" /> {t.promoSplash}
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <div>
                                                <label style={{ display: 'block', opacity: 0.5, fontSize: '0.75rem', fontWeight: '800', marginBottom: '10px' }}>{t.promoMessage}</label>
                                                <textarea
                                                    value={settings.promo_announcement.message}
                                                    onChange={(e) => setSettings({ ...settings, promo_announcement: { ...settings.promo_announcement, message: e.target.value } })}
                                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '15px', color: '#fff', fontSize: '0.9rem', minHeight: '80px' }}
                                                    placeholder={t.promoPlaceholder}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', opacity: 0.5, fontSize: '0.75rem', fontWeight: '800', marginBottom: '10px' }}>{t.promoImageUrl}</label>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <input
                                                        type="text"
                                                        value={settings.promo_announcement.image_url}
                                                        onChange={(e) => setSettings({ ...settings, promo_announcement: { ...settings.promo_announcement, image_url: e.target.value } })}
                                                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '15px', color: '#fff' }}
                                                        placeholder="https://..."
                                                    />
                                                    <div style={{ position: 'relative' }}>
                                                        <button
                                                            disabled={uploadingBg === 'promo'}
                                                            className="glass-btn"
                                                            style={{ padding: '0.8rem', borderRadius: '12px', background: 'rgba(255,255,255,0.1)' }}
                                                            onClick={() => document.getElementById('promo-upload').click()}
                                                        >
                                                            {uploadingBg === 'promo' ? <FaSpinner className="spin" /> : <FaUpload />}
                                                        </button>
                                                        <input
                                                            id="promo-upload"
                                                            type="file"
                                                            hidden
                                                            accept="image/*"
                                                            onChange={handlePromoImageUpload}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <SettingToggle
                                                icon={<FaRocket />}
                                                label={t.promoActive}
                                                desc={t.promoDesc}
                                                enabled={settings.promo_announcement.active}
                                                onToggle={() => {
                                                    const newVal = { ...settings.promo_announcement, active: !settings.promo_announcement.active }
                                                    saveComplexSetting('promo_announcement', newVal)
                                                }}
                                            />
                                            <button
                                                onClick={() => saveComplexSetting('promo_announcement', settings.promo_announcement)}
                                                className="glass-btn"
                                                style={{ width: '100%', background: 'var(--accent-gradient)', border: 'none' }}
                                            >
                                                {t.updateSplash}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Multi-Ad Management (NEW) */}
                                    <div className="glass-panel" style={{ padding: '2rem', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h3 style={{ fontSize: '1rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <FaChartBar color="#4ade80" /> {t.inProfileAd || 'In-Profile Ads'}
                                            </h3>
                                            <button
                                                onClick={addNewAd}
                                                className="glass-btn"
                                                style={{ fontSize: '0.75rem', padding: '8px 15px', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)', color: '#4ade80' }}
                                            >
                                                + {t.addNewAdLabel}
                                            </button>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                            {(settings.profile_ads || []).map((ad, index) => (
                                                <div key={ad.id} style={{
                                                    padding: '20px',
                                                    borderRadius: '20px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    position: 'relative'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                                        <span style={{ fontSize: '0.7rem', fontWeight: '900', opacity: 0.5, textTransform: 'uppercase' }}>
                                                            {t.adLabel} #{index + 1}
                                                        </span>
                                                        <button
                                                            onClick={() => removeAd(ad.id)}
                                                            style={{ background: 'none', border: 'none', color: '#ff2d55', cursor: 'pointer', opacity: 0.5 }}
                                                        >
                                                            <FaTrash size={14} />
                                                        </button>
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '10px' }}>
                                                            <div>
                                                                <label style={{ display: 'block', opacity: 0.5, fontSize: '0.75rem', fontWeight: '800', marginBottom: '8px' }}>{t.adTitle}</label>
                                                                <input
                                                                    type="text"
                                                                    value={ad.message}
                                                                    onChange={(e) => handleAdChange(ad.id, 'message', e.target.value)}
                                                                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '12px', color: '#fff' }}
                                                                    placeholder={t.adPlaceholder}
                                                                />
                                                            </div>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                                <div>
                                                                    <label style={{ display: 'block', opacity: 0.5, fontSize: '0.75rem', fontWeight: '800', marginBottom: '8px' }}>{t.adPlacement}</label>
                                                                    <select
                                                                        value={ad.placement || 'profile'}
                                                                        onChange={(e) => handleAdChange(ad.id, 'placement', e.target.value)}
                                                                        style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '12px', color: '#fff', outline: 'none' }}
                                                                    >
                                                                        <option value="profile">{t.userProfile}</option>
                                                                        <option value="home">{t.homepage}</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label style={{ display: 'block', opacity: 0.5, fontSize: '0.75rem', fontWeight: '800', marginBottom: '8px' }}>{(ad.placement === 'home') ? t.displayOrder : t.adRowIndex}</label>
                                                                    <input
                                                                        type="number"
                                                                        value={ad.inject_index}
                                                                        onChange={(e) => handleAdChange(ad.id, 'inject_index', parseInt(e.target.value))}
                                                                        style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '12px', color: '#fff' }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label style={{ display: 'block', opacity: 0.5, fontSize: '0.75rem', fontWeight: '800', marginBottom: '8px' }}>{t.adTargetUrl}</label>
                                                            <input
                                                                type="text"
                                                                value={ad.target_url}
                                                                onChange={(e) => handleAdChange(ad.id, 'target_url', e.target.value)}
                                                                style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '12px', color: '#fff' }}
                                                                placeholder="https://..."
                                                            />
                                                        </div>

                                                        <div>
                                                            <label style={{ display: 'block', opacity: 0.5, fontSize: '0.75rem', fontWeight: '800', marginBottom: '8px' }}>{t.adImageUrl}</label>
                                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                                <input
                                                                    type="text"
                                                                    value={ad.image_url}
                                                                    onChange={(e) => handleAdChange(ad.id, 'image_url', e.target.value)}
                                                                    style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '12px', color: '#fff' }}
                                                                />
                                                                <div style={{ position: 'relative' }}>
                                                                    <button
                                                                        disabled={uploadingBg === `ad-${ad.id}`}
                                                                        className="glass-btn"
                                                                        style={{ padding: '0.8rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }}
                                                                        onClick={() => document.getElementById(`ad-upload-${ad.id}`).click()}
                                                                    >
                                                                        {uploadingBg === `ad-${ad.id}` ? <FaSpinner className="spin" /> : <FaUpload />}
                                                                    </button>
                                                                    <input
                                                                        id={`ad-upload-${ad.id}`}
                                                                        type="file"
                                                                        hidden
                                                                        accept="image/*"
                                                                        onChange={(e) => handleMultiAdImageUpload(e, ad.id)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <SettingToggle
                                                            icon={<FaChartBar />}
                                                            label={t.adActive}
                                                            desc={t.adDesc}
                                                            enabled={ad.active}
                                                            onToggle={() => handleAdChange(ad.id, 'active', !ad.active)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            {(!settings.profile_ads || settings.profile_ads.length === 0) && (
                                                <div style={{ textAlign: 'center', padding: '30px', opacity: 0.3, fontSize: '0.85rem' }}>
                                                    {t.noActiveAds || (language === 'ar' ? 'لا توجد إعلانات نشطة' : 'No active advertisements')}
                                                </div>
                                            )}

                                            <button
                                                onClick={() => saveComplexSetting('profile_ads', settings.profile_ads)}
                                                className="glass-btn"
                                                style={{ width: '100%', background: 'var(--accent-gradient)', border: 'none', fontWeight: '900' }}
                                            >
                                                {t.saveAds}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Page Control */}
                                    <div className="glass-panel" style={{ padding: '2rem', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '900', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FaFileAlt /> {t.pageControl}
                                        </h3>
                                        <p style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '1.5rem' }}>{t.pagesDesc}</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            {['Showcase', 'Discovery', 'Trending', 'Marketplace'].map(page => {
                                                const isDisabled = settings.disabled_pages.includes(page)
                                                const pageKey = page.toLowerCase() + 'Page'
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => {
                                                            const newList = isDisabled
                                                                ? settings.disabled_pages.filter(p => p !== page)
                                                                : [...settings.disabled_pages, page]
                                                            saveComplexSetting('disabled_pages', newList)
                                                        }}
                                                        style={{
                                                            padding: '12px',
                                                            borderRadius: '12px',
                                                            background: isDisabled ? 'rgba(255, 45, 85, 0.1)' : 'rgba(74, 222, 128, 0.1)',
                                                            color: isDisabled ? '#ff2d55' : '#4ade80',
                                                            border: `1px solid ${isDisabled ? 'rgba(255, 45, 85, 0.2)' : 'rgba(74, 222, 128, 0.2)'}`,
                                                            fontSize: '0.8rem',
                                                            fontWeight: '800',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {t[pageKey] || page} {isDisabled ? `(${t.off || 'OFF'})` : `(${t.on || 'ON'})`}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Toolbox / System Tools */}
                                    <div className="glass-panel" style={{ padding: '2rem', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '900', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FaCogs /> {t.toolbox}
                                        </h3>
                                        <p style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '1.5rem' }}>{t.toolboxDesc}</p>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            <button className="glass-btn" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem' }}>{t.clearCache}</button>
                                            <button className="glass-btn" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem' }}>{t.pruneLinks}</button>
                                            <button className="glass-btn" style={{ background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.75rem' }}>{t.exportCSV}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : activeTab === 'settings' ? (
                            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 0' }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '2rem' }}>{t.platformSettings}</h2>

                                {/* NEW: Theme Editor Section */}
                                <div style={{ marginBottom: '3rem' }}>
                                    <ThemeEditor />
                                </div>

                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', opacity: 0.8 }}>{t.sovereignManagement || 'Sovereign Management'}</h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                        <SettingToggle
                                            icon={<FaCheckCircle />}
                                            label={t.cinematicShowcase}
                                            desc={t.enableHighEndIntro}
                                            enabled={settings.cinematic_showcase === 'true'}
                                            onToggle={() => handleSettingToggle('cinematic_showcase', settings.cinematic_showcase === 'true')}
                                        />
                                        <SettingToggle
                                            icon={<FaPalette />}
                                            label={t.masterpieceFrames}
                                            desc={t.allowArtisticFrames}
                                            enabled={settings.masterpiece_frames === 'true'}
                                            onToggle={() => handleSettingToggle('masterpiece_frames', settings.masterpiece_frames === 'true')}
                                        />
                                    </div>

                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', opacity: 0.8 }}>{t.systemConfig}</h3>
                                    <div style={{ marginBottom: '2rem' }}>
                                        <label style={{ display: 'block', opacity: 0.5, fontSize: '0.8rem', fontWeight: '800', marginBottom: '10px' }}>{t.supportEmail}</label>
                                        <input
                                            type="email"
                                            className="search-input"
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '15px', width: '100%', color: '#fff' }}
                                            value={settings.support_email}
                                            onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                                            placeholder="support@example.com"
                                        />
                                    </div>
                                    <button onClick={updateSettings} className="glass-btn" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        {t.updateSettings}
                                    </button>
                                </div>
                            </div>
                        ) : selectedUser ? (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                            {selectedUser.avatar_url && <img src={selectedUser.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                        </div>
                                        <div>
                                            <h2 style={{ fontSize: '1.2rem', fontWeight: '900' }}>{t.linksFor} {selectedUser.full_name || selectedUser.username}</h2>
                                            <span style={{ color: 'var(--accent-color)', fontWeight: '700', fontSize: '0.9rem' }}>@{selectedUser.username}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedUser(null)} className="glass-btn" style={{ fontSize: '0.8rem', padding: '10px 20px' }}>
                                        {t.backToUsers}
                                    </button>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: language === 'ar' ? 'right' : 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <th style={{ padding: '1.2rem', opacity: 0.4, fontSize: '0.8rem', textTransform: 'uppercase' }}>{t.identityTable}</th>
                                            <th style={{ padding: '1.2rem', opacity: 0.4, fontSize: '0.8rem', textTransform: 'uppercase' }}>{t.platform}</th>
                                            <th style={{ padding: '1.2rem', opacity: 0.4, fontSize: '0.8rem', textTransform: 'uppercase' }}>{t.clicks}</th>
                                            <th style={{ padding: '1.2rem', opacity: 0.4, fontSize: '0.8rem', textTransform: 'uppercase', textAlign: language === 'ar' ? 'left' : 'right' }}>{t.actions}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userSpecificLinks.length === 0 ? (
                                            <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', opacity: 0.3 }}>{t.noLinksFound}</td></tr>
                                        ) : userSpecificLinks.map(l => (
                                            <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                <td style={{ padding: '1.2rem' }}>
                                                    <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{l.title}</div>
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.4 }}>{l.url}</div>
                                                </td>
                                                <td style={{ padding: '1.2rem' }}>
                                                    <span className="glass-panel" style={{ padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800', background: 'rgba(255,255,255,0.05)' }}>
                                                        {l.icon}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.2rem' }}>
                                                    <div style={{ fontWeight: '900', fontSize: '1.1rem', color: '#4ade80' }}>{l.click_count || 0}</div>
                                                </td>
                                                <td style={{ padding: '1.2rem', textAlign: language === 'ar' ? 'left' : 'right' }}>
                                                    <div style={{ display: 'flex', gap: '10px', justifyContent: language === 'ar' ? 'flex-start' : 'flex-end' }}>
                                                        <a href={l.url} target="_blank" rel="noreferrer" className="glass-panel" style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                                            <FaExternalLinkAlt size={14} />
                                                        </a>
                                                        <ActionBtn icon={<FaTrash />} color="#ff2d55" onClick={() => deleteLink(l.id)} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : activeTab === 'users' ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: language === 'ar' ? 'right' : 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <th style={{ padding: '1.2rem', opacity: 0.4, fontSize: '0.8rem', textTransform: 'uppercase' }}>{t.identityTable}</th>
                                        <th style={{ padding: '1.2rem', opacity: 0.4, fontSize: '0.8rem', textTransform: 'uppercase' }}>{t.usernameTable}</th>
                                        <th style={{ padding: '1.2rem', opacity: 0.4, fontSize: '0.8rem', textTransform: 'uppercase' }}>{t.statusTable}</th>
                                        <th style={{ padding: '1.2rem', opacity: 0.4, fontSize: '0.8rem', textTransform: 'uppercase', textAlign: language === 'ar' ? 'left' : 'right' }}>{t.managementTable}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(u => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', background: u.is_suspended ? 'rgba(255, 45, 85, 0.02)' : 'none' }}>
                                            <td style={{ padding: '1.2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                                                    <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        {u.avatar_url && <img src={u.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                    </div>
                                                    <div style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
                                                        <div style={{ fontWeight: '800', fontSize: '1rem' }}>{u.full_name || t.anonymousUser}</div>
                                                        <div style={{ fontSize: '0.75rem', opacity: 0.4 }}>{u.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem' }}>
                                                <span style={{ color: 'var(--accent-color)', fontWeight: '800' }}>@{u.username || 'uninitialized'}</span>
                                            </td>
                                            <td style={{ padding: '1.2rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.65rem',
                                                        fontWeight: '900',
                                                        width: 'fit-content',
                                                        background: u.is_master ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.05)',
                                                        color: u.is_master ? '#4ade80' : 'rgba(255,255,255,0.5)'
                                                    }}>
                                                        {u.is_master ? t.systemMaster : t.userRole}
                                                    </span>
                                                    {u.is_verified && (
                                                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '900', background: 'rgba(218, 165, 32, 0.15)', color: '#DAA520', width: 'fit-content' }}>
                                                            {t.isVerified || 'VERIFIED'}
                                                        </span>
                                                    )}
                                                    {u.is_suspended && (
                                                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '900', background: 'rgba(255, 45, 85, 0.15)', color: '#ff2d55', width: 'fit-content' }}>
                                                            {t.suspended}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem', textAlign: language === 'ar' ? 'left' : 'right' }}>
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: language === 'ar' ? 'flex-start' : 'flex-end', flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                                                    <button onClick={() => { setSelectedUser(u); setActiveTab('users'); }} className="glass-btn" style={{ fontSize: '0.7rem', padding: '5px 12px', background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
                                                        {t.viewLinks}
                                                    </button>
                                                    {!u.is_master && (
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <ActionBtn
                                                                icon={<FaUserShield />}
                                                                color={u.is_verified ? '#DAA520' : 'rgba(255,255,255,0.2)'}
                                                                onClick={() => toggleVerification(u)}
                                                                tooltip={t.toggleVerification}
                                                            />
                                                            <ActionBtn
                                                                icon={u.is_suspended ? <FaCheckCircle /> : <FaUserSlash />}
                                                                color={u.is_suspended ? '#4ade80' : '#fab005'}
                                                                onClick={() => toggleSuspension(u)}
                                                                tooltip={u.is_suspended ? t.activateUser : t.suspendUser}
                                                            />
                                                            <ActionBtn icon={<FaTrash />} color="#ff2d55" onClick={() => deleteUser(u.id)} />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: language === 'ar' ? 'right' : 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <th style={{ padding: '1.2rem', opacity: 0.4, fontSize: '0.8rem', textTransform: 'uppercase' }}>{t.identityTable}</th>
                                        <th style={{ padding: '1.2rem', opacity: 0.4, fontSize: '0.8rem', textTransform: 'uppercase' }}>{t.platformRealm}</th>
                                        <th style={{ padding: '1.2rem', opacity: 0.4, fontSize: '0.8rem', textTransform: 'uppercase' }}>{t.ownerArchitect}</th>
                                        <th style={{ padding: '1.2rem', opacity: 0.4, fontSize: '0.8rem', textTransform: 'uppercase' }}>{t.clicksImpact}</th>
                                        <th style={{ padding: '1.2rem', opacity: 0.4, fontSize: '0.8rem', textTransform: 'uppercase', textAlign: language === 'ar' ? 'left' : 'right' }}>{t.actionsAuthority}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLinks.length === 0 ? (
                                        <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', opacity: 0.3 }}>{t.noLinksFound}</td></tr>
                                    ) : filteredLinks.map(l => (
                                        <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                            <td style={{ padding: '1.2rem' }}>
                                                <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{l.title}</div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.4, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.url}</div>
                                            </td>
                                            <td style={{ padding: '1.2rem' }}>
                                                <span className="glass-panel" style={{ padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800', background: 'rgba(255,255,255,0.05)' }}>
                                                    {l.icon}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.2rem' }}>
                                                <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{l.profiles?.full_name || t.anonymousUser}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)' }}>@{l.profiles?.username}</div>
                                            </td>
                                            <td style={{ padding: '1.2rem' }}>
                                                <div style={{ fontWeight: '900', fontSize: '1.1rem', color: '#4ade80' }}>{l.click_count || 0}</div>
                                            </td>
                                            <td style={{ padding: '1.2rem', textAlign: language === 'ar' ? 'left' : 'right' }}>
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: language === 'ar' ? 'flex-start' : 'flex-end' }}>
                                                    <a href={l.url} target="_blank" rel="noreferrer" className="glass-panel" style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                                        <FaExternalLinkAlt size={14} />
                                                    </a>
                                                    <ActionBtn icon={<FaTrash />} color="#ff2d55" onClick={() => deleteLink(l.id)} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

const StatsCard = ({ icon, label, value, color }) => (
    <div className="glass-panel" style={{ padding: '1.8rem 2.22rem', borderRadius: '28px', display: 'flex', alignItems: 'center', gap: '22px', border: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ width: '65px', height: '65px', borderRadius: '20px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', boxShadow: `0 10px 20px ${color}10` }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '0.8rem', opacity: 0.4, fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>{label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '950', letterSpacing: '-1px' }}>{value}</div>
        </div>
    </div>
)

const TabBtn = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0.8rem 1.5rem',
            borderRadius: '15px',
            background: active ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.03)',
            border: 'none',
            color: '#fff',
            fontWeight: '900',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: active ? '0 10px 20px rgba(255, 45, 85, 0.2)' : 'none',
            transform: active ? 'scale(1.05)' : 'scale(1)'
        }}
    >
        {icon}
        {label}
    </button>
)

const ActionBtn = ({ icon, color, onClick, tooltip }) => {
    const [hover, setHover] = useState(false)
    return (
        <button
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
            onClick={onClick}
            title={tooltip}
            style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: hover ? color : 'rgba(255,255,255,0.03)',
                border: `1px solid ${hover ? 'transparent' : 'rgba(255,255,255,0.05)'}`,
                color: hover ? '#fff' : color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '1rem'
            }}
        >
            {icon}
        </button>
    )
}

const SettingToggle = ({ icon, label, desc, enabled, onToggle }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.2rem',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: enabled ? 'rgba(218, 165, 32, 0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: enabled ? '#DAA520' : '#888' }}>
                    {icon}
                </div>
                <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{label}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.4 }}>{desc}</div>
                </div>
            </div>
            <div
                onClick={onToggle}
                style={{
                    width: '50px',
                    height: '26px',
                    borderRadius: '20px',
                    background: enabled ? '#DAA520' : 'rgba(255,255,255,0.1)',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                }}>
                <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: '3px',
                    left: enabled ? '27px' : '3px',
                    transition: 'all 0.3s'
                }}></div>
            </div>
        </div>
    )
}

export default Dashboard
