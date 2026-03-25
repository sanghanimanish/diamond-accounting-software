import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'Dashboard', path: '/dashboard', icon: '📊' },
        { label: 'Management', type: 'header' },
        { label: 'Companies', path: '/companies', icon: '🏢' },
        { label: 'Branches', path: '/branches', icon: '📍' },
        { label: 'User Directory', path: '/users', icon: '👥' },
        { label: 'Accounting', type: 'header' },
        { label: 'Accounts (COA)', path: '/accounts', icon: '📂' },
        { label: 'Journal Entries', path: '/journal', icon: '📝' },
        { label: 'Inventory', type: 'header' },
        { label: 'Suppliers', path: '/suppliers', icon: '🚛' },
        { label: 'Purchases', path: '/purchases', icon: '📥' },
        { label: 'Customers', path: '/customers', icon: '🤝' },
        { label: 'Sales Orders', path: '/sales', icon: '📤' },
        { label: 'Stock Report', path: '/stock', icon: '💎' },
        { label: 'Stock Audit', path: '/stock/movements', icon: '⏳' },
        { label: 'Financials', type: 'header' },
        { label: 'Treasury (Payments)', path: '/payments', icon: '💳' },
        { label: 'Trial Balance', path: '/reports/trial-balance', icon: '⚖️' },
        { label: 'Profit & Loss', path: '/reports/profit-loss', icon: '📈' },
        { label: 'Balance Sheet', path: '/reports/balance-sheet', icon: '🏦' },
        { label: 'General Ledger', path: '/reports/ledger', icon: '📖' },
        { label: 'Settings', type: 'header' },
        { label: 'Currencies', path: '/currencies', icon: '💱' },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>DIAMOND<span style={{ color: 'var(--primary)' }}>ERP</span></div>
                <div style={{ fontSize: '0.6rem', opacity: 0.6 }}>Advanced Accounting Suite</div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item, idx) => (
                    item.type === 'header' ? (
                        <div key={idx} className="nav-header">{item.label}</div>
                    ) : (
                        <NavLink key={idx} to={item.path} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </NavLink>
                    )
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="avatar">{user?.name?.charAt(0)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="user-name">{user?.name}</div>
                        <div className="user-role">{user?.role || 'Administrator'}</div>
                    </div>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                     退出 (Logout)
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
