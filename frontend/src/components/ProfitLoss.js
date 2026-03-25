import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';

const ProfitLoss = () => {
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
            apiClient.get(`/reports/profit-loss?company_id=${selectedCompany}`).then(res => setReport(res.data));
        }
    }, [selectedCompany]);

    if (!report) return <div>Loading P&L...</div>;

    return (
        <div className="dashboard-container">
            <header className="header">
                <h2>Profit & Loss Statement</h2>
                <select className="form-control" style={{ width: '250px' }} value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </header>

            <div className="card-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                {/* Income */}
                <div className="glass" style={{ padding: '24px' }}>
                    <h3 style={{ color: '#059669', marginBottom: '20px' }}>Revenue / Income</h3>
                    <table style={{ width: '100%', fontSize: '0.875rem' }}>
                        <tbody>
                            {report.income.map(acc => (
                                <tr key={acc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '12px 0' }}>{acc.name}</td>
                                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600 }}>{Number(acc.balance).toLocaleString()}</td>
                                </tr>
                            ))}
                            <tr style={{ fontWeight: 800, fontSize: '1rem' }}>
                                <td style={{ padding: '24px 0 0' }}>Total Income</td>
                                <td style={{ padding: '24px 0 0', textAlign: 'right', borderTop: '2px solid var(--border)' }}>
                                    {report.total_income.toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Expenses */}
                <div className="glass" style={{ padding: '24px' }}>
                    <h3 style={{ color: '#e11d48', marginBottom: '20px' }}>Operating Expenses</h3>
                    <table style={{ width: '100%', fontSize: '0.875rem' }}>
                        <tbody>
                            {report.expenses.map(acc => (
                                <tr key={acc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '12px 0' }}>{acc.name}</td>
                                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600 }}>{Number(acc.balance).toLocaleString()}</td>
                                </tr>
                            ))}
                            <tr style={{ fontWeight: 800, fontSize: '1rem' }}>
                                <td style={{ padding: '24px 0 0' }}>Total Expenses</td>
                                <td style={{ padding: '24px 0 0', textAlign: 'right', borderTop: '2px solid var(--border)' }}>
                                    {report.total_expense.toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Bottom Line */}
                <div className="glass" style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', backgroundColor: report.net_profit >= 0 ? 'rgba(5, 150, 105, 0.05)' : 'rgba(225, 29, 72, 0.05)' }}>
                    <h2 style={{ margin: 0, opacity: 0.7, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Net Profit / (Loss)</h2>
                    <div style={{ fontSize: '3rem', fontWeight: 900, color: report.net_profit >= 0 ? '#059669' : '#e11d48', marginTop: '8px' }}>
                        ${report.net_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfitLoss;
