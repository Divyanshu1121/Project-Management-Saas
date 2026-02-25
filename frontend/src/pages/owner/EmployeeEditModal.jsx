import React, { useState, useEffect } from 'react';
import { X, Hash, Pencil } from 'lucide-react';

const inputStyle = {
    width: '100%',
    padding: '0.7rem 0.9rem',
    borderRadius: '0.5rem',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.15s',
};

const labelStyle = {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '0.35rem',
    display: 'block',
};

const fieldWrap = {
    marginBottom: '1rem',
};

const EmployeeEditModal = ({ employee, teams, currentTeamId, onClose, onSave }) => {
    const [name, setName] = useState(employee.name || '');
    const [email, setEmail] = useState(employee.email || '');
    const [teamId, setTeamId] = useState(currentTeamId || '');
    const [role, setRole] = useState(employee.role || 'EMPLOYEE');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!name.trim() || !email.trim()) {
            setError('Name and email are required.');
            return;
        }
        setSaving(true);
        try {
            await onSave(employee._id, {
                name: name.trim(),
                email: email.trim(),
                teamId,
                role
            });
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 200,
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{
                backgroundColor: 'white', borderRadius: '1rem',
                width: '100%', maxWidth: '460px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '0.4rem',
                            background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Pencil size={15} color="white" />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                            Edit Employee
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.25rem' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>

                    {/* Read-only Emp ID badge */}
                    <div style={{ ...fieldWrap, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <Hash size={14} style={{ color: '#94a3b8' }} />
                        <span style={{
                            backgroundColor: '#f1f5f9', color: '#334155',
                            padding: '0.25rem 0.65rem', borderRadius: '0.375rem',
                            fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700,
                        }}>
                            {employee.empId || 'N/A'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>· Employee ID (read-only)</span>
                    </div>

                    {/* Name */}
                    <div style={fieldWrap}>
                        <label style={labelStyle}>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            placeholder="Employee full name"
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#2563eb'}
                            onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                        />
                    </div>

                    {/* Email */}
                    <div style={fieldWrap}>
                        <label style={labelStyle}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="employee@company.com"
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#2563eb'}
                            onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                        />
                    </div>

                    {/* Role selector */}
                    <div style={fieldWrap}>
                        <label style={labelStyle}>Role</label>
                        <select
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            style={{ ...inputStyle, appearance: 'auto', cursor: 'pointer' }}
                            onFocus={e => e.target.style.borderColor = '#2563eb'}
                            onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                        >
                            <option value="EMPLOYEE">Employee</option>
                            <option value="PROJECT_MANAGER">Project Manager</option>
                        </select>
                        <p style={{ fontSize: '0.73rem', color: '#94a3b8', margin: '0.3rem 0 0' }}>
                            Changing the role will grant appropriate permissions.
                        </p>
                    </div>

                    {/* Team selector */}
                    <div style={fieldWrap}>
                        <label style={labelStyle}>Team</label>
                        <select
                            value={teamId}
                            onChange={e => setTeamId(e.target.value)}
                            style={{ ...inputStyle, appearance: 'auto', cursor: 'pointer' }}
                            onFocus={e => e.target.style.borderColor = '#2563eb'}
                            onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                        >
                            <option value="">— No team / unassigned —</option>
                            {teams.map(t => (
                                <option key={t._id} value={t._id}>{t.name}</option>
                            ))}
                        </select>
                        <p style={{ fontSize: '0.73rem', color: '#94a3b8', margin: '0.3rem 0 0' }}>
                            Changing the team will move the employee out of their current team.
                        </p>
                    </div>

                    {/* Read-only info row */}
                    <div style={{
                        padding: '0.65rem 0.9rem', borderRadius: '0.5rem',
                        backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                        fontSize: '0.78rem', color: '#64748b', marginBottom: '1.25rem',
                    }}>
                        🔒 <strong>Company</strong> cannot be changed from this panel.
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.65rem 0.9rem', borderRadius: '0.5rem',
                            backgroundColor: '#fee2e2', color: '#b91c1c',
                            fontSize: '0.83rem', marginBottom: '1rem',
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '0.6rem 1.25rem', borderRadius: '0.5rem',
                                border: '1px solid #cbd5e1', backgroundColor: 'white',
                                cursor: 'pointer', fontWeight: 500,
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                padding: '0.6rem 1.25rem', borderRadius: '0.5rem',
                                backgroundColor: saving ? '#93c5fd' : '#2563eb',
                                color: 'white', border: 'none',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                fontWeight: 600,
                            }}
                        >
                            {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeEditModal;
