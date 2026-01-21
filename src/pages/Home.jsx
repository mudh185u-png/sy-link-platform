import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Profile from '../components/Profile'
import LinkList from '../components/LinkList'
import AnimatedBackground from '../components/AnimatedBackground'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'

const Home = () => {
    const { username } = useParams()
    const { t } = useLanguage()
    const { settings: globalSettings } = useAuth()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showHeader, setShowHeader] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                if (window.scrollY > lastScrollY && window.scrollY > 100) { // if scroll down hide the navbar
                    setShowHeader(false)
                } else { // if scroll up show the navbar
                    setShowHeader(true)
                }
                setLastScrollY(window.scrollY)
            }
        }

        window.addEventListener('scroll', controlNavbar)
        return () => window.removeEventListener('scroll', controlNavbar)
    }, [lastScrollY])

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true)
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('username', username)
                    .maybeSingle()

                if (error) throw error
                if (!data) {
                    setError('User not found')
                    return
                }

                if (data.is_suspended) {
                    setError('Account suspended')
                    return
                }

                setProfile(data)
                supabase.rpc('increment_profile_views', { profile_id: data.id }).then(() => { })

            } catch (error) {
                console.error('Error:', error)
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }

        if (username) fetchUserData()
    }, [username])

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <div className="loading-spinner"></div>
        </div>
    )

    if (error) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: '2rem' }}>
            <div className="glass-panel" style={{ padding: '3rem', borderRadius: '32px' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{error === 'User not found' ? '404' : '⚠️'}</h2>
                <p style={{ opacity: 0.6 }}>{error === 'User not found' ? 'This profile does not exist.' : 'This account has been suspended.'}</p>
                <Link to="/" className="glass-btn" style={{ marginTop: '2rem', display: 'inline-block', padding: '0.8rem 2rem' }}>Return Home</Link>
            </div>
        </div>
    )

    let skin = profile?.selected_skin || 'standard';

    // Check if current skin is allowed
    if (globalSettings?.page_backgrounds?.allowed_skins?.length > 0) {
        if (!globalSettings.page_backgrounds.allowed_skins.includes(skin)) {
            skin = globalSettings.page_backgrounds.default_skin || 'standard';
        }
    }

    return (
        <div className={`theme-${skin}`} style={{
            minHeight: '100vh',
            position: 'relative',
            width: '100%',
            overflowX: 'hidden'
        }}>
            <AnimatedBackground
                type={profile?.background_type}
                config={profile?.background_config}
                skin={skin}
            />

            {/* MAIN CONTAINER */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                padding: '1.2rem', // Adjusted padding
                paddingBottom: '8rem',
                width: '100%',
                maxWidth: '480px', // Adjusted max-width (Sweet spot)
                margin: '0 auto', // ADDED THIS TO CENTER THE CONTAINER
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <header style={{
                    position: 'fixed',
                    top: '1.5rem',
                    left: '50%',
                    transform: `translateX(-50%) translateY(${showHeader ? '0' : '-200%'})`,
                    zIndex: 100,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(20px)',
                    padding: '0.8rem 1.2rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    width: '95%',
                    maxWidth: '460px', // Slightly less than container
                    transition: 'transform 0.3s ease-in-out'
                }}>
                    <Link to="/" style={{
                        textDecoration: 'none',
                        color: skin === 'luxury' ? '#d4af37' : '#fff',
                        fontFamily: skin === 'luxury' ? "'Playfair Display', serif" : "'Outfit', sans-serif",
                        fontSize: '1.4rem',
                        fontWeight: '950',
                        letterSpacing: '-0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{
                            background: skin === 'gaming' ? '#00f2ff' : 'var(--accent-color)',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            boxShadow: skin === 'gaming' ? '0 0 10px #00f2ff' : 'none'
                        }}></span>
                        SY Link
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <LanguageSwitcher inline={true} />
                        <Link to="/" style={{
                            textDecoration: 'none',
                            fontSize: '0.8rem',
                            fontWeight: '800',
                            color: '#fff',
                            background: skin === 'gaming' ? 'rgba(0, 242, 255, 0.1)' : (skin === 'luxury' ? 'rgba(212, 175, 55, 0.1)' : 'var(--accent-gradient)'),
                            padding: '8px 14px',
                            borderRadius: '12px',
                            border: skin === 'gaming' ? '1.5px solid #00f2ff' : (skin === 'luxury' ? '1.5px solid #d4af37' : 'none'),
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap'
                        }}>
                            {t.createYourPage}
                        </Link>
                    </div>
                </header>

                <main style={{ width: '100%', marginTop: '6rem' }}>
                    <Profile profileData={profile} skin={skin} />
                    <LinkList userId={profile.id} skin={skin} />
                </main>

                <footer style={{
                    marginTop: '5rem',
                    padding: '2.5rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px',
                    textAlign: 'center',
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '24px',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                    width: '100%',
                    /* ALIGN WITH NEW CARD WIDTH */
                    maxWidth: '480px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                                fontSize: '0.9rem', // Increased from 0.75rem
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                color: '#fff',
                                opacity: 0.9
                            }}>{t.developedBy}</span>
                            <span style={{
                                fontFamily: skin === 'luxury' ? "'Playfair Display', serif" : "'Homemade Apple', cursive",
                                fontSize: '1.3rem', // Increased from 1.1rem
                                color: skin === 'luxury' || skin === 'gaming' ? (skin === 'luxury' ? '#d4af37' : '#00f2ff') : 'var(--accent-color)',
                                fontWeight: 'bold'
                            }}>MUD</span>
                        </div>

                        <div style={{ width: '1px', height: '15px', background: 'rgba(255,255,255,0.2)' }}></div>

                        <span style={{
                            fontFamily: "'Homemade Apple', cursive",
                            fontSize: '1.5rem', // Increased from 1.3rem
                            color: '#fff',
                            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                        }}>SY Link</span>
                    </div>

                    <div style={{
                        fontSize: '1rem', // Increased from 0.9rem
                        color: '#fff',
                        opacity: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        fontWeight: '600'
                    }}>
                        <span style={{ letterSpacing: '0.5px' }}>{t.allRightsReserved}</span>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            color: skin === 'gaming' ? '#00f2ff' : (skin === 'luxury' ? '#d4af37' : '#fff'),
                            background: skin === 'gaming' ? 'rgba(0, 242, 255, 0.15)' : (skin === 'luxury' ? 'rgba(212, 175, 55, 0.15)' : 'var(--accent-color)'),
                            fontSize: '0.8rem',
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            letterSpacing: '1.5px',
                            padding: '6px 16px',
                            borderRadius: '30px',
                            border: '1.5px solid rgba(255,255,255,0.2)',
                            boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                        }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 10px currentColor' }}></span>
                            {t.maxSecurity}
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default Home
