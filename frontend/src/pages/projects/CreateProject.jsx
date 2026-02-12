import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CreateProject = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [status, setStatus] = useState('Planning');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/projects', {
                name,
                description,
                deadline,
                status,
            });
            navigate('/manager'); // Or wherever appropriate
        } catch (err) {
            console.error(err);
            alert('Failed to create project');
        }
    };

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <h2>Create New Project</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                <div className="form-group">
                    <label className="form-label">Project Name</label>
                    <input
                        type="text"
                        className="form-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-input"
                        style={{ height: '100px', resize: 'vertical' }}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Deadline</label>
                    <input
                        type="date"
                        className="form-input"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Initial Status</label>
                    <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="Planning">Planning</option>
                        <option value="Active">Active</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button type="submit" className="btn btn-primary">Create Project</button>
                    <button type="button" className="btn" onClick={() => navigate(-1)} style={{ backgroundColor: '#e2e8f0' }}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default CreateProject;
