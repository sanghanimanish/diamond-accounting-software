import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';
import SalesForm from './SalesForm';

const SalesManagement = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const res = await apiClient.get('/sales');
            setSales(res.data);
        } catch (err) {
            setError('Failed to fetch sales history.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Deleting this sale will restore the diamond carats back to stock and reverse ledger entries. Continue?')) return;
        try {
            await apiClient.delete(`/sales/${id}`);
            fetchSales();
        } catch (err) {
            alert('Failed to delete sale.');
        }
    };

    if (loading) return <div className="auth-container">Loading ledger...</div>;

    return (
        <div className="dashboard-container">
            <header className="header">
                <h2>Sales History</h2>
                <button onClick={() => setShowForm(!showForm)} className="btn" style={{ width: 'auto' }}>
                    {showForm ? 'View All' : '+ Create Sales Invoice'}
                </button>
            </header>

            {error && <div className="glass" style={{ color: '#ef4444', padding: '12px', marginBottom: '16px' }}>{error}</div>}

            {showForm ? (
                <SalesForm onComplete={() => {
                    setShowForm(false);
                    fetchSales();
                }} />
            ) : (
                <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="glass" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                                    <th style={{ padding: '16px' }}>Invoice</th>
                                    <th style={{ padding: '16px' }}>Customer</th>
                                    <th style={{ padding: '16px' }}>Date</th>
                                    <th style={{ padding: '16px' }}>Total Amount</th>
                                    <th style={{ padding: '16px' }}>Profit</th>
                                    <th style={{ padding: '16px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map(s => (
                                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: 700 }}>{s.sale_no}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{s.journal_entry?.reference_no}</div>
                                        </td>
                                        <td style={{ padding: '16px' }}>{s.customer?.name}</td>
                                        <td style={{ padding: '16px' }}>{s.sale_date}</td>
                                        <td style={{ padding: '16px', fontWeight: 700 }}>
                                            {Number(s.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: 700, color: Number(s.profit) >= 0 ? '#059669' : '#ef4444' }}>
                                            {Number(s.profit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <button onClick={() => handleDelete(s.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                                {sales.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No sales recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesManagement;
