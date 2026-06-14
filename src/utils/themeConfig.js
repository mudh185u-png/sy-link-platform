export const THEMES = {
    'standard': {
        id: 'standard',
        category: 'basic',
        container: 'bg-white/5 backdrop-blur-md border border-white/10 shadow-lg rounded-2xl',
        font: "'Outfit', sans-serif",
        avatarShape: 'rounded-full',
        iconStyle: 'rounded-full bg-white/10 border-white/20',
        profile: {
            name: 'text-white font-bold',
            bio: 'text-white/70',
            avatarBorder: 'ring-2 ring-white/20',
        },
        link: {
            wrapper: 'bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all duration-300',
            icon: 'text-white/60',
            title: 'text-white',
            platformIcon: 'text-white/50',
        },
    },
    'phantom-velvet': {
        id: 'phantom-velvet',
        category: 'premium',
        container: 'bg-[#0f0000]/60 backdrop-blur-[60px] border border-red-900/30 shadow-[0_0_80px_rgba(255,0,0,0.15)] rounded-3xl',
        font: "'Outfit', sans-serif",
        avatarShape: 'rounded-full',
        iconStyle: 'rounded-full',
        profile: {
            name: 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-300 to-red-500 font-black tracking-tighter drop-shadow-[0_0_10px_rgba(255,0,0,0.3)]',
            bio: 'text-red-100/60 font-medium',
            avatarBorder: 'ring-2 ring-red-500/50 ring-offset-4 ring-offset-[#0f0000] shadow-[0_0_30px_rgba(255,0,0,0.5)]',
        },
        link: {
            wrapper: 'bg-gradient-to-r from-red-950/40 via-black/80 to-red-950/40 backdrop-blur-md border border-red-900/40 hover:border-red-500/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(255,0,0,0.4)] hover:-translate-y-1 transition-all duration-300 rounded-2xl group',
            icon: 'text-red-500 group-hover:text-red-300 drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]',
            title: 'text-red-50 font-bold tracking-widest uppercase text-sm',
            platformIcon: 'text-red-900/50 group-hover:text-red-500/50',
        },
    },
    'holo-glass': {
        id: 'holo-glass',
        category: 'premium',
        container: 'bg-white/5 backdrop-blur-[80px] border border-white/20 shadow-[0_8px_32px_rgba(255,255,255,0.05),inset_0_0_30px_rgba(255,255,255,0.05)] rounded-[2.5rem]',
        font: "'Outfit', sans-serif",
        avatarShape: 'rounded-full',
        iconStyle: 'rounded-full',
        profile: {
            name: 'text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] via-[#4facfe] to-[#00f2fe] font-extrabold drop-shadow-[0_0_15px_rgba(79,172,254,0.4)]',
            bio: 'text-[#e0f2fe]/70 font-light tracking-wide',
            avatarBorder: 'ring-2 ring-[#4facfe]/60 ring-offset-4 ring-offset-transparent shadow-[0_0_40px_rgba(79,172,254,0.3)]',
        },
        link: {
            wrapper: 'bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-[#4facfe]/50 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(79,172,254,0.2)] transition-all duration-300 rounded-3xl group',
            icon: 'text-[#4facfe] group-hover:text-white drop-shadow-[0_0_10px_rgba(79,172,254,0.5)]',
            title: 'text-white font-medium tracking-wider',
            platformIcon: 'text-[#4facfe]/30 group-hover:text-[#4facfe]/60',
        },
    },
    'obsidian-gold': {
        id: 'obsidian-gold',
        category: 'premium',
        container: 'bg-[#0a0800]/90 backdrop-blur-3xl border border-amber-900/30 shadow-[0_20px_60px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,215,0,0.2)] rounded-[2rem]',
        font: "'Playfair Display', serif",
        avatarShape: 'rounded-full',
        iconStyle: 'rounded-full',
        profile: {
            name: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 font-black tracking-tight',
            bio: 'text-amber-200/40 italic',
            avatarBorder: 'ring-2 ring-amber-500/60 ring-offset-4 ring-offset-[#0a0800] shadow-[0_0_30px_rgba(255,215,0,0.2)]',
        },
        link: {
            wrapper: 'bg-gradient-to-r from-[#1a1200] to-[#0a0800] border border-amber-700/30 hover:border-amber-500/80 shadow-[0_8px_20px_rgba(0,0,0,0.8)] hover:shadow-[0_0_30px_rgba(255,215,0,0.15)] hover:-translate-y-1 transition-all duration-300 rounded-2xl group',
            icon: 'text-amber-500 group-hover:text-amber-300',
            title: 'text-amber-100 font-semibold tracking-wider text-sm',
            platformIcon: 'text-amber-700/30 group-hover:text-amber-500/50',
        },
    },

    // ═══════════════════════════════════════════════════════════
    //  CATEGORY SKINS
    // ═══════════════════════════════════════════════════════════

    'social-influencer': {
        id: 'social-influencer',
        category: 'social',
        container: 'bg-[#050505]/95 backdrop-blur-3xl border border-white/10 rounded-[3rem] mt-10 shadow-2xl',
        font: "'Inter', sans-serif",
        avatarShape: 'rounded-[2rem]',
        iconStyle: 'rounded-full bg-black border border-white/20',
        profile: {
            name: '!text-white font-black tracking-tighter text-3xl',
            bio: '!text-white/60 font-medium',
            avatarBorder: 'p-[3px] bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] via-[#bc1888] to-[#833ab4] rounded-[2rem] shadow-[0_0_20px_rgba(225,48,108,0.3)]',
        },
        link: {
            // Clean gradient border via standard tailwind border, no pseudo hacks
            wrapper: 'bg-black border-2 border-transparent bg-clip-padding relative group hover:-translate-y-1 transition-all duration-300 rounded-full shadow-lg before:absolute before:-inset-[2px] before:-z-10 before:rounded-full before:bg-gradient-to-r before:from-[#f09433] before:via-[#dc2743] before:to-[#833ab4] before:opacity-80 hover:before:opacity-100 before:transition-opacity',
            icon: 'text-white group-hover:scale-110 transition-transform duration-300',
            title: '!text-white font-bold text-base tracking-wide',
            platformIcon: 'text-white/30 group-hover:text-white transition-colors',
        },
        customCSS: `
            .skin-social-influencer .bio-container {
                background: #111 !important;
                border: 1px solid rgba(255,255,255,0.1) !important;
            }
        `,
        decorations: [
            { type: 'gradient-orb', position: 'top-left', colors: ['#833ab4', '#dc2743'], size: 200, blur: 100, opacity: 0.15 },
            { type: 'gradient-orb', position: 'bottom-right', colors: ['#f09433', '#dc2743'], size: 200, blur: 120, opacity: 0.15 },
        ],
    },

    'pro-gamer': {
        id: 'pro-gamer',
        category: 'gaming',
        container: 'bg-[#020a05]/95 border border-[#00ff41]/20 shadow-[0_0_30px_rgba(0,255,65,0.1)] rounded-xl mt-10 backdrop-blur-xl',
        font: "'Share Tech Mono', 'Courier New', monospace",
        avatarShape: 'rounded-xl',
        iconStyle: 'rounded-none bg-[#0a1f0f] border border-[#00ff41]/40',
        profile: {
            name: '!text-[#00ff41] font-black uppercase tracking-[0.25em] drop-shadow-[0_0_8px_rgba(0,255,65,0.6)]',
            bio: '!text-[#00ff41]/70 font-mono text-xs uppercase tracking-[0.2em]',
            avatarBorder: 'ring-[2px] ring-[#00ff41] ring-offset-4 ring-offset-[#020a05] rounded-xl',
        },
        link: {
            wrapper: 'bg-[#051108] border border-[#00ff41]/30 hover:bg-[#00ff41]/10 hover:border-[#00ff41] hover:shadow-[0_0_15px_rgba(0,255,65,0.3)] transition-all duration-300 rounded-none group',
            icon: 'text-[#00ff41] drop-shadow-[0_0_5px_rgba(0,255,65,0.8)]',
            title: '!text-[#e0ffe0] group-hover:!text-[#00ff41] font-mono font-bold uppercase tracking-[0.2em] text-sm transition-colors',
            platformIcon: 'text-[#00ff41]/40 group-hover:text-[#00ff41] transition-colors',
        },
        customCSS: `
            .skin-pro-gamer .bio-container {
                border-radius: 0 !important;
                border-left: 2px solid #00ff41 !important;
                background: #051108 !important;
            }
            .skin-pro-gamer .bio-container span {
                color: #e0ffe0 !important;
                font-family: 'Share Tech Mono', monospace !important;
            }
            .skin-pro-gamer footer * {
                color: #00ff41 !important;
                font-family: 'Share Tech Mono', monospace !important;
                text-transform: uppercase !important;
            }
            .skin-pro-gamer footer {
                background: #051108 !important;
                border-top: 1px solid rgba(0, 255, 65, 0.2) !important;
            }
        `,
        decorations: [
            { type: 'corner-bracket', position: 'top-left', color: '#00ff41' },
            { type: 'corner-bracket', position: 'bottom-right', color: '#00ff41' },
        ],
    },

    'soft-girly': {
        id: 'soft-girly',
        category: 'girly',
        container: 'bg-pink-100/10 backdrop-blur-2xl border border-pink-300/30 shadow-[0_15px_50px_rgba(255,182,193,0.15)] rounded-[3rem] mt-10',
        font: "'Quicksand', 'Nunito', sans-serif",
        avatarShape: 'rounded-full',
        iconStyle: 'rounded-full bg-pink-500/10 border-pink-300/50',
        profile: {
            name: '!text-pink-300 font-extrabold tracking-tight drop-shadow-md',
            bio: '!text-pink-200 font-medium',
            avatarBorder: 'ring-4 ring-pink-400/50 ring-offset-4 ring-offset-transparent shadow-[0_8px_25px_rgba(255,105,180,0.3)]',
        },
        link: {
            wrapper: 'bg-pink-500/10 backdrop-blur-md border border-pink-300/40 hover:bg-pink-500/20 hover:border-pink-300 hover:shadow-[0_8px_30px_rgba(255,105,180,0.3)] hover:-translate-y-1 transition-all duration-300 rounded-full group',
            icon: 'text-pink-400 group-hover:text-pink-300',
            title: '!text-pink-100 group-hover:!text-white font-bold text-sm',
            platformIcon: 'text-pink-300/50 group-hover:text-pink-300',
        },
        customCSS: `
            @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
            .skin-soft-girly .bio-container {
                background: rgba(236, 72, 153, 0.1) !important;
                backdrop-filter: blur(12px) !important;
                border: 1px solid rgba(244, 114, 182, 0.3) !important;
                border-radius: 999px !important;
            }
            .skin-soft-girly .bio-container span {
                color: #fbcfe8 !important;
                font-family: 'Quicksand', sans-serif !important;
            }
            .skin-soft-girly .link-icon-circle {
                background: rgba(236, 72, 153, 0.15) !important;
                border: 1px solid rgba(244, 114, 182, 0.4) !important;
            }
            .skin-soft-girly .link-icon-circle svg {
                color: #f9a8d4 !important;
            }
            .skin-soft-girly footer {
                background: rgba(236, 72, 153, 0.05) !important;
                border: 1px solid rgba(244, 114, 182, 0.2) !important;
                border-radius: 2rem !important;
            }
            .skin-soft-girly footer * {
                color: #fbcfe8 !important;
                font-family: 'Quicksand', sans-serif !important;
            }
        `,
        decorations: [
            { type: 'emoji', emoji: '🌸', position: 'top-right', size: 28, opacity: 0.8 },
            { type: 'emoji', emoji: '✨', position: 'top-left', size: 22, opacity: 0.8 },
        ],
    },
}

export const getThemeConfig = (skinId) => {
    return THEMES[skinId] || THEMES['standard'];
}
