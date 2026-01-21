import { supabase } from '../lib/supabase'
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa'
import { useLanguage } from '../contexts/LanguageContext'
import { getLocalizedTitle } from '../constants/translations'

const LinkCard = ({ id, title, url, icon, skin = 'standard' }) => {
    const { language } = useLanguage()

    const handleClick = () => {
        if (id) {
            supabase.rpc('increment_link_clicks', { link_id: id }).then(() => { })
        }
    }

    const isSocial = skin === 'social';
    const isLuxury = skin === 'luxury';
    const isGaming = skin === 'gaming';
    const isSyria = skin === 'syria';

    const cardPadding = isSocial ? '20px 28px' : '18px 24px'; // Increased from 18/24 and 14/22
    const iconSide = isSocial ? '46px' : '50px'; // Increased from 42 and 46
    const fontSize = isSocial ? '1.1rem' : '1.35rem'; // Increased from 1 and 1.25
    const marginBetween = isSocial ? '1.6rem' : '1.4rem'; // Increased margins

    const getCardStyles = () => {
        if (isSocial) return {
            background: 'rgba(0, 0, 0, 0.95)',
            border: '2px solid #ffffff',
            borderRadius: '2px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            padding: cardPadding,
            position: 'relative'
        }
        if (isGaming) return {
            background: 'rgba(2, 4, 12, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 242, 255, 0.2)',
            borderRadius: '0',
            clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)',
            padding: cardPadding
        }
        if (isLuxury) return {
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(18px)',
            border: '2px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '0',
            padding: '14px 24px'
        }

        if (isSyria) return {
            /* SYRIA LIBERATION STYLE - PREMIUM REDESIGN */
            background: 'linear-gradient(110deg, #000000 0%, #0a1f0a 60%, #002914 100%)', // Deep Dark Green to Black
            backdropFilter: 'blur(12px)',
            // Flag Borders:
            borderTop: '2px solid rgba(255,255,255,0.15)',
            borderBottom: '2px solid rgba(255,255,255,0.15)',
            borderRight: '6px solid #007A3D', // Strong Green Stripe
            borderLeft: '6px solid #000',     // Strong Black Stripe
            borderRadius: '6px',
            padding: '16px 24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            position: 'relative',
            overflow: 'hidden'
        }
        // Fallback Standard
        return {
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(15px)',
            border: '1.5px solid rgba(255,255,255,0.15)',
            borderRadius: '20px',
            padding: cardPadding,
            boxShadow: '0 10px 35px rgba(0,0,0,0.3)'
        }
    }

    const cardStyles = getCardStyles();

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className={`glass-btn ${isSocial ? 'vogue-card' : ''} ${isSyria ? 'syria-card' : ''}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: marginBetween,
                width: '100%',
                transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
                textDecoration: 'none',
                ...cardStyles
            }}
        >
            {/* SYRIA DECORATION: 3 RED STARS + ANIMATION */}
            {isSyria && (
                <>
                    {/* Background Texture Overlay */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(228, 49, 43, 0.08) 0%, transparent 25%)', // Subtle Red glow
                        zIndex: 0, pointerEvents: 'none'
                    }} />

                    {/* Stars that glow on hover */}
                    <div className="syria-stars" style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        display: 'flex', gap: '15px', zIndex: 0, pointerEvents: 'none'
                    }}>
                        <div style={{ color: '#E4312b', fontSize: '1.8rem', opacity: 0.3, transition: 'all 0.3s' }}>★</div>
                        <div style={{ color: '#E4312b', fontSize: '2.4rem', opacity: 0.3, transition: 'all 0.3s', marginTop: '-5px' }}>★</div>
                        <div style={{ color: '#E4312b', fontSize: '1.8rem', opacity: 0.3, transition: 'all 0.3s' }}>★</div>
                    </div>
                </>
            )}

            {language === 'ar' ? (
                /* STRICT ARABIC LAYOUT: [Chevron] [TEXT CENTERED] [ICON] */
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', zIndex: 1, position: 'relative' }}>
                    <div style={{ opacity: 0.8, fontSize: '1.2rem', color: '#fff', width: '40px', display: 'flex', justifyContent: 'center' }}>
                        <FaChevronLeft />
                    </div>

                    <span style={{
                        fontWeight: '950',
                        fontSize: fontSize,
                        flex: 1,
                        color: '#fff',
                        fontFamily: isSocial || isLuxury ? "'Playfair Display', serif" : 'inherit',
                        textAlign: 'center',
                        letterSpacing: (isSocial) ? '2px' : '1px',
                        textTransform: (isSocial || isGaming) ? 'uppercase' : 'none',
                    }}>
                        {getLocalizedTitle(title, language)}
                    </span>

                    <div style={{
                        width: iconSide, height: iconSide, borderRadius: isSocial ? '0' : '16px',
                        background: isSocial ? '#fff' : 'rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0,
                        border: '2px solid #fff', color: isSocial ? '#000' : '#fff',
                    }}>
                        {icon}
                    </div>
                </div>
            ) : (
                /* STRICT ENGLISH LAYOUT */
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', zIndex: 1, position: 'relative' }}>
                    <div style={{
                        width: iconSide, height: iconSide, borderRadius: isSocial ? '0' : '16px',
                        background: isSocial ? '#fff' : 'rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0,
                        border: '2px solid #fff', color: isSocial ? '#000' : '#fff',
                    }}>
                        {icon}
                    </div>

                    <span style={{
                        fontWeight: '950',
                        fontSize: fontSize,
                        flex: 1,
                        color: '#fff',
                        fontFamily: isSocial || isLuxury ? "'Playfair Display', serif" : 'inherit',
                        textAlign: 'center',
                        letterSpacing: (isSocial) ? '2px' : '2px',
                        textTransform: (isSocial || isGaming) ? 'uppercase' : 'none',
                    }}>
                        {getLocalizedTitle(title, language)}
                    </span>

                    <div style={{ opacity: 0.8, fontSize: '1.2rem', color: '#fff', width: '40px', display: 'flex', justifyContent: 'center' }}>
                        <FaChevronRight />
                    </div>
                </div>
            )}

            <style>{`
                .vogue-card:hover { background: #fff !important; transform: scale(1.02) !important; border-color: #000 !important; }
                .vogue-card:hover span, .vogue-card:hover div { color: #000 !important; }
                
                .syria-card:hover {
                    box-shadow: 0 0 25px rgba(0, 122, 61, 0.5), inset 0 0 15px rgba(0,0,0,0.8) !important;
                    transform: translateY(-2px) scale(1.01) !important;
                    border-right-color: #E4312b !important; /* Change green stripe to red on hover */
                }
                .syria-card:hover .syria-stars div {
                    opacity: 0.8 !important; /* Stars light up */
                    text-shadow: 0 0 10px #E4312b;
                }
            `}</style>
        </a>
    )
}

export default LinkCard
