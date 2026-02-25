import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LeaveCalendar = ({ leaves }) => {
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

    const approvedLeaves = leaves.filter(l => l.status === 'APPROVED');

    const getLeavesForDate = (dateNum) => {
        if (!dateNum) return [];
        const d = new Date(year, month, dateNum);
        d.setHours(0, 0, 0, 0);

        return approvedLeaves.filter(l => {
            const start = new Date(l.startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(l.endDate);
            end.setHours(23, 59, 59, 999);
            return d >= start && d <= end;
        });
    };

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {/* Calendar Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                    {monthNames[month]} {year}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={prevMonth} style={{ padding: '0.4rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>
                        <ChevronLeft size={18} />
                    </button>
                    <button onClick={nextMonth} style={{ padding: '0.4rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Weekdays */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        {d}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: '450px' }}>
                {calendarDays.map((day, idx) => {
                    const dayLeaves = getLeavesForDate(day);
                    const isToday = day && new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

                    return (
                        <div key={idx} style={{
                            padding: '0.5rem',
                            borderRight: (idx + 1) % 7 === 0 ? 'none' : '1px solid #f1f5f9',
                            borderBottom: '1px solid #f1f5f9',
                            minHeight: '110px',
                            backgroundColor: day ? 'white' : '#f9fafb'
                        }}>
                            {day && (
                                <>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        color: isToday ? '#2563eb' : '#475569',
                                        marginBottom: '0.5rem',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        backgroundColor: isToday ? '#eff6ff' : 'transparent'
                                    }}>
                                        {day}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        {dayLeaves.map(l => (
                                            <div key={l._id} style={{
                                                fontSize: '0.7rem',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.3rem',
                                                backgroundColor: '#fffbeb',
                                                color: '#92400e',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                borderLeft: '2px solid #f59e0b',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                            }} title={`${l.userId?.name}: ${l.reason} (${new Date(l.startDate).toLocaleDateString()} - ${new Date(l.endDate).toLocaleDateString()})`}>
                                                {l.userId?.name}
                                            </div>
                                        ))}
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

export default LeaveCalendar;
