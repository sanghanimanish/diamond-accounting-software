import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [branches, setBranches] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        company_id: '', branch_id: '', type: 'RECEIPT', account_id: '', entity_account_id: '', 
        reference_no: '', payment_date: new Date().toISOString().split('T')[0], amount: 0, notes: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (formData.company_id) {
            fetchCompanySpecificData();
        }
    }, [formData.company_id]);

    const fetchInitialData = async () => {
        try {
            const [compRes, brRes, payRes] = await Promise.all([
                apiClient.get('/companies'),
                apiClient.get('/branches'),
                apiClient.get('/payments')
            ]);
            setCompanies(compRes.data);
            setBranches(brRes.data);
            setPayments(payRes.data);
            setFormData(prev => ({ ...prev, reference_no: 'REF-' + Date.now().toString().slice(-6) }));
        } catch (err) {
            setError('Failed to load payments.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanySpecificData = async () => {
        try {
            const [accRes, custRes, suppRes] = await Promise.all([
                apiClient.get(`/accounts?company_id=${formData.company_id}`),
                apiClient.get(`/customers?company_id=${formData.company_id}`),
                apiClient.get(`/suppliers?company_id=${formData.company_id}`)
            ]);
            setAccounts(accRes.data);
            setCustomers(custRes.data);
            setSuppliers(suppRes.data);
        } catch (err) {
            setError('Failed to load company accounts.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/payments', formData);
            fetchInitialData();
            setShowForm(false);
            setFormData({
                company_id: '', branch_id: '', type: 'RECEIPT', account_id: '', entity_account_id: '', 
                reference_no: 'REF-' + Date.now(), payment_date: new Date().toISOString().split('T')[0], amount: 0, notes: ''
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save transaction.');
        }
    };

    if (loading) return <div className="auth-container">Loading transactions...</div>;

    const filteredBranches = branches.filter(b => b.company_id == formData.company_id);
    const cashBankAccounts = accounts.filter(a => a.type === 'Asset'); // Asset is broad, but COA doesn't have more specific types yet

    return (
        <div className="dashboard-container">
            <header className="header">
                <h2>Treasury: Payments & Receipts</h2>
                <button onClick={() => setShowForm(!showForm)} className="btn" style={{ width: 'auto' }}>
                    {showForm ? 'View All' : '+ Record Transaction'}
                </button>
            </header>

            {error && <div className="glass" style={{ color: '#ef4444', padding: '12px', marginBottom: '16px' }}>{error}</div>}

            {showForm ? (
                <div className="glass" style={{ padding: '32px', marginBottom: '24px' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="card-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            <div className="form-group">
                                <label>Transaction Type</label>
                                <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value, entity_account_id: ''})} required>
                                    <option value="RECEIPT">Receipt (Money In)</option>
                                    <option value="PAYMENT">Payment (Money Out)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Company</label>
                                <select className="form-control" value={formData.company_id} onChange={e => setFormData({...formData, company_id: e.target.value})} required>
                                    <option value="">Select Company</option>
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Cash/Bank Account</label>
                                <select className="form-control" value={formData.account_id} onChange={e => setFormData({...formData, account_id: e.target.value})} required disabled={!formData.company_id}>
                                    <option value="">Select Account</option>
                                    {cashBankAccounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>{formData.type === 'RECEIPT' ? 'From Customer' : 'To Supplier'}</label>
                                <select className="form-control" value={formData.entity_account_id} onChange={e => setFormData({...formData, entity_account_id: e.target.value})} required disabled={!formData.company_id}>
                                    <option value="">Select Account</option>
                                    {formData.type === 'RECEIPT' 
                                        ? customers.map(c => <option key={c.id} value={c.account_id}>{c.name}</option>)
                                        : suppliers.map(s => <option key={s.id} value={s.account_id}>{s.name}</option>)
                                    }
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Amount ($)</label>
                                <input type="number" step="0.01" className="form-control" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" className="form-control" value={formData.payment_date} onChange={e => setFormData({...formData, payment_date: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Ref No</label>
                                <input className="form-control" value={formData.reference_no} onChange={e => setFormData({...formData, reference_no: e.target.value})} required />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '16px' }}>
                            <label>Narration / Notes</label>
                            <textarea className="form-control" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                        </div>
                        <button type="submit" className="btn" style={{ marginTop: '24px' }}>Authorize Transaction</button>
                    </form>
                </div>
            ) : (
                <div className="glass" style={{ padding: '0', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                                <th style={{ padding: '16px' }}>Ref / Date</th>
                                <th style={{ padding: '16px' }}>Type</th>
                                <th style={{ padding: '16px' }}>A/C Affected</th>
                                <th style={{ padding: '16px' }}>Entity</th>
                                <th style={{ padding: '16px' }}>Amount</th>
                                <th style={{ padding: '16px' }}>Journal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: 700 }}>{p.reference_no}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{p.payment_date}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', backgroundColor: p.type === 'RECEIPT' ? '#ecfdf5' : '#fff1f2', color: p.type === 'RECEIPT' ? '#059669' : '#e11d48' }}>
                                            {p.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>{p.account?.name}</td>
                                    <td style={{ padding: '16px' }}>{p.entity_account?.name}</td>
                                    <td style={{ padding: '16px', fontWeight: 700, color: p.type === 'RECEIPT' ? '#059669' : '#e11d48' }}>
                                        {p.type === 'RECEIPT' ? '+' : '-'}{Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{p.journal_entry?.reference_no}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PaymentManagement;
