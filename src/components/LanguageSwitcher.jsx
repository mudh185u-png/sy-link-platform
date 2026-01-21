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
                padding: inline ? '6px 10px' : '0.7rem 1.2rem',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontWeight: '850',
                fontSize: inline ? '0.7rem' : '0.85rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                borderRadius: '10px',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                minWidth: inline ? '85px' : 'auto'
            }}
        >
            <FaGlobe style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }} />
            {language === 'ar' ? 'EN' : 'AR'}
        </button>
    )
}

export default LanguageSwitcher
