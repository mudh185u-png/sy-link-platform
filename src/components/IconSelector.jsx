import React from 'react'
import { iconMap, iconOptions } from '../utils/iconMap'

const IconSelector = ({ selectedIcon, onSelect }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)', // 5 columns for perfect mobile fit
            gap: '8px',
            padding: '0.4rem 0',
            marginTop: '0.5rem'
        }}>
            {iconOptions.map((iconKey) => (
                <button
                    key={iconKey}
                    type="button"
                    onClick={() => onSelect(iconKey)}
                    className="glass-btn"
                    style={{
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        border: selectedIcon === iconKey ? '2px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.06)',
                        background: selectedIcon === iconKey ? 'rgba(255,45,85,0.12)' : 'rgba(255,255,255,0.02)',
                        color: selectedIcon === iconKey ? 'var(--accent-color)' : '#fff',
                        boxShadow: selectedIcon === iconKey ? '0 5px 15px rgba(255,45,85,0.2)' : 'none',
                        borderRadius: '14px'
                    }}
                    onMouseOver={e => {
                        if (selectedIcon !== iconKey) {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                        }
                    }}
                    onMouseOut={e => {
                        if (selectedIcon !== iconKey) {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                        }
                    }}
                >
                    {iconMap[iconKey]}
                </button>
            ))}
        </div>
    )
}

export default IconSelector
