import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!user) return <div className="auth-container">Loading...</div>;

    return (
        <div className="dashboard-container">
            <header className="header">
                <h2>Overview Dashboard</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="user-badge">
                        <span>👋 Welcome, {user.name}</span>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className="btn" 
                        style={{ width: 'auto', padding: '10px 20px', backgroundColor: '#ef4444' }}
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            <div className="card-grid">
                <div className="stat-card glass">
                    <h3>Active Sessions</h3>
                    <p className="value">12</p>
                    <p style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '12px' }}>+4.5% vs last month</p>
                </div>
                <div className="stat-card glass">
                    <h3>API Requests</h3>
                    <p className="value">842</p>
                    <p style={{ color: '#6366f1', fontSize: '0.875rem', marginTop: '12px' }}>Total this month</p>
                </div>
                <div className="stat-card glass">
                    <h3>Security Events</h3>
                    <p className="value">0</p>
                    <p style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '12px' }}>Everything stable</p>
                </div>
            </div>

            <div className="glass" style={{ marginTop: '32px', padding: '40px', minHeight: '300px' }}>
                <h3 style={{ marginBottom: '16px' }}>Project Summary</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    Successfully implemented the full-stack architecture using Laravel 11 as the REST API backend and React 19 as the frontend. 
                    Authentication is secured by Laravel Sanctum, using token-based authentication with persistent state management via React Context.
                </p>
                <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                    <div className="user-badge" style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)', color: '#059669' }}>Backend: Ready</div>
                    <div className="user-badge" style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)', color: '#059669' }}>Frontend: Ready</div>
                    <div className="user-badge" style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)', color: '#059669' }}>Auth: Sanctum</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
