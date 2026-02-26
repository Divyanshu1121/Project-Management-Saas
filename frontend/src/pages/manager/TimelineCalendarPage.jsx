import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import TimelineCalendar from '../../components/common/TimelineCalendar';
import { Calendar as CalendarIcon, Info, Briefcase } from 'lucide-react';

const TimelineCalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsRes, leavesRes] = await Promise.all([
                    api.get('/projects'),
                    api.get('/leaves')
                ]);

                const projectEvents = [];
                (projectsRes.data || []).forEach(p => {
                    if (p.startDate) {
                        projectEvents.push({
                            id: `${p._id}-start`,
                            type: 'PROJECT',
                            title: `${p.name} (Start)`,
                            start: p.startDate,
                            end: p.startDate,
                            description: p.description
                        });
                    }
                    if (p.deadline) {
                        projectEvents.push({
                            id: `${p._id}-deadline`,
                            type: 'PROJECT',
                            title: `${p.name} (Deadline)`,
                            start: p.deadline,
                            end: p.deadline,
                            description: p.description
                        });
                    }
                });

                const leaveEvents = (leavesRes.data || []).filter(l => l.status === 'APPROVED').map(l => ({
                    id: l._id,
                    type: 'LEAVE',
                    title: l.userId?.name || 'Employee',
                    start: l.startDate,
                    end: l.endDate,
                    description: l.reason
                }));

                setEvents([...projectEvents, ...leaveEvents]);
            } catch (err) {
                console.error('Error fetching timeline data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading timeline...</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '0.75rem', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CalendarIcon size={24} color="#2563eb" />
                        </div>
                        Calendar
                    </h2>
                    <p style={{ color: '#64748b', margin: '0.5rem 0 0', maxWidth: '600px' }}>
                        A unified view of project schedules and team availability. Use this to sync milestones and manage resources effectively.
                    </p>
                </div>
                <div style={{
                    padding: '1rem 1.25rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '1rem',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1e40af', fontSize: '0.85rem', fontWeight: 600 }}>
                        <Info size={16} />
                        Summary
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Projects</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                                {events.filter(e => e.type === 'PROJECT').length}
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Leaves</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                                {events.filter(e => e.type === 'LEAVE').length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <TimelineCalendar events={events} />
        </div>
    );
};

export default TimelineCalendarPage;
