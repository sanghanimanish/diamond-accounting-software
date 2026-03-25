import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';

const SupplierManagement = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ company_id: '', name: '', contact_person: '', email: '', phone: '', address: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [suppliersRes, companiesRes] = await Promise.all([
                apiClient.get('/suppliers'),
                apiClient.get('/companies')
            ]);
            setSuppliers(suppliersRes.data);
            setCompanies(companiesRes.data);
        } catch (err) {
            setError('Failed to load suppliers.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/suppliers', formData);
            fetchData();
            setShowForm(false);
            setFormData({ company_id: '', name: '', contact_person: '', email: '', phone: '', address: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create supplier.');
        }
    };

    if (loading) return <div className="auth-container">Loading...</div>;

    return (
        <div className="dashboard-container">
            <header className="header">
                <h2>Suppliers</h2>
                <button onClick={() => setShowForm(!showForm)} className="btn" style={{ width: 'auto' }}>
                    {showForm ? 'Cancel' : '+ New Supplier'}
                </button>
            </header>

            {error && <div className="glass" style={{ color: '#ef4444', padding: '12px', marginBottom: '16px' }}>{error}</div>}

            {showForm && (
                <div className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="card-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            <div className="form-group">
                                <label>Company</label>
                                <select className="form-control" value={formData.company_id} onChange={e => setFormData({...formData, company_id: e.target.value})} required>
                                    <option value="">Select Company</option>
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Supplier Name</label>
                                <input className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Contact Person</label>
                                <input className="form-control" value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input className="form-control" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                            </div>
                        </div>
                        <button type="submit" className="btn" style={{ marginTop: '16px' }}>Save Supplier</button>
                    </form>
                </div>
            )}

            <div className="card-grid">
                {suppliers.map(s => (
                    <div key={s.id} className="stat-card glass">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 700 }}>{s.name}</h3>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{s.account?.code}</p>
                            </div>
                            <div className="user-badge" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>Supplier</div>
                        </div>
                        <div style={{ marginTop: '16px', fontSize: '0.875rem' }}>
                            <p><strong>Contact:</strong> {s.contact_person || 'N/A'}</p>
                            <p><strong>Email:</strong> {s.email || 'N/A'}</p>
                            <p><strong>Phone:</strong> {s.phone || 'N/A'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SupplierManagement;
