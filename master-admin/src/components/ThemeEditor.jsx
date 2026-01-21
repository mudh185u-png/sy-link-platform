import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { FaSave, FaMobileAlt, FaDesktop, FaLayerGroup, FaBolt, FaGamepad, FaCrown, FaLeaf, FaImage, FaEye, FaEyeSlash } from 'react-icons/fa'
import { useLanguage } from '../contexts/LanguageContext'

const ThemeEditor = () => {
    const { t } = useLanguage()
    const [config, setConfig] = useState({
        container_width: '380px',
        input_width: '85%',
        glass_panel_width: '100%',
        section_order: ['header', 'add_link', 'links_list'],
        theme_color: '#e94560',
        default_skin: 'standard'
    })
    const iframeRef = useRef(null)
    const [saving, setSaving] = useState(false)
    const [viewMode, setViewMode] = useState('mobile') // mobile | desktop

    const [editMode, setEditMode] = useState(false)
    const [selectedElement, setSelectedElement] = useState(null) // { id, type, section }

    // Defined locally for Master Admin to match AdminBackground
    const availableSkins = [
        { id: 'standard', name: t.skinStandard, icon: <FaLayerGroup /> },
        { id: 'neon', name: t.skinNeon, icon: <FaBolt /> },
        { id: 'gaming', name: t.skinGaming, icon: <FaGamepad /> },
        { id: 'luxury', name: t.skinLuxury, icon: <FaCrown /> },
        { id: 'minimal', name: t.skinMinimal, icon: <FaLeaf /> },
        { id: 'social', name: t.skinSocial, icon: <FaImage /> },
        { id: 'syria', name: t.skinSyria, icon: <FaBolt style={{ color: '#E4312b' }} /> },
    ]

    useEffect(() => {
        fetchSettings()
    }, [])

    // Broadcast update to iframe helper
    const syncToPreview = (newConfig) => {
        if (iframeRef.current) {
            iframeRef.current.contentWindow.postMessage({
                type: 'UPDATE_THEME_PREVIEW',
                payload: newConfig
            }, '*')
        }
    }

    // Listen for messages from the iframe
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data.type === 'SYNC_THEME_UPDATE') {
                console.log("Admin received sync:", event.data.payload)
                const updatedConfig = {
                    ...config,
                    ...event.data.payload
                }
                setConfig(updatedConfig)
                // NO: Don't echo back SYNC_THEME_UPDATE immediately to avoid loops
                // but we should ensure the parent's memory is updated.
            }
            if (event.data.type === 'ELEMENT_SELECTED') {
                console.log("Element Selected:", event.data.payload)
                setSelectedElement(event.data.payload)
            }
        }

        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [config])

    // Sync language to preview
    useEffect(() => {
        if (iframeRef.current) {
            iframeRef.current.contentWindow.postMessage({
                type: 'SET_LANGUAGE',
                payload: t.langCode // Assuming you have langCode in translations or derived from state
            }, '*')
        }
    }, [t])

    const toggleEditMode = (isChecked) => {
        setEditMode(isChecked)
        if (iframeRef.current) {
            iframeRef.current.contentWindow.postMessage({
                type: 'TOGGLE_EDIT_MODE',
                payload: isChecked
            }, '*')
        }
        if (!isChecked) setSelectedElement(null) // Deselect on exit
    }

    const fetchSettings = async () => {
        const { data } = await supabase.from('site_settings').select('config').single()
        if (data?.config) {
            setConfig(prev => ({ ...prev, ...data.config }))
        }
    }

    const updateConfig = (key, value) => {
        let newConfig;

        if (selectedElement) {
            // Update specific element style
            const targetId = selectedElement.id
            const currentStyles = config.styles || {}
            const elementStyle = currentStyles[targetId] || {}

            newConfig = {
                ...config,
                styles: {
                    ...currentStyles,
                    [targetId]: {
                        ...elementStyle,
                        [key]: value
                    }
                }
            }
        } else {
            // Update global config
            newConfig = { ...config, [key]: value }
        }

        setConfig(newConfig)

        // Live Update! Send to Iframe
        if (iframeRef.current) {
            iframeRef.current.contentWindow.postMessage({
                type: 'UPDATE_THEME_PREVIEW',
                payload: newConfig
            }, '*')
        }
    }

    const saveSettings = async () => {
        setSaving(true)
        try {
            // First check if any row exists
            const { data: existing } = await supabase.from('site_settings').select('id').limit(1).single()
            if (existing) {
                await supabase.from('site_settings').update({ config, updated_at: new Date() }).eq('id', existing.id)
            } else {
                await supabase.from('site_settings').insert([{ config }])
            }

            // Sync global skin controls to platform_settings
            const globalSkinControls = {
                allowed_skins: config.allowed_skins || [],
                default_skin: config.default_skin || 'standard'
            }
            await supabase
                .from('platform_settings')
                .upsert({
                    key: 'page_backgrounds',
                    value: JSON.stringify(globalSkinControls)
                }, { onConflict: 'key' })

            alert(t.settingsUpdated)
        } catch (e) {
            alert('Save failed: ' + e.message)
        } finally {
            setSaving(false)
        }
    }

    // Helper to get current value (Specific > Global)
    const getValue = (key, fallback) => {
        const elementId = selectedElement?.id
        if (elementId && config.styles?.[elementId]?.[key] !== undefined) {
            return config.styles[elementId][key]
        }
        return config[key] ?? fallback
    }

    const getNum = (val) => parseInt(val) || 0

    return (
        <div style={{ display: 'flex', gap: '30px', height: '80vh', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>

            {/* Sidebar Controls */}
            <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '25px', overflowY: 'auto', paddingRight: '10px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>🎛️ {t.visualEditor}</h3>

                {/* Selected Element Indicator */}
                {editMode && (
                    <div
                        className="glass-panel"
                        style={{
                            padding: '1rem',
                            background: selectedElement ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255,255,255,0.05)',
                            borderRadius: '15px',
                            border: selectedElement ? '1px solid #4caf50' : '1px solid rgba(255,255,255,0.1)',
                            position: 'relative'
                        }}
                    >
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', opacity: 0.6, textTransform: 'uppercase', marginBottom: '4px' }}>
                            {selectedElement ? t.selectedElement : t.situation}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', color: selectedElement ? '#4caf50' : '#fff' }}>
                            {selectedElement ? selectedElement.id.replace(/_/g, ' ').toUpperCase() : t.globalDesign}
                        </div>
                        {selectedElement && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{t.elementType} {selectedElement.type.toUpperCase()}</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => {
                                            const newStyles = { ...config.styles }
                                            delete newStyles[selectedElement.id]
                                            updateConfig('styles', newStyles)
                                            setSelectedElement(null)
                                        }}
                                        title={t.resetStyles}
                                        style={{ background: 'none', border: 'none', color: '#ff4b2b', fontSize: '1rem', cursor: 'pointer' }}
                                    >
                                        🗑️
                                    </button>
                                    <button
                                        onClick={() => setSelectedElement(null)}
                                        style={{ background: 'none', border: 'none', color: '#ff4b2b', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        {t.clearX}
                                    </button>
                                </div>
                            </div>
                        )}
                        {!selectedElement && <div style={{ fontSize: '0.7rem', marginTop: '5px', opacity: 0.5 }}>{t.clickTip}</div>}
                    </div>
                )}

                {/* Dynamic Element Controls (God Mode) */}
                {selectedElement && (
                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(76, 175, 80, 0.05)', borderRadius: '20px', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '15px', color: '#4caf50' }}>{t.granularStyle}</h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Text/Input Specific Controls */}
                            {(selectedElement.type === 'text' || selectedElement.type === 'input') && (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.fontSize}</label>
                                            <input
                                                type="range" min="8" max="80"
                                                value={getNum(getValue('font_size', '16px'))}
                                                onChange={(e) => updateConfig('font_size', `${e.target.value}px`)}
                                                style={{ width: '100%', accentColor: '#4caf50' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.fontWeight}</label>
                                            <select
                                                value={getValue('font_weight', 'normal')}
                                                onChange={(e) => updateConfig('font_weight', e.target.value)}
                                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.8rem' }}
                                            >
                                                <option value="100">{t.weightThin || 'Thin'}</option>
                                                <option value="400">{t.weightNormal || 'Normal'}</option>
                                                <option value="600">{t.weightSemiBold || 'Semi Bold'}</option>
                                                <option value="700">{t.weightBold || 'Bold'}</option>
                                                <option value="900">{t.weightBlack || 'Black'}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.lineHeight}</label>
                                            <input
                                                type="range" min="0.8" max="3" step="0.1"
                                                value={getValue('line_height', 1.2)}
                                                onChange={(e) => updateConfig('line_height', parseFloat(e.target.value))}
                                                style={{ width: '100%', accentColor: '#4caf50' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.letterSpacing}</label>
                                            <input
                                                type="range" min="-5" max="20"
                                                value={getValue('letter_spacing', 0)}
                                                onChange={(e) => updateConfig('letter_spacing', parseInt(e.target.value))}
                                                style={{ width: '100%', accentColor: '#4caf50' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                                                <label>{t.textColor}</label>
                                                <input
                                                    type="color"
                                                    value={getValue('text_color', '#ffffff')}
                                                    onChange={(e) => updateConfig('text_color', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.textShadow}</label>
                                            <input
                                                type="range" min="0" max="20"
                                                value={getNum(getValue('text_shadow', '0px').replace('px', ''))}
                                                onChange={(e) => updateConfig('text_shadow', `${e.target.value}px rgba(0,0,0,0.5)`)}
                                                style={{ width: '100%', accentColor: '#4caf50' }}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Icon Specific Controls */}
                            {selectedElement.type === 'icon' && (
                                <>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                                            <label>{t.iconSize}</label>
                                            <span style={{ opacity: 0.7 }}>{getValue('icon_size', 20)}px</span>
                                        </div>
                                        <input
                                            type="range" min="10" max="120"
                                            value={getValue('icon_size', 20)}
                                            onChange={(e) => updateConfig('icon_size', parseInt(e.target.value))}
                                            style={{ width: '100%', accentColor: '#4caf50' }}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.width}</label>
                                            <input
                                                type="range" min="1" max="500"
                                                value={getValue('width', 20)}
                                                onChange={(e) => updateConfig('width', parseInt(e.target.value))}
                                                style={{ width: '100%', accentColor: '#4caf50' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.height}</label>
                                            <input
                                                type="range" min="1" max="500"
                                                value={getValue('height', 20)}
                                                onChange={(e) => updateConfig('height', parseInt(e.target.value))}
                                                style={{ width: '100%', accentColor: '#4caf50' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.rotation}</label>
                                            <input
                                                type="range" min="0" max="360"
                                                value={getValue('rotation', 0)}
                                                onChange={(e) => updateConfig('rotation', parseInt(e.target.value))}
                                                style={{ width: '100%', accentColor: '#4caf50' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block', marginBottom: '5px' }}>{t.horizontalFlip}</label>
                                            <button
                                                onClick={() => updateConfig('flip_h', getValue('flip_h', 1) === 1 ? -1 : 1)}
                                                style={{ padding: '5px', background: getValue('flip_h', 1) === -1 ? '#4caf50' : 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                                            >
                                                {getValue('flip_h', 1) === -1 ? t.flipped : t.normal}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                                            <label>{t.iconColor}</label>
                                            <input
                                                type="color"
                                                value={getValue('icon_color', config.theme_color)}
                                                onChange={(e) => updateConfig('icon_color', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Container Specific Controls */}
                            {selectedElement.type === 'container' && (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.padding}</label>
                                            <input
                                                type="range" min="0" max="100"
                                                value={getNum(getValue('padding', '1.86rem').replace('rem', '')) * 10}
                                                onChange={(e) => updateConfig('padding', `${e.target.value / 10}rem`)}
                                                style={{ width: '100%', accentColor: '#4caf50' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.radius}</label>
                                            <input
                                                type="range" min="0" max="100"
                                                value={getNum(getValue('border_radius', '24px'))}
                                                onChange={(e) => updateConfig('border_radius', `${e.target.value}px`)}
                                                style={{ width: '100%', accentColor: '#4caf50' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.glassBlur}</label>
                                            <input
                                                type="range" min="0" max="50"
                                                value={getNum(getValue('backdrop_blur', '15px'))}
                                                onChange={(e) => updateConfig('backdrop_blur', `${e.target.value}px`)}
                                                style={{ width: '100%', accentColor: '#4caf50' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.borderWidth}</label>
                                            <input
                                                type="range" min="0" max="10"
                                                value={getNum(getValue('border_width', '1px'))}
                                                onChange={(e) => updateConfig('border_width', `${e.target.value}px`)}
                                                style={{ width: '100%', accentColor: '#4caf50' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.contrast}</label>
                                            <input
                                                type="range" min="50" max="200"
                                                value={getNum(getValue('backdrop_contrast', '100%').replace('%', ''))}
                                                onChange={(e) => updateConfig('backdrop_contrast', `${e.target.value}%`)}
                                                style={{ width: '100%', accentColor: '#4caf50' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.brightness}</label>
                                            <input
                                                type="range" min="50" max="200"
                                                value={getNum(getValue('backdrop_brightness', '100%').replace('%', ''))}
                                                onChange={(e) => updateConfig('backdrop_brightness', `${e.target.value}%`)}
                                                style={{ width: '100%', accentColor: '#4caf50' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.saturate}</label>
                                            <input
                                                type="range" min="0" max="300"
                                                value={getNum(getValue('backdrop_saturate', '100%').replace('%', ''))}
                                                onChange={(e) => updateConfig('backdrop_saturate', `${e.target.value}%`)}
                                                style={{ width: '100%', accentColor: '#4caf50' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.borderStyle}</label>
                                            <select
                                                value={getValue('border_style', 'solid')}
                                                onChange={(e) => updateConfig('border_style', e.target.value)}
                                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.8rem' }}
                                            >
                                                <option value="solid">{t.borderSolid || 'Solid'}</option>
                                                <option value="dashed">{t.borderDashed || 'Dashed'}</option>
                                                <option value="dotted">{t.borderDotted || 'Dotted'}</option>
                                                <option value="double">{t.borderDouble || 'Double'}</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Shadow Controls */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 1fr', gap: '10px', marginTop: '10px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.shadowBlur}</label>
                                            <input
                                                type="range" min="0" max="100"
                                                value={getNum(getValue('shadow_blur', '0px'))}
                                                onChange={(e) => updateConfig('shadow_blur', `${e.target.value}px`)}
                                                style={{ width: '100%', accentColor: '#4caf50' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.shadowSpread}</label>
                                            <input
                                                type="range" min="-20" max="50"
                                                value={getNum(getValue('shadow_spread', '0px'))}
                                                onChange={(e) => updateConfig('shadow_spread', `${e.target.value}px`)}
                                                style={{ width: '100%', accentColor: '#4caf50' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '5px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.shadowColor}</label>
                                            <input
                                                type="color"
                                                value={getValue('shadow_color', '#000000')}
                                                onChange={(e) => updateConfig('shadow_color', e.target.value)}
                                                style={{ width: '100%', cursor: 'pointer', background: 'transparent', border: 'none' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.grainIntensity}</label>
                                            <input
                                                type="range" min="0" max="100"
                                                value={getNum(getValue('grain_opacity', '0%'))}
                                                onChange={(e) => updateConfig('grain_opacity', `${e.target.value}%`)}
                                                style={{ width: '100%', accentColor: '#4caf50' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Advanced Container Layout */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.displayMode}</label>
                                            <select
                                                value={getValue('display_mode', 'grid')}
                                                onChange={(e) => updateConfig('display_mode', e.target.value)}
                                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.8rem' }}
                                            >
                                                <option value="grid">{t.displayGrid || 'Grid (Side-by-Side)'}</option>
                                                <option value="flex">{t.displayList || 'List (Stacked)'}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.internalGap}</label>
                                            <input
                                                type="range" min="0" max="100"
                                                value={getNum(getValue('gap', '20px'))}
                                                onChange={(e) => updateConfig('gap', `${e.target.value}px`)}
                                                style={{ width: '100%', accentColor: '#4caf50' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Alignment & Justification */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.horizontalAlign}</label>
                                            <select
                                                value={getValue('justify_content', 'flex-start')}
                                                onChange={(e) => updateConfig('justify_content', e.target.value)}
                                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.8rem' }}
                                            >
                                                <option value="flex-start">{t.alignLeft || 'Left/Start'}</option>
                                                <option value="center">{t.alignCenter || 'Center'}</option>
                                                <option value="flex-end">{t.alignRight || 'Right/End'}</option>
                                                <option value="space-between">{t.alignSpaceBetween || 'Space Between'}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.verticalAlign}</label>
                                            <select
                                                value={getValue('align_items', 'center')}
                                                onChange={(e) => updateConfig('align_items', e.target.value)}
                                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.8rem' }}
                                            >
                                                <option value="flex-start">{t.alignTop || 'Top'}</option>
                                                <option value="center">{t.alignMiddle || 'Middle'}</option>
                                                <option value="flex-end">{t.alignBottom || 'Bottom'}</option>
                                                <option value="stretch">{t.alignStretch || 'Stretch'}</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '10px' }}>
                                        <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.textAlignment}</label>
                                        <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                            {['left', 'center', 'right', 'justify'].map(align => (
                                                <button
                                                    key={align}
                                                    onClick={() => updateConfig('text_align', align)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '5px',
                                                        background: getValue('text_align', 'left') === align ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '4px',
                                                        color: '#fff',
                                                        fontSize: '0.7rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {align.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            const newStyles = { ...config.styles }
                                            newStyles[selectedElement.id] = {
                                                ...newStyles[selectedElement.id],
                                                justify_content: 'center',
                                                align_items: 'center',
                                                text_align: 'center',
                                                display_mode: 'flex'
                                            }
                                            updateConfig('styles', newStyles)
                                        }}
                                        style={{ width: '100%', padding: '8px', marginTop: '15px', background: 'transparent', border: '1px solid rgba(74, 222, 128, 0.3)', color: '#4ade80', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        {t.perfectCenter}
                                    </button>

                                    {/* Field Reordering (Specific to Identity Group) */}
                                    {selectedElement.id === 'identity_container' && (
                                        <div style={{ marginTop: '5px' }}>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block', marginBottom: '5px' }}>{t.identityOrder}</label>
                                            <button
                                                onClick={() => {
                                                    const current = getValue('field_order', ['username', 'fullname'])
                                                    const newOrder = current.includes('username') && current.includes('fullname')
                                                        ? (current[0] === 'username' ? ['fullname', 'username'] : ['username', 'fullname'])
                                                        : ['username', 'fullname']
                                                    updateConfig('field_order', newOrder)
                                                }}
                                                style={{ width: '100%', padding: '5px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                                            >
                                                {t.swapFields}
                                            </button>
                                        </div>
                                    )}

                                    {/* Drag Handle Label (Specific to Drag Handle) */}
                                    {selectedElement.id === 'drag_handle' && (
                                        <div style={{ marginTop: '5px' }}>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block', marginBottom: '5px' }}>{t.customHandleText}</label>
                                            <input
                                                type="text"
                                                value={getValue('text', 'DRAG HERE')}
                                                onChange={(e) => updateConfig('text', e.target.value)}
                                                style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.8rem' }}
                                            />
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '10px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.borderColor}</label>
                                            <input
                                                type="color"
                                                value={getValue('border_color', 'rgba(255,255,255,0.1)')}
                                                onChange={(e) => updateConfig('border_color', e.target.value)}
                                                style={{ width: '100%', height: '25px', background: 'none', border: 'none' }}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.bgTint}</label>
                                            <input
                                                type="color"
                                                value={getValue('background_color', 'rgba(255,255,255,0.05)')}
                                                onChange={(e) => updateConfig('background_color', e.target.value)}
                                                style={{ width: '100%', height: '25px', background: 'none', border: 'none' }}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Position Controls (Common to all) */}
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '5px' }}>{t.xOffset}</label>
                                        <input
                                            type="range" min="-100" max="100"
                                            value={getValue('offset_x', 0)}
                                            onChange={(e) => updateConfig('offset_x', parseInt(e.target.value))}
                                            style={{ width: '90%', accentColor: '#4caf50' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '5px' }}>{t.yOffset}</label>
                                        <input
                                            type="range" min="-100" max="100"
                                            value={getValue('offset_y', 0)}
                                            onChange={(e) => updateConfig('offset_y', parseInt(e.target.value))}
                                            style={{ width: '90%', accentColor: '#4caf50' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                                        <label>{t.opacity}</label>
                                        <span style={{ opacity: 0.7 }}>{(getValue('opacity', 1) * 100).toFixed(0)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.1"
                                        value={getValue('opacity', 1)}
                                        onChange={(e) => updateConfig('opacity', parseFloat(e.target.value))}
                                        style={{ width: '100%', accentColor: '#4caf50' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Global Settings (Only visible if nothing or a "section" is selected) */}
                {(!selectedElement || selectedElement.type === 'section') && (
                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '20px' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '15px' }}>{t.globalLayout}</h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                                    <label>{t.websiteMaxWidth}</label>
                                    <span style={{ opacity: 0.7 }}>{config.container_width}</span>
                                </div>
                                <input
                                    type="range" min="300" max="1200" step="10"
                                    value={getNum(config.container_width)}
                                    onChange={(e) => updateConfig('container_width', `${e.target.value}px`)}
                                    style={{ width: '100%', accentColor: '#ff2d55' }}
                                />
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                                    <label>{t.glassPanelsWidth}</label>
                                    <span style={{ opacity: 0.7 }}>{config.input_width || '85%'}</span>
                                </div>
                                <input
                                    type="range" min="50" max="100"
                                    value={getNum(config.input_width || '85%')}
                                    onChange={(e) => updateConfig('input_width', `${e.target.value}%`)}
                                    style={{ width: '100%', accentColor: '#ff2d55' }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Layout Instructions */}
                <div className="glass-panel" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '5px' }}>💡 {t.godModeTip}</h4>
                    <p style={{ fontSize: '0.75rem', opacity: 0.6, lineHeight: '1.4' }}>
                        {t.godModeDesc}
                    </p>
                </div>

                {/* Custom Code Tool */}
                <div className="glass-panel" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '5px' }}>💻 {t.customCode}</h4>
                    <p style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '10px' }}>{t.customCodeDesc}</p>
                    <textarea
                        value={config.custom_code || ''}
                        onChange={(e) => updateConfig('custom_code', e.target.value)}
                        placeholder="<style>\n  .your-class { color: red; }\n</style>\n\n<script>\n  console.log('hi');\n</script>"
                        spellCheck={false}
                        style={{
                            width: '100%',
                            minHeight: '120px',
                            background: '#000',
                            color: '#0f0',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            padding: '10px',
                            fontSize: '0.75rem',
                            fontFamily: 'monospace',
                            resize: 'vertical'
                        }}
                    />
                </div>

                {/* Global Skin Visibility & Defaults */}
                <div className="glass-panel" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '10px', color: 'var(--accent-color)' }}>🎨 {t.manageSkins}</h4>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block', marginBottom: '8px' }}>{t.forceDefaultSkin}</label>
                        <select
                            value={config.default_skin || 'standard'}
                            onChange={(e) => updateConfig('default_skin', e.target.value)}
                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '8px', fontSize: '0.8rem' }}
                        >
                            {availableSkins.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <p style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '10px' }}>{t.skinVisibility}</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {availableSkins.map(skin => {
                            const allowed = config.allowed_skins ? config.allowed_skins.includes(skin.id) : true
                            const isStandard = skin.id === 'standard'

                            return (
                                <div
                                    key={skin.id}
                                    onClick={() => {
                                        if (isStandard) return
                                        const currentAllowed = config.allowed_skins || availableSkins.map(s => s.id)
                                        let newAllowed
                                        if (allowed) newAllowed = currentAllowed.filter(id => id !== skin.id)
                                        else newAllowed = [...currentAllowed, skin.id]
                                        updateConfig('allowed_skins', newAllowed)
                                    }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '8px', borderRadius: '8px',
                                        background: allowed ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255,255,255,0.05)',
                                        border: allowed ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                                        cursor: isStandard ? 'not-allowed' : 'pointer',
                                        opacity: isStandard ? 0.7 : 1,
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {allowed ? <FaEye style={{ color: '#4caf50', fontSize: '0.8rem' }} /> : <FaEyeSlash style={{ opacity: 0.4, fontSize: '0.8rem' }} />}
                                    <span style={{ fontSize: '0.75rem', fontWeight: allowed ? 'bold' : 'normal', opacity: allowed ? 1 : 0.6 }}>{skin.name}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '10px' }}>{t.baseThemeColor}</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="color" value={config.theme_color} onChange={e => updateConfig('theme_color', e.target.value)} style={{ width: '100%', height: '40px', padding: '2px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'none', cursor: 'pointer' }} />
                    </div>
                </div>

                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="glass-btn"
                    style={{
                        padding: '15px', background: 'var(--accent-color)', color: '#fff',
                        border: 'none', borderRadius: '15px', fontWeight: 'bold', fontSize: '1.1rem',
                        opacity: saving ? 0.7 : 1, cursor: 'pointer', boxShadow: '0 10px 20px rgba(255, 45, 85, 0.2)'
                    }}
                >
                    <FaSave style={{ marginRight: '8px' }} />
                    {saving ? t.publishing : t.publishChanges}
                </button>
            </div>

            {/* Live Preview Area */}
            <div style={{ flex: 1, background: '#000', borderRadius: '25px', overflow: 'hidden', border: '5px solid #222', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                <div style={{ background: '#222', padding: '10px', display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                    <FaMobileAlt style={{ opacity: viewMode === 'mobile' ? 1 : 0.3, cursor: 'pointer' }} onClick={() => setViewMode('mobile')} />
                    <FaDesktop style={{ opacity: viewMode === 'desktop' ? 1 : 0.3, cursor: 'pointer' }} onClick={() => setViewMode('desktop')} />

                    <div style={{ width: '1px', height: '20px', background: '#444', margin: '0 10px' }}></div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={editMode}
                            onChange={(e) => toggleEditMode(e.target.checked)}
                        />
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: editMode ? '#4ade80' : '#888' }}>
                            {editMode ? t.dragModeOn : t.dragModeOff}
                        </span>
                    </label>
                </div>
                <iframe
                    ref={iframeRef}
                    id="preview-frame"
                    src="http://localhost:5173/dashboard"
                    onLoad={() => {
                        console.log("Iframe loaded, syncing current draft")
                        syncToPreview(config)
                        toggleEditMode(editMode)
                    }}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        transition: 'all 0.3s ease',
                        pointerEvents: 'all'
                    }}
                    title="Live Preview"
                />
            </div>

        </div >
    )
}

export default ThemeEditor
