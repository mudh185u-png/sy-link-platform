import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

// Generate static particles outside the component to ensure strict purity
const STATIC_PARTICLES = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: Math.random() * 20 + 20,
    delay: Math.random() * -20,
    opacity: Math.random() * 0.6 + 0.2,
}));

const AnimatedBackground = ({ type, config, skin }) => {
    const settings = typeof config === 'string' ? JSON.parse(config) : (config || {});
    const theme = type === 'animated' ? (settings.theme || 'nebula') : null;

    // Handle Image/Video background types
    if (type === 'image' && settings?.url) {
        return <div style={{ position: 'fixed', inset: 0, backgroundImage: `url(${settings.url})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: -2 }} />
    }
    if (type === 'video' && settings?.url) {
        return (
            <div style={{ position: 'fixed', inset: 0, zIndex: -2, overflow: 'hidden' }}>
                <video src={settings.url} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
            </div>
        )
    }

    // Default container for animated backgrounds
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: -2, overflow: 'hidden', pointerEvents: 'none' }}>
            
            {/* 1. MATRIX RAIN */}
            {theme === 'matrix-rain' && (
                <div className="w-full h-full bg-[#050a05]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] z-10"></div>
                    {STATIC_PARTICLES.map(p => (
                        <motion.div
                            key={p.id}
                            animate={{ y: ['-10vh', '110vh'] }}
                            transition={{ duration: p.duration / 3, repeat: Infinity, ease: "linear", delay: p.delay }}
                            className="absolute w-[2px] bg-gradient-to-b from-transparent via-[#00ff41] to-[#00ff41] rounded-full shadow-[0_0_10px_#00ff41]"
                            style={{ left: p.left, top: '-10vh', height: `${p.size * 20}px`, opacity: p.opacity }}
                        />
                    ))}
                </div>
            )}

            {/* 2. ABYSSAL OCEAN */}
            {theme === 'abyssal-ocean' && (
                <div className="w-full h-full bg-[#000b18]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#001220] to-[#00040a]"></div>
                    <motion.div 
                        animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] bg-teal-900/20 rounded-full blur-[100px]"
                    />
                    <motion.div 
                        animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-1/4 right-1/4 w-[80vw] h-[40vw] bg-cyan-900/20 rounded-full blur-[120px]"
                    />
                    {/* Bubbles */}
                    {STATIC_PARTICLES.slice(0, 20).map(p => (
                        <motion.div
                            key={p.id}
                            animate={{ y: ['100vh', '-10vh'], x: [0, Math.random() * 50 - 25, 0] }}
                            transition={{ duration: p.duration / 2, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
                            className="absolute w-2 h-2 border border-teal-500/30 rounded-full"
                            style={{ left: p.left, top: '100vh', opacity: p.opacity }}
                        />
                    ))}
                </div>
            )}

            {/* 3. STELLAR DUST */}
            {theme === 'stellar-dust' && (
                <div className="w-full h-full bg-[#030005]">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#030005] to-[#030005]"></div>
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0"
                    >
                        {STATIC_PARTICLES.map(p => (
                            <motion.div
                                key={p.id}
                                animate={{ scale: [1, 1.5, 1], opacity: [p.opacity, p.opacity * 2, p.opacity] }}
                                transition={{ duration: p.duration / 5, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
                                className="absolute bg-[#ffb8ff] rounded-full shadow-[0_0_15px_#ffb8ff]"
                                style={{ left: p.left, top: p.top, width: p.size * 1.5, height: p.size * 1.5 }}
                            />
                        ))}
                    </motion.div>
                </div>
            )}

            {/* 4. CRIMSON MOON */}
            {theme === 'crimson-moon' && (
                <div className="w-full h-full bg-[#110000]">
                    <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-red-900/30 rounded-full blur-[120px]"></div>
                    <motion.div 
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] bg-[radial-gradient(circle,_#ff0000_0%,_transparent_70%)] opacity-30 rounded-full blur-[60px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent"></div>
                    {/* Floating ash */}
                    {STATIC_PARTICLES.slice(0, 30).map(p => (
                        <motion.div
                            key={p.id}
                            animate={{ y: ['100vh', '-10vh'], x: [0, Math.random() * 100 - 50, 0] }}
                            transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
                            className="absolute bg-[#ff4444] rounded-sm blur-[1px]"
                            style={{ left: p.left, top: '100vh', width: p.size, height: p.size, opacity: p.opacity * 0.5 }}
                        />
                    ))}
                </div>
            )}

            {/* FALLBACK (if theme is unknown but type is animated) */}
            {type === 'animated' && !['matrix-rain', 'abyssal-ocean', 'stellar-dust', 'crimson-moon'].includes(theme) && (
                <div className="w-full h-full bg-[#08080f]">
                    <div className="absolute top-[15%] left-[15%] w-[300px] h-[300px] bg-rose-500/10 rounded-full blur-[80px]" />
                </div>
            )}

        </div>
    )
}

export default AnimatedBackground
