import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';

const StockReport = () => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStock, setSelectedStock] = useState(null);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [adjustment, setAdjustment] = useState({ carat: 0, notes: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            const res = await apiClient.get('/stocks');
            setStocks(res.data);
        } catch (err) {
            setError('Failed to load stock data.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewMovements = async (id) => {
        try {
            const res = await apiClient.get(`/stocks/${id}`);
            setSelectedStock(res.data);
        } catch (err) {
            alert('Failed to load details.');
        }
    };

    const handleAdjustment = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post(`/stocks/${selectedStock.id}/adjust`, {
                adjustment_carat: adjustment.carat,
                notes: adjustment.notes
            });
            fetchStocks();
            handleViewMovements(selectedStock.id); 
            setShowAdjustModal(false);
            setAdjustment({ carat: 0, notes: '' });
        } catch (err) {
            alert('Adjustment failed.');
        }
    };

    const handleEmailReport = async () => {
        const email = window.prompt("Enter stakeholder email address:");
        if (!email) return;
        try {
            const res = await apiClient.post('/stocks/email', {
                email: email,
                company_id: stocks[0]?.company_id // Simplified
            });
            alert(res.data.message);
        } catch (err) {
            alert('Failed to send email.');
        }
    };

    if (loading) return <div className="auth-container">Loading Stock Inventory...</div>;

    const totalValuation = stocks.reduce((sum, s) => sum + (Number(s.remaining_carat) * Number(s.cost_rate)), 0);

    return (
        <div className="dashboard-container">
            <header className="header">
                <h2>Diamond Inventory Report</h2>
                <div style={{ color: 'var(--text-muted)' }}>
                    Total Stock Valuation: 
                    <strong style={{ color: 'var(--primary)', marginLeft: '8px' }}>
                        ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </strong>
                </div>
            </header>

            <div className="card-grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px' }}>
                {/* Main Stock Table */}
                <div className="glass" style={{ padding: '0', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '16px' }}>Lot Name</th>
                                <th style={{ padding: '16px' }}>Original</th>
                                <th style={{ padding: '16px' }}>On Hand</th>
                                <th style={{ padding: '16px' }}>Cost</th>
                                <th style={{ padding: '16px' }}>Value</th>
                                <th style={{ padding: '16px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stocks.map(s => (
                                <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: 700 }}>{s.lot_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.purchase_item?.purchase?.supplier?.name}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>{s.original_carat}ct</td>
                                    <td style={{ padding: '16px', color: Number(s.remaining_carat) < 0.1 ? '#ef4444' : 'inherit', fontWeight: 700 }}>
                                        {s.remaining_carat}ct
                                    </td>
                                    <td style={{ padding: '16px' }}>${Number(s.cost_rate).toLocaleString()}</td>
                                    <td style={{ padding: '16px', fontWeight: 700 }}>
                                        ${(Number(s.remaining_carat) * Number(s.cost_rate)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <button onClick={() => handleViewMovements(s.id)} className="btn" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.75rem' }}>History</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Sidebar Detail (Movements) */}
                <div className="glass" style={{ padding: '24px' }}>
                    {selectedStock ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0 }}>Movement Audit</h3>
                                <button onClick={() => setShowAdjustModal(true)} style={{ color: 'var(--primary)', border: 'none', background: 'none', fontWeight: 600, cursor: 'pointer' }}>Adjust</button>
                            </div>
                            <div style={{ fontSize: '0.875rem', marginBottom: '24px' }}>
                                <p><strong>Lot:</strong> {selectedStock.lot_name}</p>
                                <p><strong>Current Balance:</strong> {selectedStock.remaining_carat}ct</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {selectedStock.movements?.map(m => (
                                    <div key={m.id} style={{ padding: '12px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', borderLeft: `4px solid ${m.type === 'IN' ? '#059669' : m.type === 'OUT' ? '#ef4444' : '#6366f1'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                            <span>{m.type}</span>
                                            <span style={{ color: m.type === 'IN' ? '#059669' : m.type === 'OUT' ? '#ef4444' : 'inherit' }}>
                                                {m.type === 'OUT' ? '-' : '+'}{Math.abs(m.carat)}ct
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '4px' }}>{m.notes}</div>
                                        <div style={{ fontSize: '0.625rem', opacity: 0.5 }}>{new Date(m.created_at).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '40px' }}>
                            Select a stock lot to view movement history and audits.
                        </div>
                    )}
                </div>
            </div>

            {showAdjustModal && (
                <div className="auth-container" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass" style={{ width: '400px', padding: '32px' }}>
                        <h3>Stock Adjustment</h3>
                        <p style={{ fontSize: '0.875rem', marginBottom: '16px' }}>Adding {adjustment.carat}ct to {selectedStock.lot_name}. Use negative for reduction.</p>
                        <form onSubmit={handleAdjustment}>
                            <div className="form-group">
                                <label>Adjustment Amount (Carats)</label>
                                <input type="number" step="0.001" className="form-control" value={adjustment.carat} onChange={e => setAdjustment({...adjustment, carat: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Reason/Notes</label>
                                <textarea className="form-control" value={adjustment.notes} onChange={e => setAdjustment({...adjustment, notes: e.target.value})} required />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                <button type="submit" className="btn">Post Adjustment</button>
                                <button type="button" onClick={() => setShowAdjustModal(false)} className="btn" style={{ background: '#e2e8f0', color: '#475569' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockReport;
