import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';

const CurrencyManagement = () => {
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ code: '', name: '', exchange_rate: 1.0, is_base: false });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCurrencies();
    }, []);

    const fetchCurrencies = async () => {
        try {
            const res = await apiClient.get('/currencies');
            setCurrencies(res.data);
        } catch (err) {
            setError('Failed to fetch currencies.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/currencies', formData);
            fetchCurrencies();
            setShowForm(false);
            setFormData({ code: '', name: '', exchange_rate: 1.0, is_base: false });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save currency.');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="dashboard-container">
            <header className="header">
                <h2>Multi-Currency Configuration</h2>
                <button onClick={() => setShowForm(!showForm)} className="btn" style={{ width: 'auto' }}>
                    {showForm ? 'Cancel' : '+ New Currency'}
                </button>
            </header>

            {error && <div className="glass" style={{ color: '#ef4444', padding: '12px', marginBottom: '16px' }}>{error}</div>}

            {showForm && (
                <div className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="card-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                            <div className="form-group">
                                <label>ISO Code (e.g. USD)</label>
                                <input className="form-control" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required maxLength="3" />
                            </div>
                            <div className="form-group">
                                <label>Currency Name</label>
                                <input className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Exchange Rate (to Base)</label>
                                <input type="number" step="0.000001" className="form-control" value={formData.exchange_rate} onChange={e => setFormData({...formData, exchange_rate: e.target.value})} required />
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '32px' }}>
                                <input type="checkbox" checked={formData.is_base} onChange={e => setFormData({...formData, is_base: e.target.checked})} />
                                <label>Set as Base Currency</label>
                            </div>
                        </div>
                        <button type="submit" className="btn" style={{ marginTop: '16px' }}>Register Currency</button>
                    </form>
                </div>
            )}

            <div className="card-grid">
                {currencies.map(c => (
                    <div key={c.id} className="stat-card glass" style={{ borderLeft: c.is_base ? '4px solid var(--primary)' : '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={{ margin: 0 }}>{c.code}</h3>
                            {c.is_base && <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>BASE</span>}
                        </div>
                        <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>{c.name}</p>
                        <div style={{ marginTop: '12px', fontWeight: 800 }}>
                            1 {c.code} = {c.exchange_rate} Base Unit
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CurrencyManagement;
