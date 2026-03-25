import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';

const StockMovementReport = () => {
    const [movements, setMovements] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [filters, setFilters] = useState({
        company_id: '',
        from_date: '',
        to_date: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/companies').then(res => {
            setCompanies(res.data);
            setLoading(false);
        });
        fetchMovements();
    }, []);

    const fetchMovements = async () => {
        let url = '/stocks/movements?';
        if (filters.company_id) url += `company_id=${filters.company_id}&`;
        if (filters.from_date) url += `from_date=${filters.from_date}&`;
        if (filters.to_date) url += `to_date=${filters.to_date}&`;
        
        const res = await apiClient.get(url);
        setMovements(res.data);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="dashboard-container">
            <header className="header">
                <h2>Inventory Movement Audit</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Company</label>
                        <select className="form-control" value={filters.company_id} onChange={e => setFilters({...filters, company_id: e.target.value})}>
                            <option value="">All Companies</option>
                            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>From</label>
                        <input type="date" className="form-control" value={filters.from_date} onChange={e => setFilters({...filters, from_date: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>To</label>
                        <input type="date" className="form-control" value={filters.to_date} onChange={e => setFilters({...filters, to_date: e.target.value})} />
                    </div>
                    <button onClick={fetchMovements} className="btn" style={{ width: 'auto' }}>Filter</button>
                </div>
            </header>

            <div className="glass" style={{ padding: '0', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '16px' }}>Timestamp</th>
                            <th style={{ padding: '16px' }}>Lot Item</th>
                            <th style={{ padding: '16px' }}>Type</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}>Carat Change</th>
                            <th style={{ padding: '16px' }}>Reference / Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movements.map(m => (
                            <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '16px', fontSize: '0.875rem' }}>
                                    {new Date(m.created_at).toLocaleString()}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: 700 }}>{m.stock?.lot_name}</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{m.stock?.purchase_item?.purchase?.supplier?.name}</div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ 
                                        fontSize: '0.75rem', fontWeight: 800, padding: '4px 8px', borderRadius: '4px',
                                        backgroundColor: m.type === 'IN' ? '#ecfdf5' : m.type === 'OUT' ? '#fff1f2' : '#f5f3ff',
                                        color: m.type === 'IN' ? '#059669' : m.type === 'OUT' ? '#e11d48' : '#7c3aed'
                                    }}>
                                        {m.type}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 800, color: m.carat >= 0 ? '#059669' : '#e11d48' }}>
                                    {m.carat > 0 ? '+' : ''}{m.carat}ct
                                </td>
                                <td style={{ padding: '16px', fontSize: '0.875rem' }}>
                                    {m.notes}
                                </td>
                            </tr>
                        ))}
                        {movements.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>No movements found for the selected criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockMovementReport;
