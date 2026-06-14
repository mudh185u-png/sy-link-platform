import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { FaBolt, FaEnvelope, FaLock, FaUser, FaChevronLeft, FaExclamationTriangle, FaHome } from 'react-icons/fa'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useAuth } from '../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const Login = () => {
    const [isSignUp, setIsSignUp] = useState(false)
    const [isForgot, setIsForgot] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [honeypot, setHoneypot] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()
    const { t, language } = useLanguage()
    const { settings } = useAuth()

    useEffect(() => {
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
            // --- SECURITY: Bot Honeypot ---
            // If the invisible honeypot field is filled out, silently reject it 
            // by returning early, simulating a successful or ignored request.
            if (honeypot) {
                setLoading(false);
                return;
            }
            // ------------------------------

            if (isForgot) {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                })
                if (error) throw error
                setMessage(t.resetSent || 'Check your email for the reset link!')
            } else if (isSignUp) {
                if (!settings?.registration_enabled) {
                    throw new Error(language === 'ar' ? 'التسجيل معطل حالياً من قبل الإدارة.' : 'Registration is currently disabled by the administration.')
                }
                if (username.length < 3) throw new Error(language === 'ar' ? 'يجب أن يكون اسم المستخدم 3 أحرف على الأقل' : 'Username must be at least 3 characters')
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

    const isRtl = language === 'ar'

    const containerVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <div className={`min-h-screen w-full bg-[#030308] text-white overflow-hidden flex flex-col items-center justify-center relative ${isRtl ? 'rtl' : 'ltr'}`} style={{ fontFamily: isRtl ? 'Tajawal, sans-serif' : 'Outfit, sans-serif' }}>
            
            {/* Background Blobs (Static to prevent mobile frame drops) */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/15 blur-[100px] transform translate-z-0" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-rose-600/10 blur-[100px] transform translate-z-0" />
            </div>

            {/* Top Navigation */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
                <LanguageSwitcher inline />
                <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-semibold">
                    {isRtl ? 'الرئيسية' : 'Home'} <FaHome />
                </Link>
            </div>

            <div className="w-full max-w-md px-6 relative z-10">
                {/* Logo & Title */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-10"
                >
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/30 mb-6">
                        <FaBolt size={36} color="#fff" />
                    </div>
                    <h1 className="text-4xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight">
                        SY Link
                    </h1>
                    <p className="text-white/50 text-sm md:text-base">
                        {isRtl 
                            ? 'بوابتك لعالم رقمي منظم واحترافي.' 
                            : 'Your gateway to a professional digital world.'}
                    </p>
                </motion.div>

                {/* Main Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isForgot ? 'forgot' : isSignUp ? 'signup' : 'login'}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="glass-panel p-8 relative overflow-hidden"
                    >
                        <div className="flex items-center justify-center relative mb-8">
                            {isForgot && (
                                <button 
                                    onClick={() => setIsForgot(false)} 
                                    className={`absolute ${isRtl ? 'right-0' : 'left-0'} text-white/40 hover:text-white transition-colors p-2`}
                                >
                                    <FaChevronLeft className={isRtl ? 'rotate-180' : ''} />
                                </button>
                            )}
                            <h2 className="text-2xl font-bold text-center">
                                {isForgot 
                                    ? (isRtl ? 'استعادة كلمة المرور' : 'Reset Password') 
                                    : (isSignUp ? (t.signupTitle || 'Create Account') : (t.loginTitle || 'Welcome Back'))}
                            </h2>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
                                <FaExclamationTriangle className="mt-1 flex-shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {message && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3">
                                <FaBolt className="mt-1 flex-shrink-0" />
                                <span>{message}</span>
                            </motion.div>
                        )}

                        {isSignUp && !settings?.registration_enabled && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm flex items-start gap-3">
                                <FaExclamationTriangle className="mt-1 flex-shrink-0" />
                                <span>{isRtl ? 'نعتذر، التسجيل مغلق حالياً.' : 'Sorry, registration is currently closed.'}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleAuth} className="space-y-5">
                            {!isForgot && isSignUp && (
                                <motion.div variants={itemVariants}>
                                    <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">{t.usernamePlaceholder || 'Username'}</label>
                                    <div className="relative group">
                                        <FaUser className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'} text-white/30 group-focus-within:text-rose-400 transition-colors`} />
                                        <input
                                            type="text"
                                            placeholder="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white placeholder:text-white/20 focus:outline-none focus:border-rose-500/50 focus:bg-white/10 transition-all`}
                                            required={!isForgot && isSignUp}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            <motion.div variants={itemVariants}>
                                <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">{t.emailPlaceholder || 'Email Address'}</label>
                                <div className="relative group">
                                    <FaEnvelope className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'} text-white/30 group-focus-within:text-rose-400 transition-colors`} />
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white placeholder:text-white/20 focus:outline-none focus:border-rose-500/50 focus:bg-white/10 transition-all`}
                                        required
                                    />
                                </div>
                            </motion.div>

                            {!isForgot && (
                                <motion.div variants={itemVariants}>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-white/50 uppercase tracking-wider">{t.passwordPlaceholder || 'Password'}</label>
                                        {!isSignUp && (
                                            <button type="button" onClick={() => setIsForgot(true)} className="text-xs text-rose-400 font-bold hover:text-rose-300 transition-colors">
                                                {t.forgotPassword || 'Forgot Password?'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <FaLock className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'} text-white/30 group-focus-within:text-rose-400 transition-colors`} />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white placeholder:text-white/20 focus:outline-none focus:border-rose-500/50 focus:bg-white/10 transition-all`}
                                            required={!isForgot}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* --- SECURITY: Invisible Honeypot Field --- */}
                            <input 
                                type="text" 
                                name="website" 
                                value={honeypot} 
                                onChange={(e) => setHoneypot(e.target.value)} 
                                style={{ display: 'none' }} 
                                tabIndex="-1" 
                                autoComplete="off" 
                            />
                            {/* ------------------------------------------ */}

                            <motion.div variants={itemVariants} className="pt-2">
                                <button 
                                    type="submit" 
                                    disabled={loading || (isSignUp && !settings?.registration_enabled)} 
                                    className={`w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all shadow-lg
                                        ${isSignUp && !settings?.registration_enabled 
                                            ? 'bg-white/5 text-white/20 cursor-not-allowed shadow-none' 
                                            : 'bg-gradient-to-r from-rose-500 to-purple-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-rose-500/25'
                                        }`}
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        isForgot ? (t.resetPasswordBtn || 'Send Reset Link') : (isSignUp ? (t.signupBtn || 'Create Account') : (t.loginBtn || 'Sign In'))
                                    )}
                                </button>
                            </motion.div>
                        </form>

                        {!isForgot && (
                            <motion.div variants={itemVariants} className="mt-8 text-center border-t border-white/10 pt-6">
                                <p className="text-white/40 text-sm">
                                    {isSignUp ? (t.hasAccount || 'Already have an account?') : (t.noAccount || 'Don\'t have an account?')}
                                    <button 
                                        onClick={() => { setIsSignUp(!isSignUp); setError(null); }} 
                                        className="text-rose-400 font-bold mx-2 hover:text-rose-300 transition-colors"
                                    >
                                        {isSignUp ? (t.switchLogin || 'Log In') : (t.switchSignup || 'Sign Up')}
                                    </button>
                                </p>
                            </motion.div>
                        )}
                        
                        {isForgot && (
                            <motion.div variants={itemVariants} className="mt-8 text-center">
                                <button 
                                    onClick={() => setIsForgot(false)} 
                                    className="text-white/40 hover:text-white text-sm font-semibold transition-colors"
                                >
                                    {t.backToLogin || 'Back to Login'}
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

export default Login
