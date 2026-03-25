import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';

const AccountManagement = () => {
    const [accounts, setAccounts] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        company_id: '', branch_id: '', parent_id: '', name: '', code: '', type: 'Asset', description: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [accountsRes, companiesRes, branchesRes] = await Promise.all([
                apiClient.get('/accounts'),
                apiClient.get('/companies'),
                apiClient.get('/branches')
            ]);
            setAccounts(accountsRes.data);
            setCompanies(companiesRes.data);
            setBranches(branchesRes.data);
        } catch (err) {
            setError('Failed to load accounts data.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/accounts', formData);
            fetchData();
            setShowForm(false);
            setFormData({ company_id: '', branch_id: '', parent_id: '', name: '', code: '', type: 'Asset', description: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save account.');
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Asset': return '#10b981';
            case 'Liability': return '#ef4444';
            case 'Income': return '#6366f1';
            case 'Expense': return '#f59e0b';
            default: return 'var(--text-muted)';
        }
    };

    if (loading) return <div className="auth-container">Loading...</div>;

    const filteredBranches = branches.filter(b => b.company_id == formData.company_id);
    const possibleParents = accounts.filter(a => a.company_id == formData.company_id && a.type == formData.type);

    return (
        <div className="dashboard-container">
            <header className="header">
                <h2>Chart of Accounts</h2>
                <button onClick={() => setShowForm(!showForm)} className="btn" style={{ width: 'auto' }}>
                    {showForm ? 'Cancel' : '+ New Account'}
                </button>
            </header>

            {error && <div className="glass" style={{ color: '#ef4444', padding: '12px', marginBottom: '16px' }}>{error}</div>}

            {showForm && (
                <div className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="card-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                            <div className="form-group">
                                <label>Company</label>
                                <select className="form-control" value={formData.company_id} onChange={e => setFormData({...formData, company_id: e.target.value, branch_id: '', parent_id: ''})} required>
                                    <option value="">Select Company</option>
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Branch (Optional)</label>
                                <select className="form-control" value={formData.branch_id} onChange={e => setFormData({...formData, branch_id: e.target.value})} disabled={!formData.company_id}>
                                    <option value="">No Branch</option>
                                    {filteredBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Account Type</label>
                                <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value, parent_id: ''})} required>
                                    <option value="Asset">Asset</option>
                                    <option value="Liability">Liability</option>
                                    <option value="Income">Income</option>
                                    <option value="Expense">Expense</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Account Code</label>
                                <input className="form-control" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required placeholder="e.g. 1001" />
                            </div>
                            <div className="form-group">
                                <label>Account Name</label>
                                <input className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Petty Cash" />
                            </div>
                            <div className="form-group">
                                <label>Parent Account (Optional)</label>
                                <select className="form-control" value={formData.parent_id} onChange={e => setFormData({...formData, parent_id: e.target.value})} disabled={!formData.company_id}>
                                    <option value="">No Parent</option>
                                    {possibleParents.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '16px' }}>
                            <label>Description</label>
                            <textarea className="form-control" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ minHeight: '80px' }} />
                        </div>
                        <button type="submit" className="btn" style={{ marginTop: '16px' }}>Save Account</button>
                    </form>
                </div>
            )}

            <div className="glass" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                            <th style={{ padding: '16px' }}>Code</th>
                            <th style={{ padding: '16px' }}>Name</th>
                            <th style={{ padding: '16px' }}>Type</th>
                            <th style={{ padding: '16px' }}>Parent</th>
                            <th style={{ padding: '16px' }}>Company</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map(acc => (
                            <tr key={acc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '16px', fontWeight: 700 }}>{acc.code}</td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: 600 }}>{acc.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{acc.description}</div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ color: getTypeColor(acc.type), fontWeight: 700, fontSize: '0.8125rem' }}>{acc.type.toUpperCase()}</span>
                                </td>
                                <td style={{ padding: '16px' }}>{acc.parent ? `${acc.parent.code} - ${acc.parent.name}` : '-'}</td>
                                <td style={{ padding: '16px', fontSize: '0.875rem' }}>{companies.find(c => c.id === acc.company_id)?.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AccountManagement;
