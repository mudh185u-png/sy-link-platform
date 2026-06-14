import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import {
    FaUserCircle, FaSave, FaSignOutAlt, FaUser,
    FaIdCard, FaAlignLeft, FaLink, FaCopy,
    FaCrown, FaCheckCircle, FaGlobe, FaCamera
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import AdminHeader from '../components/AdminHeader'

const AdminProfile = () => {
    const { user } = useAuth()
    const { t, language } = useLanguage()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [username, setUsername] = useState('')
    const [fullName, setFullName] = useState('')
    const [bio, setBio] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [canEditUsername, setCanEditUsername] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)

    const getProfile = React.useCallback(async () => {
        try {
            setLoading(true)
            const { data, error: profileError } = await supabase
                .from('profiles')
                .select('username, full_name, avatar_url, website')
                .eq('id', user.id)
                .maybeSingle()

            if (profileError) throw profileError

            if (data) {
                setUsername(data.username || '')
                setFullName(data.full_name || '')
                setAvatarUrl(data.avatar_url || '')
                setBio(data.website || '')
                setCanEditUsername(!data.username)
            } else {
                setCanEditUsername(true)
            }
        } catch (error) {
            console.error('Error loading user data', error)
        } finally {
            setLoading(false)
        }
    }, [user.id])

    useEffect(() => {
        if (user) {
            getProfile()
        }
    }, [user, getProfile])

    const uploadAvatar = async (event) => {
        try {
            setUploading(true)
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error(language === 'ar' ? 'يجب اختيار صورة لرفعها' : 'You must select an image to upload.')
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            let { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            if (data?.publicUrl) {
                setAvatarUrl(data.publicUrl)
                // Auto-save the avatar so the user doesn't have to manually click save
                await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id)
            }
        } catch (error) {
            alert(error.message)
        } finally {
            setUploading(false)
        }
    }

    const updateProfile = async (e) => {
        e.preventDefault()
        try {
            setSaving(true)
            const updates = {
                id: user.id,
                full_name: fullName,
                avatar_url: avatarUrl,
                website: bio,
                updated_at: new Date(),
            }

            if (username && canEditUsername) {
                updates.username = username
            }

            const { error } = await supabase.from('profiles').upsert(updates)
            if (error) throw error
            alert(t.profileUpdated || 'Profile updated successfully!')

            if (canEditUsername && username) {
                setCanEditUsername(false)
            }
        } catch (error) {
            alert(error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-white gap-4">
            <div className="w-8 h-8 border-4 border-white/10 border-t-accent rounded-full animate-spin"></div>
            <p className="opacity-60 font-semibold">{t.loading || 'Loading...'}</p>
        </div>
    )

    return (
        <div className="animate-fade-in-up pb-24">
            <AdminHeader title={t.yourProfile || "Your Profile"} />
            
            <form onSubmit={updateProfile} className="flex flex-col gap-6 w-full mt-6">
                
                {/* Profile Card */}
                <div className="glass-panel p-8 text-center relative overflow-hidden flex flex-col items-center">
                    {/* Decorative Glow */}
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-accent blur-[100px] opacity-20 pointer-events-none rounded-full"></div>

                    <div className="flex flex-col items-center gap-3 mb-6">
                        <div 
                            className="relative w-32 h-32 rounded-full bg-white/5 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-white/10 shadow-2xl group transition-all duration-300 hover:border-accent/50 hover:shadow-accent/20"
                            onClick={() => document.getElementById('avatar-upload').click()}
                        >
                            {avatarUrl ? (
                                avatarUrl.match(/\.(mp4|webm|mov)$/i) ? (
                                    <video src={avatarUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                                ) : (
                                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                )
                            ) : (
                                <div className="absolute inset-0 bg-white/5 flex flex-col items-center justify-center">
                                    <FaCamera className="text-white/50 text-3xl mb-2" />
                                </div>
                            )}
                            
                            {/* Hover overlay for desktop (or tap on mobile) */}
                            <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center transition-opacity duration-300 ${!avatarUrl ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <FaCamera className="text-white text-2xl mb-1 drop-shadow-md" />
                                <span className="text-white text-xs font-bold uppercase tracking-wider">{t.upload || 'Upload'}</span>
                            </div>
                            
                            {uploading && (
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                                    <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                        <span className="text-xs font-bold text-white/50 uppercase tracking-widest">{t.clickToUpload || 'Click to change picture'}</span>
                    </div>
                    
                    <input type="file" id="avatar-upload" hidden accept="image/*,video/mp4,video/webm,video/quicktime" onChange={uploadAvatar} disabled={uploading} />

                    <h3 className="text-2xl font-black text-white tracking-tight mb-3">
                        {fullName || t.name || 'Your Name'}
                    </h3>

                    <div className="flex items-center justify-center gap-2 bg-rose-500/10 border border-rose-500/20 py-1.5 px-4 rounded-full text-rose-500 text-xs font-bold uppercase tracking-wider mx-auto">
                        <FaCrown size={12} />
                        <span>{t.administratorBadge || 'Administrator'}</span>
                    </div>
                </div>

                {/* Public Link */}
                <div className="glass-panel p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                            <FaGlobe className="text-accent text-xl" />
                        </div>
                        <div className="flex-1 min-w-0 text-left" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            <div className="text-[0.7rem] text-white/40 font-bold uppercase mb-1">{t.publicProfileLabel || 'Public Profile Link'}</div>
                            <div className="text-sm font-extrabold text-white truncate" dir="ltr" style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
                                sy-links.com/{username || 'username'}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            navigator.clipboard.writeText(`sy-links.com/${username}`)
                            setCopySuccess(true)
                            setTimeout(() => setCopySuccess(false), 2000)
                        }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${copySuccess ? 'bg-green-500 text-black' : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'}`}
                    >
                        {copySuccess ? <FaCheckCircle /> : <FaCopy />}
                        <span className="hidden sm:inline">{copySuccess ? (t.copied || 'Copied') : (t.shareLink || 'Copy')}</span>
                    </button>
                </div>

                {/* Identity Group */}
                <div className="glass-panel p-6 flex flex-col gap-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1 h-5 bg-accent rounded-full"></div>
                        <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                            {t.identityDetails || 'Identity Details'}
                        </h3>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-white/40 px-1">{t.usernamePlaceholder || 'Username'}</label>
                            <div className="relative flex items-center">
                                <div className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} text-accent/50 text-lg`}>
                                    <FaIdCard />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    disabled={!canEditUsername}
                                    placeholder={t.usernamePlaceholder || 'Username'}
                                    className={`w-full bg-white/5 border border-white/10 rounded-2xl text-white text-sm font-semibold outline-none focus:border-accent/50 focus:bg-white/10 transition-all py-3.5 ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} ${!canEditUsername ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            </div>
                            {canEditUsername && (
                                <p className="text-[0.65rem] text-accent opacity-80 mt-1 px-1">
                                    {t.usernameWarning || 'Username can only be set once.'}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-white/40 px-1">{t.displayName || 'Display Name'}</label>
                            <div className="relative flex items-center">
                                <div className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} text-accent/50 text-lg`}>
                                    <FaUser />
                                </div>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder={t.displayName || 'Display Name'}
                                    className={`w-full bg-white/5 border border-white/10 rounded-2xl text-white text-sm font-semibold outline-none focus:border-accent/50 focus:bg-white/10 transition-all py-3.5 ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bio Group */}
                <div className="glass-panel p-6 flex flex-col gap-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1 h-5 bg-accent rounded-full"></div>
                        <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                            {t.biography || 'Biography'}
                        </h3>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-white/40 px-1">{t.bioLabel || 'Bio / Description'}</label>
                        <div className="relative">
                            <div className={`absolute top-4 ${language === 'ar' ? 'right-4' : 'left-4'} text-accent/50 text-lg`}>
                                <FaAlignLeft />
                            </div>
                            <textarea
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                placeholder={t.bioLabel || 'Write something about yourself...'}
                                className={`w-full bg-white/5 border border-white/10 rounded-2xl text-white text-sm font-medium outline-none focus:border-accent/50 focus:bg-white/10 transition-all py-4 min-h-[140px] resize-none ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 mt-2">
                    <button
                        type="submit"
                        disabled={saving || uploading}
                        className="flex-auto bg-accent hover:bg-accent/90 text-white border-none py-4 px-6 rounded-2xl text-base font-black flex items-center justify-center gap-3 cursor-pointer transition-all shadow-[0_10px_30px_rgba(255,45,85,0.3)] disabled:opacity-70 uppercase tracking-wide"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <FaSave />
                        )}
                        {saving ? (t.saving || 'Saving...') : (t.saveChanges || 'Save Changes')}
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex-auto max-w-[120px] bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 py-4 px-6 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                        <FaSignOutAlt /> <span className="hidden sm:inline">{t.logout || 'Logout'}</span>
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AdminProfile

