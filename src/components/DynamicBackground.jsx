import React, { useEffect, useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const DynamicBackground = () => {
    const location = useLocation()
    const [platformBgs, setPlatformBgs] = useState(null)

    useEffect(() => {
        const fetchConfigs = async () => {
            const { data } = await supabase
                .from('platform_settings')
                .select('*')
                .eq('key', 'page_backgrounds')
                .single()

            if (data?.value) {
                try {
                    const bgs = JSON.parse(data.value)
                    setPlatformBgs(bgs)
                } catch (e) {
                    console.error('Failed to parse platform backgrounds', e)
                }
            }
        }
        fetchConfigs()
    }, [])

    const config = useMemo(() => {
        if (!platformBgs) return null

        let pageKey = 'global'
        const path = location.pathname

        // Check if it's a public profile page
        const isPublicProfile = path !== '/' &&
            path !== '/login' &&
            path !== '/signup' &&
            !path.startsWith('/admin/') &&
            !path.startsWith('/dashboard');

        if (isPublicProfile) return null;

        if (path === '/') pageKey = 'landing'
        else if (path === '/login' || path === '/signup') pageKey = 'login'
        else if (path.startsWith('/admin/home')) pageKey = 'dashboard'
        else if (path.startsWith('/admin/links')) pageKey = 'links'
        else if (path.startsWith('/admin/profile')) pageKey = 'profile'
        else if (path.startsWith('/admin/background')) pageKey = 'appearance'

        const pageConfig = platformBgs[pageKey];
        if (pageKey !== 'global' && pageConfig?.use_global) {
            return platformBgs['global'];
        }

        return pageConfig || platformBgs['global']
    }, [location.pathname, platformBgs])

    if (!config) return null

    const renderBackground = () => {
        switch (config.type) {
            case 'cosmic':
                return (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: -1,
                        background: '#04040a',
                        overflow: 'hidden'
                    }}>
                        {/* 0. SVG Noise & Goo Filters */}
                        <svg style={{ position: 'fixed', width: 0, height: 0, pointerEvents: 'none' }}>
                            <filter id="cosmic-grain">
                                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                                <feColorMatrix type="saturate" values="0" />
                            </filter>
                            <filter id="cosmic-goo">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
                                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
                            </filter>
                        </svg>

                        {/* 1. Deep Core Layer */}
                        <div style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            background: `radial-gradient(circle at 50% 10%, ${config.value || '#ff2d55'}33 0%, #04040a 70%)`
                        }} />

                        {/* 2. Liquid Silk Blobs */}
                        <div style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            filter: 'url(#cosmic-goo)',
                            opacity: 0.8
                        }}>
                            <div style={{
                                position: 'absolute',
                                width: '130vw',
                                height: '130vw',
                                top: '-30%',
                                left: '-15%',
                                background: `conic-gradient(from 180deg at 50% 50%, #000 0deg, ${config.value || '#ff2d55'}aa 90deg, #4e54c8aa 180deg, #00d2ffaa 270deg, #000 360deg)`,
                                animation: 'cosmicRotate 70s linear infinite',
                                opacity: 0.4
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '90vw',
                                height: '90vw',
                                bottom: '-10%',
                                right: '-15%',
                                background: `radial-gradient(circle, ${config.value || '#ff2d55'}cc 0%, transparent 70%)`,
                                animation: 'cosmicFloat 45s infinite ease-in-out',
                                opacity: 0.3
                            }} />
                        </div>

                        {/* 3. Grain Overlay */}
                        <div style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            filter: 'url(#cosmic-grain)',
                            opacity: 0.15,
                            pointerEvents: 'none',
                            mixBlendMode: 'soft-light'
                        }} />

                        {/* 4. Refined Glass Layer */}
                        <div style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
                            backdropFilter: 'blur(50px)',
                            WebkitBackdropFilter: 'blur(50px)'
                        }} />

                        <style>{`
                            @keyframes cosmicRotate {
                                from { transform: rotate(0deg); }
                                to { transform: rotate(360deg); }
                            }
                            @keyframes cosmicFloat {
                                0%, 100% { transform: translate(0, 0) scale(1); }
                                50% { transform: translate(-8%, -5%) scale(1.05); }
                            }
                        `}</style>
                    </div>
                )
            case 'brand':
                return (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: -1,
                        background: '#04040a',
                        overflow: 'hidden'
                    }}>
                        {/* THE NANO-BANANA IRIDESCENT CORE */}
                        <div style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            filter: 'blur(60px) contrast(1.2)',
                            opacity: 0.8
                        }}>
                            <div style={{
                                position: 'absolute',
                                width: '80vw',
                                height: '80vw',
                                borderRadius: '50%',
                                background: `radial-gradient(circle, ${config.value || '#ff2d55'} 0%, #4e54c8 50%, #00d2ff 100%)`,
                                top: '-20%',
                                left: '-10%',
                                animation: 'nano-move-1 30s infinite alternate ease-in-out',
                                mixBlendMode: 'screen'
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '70vw',
                                height: '70vw',
                                borderRadius: '50%',
                                background: `radial-gradient(circle, #ff00cc 0%, ${config.value || '#ff2d55'} 50%, #ffcc00 100%)`,
                                bottom: '-20%',
                                right: '-10%',
                                animation: 'nano-move-2 35s infinite alternate ease-in-out',
                                mixBlendMode: 'color-dodge'
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '60vw',
                                height: '60vw',
                                borderRadius: '50%',
                                background: `radial-gradient(circle, #00ffcc 0%, #00ccff 50%, #cc00ff 100%)`,
                                top: '20%',
                                left: '30%',
                                animation: 'nano-move-3 25s infinite alternate ease-in-out',
                                mixBlendMode: 'plus-lighter'
                            }} />
                        </div>

                        {/* GLASS TEXTURE OVERLAY */}
                        <div style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            background: 'rgba(255,255,255,0.03)',
                            backdropFilter: 'blur(20px)',
                            backgroundImage: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.4) 100%)'
                        }} />

                        {/* PRISM REFLECTIONS */}
                        <div style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.05) 45%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 55%, transparent 60%)',
                            backgroundSize: '300% 300%',
                            animation: 'prism-shimmer 15s linear infinite',
                            pointerEvents: 'none'
                        }} />

                        <style>{`
                            @keyframes nano-move-1 {
                                0% { transform: translate(0, 0) scale(1) rotate(0deg); }
                                100% { transform: translate(15vw, 10vh) scale(1.2) rotate(120deg); }
                            }
                            @keyframes nano-move-2 {
                                0% { transform: translate(0, 0) scale(1.1) rotate(0deg); }
                                100% { transform: translate(-20vw, -15vh) scale(0.8) rotate(-90deg); }
                            }
                            @keyframes nano-move-3 {
                                0% { transform: translate(0, 0) scale(1) rotate(0deg); }
                                100% { transform: translate(-10vw, 20vh) scale(1.4) rotate(45deg); }
                            }
                            @keyframes prism-shimmer {
                                0% { background-position: 0% 0%; }
                                100% { background-position: 100% 100%; }
                            }
                        `}</style>
                    </div>
                )
            case 'animated':
                return (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: -1,
                        background: `linear-gradient(45deg, ${config.value || '#ff2d55'}, #000)`,
                        overflow: 'hidden'
                    }}>
                        <div className="bg-animation" style={{
                            position: 'absolute',
                            width: '200%',
                            height: '200%',
                            top: '-50%',
                            left: '-50%',
                            background: `radial-gradient(circle, ${config.value || '#ff2d55'}22 0%, transparent 70%)`,
                            animation: 'rotateBg 20s linear infinite'
                        }}></div>
                        <style>{`
                            @keyframes rotateBg {
                                from { transform: rotate(0deg); }
                                to { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                )
            case 'gradient':
                return (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: -1,
                        background: config.value || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }} />
                )
            case 'solid':
                return (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: -1,
                        backgroundColor: config.value || '#000'
                    }} />
                )
            case 'image':
                return (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: -1,
                        backgroundImage: `url(${config.value})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }} />
                )
            case 'animated-image':
                return (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: -1,
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url(${config.value})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            animation: 'kenBurns 40s ease infinite alternate'
                        }} />
                        <style>{`
                            @keyframes kenBurns {
                                0% { transform: scale(1) translate(0, 0); }
                                100% { transform: scale(1.2) translate(-2%, -2%); }
                            }
                        `}</style>
                    </div>
                )
            case 'video':
                return (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: -1,
                        overflow: 'hidden'
                    }}>
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        >
                            <source src={config.value} type="video/mp4" />
                        </video>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'rgba(0,0,0,0.4)'
                        }} />
                    </div>
                )
            default:
                return null
        }
    }

    return renderBackground()
}

export default DynamicBackground
