import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';

const LedgerReport = () => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/accounts').then(res => {
            setAccounts(res.data);
            setLoading(false);
        });
    }, []);

    const fetchLedger = async () => {
        if (!selectedAccount) return;
        const res = await apiClient.get(`/reports/ledger?account_id=${selectedAccount}`);
        setReport(res.data);
    };

    return (
        <div className="dashboard-container">
            <header className="header">
                <h2>General Ledger</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <select className="form-control" style={{ width: '300px' }} value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
                        <option value="">Select Account to View History</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)}
                    </select>
                    <button onClick={fetchLedger} className="btn" style={{ width: 'auto' }}>Generate</button>
                </div>
            </header>

            {report && (
                <div className="glass" style={{ padding: '0', overflowX: 'auto' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ margin: 0 }}>{report.account.name} Ledger</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Account Type: {report.account.type}</p>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '16px' }}>Date</th>
                                <th style={{ padding: '16px' }}>Reference</th>
                                <th style={{ padding: '16px' }}>Narration</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>Debit</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>Credit</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>Running Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.items.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px' }}>{item.date}</td>
                                    <td style={{ padding: '16px', fontWeight: 700 }}>{item.ref}</td>
                                    <td style={{ padding: '16px' }}>
                                        <div>{item.narration}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{item.note}</div>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right', color: item.debit > 0 ? 'var(--primary)' : 'inherit' }}>
                                        {item.debit > 0 ? Number(item.debit).toLocaleString() : '-'}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right', color: item.credit > 0 ? '#ef4444' : 'inherit' }}>
                                        {item.credit > 0 ? Number(item.credit).toLocaleString() : '-'}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 800 }}>
                                        {Number(item.balance).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {report.items.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>No journal entries for this account.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LedgerReport;
