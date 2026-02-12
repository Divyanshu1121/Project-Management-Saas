import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const TimeLogForm = () => {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [duration, setDuration] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                // Fetch tasks assigned to me or all tasks if manager
                // For simplicity, fetch all tasks
                const res = await api.get('/tasks');
                setTasks(res.data);
                if (res.data.length > 0) setSelectedTask(res.data[0]._id);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTasks();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await api.post('/time-logs', {
                taskId: selectedTask,
                date,
                duration: parseInt(duration),
                description,
            });
            setMessage('Time logged successfully!');
            setDuration('');
            setDescription('');
        } catch (err) {
            console.error(err);
            setMessage('Failed to log time');
        }
    };

    return (
        <div className="card" style={{ maxWidth: '500px' }}>
            <h3>Log Time</h3>
            {message && <div style={{ color: message.includes('success') ? 'green' : 'red', marginBottom: '1rem' }}>{message}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Task</label>
                    <select className="form-input" value={selectedTask} onChange={(e) => setSelectedTask(e.target.value)}>
                        {tasks.map(task => (
                            <option key={task._id} value={task._id}>{task.title}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                        type="date"
                        className="form-input"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Duration (minutes)</label>
                    <input
                        type="number"
                        className="form-input"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        required
                        min="1"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Log Time</button>
            </form>
        </div>
    );
};

export default TimeLogForm;
