import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import {
    FaTrash, FaPlus, FaLink, FaCopy, FaCheck,
    FaMousePointer, FaEye, FaGlobe, FaEnvelope,
    FaPlusCircle, FaSearch, FaEllipsisV, FaPencilAlt, FaChartLine
} from 'react-icons/fa'
import IconSelector from '../components/IconSelector'
import { iconMap } from '../utils/iconMap'
import AdminHeader from '../components/AdminHeader'
import { getLocalizedTitle } from '../constants/translations'

const AdminLinks = () => {
    const { user } = useAuth()
    const { t, language } = useLanguage()

    const [links, setLinks] = useState([])
    const [loading, setLoading] = useState(true)
    const [copiedId, setCopiedId] = useState(null)

    // New/Edit link state
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [icon, setIcon] = useState('FaGlobe')
    const [editingId, setEditingId] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [showPanel, setShowPanel] = useState(false)

    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const { data, error } = await supabase
                    .from('links')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (error) throw error
                setLinks(data)
            } catch (error) {
                console.error('Error fetching links:', error.message)
            } finally {
                setLoading(false)
            }
        }
        if (user) fetchLinks()
    }, [user])

    const resetForm = () => {
        setTitle('')
        setUrl('')
        setIcon('FaGlobe')
        setEditingId(null)
        setShowPanel(false)
    }

    const startEdit = (link) => {
        setTitle(link.title)
        setUrl(link.url)
        setIcon(link.icon || 'FaGlobe')
        setEditingId(link.id)
        setShowPanel(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title || !url) return
        
        // --- SECURITY: XSS Protection & URL Validation ---
        let safeUrl = url.trim();
        try {
            // Add https:// if it's just a raw domain like "example.com"
            if (!safeUrl.match(/^https?:\/\//i) && !safeUrl.match(/^mailto:/i) && !safeUrl.match(/^tel:/i)) {
                safeUrl = `https://${safeUrl}`;
            }
            
            const parsedUrl = new URL(safeUrl);
            const protocol = parsedUrl.protocol.toLowerCase();
            
            // Block dangerous protocols like javascript:
            if (!['http:', 'https:', 'mailto:', 'tel:'].includes(protocol)) {
                alert(language === 'ar' ? 'عذراً، هذا الرابط غير مدعوم أو غير آمن.' : 'Sorry, this link protocol is not supported or unsafe.');
                return;
            }
        } catch (err) {
            alert(language === 'ar' ? 'الرابط غير صحيح، يرجى التأكد من كتابته بشكل صحيح.' : 'Invalid URL. Please enter a valid web address.');
            return;
        }
        // --------------------------------------------------

        setSubmitting(true)

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('links')
                    .update({ title, url: safeUrl, icon })
                    .eq('id', editingId)

                if (error) throw error

                setLinks(links.map(l => l.id === editingId ? { ...l, title, url: safeUrl, icon } : l))
            } else {
                const { data, error } = await supabase
                    .from('links')
                    .insert([{ title, url: safeUrl, icon, user_id: user.id }])
                    .select()

                if (error) throw error
                setLinks([data[0], ...links])
            }
            resetForm()
        } catch (error) {
            alert(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الرابط؟' : 'Are you sure you want to delete this link?')) return
        try {
            const { error } = await supabase
                .from('links')
                .delete()
                .eq('id', id)

            if (error) throw error
            setLinks(links.filter(link => link.id !== id))
        } catch (error) {
            alert(error.message)
        }
    }

    const copyToClipboard = (url, id) => {
        navigator.clipboard.writeText(url)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    if (loading) return (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="w-12 h-12 border-4 border-white/5 border-t-fuchsia-500 rounded-full animate-spin"></div>
        </div>
    )

    return (
        <div className="w-full flex flex-col gap-8 pb-24 animate-[fadeInScale_0.6s_cubic-bezier(0.23,1,0.32,1)_forwards]" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
            <AdminHeader title={t.dashboardTitle || 'Ecosystem'} />

            {/* Quick Actions Header */}
            <div className="flex justify-between items-center flex-wrap gap-4 px-2 sm:px-4">
                <div>
                    <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight">
                        {language === 'ar' ? 'إدارة الروابط' : 'Link Studio'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.8)] animate-pulse"></div>
                        <p className="text-[10px] sm:text-xs text-white/40 font-bold uppercase tracking-widest">
                            {links.length} {language === 'ar' ? 'رابط مفعل' : 'active links'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        if (showPanel && editingId) {
                            resetForm()
                        } else {
                            setShowPanel(!showPanel)
                        }
                    }}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 shadow-xl ${
                        showPanel 
                        ? 'bg-[#111118] border border-white/10 text-white hover:border-white/20' 
                        : 'bg-white text-black hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.2)]'
                    }`}
                >
                    <FaPlus className={`transition-transform duration-300 ${showPanel ? 'rotate-45' : ''}`} />
                    {showPanel ? (language === 'ar' ? 'إلغاء' : 'Cancel') : (language === 'ar' ? 'رابط جديد' : 'New Link')}
                </button>
            </div>

            {/* Add/Edit Panel */}
            {showPanel && (
                <section className="bg-[#0f0c29] p-5 sm:p-8 rounded-3xl sm:rounded-[32px] border border-fuchsia-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden animate-[fadeInUp_0.4s_ease-out]">
                    <div className="absolute -top-32 -right-32 w-48 sm:w-64 h-48 sm:h-64 bg-fuchsia-600/10 blur-[80px] rounded-full pointer-events-none"></div>
                    <div className="absolute -bottom-32 -left-32 w-48 sm:w-64 h-48 sm:h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none"></div>

                    <h4 className="text-lg sm:text-xl font-black text-white mb-6 sm:mb-8 relative z-10 flex items-center gap-3">
                        {editingId ? (language === 'ar' ? 'تعديل الرابط' : 'Edit Link') : (language === 'ar' ? 'إضافة رابط جديد' : 'Add New Link')}
                        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                    </h4>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6 relative z-10">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                            <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl sm:rounded-[20px] bg-black/40 border border-white/10 flex items-center justify-center text-2xl sm:text-3xl text-fuchsia-400 shrink-0 shadow-inner mx-auto sm:mx-0">
                                {iconMap[icon]}
                            </div>
                            <div className="flex-1 relative group">
                                <label className="absolute -top-2.5 left-4 bg-[#0f0c29] px-2 text-[9px] sm:text-[10px] font-black text-fuchsia-400 uppercase tracking-widest z-10">
                                    {t.titlePlaceholder || 'Link Title'}
                                </label>
                                <input
                                    type="text"
                                    placeholder={t.titlePlaceholder || 'e.g. My Latest Video'}
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full h-14 sm:h-16 px-4 sm:px-5 rounded-2xl sm:rounded-[20px] border border-white/10 bg-black/40 text-white text-sm sm:text-base font-bold placeholder-white/20 focus:outline-none focus:border-fuchsia-500/50 focus:bg-black/60 transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="absolute -top-2.5 left-4 bg-[#0f0c29] px-2 text-[9px] sm:text-[10px] font-black text-blue-400 uppercase tracking-widest z-10">
                                {t.urlPlaceholder || 'URL / Destination'}
                            </label>
                            <FaLink className={`absolute top-1/2 -translate-y-1/2 text-white/20 ${language === 'ar' ? 'right-4 sm:right-5' : 'left-4 sm:left-5'}`} />
                            <input
                                type="url"
                                placeholder="https://example.com"
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                className={`w-full h-14 sm:h-16 rounded-2xl sm:rounded-[20px] border border-white/10 bg-black/40 text-white text-xs sm:text-sm font-medium placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all shadow-inner ${language === 'ar' ? 'pr-10 sm:pr-12 pl-4 text-left' : 'pl-10 sm:pl-12 pr-4 text-left'}`}
                                dir="ltr"
                            />
                        </div>

                        <div className="bg-[#111118] p-4 sm:p-5 rounded-2xl sm:rounded-[24px] border border-white/5 shadow-inner">
                            <h5 className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 sm:mb-4">Choose an Icon</h5>
                            <IconSelector
                                selectedIcon={icon}
                                onSelect={(iconKey) => {
                                    setIcon(iconKey)
                                    let platformKey = iconKey.replace('Fa', '').replace('Si', '').toLowerCase()
                                    if (iconKey === 'FaGlobe') platformKey = 'global'
                                    if (iconKey === 'FaEnvelope') platformKey = 'email'
                                    if (t[platformKey] && !editingId) setTitle(t[platformKey])
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 sm:py-5 mt-2 sm:mt-4 bg-white text-black hover:bg-gray-100 font-black rounded-2xl sm:rounded-[20px] text-sm sm:text-base shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99]"
                        >
                            {submitting ? (
                                <div className="w-5 sm:w-6 h-5 sm:h-6 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto"></div>
                            ) : (
                                editingId ? (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes') : (t.addBtn || 'Create Link')
                            )}
                        </button>
                    </form>
                </section>
            )}

            {/* Premium Links Feed */}
            <div className="flex flex-col gap-4 sm:gap-5">
                {links.length === 0 && !loading && (
                    <div className="text-center py-16 sm:py-20 flex flex-col items-center bg-[#111118] border border-white/5 rounded-3xl sm:rounded-[32px]">
                        <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                            <FaLink className="text-4xl sm:text-5xl text-white/10" />
                        </div>
                        <p className="text-lg sm:text-xl font-black text-white/40">{t.noLinks || 'Your ecosystem is empty'}</p>
                        <p className="text-xs sm:text-sm font-bold text-white/20 mt-2">Add your first link above</p>
                    </div>
                )}

                {links.map((link, index) => (
                    <div
                        key={link.id}
                        className="bg-[#111118] p-4 sm:p-6 rounded-3xl sm:rounded-[28px] flex flex-col gap-4 sm:gap-5 group border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-2xl hover:bg-[#15151e] relative overflow-hidden"
                        style={{ animation: `fadeInUp 0.4s cubic-bezier(0.2, 1, 0.3, 1) ${index * 0.05}s both` }}
                    >
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at top right, rgba(217, 70, 239, 0.05) 0%, transparent 70%)` }}></div>

                        <div className="flex justify-between items-start sm:items-center gap-3 sm:gap-4 relative z-10">
                            <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[16px] sm:rounded-[20px] bg-white/5 border border-white/5 flex items-center justify-center text-xl sm:text-2xl text-white shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-inner">
                                    {iconMap[link.icon]}
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <h4 className="text-base sm:text-lg font-black text-white mb-0.5 sm:mb-1 truncate group-hover:text-fuchsia-300 transition-colors">
                                        {getLocalizedTitle(link.title, language)}
                                    </h4>
                                    <p className="text-[10px] sm:text-xs font-bold text-white/30 truncate" dir="ltr">
                                        {link.url.replace(/(^\w+:|^)\/\//, '')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 bg-black/40 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-white/5">
                                <button
                                    onClick={() => startEdit(link)}
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-[14px] hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-all hover:scale-110"
                                >
                                    <FaPencilAlt size={12} className="sm:w-[14px] sm:h-[14px]" />
                                </button>
                                <button
                                    onClick={() => copyToClipboard(link.url, link.id)}
                                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-[14px] flex items-center justify-center transition-all hover:scale-110 ${
                                        copiedId === link.id 
                                        ? 'bg-emerald-500/20 text-emerald-400' 
                                        : 'hover:bg-white/10 text-white/40 hover:text-white'
                                    }`}
                                >
                                    {copiedId === link.id ? <FaCheck size={12} className="sm:w-[14px] sm:h-[14px]" /> : <FaCopy size={12} className="sm:w-[14px] sm:h-[14px]" />}
                                </button>
                                <button
                                    onClick={() => handleDelete(link.id)}
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-[14px] hover:bg-rose-500/10 text-white/40 hover:text-rose-400 flex items-center justify-center transition-all hover:scale-110"
                                >
                                    <FaTrash size={12} className="sm:w-[14px] sm:h-[14px]" />
                                </button>
                            </div>
                        </div>

                        {/* Pro Analytic Strip */}
                        <div className="flex justify-between items-center px-4 sm:px-5 py-2.5 sm:py-3.5 bg-black/50 rounded-xl sm:rounded-2xl border border-white/5 relative z-10 group-hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                                        <FaMousePointer className="text-[10px] sm:text-[12px] text-blue-400" />
                                    </div>
                                    <span className="text-sm sm:text-base font-black text-white group-hover:text-blue-300 transition-colors">{link.clicks || 0}</span>
                                </div>
                                <div className="h-3 sm:h-4 w-px bg-white/10"></div>
                                <span className="text-[9px] sm:text-[10px] text-white/30 font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <FaChartLine className="text-white/20 hidden sm:block" /> {language === 'ar' ? 'نقرة' : 'Clicks'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[10px] font-black text-emerald-400/60 uppercase tracking-widest bg-emerald-500/10 px-2 sm:px-2.5 py-1 rounded-md sm:rounded-lg border border-emerald-500/20">
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> Live
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AdminLinks
