import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, X, Calendar as CalendarIcon, MapPin, Coffee, Home, Book, Building2, Plane, CheckCircle, XCircle, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import WFHLeaveCalendar from '../../components/common/WFHLeaveCalendar';

const STATUS_META = {
    pending: { label: 'Pending', bg: '#fef9c3', color: '#854d0e', icon: Clock },
    approved: { label: 'Approved', bg: '#dcfce7', color: '#166534', icon: CheckCircle },
    rejected: { label: 'Rejected', bg: '#fee2e2', color: '#991b1b', icon: XCircle },
    cancelled: { label: 'Cancelled', bg: '#f1f5f9', color: '#64748b', icon: X },
};

const LOCATION_OPTIONS = [
    { value: 'home', label: 'Home', icon: Home },
    { value: 'cafe', label: 'Cafe', icon: Coffee },
    { value: 'library', label: 'Library', icon: Book },
    { value: 'coworking', label: 'Co-working Space', icon: Building2 },
    { value: 'travelling', label: 'Travelling', icon: Plane },
    { value: 'other', label: 'Other', icon: MapPin },
];

const WFHRequestPage = () => {
    const { user } = useAuth();
    const [view, setView] = useState('requests');
    const [scope, setScope] = useState('team'); // mine | team | company
    const [requests, setRequests] = useState([]);
    const [calendarData, setCalendarData] = useState({ wfhEvents: [], leaveEvents: [] });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    
    const isOwner = ['owner', 'COMPANY_OWNER', 'CEO', 'CTO', 'CFO', 'COO'].includes(user?.role);
    
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        workLocation: 'home',
        customLocation: '',
        reason: '',
        workPlan: ''
    });

    useEffect(() => {
        fetchData();
    }, [view, scope]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (view === 'requests') {
                const res = await api.get('/wfh/my-requests');
                setRequests(res.data || []);
            } else {
                const res = await api.get(`/wfh/calendar?scope=${scope}`);
                setCalendarData(res.data || { wfhEvents: [], leaveEvents: [] });
            }
        } catch (err) {
            console.error('Error fetching WFH data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleImproveWriting = async (field) => {
        if (!formData[field]) return;
        setAiLoading(true);
        try {
            const res = await api.post('/ai/improve-writing', {
                text: formData[field],
                context: field === 'reason' ? 'WFH reason' : 'WFH work plan'
            });
            if (res.data.improvedText) {
                setFormData(prev => ({ ...prev, [field]: res.data.improvedText }));
            }
        } catch (err) {
            console.error('AI Error:', err);
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/wfh/request', formData);
            const msg = isOwner 
                ? `HR has been notified of your WFH from ${new Date(formData.startDate).toLocaleDateString()} to ${new Date(formData.endDate).toLocaleDateString()}.`
                : `Your WFH request for ${new Date(formData.startDate).toLocaleDateString()} to ${new Date(formData.endDate).toLocaleDateString()} has been submitted successfully!`;
            setSuccessMsg(msg);
            setShowModal(false);
            setShowSuccess(true);
            setFormData({
                startDate: '', endDate: '', workLocation: 'home',
                customLocation: '', reason: '', workPlan: ''
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this request?')) return;
        try {
            await api.patch(`/wfh/${id}/cancel`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel request');
        }
    };

    const inputStyle = {
        width: '100%', padding: '0.75rem', marginTop: '0.4rem', marginBottom: '1rem',
        borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box'
    };

    if (loading && requests.length === 0 && calendarData.wfhEvents.length === 0) {
        return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading WFH data...</div>;
    }

    return (
        <div style={{ padding: 'min(5vw, 2rem)' }}>
            <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Work From Home</h2>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Request WFH days and track your schedule.</p>
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
                            Calendar
                        </button>
                    </div>

                    {view === 'requests' && (
                        <button
                            onClick={() => setShowModal(true)}
                            style={{
                                backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.25rem',
                                borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600,
                                display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap'
                            }}
                        >
                            <Plus size={18} /> {isOwner ? 'Inform HR of WFH' : 'Request WFH'}
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
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ minWidth: '800px', width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Date Range</th>
                                    <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Location</th>
                                    <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Plan / Reason</th>
                                    <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No WFH requests found.</td>
                                    </tr>
                                ) : (
                                    requests.map(req => {
                                        const meta = STATUS_META[req.status] || STATUS_META.pending;
                                        const StatusIcon = meta.icon;
                                        const locOption = LOCATION_OPTIONS.find(o => o.value === req.workLocation) || LOCATION_OPTIONS[0];
                                        const LocIcon = locOption.icon;
                                        
                                        return (
                                            <tr key={req._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '1rem', color: '#334155', fontWeight: 500 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <CalendarIcon size={14} color="#94a3b8" />
                                                        {new Date(req.startDate).toLocaleDateString()}
                                                        {req.startDate !== req.endDate && `  →  ${new Date(req.endDate).toLocaleDateString()}`}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                                                        <LocIcon size={14} /> 
                                                        {locOption.label} {req.workLocation === 'other' ? `(${req.customLocation})` : ''}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', maxWidth: '300px' }}>
                                                    <div style={{ color: '#1e293b', fontSize: '0.9rem', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        <strong>Plan:</strong> {req.workPlan}
                                                    </div>
                                                    <div style={{ color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        <strong>Reason:</strong> {req.reason}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        backgroundColor: meta.bg, color: meta.color,
                                                        padding: '0.3rem 0.75rem', borderRadius: '9999px',
                                                        fontSize: '0.75rem', fontWeight: 700,
                                                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                                                    }}>
                                                        <StatusIcon size={14} /> {meta.label}
                                                    </span>
                                                    {req.reviewNote && (
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem', fontStyle: 'italic' }}>
                                                            {req.reviewedBy?.name}: "{req.reviewNote}"
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    {req.status === 'pending' && (
                                                        <button 
                                                            onClick={() => handleCancel(req._id)}
                                                            style={{
                                                                padding: '0.4rem 0.75rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0',
                                                                backgroundColor: 'white', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                                {isOwner ? 'Inform HR of WFH Absence' : 'Request Work From Home'}
                            </h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Start Date</label>
                                    <input
                                        type="date" required style={inputStyle}
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>End Date</label>
                                    <input
                                        type="date" required style={inputStyle}
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {isOwner ? (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', margin: 0 }}>Reason (Optional)</label>
                                        <button 
                                            type="button"
                                            onClick={() => handleImproveWriting('reason')}
                                            disabled={aiLoading || !formData.reason}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', 
                                                fontWeight: 600, color: '#7e22ce', border: 'none', background: 'none', 
                                                cursor: (aiLoading || !formData.reason) ? 'not-allowed' : 'pointer',
                                                opacity: (aiLoading || !formData.reason) ? 0.5 : 1
                                            }}
                                        >
                                            <Sparkles size={12} /> {aiLoading ? 'Improving...' : 'Improve with AI'}
                                        </button>
                                    </div>
                                    <textarea
                                        style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                        placeholder="Add a note or reason (optional)"
                                        value={formData.reason}
                                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                    />
                                </>
                            ) : (
                                <>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Work Location</label>
                                    <select
                                        required style={inputStyle} value={formData.workLocation}
                                        onChange={e => setFormData({ ...formData, workLocation: e.target.value })}
                                    >
                                        {LOCATION_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>

                                    {formData.workLocation === 'other' && (
                                        <>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Custom Location</label>
                                            <input
                                                type="text" required style={inputStyle} placeholder="E.g., Client Office, Parent's house..."
                                                value={formData.customLocation}
                                                onChange={e => setFormData({ ...formData, customLocation: e.target.value })}
                                            />
                                        </>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', margin: 0 }}>Reason</label>
                                        <button 
                                            type="button"
                                            onClick={() => handleImproveWriting('reason')}
                                            disabled={aiLoading || !formData.reason}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', 
                                                fontWeight: 600, color: '#7e22ce', border: 'none', background: 'none', 
                                                cursor: (aiLoading || !formData.reason) ? 'not-allowed' : 'pointer',
                                                opacity: (aiLoading || !formData.reason) ? 0.5 : 1
                                            }}
                                        >
                                            <Sparkles size={12} /> {aiLoading ? 'Improving...' : 'Improve with AI'}
                                        </button>
                                    </div>
                                    <textarea
                                        required style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                        placeholder="Why do you need to work from home?"
                                        value={formData.reason}
                                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                    />

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', margin: 0 }}>Work Plan</label>
                                        <button 
                                            type="button"
                                            onClick={() => handleImproveWriting('workPlan')}
                                            disabled={aiLoading || !formData.workPlan}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', 
                                                fontWeight: 600, color: '#7e22ce', border: 'none', background: 'none', 
                                                cursor: (aiLoading || !formData.workPlan) ? 'not-allowed' : 'pointer',
                                                opacity: (aiLoading || !formData.workPlan) ? 0.5 : 1
                                            }}
                                        >
                                            <Sparkles size={12} /> {aiLoading ? 'Improving...' : 'Improve with AI'}
                                        </button>
                                    </div>
                                    <textarea
                                        required style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                                        placeholder="What tasks will you be working on?"
                                        value={formData.workPlan}
                                        onChange={e => setFormData({ ...formData, workPlan: e.target.value })}
                                    />
                                </>
                            )}

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
                                    disabled={submitting}
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', backgroundColor: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 600, opacity: submitting ? 0.7 : 1 }}
                                >
                                    {submitting ? 'Sending...' : (isOwner ? 'Send Notice to HR' : 'Submit Request')}
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

export default WFHRequestPage;
