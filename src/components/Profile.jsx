import React, { useEffect, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'
import { FaUserCircle } from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'

const Profile = ({ profileData, theme }) => {
    const { t, language } = useLanguage()
    const [profile, setProfile] = useState(profileData || null)
    const [loading, setLoading] = useState(!profileData)

    useEffect(() => {
        if (profileData) {
            setProfile(profileData)
            setLoading(false)
            return
        }
        const fetchProfile = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .maybeSingle()

                if (error) throw error
                if (data) setProfile(data)
            } catch (error) {
                console.error('Error fetching profile', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [profileData])

    const getFrameStyle = (frameId) => {
        switch (frameId) {
            case 'crimson-halo': return { 
                gradient: 'conic-gradient(from 0deg, transparent 0%, #ff0000 20%, #ff4d4d 50%, #800000 80%, transparent 100%)', 
                glow: '0 0 20px rgba(255,0,0,0.4)', speed: 'spin' 
            };
            case 'neon-pulse': return { 
                gradient: 'conic-gradient(from 0deg, transparent 0%, #00ffcc 30%, #ff00ff 70%, transparent 100%)', 
                glow: '0 0 25px rgba(0,255,204,0.5)', speed: 'spin' 
            };
            case 'void-singularity': return { 
                gradient: 'conic-gradient(from 0deg, #111 0%, #000 25%, #111 50%, #000 75%, #111 100%)', 
                glow: 'inset 0 0 15px rgba(0,0,0,0.8)', speed: 'spin-slow' 
            };
            case 'solar-flare': return { 
                gradient: 'conic-gradient(from 0deg, #ff8c00, #ffd700, #ff4500, #ff8c00)', 
                glow: '0 0 30px rgba(255,140,0,0.6)', speed: 'spin' 
            };
            case 'ethereal-wisp': return { 
                gradient: 'conic-gradient(from 0deg, transparent 0%, #ffffff 20%, #e0f2ff 50%, #ffffff 80%, transparent 100%)', 
                glow: '0 0 20px rgba(255,255,255,0.5)', speed: 'spin-slow' 
            };
            case 'crystal-shard': return { 
                gradient: 'conic-gradient(from 0deg, #4facfe, #00f2fe, #ffffff, #00f2fe, #4facfe)', 
                glow: '0 0 25px rgba(79,172,254,0.6)', speed: 'spin' 
            };
            case 'cybernetic': return { 
                gradient: 'conic-gradient(from 0deg, #ff0099, #493240, #ff0099)', 
                glow: '0 0 25px rgba(255,0,153,0.7)', speed: 'spin' 
            };
            case 'frostbite': return { 
                gradient: 'conic-gradient(from 0deg, #00f2fe, #ffffff, #4facfe, #00f2fe)', 
                glow: '0 0 30px rgba(0,242,254,0.6)', speed: 'spin-slow' 
            };
            case 'toxic-glow': return { 
                gradient: 'conic-gradient(from 0deg, #39ff14, #001a00, #39ff14)', 
                glow: '0 0 30px rgba(57,255,20,0.8)', speed: 'spin' 
            };
            case 'inferno-ring': return { 
                gradient: 'conic-gradient(from 0deg, #ff3366, #ff99cc, #ff3366)', 
                glow: '0 0 35px rgba(255,51,102,0.7)', speed: 'spin-fast' 
            };
            default: return null;
        }
    }

    if (loading) return null

    const frameStyle = getFrameStyle(profile?.avatar_frame);

    return (
        <div className="flex flex-col items-center w-full mb-12 px-4">
            {/* AVATAR CONTAINER */}
            <div className="relative flex items-center justify-center z-10 w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] transition-all duration-500 hover:scale-105 group">
                
                {/* General subtle outer glow */}
                <div className="absolute inset-[-10px] bg-white/5 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Avatar Frame Container */}
                <div 
                    className={`absolute inset-0 rounded-full flex items-center justify-center z-20 transition-all duration-500 overflow-hidden ${!frameStyle ? (theme?.profile?.avatarBorder || 'border-2 border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] bg-white/5 backdrop-blur-xl') : ''}`}
                    style={frameStyle ? {
                        boxShadow: frameStyle.glow,
                        padding: '4px' // width of the frame ring
                    } : {}}
                >
                    {/* Spinning Gradient Layer (Only active if frame selected) */}
                    {frameStyle && (
                        <div 
                            className={`absolute inset-[-50%] w-[200%] h-[200%] ${frameStyle.speed === 'spin' ? 'animate-spin' : 'animate-[spin_4s_linear_infinite]'}`}
                            style={{ background: frameStyle.gradient }}
                        />
                    )}

                    {/* Inner Image Container (Blocks the middle of the gradient) */}
                    <div className={`w-full h-full overflow-hidden relative flex items-center justify-center bg-black/80 z-10 border border-white/10 ${theme?.avatarShape || 'rounded-full'}`}>
                        {profile?.avatar_url ? (
                            profile.avatar_url.match(/\.(mp4|webm|mov)$/i) ? (
                                <video
                                    src={profile.avatar_url}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover scale-110"
                                />
                            ) : (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            )
                        ) : (
                            <FaUserCircle size={100} className="text-white/20" />
                        )}
                    </div>
                </div>
            </div>

            {/* NAME AND VERIFIED BADGE */}
            <div className="mt-8 flex flex-col items-center gap-3 w-full">
                <div className="flex items-center justify-center gap-3 flex-wrap">
                    <h1 className={`text-4xl sm:text-5xl drop-shadow-md text-center transition-colors duration-500 ${theme?.profile?.name || 'font-black text-white tracking-tight'}`}
                        style={{ fontFamily: language === 'ar' ? "'Tajawal', sans-serif" : (theme?.font || "'Outfit', sans-serif") }}>
                        {profile?.full_name || t.name}
                    </h1>

                    {profile?.is_verified && (
                        <div className="flex items-center gap-1.5 px-4 py-1.5 bg-white/5 backdrop-blur-md border border-amber-500/30 rounded-full shadow-[0_0_15px_rgba(218,165,32,0.15)] animate-[fadeInUp_0.5s_ease-out]">
                            <MdVerified className="text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" size={20} />
                            <span className="text-sm font-bold text-amber-400 tracking-wide uppercase">
                                {t.verifiedLabel}
                            </span>
                        </div>
                    )}
                </div>

                {/* BIO / WEBSITE CONTAINER */}
                <div className="bio-container mt-3 inline-flex items-center justify-center px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-lg max-w-full text-center">
                    <span className={`text-base sm:text-lg tracking-wide transition-colors duration-500 ${theme?.profile?.bio || 'font-medium text-white/80'}`}>
                        {profile?.website || t.bio}
                    </span>
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}

export default Profile
