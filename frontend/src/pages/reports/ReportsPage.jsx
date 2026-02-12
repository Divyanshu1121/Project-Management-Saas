import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const ReportsPage = () => {
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

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div>
            <h2>Reports & Analytics</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                <div className="card" style={{ height: '400px' }}>
                    <h3>Task Status Distribution</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.tasksByStatus}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="_id"
                            >
                                {data.tasksByStatus.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Additional charts can be added here, e.g., productivity over time */}
                <div className="card">
                    <h3>Project Statistics</h3>
                    <p>Total Projects: {data.totalProjects}</p>
                    <p>Total Tasks: {data.totalTasks}</p>
                    <p>Total Users: {data.totalUsers}</p>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
