import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';

const JournalEntryForm = ({ onComplete }) => {
    const [accounts, setAccounts] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [header, setHeader] = useState({
        company_id: '', branch_id: '', entry_date: new Date().toISOString().split('T')[0], reference_no: '', narration: ''
    });
    const [items, setItems] = useState([
        { account_id: '', debit: 0, credit: 0, note: '' },
        { account_id: '', debit: 0, credit: 0, note: '' }
    ]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [accs, comps, brs] = await Promise.all([
                apiClient.get('/accounts'),
                apiClient.get('/companies'),
                apiClient.get('/branches')
            ]);
            setAccounts(accs.data);
            setCompanies(comps.data);
            setBranches(brs.data);
            setHeader(prev => ({ ...prev, reference_no: 'JV-' + Date.now().toString().slice(-6) }));
        } catch (err) {
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    const addItem = () => setItems([...items, { account_id: '', debit: 0, credit: 0, note: '' }]);
    const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        
        // If debit is entered, credit should be 0 and vice versa
        if (field === 'debit' && value > 0) newItems[index].credit = 0;
        if (field === 'credit' && value > 0) newItems[index].debit = 0;
        
        setItems(newItems);
    };

    const totalDebit = items.reduce((sum, item) => sum + Number(item.debit || 0), 0);
    const totalCredit = items.reduce((sum, item) => sum + Number(item.credit || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!isBalanced) {
            setError('Journal is not balanced. Total Debits must equal Total Credits.');
            return;
        }

        try {
            await apiClient.post('/journal-entries', { ...header, items });
            if (onComplete) onComplete();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save journal entry.');
        }
    };

    if (loading) return <div>Loading form...</div>;

    const filteredBranches = branches.filter(b => b.company_id == header.company_id);

    return (
        <div className="glass" style={{ padding: '32px', marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '24px' }}>New Journal Entry</h3>
            {error && <div style={{ color: '#ef4444', marginBottom: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="card-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    <div className="form-group">
                        <label>Company</label>
                        <select className="form-control" value={header.company_id} onChange={e => setHeader({...header, company_id: e.target.value, branch_id: ''})} required>
                            <option value="">Select Company</option>
                            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Branch</label>
                        <select className="form-control" value={header.branch_id} onChange={e => setHeader({...header, branch_id: e.target.value})} disabled={!header.company_id}>
                            <option value="">Select Branch</option>
                            {filteredBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input type="date" className="form-control" value={header.entry_date} onChange={e => setHeader({...header, entry_date: e.target.value})} required />
                    </div>
                    <div className="form-group">
                        <label>Reference</label>
                        <input className="form-control" value={header.reference_no} onChange={e => setHeader({...header, reference_no: e.target.value})} required />
                    </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                                <th style={{ padding: '8px' }}>Account</th>
                                <th style={{ padding: '8px', width: '150px' }}>Debit</th>
                                <th style={{ padding: '8px', width: '150px' }}>Credit</th>
                                <th style={{ padding: '8px' }}>Note</th>
                                <th style={{ padding: '8px', width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '8px' }}>
                                        <select 
                                            className="form-control" 
                                            value={item.account_id} 
                                            onChange={e => handleItemChange(index, 'account_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Account</option>
                                            {accounts.filter(a => a.company_id == header.company_id).map(a => (
                                                <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input 
                                            type="number" step="0.01" className="form-control" 
                                            value={item.debit} 
                                            onChange={e => handleItemChange(index, 'debit', e.target.value)}
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input 
                                            type="number" step="0.01" className="form-control" 
                                            value={item.credit} 
                                            onChange={e => handleItemChange(index, 'credit', e.target.value)}
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input className="form-control" value={item.note} onChange={e => handleItemChange(index, 'note', e.target.value)} placeholder="Memo" />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <button type="button" onClick={() => removeItem(index)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td style={{ padding: '16px', fontWeight: 700, textAlign: 'right' }}>Totals:</td>
                                <td style={{ padding: '16px', fontWeight: 700, color: isBalanced ? '#10b981' : '#ef4444' }}>{totalDebit.toFixed(2)}</td>
                                <td style={{ padding: '16px', fontWeight: 700, color: isBalanced ? '#10b981' : '#ef4444' }}>{totalCredit.toFixed(2)}</td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                    <button type="button" onClick={addItem} className="btn" style={{ width: 'auto', marginTop: '16px', background: 'var(--text-muted)' }}>+ Add Row</button>
                    {!isBalanced && totalDebit > 0 && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '8px' }}>Difference: {Math.abs(totalDebit - totalCredit).toFixed(2)}</p>}
                </div>

                <div className="form-group" style={{ marginTop: '24px' }}>
                    <label>Narration / General Note</label>
                    <textarea className="form-control" value={header.narration} onChange={e => setHeader({...header, narration: e.target.value})} style={{ minHeight: '80px' }} />
                </div>

                <button type="submit" className="btn" style={{ marginTop: '24px' }} disabled={!isBalanced}>Post Journal Entry</button>
            </form>
        </div>
    );
};

export default JournalEntryForm;
