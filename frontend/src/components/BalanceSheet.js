import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';

const BalanceSheet = () => {
    const [report, setReport] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');

    useEffect(() => {
        apiClient.get('/companies').then(res => {
            setCompanies(res.data);
            if (res.data.length > 0) setSelectedCompany(res.data[0].id);
        });
    }, []);

    useEffect(() => {
        if (selectedCompany) {
            apiClient.get(`/reports/balance-sheet?company_id=${selectedCompany}`).then(res => setReport(res.data));
        }
    }, [selectedCompany]);

    if (!report) return <div>Loading Balance Sheet...</div>;

    return (
        <div className="dashboard-container">
            <header className="header" style={{ marginBottom: '40px' }}>
                <div>
                    <h2>Balance Sheet</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Snapshot of financial position as of today</p>
                </div>
                <select className="form-control" style={{ width: '250px' }} value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </header>

            <div className="card-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px', alignItems: 'start' }}>
                {/* Assets */}
                <div>
                    <h3 style={{ borderBottom: '3px solid var(--primary)', paddingBottom: '10px', marginBottom: '20px' }}>ASSETS</h3>
                    <table style={{ width: '100%' }}>
                        <tbody>
                            {report.assets.map(acc => (
                                <tr key={acc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '12px 0' }}>{acc.name}</td>
                                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600 }}>{Number(acc.balance).toLocaleString()}</td>
                                </tr>
                            ))}
                            <tr style={{ fontWeight: 800, fontSize: '1.1rem', backgroundColor: 'rgba(99, 102, 241, 0.05)' }}>
                                <td style={{ padding: '16px' }}>TOTAL ASSETS</td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>${report.total_assets.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Liabilities & Equity */}
                <div>
                    <h3 style={{ borderBottom: '3px solid #64748b', paddingBottom: '10px', marginBottom: '20px' }}>LIABILITIES & EQUITY</h3>
                    <table style={{ width: '100%' }}>
                        <tbody>
                            <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                                <td colSpan="2" style={{ padding: '8px 0', fontSize: '0.75rem', fontWeight: 800, opacity: 0.5 }}>LIABILITIES</td>
                            </tr>
                            {report.liabilities.map(acc => (
                                <tr key={acc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '12px 0', paddingLeft: '16px' }}>{acc.name}</td>
                                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600 }}>{Number(acc.balance).toLocaleString()}</td>
                                </tr>
                            ))}
                            <tr style={{ background: 'rgba(0,0,0,0.02)', marginTop: '20px' }}>
                                <td colSpan="2" style={{ padding: '8px 0', fontSize: '0.75rem', fontWeight: 800, opacity: 0.5, paddingTop: '30px' }}>EQUITY (RETAINED EARNINGS)</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '12px 0', paddingLeft: '16px' }}>Current Year Profit / Loss</td>
                                <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600, color: report.net_profit >= 0 ? '#059669' : '#e11d48' }}>
                                    {report.net_profit.toLocaleString()}
                                </td>
                            </tr>
                            <tr style={{ fontWeight: 800, fontSize: '1.1rem', backgroundColor: 'rgba(100, 116, 139, 0.05)' }}>
                                <td style={{ padding: '16px' }}>TOTAL LIAB. & EQUITY</td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>${report.total_l_e.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ marginTop: '40px', padding: '20px', borderRadius: '12px', border: '2px dashed #059669', textAlign: 'center', opacity: Math.abs(report.total_assets - report.total_l_e) < 1 ? 1 : 0.4 }}>
                        {Math.abs(report.total_assets - report.total_l_e) < 1 ? (
                            <strong style={{ color: '#059669' }}>✅ Balance Sheet is Balanced</strong>
                        ) : (
                            <strong style={{ color: '#ef4444' }}>❌ Out of Balance: ${(report.total_assets - report.total_l_e).toLocaleString()}</strong>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BalanceSheet;
