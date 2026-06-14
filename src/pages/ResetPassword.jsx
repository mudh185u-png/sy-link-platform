import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { FaBolt, FaLock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { motion } from 'framer-motion'

const ResetPassword = () => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const navigate = useNavigate()
    const { t, language } = useLanguage()
    const isRtl = language === 'ar'

    const handleReset = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match')
            return
        }

        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            })
            if (updateError) throw updateError

            setMessage(t.passwordUpdated || 'Password updated successfully! Redirecting...')
            setTimeout(() => {
                navigate('/login')
            }, 3000)
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`min-h-screen w-full bg-[#030308] text-white overflow-hidden flex flex-col items-center justify-center relative ${isRtl ? 'rtl' : 'ltr'}`} style={{ fontFamily: isRtl ? 'Tajawal, sans-serif' : 'Outfit, sans-serif' }}>
            {/* Background Blobs */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-purple-600/20 blur-[120px]" 
                />
                <motion.div 
                    animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-rose-600/10 blur-[120px]" 
                />
            </div>

            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
                <LanguageSwitcher inline />
                <Link to="/login" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-semibold">
                    {t.backToLogin || 'Back to Login'}
                </Link>
            </div>

            <div className="w-full max-w-md px-6 relative z-10">
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
                    <h2 className="text-white/60 text-lg md:text-xl font-bold">
                        {isRtl ? 'تعيين كلمة مرور جديدة' : 'Set New Password'}
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="glass-panel p-8"
                >
                    {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
                            <FaExclamationTriangle className="mt-1 flex-shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {message && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3">
                            <FaCheckCircle className="mt-1 flex-shrink-0" />
                            <span>{message}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleReset} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">{t.newPasswordPlaceholder || 'New Password'}</label>
                            <div className="relative group">
                                <FaLock className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'} text-white/30 group-focus-within:text-rose-400 transition-colors`} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white placeholder:text-white/20 focus:outline-none focus:border-rose-500/50 focus:bg-white/10 transition-all`}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">{t.confirmPasswordPlaceholder || 'Confirm New Password'}</label>
                            <div className="relative group">
                                <FaLock className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'} text-white/30 group-focus-within:text-rose-400 transition-colors`} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white placeholder:text-white/20 focus:outline-none focus:border-rose-500/50 focus:bg-white/10 transition-all`}
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all shadow-lg bg-gradient-to-r from-rose-500 to-purple-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    t.updatePasswordBtn || 'Update Password'
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}

export default ResetPassword
