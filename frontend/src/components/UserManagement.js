import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [editData, setEditData] = useState({ role_ids: [], company_id: '', branch_id: '', name: '', email: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, rolesRes, companiesRes, branchesRes] = await Promise.all([
                apiClient.get('/users'),
                apiClient.get('/roles'),
                apiClient.get('/companies'),
                apiClient.get('/branches')
            ]);
            setUsers(usersRes.data);
            setRoles(rolesRes.data);
            setCompanies(companiesRes.data);
            setBranches(branchesRes.data);
        } catch (err) {
            setError('Failed to fetch data.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await apiClient.patch(`/users/${selectedUser.id}`, editData);
            fetchData();
            setSelectedUser(null);
        } catch (err) {
            setError('Failed to update user.');
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setEditData({
            name: user.name,
            email: user.email,
            role_ids: user.roles.map(r => r.id),
            company_id: user.company_id || '',
            branch_id: user.branch_id || ''
        });
    };

    const toggleRole = (roleId) => {
        setEditData(prev => ({
            ...prev,
            role_ids: prev.role_ids.includes(roleId) 
                ? prev.role_ids.filter(id => id !== roleId) 
                : [...prev.role_ids, roleId]
        }));
    };

    if (loading) return <div className="auth-container">Loading...</div>;

    const filteredBranches = branches.filter(b => b.company_id == editData.company_id);

    return (
        <div className="dashboard-container">
            <header className="header">
                <h2>User Management</h2>
                <div className="user-badge">Admin View</div>
            </header>

            {error && <div className="glass" style={{ color: '#ef4444', padding: '12px', marginBottom: '16px' }}>{error}</div>}

            <div className="glass" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '16px' }}>User</th>
                            <th style={{ padding: '16px' }}>Company & Branch</th>
                            <th style={{ padding: '16px' }}>Roles</th>
                            <th style={{ padding: '16px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontSize: '0.875rem' }}>{u.company?.name || 'No Company'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.branch?.name || 'No Branch'}</div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {u.roles.map(r => <span key={r.id} className="user-badge" style={{ fontSize: '0.7rem' }}>{r.name}</span>)}
                                    </div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <button onClick={() => openEditModal(u)} className="btn" style={{ width: 'auto', padding: '6px 12px' }}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedUser && (
                <div className="auth-container" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
                    <div className="auth-card glass" style={{ backgroundColor: '#fff', maxWidth: '600px', textAlign: 'left' }}>
                        <h3>Edit User: {selectedUser.name}</h3>
                        <form onSubmit={handleUpdate} style={{ marginTop: '20px' }}>
                            <div className="card-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div className="form-group">
                                    <label>Company</label>
                                    <select 
                                        className="form-control" 
                                        value={editData.company_id} 
                                        onChange={e => setEditData({...editData, company_id: e.target.value, branch_id: ''})}
                                    >
                                        <option value="">No Company</option>
                                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Branch</label>
                                    <select 
                                        className="form-control" 
                                        value={editData.branch_id} 
                                        onChange={e => setEditData({...editData, branch_id: e.target.value})}
                                        disabled={!editData.company_id}
                                    >
                                        <option value="">No Branch</option>
                                        {filteredBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div style={{ marginTop: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Assign Roles</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {roles.map(role => (
                                        <div key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={editData.role_ids.includes(role.id)} 
                                                onChange={() => toggleRole(role.id)}
                                            />
                                            <span style={{ fontSize: '0.875rem' }}>{role.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                                <button type="submit" className="btn">Update User</button>
                                <button type="button" onClick={() => setSelectedUser(null)} className="btn" style={{ backgroundColor: '#94a3b8' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
