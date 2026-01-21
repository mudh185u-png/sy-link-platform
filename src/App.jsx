import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import { useState } from 'react'
import Home from './pages/Home'
import Landing from './pages/Landing'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import AdminLayout from './layouts/AdminLayout'
import AdminHome from './pages/AdminHome'
import AdminLinks from './pages/AdminLinks'
import AdminProfile from './pages/AdminProfile'
import AdminBackground from './pages/AdminBackground'
import Showcase from './pages/Showcase'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import LanguageSwitcher from './components/LanguageSwitcher'
import DynamicBackground from './components/DynamicBackground'

// Protected Route Helper
const ProtectedRoute = ({ children }) => {
  const { user, isSuspended, settings } = useAuth()
  const { t, language } = useLanguage()

  if (!user) return <Navigate to="/login" />

  if (isSuspended) return (
    <div style={{
      padding: '100px 20px',
      textAlign: 'center',
      direction: language === 'ar' ? 'rtl' : 'ltr',
      fontFamily: language === 'ar' ? 'Tajawal, sans-serif' : 'Inter, sans-serif'
    }}>
      <h1 style={{ color: '#ff2d55', fontSize: '2.5rem', marginBottom: '20px' }}>{t.accountSuspended}</h1>
      <p style={{ opacity: 0.7, fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 30px' }}>{t.suspensionNotice}</p>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a
          href={`mailto:${settings?.support_email || 'support@sy-links.com'}?subject=${encodeURIComponent(t.appealSubject + ': @' + (user?.user_metadata?.username || user?.email))}&body=${encodeURIComponent(
            t.emailGreeting + '\n\n' +
            (user?.user_metadata?.username ? '@' + user?.user_metadata?.username : user?.email) + '\n' +
            t.idLabel + ': ' + user?.id + '\n\n' +
            '-------------------\n' +
            (language === 'ar' ? 'اكتب مشكلتك هنا:' : 'Describe your problem here:')
          )}`}
          className="glass-btn"
          style={{ background: 'var(--accent-gradient)', border: 'none' }}
        >
          {t.contactSupport}
        </a>
        <a href="/" className="glass-btn" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {t.backToHome}
        </a>
      </div>
    </div>
  )
  return children
}

import { ThemeProvider } from './contexts/ThemeContext'

const AppContent = () => {
  const { settings, user } = useAuth()
  const { language } = useLanguage()
  const location = useLocation()
  const [promoDismissed, setPromoDismissed] = useState(() => sessionStorage.getItem('hasSeenPromo') === 'true')

  const isPromoActive = !promoDismissed && settings?.promo_announcement?.active && !!user

  const closePromo = () => {
    setPromoDismissed(true)
    sessionStorage.setItem('hasSeenPromo', 'true')
  }

  const isDisabled = settings?.disabled_pages?.some(page => {
    if (page === 'Showcase' && location.pathname.startsWith('/showcase/')) return true
    if (page === 'Discovery' && location.pathname === '/discovery') return true
    if (page === 'Trending' && location.pathname === '/trending') return true
    if (page === 'Marketplace' && location.pathname === '/marketplace') return true
    return false
  })

  const isPublicProfile = location.pathname !== '/' &&
    !['/login', '/signup', '/reset-password', '/admin', '/discovery', '/trending', '/marketplace'].some(p => location.pathname.startsWith(p));

  if (isDisabled && !user?.user_metadata?.is_master) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '20px',
        background: '#0a0a0a',
        color: '#fff',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚫</div>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '10px' }}>{language === 'ar' ? 'هذه الصفحة معطلة حالياً' : 'Page Temporarily Disabled'}</h1>
        <p style={{ opacity: 0.6, maxWidth: '500px' }}>
          {language === 'ar'
            ? 'نعتذر، لقد تم تعطيل هذه الصفحة مؤقتاً من قبل الإدارة.'
            : 'Sorry, this page has been temporarily disabled by the administration.'}
        </p>
        <Link to="/" className="glass-btn" style={{ marginTop: '20px' }}>{language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</Link>
      </div>
    )
  }

  if (settings?.maintenance_mode && !user?.user_metadata?.is_master && !isPublicProfile) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '20px',
        background: '#0a0a0a',
        color: '#fff',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚧</div>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '10px' }}>{language === 'ar' ? 'المنصة في وضع الصيانة' : 'Platform Under Maintenance'}</h1>
        <p style={{ opacity: 0.6, maxWidth: '500px' }}>
          {language === 'ar'
            ? 'نحن نقوم ببعض التحسينات. سنعود قريباً جداً!'
            : 'We are performing some scheduled maintenance. We will be back shortly!'}
        </p>
      </div>
    )
  }

  return (
    <>
      <DynamicBackground />

      {/* Promo Modal */}
      {isPromoActive && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          padding: '20px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '500px',
            position: 'relative',
            padding: '40px',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            overflow: 'hidden'
          }}>
            {/* Background Glow */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,45,85,0.1) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            <button
              onClick={closePromo}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
            >
              ×
            </button>

            {settings?.promo_announcement?.image_url && (
              <img
                src={settings.promo_announcement.image_url}
                alt="Promo"
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  marginBottom: '25px',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                }}
              />
            )}

            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: '900',
              marginBottom: '15px',
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {language === 'ar' ? 'إعلان هام' : 'Special Update'}
            </h2>

            <p style={{
              fontSize: '1.1rem',
              lineHeight: '1.6',
              opacity: 0.8,
              marginBottom: '30px'
            }}>
              {settings?.promo_announcement?.message}
            </p>

            <button
              onClick={closePromo}
              className="glass-btn"
              style={{
                width: '100%',
                background: 'var(--accent-gradient)',
                padding: '15px',
                fontWeight: '700',
                fontSize: '1rem',
                border: 'none'
              }}
            >
              {language === 'ar' ? 'فهمت' : 'Got it'}
            </button>
          </div>
        </div>
      )}

      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/showcase/:username" element={<Showcase />} />
          <Route path="/:username" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/dashboard" element={<Navigate to="/admin/home" replace />} />

          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/home" replace />} />
            <Route path="home" element={<AdminHome />} />
            <Route path="links" element={<AdminLinks />} />
            <Route path="background" element={<AdminBackground />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Routes>
      </div>
    </>
  )
}

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  )
}

export default App
