import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { FaImage, FaPalette, FaUpload, FaCheckCircle, FaGamepad, FaCrown, FaLeaf, FaBolt, FaLayerGroup, FaSnowflake, FaCircle } from 'react-icons/fa'
import AdminHeader from '../components/AdminHeader'

const AdminBackground = () => {
    const { user } = useAuth()
    const { t } = useLanguage()
    const { settings: globalSettings } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [bgType, setBgType] = useState('animated')
    const [bgConfig, setBgConfig] = useState({})
    const [selectedSkin, setSelectedSkin] = useState('standard')
    const [avatarFrame, setAvatarFrame] = useState('none')

    const skins = [
        { id: 'standard', name: t.skinStandard, icon: <FaLayerGroup /> },
        { id: 'neon', name: t.skinNeon, icon: <FaBolt /> },
        { id: 'gaming', name: t.skinGaming, icon: <FaGamepad /> },
        { id: 'luxury', name: t.skinLuxury, icon: <FaCrown /> },
        { id: 'minimal', name: t.skinMinimal, icon: <FaLeaf /> },
        { id: 'social', name: t.skinSocial, icon: <FaImage /> },
        { id: 'syria', name: t.skinSyria, icon: <FaBolt style={{ color: '#E4312b' }} /> },
    ]

    const frames = [
        { id: 'none', name: t.frameNone, color: 'transparent', border: '1px dashed rgba(255,255,255,0.2)' },
        { id: 'pearl-ethereal', name: t.framePearlEthereal, gradient: 'linear-gradient(135deg, #fff, #fdeeff, #e0f2ff)', shadow: '0 0 15px rgba(255,255,255,0.5)' },
        { id: 'obsidian-neon', name: t.frameObsidianNeon, color: '#00f2ff', shadow: '0 0 20px #00f2ff' },
        { id: 'grand-chronos', name: t.frameGrandChronos, gradient: 'linear-gradient(135deg, #DAA520, #000, #DAA520)', shadow: '0 0 15px #DAA520' },
        { id: 'diamond-prism', name: t.frameDiamondPrism, gradient: 'linear-gradient(135deg, #fff, #b9f2ff, #fff)', shadow: '0 0 20px rgba(255,255,255,0.7)' },
        { id: 'aurora-liquid', name: t.frameAuroraLiquid, gradient: 'linear-gradient(45deg, #007bff, #00ff88, #7000ff)', shadow: '0 0 15px rgba(0, 123, 255, 0.6)' },
        { id: 'story', name: t.frameStory, gradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' },
    ]

    const presets = [
        { id: 'animated', name: 'Magic Blobs', type: 'animated', config: {} },
        { id: 'gradient-dark', name: 'Midnight', type: 'gradient', config: { value: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' } },
        { id: 'gradient-sunset', name: 'Sunset', type: 'gradient', config: { value: 'linear-gradient(135deg, #42275a, #734b6d)' } },
        { id: 'solid-black', name: 'Pure Dark', type: 'solid', config: { value: '#050505' } },
    ]

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('background_type, background_config, card_opacity, selected_skin, avatar_frame')
                    .eq('id', user.id)
                    .maybeSingle()

                if (data) {
                    setBgType(data.background_type || 'animated')
                    setBgConfig(data.background_config || {})
                    setSelectedSkin(data.selected_skin || 'standard')
                    setAvatarFrame(data.avatar_frame || 'none')
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        if (user) fetchSettings()
    }, [user])

    const saveSettings = async (updates) => {
        try {
            setSaving(true)
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)

            if (error) throw error

            if (updates.background_type) setBgType(updates.background_type)
            if (updates.background_config) setBgConfig(updates.background_config)
            if (updates.selected_skin) setSelectedSkin(updates.selected_skin)
            if (updates.avatar_frame) setAvatarFrame(updates.avatar_frame)

        } catch (err) {
            alert(err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleUpload = async (e) => {
        try {
            setUploading(true)
            const file = e.target.files[0]
            if (!file) return

            const fileExt = file.name.split('.').pop().toLowerCase()
            const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(fileExt)
            const filePath = `${user.id}/bg-${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            if (data?.publicUrl) {
                await saveSettings({ background_type: isVideo ? 'video' : 'image', background_config: { url: data.publicUrl } })
            }
        } catch (err) {
            alert(err.message)
        } finally {
            setUploading(false)
        }
    }

    if (loading) return <div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>{t.loading}</div>

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
            <AdminHeader title={t.appearance} />

            {/* Avatar Frame Section */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{t.avatarFrameLabel}</h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                    gap: '12px'
                }}>
                    {frames.map(frame => (
                        <div
                            key={frame.id}
                            onClick={() => saveSettings({ avatar_frame: frame.id })}
                            style={{
                                padding: '1.2rem 1rem',
                                borderRadius: '18px',
                                background: avatarFrame === frame.id ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.3s ease',
                                transform: avatarFrame === frame.id ? 'scale(1.05)' : 'scale(1)',
                                position: 'relative'
                            }}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                border: frame.border || 'none',
                                background: frame.gradient || frame.color,
                                boxShadow: frame.shadow || 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#111' }}></div>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', textAlign: 'center' }}>{frame.name}</span>
                            {avatarFrame === frame.id && <FaCheckCircle style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.8rem' }} />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Skin Selection Section */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{t.skinLabel}</h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                    gap: '12px'
                }}>
                    {skins.map(skin => {
                        const isAllowed = !globalSettings?.page_backgrounds?.allowed_skins || globalSettings.page_backgrounds.allowed_skins.includes(skin.id);
                        return (
                            <div
                                key={skin.id}
                                onClick={() => isAllowed && saveSettings({ selected_skin: skin.id })}
                                style={{
                                    padding: '1.2rem 1rem',
                                    borderRadius: '18px',
                                    background: selectedSkin === skin.id ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    cursor: isAllowed ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '10px',
                                    transition: 'all 0.3s ease',
                                    transform: selectedSkin === skin.id ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: selectedSkin === skin.id ? '0 10px 20px rgba(255,45,85,0.3)' : 'none',
                                    position: 'relative',
                                    opacity: isAllowed ? 1 : 0.4
                                }}
                            >
                                <div style={{ fontSize: '1.8rem', opacity: selectedSkin === skin.id ? 1 : 0.6 }}>{skin.icon}</div>
                                <span style={{ fontSize: '0.8rem', fontWeight: '800', textAlign: 'center' }}>{skin.name}</span>
                                {!isAllowed && (
                                    <span style={{ fontSize: '0.6rem', color: '#ff4d4d', fontWeight: 'bold' }}>
                                        {t.disabledByAdmin || 'Disabled by Admin'}
                                    </span>
                                )}
                                {selectedSkin === skin.id && <FaCheckCircle style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.8rem' }} />}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Background Style Section */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{t.customizeBackground}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {presets.map(p => (
                        <div
                            key={p.id}
                            onClick={() => saveSettings({ background_type: p.type, background_config: p.config })}
                            className="glass-panel"
                            style={{
                                padding: '1.5rem',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                border: bgType === p.type && (p.type !== 'gradient' || bgConfig.value === p.config.value)
                                    ? '2px solid var(--accent-color)'
                                    : '2px solid transparent',
                                background: p.type === 'gradient' ? p.config.value : 'rgba(255,255,255,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.3s ease',
                                position: 'relative'
                            }}
                        >
                            {bgType === p.type && (p.type !== 'gradient' || bgConfig.value === p.config.value) && (
                                <FaCheckCircle style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--accent-color)' }} />
                            )}
                            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{p.name}</span>
                        </div>
                    ))}

                    <div className="glass-panel" style={{
                        gridColumn: 'span 2',
                        padding: '1.5rem',
                        borderRadius: '20px',
                        textAlign: 'center',
                        background: (bgType === 'image' || bgType === 'video') ? 'rgba(255,45,85,0.1)' : 'rgba(255,255,255,0.02)'
                    }}>
                        <input type="file" id="bg-upload" hidden accept="image/*,video/*" onChange={handleUpload} />
                        <button
                            onClick={() => document.getElementById('bg-upload').click()}
                            className="glass-btn"
                            disabled={uploading || saving}
                            style={{ width: '100%', padding: '1rem', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <FaUpload style={{ marginInlineEnd: '10px' }} />
                            {uploading ? 'جاري الرفع...' : 'رفع صورة أو فيديو خاص'}
                        </button>

                        {(bgType === 'image' || bgType === 'video') && bgConfig?.url && (
                            <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                                <div style={{
                                    width: '100%',
                                    height: '150px',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    background: '#000'
                                }}>
                                    {bgType === 'image' ? (
                                        <img src={bgConfig.url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <video src={bgConfig.url} autoPlay muted loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )}
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        justifyContent: 'center',
                                        paddingBottom: '10px'
                                    }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{bgType === 'image' ? 'معاينة الصورة' : 'معاينة الفيديو'}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => saveSettings({ background_type: 'animated', background_config: {} })}
                                    style={{
                                        marginTop: '1rem',
                                        background: 'rgba(255,50,50,0.1)',
                                        color: '#ff4d4d',
                                        border: '1px solid rgba(255,50,50,0.2)',
                                        padding: '8px 15px',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    حذف الخلفية الخاصة
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    )
}

export default AdminBackground
