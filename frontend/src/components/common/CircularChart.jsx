import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

/**
 * A reusable circular (pie/donut) chart component using Recharts.
 * @param {Array} data - [{ name: string, value: number, color: string }]
 * @param {boolean} donut - Whether to render as a donut chart
 * @param {number} height - Height of the chart
 */
const CircularChart = ({ data, donut = true, height = 240 }) => {
    if (!data || data.length === 0) {
        return (
            <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                No data available
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={donut ? "60%" : 0}
                        outerRadius="85%"
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        animationBegin={0}
                        animationDuration={1200}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 45}, 70%, 50%)`} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ 
                            borderRadius: '0.75rem', 
                            border: '1px solid var(--border-color)', 
                            boxShadow: 'var(--sh-md, 0 10px 15px -3px rgba(0,0,0,0.1))',
                            background: 'var(--card-bg, white)',
                            color: 'var(--text-primary, #1e293b)',
                            fontSize: '0.875rem',
                            fontWeight: 600
                        }}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value) => <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.75rem', fontWeight: 500 }}>{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CircularChart;
