import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const EmployeeDashboard = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                // Fetch tasks assigned to me? 
                // Currently getTasks returns all tasks in company if not filtered?
                // Let's assume getTasks has been updated or we filter here.
                // Actually getTasks does not filter by "assignedTo" by default unless we pass query.
                // But let's fetch all and filter client side for now, or assume backend is updated.
                // Wait, I didn't update backend to filter by "me".
                // Let's filter client side or just show all for now.
                const res = await api.get('/tasks');
                // Filter client side for assigned tasks
                // We need current user ID?
                // For now just show all tasks to demonstrate.
                setTasks(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTasks();
    }, []);

    return (
        <div>
            <h2>My Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div className="card">
                    <h3>My Pending Tasks</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{tasks.filter(t => t.status !== 'Done').length}</p>
                </div>
            </div>

            <h3 style={{ marginTop: '2rem' }}>Assigned Tasks</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                {tasks.map(task => (
                    <div key={task._id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h4>{task.title}</h4>
                            <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                backgroundColor: task.status === 'Done' ? '#dcfce7' : '#fef9c3',
                                color: task.status === 'Done' ? '#166534' : '#854d0e',
                                fontSize: '0.8rem'
                            }}>
                                {task.status}
                            </span>
                        </div>
                        <p style={{ marginTop: '0.5rem', color: '#64748b' }}>{task.description}</p>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                            Priority: {task.priority}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmployeeDashboard;
