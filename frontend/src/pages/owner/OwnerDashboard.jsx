import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OwnerDashboard = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/analytics');
                setData(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    if (!data) return <div>Loading...</div>;

    return (
        <div>
            <h2>Company Owner Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div className="card">
                    <h3>Total Projects</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{data.totalProjects}</p>
                </div>
                <div className="card">
                    <h3>Total Users</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{data.totalUsers}</p>
                </div>
                <div className="card">
                    <h3>Total Tasks</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{data.totalTasks}</p>
                </div>
            </div>

            <div className="card" style={{ marginTop: '1rem', height: '400px' }}>
                <h3>Tasks by Status</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data.tasksByStatus}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" name="Tasks" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default OwnerDashboard;
