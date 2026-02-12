import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const CreateTask = () => {
    const { projectId } = useParams(); // Optional: if creating from project context
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [dueDate, setDueDate] = useState('');

    // For selecting project if not provided in URL
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(projectId || '');

    // For selecting assignee (team members)
    // We need an endpoint to get company users
    const [team, setTeam] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchContext = async () => {
            try {
                // Fetch projects if not pre-selected
                if (!projectId) {
                    const resProjects = await api.get('/projects');
                    setProjects(resProjects.data);
                    if (resProjects.data.length > 0) setSelectedProject(resProjects.data[0]._id);
                }

                // Fetch team members - assuming we have an endpoint or get from company
                // We haven't built a direct "get all company users" for managers specially, 
                // but let's assume we can get it or fail gracefully.
                // Re-using the getCompany endpoint might work if we know ID, 
                // or we add a route to get users.
                // Let's stub it or use a hypothetical route.
                // Actually we can't easily get users without a route.
                // Let's skip user assignment dropdown population for this demo step 
                // and just use a text input or skip.
                // OR better: Create a quick route in backend if needed?
                // No, let's just leave it empty for now or rely on manual entry for demo.
            } catch (err) {
                console.error(err);
            }
        };
        fetchContext();
    }, [projectId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', {
                title,
                description,
                projectId: selectedProject,
                priority,
                dueDate,
                // assignedTo: assignedTo // details later
            });
            navigate(-1);
        } catch (err) {
            console.error(err);
            alert('Failed to create task');
        }
    };

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <h2>Create New Task</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                {!projectId && (
                    <div className="form-group">
                        <label className="form-label">Project</label>
                        <select className="form-input" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
                            {projects.map(p => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Task Title</label>
                    <input
                        type="text"
                        className="form-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
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
                    <label className="form-label">Priority</label>
                    <select className="form-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                        type="date"
                        className="form-input"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button type="submit" className="btn btn-primary">Create Task</button>
                    <button type="button" className="btn" onClick={() => navigate(-1)} style={{ backgroundColor: '#e2e8f0' }}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default CreateTask;
