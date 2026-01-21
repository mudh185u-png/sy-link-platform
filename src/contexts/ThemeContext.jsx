import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from './LanguageContext'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        container_width: '380px',
        input_width: '85%',
        glass_panel_width: '100%',
        section_order: ['header', 'add_link', 'links_list'],
        theme_color: '#e94560'
    })
    const [isEditMode, setIsEditMode] = useState(false)
    const [loading, setLoading] = useState(true)
    const { setLanguage } = useLanguage()
    const [selectedId, setSelectedId] = useState(null)
    const [rect, setRect] = useState(null)

    const fetchSettings = React.useCallback(async () => {
        try {
            const { data } = await supabase.from('site_settings').select('config').single()
            if (data?.config) {
                setSettings(prev => ({ ...prev, ...data.config }))
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    const updateOrder = (key, newOrder) => {
        setSettings(prev => ({ ...prev, [key]: newOrder }))
        window.parent.postMessage({
            type: 'SYNC_THEME_UPDATE',
            payload: { [key]: newOrder }
        }, '*')
    }

    const updateStyles = (updatedStyles) => {
        setSettings(prev => ({ ...prev, styles: updatedStyles }))
        window.parent.postMessage({
            type: 'SYNC_THEME_UPDATE',
            payload: { styles: updatedStyles }
        }, '*')
    }

    // Refresh rect when selected or settings change
    useEffect(() => {
        if (!selectedId || !isEditMode) {
            setRect(null)
            return
        }

        const updateRect = () => {
            const el = document.querySelector(`[data-editable-id="${selectedId}"]`)
            if (el) {
                const r = el.getBoundingClientRect()
                setRect({
                    top: r.top + window.scrollY,
                    left: r.left + window.scrollX,
                    width: r.width,
                    height: r.height,
                    id: selectedId
                })
            }
        }

        updateRect()
        const observer = new ResizeObserver(updateRect)
        const el = document.querySelector(`[data-editable-id="${selectedId}"]`)
        if (el) observer.observe(el)

        window.addEventListener('scroll', updateRect)
        window.addEventListener('resize', updateRect)

        return () => {
            observer.disconnect()
            window.removeEventListener('scroll', updateRect)
            window.removeEventListener('resize', updateRect)
        }
    }, [selectedId, isEditMode, settings])

    useEffect(() => {
        // 1. Initial Fetch
        fetchSettings()

        // 2. Realtime Subscription
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'site_settings' },
                (payload) => {
                    if (payload.new && payload.new.config) {
                        setSettings(prev => ({ ...prev, ...payload.new.config }))
                    }
                }
            )
            .subscribe()

        // 3. PostMessage Listener (Live Preview from Admin)
        const handleMessage = (event) => {
            if (event.data?.type === 'UPDATE_THEME_PREVIEW') {
                setSettings(prev => ({ ...prev, ...event.data.payload }))
            }
            if (event.data?.type === 'TOGGLE_EDIT_MODE') {
                setIsEditMode(event.data.payload)
                if (!event.data.payload) setSelectedId(null)
            }
            if (event.data?.type === 'SET_LANGUAGE') {
                setLanguage(event.data.payload)
            }
            // Admin can also deselect
            if (event.data?.type === 'DESELECT_ELEMENT') {
                setSelectedId(null)
            }
        }

        // 4. Global Click Listener for God Mode
        const handleClick = (e) => {
            if (!isEditMode) return

            const editableEl = e.target.closest('[data-editable-id]')
            if (editableEl) {
                e.preventDefault()
                e.stopPropagation()
                const id = editableEl.getAttribute('data-editable-id')
                const type = editableEl.getAttribute('data-editable-type')

                setSelectedId(id)

                // Find containing section
                const sectionEl = e.target.closest('[data-section-id]') || e.target.closest('[key]')
                const section = sectionEl?.getAttribute('data-section-id') || sectionEl?.getAttribute('key') || id

                window.parent.postMessage({
                    type: 'ELEMENT_SELECTED',
                    payload: { id, type, section }
                }, '*')
            } else {
                // Deselect if clicking outside
                setSelectedId(null)
                window.parent.postMessage({ type: 'ELEMENT_SELECTED', payload: null }, '*')
            }
        }

        window.addEventListener('message', handleMessage)
        window.addEventListener('click', handleClick, true) // Capture phase
        return () => {
            supabase.removeChannel(channel)
            window.removeEventListener('message', handleMessage)
            window.removeEventListener('click', handleClick, true)
        }
    }, [isEditMode, fetchSettings, setLanguage])

    const startResize = (e, direction) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.nativeEvent.stopImmediatePropagation) e.nativeEvent.stopImmediatePropagation()

        const startX = e.clientX
        const startY = e.clientY
        const startWidth = rect.width
        const startHeight = rect.height
        const elId = selectedId

        // Detect centering (Flex or Margin)
        const el = document.querySelector(`[data-editable-id="${selectedId}"]`)
        const parent = el?.parentElement
        const parentStyle = parent ? window.getComputedStyle(parent) : {}
        const elStyle = el ? window.getComputedStyle(el) : {}

        const isFlexCentered = parentStyle.display?.includes('flex') && parentStyle.justifyContent === 'center'
        const isMarginCentered = (elStyle.margin?.includes('auto') || (elStyle.marginLeft === 'auto' && elStyle.marginRight === 'auto'))
        const isTextCentered = elStyle.textAlign === 'center'
        const isCentered = isFlexCentered || isMarginCentered || isTextCentered
        const startMarginBottom = el ? parseInt(elStyle.marginBottom) || 0 : 0

        // Visual feedback
        const isHorizontal = direction.includes('right') || direction.includes('left')
        const isVertical = direction.includes('top') || direction.includes('bottom') || direction === 'spacing'
        document.body.style.cursor = isHorizontal ? 'ew-resize' : isVertical ? 'ns-resize' : 'nwse-resize'

        const onMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX
            const deltaY = moveEvent.clientY - startY

            const newStyles = { ...(settings.styles || {}) }
            const elementStyle = { ...(newStyles[elId] || {}) }

            const horizontalMultiplier = isCentered ? 2 : 1

            if (direction.includes('right')) {
                elementStyle.width = `${Math.max(40, startWidth + (deltaX * horizontalMultiplier))}px`
            } else if (direction.includes('left')) {
                elementStyle.width = `${Math.max(40, startWidth - (deltaX * horizontalMultiplier))}px`
            }

            if (direction.includes('bottom')) {
                elementStyle.height = `${Math.max(40, startHeight + deltaY)}px`
            } else if (direction.includes('top')) {
                elementStyle.height = `${Math.max(40, startHeight - deltaY)}px`
            }

            if (direction === 'spacing') {
                elementStyle.margin_bottom = `${Math.max(0, startMarginBottom + deltaY)}px`
            }

            newStyles[elId] = elementStyle
            setSettings(prev => ({ ...prev, styles: newStyles }))

            window.parent.postMessage({
                type: 'SYNC_THEME_UPDATE',
                payload: { styles: newStyles }
            }, '*')
        }

        const onMouseUp = () => {
            document.body.style.cursor = ''
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
    }

    const value = {
        settings,
        loading,
        isEditMode,
        updateOrder,
        updateStyles
    }

    const handleStyle = {
        position: 'absolute',
        background: '#4caf50',
        borderRadius: '4px',
        cursor: 'pointer',
        pointerEvents: 'auto',
        border: '2px solid #fff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}

            {/* Transform Box Overlay */}
            {isEditMode && rect && (
                <div style={{
                    position: 'absolute',
                    top: rect.top - 2,
                    left: rect.left - 2,
                    width: rect.width + 4,
                    height: rect.height + 4,
                    border: '2px solid #4caf50',
                    pointerEvents: 'none',
                    zIndex: 99999,
                    boxSizing: 'border-box',
                    boxShadow: '0 0 20px rgba(76, 175, 80, 0.4)',
                    userSelect: 'none'
                }}>
                    {/* Width (Right) */}
                    <div
                        onMouseDown={(e) => startResize(e, 'right')}
                        style={{ ...handleStyle, right: -10, top: '50%', transform: 'translateY(-50%)', width: '20px', height: '40px', cursor: 'ew-resize' }}
                    >
                        <div style={{ width: '2px', height: '15px', background: 'rgba(255,255,255,0.5)' }}></div>
                    </div>

                    {/* Height (Bottom) */}
                    <div
                        onMouseDown={(e) => startResize(e, 'bottom')}
                        style={{ ...handleStyle, bottom: -10, left: '50%', transform: 'translateX(-50%)', width: '40px', height: '20px', cursor: 'ns-resize' }}
                    >
                        <div style={{ width: '15px', height: '2px', background: 'rgba(255,255,255,0.5)' }}></div>
                    </div>

                    {/* Top Handle */}
                    <div
                        onMouseDown={(e) => startResize(e, 'top')}
                        style={{ ...handleStyle, top: -10, left: '50%', transform: 'translateX(-50%)', width: '40px', height: '20px', cursor: 'ns-resize' }}
                    >
                        <div style={{ width: '15px', height: '2px', background: 'rgba(255,255,255,0.5)' }}></div>
                    </div>

                    {/* Left Handle */}
                    <div
                        onMouseDown={(e) => startResize(e, 'left')}
                        style={{ ...handleStyle, left: -10, top: '50%', transform: 'translateY(-50%)', width: '20px', height: '40px', cursor: 'ew-resize' }}
                    >
                        <div style={{ width: '2px', height: '15px', background: 'rgba(255,255,255,0.5)' }}></div>
                    </div>

                    {/* Corner: Bottom-Right */}
                    <div
                        onMouseDown={(e) => startResize(e, 'bottom-right')}
                        style={{ ...handleStyle, bottom: -12, right: -12, width: '24px', height: '24px', borderRadius: '50%', cursor: 'nwse-resize' }}
                    >
                        <div style={{ width: '8px', height: '8px', borderRight: '2px solid #fff', borderBottom: '2px solid #fff', transform: 'translate(-1px, -1px)' }}></div>
                    </div>

                    {/* Corner: Top-Right (User specifically mentioned side-top) */}
                    <div
                        onMouseDown={(e) => startResize(e, 'top-right')}
                        style={{ ...handleStyle, top: -12, right: -12, width: '24px', height: '24px', borderRadius: '50%', cursor: 'nesw-resize' }}
                    >
                        <div style={{ width: '8px', height: '8px', borderRight: '2px solid #fff', borderTop: '2px solid #fff', transform: 'translate(-1px, 1px)' }}></div>
                    </div>

                    {/* Spacing Handle (Bottom-Left) */}
                    <div
                        onMouseDown={(e) => startResize(e, 'spacing')}
                        style={{ ...handleStyle, bottom: -12, left: -12, width: '24px', height: '24px', background: '#3b82f6', borderRadius: '50%', cursor: 'ns-resize' }}
                        title="Adjust Spacing"
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ width: '10px', height: '2px', background: '#fff' }}></div>
                            <div style={{ width: '10px', height: '2px', background: '#fff' }}></div>
                        </div>
                    </div>
                </div>
            )}

            {settings.custom_code && (
                <div
                    id="custom-site-code"
                    dangerouslySetInnerHTML={{ __html: settings.custom_code }}
                    style={{ display: 'none' }}
                />
            )}
        </ThemeContext.Provider>
    )
}
