import { useLanguage } from '../contexts/LanguageContext'
import { FaGlobe } from 'react-icons/fa'

const AdminHeader = ({ title }) => {
    const { language, toggleLanguage } = useLanguage()
    const isRtl = language === 'ar'

    return (
        <nav className="fixed top-0 left-0 w-full h-[70px] z-[1001] bg-[#0a0a0f]/80 backdrop-blur-2xl backdrop-saturate-[1.8] border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] flex items-center justify-between px-6 transition-all duration-500">
            {/* Left Spacer */}
            <div className="flex-1 flex justify-start min-w-[100px]" />

            {/* Center: Title */}
            <div className="flex-[2] flex flex-col items-center text-center px-4 min-w-0">
                <span className="text-[10px] font-black tracking-[0.15em] text-rose-400 uppercase opacity-90 mb-0.5 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]">
                    {isRtl ? 'الإدارة' : 'MANAGEMENT'}
                </span>
                <h2 className="text-lg font-black text-white m-0 whitespace-nowrap overflow-hidden text-ellipsis drop-shadow-md">
                    {title}
                </h2>
            </div>

            {/* Right Action: Language */}
            <div className="flex-1 flex justify-end min-w-[100px]">
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-black hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-lg"
                >
                    <FaGlobe className="text-rose-400 text-sm drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]" />
                    {isRtl ? 'EN' : 'AR'}
                </button>
            </div>
        </nav>
    )
}

export default AdminHeader
