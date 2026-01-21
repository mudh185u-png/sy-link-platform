import React, { useEffect, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'
import { FaUserCircle, FaStar, FaCog, FaCheck } from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'

const Profile = ({ profileData, skin = 'standard' }) => {
    const { t } = useLanguage()
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

    if (loading) return null

    const isLuxury = skin === 'luxury';
    const isGaming = skin === 'gaming';
    const isMinimal = skin === 'minimal';
    const isSocial = skin === 'social';

    const renderAvatar = () => {
        const frame = profile?.avatar_frame || 'none';

        // ARTISTIC MASTERPIECE FRAME STYLES
        const frameStyles = {
            'pearl-ethereal': {
                border: '8px solid transparent',
                background: 'linear-gradient(#0a0a0a, #0a0a0a) padding-box, linear-gradient(135deg, #fff 0%, #fdeeff 50%, #e0f2ff 100%) border-box',
                boxShadow: '0 0 40px rgba(255,255,255,0.4), inset 0 0 20px rgba(255,255,255,0.2)',
                animation: 'silkFlow 6s ease-in-out infinite alternate',
                position: 'relative',
                borderRadius: '40% 60% 50% 50% / 50% 50% 40% 60%'
            },
            'obsidian-neon': {
                border: '4px solid rgba(0, 242, 255, 0.8)',
                background: 'rgba(0,0,0,0.85)',
                boxShadow: '0 0 30px #00f2ff, inset 0 0 20px #00f2ff',
                animation: 'neonScan 3s linear infinite',
                backdropFilter: 'blur(10px)',
                position: 'relative'
            },
            'grand-chronos': {
                border: '10px solid transparent',
                background: 'linear-gradient(#050505, #050505) padding-box, linear-gradient(135deg, #DAA520, #000, #DAA520) border-box',
                boxShadow: '0 15px 45px rgba(0,0,0,0.8), 0 0 20px rgba(218, 165, 32, 0.3)',
                position: 'relative',
                zIndex: 10
            },
            'diamond-prism': {
                border: '6px solid transparent',
                background: 'linear-gradient(#080808, #080808) padding-box, linear-gradient(135deg, #fff, #b9f2ff, #fff) border-box',
                boxShadow: '0 0 40px rgba(255,255,255,0.6)',
                animation: 'diamondSparkle 4s ease-in-out infinite',
                clipPath: 'polygon(50% 0%, 90% 10%, 100% 50%, 90% 90%, 50% 100%, 10% 90%, 0% 50%, 10% 10%)'
            },
            'aurora-liquid': {
                border: '6px solid transparent',
                background: 'linear-gradient(#080808, #080808) padding-box, linear-gradient(45deg, #007bff, #00ff88, #7000ff, #007bff) border-box',
                backgroundSize: '400% 400%',
                boxShadow: '0 0 35px rgba(0, 123, 255, 0.6)',
                animation: 'auroraFlow 8s linear infinite',
                opacity: 0.95
            },
        };

        const currentFrameStyle = frameStyles[frame] || {};

        return (
            <div style={{
                position: 'relative',
                width: isSocial ? '180px' : (isGaming || frame !== 'none' ? '170px' : '150px'),
                height: isSocial ? '180px' : (isGaming || frame !== 'none' ? '170px' : '150px'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                {/* GRAND CHRONOS DECORATIONS */}
                {frame === 'grand-chronos' && (
                    <>
                        <div style={{ position: 'absolute', inset: '-12px', border: '1px solid #DAA520', borderRadius: '50%', opacity: 0.4 }} />
                        <div style={{ position: 'absolute', top: '-15px', left: '-15px', animation: 'spinClockwise 15s linear infinite' }}>
                            <FaCog color="#DAA520" size={30} style={{ filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.5))' }} />
                        </div>
                        <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', animation: 'spinCounterClockwise 10s linear infinite' }}>
                            <FaCog color="#DAA520" size={25} style={{ filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.5))' }} />
                        </div>
                    </>
                )}

                {/* DIAMOND PRISM LIGHT LEAKS */}
                {frame === 'diamond-prism' && (
                    <div style={{
                        position: 'absolute', inset: '-20px',
                        background: 'conic-gradient(from 0deg, rgba(255,0,0,0.1), rgba(255,255,0,0.1), rgba(0,255,0,0.1), rgba(0,255,255,0.1), rgba(0,0,255,0.1), rgba(255,0,255,0.1), rgba(255,0,0,0.1))',
                        filter: 'blur(30px)',
                        zIndex: -1,
                        animation: 'spinClockwise 10s linear infinite'
                    }} />
                )}

                {/* OBSIDIAN NEON REFLECTIONS */}
                {frame === 'obsidian-neon' && (
                    <div style={{
                        position: 'absolute', inset: '0',
                        background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
                        backgroundSize: '300% 300%',
                        animation: 'glassShine 3s ease-in-out infinite',
                        zIndex: 15,
                        pointerEvents: 'none',
                        borderRadius: '50%'
                    }} />
                )}

                {/* AVATAR CONTAINER */}
                <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: (isGaming || isSocial) ? '0' : '50%',
                    clipPath: isGaming ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' : (isSocial ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' : 'none'),
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#111',
                    border: (isGaming || isSocial || frame !== 'none') ? 'none' : '4px solid rgba(255,255,255,0.05)',
                    boxShadow: (isGaming || isSocial || frame !== 'none') ? 'none' : '0 10px 30px rgba(0,0,0,0.4)',
                    ...currentFrameStyle
                }}>
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <FaUserCircle size={150} color="rgba(255,255,255,0.01)" />
                    )}
                </div>

                {/* ANIMATION DEFINITIONS */}
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Aref+Ruqaa:wght@700&display=swap');
                    
                    @keyframes sealShimmer {
                        0% { left: -100%; }
                        20% { left: 200%; }
                        100% { left: 200%; }
                    }
                    @keyframes silkFlow {
                        0% { border-radius: 40% 60% 50% 50% / 50% 50% 40% 60%; transform: rotate(0deg) scale(1); }
                        100% { border-radius: 50% 50% 60% 40% / 40% 60% 50% 50%; transform: rotate(5deg) scale(1.05); }
                    }
                    @keyframes neonScan {
                        0% { border-color: rgba(0, 242, 255, 0.8); box-shadow: 0 0 20px #00f2ff; }
                        50% { border-color: rgba(0, 242, 255, 1); box-shadow: 0 0 45px #00f2ff, inset 0 0 10px #00f2ff; }
                        100% { border-color: rgba(0, 242, 255, 0.8); box-shadow: 0 0 20px #00f2ff; }
                    }
                    @keyframes diamondSparkle {
                        0%, 100% { filter: brightness(1) contrast(1); transform: scale(1); }
                        50% { filter: brightness(1.4) contrast(1.2); transform: scale(1.02); }
                    }
                    @keyframes auroraFlow {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    @keyframes spinClockwise {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    @keyframes spinCounterClockwise {
                        from { transform: rotate(360deg); }
                        to { transform: rotate(0deg); }
                    }
                    @keyframes glassShine {
                        0% { background-position: -100% 0; }
                        100% { background-position: 200% 0; }
                    }
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{
            textAlign: 'center',
            marginBottom: '4rem',
            padding: '0 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
        }}>
            {renderAvatar()}

            <div style={{
                marginTop: '3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                width: '100%'
            }}>
                <h1 style={{
                    fontSize: isSocial ? '3.5rem' : (isMinimal ? '2.5rem' : '3rem'),
                    fontWeight: '700',
                    color: '#fff',
                    letterSpacing: isSocial ? '3px' : (isGaming ? '1.5px' : '-0.5px'),
                    textShadow: '0 10px 40px rgba(0,0,0,0.8)',
                    fontFamily: "'Amiri', 'Aref Ruqaa', serif",
                    textTransform: (isGaming || isSocial) ? 'uppercase' : 'none',
                    lineHeight: 1.2,
                    margin: 0
                }}>
                    {profile?.full_name || t.name}
                </h1>

                {/* MINIMAL VERIFIED BADGE */}
                {profile?.is_verified && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 16px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(218, 165, 32, 0.3)',
                        borderRadius: '50px',
                        backdropFilter: 'blur(10px)',
                        animation: 'fadeInUp 0.8s ease-out',
                        height: 'fit-content'
                    }}>
                        <MdVerified color="#DAA520" size={18} />
                        <span style={{
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            color: '#DAA520',
                            letterSpacing: '0.5px',
                        }}>
                            {t.verifiedLabel}
                        </span>
                    </div>
                )}
            </div>

            <div style={{
                marginTop: '1.2rem',
                display: 'inline-block',
                padding: isSocial ? '8px 25px' : '10px 30px',
                background: isSocial ? 'transparent' : (isGaming ? 'rgba(0, 242, 255, 0.08)' : 'rgba(255,255,255,0.08)'),
                border: isSocial ? 'none' : (isGaming ? '1.5px solid #00f2ff' : '1px solid rgba(255,255,255,0.15)'),
                borderBottom: isSocial ? '3px solid #fff' : (isLuxury ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.15)'),
                borderRadius: isMinimal ? '32px' : (isGaming ? '4px' : (isSocial ? '0' : '80px')),
                fontSize: isSocial ? '1rem' : '1.1rem',
                color: isLuxury ? '#d4af37' : 'rgba(255,255,255,0.7)',
                fontWeight: '600',
                letterSpacing: isSocial ? '1px' : '0.1px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                position: 'relative',
                zIndex: 1
            }}>
                {isSocial && <FaStar style={{ color: '#f09433', marginInlineEnd: '8px' }} />}
                {profile?.website || t.bio}
            </div>
        </div>
    )
}

export default Profile
