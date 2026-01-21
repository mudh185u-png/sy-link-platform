import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { FaBolt, FaArrowRight, FaGoogle, FaEnvelope, FaLock, FaUser, FaChevronLeft, FaExclamationTriangle } from 'react-icons/fa'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
    const [isSignUp, setIsSignUp] = useState(false)
    const [isForgot, setIsForgot] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()
    const { t, language } = useLanguage()
    const { settings } = useAuth()

    React.useEffect(() => {
        if (location.pathname === '/signup' || location.state?.mode === 'signup') {
            setIsSignUp(true)
            setIsForgot(false)
        } else if (location.state?.mode === 'login') {
            setIsSignUp(false)
            setIsForgot(false)
        }
    }, [location.state, location.pathname])

    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            if (isForgot) {
                setMessage(t.resetSent || 'Check your email for the reset link!')
            } else if (isSignUp) {
                if (!settings?.registration_enabled) {
                    throw new Error(language === 'ar' ? 'التسجيل معطل حالياً من قبل الإدارة.' : 'Registration is currently disabled by the administration.')
                }
                if (username.length < 3) throw new Error('Username must be at least 3 characters')
                const { data, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { username: username } }
                })
                if (authError) throw authError
                if (data.user) {
                    alert(t.signupSuccess || 'Account created! You can now log in.')
                    setIsSignUp(false)
                    setEmail('')
                    setPassword('')
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
                navigate('/admin/home')
            }
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            background: '#05050c',
            color: '#fff',
            fontFamily: language === 'ar' ? 'Tajawal, sans-serif' : 'Outfit, sans-serif',
            direction: language === 'ar' ? 'rtl' : 'ltr',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '60px 20px'
        }}>
            {/* Background Glows */}
            <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'var(--accent-color)', filter: 'blur(150px)', opacity: 0.1, pointerEvents: 'none' }}></div>

            <div style={{ position: 'absolute', top: '20px', right: language === 'ar' ? 'auto' : '20px', left: language === 'ar' ? '20px' : 'auto', display: 'flex', gap: '20px', alignItems: 'center', zIndex: 10 }}>
                <LanguageSwitcher inline />
                <Link to="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
                    {language === 'ar' ? 'الصفحة الرئيسية' : 'Home'}
                </Link>
            </div>

            <div style={{
                maxWidth: '450px',
                width: '100%',
                margin: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '30px',
                position: 'relative',
                zIndex: 2
            }}>
                {/* BRANDING SECTION */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '75px', height: '75px', borderRadius: '22px', background: 'var(--accent-gradient)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                        boxShadow: '0 10px 30px rgba(255,45,85,0.3)',
                        animation: 'float 3s ease-in-out infinite'
                    }}>
                        <FaBolt size={38} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '12px', letterSpacing: '-1.5px', background: 'linear-gradient(to bottom, #fff, rgba(255,255,255,0.7))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SY Link</h1>
                    <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: '350px', margin: '0 auto' }}>
                        {language === 'ar'
                            ? 'انضم إلى مجتمع المبدعين وشارك عالمك برابط واحد احترافي.'
                            : 'Join the community of creators and share your world with one professional link.'}
                    </p>
                </div>

                {/* AUTH CARD */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    padding: '40px 30px',
                    borderRadius: '28px',
                    border: '1px solid rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(15px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '15px' }}>
                        {isForgot && (
                            <button onClick={() => setIsForgot(false)} style={{
                                position: 'absolute', [language === 'ar' ? 'right' : 'left']: '0', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '10px'
                            }}>
                                <FaChevronLeft style={{ transform: language === 'ar' ? 'rotate(180deg)' : 'none' }} />
                            </button>
                        )}
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
                            {isForgot ? (language === 'ar' ? 'استعادة كلمة المرور' : 'Reset Password') : (isSignUp ? (t.signupTitle || 'Create Account') : (t.loginTitle || 'Welcome Back'))}
                        </h2>
                    </div>

                    <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '35px', textAlign: 'center', fontSize: '0.9rem' }}>
                        {isForgot
                            ? (language === 'ar' ? 'أدخل بريدك الإلكتروني لإرسال الرابط.' : 'Enter your email to receive a reset link.')
                            : (isSignUp
                                ? (language === 'ar' ? 'ابدأ رحلتك معنا في ثوانٍ.' : 'Start your journey with us in seconds.')
                                : (language === 'ar' ? 'أهلاً بك مجدداً! سجل دخولك للمتابعة.' : 'Welcome back! Log in to continue.'))}
                    </p>

                    {error && <div style={{
                        background: 'rgba(255,50,50,0.1)', color: '#ff4d4d', padding: '15px', borderRadius: '12px',
                        marginBottom: '20px', border: '1px solid rgba(255,77,77,0.2)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                        <FaBolt size={14} /> {error}
                    </div>}

                    {message && <div style={{
                        background: 'rgba(74,222,128,0.1)', color: '#4ade80', padding: '15px', borderRadius: '12px',
                        marginBottom: '20px', border: '1px solid rgba(74,222,128,0.2)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                        <FaBolt size={14} /> {message}
                    </div>}

                    {isSignUp && !settings?.registration_enabled && (
                        <div style={{
                            background: 'rgba(255,165,0,0.1)', color: '#ffa500', padding: '15px', borderRadius: '12px',
                            marginBottom: '20px', border: '1px solid rgba(255,165,0,0.2)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px'
                        }}>
                            <FaExclamationTriangle size={14} />
                            {language === 'ar'
                                ? 'نعتذر، التسجيل مغلق حالياً.'
                                : 'Sorry, registration is currently closed.'}
                        </div>
                    )}

                    <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {!isForgot && isSignUp && (
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginLeft: language === 'ar' ? '5px' : '0' }}>
                                    {t.usernamePlaceholder}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FaUser style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [language === 'ar' ? 'right' : 'left']: '16px', color: 'rgba(255,255,255,0.2)' }} />
                                    <input
                                        type="text"
                                        placeholder="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        style={{
                                            width: '100%', padding: '14px 48px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem',
                                            outline: 'none', transition: 'all 0.3s ease'
                                        }}
                                        required={!isForgot && isSignUp}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: '700', color: 'rgba(255,255,255,0.6)' }}>
                                {t.emailPlaceholder}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <FaEnvelope style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [language === 'ar' ? 'right' : 'left']: '16px', color: 'rgba(255,255,255,0.2)' }} />
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%', padding: '14px 48px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem',
                                        outline: 'none', transition: 'all 0.3s ease'
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        {!isForgot && (
                            <div className="input-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'rgba(255,255,255,0.6)' }}>
                                        {t.passwordPlaceholder}
                                    </label>
                                    {!isSignUp && (
                                        <button type="button" onClick={() => setIsForgot(true)} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>
                                            {t.forgotPassword || 'Forgot Password?'}
                                        </button>
                                    )}
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <FaLock style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [language === 'ar' ? 'right' : 'left']: '16px', color: 'rgba(255,255,255,0.2)' }} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{
                                            width: '100%', padding: '14px 48px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem',
                                            outline: 'none', transition: 'all 0.3s ease'
                                        }}
                                        required={!isForgot}
                                    />
                                </div>
                            </div>
                        )}

                        <button type="submit" disabled={loading || (isSignUp && !settings?.registration_enabled)} style={{
                            padding: '16px', background: isSignUp && !settings?.registration_enabled ? 'rgba(255,255,255,0.05)' : 'var(--accent-gradient)', border: 'none', borderRadius: '14px',
                            color: isSignUp && !settings?.registration_enabled ? 'rgba(255,255,255,0.2)' : '#fff', fontWeight: '800', fontSize: '1.1rem', cursor: isSignUp && !settings?.registration_enabled ? 'not-allowed' : 'pointer', marginTop: '10px',
                            boxShadow: isSignUp && !settings?.registration_enabled ? 'none' : '0 10px 30px rgba(255,45,85,0.3)', transition: 'all 0.3s ease'
                        }}>
                            {loading ? '...' : (isForgot ? (t.resetPasswordBtn || 'Send Reset Link') : (isSignUp ? (t.signupBtn || 'Create Account') : (t.loginBtn || 'Sign In')))}
                        </button>
                    </form>

                    {!isForgot && (
                        <div style={{ marginTop: '30px', textAlign: 'center' }}>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem' }}>
                                {isSignUp ? (t.hasAccount || 'Already have an account?') : (t.noAccount || 'Don\'t have an account?')}
                                <button onClick={() => setIsSignUp(!isSignUp)} style={{
                                    background: 'none', border: 'none', color: 'var(--accent-color)', fontWeight: '800',
                                    marginLeft: '8px', marginRight: '8px', cursor: 'pointer', fontSize: '0.95rem',
                                    textDecoration: 'underline'
                                }}>
                                    {isSignUp ? (t.switchLogin || 'Log In') : (t.switchSignup || 'Sign Up')}
                                </button>
                            </p>
                        </div>
                    )}

                    {isForgot && (
                        <div style={{ marginTop: '30px', textAlign: 'center' }}>
                            <button onClick={() => setIsForgot(false)} style={{
                                background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold',
                                cursor: 'pointer', fontSize: '0.9rem'
                            }}>
                                {t.backToLogin || 'Back to Login'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                input:focus { border-color: var(--accent-color) !important; background: rgba(255,255,255,0.08) !important; }
            `}</style>
        </div>
    )
}

export default Login
