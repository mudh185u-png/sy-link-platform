import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { FaGlobe, FaChevronLeft } from 'react-icons/fa'

const AdminHeader = ({ title }) => {
    const { language, toggleLanguage } = useLanguage()
    const { settings } = useTheme()

    const isSyria = settings?.selected_skin === 'syria';

    const getStyle = (key, fallback) => {
        if (isSyria && key === 'background_color') return 'linear-gradient(90deg, #000 0%, #007A3D 100%)';
        if (isSyria && key === 'backdrop_blur') return '20px';

        return settings?.styles?.['admin_header']?.[key] !== undefined
            ? settings.styles['admin_header'][key]
            : fallback
    }

    return (
        <nav
            data-editable-id="admin_header"
            data-editable-type="container"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: getStyle('width', '100%'),
                height: getStyle('height', '65px'),
                background: getStyle('background_color', 'rgba(255,255,255,0.01)'),
                backdropFilter: `blur(${getStyle('backdrop_blur', '30px')}) saturate(180%)`,
                WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                borderBottom: isSyria ? '2px solid #E4312b' : '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 2rem',
                zIndex: 1001,
                boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
                transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                boxSizing: 'border-box'
            }}>

            {/* Left Spacer to balance centering */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', minWidth: '100px' }}>
                {/* Back button removed as requested */}
            </div>

            {/* Center: Title */}
            <div style={{
                flex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '0 1rem',
                minWidth: 0
            }}>
                <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '900',
                    letterSpacing: '1.5px',
                    color: 'var(--accent-color)',
                    textTransform: 'uppercase',
                    opacity: 0.8,
                    marginBottom: '2px'
                }}>
                    {language === 'ar' ? 'الإدارة' : 'MANAGEMENT'}
                </span>
                <h2 style={{
                    fontSize: '1.2rem',
                    fontWeight: '800',
                    color: '#fff',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {title}
                </h2>
            </div>

            {/* Right Action: Language */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', minWidth: '100px' }}>
                <button
                    onClick={toggleLanguage}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        padding: '10px 18px',
                        borderRadius: '14px',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                >
                    <FaGlobe style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }} />
                    {language === 'ar' ? 'EN' : 'AR'}
                </button>
            </div>
        </nav>
    )
}

export default AdminHeader
