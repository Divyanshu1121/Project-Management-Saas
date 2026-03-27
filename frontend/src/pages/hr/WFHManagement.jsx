import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Home, Coffee, Book, Building2, Plane, MapPin, CheckCircle, XCircle, Clock, X, Search, Calendar as CalendarIcon, Filter, Crown } from 'lucide-react';
import WFHLeaveCalendar from '../../components/common/WFHLeaveCalendar';
import { useAuth } from '../../context/AuthContext';

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
    { value: 'coworking', label: 'Co-working', icon: Building2 },
    { value: 'travelling', label: 'Travelling', icon: Plane },
    { value: 'other', label: 'Other', icon: MapPin },
];

const WFHManagement = () => {
    const { user } = useAuth();
    const [view, setView] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [calendarData, setCalendarData] = useState({ wfhEvents: [], leaveEvents: [] });
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal for Review
    const [reviewModal, setReviewModal] = useState({ show: false, request: null, note: '', action: '' });

    useEffect(() => {
        fetchData();
    }, [view, filterStatus]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (view === 'requests') {
                const res = await api.get('/wfh/company-requests', { params: { status: filterStatus } });
                setRequests(res.data || []);
            } else {
                const res = await api.get('/wfh/calendar?scope=company');
                setCalendarData(res.data || { wfhEvents: [], leaveEvents: [] });
            }
        } catch (err) {
            console.error('Error fetching HR WFH data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/wfh/${reviewModal.request._id}/review`, {
                status: reviewModal.action,
                reviewNote: reviewModal.note
            });
            setReviewModal({ show: false, request: null, note: '', action: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to review request');
        }
    };

    const filteredRequests = requests.filter(req => 
        req.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.employee?.empId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const leadershipNotices = filteredRequests.filter(r => r.isInformOnly);
    const regularRequests = filteredRequests.filter(r => !r.isInformOnly);
    const pendingApprovals = regularRequests.filter(r => r.status === 'pending');
    const otherRegular = regularRequests.filter(r => r.status !== 'pending');

    const renderRequestRow = (req) => {
        const meta = STATUS_META[req.status] || STATUS_META.pending;
        const StatusIcon = meta.icon;
        const locOption = LOCATION_OPTIONS.find(o => o.value === req.workLocation) || LOCATION_OPTIONS[0];
        const LocIcon = locOption.icon;
        
        return (
            <tr key={req._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: req.isInformOnly ? '#fffbeb' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: req.isInformOnly ? '#d97706' : '#475569', fontWeight: 700, fontSize: '0.9rem', border: req.isInformOnly ? '1px solid #fde68a' : 'none' }}>
                            {req.isInformOnly ? <Crown size={18} /> : req.employee?.name?.charAt(0)}
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {req.employee?.name}
                                {req.isInformOnly && <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>OWNER</span>}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.employee?.empId} · {req.employee?.role}</div>
                        </div>
                    </div>
                </td>
                <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155', fontWeight: 500, marginBottom: '0.4rem' }}>
                        <CalendarIcon size={14} color="#94a3b8" />
                        {new Date(req.startDate).toLocaleDateString()}
                        {req.startDate !== req.endDate && ` → ${new Date(req.endDate).toLocaleDateString()}`}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem' }}>
                        <LocIcon size={14} /> 
                        {locOption.label} {req.workLocation === 'other' ? `(${req.customLocation})` : ''}
                    </div>
                </td>
                <td style={{ padding: '1rem', maxWidth: '300px' }}>
                    <div style={{ color: '#1e293b', fontSize: '0.85rem', marginBottom: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <strong>Plan:</strong> <span style={{ color: '#475569' }}>{req.workPlan}</span>
                    </div>
                    <div style={{ color: '#1e293b', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <strong>Reason:</strong> <span style={{ color: '#475569' }}>{req.reason}</span>
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
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.4rem' }}>
                            {req.isInformOnly ? 'Owner Notice' : `By ${req.reviewedBy?.name}`}
                        </div>
                    )}
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    {req.status === 'pending' && !req.isInformOnly && (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            {/* HR requests must be approved by leadership */}
                            {(req.employee?.role !== 'HR' || ['COMPANY_OWNER', 'owner', 'CEO', 'CTO', 'CFO', 'COO'].includes(user?.role)) ? (
                                <>
                                    <button 
                                        onClick={() => setReviewModal({ show: true, request: req, note: '', action: 'approved' })}
                                        style={{
                                            padding: '0.4rem 0.75rem', borderRadius: '0.4rem', border: 'none',
                                            backgroundColor: '#22c55e', color: 'white', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '4px'
                                        }}
                                    >
                                        <CheckCircle size={14} /> Approve
                                    </button>
                                    <button 
                                        onClick={() => setReviewModal({ show: true, request: req, note: '', action: 'rejected' })}
                                        style={{
                                            padding: '0.4rem 0.75rem', borderRadius: '0.4rem', border: '1px solid #fecaca',
                                            backgroundColor: '#fef2f2', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '4px'
                                        }}
                                    >
                                        <XCircle size={14} /> Reject
                                    </button>
                                </>
                            ) : (
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Leadership Approval Required</span>
                            )}
                        </div>
                    )}
                    {req.isInformOnly && (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>READ ONLY</span>
                    )}
                </td>
            </tr>
        );
    };

    if (loading && requests.length === 0 && calendarData.wfhEvents.length === 0) {
        return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading...</div>;
    }

    return (
        <div style={{ padding: 'min(5vw, 2rem)' }}>
            <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>WFH Management</h2>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Review employee WFH requests and company schedule.</p>
                </div>
                
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
                        Requests List
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
                        Company Calendar
                    </button>
                </div>
            </div>

            {view === 'calendar' ? (
                <WFHLeaveCalendar 
                    wfhEvents={calendarData.wfhEvents} 
                    leaveEvents={calendarData.leaveEvents} 
                    currentUserId={user?._id}
                    isAdmin={true}
                />
            ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    
                    {/* Filters & Search */}
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: '1 1 300px' }}>
                            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input 
                                type="text"
                                placeholder="Search employee..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '0.5rem',
                                    border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Filter size={18} color="#64748b" />
                            <select 
                                value={filterStatus} 
                                onChange={(e) => setFilterStatus(e.target.value)}
                                style={{
                                    padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1',
                                    fontSize: '0.9rem', outline: 'none', backgroundColor: 'white', color: '#334155'
                                }}
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ minWidth: '940px', width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Employee</th>
                                    <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Date & Location</th>
                                    <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Details</th>
                                    <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingApprovals.length > 0 && (
                                    <tr style={{ background: '#eff6ff' }}><td colSpan="5" style={{ padding: '0.75rem 1.5rem', fontSize: '0.8rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>Pending Approvals ({pendingApprovals.length})</td></tr>
                                )}
                                {pendingApprovals.map(req => renderRequestRow(req))}

                                {leadershipNotices.length > 0 && (
                                    <tr style={{ background: '#fffbeb' }}><td colSpan="5" style={{ padding: '0.75rem 1.5rem', fontSize: '0.8rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>Leadership Notices ({leadershipNotices.length})</td></tr>
                                )}
                                {leadershipNotices.map(req => renderRequestRow(req))}

                                {(otherRegular.length > 0 || (pendingApprovals.length === 0 && leadershipNotices.length === 0)) && (
                                    <>
                                        {(pendingApprovals.length > 0 || leadershipNotices.length > 0) && otherRegular.length > 0 && (
                                            <tr style={{ background: '#f8fafc' }}><td colSpan="5" style={{ padding: '0.75rem 1.5rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Past Requests</td></tr>
                                        )}
                                        {otherRegular.length === 0 && pendingApprovals.length === 0 && leadershipNotices.length === 0 ? (
                                            <tr><td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>No WFH requests match your criteria.</td></tr>
                                        ) : (
                                            otherRegular.map(req => renderRequestRow(req))
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {reviewModal.show && reviewModal.request && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: reviewModal.action === 'approved' ? '#166534' : '#991b1b' }}>
                                {reviewModal.action === 'approved' ? 'Approve WFH Request' : 'Reject WFH Request'}
                            </h3>
                            <button onClick={() => setReviewModal({ show: false, request: null, note: '', action: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                        </div>
                        
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                            <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>{reviewModal.request.employee?.name}</p>
                            <p style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', color: '#475569' }}>
                                {new Date(reviewModal.request.startDate).toLocaleDateString()} to {new Date(reviewModal.request.endDate).toLocaleDateString()}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>
                                Location: <span style={{ textTransform: 'capitalize' }}>{reviewModal.request.workLocation}</span>
                            </p>
                        </div>

                        <form onSubmit={handleReviewSubmit}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
                                Review Note (Optional)
                            </label>
                            <textarea
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1',
                                    fontSize: '0.9rem', minHeight: '100px', resize: 'vertical', boxSizing: 'border-box'
                                }}
                                placeholder={`Add a note about this ${reviewModal.action}...`}
                                value={reviewModal.note}
                                onChange={e => setReviewModal({ ...reviewModal, note: e.target.value })}
                            />

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setReviewModal({ show: false, request: null, note: '', action: '' })}
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ 
                                        padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', 
                                        backgroundColor: reviewModal.action === 'approved' ? '#22c55e' : '#ef4444', 
                                        color: 'white', cursor: 'pointer', fontWeight: 600 
                                    }}
                                >
                                    Confirm {reviewModal.action === 'approved' ? 'Approval' : 'Rejection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WFHManagement;
