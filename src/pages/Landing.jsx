import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import {
    FaShieldAlt, FaMagic, FaGlobe, FaPaintBrush, FaArrowRight, FaBolt,
    FaChartLine, FaMobileAlt, FaRocket, FaCheck, FaUserPlus, FaLayerGroup
} from 'react-icons/fa'
import { FaXTwitter, FaInstagram, FaDiscord } from 'react-icons/fa6'
import AnimatedBackground from '../components/AnimatedBackground'
import { useAuth } from '../contexts/AuthContext'
import AdCard from '../components/AdCard'

const Landing = () => {
    const { t, language } = useLanguage()
    const { settings } = useAuth()
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div style={{
            width: '100%',
            minHeight: '100vh',
            color: '#fff',
            position: 'relative',
            direction: language === 'ar' ? 'rtl' : 'ltr',
            overflowX: 'hidden',
            fontFamily: language === 'ar' ? 'Tajawal, sans-serif' : 'Outfit, sans-serif'
        }}>
            <AnimatedBackground type="animated" config={{ color: '#ff2d55' }} />

            {/* NAVBAR */}
            <nav style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '80px',
                background: scrolled ? 'rgba(5, 5, 12, 0.8)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 5%',
                zIndex: 1000,
                transition: 'all 0.3s ease'
            }}>
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--accent-color), #ff2d55)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(255, 45, 85, 0.3)'
                    }}>
                        <FaBolt color="#fff" size={20} />
                    </div>
                    <span className="brand-logo" style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>SY Link</span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="desktop-only">
                        <LanguageSwitcher inline />
                    </div>
                    <Link to="/login" style={{
                        textDecoration: 'none',
                        color: '#fff',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        opacity: 0.8,
                        transition: 'opacity 0.2s'
                    }}>
                        {t.loginNav || 'Log In'}
                    </Link>
                    <Link to="/signup" style={{
                        padding: '10px 24px',
                        background: '#fff',
                        borderRadius: '100px',
                        color: '#000',
                        fontWeight: '800',
                        fontSize: '0.9rem',
                        textDecoration: 'none',
                        transition: 'transform 0.2s',
                        boxShadow: '0 5px 20px rgba(255,255,255,0.2)'
                    }}>
                        {t.signupBtn || 'Get Started'}
                    </Link>
                </div>
            </nav>

            <main style={{ position: 'relative', zIndex: 1 }}>

                {/* HERO SECTION */}
                <section style={{
                    padding: '180px 20px 100px',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 16px',
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '100px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: 'var(--accent-color)',
                        marginBottom: '30px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <FaRocket size={12} /> {language === 'ar' ? 'المنصة الأولى عربياً للروابط' : '#1 Social Hub Platform'}
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 8vw, 5.5rem)',
                        fontWeight: '900',
                        lineHeight: 1.1,
                        marginBottom: '25px',
                        background: 'linear-gradient(to right, #fff, rgba(255,255,255,0.7))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-2px',
                        maxWidth: '900px'
                    }}>
                        {language === 'ar' ? 'هويتك الرقمية، في رابط واحد.' : 'Your Digital Identity, One Link.'}
                    </h1>

                    <p style={{
                        fontSize: 'clamp(1.1rem, 4vw, 1.3rem)',
                        color: 'rgba(255,255,255,0.6)',
                        maxWidth: '650px',
                        lineHeight: 1.6,
                        marginBottom: '50px'
                    }}>
                        {language === 'ar'
                            ? 'اجمع حساباتك، روابطك، ومحتواك في صفحة واحدة احترافية. صممها بأسلوبك وشاركها مع العالم بأناقة.'
                            : 'Consolidate your accounts, links, and content into one professional page. Design it your way and share it with the world in style.'}
                    </p>

                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Link to="/signup" style={{
                            padding: '16px 40px',
                            background: 'var(--accent-gradient)',
                            border: 'none',
                            borderRadius: '16px',
                            color: '#fff',
                            fontWeight: '800',
                            fontSize: '1.1rem',
                            textDecoration: 'none',
                            boxShadow: '0 20px 40px rgba(255,45,85,0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'transform 0.2s',
                        }}>
                            {t.getStarted || 'Start for Free'} <FaArrowRight />
                        </Link>
                        <Link to="/demo" style={{
                            padding: '16px 40px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            color: '#fff',
                            fontWeight: '700',
                            fontSize: '1.1rem',
                            textDecoration: 'none',
                            backdropFilter: 'blur(10px)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            {language === 'ar' ? 'شاهد مثال' : 'View Demo'}
                        </Link>
                    </div>
                </section>

                {/* VISUAL MOCKUP SECTION */}
                <section style={{ padding: '0 20px 100px', textAlign: 'center' }}>
                    <div style={{
                        maxWidth: '1000px',
                        margin: '0 auto',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '24px',
                        padding: '40px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)',
                            width: '60%', height: '100%', background: 'var(--accent-color)', filter: 'blur(150px)', opacity: 0.15
                        }}></div>

                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', position: 'relative', zIndex: 1
                        }}>
                            <FeatureBlock
                                icon={<FaPaintBrush size={24} color="#ff2d55" />}
                                title={language === 'ar' ? 'تصميمات فاخرة' : 'Premium Skins'}
                                desc={language === 'ar' ? 'مظهر ثوري، ذهبي، ألعاب، والمزيد.' : 'Revolution, Luxury, Gaming themes and more.'}
                            />
                            <FeatureBlock
                                icon={<FaChartLine size={24} color="#00f2ff" />}
                                title={language === 'ar' ? 'تحليلات متقدمة' : 'Analytics'}
                                desc={language === 'ar' ? 'تتبع الزيارات والتفاعل بدقة عالية.' : 'Track visits and engagement with precision.'}
                            />
                            <FeatureBlock
                                icon={<FaGlobe size={24} color="#4ade80" />}
                                title={language === 'ar' ? 'دومين مخصص' : 'Custom URL'}
                                desc={language === 'ar' ? 'رابط قصير واحترافي باسمك.' : 'Short, professional link with your name.'}
                            />
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section style={{ padding: '100px 20px', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '15px' }}>
                                {language === 'ar' ? 'كيف يعمل؟' : 'How It Works'}
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.5)' }}>
                                {language === 'ar' ? 'ثلاث خطوات بسيطة فقط.' : 'Just three simple steps.'}
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                            <StepCard
                                number="1"
                                icon={<FaUserPlus />}
                                title={language === 'ar' ? 'أنشئ حسابك' : 'Create Account'}
                                desc={language === 'ar' ? 'سجل في ثوانٍ واختر اسم المستخدم الخاص بك.' : 'Sign up in seconds and claim your unique username.'}
                            />
                            <StepCard
                                number="2"
                                icon={<FaLayerGroup />}
                                title={language === 'ar' ? 'خصص صفحتك' : 'Customize Page'}
                                desc={language === 'ar' ? 'أضف روابطك، اختر "سكن" يناسب شخصيتك، وعدّل الألوان.' : 'Add links, choose a skin that fits your style, and tweak colors.'}
                            />
                            <StepCard
                                number="3"
                                icon={<FaGlobe />}
                                title={language === 'ar' ? 'شارك وانطلق' : 'Share & Grow'}
                                desc={language === 'ar' ? 'ضع الرابط في بايو حساباتك وابدأ في استقبال الزوار.' : 'Put the link in your bio and start getting visitors.'}
                            />
                        </div>
                    </div>
                </section>

                {/* HOMEPAGE ADS */}
                {(settings?.profile_ads || [])
                    .filter(ad => ad.active && ad.placement === 'home')
                    .sort((a, b) => (a.inject_index || 0) - (b.inject_index || 0))
                    .map(ad => (
                        <div key={ad.id} style={{ maxWidth: '600px', margin: '0 auto 40px', padding: '0 20px' }}>
                            <AdCard ad={ad} skin="light" />
                        </div>
                    ))
                }

                {/* FOOTER */}
                <footer style={{
                    padding: '80px 20px 40px',
                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
                    borderTop: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
                            <FaBolt size={24} color="var(--accent-color)" />
                            <span style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-1px' }}>SY Link</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '40px', flexWrap: 'wrap' }}>
                            <FooterLink>{language === 'ar' ? 'عن المنصة' : 'About'}</FooterLink>
                            <FooterLink>{language === 'ar' ? 'المميزات' : 'Features'}</FooterLink>
                            <FooterLink>{language === 'ar' ? 'الأسعار' : 'Pricing'}</FooterLink>
                            <FooterLink>{language === 'ar' ? 'اتصل بنا' : 'Contact'}</FooterLink>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
                            <SocialIcon icon={<FaXTwitter />} />
                            <SocialIcon icon={<FaInstagram />} />
                            <SocialIcon icon={<FaDiscord />} />
                        </div>

                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
                            &copy; 2026 SY Link. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'} <br />
                            {language === 'ar' ? 'طور بواسطة' : 'Developed by'} <span style={{ color: '#fff', fontWeight: 'bold' }}>MUD</span>
                        </p>
                    </div>
                </footer>

            </main>
        </div>
    )
}

const FeatureBlock = ({ icon, title, desc }) => (
    <div style={{
        padding: '30px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '20px',
        textAlign: 'start',
        border: '1px solid rgba(255,255,255,0.05)',
        transition: 'all 0.3s ease',
        cursor: 'default'
    }} className="hover:bg-white/5 hover:border-white/10">
        <div style={{ marginBottom: '15px' }}>{icon}</div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>{title}</h3>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{desc}</p>
    </div>
)

const StepCard = ({ number, icon, title, desc }) => (
    <div style={{
        position: 'relative',
        padding: '40px 30px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center'
    }}>
        <div style={{
            position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)',
            width: '30px', height: '30px', background: 'var(--accent-color)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem'
        }}>
            {number}
        </div>
        <div style={{ fontSize: '2.5rem', color: 'rgba(255,255,255,0.8)', marginBottom: '20px' }}>{icon}</div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '10px' }}>{title}</h3>
        <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{desc}</p>
    </div>
)

const FooterLink = ({ children }) => (
    <a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }}>
        {children}
    </a>
)

const SocialIcon = ({ icon }) => (
    <a href="#" style={{
        width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none',
        transition: 'background 0.2s'
    }}>
        {icon}
    </a>
)

export default Landing
