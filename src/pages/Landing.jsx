import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useAuth } from '../contexts/AuthContext'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
    FaArrowRight, FaRocket, FaPaintBrush, FaChartLine, FaGlobe,
    FaUserPlus, FaLayerGroup, FaLink, FaShareAlt
} from 'react-icons/fa'
import { FaXTwitter, FaInstagram, FaDiscord } from 'react-icons/fa6'

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const Landing = () => {
    const { t, language } = useLanguage()
    const { settings } = useAuth()
    const [scrolled, setScrolled] = useState(false)
    const { scrollYProgress } = useScroll()
    const yHero = useTransform(scrollYProgress, [0, 1], [0, 300])
    const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0])

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const isRtl = language === 'ar'

    return (
        <div className={`min-h-screen w-full bg-[#030308] text-white overflow-hidden ${isRtl ? 'rtl' : 'ltr'}`} style={{ fontFamily: isRtl ? 'Tajawal, sans-serif' : 'Outfit, sans-serif' }}>
            
            {/* Background Blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-600/20 blur-[120px]" />
                <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[100px]" />
            </div>

            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#030308]/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:shadow-rose-500/40 transition-shadow">
                            <span className="font-bold text-xl">S</span>
                        </div>
                        <span className="text-xl font-black tracking-tight text-white">SY Link</span>
                    </Link>
                    
                    <div className="flex items-center gap-6">
                        <div className="hidden md:block">
                            <LanguageSwitcher inline />
                        </div>
                        <Link to="/login" className="text-white/80 hover:text-white font-semibold transition-colors text-sm">
                            {t.loginNav || 'Log In'}
                        </Link>
                        <Link to="/signup" className="px-5 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                            {t.signupBtn || 'Get Started'}
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 w-full flex flex-col items-center">
                
                {/* Hero Section (Split Layout) */}
                <section className="relative w-full max-w-7xl mx-auto px-6 pt-32 pb-20 flex flex-col lg:flex-row items-center justify-between gap-16">
                    
                    {/* Text Content */}
                    <motion.div 
                        style={{ y: yHero, opacity: opacityHero }}
                        className={`flex-1 flex flex-col ${isRtl ? 'lg:items-start lg:text-right' : 'lg:items-start lg:text-left'} items-center text-center`}
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm font-semibold text-rose-400 mb-8 shadow-lg shadow-rose-500/10"
                        >
                            <FaRocket />
                            <span>{isRtl ? 'المنصة الأولى عربياً للروابط' : 'The #1 Link in Bio Platform'}</span>
                        </motion.div>

                        <motion.h1 
                            initial="hidden" animate="visible" variants={fadeIn}
                            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.15] mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/50"
                        >
                            {isRtl ? 'هويتك الرقمية، في رابط واحد.' : 'Your Digital Identity, One Link.'}
                        </motion.h1>

                        <motion.p 
                            initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }}
                            className="text-lg md:text-xl text-white/60 mb-10 leading-relaxed max-w-xl"
                        >
                            {isRtl 
                                ? 'اجمع حساباتك، روابطك، ومحتواك في صفحة واحدة احترافية. صممها بأسلوبك وشاركها مع العالم بأناقة وسهولة.' 
                                : 'Consolidate your accounts, links, and content into one professional page. Design it your way and share it with the world.'}
                        </motion.p>

                        <motion.div 
                            initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.2 }}
                            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                        >
                            <Link to="/signup" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold text-lg flex items-center justify-center gap-3 hover:scale-105 hover:shadow-rose-500/40 transition-all shadow-lg shadow-rose-500/25">
                                {t.getStarted || 'Start for Free'} <FaArrowRight className={isRtl ? 'rotate-180' : ''} />
                            </Link>
                            <Link to="/demo" className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-white/10 transition-colors backdrop-blur-md">
                                {isRtl ? 'شاهد مثال حي' : 'View Demo'}
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Phone Mockup */}
                    <motion.div 
                        initial={{ opacity: 0, x: isRtl ? -50 : 50, rotate: isRtl ? -5 : 5 }}
                        animate={{ opacity: 1, x: 0, rotate: isRtl ? -2 : 2 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="flex-1 w-full flex justify-center lg:justify-center relative mt-10 lg:mt-0"
                    >
                        {/* Glow Behind Phone */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-tr from-rose-500 to-purple-600 blur-[80px] opacity-20 rounded-full" />
                        
                        {/* The Phone Frame */}
                        <div className="relative w-[300px] h-[600px] bg-[#09090b] rounded-[3rem] border-[8px] border-[#1f1f22] shadow-2xl shadow-black overflow-hidden flex flex-col items-center pt-10 px-4">
                            {/* Dynamic Island / Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#1f1f22] rounded-b-3xl" />
                            
                            {/* Profile Content inside Phone */}
                            <div className="w-full flex flex-col items-center mt-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500 to-purple-500 p-1 mb-4 shadow-lg shadow-purple-500/20">
                                    <div className="w-full h-full bg-[#18181b] rounded-full border-2 border-transparent flex items-center justify-center overflow-hidden">
                                        <div className="text-3xl">✨</div>
                                    </div>
                                </div>
                                <h3 className="text-white font-bold text-xl tracking-tight mb-1">@username</h3>
                                <p className="text-white/50 text-sm mb-8 text-center px-4">Digital Creator & Designer 🎨</p>
                                
                                {/* Links */}
                                <div className="w-full space-y-3">
                                    {[
                                        { title: 'My Portfolio', icon: '🎨' },
                                        { title: 'Latest Video', icon: '📺' },
                                        { title: 'Twitter / X', icon: '🐦' }
                                    ].map((link, i) => (
                                        <div key={i} className="w-full h-14 bg-white/10 hover:bg-white/15 transition-colors rounded-xl flex items-center px-4 border border-white/5 backdrop-blur-sm">
                                            <span className="text-lg">{link.icon}</span>
                                            <span className="flex-1 text-center font-semibold text-white/90 text-sm">{link.title}</span>
                                            <span className="w-5" /> {/* Spacer to balance icon */}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Features Bento Grid */}
                <section className="w-full max-w-7xl mx-auto px-6 mb-40">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            {isRtl ? 'كل ما تحتاجه للنجاح' : 'Everything You Need'}
                        </h2>
                        <p className="text-white/50 text-lg">{isRtl ? 'أدوات قوية بتصميم مبسط.' : 'Powerful tools with a simplified design.'}</p>
                    </div>

                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        <FeatureCard 
                            icon={<FaPaintBrush />}
                            title={isRtl ? 'تصميمات فاخرة' : 'Premium Skins'}
                            desc={isRtl ? 'قوالب جاهزة مذهلة تناسب كل الشخصيات من الجيمنج إلى الأعمال.' : 'Stunning ready-made templates for every personality.'}
                            color="text-rose-400"
                            bg="bg-rose-500/10"
                            colSpan="md:col-span-2"
                        />
                        <FeatureCard 
                            icon={<FaChartLine />}
                            title={isRtl ? 'تحليلات دقيقة' : 'Deep Analytics'}
                            desc={isRtl ? 'تتبع الزيارات، النقرات، والدول بلمح البصر.' : 'Track visits, clicks, and locations at a glance.'}
                            color="text-blue-400"
                            bg="bg-blue-500/10"
                        />
                        <FeatureCard 
                            icon={<FaGlobe />}
                            title={isRtl ? 'دومين مخصص' : 'Custom URL'}
                            desc={isRtl ? 'رابط قصير واحترافي باسمك.' : 'Short, professional link with your name.'}
                            color="text-emerald-400"
                            bg="bg-emerald-500/10"
                        />
                        <FeatureCard 
                            icon={<FaLink />}
                            title={isRtl ? 'روابط لا محدودة' : 'Unlimited Links'}
                            desc={isRtl ? 'أضف كل روابطك في مكان واحد.' : 'Add all your links in one place.'}
                            color="text-purple-400"
                            bg="bg-purple-500/10"
                            colSpan="md:col-span-2"
                        />
                    </motion.div>
                </section>

                {/* How It Works */}
                <section className="w-full bg-white/[0.02] border-y border-white/5 py-32 mb-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-5xl font-black mb-4">
                                {isRtl ? 'كيف يعمل؟' : 'How It Works'}
                            </h2>
                            <p className="text-white/50 text-lg">{isRtl ? 'ثلاث خطوات بسيطة فقط للبدء.' : 'Just three simple steps to start.'}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                            {/* Connector Line */}
                            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />

                            <Step 
                                num="1"
                                icon={<FaUserPlus />}
                                title={isRtl ? 'أنشئ حسابك' : 'Create Account'}
                                desc={isRtl ? 'اختر اسم المستخدم الخاص بك (sy-links.com/name).' : 'Claim your unique username.'}
                            />
                            <Step 
                                num="2"
                                icon={<FaLayerGroup />}
                                title={isRtl ? 'خصص صفحتك' : 'Customize'}
                                desc={isRtl ? 'أضف روابطك واختر التصميم الذي يعبر عنك.' : 'Add links and pick a theme that matches your vibe.'}
                            />
                            <Step 
                                num="3"
                                icon={<FaShareAlt />}
                                title={isRtl ? 'شارك وانطلق' : 'Share & Grow'}
                                desc={isRtl ? 'ضع الرابط في حساباتك وابدأ في استقبال الزوار.' : 'Put the link in your bio and start growing.'}
                            />
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-white/10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <FaRocket className="text-rose-500" size={24}/>
                            <span className="text-2xl font-black">SY Link</span>
                        </div>
                        
                        <div className="flex gap-6 text-sm text-white/50 font-medium">
                            <a href="#" className="hover:text-white transition-colors">{isRtl ? 'الرئيسية' : 'Home'}</a>
                            <a href="#" className="hover:text-white transition-colors">{isRtl ? 'المميزات' : 'Features'}</a>
                            <a href="#" className="hover:text-white transition-colors">{isRtl ? 'الأسعار' : 'Pricing'}</a>
                            <a href="#" className="hover:text-white transition-colors">{isRtl ? 'اتصل بنا' : 'Contact'}</a>
                        </div>

                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><FaXTwitter /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><FaInstagram /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><FaDiscord /></a>
                        </div>
                    </div>
                    <div className="text-center mt-12 text-white/30 text-sm">
                        &copy; {new Date().getFullYear()} SY Link. {isRtl ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
                    </div>
                </footer>

            </main>
        </div>
    )
}

const FeatureCard = ({ icon, title, desc, color, bg, colSpan = "" }) => (
    <motion.div 
        variants={fadeIn}
        className={`p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group ${colSpan}`}
    >
        <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-white/50 leading-relaxed text-lg">{desc}</p>
    </motion.div>
)

const Step = ({ num, icon, title, desc }) => (
    <div className="flex flex-col items-center text-center group">
        <div className="w-20 h-20 rounded-full bg-[#0a0a16] border border-white/10 flex items-center justify-center text-3xl text-white/80 mb-6 relative group-hover:border-rose-500/50 transition-colors shadow-xl">
            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-sm font-bold shadow-lg">
                {num}
            </div>
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-white/50">{desc}</p>
    </div>
)

export default Landing
