import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';

const CompanyManagement = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const res = await apiClient.get('/companies');
            setCompanies(res.data);
        } catch (err) {
            setError('Failed to load companies.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/companies', formData);
            fetchCompanies();
            setFormData({ name: '', email: '', phone: '', address: '' });
            setShowForm(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create company.');
        }
    };

    if (loading) return <div className="auth-container">Loading...</div>;

    return (
        <div className="dashboard-container">
            <header className="header">
                <h2>Company Management</h2>
                <button onClick={() => setShowForm(!showForm)} className="btn" style={{ width: 'auto' }}>
                    {showForm ? 'Cancel' : '+ New Company'}
                </button>
            </header>

            {error && <div className="glass" style={{ color: '#ef4444', padding: '12px', marginBottom: '16px' }}>{error}</div>}

            {showForm && (
                <div className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="card-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div className="form-group">
                                <label>Company Name</label>
                                <input 
                                    className="form-control" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input 
                                    type="email" 
                                    className="form-control" 
                                    value={formData.email} 
                                    onChange={e => setFormData({...formData, email: e.target.value})}
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
                            <div className="form-group">
                                <label>Address</label>
                                <input 
                                    className="form-control" 
                                    value={formData.address} 
                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn" style={{ marginTop: '16px' }}>Save Company</button>
                    </form>
                </div>
            )}

            <div className="card-grid">
                {companies.map(company => (
                    <div key={company.id} className="stat-card glass">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{company.name}</h3>
                                <p style={{ fontSize: '0.875rem' }}>{company.email || 'No email'}</p>
                            </div>
                            <div className="user-badge">{company.branches_count} Branches</div>
                        </div>
                        <div style={{ marginTop: '20px', pt: '20px', borderTop: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{company.address || 'No address provided'}</p>
                            <p style={{ marginTop: '8px', fontWeight: 600 }}>{company.users_count} Total Users</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompanyManagement;
