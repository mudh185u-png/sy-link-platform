import React, { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { FaDownload, FaTimes } from 'react-icons/fa'

const QRIdentity = ({ url, username, frameId = 'none', onClose }) => {
    const qrRef = useRef()

    const downloadQR = () => {
        const canvas = qrRef.current.querySelector('canvas')
        const url = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = `SYLink-QR-${username}.png`
        link.href = url
        link.click()
    }

    // Frame colors for QR styling
    const frameColors = {
        'pearl-ethereal': '#fdeeff',
        'obsidian-neon': '#00f2ff',
        'grand-chronos': '#DAA520',
        'diamond-prism': '#b9f2ff',
        'aurora-liquid': '#00ff88'
    };

    const qrColor = frameColors[frameId] || '#ffffff';

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(20px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="glass-card" style={{
                position: 'relative',
                padding: '3rem',
                textAlign: 'center',
                maxWidth: '400px',
                width: '100%',
                borderRadius: '32px',
                border: `1px solid ${qrColor}33`,
                boxShadow: `0 20px 60px ${qrColor}22`
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>
                    <FaTimes />
                </button>

                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: qrColor }}>Sovereign Identity</h2>
                <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '2rem' }}>@{username}</p>

                <div
                    ref={qrRef}
                    style={{
                        background: '#fff',
                        padding: '1.5rem',
                        borderRadius: '24px',
                        display: 'inline-block',
                        boxShadow: `0 0 30px ${qrColor}44`,
                        marginBottom: '2rem'
                    }}
                >
                    <QRCodeCanvas
                        value={url}
                        size={250}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"H"}
                        includeMargin={false}
                        imageSettings={{
                            src: "/logo.png", // Assuming a logo exists
                            x: undefined,
                            y: undefined,
                            height: 50,
                            width: 50,
                            excavate: true,
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button onClick={downloadQR} className="glass-btn" style={{ background: qrColor, color: '#000', border: 'none', width: '100%', padding: '15px' }}>
                        <FaDownload style={{ marginInlineEnd: '10px' }} /> Download QR
                    </button>
                    <p style={{ fontSize: '0.8rem', opacity: 0.4 }}>This QR matches your Masterpiece Frame aesthetic.</p>
                </div>
            </div>
        </div>
    )
}

export default QRIdentity
