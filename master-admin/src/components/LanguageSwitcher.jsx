import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { FaGlobe } from 'react-icons/fa'

const LanguageSwitcher = ({ inline = false }) => {
    const { language, toggleLanguage } = useLanguage()

    return (
        <button
            onClick={toggleLanguage}
            className="glass-btn"
            style={{
                position: inline ? 'relative' : 'fixed',
                top: inline ? 'auto' : '20px',
                left: inline ? 'auto' : (language === 'ar' ? '20px' : 'auto'),
                right: inline ? 'auto' : (language === 'ar' ? 'auto' : '20px'),
                padding: inline ? '0.5rem 1rem' : '0.7rem 1.2rem',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontWeight: '900',
                fontSize: inline ? '0.75rem' : '0.85rem',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
            }}
        >
            <FaGlobe style={{ color: 'var(--accent-color)' }} />
            {language === 'ar' ? 'English' : 'العربية'}
        </button>
    )
}

export default LanguageSwitcher
