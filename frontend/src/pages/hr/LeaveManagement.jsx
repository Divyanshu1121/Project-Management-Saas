import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Calendar, Check, X, Clock, AlertCircle,
    ArrowRight, ChevronLeft, ChevronRight, Filter,
    Briefcase, Users, UserCheck
} from 'lucide-react';

import LeaveCalendar from '../../components/common/LeaveCalendar';

const STATUS_COLORS = {
    PENDING: { bg: '#fffbeb', color: '#92400e', border: '#fef3c7' },
    APPROVED: { bg: '#f0fdf4', color: '#166534', border: '#dcfce7' },
    REJECTED: { bg: '#fef2f2', color: '#991b1b', border: '#fee2e2' },
};



const LeaveManagement = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('requests'); // 'requests' or 'calendar'
    const [comment, setComment] = useState('');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchCompanyLeaves();
    }, []);

    const fetchCompanyLeaves = async () => {
        try {
            const res = await api.get('/leaves');
            setLeaves(res.data || []);
        } catch (err) {
            console.error('Error fetching company leaves:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        setProcessingId(id);
        try {
            await api.put(`/leaves/${id}`, { status, comment });
            setComment('');
            fetchCompanyLeaves();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        } finally {
            setProcessingId(null);
        }
    };

    const pendingRequests = leaves.filter(l => l.status === 'PENDING');
    const pastRequests = leaves.filter(l => l.status !== 'PENDING');

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading leave management...</div>;

    return (
        <div style={{ padding: 'min(5vw, 2rem)' }}>
            <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>

                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Leave Management</h2>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Review employee time-off requests and track company availability.</p>
                </div>
                <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '0.4rem', borderRadius: '0.75rem' }}>
                    <button
                        onClick={() => setView('requests')}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            backgroundColor: view === 'requests' ? 'white' : 'transparent',
                            color: view === 'requests' ? '#2563eb' : '#64748b',
                            boxShadow: view === 'requests' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Requests
                    </button>
                    <button
                        onClick={() => setView('calendar')}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            backgroundColor: view === 'calendar' ? 'white' : 'transparent',
                            color: view === 'calendar' ? '#2563eb' : '#64748b',
                            boxShadow: view === 'calendar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Calendar
                    </button>
                </div>
            </div>

            {view === 'requests' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Pending Section */}
                    <div style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fdfcf0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: '#fef9c3' }}>
                                <Clock size={18} color="#854d0e" />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#854d0e' }}>Pending Requests ({pendingRequests.length})</h3>
                        </div>
                        {pendingRequests.length === 0 ? (
                            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                                <UserCheck size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>All caught up! No pending leave requests.</p>
                            </div>
                        ) : (
                            <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 350px), 1fr))', padding: '1rem' }}>

                                {pendingRequests.map(l => (
                                    <div key={l._id} style={{ border: '1px solid #e2e8f0', borderRadius: '0.875rem', padding: '1.25rem', backgroundColor: '#fff' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Users size={20} color="#64748b" />
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{l.userId?.name}</p>
                                                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>{l.userId?.role?.replace(/_/g, ' ')} • {l.userId?.empId}</p>
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '0.4rem', backgroundColor: '#f1f5f9', color: '#475569' }}>
                                                {l.type}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#334155' }}>
                                            <Calendar size={16} color="#94a3b8" />
                                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{new Date(l.startDate).toLocaleDateString()}</span>
                                            <ArrowRight size={14} color="#94a3b8" />
                                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{new Date(l.endDate).toLocaleDateString()}</span>
                                        </div>

                                        <p style={{ margin: '0 0 1.25rem', color: '#475569', fontSize: '0.9rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                                            "{l.reason}"
                                        </p>

                                        {processingId === l._id ? (
                                            <div style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>Processing...</div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                <button
                                                    onClick={() => handleUpdateStatus(l._id, 'APPROVED')}
                                                    style={{ flex: 1, padding: '0.65rem', borderRadius: '0.5rem', border: 'none', backgroundColor: '#10b981', color: 'white', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                                                >
                                                    <Check size={16} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(l._id, 'REJECTED')}
                                                    style={{ flex: 1, padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #fee2e2', backgroundColor: 'white', color: '#ef4444', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                                                >
                                                    <X size={16} /> Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* History Section */}
                    <div style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: '#f1f5f9' }}>
                                <Filter size={18} color="#64748b" />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#334155' }}>Recent History ({pastRequests.length})</h3>
                        </div>
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                            <table style={{ minWidth: '800px', width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>

                                <thead>
                                    <tr style={{ backgroundColor: '#fdfdfd', borderBottom: '1px solid #f1f5f9' }}>
                                        <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Employee</th>
                                        <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Type</th>
                                        <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Duration</th>
                                        <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Decision Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pastRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No completed requests yet.</td>
                                        </tr>
                                    ) : (
                                        pastRequests.slice(0, 10).map(l => {
                                            const colors = STATUS_COLORS[l.status];
                                            return (
                                                <tr key={l._id} style={{ borderBottom: '1px solid #fafafa' }}>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: 600, color: '#334155' }}>{l.userId?.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{l.userId?.empId}</div>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{l.type}</span>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontSize: '0.875rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                            {new Date(l.startDate).toLocaleDateString()}
                                                            <ArrowRight size={12} color="#94a3b8" />
                                                            {new Date(l.endDate).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{
                                                            backgroundColor: colors.bg,
                                                            color: colors.color,
                                                            padding: '0.25rem 0.6rem',
                                                            borderRadius: '9999px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 700,
                                                            border: `1px solid ${colors.border}`
                                                        }}>
                                                            {l.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                                                        {new Date(l.updatedAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <LeaveCalendar leaves={leaves} />
            )}
        </div>
    );
};

export default LeaveManagement;
