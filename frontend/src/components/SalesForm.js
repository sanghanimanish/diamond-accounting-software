import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';

const SalesForm = ({ onComplete }) => {
    const [customers, setCustomers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [branches, setBranches] = useState([]);
    const [availableStock, setAvailableStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [header, setHeader] = useState({
        company_id: '', branch_id: '', customer_id: '', sale_no: '', sale_date: new Date().toISOString().split('T')[0], notes: ''
    });
    const [items, setItems] = useState([
        { purchase_item_id: '', carat: 0, sale_rate: 0, cost_rate: 0 }
    ]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (header.company_id) {
            fetchStockAndCustomers();
        } else {
            setAvailableStock([]);
            setCustomers([]);
        }
    }, [header.company_id]);

    const fetchInitialData = async () => {
        try {
            const [comps, brs] = await Promise.all([
                apiClient.get('/companies'),
                apiClient.get('/branches')
            ]);
            setCompanies(comps.data);
            setBranches(brs.data);
            setHeader(prev => ({ ...prev, sale_no: 'SL-' + Date.now().toString().slice(-6) }));
        } catch (err) {
            setError('Failed to load companies.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStockAndCustomers = async () => {
        try {
            const [stockRes, custRes] = await Promise.all([
                apiClient.get(`/sales/available-stock?company_id=${header.company_id}`),
                apiClient.get(`/customers?company_id=${header.company_id}`)
            ]);
            setAvailableStock(stockRes.data);
            setCustomers(custRes.data);
        } catch (err) {
            setError('Failed to load stock or customers.');
        }
    };

    const addItem = () => setItems([...items, { purchase_item_id: '', carat: 0, sale_rate: 0, cost_rate: 0 }]);
    const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        if (field === 'purchase_item_id') {
            const stockItem = availableStock.find(s => s.id == value);
            if (stockItem) {
                newItems[index].cost_rate = stockItem.rate;
                newItems[index].carat = stockItem.remaining_carat; // Default to full remaining stock
            }
        }
        
        setItems(newItems);
    };

    const totalSaleAmount = items.reduce((sum, item) => sum + (Number(item.carat || 0) * Number(item.sale_rate || 0)), 0);
    const totalCostAmount = items.reduce((sum, item) => sum + (Number(item.carat || 0) * Number(item.cost_rate || 0)), 0);
    const totalProfit = totalSaleAmount - totalCostAmount;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/sales', { ...header, items });
            if (onComplete) onComplete();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to finish sale.');
        }
    };

    if (loading) return <div>Initial Loading...</div>;

    const filteredBranches = branches.filter(b => b.company_id == header.company_id);

    return (
        <div className="glass" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '24px' }}>Diamond Sales Invoice</h3>
            {error && <div style={{ color: '#ef4444', marginBottom: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="card-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div className="form-group">
                        <label>Company</label>
                        <select className="form-control" value={header.company_id} onChange={e => setHeader({...header, company_id: e.target.value, customer_id: '', branch_id: ''})} required>
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
                        <label>Customer</label>
                        <select className="form-control" value={header.customer_id} onChange={e => setHeader({...header, customer_id: e.target.value})} required disabled={!header.company_id}>
                            <option value="">Select Customer</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Invoice No</label>
                        <input className="form-control" value={header.sale_no} onChange={e => setHeader({...header, sale_no: e.target.value})} required />
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input type="date" className="form-control" value={header.sale_date} onChange={e => setHeader({...header, sale_date: e.target.value})} required />
                    </div>
                </div>

                <div style={{ marginTop: '32px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                                <th style={{ padding: '8px' }}>Select Stock Item (Diamond)</th>
                                <th style={{ padding: '8px', width: '100px' }}>Carat</th>
                                <th style={{ padding: '8px', width: '120px' }}>Price/ct</th>
                                <th style={{ padding: '8px', width: '120px' }}>Subtotal</th>
                                <th style={{ padding: '8px', width: '100px' }}>Profit</th>
                                <th style={{ padding: '8px', width: '40px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => {
                                const lineSubtotal = Number(item.carat) * Number(item.sale_rate);
                                const lineProfit = lineSubtotal - (Number(item.carat) * Number(item.cost_rate));
                                return (
                                    <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '8px' }}>
                                            <select 
                                                className="form-control" 
                                                value={item.purchase_item_id} 
                                                onChange={e => handleItemChange(index, 'purchase_item_id', e.target.value)}
                                                required
                                            >
                                                <option value="">Select from Stock</option>
                                                {availableStock.map(s => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.item_name} (Avail: {s.remaining_carat}ct) - Cost: {s.rate}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            <input type="number" step="0.001" className="form-control" value={item.carat} onChange={e => handleItemChange(index, 'carat', e.target.value)} required />
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            <input type="number" step="0.01" className="form-control" value={item.sale_rate} onChange={e => handleItemChange(index, 'sale_rate', e.target.value)} required />
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>
                                            {lineSubtotal.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'right', color: lineProfit >= 0 ? '#059669' : '#ef4444', fontWeight: 600 }}>
                                            {lineProfit.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            <button type="button" onClick={() => removeItem(index)} style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '1.2rem' }}>&times;</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr style={{ borderTop: '2px solid var(--border)' }}>
                                <td colSpan="3" style={{ padding: '16px', fontWeight: 800, textAlign: 'right' }}>Invoice Total:</td>
                                <td style={{ padding: '16px', fontWeight: 800, textAlign: 'right', color: 'var(--primary)' }}>
                                    {totalSaleAmount.toLocaleString()}
                                </td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td colSpan="4" style={{ padding: '0 16px 16px', fontWeight: 700, textAlign: 'right', fontSize: '0.875rem' }}>
                                    Estimated Net Profit: 
                                    <span style={{ color: totalProfit >= 0 ? '#059669' : '#ef4444', marginLeft: '10px' }}>
                                        {totalProfit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </span>
                                </td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                    <button type="button" onClick={addItem} className="btn" style={{ width: 'auto', marginTop: '16px', background: '#f1f5f9', color: '#475569' }}>+ Add Item</button>
                </div>

                <div className="form-group" style={{ marginTop: '24px' }}>
                    <label>Internal Notes</label>
                    <textarea className="form-control" value={header.notes} onChange={e => setHeader({...header, notes: e.target.value})} />
                </div>

                <button type="submit" className="btn" style={{ marginTop: '32px' }}>Complete Sale & Update Ledger</button>
            </form>
        </div>
    );
};

export default SalesForm;
