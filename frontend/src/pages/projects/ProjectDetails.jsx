import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import KanbanBoard from '../../components/sprint/KanbanBoard';

const ProjectDetails = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await api.get(`/projects/${id}`);
                setProject(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProject();
    }, [id]);

    if (!project) return <div>Loading...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h2>{project.name}</h2>
                    <p style={{ color: '#64748b' }}>{project.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/tasks/new`} className="btn btn-primary">Add Task (Global)</Link>
                    {/* Better to have Add Task context aware */}
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                {/* Sprint / Board Tabs could go here */}
                <h3>Sprint Board</h3>
            </div>

            <KanbanBoard projectId={id} />
        </div>
    );
};

export default ProjectDetails;
