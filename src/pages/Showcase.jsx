import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import Profile from '../components/Profile'
import { FaPlay, FaChevronDown } from 'react-icons/fa'

const Showcase = () => {
    const { username } = useParams()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [started, setStarted] = useState(false)
    const [bgElements, setBgElements] = useState([])

    useEffect(() => {
        // Pre-calculate random values in useEffect to maintain purity
        const elements = [...Array(20)].map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            duration: Math.random() * 10 + 5,
            delay: Math.random() * 5,
            offsetX: Math.random() * 200 - 100,
            isGold: i % 2 === 0
        }));
        setBgElements(elements);
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', username)
                .single()
            setProfile(data)
            setLoading(false)
        }
        fetchProfile()
    }, [username])

    if (loading) return null

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            background: '#000',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <AnimatePresence>
                {!started ? (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
                        style={{ textAlign: 'center', zIndex: 100 }}
                    >
                        <motion.h1
                            initial={{ y: 20 }}
                            animate={{ y: 0 }}
                            style={{ fontSize: '4rem', fontWeight: '900', color: '#fff', marginBottom: '2rem', letterSpacing: '10px' }}
                        >
                            SY LINK
                        </motion.h1>
                        <button
                            onClick={() => setStarted(true)}
                            className="glass-btn"
                            style={{ padding: '20px 50px', fontSize: '1.2rem', background: 'var(--accent-gradient)', border: 'none' }}
                        >
                            <FaPlay style={{ marginInlineEnd: '10px' }} /> EXPLORE IDENTITY
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ width: '100%', maxWidth: '500px', zIndex: 10 }}
                    >
                        <Profile profileData={profile} skin={profile?.active_skin || 'luxury'} />

                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            style={{ textAlign: 'center', marginTop: '3rem' }}
                        >
                            <p style={{ opacity: 0.5, letterSpacing: '2px', marginBottom: '1rem' }}>SCROLL TO CONNECT</p>
                            <FaChevronDown style={{ animation: 'bounce 2s infinite', opacity: 0.7 }} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ARTISTIC BACKGROUND ELEMENTS */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                {bgElements.map((el) => (
                    <motion.div
                        key={el.id}
                        animate={{
                            y: [0, -1000],
                            x: [0, el.offsetX],
                            rotate: [0, 360],
                            opacity: [0, 0.3, 0]
                        }}
                        transition={{
                            duration: el.duration,
                            repeat: Infinity,
                            delay: el.delay
                        }}
                        style={{
                            position: 'absolute',
                            bottom: '-10%',
                            left: el.left,
                            width: '40px',
                            height: '40px',
                            background: el.isGold ? 'rgba(218, 165, 32, 0.1)' : 'rgba(0, 242, 255, 0.1)',
                            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                            filter: 'blur(2px)'
                        }}
                    />
                ))}
            </div>

            <style>{`
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-10px); }
                    60% { transform: translateY(-5px); }
                }
            `}</style>
        </div>
    )
}

export default Showcase
