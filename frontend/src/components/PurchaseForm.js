import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';

const PurchaseForm = ({ onComplete }) => {
    const [suppliers, setSuppliers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [header, setHeader] = useState({
        company_id: '', branch_id: '', supplier_id: '', purchase_no: '', purchase_date: new Date().toISOString().split('T')[0], notes: ''
    });
    const [items, setItems] = useState([
        { item_name: '', carat: 0, rate: 0 }
    ]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [supps, comps, brs] = await Promise.all([
                apiClient.get('/suppliers'),
                apiClient.get('/companies'),
                apiClient.get('/branches')
            ]);
            setSuppliers(supps.data);
            setCompanies(comps.data);
            setBranches(brs.data);
            setHeader(prev => ({ ...prev, purchase_no: 'PUR-' + Date.now().toString().slice(-6) }));
        } catch (err) {
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    const addItem = () => setItems([...items, { item_name: '', carat: 0, rate: 0 }]);
    const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const totalAmount = items.reduce((sum, item) => sum + (Number(item.carat || 0) * Number(item.rate || 0)), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/purchases', { ...header, items });
            if (onComplete) onComplete();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save purchase.');
        }
    };

    if (loading) return <div>Loading...</div>;

    const filteredSuppliers = suppliers.filter(s => s.company_id == header.company_id);
    const filteredBranches = branches.filter(b => b.company_id == header.company_id);

    return (
        <div className="glass" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '24px' }}>New Diamond Purchase</h3>
            {error && <div style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="card-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div className="form-group">
                        <label>Company</label>
                        <select className="form-control" value={header.company_id} onChange={e => setHeader({...header, company_id: e.target.value, supplier_id: '', branch_id: ''})} required>
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
                        <label>Supplier</label>
                        <select className="form-control" value={header.supplier_id} onChange={e => setHeader({...header, supplier_id: e.target.value})} required disabled={!header.company_id}>
                            <option value="">Select Supplier</option>
                            {filteredSuppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Purchase No</label>
                        <input className="form-control" value={header.purchase_no} onChange={e => setHeader({...header, purchase_no: e.target.value})} required />
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input type="date" className="form-control" value={header.purchase_date} onChange={e => setHeader({...header, purchase_date: e.target.value})} required />
                    </div>
                </div>

                <div style={{ marginTop: '32px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                                <th style={{ padding: '8px' }}>Diamond Description / Name</th>
                                <th style={{ padding: '8px', width: '120px' }}>Carat</th>
                                <th style={{ padding: '8px', width: '150px' }}>Rate</th>
                                <th style={{ padding: '8px', width: '150px' }}>Subtotal</th>
                                <th style={{ padding: '8px', width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '8px' }}>
                                        <input className="form-control" value={item.item_name} onChange={e => handleItemChange(index, 'item_name', e.target.value)} required placeholder="e.g. 1.0ct Round Brilliant" />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input type="number" step="0.001" className="form-control" value={item.carat} onChange={e => handleItemChange(index, 'carat', e.target.value)} required />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input type="number" step="0.01" className="form-control" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} required />
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>
                                        {(item.carat * item.rate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <button type="button" onClick={() => removeItem(index)} style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '1.2rem' }}>&times;</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="3" style={{ padding: '16px', fontWeight: 800, textAlign: 'right' }}>Total Purchase Amount:</td>
                                <td style={{ padding: '16px', fontWeight: 800, textAlign: 'right', color: 'var(--primary)', fontSize: '1.1rem' }}>
                                    {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                    <button type="button" onClick={addItem} className="btn" style={{ width: 'auto', marginTop: '16px', background: '#e2e8f0', color: '#475569' }}>+ Add Diamond</button>
                </div>

                <div className="form-group" style={{ marginTop: '24px' }}>
                    <label>Notes</label>
                    <textarea className="form-control" value={header.notes} onChange={e => setHeader({...header, notes: e.target.value})} />
                </div>

                <button type="submit" className="btn" style={{ marginTop: '32px' }}>Post Purchase & Generate Ledger</button>
            </form>
        </div>
    );
};

export default PurchaseForm;
