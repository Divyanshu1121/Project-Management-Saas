import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Plus, X, Search, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const STATUS_META = {
    PENDING: { label: 'Pending', bg: '#fef9c3', color: '#854d0e', icon: Clock },
    APPROVED: { label: 'Approved', bg: '#dcfce7', color: '#166534', icon: CheckCircle },
    REJECTED: { label: 'Rejected', bg: '#fee2e2', color: '#991b1b', icon: XCircle },
};

const LeaveRequest = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newLeave, setNewLeave] = useState({
        type: 'ANNUAL',
        startDate: '',
        endDate: '',
        reason: ''
    });

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await api.get('/leaves/my');
            setLeaves(res.data || []);
        } catch (err) {
            console.error('Error fetching leaves:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestLeave = async (e) => {
        e.preventDefault();
        try {
            await api.post('/leaves', newLeave);
            setShowModal(false);
            setNewLeave({ type: 'ANNUAL', startDate: '', endDate: '', reason: '' });
            fetchLeaves();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to request leave');
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        marginTop: '0.4rem',
        marginBottom: '1rem',
        borderRadius: '0.5rem',
        border: '1px solid #cbd5e1',
        fontSize: '0.9rem',
        boxSizing: 'border-box'
    };

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading leave requests...</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>My Leave Requests</h2>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Request time off and track your approval status.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        backgroundColor: '#2563eb',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Plus size={18} />
                    Request Leave
                </button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Type</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Start Date</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>End Date</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Reason</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaves.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No leave requests found.</td>
                            </tr>
                        ) : (
                            leaves.map(l => {
                                const meta = STATUS_META[l.status];
                                const StatusIcon = meta.icon;
                                return (
                                    <tr key={l._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem', fontWeight: 600 }}>{l.type}</td>
                                        <td style={{ padding: '1rem', color: '#334155' }}>{new Date(l.startDate).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem', color: '#334155' }}>{new Date(l.endDate).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                backgroundColor: meta.bg,
                                                color: meta.color,
                                                padding: '0.3rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.4rem'
                                            }}>
                                                <StatusIcon size={14} />
                                                {meta.label}
                                            </span>
                                            {l.comment && (
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                                                    Note: {l.comment}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Request New Leave</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleRequestLeave}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Leave Type</label>
                            <select
                                required
                                style={inputStyle}
                                value={newLeave.type}
                                onChange={e => setNewLeave({ ...newLeave, type: e.target.value })}
                            >
                                <option value="ANNUAL">Annual Leave</option>
                                <option value="SICK">Sick Leave</option>
                                <option value="CASUAL">Casual Leave</option>
                                <option value="UNPAID">Unpaid Leave</option>
                            </select>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        style={inputStyle}
                                        value={newLeave.startDate}
                                        onChange={e => setNewLeave({ ...newLeave, startDate: e.target.value })}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>End Date</label>
                                    <input
                                        type="date"
                                        required
                                        style={inputStyle}
                                        value={newLeave.endDate}
                                        onChange={e => setNewLeave({ ...newLeave, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Reason</label>
                            <textarea
                                required
                                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                                placeholder="Explain why you need this leave..."
                                value={newLeave.reason}
                                onChange={e => setNewLeave({ ...newLeave, reason: e.target.value })}
                            />

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', backgroundColor: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveRequest;
