import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Profile from '../components/Profile'
import LinkList from '../components/LinkList'
import AnimatedBackground from '../components/AnimatedBackground'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { getThemeConfig } from '../utils/themeConfig'

const Home = () => {
    const { username } = useParams()
    const { t, language } = useLanguage()
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
                
                // --- SECURITY: Anti-Spam View Tracking ---
                // Generate or retrieve a unique visitor ID for this device
                let visitorId = localStorage.getItem('visitor_id');
                if (!visitorId) {
                    visitorId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
                    localStorage.setItem('visitor_id', visitorId);
                }

                // Check local throttle to avoid redundant DB calls on fast refreshes
                const lastViewedKey = `viewed_${data.id}`;
                const lastViewed = localStorage.getItem(lastViewedKey);
                const now = Date.now();
                
                // Only send request if we haven't viewed this profile in the last hour
                if (!lastViewed || (now - parseInt(lastViewed)) > 3600000) {
                    supabase.rpc('increment_profile_views', { 
                        profile_id: data.id,
                        visitor_hash: visitorId 
                    }).then(() => { 
                        localStorage.setItem(lastViewedKey, now.toString());
                    }).catch(err => console.error("Analytics Error:", err));
                }
                // ------------------------------------------

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


    let skinId = profile?.selected_skin || 'standard';
    
    const theme = getThemeConfig(skinId);
    const skinClass = `skin-${skinId}`;

    // Determine the right font
    const baseFont = language === 'ar' ? 'Tajawal, sans-serif' : (theme.font || "'Outfit', sans-serif");

    return (
        <div className={`${skinClass} min-h-screen w-full relative overflow-x-hidden transition-colors duration-500 bg-transparent text-white`} style={{ fontFamily: baseFont, direction: language === 'ar' ? 'rtl' : 'ltr' }}>
            {/* Inject custom CSS for category skins */}
            {theme.customCSS && <style>{theme.customCSS}</style>}

            {/* Decorative overlays for category skins */}
            {theme.decorations && (
                <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
                    {theme.decorations.map((dec, i) => {
                        if (dec.type === 'gradient-orb') {
                            const posStyle = {};
                            if (dec.position?.includes('top')) posStyle.top = '10%';
                            if (dec.position?.includes('bottom')) posStyle.bottom = '10%';
                            if (dec.position?.includes('left')) posStyle.left = '5%';
                            if (dec.position?.includes('right')) posStyle.right = '5%';
                            return (
                                <div key={i} className="absolute animate-pulse" style={{
                                    ...posStyle,
                                    width: dec.size || 100,
                                    height: dec.size || 100,
                                    background: `radial-gradient(circle, ${dec.colors?.join(', ') || '#fff'})`,
                                    filter: `blur(${dec.blur || 60}px)`,
                                    opacity: dec.opacity || 0.1,
                                    borderRadius: '50%',
                                }} />
                            );
                        }
                        if (dec.type === 'emoji') {
                            const posStyle = {};
                            if (dec.position?.includes('top')) posStyle.top = '15%';
                            if (dec.position?.includes('bottom')) posStyle.bottom = '20%';
                            if (dec.position?.includes('left')) posStyle.left = '8%';
                            if (dec.position?.includes('right')) posStyle.right = '8%';
                            return (
                                <div key={i} className="absolute" style={{
                                    ...posStyle,
                                    fontSize: dec.size || 24,
                                    opacity: dec.opacity || 0.2,
                                    animation: dec.animate === 'float' ? 'floatHeart 4s ease-in-out infinite' : 'none',
                                    animationDelay: `${i * 0.8}s`,
                                }}>{dec.emoji}</div>
                            );
                        }
                        if (dec.type === 'corner-bracket') {
                            const isTop = dec.position?.includes('top');
                            const isLeft = dec.position?.includes('left');
                            return (
                                <div key={i} className="absolute" style={{
                                    [isTop ? 'top' : 'bottom']: 20,
                                    [isLeft ? 'left' : 'right']: 20,
                                    width: 20, height: 20,
                                    borderColor: dec.color || '#66fcf1',
                                    borderWidth: 2,
                                    borderStyle: 'solid',
                                    [isTop ? 'borderBottom' : 'borderTop']: 'none',
                                    [isLeft ? 'borderRight' : 'borderLeft']: 'none',
                                    opacity: 0.6,
                                }} />
                            );
                        }
                        return null;
                    })}
                </div>
            )}

            <AnimatedBackground
                type={profile?.background_type}
                config={profile?.background_config}
                skin={skinId} 
            />

            {/* MAIN CONTAINER */}
            <div className={`relative z-10 w-full max-w-[480px] mx-auto min-h-screen flex flex-col pb-24 px-4 sm:px-6 ${theme.global || ''}`}>
                
                {/* Header */}
                <header className="sticky top-0 z-50 w-full flex justify-between items-center px-2 pt-6 pb-4 mb-2">
                    <Link to="/" className="flex items-center gap-2 font-black text-sm tracking-tight transition-colors text-white/70 hover:text-white">
                        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]" />
                        SY Link
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <LanguageSwitcher inline={true} />
                        <Link to="/" className="text-[10px] sm:text-xs font-black px-3 py-1.5 rounded-full transition-all backdrop-blur-sm whitespace-nowrap uppercase tracking-wider bg-white/5 text-white/80 hover:bg-white/10 hover:text-white border border-white/10">
                            {t.createYourPage}
                        </Link>
                    </div>
                </header>

                {/* Profile Content - Always respects hide_glass_panel */}
                <main className={`w-full flex-1 flex flex-col items-center p-6 sm:p-8 mt-2 transition-all duration-500 ${profile?.background_config?.hide_glass_panel !== false ? 'bg-transparent border-none shadow-none' : theme.container}`}>
                    <Profile profileData={profile} theme={theme} />
                    <LinkList userId={profile.id} theme={theme} />
                </main>

                {/* Footer */}
                <footer className="mt-16 w-full flex flex-col items-center gap-6 p-8 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl text-center">
                    <div className="flex items-center gap-4 opacity-80">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">{t.developedBy}</span>
                            <span className="text-sm font-black text-rose-400">MUD</span>
                        </div>
                        <div className="w-px h-4 bg-white/20" />
                        <span className="text-lg font-black tracking-tighter drop-shadow-md text-white">SY Link</span>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <span className="text-xs font-semibold tracking-wider uppercase text-white/40">{t.allRightsReserved}</span>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                            {t.maxSecurity}
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default Home
