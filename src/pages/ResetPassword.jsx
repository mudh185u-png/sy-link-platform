import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { FaBolt, FaLock } from 'react-icons/fa'
import LanguageSwitcher from '../components/LanguageSwitcher'

const ResetPassword = () => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const navigate = useNavigate()
    const { t, language } = useLanguage()

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
                <Link to="/login" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
                    {t.backToLogin || 'Back to Login'}
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
                    }}>
                        <FaBolt size={38} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '12px', letterSpacing: '-1.5px' }}>SY Link</h1>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
                        {language === 'ar' ? 'تعيين كلمة مرور جديدة' : 'Set New Password'}
                    </h2>
                </div>

                {/* FORM CARD */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    padding: '40px 30px',
                    borderRadius: '28px',
                    border: '1px solid rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(15px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}>
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

                    <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: '700', color: 'rgba(255,255,255,0.6)' }}>
                                {t.newPasswordPlaceholder || 'New Password'}
                            </label>
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
                                        outline: 'none'
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: '700', color: 'rgba(255,255,255,0.6)' }}>
                                {t.confirmPasswordPlaceholder || 'Confirm New Password'}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <FaLock style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [language === 'ar' ? 'right' : 'left']: '16px', color: 'rgba(255,255,255,0.2)' }} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{
                                        width: '100%', padding: '14px 48px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} style={{
                            padding: '16px', background: 'var(--accent-gradient)', border: 'none', borderRadius: '14px',
                            color: '#fff', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', marginTop: '10px',
                            boxShadow: '0 10px 30px rgba(255,45,85,0.3)'
                        }}>
                            {loading ? '...' : (t.updatePasswordBtn || 'Update Password')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword
