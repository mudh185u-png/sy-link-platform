import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

// Generate static particles outside the component to ensure strict purity
const STATIC_PARTICLES = Array.from({ length: 150 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    left: `${Math.random() * 100}%`,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.5 + 0.1,
    xDrift: Math.random() * 30 - 15
}));

const AnimatedBackground = ({ type, config, skin }) => {
    const isGaming = skin === 'gaming';
    const isLuxury = skin === 'luxury';
    const isNeon = skin === 'neon';
    const isMinimal = skin === 'minimal';
    const isSocial = skin === 'social';
    const isWinter = skin === 'winter';

    const settings = typeof config === 'string' ? JSON.parse(config) : config;

    // Use a slice of the static particles if winter is active
    const snowParticles = useMemo(() => {
        if (!isWinter) return [];
        return STATIC_PARTICLES.slice(0, 100);
    }, [isWinter]);

    // OPTIMIZATION: On mobile/performance mode, simplify complex backgrounds
    // For now, we are enforcing strictly lightweight CSS for commonly used types if they are causing lag.

    // Fallback for heavy "animated" type to simple gradient if needed by CSS overrides, 
    // but here we render the DOM. The parent can control visibility.
    return (
        <div
            data-editable-id="site_background"
            data-editable-type="container"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -1,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: isSocial ? '#000' : (isGaming ? '#020308' : (isWinter ? 'linear-gradient(to bottom, #050a15 0%, #0a1525 100%)' : (isLuxury ? '#080808' : '#08080f'))),
                pointerEvents: 'none'
            }}>
            {/* 
                    PERFORMANCE HACK:
                    If 'isWinter', 'isGaming', or 'isSocial' are active, we render them BUT
                    we must be careful. The user complained about lag.
                    We will REDUCE the particle count for winter significantly.
                */}
            {type === 'image' && settings?.url && (
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${settings.url})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: -2 }} />
            )}

            {/* DARK WINTER SPECIFIC ATMOSPHERE - REDUCED PARTICLES */}
            {isWinter && (
                <>
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, height: '40%',
                        background: 'radial-gradient(circle at 50% 0%, rgba(20, 40, 70, 0.4) 0%, transparent 70%)',
                        zIndex: 0
                    }} />
                    {/* Render fewer particles (20 instead of 100) */}
                    {snowParticles.slice(0, 20).map(p => (
                        <motion.div
                            key={p.id}
                            initial={{ top: '-10%', left: p.left, opacity: 0 }}
                            animate={{
                                top: '110%',
                                opacity: [0, p.opacity, p.opacity, 0],
                                x: [0, p.xDrift, 0]
                            }}
                            transition={{
                                duration: p.duration,
                                repeat: Infinity,
                                delay: p.delay,
                                ease: "linear"
                            }}
                            style={{
                                position: 'absolute',
                                width: p.size,
                                height: p.size,
                                background: '#fff',
                                borderRadius: '50%',
                                filter: 'blur(0px)', // Removed blur for performance
                                zIndex: 1
                            }}
                        />
                    ))}
                </>
            )}

            {/* VOGUE: REDUCED ANIMATION COMPLEXITY */}
            {isSocial && (
                <>
                    <div style={{
                        position: 'absolute',
                        top: '50%', left: '50%', width: '100vw', height: '100vh',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%)',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1
                    }} />
                    {/* Removed the heavy animated overlay and noise filter */}
                </>
            )}

            {/* GAMING: STATIC GRID INSTEAD OF ANIMATED */}
            {isGaming && (
                <>
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `linear-gradient(rgba(0, 242, 246, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 242, 246, 0.05) 1px, transparent 1px)`,
                        backgroundSize: '80px 80px',
                        backgroundPosition: 'center center',
                        perspective: '1200px',
                        transform: 'rotateX(60deg) translateY(-20%) scale(2.5)',
                        opacity: 0.3
                    }} />
                    {/* Removed the scanning line animation */}
                </>
            )}

            {/* STANDARD BLOBS: REDUCED BLUR RADIUS */}
            {!isGaming && !isSocial && !isWinter && (
                <div
                    style={{
                        position: 'absolute', top: '15%', left: '15%',
                        width: '300px', height: '300px',
                        background: isLuxury ? 'rgba(212, 175, 55, 0.06)' : 'rgba(255, 45, 85, 0.08)',
                        borderRadius: '50%',
                        filter: 'blur(60px)' // Reduced from 100px
                    }}
                />
            )}
        </div>
    )
}

export default AnimatedBackground
