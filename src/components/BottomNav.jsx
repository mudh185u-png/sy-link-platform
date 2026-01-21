import React from 'react'
import { NavLink } from 'react-router-dom'
import { FaHome, FaLink, FaUser, FaPalette, FaUserShield } from 'react-icons/fa'
import { useLanguage } from '../contexts/LanguageContext'

const BottomNav = () => {
    const { t } = useLanguage()

    const navItems = [
        { icon: <FaHome />, label: t.home, path: '/admin/home' },
        { icon: <FaLink />, label: t.links, path: '/admin/links' },
        { icon: <FaPalette />, label: t.appearance, path: '/admin/background' },
        { icon: <FaUser />, label: t.profile, path: '/admin/profile' },
    ]

    return (
        <nav style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 2.5rem)', // Horizontal breathing room
            maxWidth: '440px',
            height: '75px',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '0 1rem',
            zIndex: 1000,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        }}>
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                    style={({ isActive }) => ({
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        color: isActive ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.6)',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        gap: '4px',
                        transition: 'all 0.3s ease'
                    })}
                >
                    <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                    <span style={{ fontWeight: 'bold' }}>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    )
}

export default BottomNav
