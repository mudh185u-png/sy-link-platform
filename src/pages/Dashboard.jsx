import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { FaTrash, FaPlus, FaSignOutAlt, FaLink } from 'react-icons/fa'
import IconSelector from '../components/IconSelector'
import { iconMap } from '../utils/iconMap'

import { useTheme } from '../contexts/ThemeContext'

const Dashboard = () => {
    const { user } = useAuth()
    const { t } = useLanguage()
    const { settings, isEditMode, updateOrder } = useTheme()
    const navigate = useNavigate()
    const [links, setLinks] = useState([])
    const [loading, setLoading] = useState(true)

    // New link state
    const [newTitle, setNewTitle] = useState('')
    const [newUrl, setNewUrl] = useState('')
    const [newIcon, setNewIcon] = useState('FaGlobe') // Default icon

    // Drag and Drop state
    const [draggedItem, setDraggedItem] = useState(null)

    // Default order
    const order = settings?.section_order && settings.section_order.includes('header')
        ? settings.section_order
        : ['header', 'add_link', 'links_list']

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        fetchLinks()
    }, [user, navigate])

    const fetchLinks = async () => {
        try {
            const { data, error } = await supabase
                .from('links')
                .select('*')
                .order('created_at', { ascending: true })

            if (error) throw error
            setLinks(data)
        } catch (error) {
            console.error('Error fetching links:', error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAddLink = async (e) => {
        e.preventDefault()
        if (!newTitle || !newUrl) return

        try {
            const { data, error } = await supabase
                .from('links')
                .insert([
                    { title: newTitle, url: newUrl, icon: newIcon, user_id: user.id }
                ])
                .select()

            if (error) throw error
            setLinks([...links, data[0]])
            setNewTitle('')
            setNewUrl('')
            setNewIcon('FaGlobe') // Reset icon
        } catch (error) {
            alert(error.message)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return
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

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    if (loading) return <div>{t.loading}</div>

    const getStyle = (sectionId, key, fallback) => {
        return settings?.styles?.[sectionId]?.[key] !== undefined
            ? settings.styles[sectionId][key]
            : fallback
    }

    // Sections Rendering Logic
    const sections = {
        'header': (
            <header
                key="header"
                data-editable-id="dashboard_header"
                data-editable-type="container"
                className="glass-panel"
                style={{
                    padding: getStyle('dashboard_header', 'padding', '1.5rem 2rem'),
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: getStyle('dashboard_header', 'border_radius', '24px'),
                    background: getStyle('dashboard_header', 'background_color', 'rgba(255,255,255,0.02)'),
                    backdropFilter: `blur(${getStyle('dashboard_header', 'backdrop_blur', '20px')})`,
                    border: `${getStyle('dashboard_header', 'border_width', '0px')} solid ${getStyle('dashboard_header', 'border_color', 'rgba(255,255,255,0.08)')}`,
                    transform: `translate(${getStyle('dashboard_header', 'offset_x', 0)}px, ${getStyle('dashboard_header', 'offset_y', 0)}px)`,
                    transition: 'all 0.3s'
                }}>
                <div>
                    <h2
                        data-editable-id="dashboard_title"
                        data-editable-type="text"
                        style={{
                            fontSize: getStyle('dashboard_title', 'font_size', '1.8rem'),
                            fontWeight: getStyle('dashboard_title', 'font_weight', '800'),
                            lineHeight: getStyle('dashboard_title', 'line_height', 1.2),
                            letterSpacing: `${getStyle('dashboard_title', 'letter_spacing', 0)}px`,
                            color: getStyle('dashboard_title', 'text_color', '#fff'),
                            opacity: getStyle('dashboard_title', 'opacity', 1),
                            background: getStyle('dashboard_title', 'text_color', '') ? 'none' : 'linear-gradient(45deg, #fff, #bbb)',
                            WebkitBackgroundClip: getStyle('dashboard_title', 'text_color', '') ? 'none' : 'text',
                            WebkitTextFillColor: getStyle('dashboard_title', 'text_color', '') ? 'inherit' : 'transparent'
                        }}>
                        {t.dashboardTitle}
                    </h2>
                    <p
                        data-editable-id="dashboard_subtitle"
                        data-editable-type="text"
                        style={{
                            opacity: getStyle('dashboard_subtitle', 'opacity', 0.6),
                            fontSize: getStyle('dashboard_subtitle', 'font_size', '0.9rem'),
                            color: getStyle('dashboard_subtitle', 'text_color', '#fff'),
                            fontWeight: getStyle('dashboard_subtitle', 'font_weight', '400')
                        }}>
                        Manage your links in style
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    data-editable-id="logout_btn_dashboard"
                    data-editable-type="text"
                    className="glass-btn"
                    style={{
                        padding: getStyle('logout_btn_dashboard', 'padding', '0.8rem 1.5rem'),
                        fontSize: getStyle('logout_btn_dashboard', 'font_size', '0.95rem'),
                        fontWeight: getStyle('logout_btn_dashboard', 'font_weight', '600'),
                        color: getStyle('logout_btn_dashboard', 'text_color', '#fff'),
                        borderRadius: getStyle('logout_btn_dashboard', 'border_radius', '12px'),
                        background: getStyle('logout_btn_dashboard', 'background_color', 'rgba(233, 69, 96, 0.2)'),
                        border: `${getStyle('logout_btn_dashboard', 'border_width', '1px')} solid rgba(233, 69, 96, 0.4)`,
                        cursor: 'pointer'
                    }}>
                    <FaSignOutAlt style={{ marginLeft: '8px' }} /> {t.logout}
                </button>
            </header>
        ),
        'add_link': (
            <section
                key="add_link"
                data-editable-id="add_link_container"
                data-editable-type="container"
                className="glass-panel"
                style={{
                    padding: getStyle('add_link_container', 'padding', '2rem'),
                    width: getStyle('add_link_container', 'width', '100%'),
                    borderRadius: getStyle('add_link_container', 'border_radius', '24px'),
                    background: getStyle('add_link_container', 'background_color', 'rgba(255,255,255,0.03)'),
                    backdropFilter: `blur(${getStyle('add_link_container', 'backdrop_blur', '15px')})`,
                    border: `${getStyle('add_link_container', 'border_width', '0px')} solid ${getStyle('add_link_container', 'border_color', 'rgba(255,255,255,0.08)')}`,
                    transform: `translate(${getStyle('add_link_container', 'offset_x', 0)}px, ${getStyle('add_link_container', 'offset_y', 0)}px)`,
                    transition: 'all 0.3s'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', opacity: 0.9 }}>
                    <div
                        data-editable-id="add_link_icon"
                        data-editable-type="icon"
                        style={{
                            padding: '8px',
                            background: getStyle('add_link_icon', 'icon_color', 'var(--accent-color)'),
                            borderRadius: '10px',
                            display: 'flex',
                            width: getStyle('add_link_icon', 'width', 'auto'),
                            height: getStyle('add_link_icon', 'height', 'auto')
                        }}>
                        <FaPlus color="white" />
                    </div>
                    <h3
                        data-editable-id="add_link_header"
                        data-editable-type="text"
                        style={{
                            fontSize: getStyle('add_link_header', 'font_size', '1.3rem'),
                            fontWeight: getStyle('add_link_header', 'font_weight', '600'),
                            color: getStyle('add_link_header', 'text_color', '#fff')
                        }}>
                        {t.addLinkTitle}
                    </h3>
                </div>

                <form onSubmit={handleAddLink} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center' }}>
                            <label
                                data-editable-id="add_link_label_title"
                                data-editable-type="text"
                                style={{
                                    fontSize: getStyle('add_link_label_title', 'font_size', '0.9rem'),
                                    fontWeight: getStyle('add_link_label_title', 'font_weight', 'bold'),
                                    color: getStyle('add_link_label_title', 'text_color', '#fff'),
                                    opacity: getStyle('add_link_label_title', 'opacity', 0.7)
                                }}>
                                Link Title
                            </label>
                            <input
                                data-editable-id="add_link_input_title"
                                data-editable-type="input"
                                type="text" placeholder={t.titlePlaceholder}
                                value={newTitle} onChange={e => setNewTitle(e.target.value)}
                                className="glass-btn"
                                style={{
                                    padding: getStyle('add_link_input_title', 'padding', '1rem'),
                                    borderRadius: getStyle('add_link_input_title', 'border_radius', '14px'),
                                    border: `${getStyle('add_link_input_title', 'border_width', '1px')} solid rgba(255,255,255,0.1)`,
                                    background: getStyle('add_link_input_title', 'background_color', 'rgba(0,0,0,0.2)'),
                                    color: getStyle('add_link_input_title', 'text_color', '#fff'),
                                    width: getStyle('add_link_input_title', 'width', '85%'),
                                    fontSize: getStyle('add_link_input_title', 'font_size', '0.95rem'),
                                    textAlign: 'inherit',
                                    margin: '0 auto',
                                    display: 'block'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center' }}>
                            <label
                                data-editable-id="add_link_label_url"
                                data-editable-type="text"
                                style={{
                                    fontSize: getStyle('add_link_label_url', 'font_size', '0.9rem'),
                                    fontWeight: getStyle('add_link_label_url', 'font_weight', 'bold'),
                                    color: getStyle('add_link_label_url', 'text_color', '#fff'),
                                    opacity: getStyle('add_link_label_url', 'opacity', 0.7)
                                }}>
                                URL
                            </label>
                            <input
                                data-editable-id="add_link_input_url"
                                data-editable-type="input"
                                type="url" placeholder={t.urlPlaceholder}
                                value={newUrl} onChange={e => setNewUrl(e.target.value)}
                                className="glass-btn"
                                style={{
                                    padding: getStyle('add_link_input_url', 'padding', '1rem'),
                                    borderRadius: getStyle('add_link_input_url', 'border_radius', '14px'),
                                    border: `${getStyle('add_link_input_url', 'border_width', '1px')} solid rgba(255,255,255,0.1)`,
                                    background: getStyle('add_link_input_url', 'background_color', 'rgba(0,0,0,0.2)'),
                                    color: getStyle('add_link_input_url', 'text_color', '#fff'),
                                    width: getStyle('add_link_input_url', 'width', '85%'),
                                    direction: 'ltr',
                                    textAlign: 'left',
                                    margin: '0 auto',
                                    display: 'block'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center' }}>
                        <label
                            data-editable-id="add_link_label_icon"
                            data-editable-type="text"
                            style={{
                                fontSize: getStyle('add_link_label_icon', 'font_size', '0.9rem'),
                                fontWeight: getStyle('add_link_label_icon', 'font_weight', 'bold'),
                                color: getStyle('add_link_label_icon', 'text_color', '#fff'),
                                opacity: getStyle('add_link_label_icon', 'opacity', 0.7)
                            }}>
                            Choose Icon
                        </label>
                        <div style={{ width: getStyle('add_link_container', 'width', '85%') }}>
                            <IconSelector selectedIcon={newIcon} onSelect={setNewIcon} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        data-editable-id="add_link_submit"
                        data-editable-type="text"
                        className="glass-btn"
                        style={{
                            marginTop: '1rem',
                            background: getStyle('add_link_submit', 'background_color', 'linear-gradient(135deg, var(--accent-color) 0%, #c31432 100%)'),
                            border: 'none',
                            padding: getStyle('add_link_submit', 'padding', '1rem'),
                            fontSize: getStyle('add_link_submit', 'font_size', '1.1rem'),
                            fontWeight: getStyle('add_link_submit', 'font_weight', 'bold'),
                            color: getStyle('add_link_submit', 'text_color', '#fff'),
                            borderRadius: getStyle('add_link_submit', 'border_radius', '14px'),
                            boxShadow: '0 4px 15px rgba(233, 69, 96, 0.4)',
                            width: getStyle('add_link_submit', 'width', '85%'),
                            margin: '0 auto',
                            display: 'block',
                            cursor: 'pointer'
                        }}>
                        {t.addBtn}
                    </button>
                </form>
            </section>
        ),
        'links_list': (
            <section
                key="links_list"
                data-editable-id="dashboard_links_container"
                data-editable-type="container"
                style={{
                    width: getStyle('dashboard_links_container', 'width', '100%'),
                    transform: `translate(${getStyle('dashboard_links_container', 'offset_x', 0)}px, ${getStyle('dashboard_links_container', 'offset_y', 0)}px)`,
                    transition: 'all 0.3s'
                }}>
                <h3
                    data-editable-id="links_list_header"
                    data-editable-type="text"
                    style={{
                        fontSize: getStyle('links_list_header', 'font_size', '1.3rem'),
                        fontWeight: getStyle('links_list_header', 'font_weight', '600'),
                        color: getStyle('links_list_header', 'text_color', '#fff'),
                        opacity: getStyle('links_list_header', 'opacity', 0.9),
                        marginBottom: '1.5rem'
                    }}>
                    Your Links ({links.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {links.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '20px', opacity: 0.6 }}>
                            <FaLink size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>{t.noLinks}</p>
                        </div>
                    ) : (
                        links.map(link => (
                            <div
                                key={link.id}
                                data-editable-id="dashboard_link_card"
                                data-editable-type="container"
                                className="glass-panel"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: getStyle('dashboard_link_card', 'padding', '1.2rem'),
                                    borderRadius: getStyle('dashboard_link_card', 'border_radius', '16px'),
                                    background: getStyle('dashboard_link_card', 'background_color', 'rgba(255,255,255,0.02)'),
                                    border: `${getStyle('dashboard_link_card', 'border_width', '1px')} solid ${getStyle('dashboard_link_card', 'border_color', 'rgba(255,255,255,0.08)')}`,
                                    transition: 'all 0.3s'
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div
                                        data-editable-id="dashboard_link_icon_container"
                                        data-editable-type="icon"
                                        style={{
                                            width: getStyle('dashboard_link_icon_container', 'width', 50),
                                            height: getStyle('dashboard_link_icon_container', 'height', 50),
                                            borderRadius: getStyle('dashboard_link_icon_container', 'border_radius', '12px'),
                                            background: getStyle('dashboard_link_icon_container', 'background_color', 'rgba(255,255,255,0.05)'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: getStyle('dashboard_link_icon_container', 'icon_size', '1.5rem'),
                                            color: getStyle('dashboard_link_icon_container', 'icon_color', '#fff'),
                                            cursor: 'pointer'
                                        }}>
                                        {iconMap[link.icon]}
                                    </div>
                                    <div>
                                        <h4
                                            data-editable-id="dashboard_link_title"
                                            data-editable-type="text"
                                            style={{
                                                fontSize: getStyle('dashboard_link_title', 'font_size', '1.1rem'),
                                                fontWeight: getStyle('dashboard_link_title', 'font_weight', '600'),
                                                color: getStyle('dashboard_link_title', 'text_color', '#fff'),
                                                marginBottom: '4px'
                                            }}>
                                            {link.title}
                                        </h4>
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', fontSize: '0.85rem', textDecoration: 'none', opacity: 0.8 }}>
                                            {link.url}
                                        </a>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(link.id)}
                                    className="glass-btn"
                                    style={{
                                        background: 'rgba(255, 75, 75, 0.1)',
                                        border: '1px solid rgba(255, 75, 75, 0.2)',
                                        color: '#ff4b4b',
                                        padding: '0.8rem',
                                        borderRadius: '12px',
                                        cursor: 'pointer'
                                    }}>
                                    <FaTrash />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </section>
        )
    }

    // Drag and Drop Handlers
    const handleDragStart = (e, index) => {
        setDraggedItem(index)
        e.dataTransfer.effectAllowed = 'move'
        // Transparent drag image? e.dataTransfer.setDragImage(e.target, 0, 0)
    }

    const handleDragOver = (e) => {
        e.preventDefault() // Necessary for Drop to work
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e, index) => {
        e.preventDefault()
        if (draggedItem === null) return

        const newOrder = [...order]
        const draggedSection = newOrder[draggedItem]

        // Remove active item
        newOrder.splice(draggedItem, 1)
        // Insert at new loc
        newOrder.splice(index, 0, draggedSection)

        updateOrder('section_order', newOrder)
        setDraggedItem(null)
    }

    return (
        <div style={{ width: '100%', maxWidth: settings?.container_width || '380px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {order.map((sectionId, index) => (
                <div
                    key={sectionId}
                    data-section-id={sectionId}
                    onDragOver={(e) => isEditMode && handleDragOver(e, index)}
                    onDrop={(e) => isEditMode && handleDrop(e, index)}
                    style={{
                        cursor: isEditMode ? 'default' : 'default',
                        border: isEditMode ? '2px dashed rgba(255,255,255,0.2)' : 'none',
                        borderRadius: '24px',
                        padding: isEditMode ? '10px' : '0',
                        opacity: draggedItem === index ? 0.5 : 1,
                        transition: 'all 0.2s ease',
                        position: 'relative'
                    }}
                >
                    {isEditMode && (
                        <div
                            draggable={true}
                            onDragStart={(e) => isEditMode && handleDragStart(e, index)}
                            data-editable-id="drag_handle"
                            data-editable-type="container"
                            style={{
                                position: 'absolute', top: getStyle('drag_handle', 'offset_y', -15), left: '50%', transform: `translateX(-50%) translate(${getStyle('drag_handle', 'offset_x', 0)}px, 0)`,
                                background: getStyle('drag_handle', 'background_color', 'var(--accent-color)'),
                                color: getStyle('drag_handle', 'text_color', 'white'),
                                borderRadius: getStyle('drag_handle', 'border_radius', '20px'),
                                padding: getStyle('drag_handle', 'padding', '4px 15px'),
                                fontSize: getStyle('drag_handle', 'font_size', '0.85rem'),
                                fontWeight: getStyle('drag_handle', 'font_weight', 'bold'),
                                cursor: 'grab',
                                zIndex: 1000,
                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                opacity: getStyle('drag_handle', 'opacity', 1)
                            }}
                        >
                            ✋ {getStyle('drag_handle', 'text', 'DRAG HERE')}
                        </div>
                    )}

                    {sections[sectionId] || null}
                </div>
            ))}
        </div>
    )
}

export default Dashboard
