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

    return (
        <div
            data-editable-id="site_background"
            data-editable-type="container"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -1,
                overflow: 'hidden',
                /* Center background content if any */
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                /* DARK WINTER NIGHT GRADIENT: EXACTLY MATCHING REFERENCE */
                background: isSocial ? '#000' : (isGaming ? '#020308' : (isWinter ? 'linear-gradient(to bottom, #050a15 0%, #0a1525 100%)' : (isLuxury ? '#080808' : '#08080f'))),
                pointerEvents: 'none'
            }}>
            {type === 'image' && settings?.url && (
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${settings.url})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: -2 }} />
            )}

            {/* DARK WINTER SPECIFIC ATMOSPHERE */}
            {isWinter && (
                <>
                    {/* Subtle Night Glow at the top */}
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, height: '40%',
                        background: 'radial-gradient(circle at 50% 0%, rgba(20, 40, 70, 0.4) 0%, transparent 70%)',
                        zIndex: 0
                    }} />

                    {/* Falling Snow */}
                    {snowParticles.map(p => (
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
                                filter: p.size > 2 ? 'blur(1px)' : 'blur(0.5px)',
                                zIndex: 1
                            }}
                        />
                    ))}
                </>
            )}

            {/* VOGUE: STAGE SPOTLIGHT & FILM GRAIN */}
            {isSocial && (
                <>
                    <motion.div
                        animate={{
                            x: ['-50%', '50%', '-50%'],
                            y: ['-50%', '50%', '-50%'],
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        style={{
                            position: 'absolute',
                            top: '50%', left: '50%', width: '150vh', height: '150vh',
                            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%)',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 1
                        }}
                    />
                    <div style={{
                        position: 'absolute',
                        inset: 0, opacity: 0.12, zIndex: 2, pointerEvents: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                    }} />
                </>
            )}

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
                    <motion.div
                        animate={{ top: ['-20%', '120%'] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        style={{ position: 'absolute', left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, #00f2ff, transparent)', boxShadow: '0 0 30px #00f2ff', zIndex: 1, opacity: 0.2 }}
                    />
                </>
            )}

            {!isGaming && !isSocial && !isWinter && (
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    style={{ position: 'absolute', top: '15%', left: '15%', width: '400px', height: '400px', background: isLuxury ? 'rgba(212, 175, 55, 0.06)' : 'rgba(255, 45, 85, 0.08)', borderRadius: '50%', filter: 'blur(100px)' }}
                />
            )}
        </div>
    )
}

export default AnimatedBackground
