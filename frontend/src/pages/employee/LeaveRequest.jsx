import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Plus, X, Clock, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import WFHLeaveCalendar from '../../components/common/WFHLeaveCalendar';

const STATUS_META = {
    PENDING: { label: 'Pending', bg: '#fef9c3', color: '#854d0e', icon: Clock },
    APPROVED: { label: 'Approved', bg: '#dcfce7', color: '#166534', icon: CheckCircle },
    REJECTED: { label: 'Rejected', bg: '#fee2e2', color: '#991b1b', icon: XCircle },
};

const LeaveRequest = () => {
    const { user } = useAuth();
    const [view, setView] = useState('requests'); // requests | calendar
    const [scope, setScope] = useState('team'); // mine | team | company
    const [leaves, setLeaves] = useState([]);
    const [calendarData, setCalendarData] = useState({ wfhEvents: [], leaveEvents: [] });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [newLeave, setNewLeave] = useState({
        type: 'ANNUAL',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const isOwner = ['owner', 'COMPANY_OWNER', 'CEO', 'CTO', 'CFO', 'COO'].includes(user?.role);

    useEffect(() => {
        fetchData();
    }, [view, scope]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (view === 'requests') {
                const res = await api.get('/leaves/my');
                setLeaves(res.data || []);
            } else {
                const res = await api.get(`/wfh/calendar?scope=${scope}`);
                setCalendarData(res.data || { wfhEvents: [], leaveEvents: [] });
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestLeave = async (e) => {
        e.preventDefault();
        try {
            await api.post('/leaves', newLeave);
            const msg = isOwner 
                ? `HR has been notified of your absence from ${new Date(newLeave.startDate).toLocaleDateString()} to ${new Date(newLeave.endDate).toLocaleDateString()}.`
                : `Your leave request for ${new Date(newLeave.startDate).toLocaleDateString()} to ${new Date(newLeave.endDate).toLocaleDateString()} has been submitted successfully!`;
            setSuccessMsg(msg);
            setShowModal(false);
            setShowSuccess(true);
            setNewLeave({ type: 'ANNUAL', startDate: '', endDate: '', reason: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to request leave');
        }
    };

    const handleImproveWriting = async (field) => {
        if (!newLeave[field]) return;
        setAiLoading(true);
        try {
            const res = await api.post('/ai/improve-writing', {
                text: newLeave[field],
                context: 'leave request reason'
            });
            if (res.data.improvedText) {
                setNewLeave(prev => ({ ...prev, [field]: res.data.improvedText }));
            }
        } catch (err) {
            console.error('AI Error:', err);
        } finally {
            setAiLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '0.75rem', marginTop: '0.4rem', marginBottom: '1rem',
        borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box'
    };

    if (loading && leaves.length === 0 && calendarData.wfhEvents.length === 0) {
        return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading...</div>;
    }

    return (
        <div style={{ padding: '2rem' }}>
            <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Leave Management</h2>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Manage your time off and view team availability.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '0.4rem', borderRadius: '0.75rem' }}>
                        <button
                            onClick={() => setView('requests')}
                            style={{
                                padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600,
                                backgroundColor: view === 'requests' ? 'white' : 'transparent',
                                color: view === 'requests' ? '#2563eb' : '#64748b',
                                boxShadow: view === 'requests' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            My Requests
                        </button>
                        <button
                            onClick={() => setView('calendar')}
                            style={{
                                padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600,
                                backgroundColor: view === 'calendar' ? 'white' : 'transparent',
                                color: view === 'calendar' ? '#2563eb' : '#64748b',
                                boxShadow: view === 'calendar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Team Calendar
                        </button>
                    </div>

                    {view === 'requests' && (
                        <button
                            onClick={() => setShowModal(true)}
                            style={{
                                backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.5rem',
                                borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600,
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <Plus size={18} /> {isOwner ? 'Inform HR of Absence' : 'Request Leave'}
                        </button>
                    )}
                </div>
            </div>

            {view === 'calendar' ? (
                <>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', backgroundColor: '#f1f5f9', padding: '0.3rem', borderRadius: '0.5rem', width: 'fit-content' }}>
                        {['mine', 'team', 'company'].map(s => (
                            <button
                                key={s}
                                onClick={() => setScope(s)}
                                style={{
                                    padding: '0.4rem 1rem', borderRadius: '0.35rem', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                                    backgroundColor: scope === s ? 'white' : 'transparent',
                                    color: scope === s ? '#2563eb' : '#64748b',
                                    boxShadow: scope === s ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {s === 'mine' ? 'My Schedule' : s === 'team' ? 'My Team' : 'All Company'}
                            </button>
                        ))}
                    </div>
                    <WFHLeaveCalendar 
                        wfhEvents={calendarData.wfhEvents} 
                        leaveEvents={calendarData.leaveEvents} 
                        currentUserId={user?._id}
                        isAdmin={['HR', 'COMPANY_OWNER', 'owner', 'CEO', 'CTO', 'CFO', 'COO'].includes(user?.role)}
                    />
                </>
            ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Type</th>
                                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Dates</th>
                                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Reason</th>
                                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No leave requests found.</td>
                                </tr>
                            ) : (
                                leaves.map(l => {
                                    const meta = STATUS_META[l.status] || STATUS_META.PENDING;
                                    const StatusIcon = meta.icon;
                                    return (
                                        <tr key={l._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem', fontWeight: 600 }}>{l.type}</td>
                                            <td style={{ padding: '1rem', color: '#334155' }}>
                                                {new Date(l.startDate).toLocaleDateString()}
                                                {l.startDate !== l.endDate && ` → ${new Date(l.endDate).toLocaleDateString()}`}
                                            </td>
                                            <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    backgroundColor: meta.bg, color: meta.color,
                                                    padding: '0.3rem 0.75rem', borderRadius: '9999px',
                                                    fontSize: '0.75rem', fontWeight: 700,
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                                                }}>
                                                    <StatusIcon size={14} /> {meta.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{isOwner ? 'Inform HR of Absence' : 'Request New Leave'}</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleRequestLeave}>
                            {!isOwner && (
                                <>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Leave Type</label>
                                    <select required style={inputStyle} value={newLeave.type} onChange={e => setNewLeave({ ...newLeave, type: e.target.value })}>
                                        <option value="ANNUAL">Annual Leave</option>
                                        <option value="SICK">Sick Leave</option>
                                        <option value="CASUAL">Casual Leave</option>
                                        <option value="UNPAID">Unpaid Leave</option>
                                    </select>
                                </>
                            )}

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Start Date</label>
                                    <input type="date" required style={inputStyle} value={newLeave.startDate} onChange={e => setNewLeave({ ...newLeave, startDate: e.target.value })} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>End Date</label>
                                    <input type="date" required style={inputStyle} value={newLeave.endDate} onChange={e => setNewLeave({ ...newLeave, endDate: e.target.value })} />
                                </div>
                            </div>

                            {isOwner ? (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', margin: 0 }}>Reason (Optional)</label>
                                        <button 
                                            type="button"
                                            onClick={() => handleImproveWriting('reason')}
                                            disabled={aiLoading || !newLeave.reason}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', 
                                                fontWeight: 600, color: '#7e22ce', border: 'none', background: 'none', 
                                                cursor: (aiLoading || !newLeave.reason) ? 'not-allowed' : 'pointer',
                                                opacity: (aiLoading || !newLeave.reason) ? 0.5 : 1
                                            }}
                                        >
                                            <Sparkles size={12} /> {aiLoading ? 'Improving...' : 'Improve with AI'}
                                        </button>
                                    </div>
                                    <textarea 
                                        style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} 
                                        placeholder="Add a note or reason (optional)" 
                                        value={newLeave.reason} 
                                        onChange={e => setNewLeave({ ...newLeave, reason: e.target.value })} 
                                    />
                                </>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', margin: 0 }}>Reason</label>
                                        <button 
                                            type="button"
                                            onClick={() => handleImproveWriting('reason')}
                                            disabled={aiLoading || !newLeave.reason}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', 
                                                fontWeight: 600, color: '#7e22ce', border: 'none', background: 'none', 
                                                cursor: (aiLoading || !newLeave.reason) ? 'not-allowed' : 'pointer',
                                                opacity: (aiLoading || !newLeave.reason) ? 0.5 : 1
                                            }}
                                        >
                                            <Sparkles size={12} /> {aiLoading ? 'Improving...' : 'Improve with AI'}
                                        </button>
                                    </div>
                                    <textarea 
                                        required 
                                        style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} 
                                        placeholder="Explain why you need this leave..." 
                                        value={newLeave.reason} 
                                        onChange={e => setNewLeave({ ...newLeave, reason: e.target.value })} 
                                    />
                                </>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                                <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', backgroundColor: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                                    {isOwner ? 'Send Notice to HR' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showSuccess && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
                    <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '1.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <CheckCircle size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>Success!</h3>
                        <p style={{ color: '#64748b', lineHeight: 1.5, marginBottom: '2rem' }}>{successMsg}</p>
                        <button 
                            onClick={() => setShowSuccess(false)} 
                            style={{ 
                                width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: 'none', 
                                backgroundColor: '#2563eb', color: 'white', fontWeight: 600, cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = '#2563eb'}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveRequest;
