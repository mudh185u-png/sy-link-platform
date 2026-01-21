import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import {
    FaTrash, FaPlus, FaLink, FaCopy, FaCheck,
    FaMousePointer, FaEye, FaGlobe, FaEnvelope,
    FaPlusCircle, FaSearch, FaEllipsisV
} from 'react-icons/fa'
import IconSelector from '../components/IconSelector'
import { iconMap } from '../utils/iconMap'
import AdminHeader from '../components/AdminHeader'
import { getLocalizedTitle } from '../constants/translations'
import { useTheme } from '../contexts/ThemeContext'

const AdminLinks = () => {
    const { user } = useAuth()
    const { t, language } = useLanguage()
    const { settings } = useTheme()

    const getStyle = (sectionId, key, fallback) => {
        return settings?.styles?.[sectionId]?.[key] !== undefined
            ? settings.styles[sectionId][key]
            : fallback
    }

    const [links, setLinks] = useState([])
    const [loading, setLoading] = useState(true)
    const [copiedId, setCopiedId] = useState(null)

    // New/Edit link state
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [icon, setIcon] = useState('FaGlobe')
    const [editingId, setEditingId] = useState(null) // ID of link being edited
    const [submitting, setSubmitting] = useState(false)
    const [showPanel, setShowPanel] = useState(false)

    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const { data, error } = await supabase
                    .from('links')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (error) throw error
                setLinks(data)
            } catch (error) {
                console.error('Error fetching links:', error.message)
            } finally {
                setLoading(false)
            }
        }
        if (user) fetchLinks()
    }, [user])

    const resetForm = () => {
        setTitle('')
        setUrl('')
        setIcon('FaGlobe')
        setEditingId(null)
        setShowPanel(false)
    }

    const startEdit = (link) => {
        setTitle(link.title)
        setUrl(link.url)
        setIcon(link.icon || 'FaGlobe')
        setEditingId(link.id)
        setShowPanel(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title || !url) return
        setSubmitting(true)

        try {
            if (editingId) {
                // Update existing
                const { error } = await supabase
                    .from('links')
                    .update({ title, url, icon })
                    .eq('id', editingId)

                if (error) throw error

                setLinks(links.map(l => l.id === editingId ? { ...l, title, url, icon } : l))
                alert(language === 'ar' ? 'تم تحديث الرابط بنجاح' : 'Link updated successfully')
            } else {
                // Create new
                const { data, error } = await supabase
                    .from('links')
                    .insert([{ title, url, icon, user_id: user.id }])
                    .select()

                if (error) throw error
                setLinks([data[0], ...links])
            }
            resetForm()
        } catch (error) {
            alert(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الرابط؟' : 'Are you sure you want to delete this link?')) return
        try {
            const { error } = await supabase
                .from('links')
                .delete()
                .eq('id', id)

            if (error) throw error
            setLinks(links.filter(link => link.id !== id))
        } catch (error) {
            alert(error.message)
        }
    }

    const copyToClipboard = (url, id) => {
        navigator.clipboard.writeText(url)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    // Helper to get skin styles for Admin View (Replicated from LinkCard)
    const getSkinStyle = (linkSkin) => {
        const s = linkSkin || 'standard';

        if (s === 'syria') return {
            /* SYRIA LIBERATION STYLE - PREMIUM REDESIGN */
            background: 'linear-gradient(110deg, #000000 0%, #0a1f0a 60%, #002914 100%)',
            backdropFilter: 'blur(12px)',
            borderTop: '2px solid rgba(255,255,255,0.15)',
            borderBottom: '2px solid rgba(255,255,255,0.15)',
            borderRight: '6px solid #007A3D',
            borderLeft: '6px solid #000',
            borderRadius: '6px',
            padding: '16px 24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            position: 'relative',
            overflow: 'hidden'
        }
        if (s === 'social') return { background: 'rgba(0,0,0,0.95)', border: '1px solid #fff', borderRadius: '2px' }

        if (s === 'luxury') return { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212, 175, 55, 0.4)' }
        if (s === 'gaming') return { background: 'rgba(2, 4, 12, 0.9)', border: '1px solid rgba(0, 242, 255, 0.2)', borderRadius: '0' }

        return {} // Standard fallback handled by default styles
    }

    if (loading) return (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="loading-spinner"></div>
        </div>
    )

    return (
        <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            paddingBottom: '3rem',
            animation: 'fadeInScale 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards'
        }}>
            <AdminHeader title={t.dashboardTitle} />

            {/* Quick Actions Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 5px'
            }}>
                <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff' }}>
                        {language === 'ar' ? 'روابطك' : 'Your Ecosystem'}
                    </h3>
                    <p style={{ fontSize: '0.75rem', opacity: 0.3, fontWeight: '500' }}>
                        {links.length} {language === 'ar' ? 'رابط مفعل' : 'links active'}
                    </p>
                </div>
                <button
                    onClick={() => {
                        if (showPanel && editingId) {
                            resetForm() // Cancel edit
                        } else {
                            setShowPanel(!showPanel)
                        }
                    }}
                    style={{
                        background: showPanel ? 'rgba(255,255,255,0.05)' : 'var(--accent-color)',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '14px',
                        fontSize: '0.85rem',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.2, 1, 0.3, 1)',
                        boxShadow: showPanel ? 'none' : '0 8px 20px rgba(255,45,85,0.2)'
                    }}
                >
                    {showPanel ? <FaPlus style={{ transform: 'rotate(45deg)' }} /> : <FaPlus />}
                    {showPanel ? (language === 'ar' ? 'إغلاق' : 'Close') : (language === 'ar' ? 'إضافة رابط' : 'Add Link')}
                </button>
            </div>

            {/* Add/Edit Panel */}
            {showPanel && (
                <section className="glass-panel" style={{
                    padding: '1.75rem',
                    borderRadius: '28px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
                    animation: 'fadeInUp 0.4s cubic-bezier(0.2, 1, 0.3, 1)',
                    marginBottom: '1rem'
                }}>
                    <h4 style={{ color: '#fff', marginBottom: '1rem', marginTop: 0 }}>
                        {editingId ? (language === 'ar' ? 'تعديل الرابط' : 'Edit Link') : (language === 'ar' ? 'إضافة رابط جديد' : 'Add New Link')}
                    </h4>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{
                                width: '55px',
                                height: '55px',
                                borderRadius: '16px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.4rem',
                                color: 'var(--accent-color)',
                                flexShrink: 0
                            }}>
                                {iconMap[icon]}
                            </div>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="text"
                                    placeholder={t.titlePlaceholder}
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    style={{
                                        padding: '1.2rem',
                                        height: '55px',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        background: 'rgba(0,0,0,0.2)',
                                        color: '#fff',
                                        width: '100%',
                                        fontSize: '0.95rem',
                                        fontWeight: '700'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <FaLink style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: language === 'ar' ? 'auto' : '1.2rem', right: language === 'ar' ? '1.2rem' : 'auto', opacity: 0.2 }} />
                            <input
                                type="url"
                                placeholder={t.urlPlaceholder}
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                style={{
                                    paddingLeft: language === 'ar' ? '1rem' : '3.2rem',
                                    paddingRight: language === 'ar' ? '3.2rem' : '1rem',
                                    paddingTop: '1rem',
                                    paddingBottom: '1rem',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    background: 'rgba(0,0,0,0.2)',
                                    color: '#fff',
                                    width: '100%',
                                    direction: 'ltr',
                                    fontSize: '0.9rem',
                                    fontWeight: '500'
                                }}
                            />
                        </div>

                        <IconSelector
                            selectedIcon={icon}
                            onSelect={(iconKey) => {
                                setIcon(iconKey)
                                let platformKey = iconKey.replace('Fa', '').replace('Si', '').toLowerCase()
                                if (iconKey === 'FaGlobe') platformKey = 'global'
                                if (iconKey === 'FaEnvelope') platformKey = 'email'
                                if (t[platformKey]) setTitle(t[platformKey])
                            }}
                        />



                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                background: 'var(--accent-color)',
                                border: 'none',
                                padding: '1.1rem',
                                fontWeight: '900',
                                color: '#fff',
                                borderRadius: '18px',
                                fontSize: '1rem',
                                boxShadow: '0 10px 25px rgba(255,45,85,0.2)',
                                cursor: 'pointer'
                            }}>
                            {submitting ? t.loading : (editingId ? (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes') : t.addBtn)}
                        </button>
                    </form>
                </section>
            )}

            {/* Premium Links Feed */}
            <div
                data-editable-id="links_container"
                data-editable-type="container"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    width: getStyle('links_container', 'width', '100%'),
                    padding: getStyle('links_container', 'padding', '0'),
                    transform: `translate(${getStyle('links_container', 'offset_x', 0)}px, ${getStyle('links_container', 'offset_y', 0)}px)`,
                    transition: 'all 0.3s'
                }}>
                {links.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', opacity: 0.2 }}>
                        <FaLink size={40} style={{ marginBottom: '15px' }} />
                        <p style={{ fontWeight: '800' }}>{t.noLinks}</p>
                    </div>
                )}

                {links.map((link, index) => {
                    // Calculate visual style based on Global Skin
                    const skinStyle = getSkinStyle(settings?.selected_skin);

                    return (
                        <div
                            key={link.id}
                            data-editable-id="link_card"
                            data-editable-type="container"
                            className="glass-panel"
                            style={{
                                // Base Styles
                                padding: getStyle('link_card', 'padding', '1.25rem'),
                                borderRadius: getStyle('link_card', 'border_radius', '24px'),
                                border: `${getStyle('link_card', 'border_width', '1px')} solid ${getStyle('link_card', 'border_color', 'rgba(255,255,255,0.06)')}`,
                                borderStyle: getStyle('link_card', 'border_style', 'solid'),
                                background: getStyle('link_card', 'background_color', 'rgba(255,255,255,0.01)'),
                                backdropFilter: `blur(${getStyle('link_card', 'backdrop_blur', '0px')}) contrast(${getStyle('link_card', 'backdrop_contrast', '100%')}) brightness(${getStyle('link_card', 'backdrop_brightness', '100%')}) saturate(${getStyle('link_card', 'backdrop_saturate', '100%')})`,
                                WebkitBackdropFilter: `blur(${getStyle('link_card', 'backdrop_blur', '0px')}) contrast(${getStyle('link_card', 'backdrop_contrast', '100%')}) brightness(${getStyle('link_card', 'backdrop_brightness', '100%')}) saturate(${getStyle('link_card', 'backdrop_saturate', '100%')})`,

                                // Standard Layout
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                animation: `fadeInUp 0.4s cubic-bezier(0.2, 1, 0.3, 1) ${index * 0.05}s both`,
                                cursor: 'pointer',
                                transform: `translate(${getStyle('link_card', 'offset_x', 0)}px, ${getStyle('link_card', 'offset_y', 0)}px)`,
                                boxShadow: `${getStyle('link_card', 'shadow_offset_x', 0)}px ${getStyle('link_card', 'shadow_offset_y', 4)}px ${getStyle('link_card', 'shadow_blur', '20px')} ${getStyle('link_card', 'shadow_spread', '0px')} ${getStyle('link_card', 'shadow_color', 'rgba(0,0,0,0.05)')}`,
                                justifyContent: getStyle('link_card', 'justify_content', 'center'),
                                alignItems: getStyle('link_card', 'align_items', 'stretch'),
                                textAlign: getStyle('link_card', 'text_align', 'left'),
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s',

                                // Override with Skin Styles
                                ...skinStyle
                            }}>
                            {/* Visual Indicator for Syria Skin (Stars + Watermark) */}
                            {settings?.selected_skin === 'syria' && (
                                <>
                                    {/* Watermark Text */}
                                    <div style={{
                                        position: 'absolute', bottom: '5px', right: '50px',
                                        fontSize: '3rem', fontWeight: '900', color: 'rgba(255,255,255,0.03)',
                                        pointerEvents: 'none', zIndex: 0, whiteSpace: 'nowrap',
                                        fontFamily: "'Tajawal', sans-serif"
                                    }}>
                                        {language === 'ar' ? 'تحرير سوريا' : 'SYRIA LIBERATION'}
                                    </div>

                                    {/* Stars */}
                                    <div style={{
                                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                        display: 'flex', gap: '12px', opacity: 0.15, pointerEvents: 'none', zIndex: 0
                                    }}>
                                        <div style={{ color: '#E4312b', fontSize: '2rem' }}>★</div>
                                        <div style={{ color: '#E4312b', fontSize: '2rem' }}>★</div>
                                        <div style={{ color: '#E4312b', fontSize: '2rem' }}>★</div>
                                    </div>
                                </>
                            )}

                            {/* Grain Overlay */}
                            {getStyle('link_card', 'grain_opacity', '0%') !== '0%' && (
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    pointerEvents: 'none', zIndex: 0, opacity: parseFloat(getStyle('link_card', 'grain_opacity', '0%')) / 100,
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                                }} />
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1, position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                                    <div
                                        data-editable-id="link_icon_container"
                                        data-editable-type="icon"
                                        style={{
                                            width: getStyle('link_icon_container', 'width', 46),
                                            height: getStyle('link_icon_container', 'height', 46),
                                            borderRadius: getStyle('link_icon_container', 'border_radius', '14px'),
                                            background: getStyle('link_icon_container', 'background_color', 'rgba(255,255,255,0.03)'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: getStyle('link_icon_container', 'icon_size', '1.3rem'),
                                            color: getStyle('link_icon_container', 'icon_color', '#fff'),
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            flexShrink: 0,
                                            transform: `rotate(${getStyle('link_icon_container', 'rotation', 0)}deg) scaleX(${getStyle('link_icon_container', 'flip_h', 1)})`
                                        }}>
                                        {iconMap[link.icon]}
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                        <h4
                                            data-editable-id="link_title"
                                            data-editable-type="text"
                                            style={{
                                                fontSize: getStyle('link_title', 'font_size', '1.05rem'),
                                                fontWeight: getStyle('link_title', 'font_weight', '800'),
                                                lineHeight: getStyle('link_title', 'line_height', 1.2),
                                                letterSpacing: `${getStyle('link_title', 'letter_spacing', 0)}px`,
                                                color: getStyle('link_title', 'text_color', '#fff'),
                                                opacity: getStyle('link_title', 'opacity', 1),
                                                marginBottom: '2px'
                                            }}>
                                            {getLocalizedTitle(link.title, language)}
                                        </h4>
                                        <p
                                            data-editable-id="link_url_text"
                                            data-editable-type="text"
                                            style={{
                                                fontSize: getStyle('link_url_text', 'font_size', '0.75rem'),
                                                fontWeight: getStyle('link_url_text', 'font_weight', '500'),
                                                color: getStyle('link_url_text', 'text_color', 'rgba(255,255,255,0.3)'),
                                                opacity: getStyle('link_url_text', 'opacity', 1),
                                                direction: 'ltr',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                            {link.url.replace(/(^\w+:|^)\/\//, '')}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                        onClick={() => startEdit(link)}
                                        style={{
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '12px',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            color: '#fff',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s'
                                        }}>
                                        <FaEllipsisV size={14} />
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(link.url, link.id)}
                                        style={{
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '12px',
                                            background: copiedId === link.id ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.03)',
                                            color: copiedId === link.id ? '#4ade80' : 'rgba(255,255,255,0.4)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s'
                                        }}>
                                        {copiedId === link.id ? <FaCheck size={14} /> : <FaCopy size={14} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(link.id)}
                                        style={{
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '12px',
                                            background: 'rgba(255, 75, 75, 0.05)',
                                            color: 'rgba(255, 75, 75, 0.6)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s'
                                        }}>
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Analytic Strip */}
                            <div
                                data-editable-id="link_analytics"
                                data-editable-type="container"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: getStyle('link_analytics', 'padding', '10px 14px'),
                                    background: getStyle('link_analytics', 'background_color', 'rgba(0,0,0,0.2)'),
                                    borderRadius: getStyle('link_analytics', 'border_radius', '14px'),
                                    border: `${getStyle('link_analytics', 'border_width', '1px')} solid ${getStyle('link_analytics', 'border_color', 'rgba(255,255,255,0.02)')}`,
                                    transform: `translate(${getStyle('link_analytics', 'offset_x', 0)}px, ${getStyle('link_analytics', 'offset_y', 0)}px)`,
                                    transition: 'all 0.3s'
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '8px',
                                        background: 'rgba(79,172,254,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FaMousePointer size={10} color="#4facfe" />
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fff' }}>{link.clicks || 0}</span>
                                    <span style={{ fontSize: '0.7rem', opacity: 0.3, fontWeight: '600', textTransform: 'uppercase' }}>Engagement</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.7rem',
                                    fontWeight: '900',
                                    opacity: 0.2,
                                    textTransform: 'uppercase'
                                }}>
                                    <FaEye size={10} /> Live
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .loading-spinner {
                    width: 25px;
                    height: 25px;
                    border: 2px solid rgba(255,255,255,0.1);
                    border-top: 2px solid var(--accent-color);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    )
}

export default AdminLinks
