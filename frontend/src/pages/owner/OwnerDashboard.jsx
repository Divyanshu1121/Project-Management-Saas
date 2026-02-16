import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OwnerDashboard = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/company/dashboard');
                setData(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    if (!data) return <div>Loading...</div>;

    const { company, stats } = data;

    return (
        <div>
            <h2>Company Owner Dashboard</h2>
            {company && (
                <div className="card" style={{ marginBottom: '1rem' }}>
                    <h3>Company Information</h3>
                    <p><strong>Name:</strong> {company.name}</p>
                    <p><strong>Company ID:</strong> {company._id}</p>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div className="card">
                    <h3>Total Projects</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.totalProjects || 0}</p>
                </div>
                <div className="card">
                    <h3>Total Users</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.totalUsers || 0}</p>
                </div>
                <div className="card">
                    <h3>Total Tasks</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.totalTasks || 0}</p>
                </div>
            </div>

            <div className="card" style={{ marginTop: '1rem', height: '400px' }}>
                <h3>Tasks by Status</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={stats?.tasksByStatus || []}
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
