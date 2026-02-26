import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Briefcase, Calendar as CalendarIcon } from 'lucide-react';

const TimelineCalendar = ({ events }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const totalDays = daysInMonth(year, month);
    const startOffset = firstDayOfMonth(year, month);
    const calendarDays = [];

    // Fill offset days
    for (let i = 0; i < startOffset; i++) {
        calendarDays.push(null);
    }
    // Fill actual days
    for (let i = 1; i <= totalDays; i++) {
        calendarDays.push(i);
    }

    const getEventsForDate = (dateNum) => {
        if (!dateNum) return [];
        const d = new Date(year, month, dateNum);
        d.setHours(0, 0, 0, 0);

        return events.filter(event => {
            const start = new Date(event.start);
            start.setHours(0, 0, 0, 0);
            const end = new Date(event.end);
            end.setHours(23, 59, 59, 999);
            return d >= start && d <= end;
        });
    };

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            {/* Calendar Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                    {monthNames[month]} {year}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginRight: '1rem', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '2px', backgroundColor: '#3b82f6' }}></div>
                            <span style={{ color: '#64748b' }}>Project</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '2px', backgroundColor: '#f59e0b' }}></div>
                            <span style={{ color: '#64748b' }}>Leave</span>
                        </div>
                    </div>
                    <button onClick={prevMonth} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                        <ChevronLeft size={18} />
                    </button>
                    <button onClick={nextMonth} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Weekdays */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} style={{ padding: '0.85rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {d}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: '500px' }}>
                {calendarDays.map((day, idx) => {
                    const dayEvents = getEventsForDate(day);
                    const isToday = day && new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

                    return (
                        <div key={idx} style={{
                            padding: '0.5rem',
                            borderRight: (idx + 1) % 7 === 0 ? 'none' : '1px solid #f1f5f9',
                            borderBottom: '1px solid #f1f5f9',
                            minHeight: '120px',
                            backgroundColor: day ? 'white' : '#f9fafb',
                            position: 'relative'
                        }}>
                            {day && (
                                <>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: 700,
                                        color: isToday ? 'white' : '#475569',
                                        marginBottom: '0.6rem',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        width: '26px',
                                        height: '26px',
                                        borderRadius: '50%',
                                        backgroundColor: isToday ? '#3b82f6' : 'transparent',
                                        boxShadow: isToday ? '0 2px 4px rgba(59, 130, 246, 0.3)' : 'none'
                                    }}>
                                        {day}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                        {dayEvents.map(event => {
                                            const isProject = event.type === 'PROJECT';
                                            return (
                                                <div key={event.id} style={{
                                                    fontSize: '0.725rem',
                                                    padding: '0.3rem 0.6rem',
                                                    borderRadius: '0.4rem',
                                                    backgroundColor: isProject ? '#eff6ff' : '#fffbeb',
                                                    color: isProject ? '#1e40af' : '#92400e',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    borderLeft: `3px solid ${isProject ? '#3b82f6' : '#f59e0b'}`,
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.3rem',
                                                    fontWeight: 500
                                                }} title={`${event.title}${event.description ? ': ' + event.description : ''} (${new Date(event.start).toLocaleDateString()} - ${new Date(event.end).toLocaleDateString()})`}>
                                                    {isProject ? <Briefcase size={12} /> : <CalendarIcon size={12} />}
                                                    {event.title}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TimelineCalendar;
