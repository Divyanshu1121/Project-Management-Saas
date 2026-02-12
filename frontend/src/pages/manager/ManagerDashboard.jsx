import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const ManagerDashboard = () => {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get('/projects');
                setProjects(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProjects();
    }, []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Manager Dashboard</h2>
                <Link to="/projects/new" className="btn btn-primary">Create New Project</Link>
            </div>

            <h3 style={{ marginTop: '2rem' }}>My Projects</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                {projects.map(project => (
                    <div key={project._id} className="card">
                        <Link to={`/projects/${project._id}`} style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{project.name}</Link>
                        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>{project.description}</p>
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', backgroundColor: '#e2e8f0', fontSize: '0.8rem' }}>
                                {project.status}
                            </span>
                            <span style={{ fontSize: '0.8rem' }}>
                                Due: {new Date(project.deadline).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}
                {projects.length === 0 && <p>No projects found.</p>}
            </div>
        </div>
    );
};

export default ManagerDashboard;
