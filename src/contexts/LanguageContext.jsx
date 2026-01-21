import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../constants/translations'

const LanguageContext = createContext()

export const useLanguage = () => useContext(LanguageContext)

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('ar')

    useEffect(() => {
        document.body.style.direction = language === 'ar' ? 'rtl' : 'ltr'
        document.body.style.fontFamily = language === 'ar' ? "'Cairo', sans-serif" : "'Inter', sans-serif"
    }, [language])

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'ar' ? 'en' : 'ar')
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t: translations[language] }}>
            {children}
        </LanguageContext.Provider>
    )
}
