import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout = () => {
    return (
        <div className="admin-layout">
            <Sidebar />
            <main className="main-content">
                <header className="main-header">
                    <div className="header-breadcrumbs">
                        Dashboard / <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Overview</span>
                    </div>
                    <div className="header-actions">
                        <button className="btn outline" style={{ width: 'auto' }}>
                            🔔 <span>Notifications</span>
                        </button>
                    </div>
                </header>
                <div style={{ padding: '32px' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
