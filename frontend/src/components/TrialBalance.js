import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';

const TrialBalance = () => {
    const [report, setReport] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        if (selectedCompany) fetchReport();
    }, [selectedCompany]);

    const fetchCompanies = async () => {
        const res = await apiClient.get('/companies');
        setCompanies(res.data);
        if (res.data.length > 0) setSelectedCompany(res.data[0].id);
        setLoading(false);
    };

    const fetchReport = async () => {
        const res = await apiClient.get(`/reports/trial-balance?company_id=${selectedCompany}`);
        setReport(res.data);
    };

    if (loading) return <div>Loading reports...</div>;

    return (
        <div className="dashboard-container">
            <header className="header">
                <h2>Trial Balance</h2>
                <select className="form-control" style={{ width: '250px' }} value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </header>

            {report && (
                <div className="glass" style={{ padding: '0', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '2px solid var(--border)' }}>
                                <th style={{ padding: '16px' }}>Account Name (Code)</th>
                                <th style={{ padding: '16px' }}>Type</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>Debit ($)</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>Credit ($)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.accounts.map(acc => (
                                <tr key={acc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px' }}>{acc.name} ({acc.code})</td>
                                    <td style={{ padding: '16px' }}>{acc.type}</td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>{Number(acc.total_debit || 0).toLocaleString()}</td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>{Number(acc.total_credit || 0).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)', fontWeight: 800 }}>
                                <td colSpan="2" style={{ padding: '16px', textAlign: 'right' }}>TOTALS:</td>
                                <td style={{ padding: '16px', textAlign: 'right', color: 'var(--primary)' }}>{report.total_dr.toLocaleString()}</td>
                                <td style={{ padding: '16px', textAlign: 'right', color: 'var(--primary)' }}>{report.total_cr.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                    {!report.balanced && (
                        <div style={{ padding: '16px', color: '#ef4444', textAlign: 'center', fontWeight: 700 }}>
                            ⚠️ Warning: Trial Balance is NOT balanced!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TrialBalance;
