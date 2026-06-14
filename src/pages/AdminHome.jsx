import React, { useEffect, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { FaEye, FaMousePointer, FaChartArea, FaLink, FaUser, FaRocket, FaFire } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import AdminHeader from '../components/AdminHeader'

const AdminHome = () => {
    const { t, language } = useLanguage()
    const { user, settings } = useAuth()
    const [stats, setStats] = useState({ views: 0, clicks: 0 })
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
            <div className="w-12 h-12 border-4 border-white/5 border-t-fuchsia-500 rounded-full animate-spin"></div>
        </div>
    )

    const engagementRate = stats.views > 0 ? ((stats.clicks / stats.views) * 100).toFixed(1) : 0

    return (
        <div className="w-full flex flex-col gap-8 pb-24 animate-[fadeInScale_0.8s_cubic-bezier(0.23,1,0.32,1)]" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
            <AdminHeader title={t.managementCenter || 'Dashboard'} />

            {/* Premium Hero Identity Card */}
            <section className="relative p-5 sm:p-8 rounded-3xl sm:rounded-[32px] overflow-hidden group shadow-2xl border border-white/10 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
                {/* Animated Glowing Orbs */}
                <div className="absolute -top-32 -right-32 w-64 sm:w-80 h-64 sm:h-80 bg-fuchsia-600/30 blur-[80px] rounded-full pointer-events-none group-hover:bg-fuchsia-500/40 transition-all duration-700"></div>
                <div className="absolute -bottom-32 -left-32 w-64 sm:w-80 h-64 sm:h-80 bg-blue-600/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-500/30 transition-all duration-700"></div>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 relative z-10 text-center sm:text-left">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.25rem] overflow-hidden border-2 border-white/20 bg-white/5 shadow-[0_0_40px_rgba(217,70,239,0.2)] shrink-0 relative p-1">
                        <div className="w-full h-full rounded-xl overflow-hidden bg-black/50">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl text-white font-black bg-gradient-to-br from-fuchsia-500 to-purple-700">
                                    {profile?.full_name?.[0] || user.email[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center sm:items-start">
                        <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-1">
                            <h3 className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight">
                                {profile?.full_name || t.welcomeBack || 'Welcome'}
                            </h3>
                            <div className="bg-emerald-500/10 text-emerald-400 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center gap-1.5 shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                Live
                            </div>
                        </div>
                        <span className="text-xs sm:text-sm text-fuchsia-300/80 font-bold tracking-wide">
                            @{user.user_metadata?.username || 'user'}
                        </span>
                    </div>

                    <Link to="/admin/profile" className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-md hidden sm:flex">
                        <FaUser className="text-white/80 text-xl" />
                    </Link>
                </div>
            </section>

            {/* Precision Stats Area */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                <InsightCard
                    val={stats.views}
                    label={t.profileViews || 'Views'}
                    icon={<FaEye />}
                    glow="rgba(236, 72, 153, 0.2)"
                    textGradient="from-pink-400 to-rose-400"
                />
                <InsightCard
                    val={stats.clicks}
                    label={t.linkClicks || 'Clicks'}
                    icon={<FaMousePointer />}
                    glow="rgba(56, 189, 248, 0.2)"
                    textGradient="from-sky-400 to-blue-500"
                />
                <InsightCard
                    val={`${engagementRate}%`}
                    label="CTR"
                    icon={<FaFire />}
                    glow="rgba(245, 158, 11, 0.2)"
                    textGradient="from-amber-300 to-orange-500"
                    className="col-span-2 sm:col-span-1"
                />
            </div>

            {/* Pro Analytics Container (Area Chart) */}
            <section className="bg-black/40 backdrop-blur-xl border border-white/10 p-5 sm:p-8 rounded-3xl sm:rounded-[32px] relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent"></div>
                
                <div className="flex justify-between items-center mb-6 sm:mb-8 relative z-10">
                    <div>
                        <h4 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 sm:gap-3">
                            {t.linkPerformance || 'Performance Flow'}
                            <FaChartArea className="text-fuchsia-400" />
                        </h4>
                        <p className="text-[10px] sm:text-xs text-white/40 font-bold mt-1 uppercase tracking-wider">Top performing links</p>
                    </div>
                </div>

                {linkData.length > 0 ? (
                    <div className="w-full h-[180px] sm:h-[240px] relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={linkData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#d946ef" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }} dx={-10} />
                                <Tooltip
                                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }}
                                    contentStyle={{
                                        background: 'rgba(15, 15, 20, 0.95)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        fontSize: '13px',
                                        fontWeight: 'bold',
                                        color: '#fff',
                                        boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                    itemStyle={{ color: '#d946ef', fontWeight: '900' }}
                                />
                                <Area type="monotone" dataKey="clicks" stroke="#d946ef" strokeWidth={4} fillOpacity={1} fill="url(#colorClicks)" activeDot={{ r: 6, fill: '#fff', stroke: '#d946ef', strokeWidth: 3 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="text-center py-16 relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center mb-5 shadow-inner">
                            <FaChartArea className="text-4xl text-white/20" />
                        </div>
                        <p className="text-sm font-bold text-white/40">{t.noLinks || 'No data available yet. Add some links!'}</p>
                    </div>
                )}
            </section>

            {/* Quick Action Hub */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <ActionCard
                    to="/admin/links"
                    icon={<FaLink />}
                    title={t.manageLinks || 'Links Studio'}
                    desc="Organize your ecosystem"
                    accentColor="from-blue-500 to-indigo-600"
                    glowColor="rgba(79, 70, 229, 0.2)"
                />
                <ActionCard
                    href={`/${user.user_metadata?.username || ''}`}
                    target="_blank"
                    icon={<FaRocket />}
                    title={t.viewPublicPage || 'Live Preview'}
                    desc="View digital identity"
                    accentColor="from-fuchsia-500 to-rose-500"
                    glowColor="rgba(244, 63, 94, 0.2)"
                    isLive
                />
            </div>
        </div>
    )
}

const InsightCard = ({ val, label, icon, glow, textGradient, className = '' }) => (
    <div className={`relative p-4 sm:p-7 rounded-2xl sm:rounded-[28px] flex flex-col items-center justify-center text-center group bg-[#111118] border border-white/5 shadow-xl hover:border-white/10 transition-all duration-300 overflow-hidden ${className}`}>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at center, ${glow} 0%, transparent 70%)` }}></div>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-sm sm:text-lg mb-2 sm:mb-4 text-white/70 relative z-10 group-hover:scale-110 transition-transform duration-300 shadow-inner">
            {icon}
        </div>
        <div className={`text-2xl sm:text-4xl font-black mb-1 tracking-tighter bg-clip-text text-transparent bg-gradient-to-br ${textGradient} relative z-10`}>
            {val}
        </div>
        <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/40 relative z-10">
            {label}
        </div>
    </div>
)

const ActionCard = ({ to, href, target, icon, title, desc, accentColor, glowColor, isLive }) => {
    const Content = (
        <div className="relative p-4 sm:p-6 rounded-2xl sm:rounded-[28px] flex items-center gap-4 sm:gap-5 bg-[#111118] border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group overflow-hidden shadow-xl">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at top right, ${glowColor} 0%, transparent 80%)` }}></div>
            
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl shrink-0 text-white bg-gradient-to-br ${accentColor} shadow-lg relative z-10 group-hover:rotate-6 transition-transform duration-300`}>
                {icon}
            </div>
            <div className="flex-1 relative z-10">
                <div className="flex items-center justify-between mb-0.5">
                    <span className="font-black text-white text-lg tracking-tight">{title}</span>
                    {isLive && (
                        <div className="flex items-center gap-1.5 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse"></div>
                            <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Live</span>
                        </div>
                    )}
                </div>
                <span className="text-xs text-white/40 font-bold block">{desc}</span>
            </div>
        </div>
    )

    if (to) return <Link to={to} className="block">{Content}</Link>
    return <a href={href} target={target} rel="noopener noreferrer" className="block">{Content}</a>
}

export default AdminHome
