import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';

const BranchManagement = () => {
    const [branches, setBranches] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ company_id: '', name: '', address: '', phone: '' });
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [branchesRes, companiesRes] = await Promise.all([
                apiClient.get('/branches'),
                apiClient.get('/companies')
            ]);
            setBranches(branchesRes.data);
            setCompanies(companiesRes.data);
        } catch (err) {
            setError('Failed to load branches.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/branches', formData);
            fetchData();
            setFormData({ company_id: '', name: '', address: '', phone: '' });
            setShowForm(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create branch.');
        }
    };

    if (loading) return <div className="auth-container">Loading management console...</div>;

    return (
        <div className="dashboard-container">
            <header className="header">
                <h2>Branch Management</h2>
                <button onClick={() => setShowForm(!showForm)} className="btn" style={{ width: 'auto' }}>
                    {showForm ? 'Cancel' : '+ New Branch'}
                </button>
            </header>

            {error && <div className="glass" style={{ color: '#ef4444', padding: '12px', marginBottom: '16px' }}>{error}</div>}

            {showForm && (
                <div className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="card-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            <div className="form-group">
                                <label>Company</label>
                                <select 
                                    className="form-control" 
                                    value={formData.company_id} 
                                    onChange={e => setFormData({...formData, company_id: e.target.value})} 
                                    required
                                >
                                    <option value="">Select Company</option>
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Branch Name</label>
                                <input 
                                    className="form-control" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input 
                                    className="form-control" 
                                    value={formData.phone} 
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 3' }}>
                                <label>Address</label>
                                <input 
                                    className="form-control" 
                                    value={formData.address} 
                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn" style={{ marginTop: '16px' }}>Save Branch</button>
                    </form>
                </div>
            )}

            <div className="card-grid">
                {branches.map(branch => (
                    <div key={branch.id} className="stat-card glass">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{branch.name}</h3>
                                <p style={{ fontSize: '0.875rem' }}>{branch.company?.name || 'Unknown Company'}</p>
                            </div>
                            <div className="user-badge">{branch.users_count} Users</div>
                        </div>
                        <div style={{ marginTop: '20px', pt: '20px', borderTop: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{branch.address || 'No address provided'}</p>
                            <p style={{ marginTop: '8px', fontWeight: 600 }}>{branch.phone || 'No phone provided'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BranchManagement;
