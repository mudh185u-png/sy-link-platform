import React from 'react'
import { Outlet } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'

const AdminLayout = () => {
    const { language } = useLanguage()
    const isRtl = language === 'ar'
    
    return (
        <div className={`min-h-screen w-full bg-[#030308] text-white relative overflow-x-hidden ${isRtl ? 'rtl' : 'ltr'}`} style={{ fontFamily: isRtl ? 'Tajawal, sans-serif' : 'Outfit, sans-serif' }}>
            
            {/* Cosmic Background Blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
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
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgibm9pc2VGaWx0ZXIpIi8+PC9zdmc+')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
            </div>

            <div style={{
                width: '100%',
                paddingTop: '100px', // Increased padding to clear the 65px fixed header
                paddingBottom: '110px', // Room for BottomNav
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '800px',
                    padding: '0 1rem', // Horizontal breathing room
                    boxSizing: 'border-box'
                }}>
                    <Outlet />
                </div>
            </div>
            
            <div className="z-50 relative">
                <BottomNav />
            </div>
        </div>
    )
}

export default AdminLayout
