import { supabase } from '../lib/supabase'
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa'
import { useLanguage } from '../contexts/LanguageContext'
import { getLocalizedTitle } from '../constants/translations'

const LinkCard = ({ id, title, url, icon, theme }) => {
    const { language } = useLanguage()

    const handleClick = () => {
        if (id) {
            // --- SECURITY: Anti-Spam Click Tracking ---
            let visitorId = localStorage.getItem('visitor_id');
            if (!visitorId) {
                visitorId = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : Math.random().toString(36).substring(2);
                localStorage.setItem('visitor_id', visitorId);
            }

            const lastClickedKey = `clicked_${id}`;
            const lastClicked = localStorage.getItem(lastClickedKey);
            const now = Date.now();
            
            // Only send request if we haven't clicked this link in the last 10 minutes
            if (!lastClicked || (now - parseInt(lastClicked)) > 600000) {
                supabase.rpc('increment_link_clicks', { 
                    link_id: id,
                    visitor_hash: visitorId 
                }).then(() => { 
                    localStorage.setItem(lastClickedKey, now.toString());
                }).catch(err => console.error("Analytics Error:", err));
            }
            // ------------------------------------------
        }
    }

    const isArabic = language === 'ar'

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className={`group relative flex items-center justify-between w-full mb-5 p-2 ${isArabic ? 'pr-4 pl-2' : 'pl-4 pr-2'} backdrop-blur-xl transition-all ease-out overflow-hidden ${theme?.link?.wrapper || 'bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-full shadow-lg'}`}
            style={{ textDecoration: 'none' }}
        >
            {/* Subtle inner glow on hover */}
            <div className={`absolute inset-0 bg-gradient-to-r ${isArabic ? 'from-transparent via-white/5 to-transparent translate-x-full group-hover:-translate-x-full' : 'from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full'} transition-transform duration-1000 ease-in-out`} />

            {isArabic ? (
                /* ARABIC LAYOUT: [ChevronLeft] [TITLE] [ICON] */
                <>
                    <div className={`flex justify-center items-center w-10 transition-colors duration-300 ${theme?.link?.platformIcon || 'text-white/50 group-hover:text-white'}`}>
                        <FaChevronLeft className="transform group-hover:-translate-x-1 transition-transform" />
                    </div>

                    <span className={`flex-1 text-center transition-all duration-300 z-10 ${theme?.link?.title || 'font-black text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-rose-200'}`} style={{ fontFamily: "'Tajawal', sans-serif" }}>
                        {getLocalizedTitle(title, language)}
                    </span>

                    <div className={`link-icon-circle flex-shrink-0 flex items-center justify-center w-12 h-12 border shadow-inner transition-all duration-300 z-10 ${theme?.iconStyle || 'rounded-full bg-white/10 border-white/20'} ${theme?.link?.icon || 'text-white group-hover:bg-white group-hover:text-black group-hover:border-white'}`}>
                        {icon}
                    </div>
                </>
            ) : (
                /* ENGLISH LAYOUT: [ICON] [TITLE] [ChevronRight] */
                <>
                    <div className={`link-icon-circle flex-shrink-0 flex items-center justify-center w-12 h-12 border shadow-inner transition-all duration-300 z-10 ${theme?.iconStyle || 'rounded-full bg-white/10 border-white/20'} ${theme?.link?.icon || 'text-white group-hover:bg-white group-hover:text-black group-hover:border-white'}`}>
                        {icon}
                    </div>

                    <span className={`flex-1 text-center transition-all duration-300 z-10 ${theme?.link?.title || 'font-black text-lg tracking-wider text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-rose-200'}`} style={{ fontFamily: theme?.font || "'Outfit', sans-serif" }}>
                        {getLocalizedTitle(title, language)}
                    </span>

                    <div className={`flex justify-center items-center w-10 transition-colors duration-300 ${theme?.link?.platformIcon || 'text-white/50 group-hover:text-white'}`}>
                        <FaChevronRight className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                </>
            )}
        </a>
    )
}

export default LinkCard
