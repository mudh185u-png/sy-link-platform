import React from 'react'
import { Outlet } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

const AdminLayout = () => {
    return (
        <div style={{
            width: '100%',
            paddingTop: '70px', // Matches Header height
            paddingBottom: '110px', // Room for BottomNav
            minHeight: '100vh',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <div style={{
                width: '100%',
                padding: '0 1.25rem', // Horizontal breathing room
                boxSizing: 'border-box'
            }}>
                <Outlet />
            </div>
            <BottomNav />
        </div>
    )
}

export default AdminLayout
