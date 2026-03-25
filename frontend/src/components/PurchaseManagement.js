import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';
import PurchaseForm from './PurchaseForm';

const PurchaseManagement = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            const res = await apiClient.get('/purchases');
            setPurchases(res.data);
        } catch (err) {
            setError('Failed to fetch purchases.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="auth-container">Loading...</div>;

    return (
        <div className="dashboard-container">
            <header className="header">
                <h2>Purchase Management</h2>
                <button onClick={() => setShowForm(!showForm)} className="btn" style={{ width: 'auto' }}>
                    {showForm ? 'View All' : '+ Record Purchase'}
                </button>
            </header>

            {error && <div className="glass" style={{ color: '#ef4444', padding: '12px', marginBottom: '16px' }}>{error}</div>}

            {showForm ? (
                <PurchaseForm onComplete={() => {
                    setShowForm(false);
                    fetchPurchases();
                }} />
            ) : (
                <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="glass" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                                    <th style={{ padding: '16px' }}>Purchase No</th>
                                    <th style={{ padding: '16px' }}>Supplier</th>
                                    <th style={{ padding: '16px' }}>Date</th>
                                    <th style={{ padding: '16px' }}>Items</th>
                                    <th style={{ padding: '16px' }}>Total</th>
                                    <th style={{ padding: '16px' }}>Journal Entry</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases.map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '16px', fontWeight: 700 }}>{p.purchase_no}</td>
                                        <td style={{ padding: '16px' }}>{p.supplier?.name}</td>
                                        <td style={{ padding: '16px' }}>{p.purchase_date}</td>
                                        <td style={{ padding: '16px' }}>{p.items?.length} Diamonds</td>
                                        <td style={{ padding: '16px', fontWeight: 700 }}>
                                            {Number(p.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                                                {p.journal_entry?.reference_no}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {purchases.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No purchases found. Use the button above to record your first diamond purchase.
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

export default PurchaseManagement;
