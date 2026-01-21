import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [settings, setSettings] = useState({
        support_email: 'support@sy-links.com',
        maintenance_mode: false,
        registration_enabled: true,
        system_announcement: { message: '', color: '#ff2d55', active: false },
        promo_announcement: { message: '', image_url: '', active: false },
        profile_ad_announcement: { message: '', image_url: '', target_url: '', active: false, inject_index: 3 },
        profile_ads: [], // Multi-ad support
        disabled_pages: [],
        page_backgrounds: { allowed_skins: [], default_skin: 'standard' }
    })
    const [loading, setLoading] = useState(true)

    const fetchProfile = async (userId) => {
        if (!userId) {
            setProfile(null)
            setLoading(false)
            return
        }
        try {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()
            setProfile(data)
        } finally {
            setLoading(false)
        }
    }

    const fetchSettings = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('platform_settings').select('*')
            if (error) return

            if (data) {
                setSettings(prev => {
                    const newSettings = { ...prev }
                    data.forEach(s => {
                        if (s.key === 'support_email') newSettings.support_email = s.value
                        if (s.key === 'maintenance_mode') newSettings.maintenance_mode = s.value === 'true'
                        if (s.key === 'registration_enabled') newSettings.registration_enabled = s.value === 'true'
                        if (s.key === 'system_announcement') {
                            try { newSettings.system_announcement = JSON.parse(s.value) } catch { /* Ignore */ }
                        }
                        if (s.key === 'promo_announcement') {
                            try { newSettings.promo_announcement = JSON.parse(s.value) } catch { /* Ignore */ }
                        }
                        if (s.key === 'profile_ad_announcement') {
                            try { newSettings.profile_ad_announcement = JSON.parse(s.value) } catch { /* Ignore */ }
                        }
                        if (s.key === 'profile_ads') {
                            try { newSettings.profile_ads = JSON.parse(s.value) } catch { /* Ignore */ }
                        }
                        if (s.key === 'disabled_pages') {
                            try { newSettings.disabled_pages = JSON.parse(s.value) } catch { /* Ignore */ }
                        }
                        if (s.key === 'page_backgrounds') {
                            try { newSettings.page_backgrounds = JSON.parse(s.value) } catch { /* Ignore */ }
                        }
                    })
                    return newSettings
                })
            }
        } catch { /* Ignore error */ }
    }, [])

    useEffect(() => {
        // Fetch global settings
        fetchSettings()

        // Real-time settings subscription
        const settingsChannel = supabase
            .channel('platform_settings_changes')
            .on('postgres_changes', { event: '*', table: 'platform_settings', schema: 'public' }, () => {
                fetchSettings()
            })
            .subscribe()

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null
            setUser(currentUser)
            if (currentUser) fetchProfile(currentUser.id)
            else setLoading(false)
        })

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null
            setUser(currentUser)
            setLoading(true) // Start loading while we fetch profile
            if (currentUser) fetchProfile(currentUser.id)
            else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => {
            subscription.unsubscribe()
            supabase.removeChannel(settingsChannel)
        }
    }, [fetchSettings])

    return (
        <AuthContext.Provider value={{ user, profile, settings, loading, isSuspended: profile?.is_suspended }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
