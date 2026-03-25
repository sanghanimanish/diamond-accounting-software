import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';
import JournalEntryForm from './JournalEntryForm';

const JournalManagement = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            const res = await apiClient.get('/journal-entries');
            setEntries(res.data);
        } catch (err) {
            setError('Failed to load journal entries.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;
        try {
            await apiClient.delete(`/journal-entries/${id}`);
            fetchEntries();
        } catch (err) {
            alert('Failed to delete entry');
        }
    };

    if (loading) return <div className="auth-container">Loading ledger...</div>;

    return (
        <div className="dashboard-container">
            <header className="header">
                <h2>Journal Entries</h2>
                <button onClick={() => setShowForm(!showForm)} className="btn" style={{ width: 'auto' }}>
                    {showForm ? 'View List' : '+ New Journal Entry'}
                </button>
            </header>

            {error && <div className="glass" style={{ color: '#ef4444', padding: '12px', marginBottom: '16px' }}>{error}</div>}

            {showForm ? (
                <JournalEntryForm onComplete={() => {
                    setShowForm(false);
                    fetchEntries();
                }} />
            ) : (
                <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="glass" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                                    <th style={{ padding: '16px' }}>Date & Ref</th>
                                    <th style={{ padding: '16px' }}>Description</th>
                                    <th style={{ padding: '16px' }}>Amount</th>
                                    <th style={{ padding: '16px' }}>Company/Branch</th>
                                    <th style={{ padding: '16px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map(entry => (
                                    <tr key={entry.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: 700 }}>{entry.entry_date}</div>
                                            <div style={{ fontSize: '0.8125rem', color: 'var(--primary)' }}>{entry.reference_no}</div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: 500 }}>{entry.narration || 'No description'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {entry.items.length} items
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: 700 }}>
                                            {Number(entry.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.875rem' }}>
                                            {entry.company?.name} <br/> 
                                            <small>{entry.branch?.name}</small>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <button 
                                                onClick={() => handleDelete(entry.id)} 
                                                style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {entries.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No journal entries found. Begin by creating a new entry.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JournalManagement;
