import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const AdCard = ({ ad, skin = 'standard' }) => {
    const { t } = useLanguage()
    if (!ad || !ad.active) return null;

    const isSocial = skin === 'social';
    const isLuxury = skin === 'luxury';
    const isGaming = skin === 'gaming';
    const isSyria = skin === 'syria';

    const marginBetween = isSocial ? '1.6rem' : '1.4rem';

    const getCardStyles = () => {
        if (isSocial) return {
            background: 'rgba(0, 0, 0, 0.95)',
            border: '2px solid #ffffff',
            borderRadius: '2px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            padding: '0',
            position: 'relative',
            overflow: 'hidden'
        }
        if (isGaming) return {
            background: 'rgba(2, 4, 12, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 242, 255, 0.2)',
            borderRadius: '0',
            clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)',
            padding: '0',
            overflow: 'hidden'
        }
        if (isLuxury) return {
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(18px)',
            border: '2px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '0',
            padding: '0',
            overflow: 'hidden'
        }
        if (isSyria) return {
            background: 'linear-gradient(110deg, #000000 0%, #0a1f0a 60%, #002914 100%)',
            backdropFilter: 'blur(12px)',
            borderTop: '2px solid rgba(255,255,255,0.15)',
            borderBottom: '2px solid rgba(255,255,255,0.15)',
            borderRight: '6px solid #007A3D',
            borderLeft: '6px solid #000',
            borderRadius: '6px',
            padding: '0',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            position: 'relative',
            overflow: 'hidden'
        }
        return {
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(15px)',
            border: '1.5px solid rgba(255,255,255,0.15)',
            borderRadius: '20px',
            padding: '0',
            boxShadow: '0 10px 35px rgba(0,0,0,0.3)',
            overflow: 'hidden'
        }
    }

    return (
        <a
            href={ad.target_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: 'flex',
                flexDirection: 'column',
                marginBottom: marginBetween,
                width: '100%',
                minHeight: '110px',
                transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
                textDecoration: 'none',
                position: 'relative',
                ...getCardStyles()
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.5)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = getCardStyles().boxShadow || 'none';
            }}
        >
            {/* BACKGROUND IMAGE FILLING THE ROW */}
            {ad.image_url ? (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${ad.image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0
                }} />
            ) : (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, #1a1a1a, #333)',
                    zIndex: 0
                }} />
            )}

            {/* OVERLAY GRADIENT FOR TEXT READABILITY */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                zIndex: 1
            }} />

            {/* CONTENT OVERLAY */}
            <div style={{
                marginTop: 'auto',
                padding: '16px 20px',
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end'
            }}>
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: '0.65rem',
                        opacity: 0.9,
                        color: isLuxury ? '#d4af37' : (isGaming ? '#00f2ff' : '#fff'),
                        marginBottom: '3px',
                        fontWeight: '950',
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px'
                    }}>
                        {isLuxury ? '💎 Exclusive' : (isGaming ? '⚡ Power Up' : '📢 Recommended')}
                    </div>
                    <h4 style={{
                        margin: 0,
                        fontSize: '1.2rem',
                        fontWeight: '950',
                        color: '#fff',
                        textShadow: '0 2px 10px rgba(0,0,0,0.9)',
                        fontFamily: isLuxury || isSocial ? "'Playfair Display', serif" : 'inherit',
                        lineHeight: '1.1'
                    }}>
                        {ad.message}
                    </h4>
                </div>

                <div style={{
                    background: isSocial ? '#fff' : 'rgba(255,255,255,0.12)',
                    color: isSocial ? '#000' : '#fff',
                    padding: '4px 10px',
                    borderRadius: isSocial ? '0' : '6px',
                    border: isSocial ? 'none' : '1px solid rgba(255,255,255,0.15)',
                    fontWeight: '900',
                    fontSize: '0.7rem',
                    backdropFilter: 'blur(8px)',
                    letterSpacing: '1px',
                    marginLeft: '10px'
                }}>
                    {t.adTag || 'AD'}
                </div>
            </div>
        </a>
    )
}

export default AdCard
