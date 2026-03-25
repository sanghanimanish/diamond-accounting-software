import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
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
            const [customersRes, companiesRes] = await Promise.all([
                apiClient.get('/customers'),
                apiClient.get('/companies')
            ]);
            setCustomers(customersRes.data);
            setCompanies(companiesRes.data);
        } catch (err) {
            setError('Failed to load customers.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/customers', formData);
            fetchData();
            setShowForm(false);
            setFormData({ company_id: '', name: '', contact_person: '', email: '', phone: '', address: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create customer.');
        }
    };

    if (loading) return <div className="auth-container">Loading...</div>;

    return (
        <div className="dashboard-container">
            <header className="header">
                <h2>Customer Directory</h2>
                <button onClick={() => setShowForm(!showForm)} className="btn" style={{ width: 'auto' }}>
                    {showForm ? 'Cancel' : '+ New Customer'}
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
                                <label>Customer Name</label>
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
                        <button type="submit" className="btn" style={{ marginTop: '16px' }}>Register Customer</button>
                    </form>
                </div>
            )}

            <div className="card-grid">
                {customers.map(c => (
                    <div key={c.id} className="stat-card glass">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 700 }}>{c.name}</h3>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{c.account?.code}</p>
                            </div>
                            <div className="user-badge" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>Customer</div>
                        </div>
                        <div style={{ marginTop: '16px', fontSize: '0.875rem' }}>
                            <p><strong>Contact:</strong> {c.contact_person || 'N/A'}</p>
                            <p><strong>Email:</strong> {c.email || 'N/A'}</p>
                            <p><strong>Phone:</strong> {c.phone || 'N/A'}</p>
                        </div>
                    </div>
                ))}
                {customers.length === 0 && <div className="glass" style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center' }}>No customers registered yet.</div>}
            </div>
        </div>
    );
};

export default CustomerManagement;
