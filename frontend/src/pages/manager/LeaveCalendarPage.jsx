import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LeaveCalendar from '../../components/common/LeaveCalendar';
import { Calendar as CalendarIcon, Info } from 'lucide-react';

const LeaveCalendarPage = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                const res = await api.get('/leaves');
                setLeaves(res.data || []);
            } catch (err) {
                console.error('Error fetching leaves:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaves();
    }, []);

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading calendar...</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <CalendarIcon size={24} color="#2563eb" />
                        Company Leave Calendar
                    </h2>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Monitor team availability and plan project timelines effectively.</p>
                </div>
                <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#eff6ff',
                    borderRadius: '0.75rem',
                    border: '1px solid #dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    color: '#1e40af',
                    fontSize: '0.85rem'
                }}>
                    <Info size={16} />
                    <span>Only approved leaves are shown here.</span>
                </div>
            </div>

            <LeaveCalendar leaves={leaves} />
        </div>
    );
};

export default LeaveCalendarPage;
