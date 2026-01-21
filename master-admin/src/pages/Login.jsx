import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (authError) throw authError

            // Verify if user is a Master Admin
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('is_master')
                .eq('id', user.id)
                .single()

            if (profileError || !profile?.is_master) {
                await supabase.auth.signOut()
                throw new Error('Access Denied: Specialized administrative access required.')
            }

            navigate('/dashboard')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            <div className="glass-panel" style={{ padding: '3rem', borderRadius: '35px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <h1 className="brand-logo" style={{ fontSize: '2rem', marginBottom: '10px' }}>SY Master</h1>
                <p style={{ opacity: 0.5, marginBottom: '2rem', fontSize: '0.9rem', fontWeight: '600' }}>Platform Control Center</p>

                {error && <div style={{ background: 'rgba(255, 45, 85, 0.1)', color: '#ff2d55', padding: '1rem', borderRadius: '15px', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid rgba(255, 45, 85, 0.2)' }}>{error}</div>}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <input
                        type="email"
                        placeholder="Master Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', width: '100%' }}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Access Token"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', width: '100%' }}
                        required
                    />
                    <button type="submit" disabled={loading} style={{
                        padding: '1.2rem',
                        background: 'var(--accent-gradient)',
                        border: 'none',
                        borderRadius: '16px',
                        color: '#fff',
                        fontWeight: '900',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        boxShadow: '0 10px 20px rgba(255,45,85,0.3)',
                        marginTop: '1rem'
                    }}>
                        {loading ? 'Authenticating...' : 'Enter Console'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login
