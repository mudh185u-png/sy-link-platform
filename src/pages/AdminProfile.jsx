import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import {
    FaUserCircle, FaSave, FaSignOutAlt, FaUser,
    FaIdCard, FaAlignLeft, FaLink, FaCopy,
    FaExternalLinkAlt, FaCrown, FaCheckCircle, FaGlobe
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import AdminHeader from '../components/AdminHeader'

const AdminProfile = () => {
    const { user } = useAuth()
    const { t, language } = useLanguage()
    const { settings, isEditMode, updateOrder, updateStyles } = useTheme() // Use Theme Context
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [uploading, setUploading] = useState(false)
    const [username, setUsername] = useState('')
    const [fullName, setFullName] = useState('')
    const [bio, setBio] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [canEditUsername, setCanEditUsername] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)

    // Drag State
    const [draggedItem, setDraggedItem] = useState(null)
    const [fieldDraggedItem, setFieldDraggedItem] = useState(null)
    const [fieldDraggedSection, setFieldDraggedSection] = useState(null)

    const handleFieldDragStart = (e, index, sectionId) => {
        e.stopPropagation()
        setFieldDraggedItem(index)
        setFieldDraggedSection(sectionId)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleFieldDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move'
        }
    }

    const handleFieldDrop = (e, index, sectionId) => {
        e.preventDefault()
        e.stopPropagation()
        if (fieldDraggedItem === null || fieldDraggedSection !== sectionId) return

        const currentOrder = getStyle(sectionId, 'field_order', sectionId === 'identity_container' ? ['username', 'fullname'] : ['header', 'input'])
        const newOrder = [...currentOrder]
        const dragged = newOrder[fieldDraggedItem]

        newOrder.splice(fieldDraggedItem, 1)
        newOrder.splice(index, 0, dragged)

        // Update settings in context via helper
        const updatedStyles = {
            ...settings.styles,
            [sectionId]: {
                ...settings.styles?.[sectionId],
                field_order: newOrder
            }
        }

        updateStyles(updatedStyles)
        setFieldDraggedItem(null)
        setFieldDraggedSection(null)
    }

    // --- Helpers ---
    const getStyle = (sectionId, key, fallback) => {
        return settings?.styles?.[sectionId]?.[key] !== undefined
            ? settings.styles[sectionId][key]
            : fallback
    }

    const getProfile = React.useCallback(async () => {
        try {
            setLoading(true)
            const { data, error: profileError } = await supabase
                .from('profiles')
                .select('username, full_name, avatar_url, website')
                .eq('id', user.id)
                .maybeSingle()

            if (profileError) throw profileError

            if (data) {
                setUsername(data.username || '')
                setFullName(data.full_name || '')
                setAvatarUrl(data.avatar_url || '')
                setBio(data.website || '')
                setCanEditUsername(!data.username)
            } else {
                setCanEditUsername(true)
            }
        } catch (error) {
            console.error('Error loading user data', error)
        } finally {
            setLoading(false)
        }
    }, [user.id])

    // Default Order
    const order = settings?.profile_order && settings.profile_order.length > 0
        ? settings.profile_order
        : ['profile_card', 'public_link', 'identity_group', 'bio_group', 'buttons']

    useEffect(() => {
        if (user) {
            getProfile()
        }
    }, [user, getProfile])

    const uploadAvatar = async (event) => {
        try {
            setUploading(true)
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error(language === 'ar' ? 'يجب اختيار صورة لرفعها' : 'You must select an image to upload.')
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            let { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            if (data?.publicUrl) {
                setAvatarUrl(data.publicUrl)
            }
        } catch (error) {
            alert(error.message)
        } finally {
            setUploading(false)
        }
    }

    const updateProfile = async (e) => {
        e.preventDefault()
        try {
            setSaving(true)
            const updates = {
                id: user.id,
                full_name: fullName,
                avatar_url: avatarUrl,
                website: bio,
                updated_at: new Date(),
            }

            if (username && canEditUsername) {
                updates.username = username
            }

            const { error } = await supabase.from('profiles').upsert(updates)
            if (error) throw error
            alert(t.profileUpdated || 'Profile updated!')

            if (canEditUsername && username) {
                setCanEditUsername(false)
            }
        } catch (error) {
            alert(error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    // --- Drag and Drop Logic ---
    const handleDragStart = (e, index) => {
        setDraggedItem(index)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e, index) => {
        e.preventDefault()
        if (draggedItem === null) return

        const newOrder = [...order]
        const draggedSection = newOrder[draggedItem]

        newOrder.splice(draggedItem, 1)
        newOrder.splice(index, 0, draggedSection)

        updateOrder('profile_order', newOrder)
        setDraggedItem(null)
    }

    // Component Sections - Defined as functions to allow dynamic rendering
    const sections = {
        'profile_card': (props) => (
            <div
                className="glass-panel"
                key="profile_card"
                data-editable-id="profile_card"
                data-editable-type="container"
                style={{
                    padding: getStyle('profile_card', 'padding', '2.5rem 2rem'),
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    background: getStyle('profile_card', 'background_color', 'rgba(255, 255, 255, 0.03)'),
                    backdropFilter: `blur(${getStyle('profile_card', 'backdrop_blur', '20px')})`,
                    border: `${getStyle('profile_card', 'border_width', '1px')} solid ${getStyle('profile_card', 'border_color', 'rgba(255,255,255,0.08)')}`,
                    transform: `translate(${getStyle('profile_card', 'offset_x', 0)}px, ${getStyle('profile_card', 'offset_y', 0)}px)`,
                    borderRadius: getStyle('profile_card', 'border_radius', '40px'),
                    width: getStyle('profile_card', 'width', '100%'),
                    height: getStyle('profile_card', 'height', 'auto'),
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    ...props.style
                }}
            >
                {/* Decorative Glow */}
                <div style={{
                    position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
                    width: '200px', height: '200px', background: 'var(--accent-color)',
                    filter: 'blur(100px)', opacity: 0.1, pointerEvents: 'none'
                }}></div>

                <div
                    data-editable-id="avatar_container"
                    data-editable-type="container"
                    onClick={() => !isEditMode && document.getElementById('avatar-upload').click()}
                    style={{
                        width: getStyle('avatar_container', 'width', '120px'),
                        height: getStyle('avatar_container', 'height', '120px'),
                        margin: '0 auto 1.5rem',
                        borderRadius: getStyle('avatar_container', 'border_radius', '40px'),
                        background: getStyle('avatar_container', 'background_color', 'rgba(255,255,255,0.05)'),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: isEditMode ? 'default' : 'pointer', overflow: 'hidden',
                        border: `${getStyle('avatar_container', 'border_width', '2px')} solid ${getStyle('avatar_container', 'border_color', 'rgba(255,255,255,0.1)')}`,
                        position: 'relative', transition: 'all 0.4s ease',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                        transform: `translate(${getStyle('avatar_container', 'offset_x', 0)}px, ${getStyle('avatar_container', 'offset_y', 0)}px)`,
                        opacity: getStyle('avatar_container', 'opacity', 1)
                    }}
                >
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <FaUserCircle size={parseInt(getStyle('avatar_container', 'icon_size', 80))} color="rgba(255,255,255,0.1)" />
                    )}
                    <div className="avatar-overlay" style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 0.3s', pointerEvents: 'none'
                    }}>
                        <FaCopy color="#fff" size={20} />
                    </div>
                    {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loading-spinner"></div></div>}
                </div>
                <input type="file" id="avatar-upload" hidden accept="image/*" onChange={uploadAvatar} disabled={uploading || isEditMode} />

                <h3 style={{
                    fontSize: getStyle('profile_name', 'font_size', '1.6rem'),
                    fontWeight: getStyle('profile_name', 'font_weight', '900'),
                    lineHeight: getStyle('profile_name', 'line_height', 1),
                    letterSpacing: '-0.5px',
                    marginBottom: '8px',
                    color: getStyle('profile_name', 'text_color', '#fff'),
                    opacity: getStyle('profile_name', 'opacity', 1),
                    transform: `translate(${getStyle('profile_name', 'offset_x', 0)}px, ${getStyle('profile_name', 'offset_y', 0)}px)`
                }} data-editable-id="profile_name" data-editable-type="text">{fullName || t.name}</h3>

                <div
                    data-editable-id="admin_badge"
                    data-editable-type="container"
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        background: 'rgba(255,45,85,0.1)',
                        border: '1px solid rgba(255,45,85,0.2)',
                        padding: '6px 14px',
                        borderRadius: '50px',
                        width: 'fit-content', margin: '0 auto',
                        fontSize: '0.75rem',
                        color: '#ff2d55',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        opacity: getStyle('admin_badge', 'opacity', 1),
                        transform: `translate(${getStyle('admin_badge', 'offset_x', 0)}px, ${getStyle('admin_badge', 'offset_y', 0)}px)`,
                    }}
                >
                    <FaCrown size={12} />
                    <span>{t.administratorBadge}</span>
                </div>
            </div>
        ),
        'public_link': (props) => (
            <div
                className="glass-panel"
                key="public_link"
                data-editable-id="public_link_container"
                data-editable-type="container"
                style={{
                    padding: getStyle('public_link_container', 'padding', '1.2rem 1.5rem'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '15px',
                    background: getStyle('public_link_container', 'background_color', 'rgba(255,255,255,0.03)'),
                    backdropFilter: `blur(${getStyle('public_link_container', 'backdrop_blur', '20px')})`,
                    border: `${getStyle('public_link_container', 'border_width', '1px')} solid ${getStyle('public_link_container', 'border_color', 'rgba(255,255,255,0.08)')}`,
                    transform: `translate(${getStyle('public_link_container', 'offset_x', 0)}px, ${getStyle('public_link_container', 'offset_y', 0)}px)`,
                    borderRadius: getStyle('public_link_container', 'border_radius', '24px'),
                    width: getStyle('public_link_container', 'width', '100%'),
                    height: getStyle('public_link_container', 'height', 'auto'),
                    ...props.style
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, minWidth: 0 }}>
                    <div
                        data-editable-id="public_link_icon"
                        data-editable-type="icon"
                        style={{
                            width: '45px', height: '45px', borderRadius: '14px',
                            background: 'rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <FaGlobe size={18} color="var(--accent-color)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: language === 'ar' ? 'right' : 'left' }}>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>{t.publicProfileLabel}</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            sy-links.com/{username}
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(`sy-links.com/${username}`)
                        setCopySuccess(true)
                        setTimeout(() => setCopySuccess(false), 2000)
                    }}
                    className="glass-btn"
                    style={{
                        padding: '10px 18px',
                        background: copySuccess ? '#4ade80' : 'rgba(255,255,255,0.05)',
                        color: copySuccess ? '#000' : '#fff',
                        borderRadius: '14px',
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    {copySuccess ? <FaCheckCircle /> : <FaCopy />}
                    {copySuccess ? 'Copied' : t.shareLink}
                </button>
            </div>
        ),
        'identity_group': (props) => (
            <div
                className="glass-panel"
                key="identity_group"
                data-editable-id="identity_container"
                data-editable-type="container"
                style={{
                    padding: getStyle('identity_container', 'padding', '2rem'),
                    width: getStyle('identity_container', 'width', '100%'),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    background: getStyle('identity_container', 'background_color', 'rgba(255, 255, 255, 0.02)'),
                    backdropFilter: `blur(${getStyle('identity_container', 'backdrop_blur', '20px')})`,
                    border: `${getStyle('identity_container', 'border_width', '1px')} solid ${getStyle('identity_container', 'border_color', 'rgba(255,255,255,0.08)')}`,
                    borderRadius: getStyle('identity_container', 'border_radius', '32px'),
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    height: getStyle('identity_container', 'height', 'auto'),
                    textAlign: language === 'ar' ? 'right' : 'left',
                    position: 'relative',
                    overflow: 'hidden',
                    ...props.style
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                    <div style={{ width: '4px', height: '16px', background: 'var(--accent-color)', borderRadius: '4px' }}></div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {t.identityDetails}
                    </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {getStyle('identity_container', 'field_order', ['username', 'fullname']).map((fieldId, fieldIdx) => {
                        const isUsername = fieldId === 'username';
                        const fieldVal = isUsername ? username : fullName;
                        const setFieldVal = isUsername ? setUsername : setFullName;
                        const label = isUsername ? t.usernamePlaceholder : t.displayName;
                        const icon = isUsername ? <FaIdCard /> : <FaUser />;
                        const isDisabled = isUsername && !canEditUsername;

                        return (
                            <div
                                key={fieldId}
                                draggable={isEditMode}
                                onDragStart={(e) => isEditMode && handleFieldDragStart(e, fieldIdx, 'identity_container')}
                                onDragOver={(e) => isEditMode && handleFieldDragOver(e)}
                                onDrop={(e) => isEditMode && handleFieldDrop(e, fieldIdx, 'identity_container')}
                                style={{
                                    position: 'relative',
                                    padding: isEditMode ? '10px' : '0',
                                    border: (isEditMode && fieldDraggedItem === fieldIdx && fieldDraggedSection === 'identity_container') ? '2px dashed var(--accent-color)' : 'none',
                                    borderRadius: '16px',
                                    transition: 'all 0.2s',
                                    opacity: (fieldDraggedItem === fieldIdx && fieldDraggedSection === 'identity_container') ? 0.3 : 1
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'rgba(255,255,255,0.4)', paddingLeft: language === 'ar' ? '0' : '4px', paddingRight: language === 'ar' ? '4px' : '0' }}>
                                        {label}
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{
                                            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                                            left: language === 'ar' ? 'auto' : '1.2rem',
                                            right: language === 'ar' ? '1.2rem' : 'auto',
                                            color: 'var(--accent-color)', opacity: 0.5, fontSize: '1rem'
                                        }}>
                                            {icon}
                                        </div>
                                        <input
                                            type="text"
                                            value={fieldVal}
                                            onChange={e => setFieldVal(e.target.value)}
                                            disabled={isDisabled || isEditMode}
                                            placeholder={label}
                                            style={{
                                                width: '100%',
                                                padding: '1.1rem',
                                                paddingLeft: language === 'ar' ? '1.1rem' : '3.2rem',
                                                paddingRight: language === 'ar' ? '3.2rem' : '1.1rem',
                                                background: isDisabled ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '18px',
                                                color: isDisabled ? 'rgba(255,255,255,0.3)' : '#fff',
                                                fontSize: '0.95rem',
                                                fontWeight: '600',
                                                outline: 'none',
                                                transition: 'all 0.3s',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                    {isUsername && canEditUsername && (
                                        <p style={{ fontSize: '0.65rem', color: 'var(--accent-color)', opacity: 0.8, margin: '4px 0 0 4px' }}>
                                            {t.usernameWarning}
                                        </p>
                                    )}
                                </div>
                                {isEditMode && (
                                    <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-color)', color: '#fff', fontSize: '0.6rem', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
                                        MOVE
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        ),
        'bio_group': (props) => (
            <div
                className="glass-panel"
                key="bio_group"
                data-editable-id="bio_container"
                data-editable-type="container"
                style={{
                    padding: getStyle('bio_container', 'padding', '2rem'),
                    width: getStyle('bio_container', 'width', '100%'),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    background: getStyle('bio_container', 'background_color', 'rgba(255, 255, 255, 0.02)'),
                    backdropFilter: `blur(${getStyle('bio_container', 'backdrop_blur', '20px')})`,
                    border: `${getStyle('bio_container', 'border_width', '1px')} solid ${getStyle('bio_container', 'border_color', 'rgba(255,255,255,0.08)')}`,
                    borderRadius: getStyle('bio_container', 'border_radius', '32px'),
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    height: getStyle('bio_container', 'height', 'auto'),
                    textAlign: language === 'ar' ? 'right' : 'left',
                    position: 'relative',
                    overflow: 'hidden',
                    ...props.style
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                    <div style={{ width: '4px', height: '16px', background: 'var(--accent-color)', borderRadius: '4px' }}></div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {t.biography}
                    </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {getStyle('bio_container', 'field_order', ['header', 'input']).map((fieldId, fieldIdx) => {
                        if (fieldId === 'header') return null; // We use our own header above

                        return (
                            <div
                                key={fieldId}
                                draggable={isEditMode}
                                onDragStart={(e) => isEditMode && handleFieldDragStart(e, fieldIdx, 'bio_container')}
                                onDragOver={(e) => isEditMode && handleFieldDragOver(e)}
                                onDrop={(e) => isEditMode && handleFieldDrop(e, fieldIdx, 'bio_container')}
                                style={{
                                    position: 'relative',
                                    padding: isEditMode ? '10px' : '0',
                                    border: (isEditMode && fieldDraggedItem === fieldIdx && fieldDraggedSection === 'bio_container') ? '2px dashed var(--accent-color)' : 'none',
                                    borderRadius: '16px',
                                    transition: 'all 0.2s',
                                    opacity: (fieldDraggedItem === fieldIdx && fieldDraggedSection === 'bio_container') ? 0.3 : 1
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'rgba(255,255,255,0.4)', paddingLeft: language === 'ar' ? '0' : '4px', paddingRight: language === 'ar' ? '4px' : '0' }}>
                                        {t.bioLabel}
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{
                                            position: 'absolute', top: '1.2rem',
                                            left: language === 'ar' ? 'auto' : '1.2rem',
                                            right: language === 'ar' ? '1.2rem' : 'auto',
                                            color: 'var(--accent-color)', opacity: 0.5, fontSize: '1.1rem'
                                        }}>
                                            <FaAlignLeft />
                                        </div>
                                        <textarea
                                            value={bio}
                                            onChange={e => setBio(e.target.value)}
                                            disabled={isEditMode}
                                            placeholder={t.bioLabel}
                                            style={{
                                                width: '100%',
                                                padding: '1.1rem',
                                                paddingLeft: language === 'ar' ? '1.1rem' : '3.2rem',
                                                paddingRight: language === 'ar' ? '3.2rem' : '1.1rem',
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '18px',
                                                color: '#fff',
                                                fontSize: '0.95rem',
                                                fontWeight: '500',
                                                lineHeight: '1.6',
                                                minHeight: '140px',
                                                resize: 'none',
                                                outline: 'none',
                                                transition: 'all 0.3s',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                </div>
                                {isEditMode && (
                                    <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-color)', color: '#fff', fontSize: '0.6rem', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
                                        MOVE
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        ),
        'buttons': (props) => (
            <div key="buttons" style={{ display: 'flex', gap: '1.2rem', marginTop: '1rem', ...props.style }}>
                <button
                    type="submit"
                    disabled={saving || uploading || isEditMode}
                    className="glass-btn"
                    style={{
                        flex: 2,
                        background: 'var(--accent-color)',
                        border: 'none',
                        padding: '1.2rem',
                        fontSize: '1.1rem',
                        fontWeight: '900',
                        color: '#fff',
                        boxShadow: '0 10px 30px rgba(255,45,85,0.3)',
                        borderRadius: '22px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                        cursor: 'pointer',
                        opacity: (saving || uploading || isEditMode) ? 0.7 : 1,
                        textTransform: 'uppercase', letterSpacing: '1px'
                    }}
                >
                    {saving ? <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div> : <FaSave />}
                    {saving ? t.saving : t.saveChanges}
                </button>
                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isEditMode}
                    className="glass-btn"
                    style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '1.2rem',
                        fontSize: '1rem',
                        fontWeight: '800',
                        color: 'rgba(255,255,255,0.6)',
                        borderRadius: '22px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        cursor: 'pointer'
                    }}
                >
                    <FaSignOutAlt /> {t.logout}
                </button>
            </div>
        )
    }

    if (loading) return (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column', gap: '15px' }}>
            <div className="loading-spinner"></div><p style={{ opacity: 0.6, fontWeight: '600' }}>{t.loading}</p>
        </div>
    )

    return (
        <>
            <AdminHeader title={t.yourProfile} />
            <div style={{
                width: '94%',
                maxWidth: '1200px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.2rem',
                padding: '20px 0 4rem',
                margin: '0 auto',
                animation: 'fadeInScale 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards'
            }}>

                <form onSubmit={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {order.map((sectionId, index) => {
                        return (
                            <div
                                key={sectionId}
                                data-section-id={sectionId}
                                draggable={isEditMode}
                                onDragStart={(e) => isEditMode && handleDragStart(e, index)}
                                onDragOver={(e) => isEditMode && handleDragOver(e)}
                                onDrop={(e) => isEditMode && handleDrop(e, index)}
                                style={{
                                    position: 'relative',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                    opacity: draggedItem === index ? 0.3 : 1,
                                    marginBottom: getStyle(sectionId, 'margin_bottom', '0px')
                                }}
                            >
                                {isEditMode && (
                                    <div
                                        draggable={true}
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        style={{
                                            position: 'absolute', bottom: '-25px', left: '50%', transform: 'translateX(-50%)',
                                            background: 'var(--accent-color)', color: '#fff', borderRadius: '20px',
                                            padding: '4px 15px', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 100,
                                            cursor: 'grab', boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        ✋ {t.dragHere || 'DRAG'}
                                    </div>
                                )}

                                {React.cloneElement(sections[sectionId]({}), {
                                    style: {
                                        ...sections[sectionId]({}).props.style
                                    }
                                })}
                            </div>
                        )
                    })}
                </form>

                <style dangerouslySetInnerHTML={{
                    __html: `
                .avatar-overlay { pointer-events: none; }
                div:hover > .avatar-overlay { opacity: 1 !important; }
                .loading-spinner { width: 30px; height: 30px; border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid var(--accent-color); border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeInScale { from { opacity: 0; transform: scale(0.98) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            `}} />
            </div>
        </>
    )
}

export default AdminProfile
