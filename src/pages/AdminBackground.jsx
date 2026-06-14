import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { FaImage, FaPalette, FaUpload, FaCheckCircle, FaGamepad, FaCrown, FaLeaf, FaBolt, FaLayerGroup, FaSnowflake, FaCircle, FaCamera, FaHeart } from 'react-icons/fa'
import AdminHeader from '../components/AdminHeader'
import { THEMES } from '../utils/themeConfig'

const AdminBackground = () => {
    const { user } = useAuth()
    const { t, language } = useLanguage()
    const { settings: globalSettings } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [bgType, setBgType] = useState('animated')
    const [bgConfig, setBgConfig] = useState({})
    const [selectedSkin, setSelectedSkin] = useState('standard')
    const [avatarFrame, setAvatarFrame] = useState('none')

    const skins = [
        // ── Basic ──
        { id: 'standard', name: t.skinStandard || 'Standard Glass', icon: <FaLayerGroup />, category: 'basic' },
        // ── Premium ──
        { id: 'phantom-velvet', name: language === 'ar' ? 'مخمل فانتوم' : 'Phantom Velvet', icon: <FaCrown className="text-red-500" />, category: 'premium' },
        { id: 'holo-glass', name: language === 'ar' ? 'زجاج هولوغرامي' : 'Holo Glass', icon: <FaSnowflake className="text-cyan-400" />, category: 'premium' },
        { id: 'obsidian-gold', name: language === 'ar' ? 'ذهب أوبسيديان' : 'Obsidian Gold', icon: <FaCrown className="text-yellow-500" />, category: 'premium' },
        // ── Category Skins (Completely different designs) ──
        { id: 'social-influencer', name: language === 'ar' ? '📸 سوشيال ميديا' : '📸 Influencer', icon: <FaCamera className="text-purple-500" />, category: 'social' },
        { id: 'pro-gamer', name: language === 'ar' ? '🎮 جيمر محترف' : '🎮 Pro Gamer', icon: <FaGamepad className="text-[#66fcf1]" />, category: 'gaming' },
        { id: 'soft-girly', name: language === 'ar' ? '🌸 لمسة ناعمة' : '🌸 Soft Girly', icon: <FaHeart className="text-pink-400" />, category: 'girly' },
    ]

    const frames = [
        { id: 'none', name: t.frameNone || 'None' },
        { id: 'crimson-halo', name: language === 'ar' ? 'هالة قرمزية' : 'Crimson Halo' },
        { id: 'neon-pulse', name: language === 'ar' ? 'نبض النيون' : 'Neon Pulse' },
        { id: 'void-singularity', name: language === 'ar' ? 'تفرد الفراغ' : 'Void Singularity' },
        { id: 'solar-flare', name: language === 'ar' ? 'وهج شمسي' : 'Solar Flare' },
        { id: 'ethereal-wisp', name: language === 'ar' ? 'طيف أثيري' : 'Ethereal Wisp' },
        { id: 'crystal-shard', name: language === 'ar' ? 'شظية كريستال' : 'Crystal Shard' },
        { id: 'cybernetic', name: language === 'ar' ? 'تقني' : 'Cybernetic' },
        { id: 'frostbite', name: language === 'ar' ? 'ثلجي' : 'Frostbite' },
        { id: 'toxic-glow', name: language === 'ar' ? 'وهج سام' : 'Toxic Glow' },
        { id: 'inferno-ring', name: language === 'ar' ? 'حلقة جحيم' : 'Inferno Ring' },
    ]

    const frameClasses = {
        'none': '',
        'crimson-halo': 'after:absolute after:-inset-[4px] after:rounded-full after:bg-[conic-gradient(from_0deg,transparent_0%,#ff0000_20%,#ff4d4d_50%,#800000_80%,transparent_100%)] after:animate-[spin_4s_linear_infinite] shadow-[0_0_20px_rgba(255,0,0,0.4)]',
        'neon-pulse': 'after:absolute after:-inset-[4px] after:rounded-full after:bg-[conic-gradient(from_0deg,transparent_0%,#00ffcc_30%,#ff00ff_70%,transparent_100%)] after:animate-[spin_3s_linear_infinite] shadow-[0_0_25px_rgba(0,255,204,0.5)]',
        'void-singularity': 'after:absolute after:-inset-[4px] after:rounded-full after:bg-[conic-gradient(from_0deg,#111_0%,#000_25%,#111_50%,#000_75%,#111_100%)] after:animate-[spin_8s_linear_infinite] ring-2 ring-[#333] shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]',
        'solar-flare': 'after:absolute after:-inset-[4px] after:rounded-full after:bg-[conic-gradient(from_0deg,#ff8c00,#ffd700,#ff4500,#ff8c00)] after:animate-[spin_5s_linear_infinite] shadow-[0_0_30px_rgba(255,140,0,0.6)]',
        'ethereal-wisp': 'after:absolute after:-inset-[4px] after:rounded-full after:bg-[conic-gradient(from_0deg,transparent_0%,#ffffff_20%,#e0f2ff_50%,#ffffff_80%,transparent_100%)] after:animate-[spin_6s_linear_infinite] shadow-[0_0_20px_rgba(255,255,255,0.5)]',
        'crystal-shard': 'after:absolute after:-inset-[4px] after:rounded-full after:bg-[conic-gradient(from_0deg,#4facfe,#00f2fe,#ffffff,#00f2fe,#4facfe)] after:animate-[spin_4s_linear_infinite] shadow-[0_0_25px_rgba(79,172,254,0.6)]',
        'cybernetic': 'after:absolute after:-inset-[4px] after:rounded-full after:bg-[conic-gradient(from_0deg,#ff0099,#493240,#ff0099)] after:animate-[spin_3s_linear_infinite] shadow-[0_0_25px_rgba(255,0,153,0.7)]',
        'frostbite': 'after:absolute after:-inset-[4px] after:rounded-full after:bg-[conic-gradient(from_0deg,#00f2fe,#ffffff,#4facfe,#00f2fe)] after:animate-[spin_6s_linear_infinite] shadow-[0_0_30px_rgba(0,242,254,0.6)]',
        'toxic-glow': 'after:absolute after:-inset-[4px] after:rounded-full after:bg-[conic-gradient(from_0deg,#39ff14,#001a00,#39ff14)] after:animate-[spin_4s_linear_infinite] shadow-[0_0_30px_rgba(57,255,20,0.8)]',
        'inferno-ring': 'after:absolute after:-inset-[4px] after:rounded-full after:bg-[conic-gradient(from_0deg,#ff3366,#ff99cc,#ff3366)] after:animate-[spin_2s_linear_infinite] shadow-[0_0_35px_rgba(255,51,102,0.7)]'
    }

    // ... keeping presets, fetchSettings, saveSettings, handleUpload exactly as they are ...
    const presets = [
        { id: 'matrix-rain', name: language === 'ar' ? 'مطر الماتريكس' : 'Matrix Rain', type: 'animated', config: { theme: 'matrix-rain' } },
        { id: 'abyssal-ocean', name: language === 'ar' ? 'محيط سحيق' : 'Abyssal Ocean', type: 'animated', config: { theme: 'abyssal-ocean' } },
        { id: 'stellar-dust', name: language === 'ar' ? 'غبار النجوم' : 'Stellar Dust', type: 'animated', config: { theme: 'stellar-dust' } },
        { id: 'crimson-moon', name: language === 'ar' ? 'قمر قرمزي' : 'Crimson Moon', type: 'animated', config: { theme: 'crimson-moon' } },
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
                .upload(filePath, file, { upsert: true })

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

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-white gap-4">
            <div className="w-8 h-8 border-4 border-white/10 border-t-accent rounded-full animate-spin"></div>
            <p className="opacity-60 font-semibold">{t.loading || 'Loading...'}</p>
        </div>
    )

    return (
        <div className="animate-fade-in-up pb-24">
            <AdminHeader title={t.appearance || 'Appearance'} />

            <div className="flex flex-col gap-6 w-full mt-6">
                {/* Avatar Frame Section */}
                <div className="glass-panel p-6 flex flex-col gap-5 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 blur-[60px] rounded-full pointer-events-none"></div>
                    
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1 h-5 bg-accent rounded-full"></div>
                        <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                            {t.avatarFrameLabel || 'Avatar Frame (LIVE PREVIEW)'}
                        </h3>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
                        {frames.map(frame => (
                            <div
                                key={frame.id}
                                onClick={() => saveSettings({ avatar_frame: frame.id })}
                                className={`p-3 sm:p-4 rounded-2xl flex flex-col items-center gap-3 cursor-pointer transition-all duration-300 relative ${avatarFrame === frame.id ? 'bg-accent/20 border-2 border-accent shadow-[0_0_20px_rgba(255,45,85,0.2)]' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
                            >
                                <div className="relative p-1 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center w-[54px] h-[54px] overflow-hidden">
                                    {frame.id !== 'none' && (
                                        <div className={`absolute inset-0 rounded-full ${frameClasses[frame.id]} opacity-90 transition-all duration-500`}></div>
                                    )}
                                    <div className="w-10 h-10 rounded-full bg-[#111] z-10 border border-white/10"></div>
                                </div>
                                <span className="text-xs font-bold text-center text-white">{frame.name}</span>
                                {avatarFrame === frame.id && <FaCheckCircle className="absolute top-2 right-2 text-accent text-sm" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skin Selection Section */}
                <div className="glass-panel p-6 flex flex-col gap-5 relative overflow-hidden">
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/20 blur-[60px] rounded-full pointer-events-none"></div>
                    
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1 h-5 bg-accent rounded-full"></div>
                        <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                            {t.skinLabel || 'Profile Skin (MINI PREVIEW)'}
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {skins.map(skin => {
                            const isAllowed = true; // Always allow the new premium skins
                            const theme = THEMES[skin.id] || THEMES['standard'];

                            return (
                                <div
                                    key={skin.id}
                                    onClick={() => isAllowed && saveSettings({ selected_skin: skin.id })}
                                    className={`rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col hover:scale-[1.02] min-h-[120px] sm:min-h-[140px] ${selectedSkin === skin.id && isAllowed ? 'ring-2 ring-accent shadow-[0_0_20px_rgba(255,45,85,0.4)]' : 'ring-1 ring-white/10'}`}
                                >
                                    {/* Mini Preview Background */}
                                    <div className={`absolute inset-0 z-0 ${theme.container} opacity-50`} />
                                    
                                    {/* Category Badge */}
                                    {skin.category && skin.category !== 'basic' && skin.category !== 'premium' && (
                                        <div className={`absolute top-2 left-2 z-20 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                            skin.category === 'social' ? 'bg-purple-500/80 text-white' :
                                            skin.category === 'gaming' ? 'bg-[#66fcf1]/80 text-black' :
                                            skin.category === 'girly' ? 'bg-pink-400/80 text-white' :
                                            'bg-white/20 text-white'
                                        }`}>
                                            {skin.category === 'social' ? (language === 'ar' ? 'سوشيال' : 'SOCIAL') :
                                             skin.category === 'gaming' ? (language === 'ar' ? 'قيمنق' : 'GAMING') :
                                             skin.category === 'girly' ? (language === 'ar' ? 'ناعم' : 'CUTE') :
                                             skin.category}
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="relative z-10 flex flex-col h-full p-4 items-center justify-center gap-3 bg-black/40 backdrop-blur-sm">
                                        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${theme.profile.avatarBorder}`}>
                                            <span className={`text-2xl ${theme.profile.name}`}>{skin.icon}</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`text-sm ${theme.profile.name}`}>{skin.name}</span>
                                            <div className={`w-16 h-2 rounded-full ${theme.link.wrapper}`} />
                                        </div>
                                        
                                        {!isAllowed && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md">
                                                <span className="text-[10px] text-red-400 font-bold uppercase px-3 py-1 border border-red-500/50 rounded-full">
                                                    {t.disabledByAdmin || 'Disabled by Admin'}
                                                </span>
                                            </div>
                                        )}
                                        {selectedSkin === skin.id && isAllowed && <FaCheckCircle className="absolute top-3 right-3 text-accent text-lg drop-shadow-md" />}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Background Style Section */}
                <div className="glass-panel p-6 flex flex-col gap-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1 h-5 bg-accent rounded-full"></div>
                        <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                            {t.customizeBackground || 'Customize Background'}
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {presets.map(p => {
                            const isSelected = bgType === p.type && bgConfig?.theme === p.config?.theme;
                            let previewGradient = '';
                            if (p.config.theme === 'matrix-rain') previewGradient = 'bg-gradient-to-br from-green-900 via-black to-green-950';
                            else if (p.config.theme === 'abyssal-ocean') previewGradient = 'bg-gradient-to-br from-[#001220] via-[#000b18] to-teal-900';
                            else if (p.config.theme === 'stellar-dust') previewGradient = 'bg-gradient-to-br from-[#030005] via-indigo-950 to-fuchsia-900';
                            else if (p.config.theme === 'crimson-moon') previewGradient = 'bg-gradient-to-br from-[#110000] via-red-950 to-black';

                            return (
                                <div
                                    key={p.id}
                                    onClick={() => saveSettings({ background_type: p.type, background_config: p.config })}
                                    className={`p-4 rounded-xl cursor-pointer flex flex-col items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden group h-[100px] ${isSelected ? 'ring-2 ring-accent shadow-[0_0_20px_rgba(255,45,85,0.4)]' : 'ring-1 ring-white/10 hover:scale-[1.02]'}`}
                                >
                                    <div className={`absolute inset-0 ${previewGradient} opacity-80 z-0 transition-opacity group-hover:opacity-100`}></div>
                                    <div className="absolute inset-0 bg-black/20 z-0"></div>
                                    
                                    {isSelected && (
                                        <FaCheckCircle className="absolute top-2 right-2 text-white text-lg drop-shadow-md z-10" />
                                    )}
                                    <span className="font-bold text-sm text-white z-10 relative drop-shadow-lg text-center px-2">{p.name}</span>
                                </div>
                            )
                        })}

                        <div className={`col-span-2 p-5 rounded-xl text-center border border-white/10 transition-colors ${ (bgType === 'image' || bgType === 'video') ? 'bg-accent/10 border-accent/30' : 'bg-white/5' }`}>
                            <input type="file" id="bg-upload" hidden accept="image/*,video/*" onChange={handleUpload} />
                            <button
                                type="button"
                                onClick={() => document.getElementById('bg-upload').click()}
                                disabled={uploading || saving}
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {uploading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <FaUpload />
                                )}
                                <span className="text-sm">
                                    {uploading ? (language === 'ar' ? 'جاري الرفع...' : 'Uploading...') : (language === 'ar' ? 'رفع صورة أو فيديو خاص' : 'Upload custom Image/Video')}
                                </span>
                            </button>

                            {/* Hide Glass Panel Option */}
                            <div className="col-span-2 mt-4 flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer" onClick={() => saveSettings({ background_config: { ...bgConfig, hide_glass_panel: bgConfig?.hide_glass_panel === false ? true : false } })}>
                                <div className="text-start">
                                    <h4 className="text-sm font-bold text-white mb-1">{language === 'ar' ? 'إخفاء الإطار الزجاجي الرئيسي' : 'Hide Main Glass Container'}</h4>
                                    <p className="text-xs text-white/60">{language === 'ar' ? 'يجعل خلفية الصورة أو الفيديو واضحة تماماً' : 'Make the background image fully visible without the center panel'}</p>
                                </div>
                                <div className={`flex-shrink-0 w-12 h-6 rounded-full transition-colors relative ${bgConfig?.hide_glass_panel !== false ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${bgConfig?.hide_glass_panel !== false ? (language === 'ar' ? 'right-7' : 'left-7') : (language === 'ar' ? 'right-1' : 'left-1')}`}></div>
                                </div>
                            </div>

                            {(bgType === 'image' || bgType === 'video') && bgConfig?.url && (
                                <div className="mt-5 pt-5 border-t border-white/10">
                                    <div className="w-full h-32 sm:h-40 rounded-xl overflow-hidden relative bg-black border border-white/10 shadow-lg">
                                        {bgType === 'image' ? (
                                            <img src={bgConfig.url} alt="Preview" className="w-full h-full object-cover opacity-80" />
                                        ) : (
                                            <video src={bgConfig.url} autoPlay muted loop className="w-full h-full object-cover opacity-80" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center pb-3">
                                            <span className="text-xs font-black text-white uppercase tracking-wider drop-shadow-lg">
                                                {language === 'ar' ? (bgType === 'image' ? 'معاينة الصورة' : 'معاينة الفيديو') : (bgType === 'image' ? 'Image Preview' : 'Video Preview')}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => saveSettings({ background_type: 'animated', background_config: {} })}
                                        className="mt-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2 px-5 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                                    >
                                        {language === 'ar' ? 'حذف الخلفية الخاصة' : 'Remove Custom Background'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AdminBackground
