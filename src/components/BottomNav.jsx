import React from 'react'
import { NavLink } from 'react-router-dom'
import { FaHome, FaLink, FaUser, FaPalette } from 'react-icons/fa'
import { useLanguage } from '../contexts/LanguageContext'
import { motion } from 'framer-motion'

const BottomNav = () => {
    const { t, language } = useLanguage()
    const isRtl = language === 'ar'

    const navItems = [
        { icon: <FaHome />, label: t.home, path: '/admin/home' },
        { icon: <FaLink />, label: t.links, path: '/admin/links' },
        { icon: <FaPalette />, label: t.appearance, path: '/admin/background' },
        { icon: <FaUser />, label: t.profile, path: '/admin/profile' },
    ]

    return (
        <nav className={`
            fixed z-[1000] flex items-center justify-evenly
            glass-panel
            /* Mobile styles */
            bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] h-[70px] rounded-[35px] max-w-md px-2
            /* Desktop styles */
            md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:-translate-x-0
            ${isRtl ? 'md:right-6' : 'md:left-6'}
            md:w-[80px] md:h-auto md:max-h-[80vh] md:flex-col md:py-8 md:gap-8 md:rounded-[40px]
            shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]
            bg-[#0f0f0f]/65 backdrop-blur-2xl backdrop-saturate-[1.8] border border-white/10
        `}>
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                        relative flex flex-col items-center justify-center transition-all duration-500
                        ${isActive ? 'text-rose-400' : 'text-white/40 hover:text-white/70'}
                        w-[60px] h-[60px] md:w-[60px] md:h-[60px]
                    `}
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <motion.div 
                                    layoutId="nav-indicator"
                                    className={`
                                        absolute bg-gradient-to-r from-rose-500 to-purple-600 rounded-full shadow-[0_0_10px_#f43f5e]
                                        /* Mobile indicator */
                                        top-0 w-[30px] h-[4px]
                                        /* Desktop indicator */
                                        md:top-auto md:left-0 md:w-[4px] md:h-[30px] md:top-1/2 md:-translate-y-1/2
                                        ${isRtl ? 'md:left-auto md:right-0' : ''}
                                    `}
                                />
                            )}
                            <span className={`
                                transition-all duration-300 flex items-center justify-center
                                ${isActive ? 'text-2xl md:text-3xl drop-shadow-[0_0_8px_rgba(244,63,94,0.4)] md:-translate-y-2' : 'text-xl md:text-2xl'}
                            `}>
                                {item.icon}
                            </span>
                            <span className={`
                                text-[10px] md:text-xs font-black transition-all duration-300 absolute
                                ${isActive ? 'opacity-100 bottom-1 md:-bottom-2' : 'opacity-0 translate-y-2'}
                            `}>
                                {item.label}
                            </span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    )
}

export default BottomNav

