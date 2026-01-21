import React, { useEffect, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { FaEye, FaMousePointer, FaChartBar, FaLink, FaUser, FaPalette, FaArrowUp, FaRocket } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import AdminHeader from '../components/AdminHeader'

const AdminHome = () => {
    const { t, language } = useLanguage()
    const { user, settings } = useAuth()
    const { settings: themeSettings } = useTheme()
    const [stats, setStats] = useState({ views: 0, clicks: 0 })

    const getStyle = (sectionId, key, fallback) => {
        return themeSettings?.styles?.[sectionId]?.[key] !== undefined
            ? themeSettings.styles[sectionId][key]
            : fallback
    }
    const [linkData, setLinkData] = useState([])
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                setProfile(profileData)

                const { data: links } = await supabase
                    .from('links')
                    .select('title, clicks')
                    .eq('user_id', user.id)

                const totalClicks = links?.reduce((acc, curr) => acc + (curr.clicks || 0), 0) || 0

                setStats({
                    views: profileData?.views || 0,
                    clicks: totalClicks
                })

                const chartData = links?.map(l => ({
                    name: l.title.length > 8 ? l.title.substring(0, 8) + '..' : l.title,
                    clicks: l.clicks || 0
                })).sort((a, b) => b.clicks - a.clicks).slice(0, 5) || []

                setLinkData(chartData)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        if (user) fetchStats()
    }, [user])

    if (loading) return (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="loading-spinner"></div>
        </div>
    )

    const engagementRate = stats.views > 0 ? ((stats.clicks / stats.views) * 100).toFixed(1) : 0

    return (
        <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            paddingBottom: '2.5rem',
            animation: 'fadeInScale 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
            direction: language === 'ar' ? 'rtl' : 'ltr'
        }}>
            <AdminHeader title={t.managementCenter} />

            {/* High-Precision Identity Card */}
            <section
                data-editable-id="home_identity_card"
                data-editable-type="container"
                className="glass-panel"
                style={{
                    padding: getStyle('home_identity_card', 'padding', '1.75rem'),
                    borderRadius: getStyle('home_identity_card', 'border_radius', '28px'),
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    border: `${getStyle('home_identity_card', 'border_width', '1px')} solid ${getStyle('home_identity_card', 'border_color', 'rgba(255,255,255,0.08)')}`,
                    borderStyle: getStyle('home_identity_card', 'border_style', 'solid'),
                    background: getStyle('home_identity_card', 'background_color', 'linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)'),
                    backdropFilter: `blur(${getStyle('home_identity_card', 'backdrop_blur', '15px')}) contrast(${getStyle('home_identity_card', 'backdrop_contrast', '100%')}) brightness(${getStyle('home_identity_card', 'backdrop_brightness', '100%')}) saturate(${getStyle('home_identity_card', 'backdrop_saturate', '100%')})`,
                    WebkitBackdropFilter: `blur(${getStyle('home_identity_card', 'backdrop_blur', '15px')}) contrast(${getStyle('home_identity_card', 'backdrop_contrast', '100%')}) brightness(${getStyle('home_identity_card', 'backdrop_brightness', '100%')}) saturate(${getStyle('home_identity_card', 'backdrop_saturate', '100%')})`,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    transform: `translate(${getStyle('home_identity_card', 'offset_x', 0)}px, ${getStyle('home_identity_card', 'offset_y', 0)}px)`
                }}>
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: '180px',
                    height: '180px',
                    background: 'var(--accent-color)',
                    filter: 'blur(80px)',
                    opacity: 0.1,
                    pointerEvents: 'none'
                }}></div>

                <div
                    data-editable-id="home_avatar_container"
                    data-editable-type="container"
                    style={{
                        width: getStyle('home_avatar_container', 'width', 75),
                        height: getStyle('home_avatar_container', 'height', 75),
                        borderRadius: getStyle('home_avatar_container', 'border_radius', '22px'),
                        overflow: 'hidden',
                        border: `${getStyle('home_avatar_container', 'border_width', '1px')} solid ${getStyle('home_avatar_container', 'border_color', 'rgba(255,255,255,0.1)')}`,
                        background: getStyle('home_avatar_container', 'background_color', 'rgba(0,0,0,0.2)'),
                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                        flexShrink: 0
                    }}>
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: '#fff', fontWeight: '900', background: 'var(--accent-gradient)' }}>
                            {profile?.full_name?.[0] || user.email[0].toUpperCase()}
                        </div>
                    )}
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3
                            data-editable-id="home_welcome_title"
                            data-editable-type="text"
                            style={{
                                fontSize: getStyle('home_welcome_title', 'font_size', '1.4rem'),
                                fontWeight: getStyle('home_welcome_title', 'font_weight', '800'),
                                color: getStyle('home_welcome_title', 'text_color', '#fff'),
                                letterSpacing: `${getStyle('home_welcome_title', 'letter_spacing', -0.3)}px`,
                                textShadow: getStyle('home_welcome_title', 'text_shadow', 'none')
                            }}>
                            {profile?.full_name || t.welcomeBack}
                        </h3>
                        <div style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '2px 8px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: '900', textTransform: 'uppercase' }}>
                            Active
                        </div>
                    </div>
                    <span
                        data-editable-id="home_username_span"
                        data-editable-type="text"
                        style={{
                            fontSize: getStyle('home_username_span', 'font_size', '0.8rem'),
                            color: getStyle('home_username_span', 'text_color', 'rgba(255,255,255,0.4)'),
                            fontWeight: getStyle('home_username_span', 'font_weight', '600'),
                            textShadow: getStyle('home_username_span', 'text_shadow', 'none')
                        }}>
                        @{user.user_metadata?.username || 'user'}
                    </span>
                </div>

                <Link to="/admin/profile" className="glass-btn" style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)'
                }}>
                    <FaUser size={18} style={{ opacity: 0.8 }} />
                </Link>
            </section>

            {/* System Notifications Widget */}
            {settings?.system_announcement?.active && (
                <section className="glass-panel" style={{
                    padding: '1.25rem',
                    borderRadius: '24px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '14px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-color)',
                        fontSize: '1.2rem'
                    }}>
                        📢
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff', marginBottom: '2px' }}>
                            {language === 'ar' ? 'تنبيه النظام' : 'System Notice'}
                        </h4>
                        <p style={{ fontSize: '0.8rem', opacity: 0.6, lineHeight: '1.4' }}>
                            {settings.system_announcement.message}
                        </p>
                    </div>
                </section>
            )}

            {/* Precision Stats Area */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <InsightCard
                    id="stats_views"
                    val={stats.views}
                    label={t.profileViews}
                    icon={<FaEye />}
                    color="var(--accent-color)"
                    getStyle={getStyle}
                />
                <InsightCard
                    id="stats_clicks"
                    val={stats.clicks}
                    label={t.linkClicks}
                    icon={<FaMousePointer />}
                    color="#4facfe"
                    getStyle={getStyle}
                />
                <InsightCard
                    id="stats_ctr"
                    val={`${engagementRate}%`}
                    label="CTR"
                    icon={<FaRocket />}
                    color="#f9d423"
                    getStyle={getStyle}
                />
            </div>

            {/* Pro Analytics Container */}
            <section
                data-editable-id="analytics_container"
                data-editable-type="container"
                className="glass-panel"
                style={{
                    padding: getStyle('analytics_container', 'padding', '1.75rem'),
                    borderRadius: getStyle('analytics_container', 'border_radius', '32px'),
                    border: `${getStyle('analytics_container', 'border_width', '1px')} solid ${getStyle('analytics_container', 'border_color', 'rgba(255,255,255,0.07)')}`,
                    borderStyle: getStyle('analytics_container', 'border_style', 'solid'),
                    background: getStyle('analytics_container', 'background_color', 'rgba(255,255,255,0.02)'),
                    backdropFilter: `blur(${getStyle('analytics_container', 'backdrop_blur', '10px')}) contrast(${getStyle('analytics_container', 'backdrop_contrast', '100%')}) brightness(${getStyle('analytics_container', 'backdrop_brightness', '100%')}) saturate(${getStyle('analytics_container', 'backdrop_saturate', '100%')})`,
                    WebkitBackdropFilter: `blur(${getStyle('analytics_container', 'backdrop_blur', '10px')}) contrast(${getStyle('analytics_container', 'backdrop_contrast', '100%')}) brightness(${getStyle('analytics_container', 'backdrop_brightness', '100%')}) saturate(${getStyle('analytics_container', 'backdrop_saturate', '100%')})`,
                    boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
                    transform: `translate(${getStyle('analytics_container', 'offset_x', 0)}px, ${getStyle('analytics_container', 'offset_y', 0)}px)`
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>{t.linkPerformance}</h4>
                        <p style={{ fontSize: '0.75rem', opacity: 0.3, fontWeight: '500' }}>Real-time link engagement</p>
                    </div>
                    <div style={{
                        padding: '8px 12px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        color: 'rgba(255,255,255,0.4)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }}></div>
                        LIVE
                    </div>
                </div>

                {linkData.length > 0 ? (
                    <div style={{ width: '100%', height: '200px', minHeight: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                            <BarChart data={linkData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    contentStyle={{
                                        background: 'rgba(15,15,15,0.95)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                />
                                <Bar dataKey="clicks" radius={[8, 8, 4, 4]} barSize={30}>
                                    {linkData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 0', opacity: 0.2 }}>
                        <FaChartBar size={30} style={{ marginBottom: '10px' }} />
                        <p style={{ fontSize: '0.8rem', fontWeight: '700' }}>{t.noLinks || 'No data available'}</p>
                    </div>
                )}
            </section>

            {/* Quick Action Hub */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <ActionCard
                    id="action_links"
                    to="/admin/links"
                    icon={<FaLink />}
                    title={t.manageLinks}
                    desc="Organize your ecosystem"
                    color="#4facfe"
                    getStyle={getStyle}
                />
                <ActionCard
                    id="action_view"
                    href={`/${user.user_metadata?.username || ''}`}
                    target="_blank"
                    icon={<FaEye />}
                    title={t.viewPublicPage}
                    desc="Preview digital identity"
                    color="var(--accent-color)"
                    isLive
                    getStyle={getStyle}
                />
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .loading-spinner {
                    width: 25px;
                    height: 25px;
                    border: 2px solid rgba(255,255,255,0.1);
                    border-top: 2px solid var(--accent-color);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    )
}

const InsightCard = ({ id, val, label, icon, getStyle }) => (
    <div
        data-editable-id={id}
        data-editable-type="container"
        className="glass-panel"
        style={{
            padding: getStyle(id, 'padding', '1.25rem 0.75rem'),
            borderRadius: getStyle(id, 'border_radius', '24px'),
            border: `${getStyle(id, 'border_width', '1px')} solid ${getStyle(id, 'border_color', 'rgba(255,255,255,0.05)')}`,
            borderStyle: getStyle(id, 'border_style', 'solid'),
            background: getStyle(id, 'background_color', 'rgba(255,255,255,0.01)'),
            backdropFilter: `blur(${getStyle(id, 'backdrop_blur', '0px')}) contrast(${getStyle(id, 'backdrop_contrast', '100%')}) brightness(${getStyle(id, 'backdrop_brightness', '100%')}) saturate(${getStyle(id, 'backdrop_saturate', '100%')})`,
            WebkitBackdropFilter: `blur(${getStyle(id, 'backdrop_blur', '0px')}) contrast(${getStyle(id, 'backdrop_contrast', '100%')}) brightness(${getStyle(id, 'backdrop_brightness', '100%')}) saturate(${getStyle(id, 'backdrop_saturate', '100%')})`,
            position: 'relative',
            opacity: getStyle(id, 'opacity', 1),
            transform: `translate(${getStyle(id, 'offset_x', 0)}px, ${getStyle(id, 'offset_y', 0)}px)`,
            boxShadow: `${getStyle(id, 'shadow_offset_x', 0)}px ${getStyle(id, 'shadow_offset_y', 4)}px ${getStyle(id, 'shadow_blur', '20px')} ${getStyle(id, 'shadow_spread', '0px')} ${getStyle(id, 'shadow_color', 'rgba(0,0,0,0.1)')}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: getStyle(id, 'justify_content', 'center'),
            alignItems: getStyle(id, 'align_items', 'center'),
            textAlign: getStyle(id, 'text_align', 'center'),
            overflow: 'hidden'
        }}>
        {/* Grain Overlay */}
        {getStyle(id, 'grain_opacity', '0%') !== '0%' && (
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                pointerEvents: 'none', zIndex: 0, opacity: parseFloat(getStyle(id, 'grain_opacity', '0%')) / 100,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }} />
        )}
        <div style={{
            fontSize: getStyle(id, 'font_size', '1.5rem'),
            fontWeight: getStyle(id, 'font_weight', '1000'),
            color: getStyle(id, 'text_color', '#fff'),
            marginBottom: '4px',
            letterSpacing: `${getStyle(id, 'letter_spacing', -0.5)}px`,
            textShadow: getStyle(id, 'text_shadow', 'none')
        }}>{val}</div>
        <div style={{
            fontSize: '0.6rem',
            fontWeight: '900',
            opacity: 0.3,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
        }}>
            {icon} {label}
        </div>
    </div>
)

const ActionCard = ({ id, to, href, target, icon, title, desc, color, isLive, getStyle }) => {
    const Content = (
        <div
            data-editable-id={id}
            data-editable-type="container"
            className="glass-panel"
            style={{
                padding: getStyle(id, 'padding', '1.5rem'),
                borderRadius: getStyle(id, 'border_radius', '24px'),
                display: 'flex',
                flexDirection: 'column',
                gap: getStyle(id, 'gap', '10px'),
                border: `${getStyle(id, 'border_width', '1px')} solid ${getStyle(id, 'border_color', 'rgba(255,255,255,0.06)')}`,
                borderStyle: getStyle(id, 'border_style', 'solid'),
                background: getStyle(id, 'background_color', 'rgba(255,255,255,0.01)'),
                backdropFilter: `blur(${getStyle(id, 'backdrop_blur', '0px')}) contrast(${getStyle(id, 'backdrop_contrast', '100%')}) brightness(${getStyle(id, 'backdrop_brightness', '100%')}) saturate(${getStyle(id, 'backdrop_saturate', '100%')})`,
                WebkitBackdropFilter: `blur(${getStyle(id, 'backdrop_blur', '0px')}) contrast(${getStyle(id, 'backdrop_contrast', '100%')}) brightness(${getStyle(id, 'backdrop_brightness', '100%')}) saturate(${getStyle(id, 'backdrop_saturate', '100%')})`,
                transition: 'all 0.3s cubic-bezier(0.2, 1, 0.3, 1)',
                height: '100%',
                cursor: 'pointer',
                opacity: getStyle(id, 'opacity', 1),
                transform: `translate(${getStyle(id, 'offset_x', 0)}px, ${getStyle(id, 'offset_y', 0)}px)`,
                boxShadow: `${getStyle(id, 'shadow_offset_x', 0)}px ${getStyle(id, 'shadow_offset_y', 4)}px ${getStyle(id, 'shadow_blur', '20px')} ${getStyle(id, 'shadow_spread', '0px')} ${getStyle(id, 'shadow_color', 'rgba(0,0,0,0.1)')}`,
                justifyContent: getStyle(id, 'justify_content', 'flex-start'),
                alignItems: getStyle(id, 'align_items', 'stretch'),
                textAlign: getStyle(id, 'text_align', 'left'),
                position: 'relative',
                overflow: 'hidden'
            }} onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
            }} onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = getStyle(id, 'border_color', 'rgba(255,255,255,0.06)')
                e.currentTarget.style.background = getStyle(id, 'background_color', 'rgba(255,255,255,0.01)')
            }}>
            {/* Grain Overlay */}
            {getStyle(id, 'grain_opacity', '0%') !== '0%' && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    pointerEvents: 'none', zIndex: 0, opacity: parseFloat(getStyle(id, 'grain_opacity', '0%')) / 100,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }} />
            )}
            <div style={{
                width: getStyle(id, 'icon_container_width', '36px'),
                height: getStyle(id, 'icon_container_height', '36px'),
                borderRadius: '12px',
                background: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
                fontSize: '1.1rem',
                transform: `rotate(${getStyle(id, 'rotation', 0)}deg) scaleX(${getStyle(id, 'flip_h', 1)})`
            }}>
                {icon}
            </div>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                        fontWeight: getStyle(id, 'font_weight', '800'),
                        color: getStyle(id, 'text_color', '#fff'),
                        fontSize: getStyle(id, 'font_size', '1rem'),
                        textShadow: getStyle(id, 'text_shadow', 'none')
                    }}>{title}</span>
                    {isLive && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }}></div>}
                </div>
                <span style={{ fontSize: '0.7rem', opacity: 0.3, fontWeight: '500' }}>{desc}</span>
            </div>
        </div>
    )

    if (to) return <Link to={to} style={{ textDecoration: 'none' }}>{Content}</Link>
    return <a href={href} target={target} rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{Content}</a>
}

export default AdminHome
