import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Home, Coffee, Book, Building2, Plane, MapPin, X, Crown } from 'lucide-react';

const LOCATION_ICONS = {
    home: { icon: Home, bg: '#dbeafe', color: '#1d4ed8', label: 'Home' },
    cafe: { icon: Coffee, bg: '#fef3c7', color: '#b45309', label: 'Cafe' },
    library: { icon: Book, bg: '#f3e8ff', color: '#7e22ce', label: 'Library' },
    coworking: { icon: Building2, bg: '#e0e7ff', color: '#4338ca', label: 'Co-working' },
    travelling: { icon: Plane, bg: '#ccfbf1', color: '#0f766e', label: 'Travelling' },
    other: { icon: MapPin, bg: '#e2e8f0', color: '#334155', label: 'Other/Custom' },
};

const WFHLeaveCalendar = ({ wfhEvents = [], leaveEvents = [], currentUserId = null, isAdmin = false }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateEvents, setSelectedDateEvents] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const totalDays = new Date(year, month + 1, 0).getDate();
    const startOffset = new Date(year, month, 1).getDay();

    const calendarGrid = useMemo(() => {
        const grid = Array.from({ length: startOffset }, () => null);
        for (let i = 1; i <= totalDays; i++) {
            grid.push(i);
        }
        return grid;
    }, [startOffset, totalDays]);

    const getEventsForDate = (dateNum) => {
        if (!dateNum) return { wfh: [], leave: [] };
        const d = new Date(year, month, dateNum);
        d.setHours(0, 0, 0, 0);

        const filterEvents = (events) => events.filter(e => {
            const start = new Date(e.startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(e.endDate);
            end.setHours(23, 59, 59, 999);
            return d >= start && d <= end;
        });

        return {
            wfh: filterEvents(wfhEvents),
            leave: filterEvents(leaveEvents),
        };
    };

    const handleDateClick = (day, events) => {
        if (day && (events.wfh.length > 0 || events.leave.length > 0)) {
            setSelectedDateEvents({ date: new Date(year, month, day), events });
        }
    };

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {/* Calendar Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
                    {monthNames[month]} {year}
                </h3>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }}></div> WFH
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></div> Leave
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #cbd5e1' }}></div> Office
                    </div>
                </div>

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
                {calendarGrid.map((day, idx) => {
                    const events = getEventsForDate(day);
                    const hasEvents = day && (events.wfh.length > 0 || events.leave.length > 0);
                    const isToday = day && new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

                    return (
                        <div
                            key={idx}
                            onClick={() => handleDateClick(day, events)}
                            style={{
                                padding: '0.5rem',
                                borderRight: (idx + 1) % 7 === 0 ? 'none' : '1px solid #f1f5f9',
                                borderBottom: '1px solid #f1f5f9',
                                minHeight: '110px',
                                backgroundColor: day ? 'white' : '#f9fafb',
                                cursor: hasEvents ? 'pointer' : 'default',
                                transition: 'background-color 0.15s ease'
                            }}
                            onMouseEnter={e => { if (hasEvents) e.currentTarget.style.backgroundColor = '#f8fafc' }}
                            onMouseLeave={e => { if (hasEvents) e.currentTarget.style.backgroundColor = 'white' }}
                        >
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
                                        backgroundColor: isToday ? '#eff6ff' : 'transparent',
                                        margin: '0 auto 0.5rem auto'
                                    }}>
                                        {day}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        {/* WFH Tags */}
                                        {events.wfh.slice(0, 2).map((w, i) => {
                                            const LocIcon = LOCATION_ICONS[w.workLocation]?.icon || MapPin;
                                            return (
                                                <div key={`wfh-${i}`} style={{
                                                    fontSize: '0.7rem',
                                                    padding: '0.2rem 0.4rem',
                                                    borderRadius: '0.25rem',
                                                    backgroundColor: '#eff6ff',
                                                    color: '#1d4ed8',
                                                    borderLeft: '2px solid #3b82f6',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    overflow: 'hidden',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    <LocIcon size={10} style={{ flexShrink: 0 }} />
                                                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                        {w.isInformOnly && <Crown size={10} style={{ color: '#d97706' }} />}
                                                        {w.employee?.name}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                        {/* Leave Tags */}
                                        {events.leave.slice(0, 2).map((l, i) => (
                                            <div key={`leave-${i}`} style={{
                                                fontSize: '0.7rem',
                                                padding: '0.2rem 0.4rem',
                                                borderRadius: '0.25rem',
                                                backgroundColor: '#fef2f2',
                                                color: '#b91c1c',
                                                borderLeft: '2px solid #ef4444',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                    {l.isInformOnly && <Crown size={10} style={{ color: '#d97706' }} />}
                                                    {l.employee?.name}
                                                </span>
                                            </div>
                                        ))}
                                        {/* Overflow indicator */}
                                        {(events.wfh.length + events.leave.length) > 4 && (
                                            <div style={{ fontSize: '0.65rem', color: '#64748b', textAlign: 'center', fontWeight: 600 }}>
                                                + {events.wfh.length + events.leave.length - 4} more
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Detail Popover Modal */}
            {selectedDateEvents && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setSelectedDateEvents(null)}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem',
                        width: '100%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                                {selectedDateEvents.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h3>
                            <button onClick={() => setSelectedDateEvents(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {selectedDateEvents.events.wfh.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>Working From Home</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {selectedDateEvents.events.wfh.map(w => {
                                        const locMeta = LOCATION_ICONS[w.workLocation] || LOCATION_ICONS.other;
                                        const LocIcon = locMeta.icon;
                                        return (
                                            <div key={w.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                                <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: locMeta.bg, color: locMeta.color }}>
                                                    <LocIcon size={16} />
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        {w.isInformOnly && <Crown size={14} style={{ color: '#d97706' }} />}
                                                        {w.employee?.name}
                                                    </p>
                                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                                                        {locMeta.label} {w.customLocation ? `(${w.customLocation})` : ''}
                                                    </p>
                                                    {(isAdmin || currentUserId === w.employee?._id) && w.workPlan && (
                                                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#475569', fontStyle: 'italic' }}>"{w.workPlan}"</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {selectedDateEvents.events.leave.length > 0 && (
                            <div>
                                <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>On Leave</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {selectedDateEvents.events.leave.map(l => (
                                        <div key={l.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', marginTop: '0.4rem' }}></div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {l.isInformOnly && <Crown size={14} style={{ color: '#d97706' }} />}
                                                    {l.employee?.name}
                                                </p>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{l.leaveType}</p>
                                                {(isAdmin || currentUserId === l.employee?._id) && l.reason && (
                                                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#475569', fontStyle: 'italic' }}>"{l.reason}"</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WFHLeaveCalendar;
