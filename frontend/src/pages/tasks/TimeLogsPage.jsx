import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import TimeLogForm from '../../components/task/TimeLogForm';

const TimeLogsPage = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/time-logs');
                setLogs(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchLogs();
    }, []); // In real app, re-fetch after log submission

    return (
        <div>
            <h2>Time Tracking</h2>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <TimeLogForm />
                </div>
                <div style={{ flex: 2 }}>
                    <h3>Recent Logs</h3>
                    <div className="card">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                    <th style={{ padding: '0.5rem' }}>Date</th>
                                    <th style={{ padding: '0.5rem' }}>User</th>
                                    <th style={{ padding: '0.5rem' }}>Task</th>
                                    <th style={{ padding: '0.5rem' }}>Duration (min)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '0.5rem' }}>{new Date(log.date).toLocaleDateString()}</td>
                                        <td style={{ padding: '0.5rem' }}>{log.userId?.name}</td>
                                        <td style={{ padding: '0.5rem' }}>{log.taskId?.title}</td>
                                        <td style={{ padding: '0.5rem' }}>{log.duration}</td>
                                    </tr>
                                ))}
                                {logs.length === 0 && <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center' }}>No logs found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimeLogsPage;
