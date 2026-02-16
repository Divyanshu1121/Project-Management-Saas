import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages (Placeholders for now)
import Login from './pages/auth/Login';
// import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import Unauthorized from './pages/auth/Unauthorized'; // To be created

// Components
import Layout from './components/layout/Layout';

// Additional Pages (Fixed imports)
// import CreateProject from './pages/projects/CreateProject'; // Verify if this exists
// import ProjectDetails from './pages/projects/ProjectDetails'; // Verify if this exists
// import TimeLogsPage from './pages/tasks/TimeLogsPage'; // Verify if this exists
// import ReportsPage from './pages/reports/ReportsPage'; // Verify if this exists

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
};

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route path="/" element={<Layout />}>
                <Route index element={<NavigateToDashboard />} />

                {/* Super Admin */}
                <Route
                    path="admin/*"
                    element={
                        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Company Owner */}
                <Route
                    path="owner"
                    element={
                        <ProtectedRoute allowedRoles={['COMPANY_OWNER']}>
                            <OwnerDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Project Manager */}
                <Route
                    path="manager"
                    element={
                        <ProtectedRoute allowedRoles={['PROJECT_MANAGER']}>
                            <ManagerDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Employee */}
                <Route
                    path="employee"
                    element={
                        <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                            <EmployeeDashboard />
                        </ProtectedRoute>
                    }
                />
            </Route>

            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
}

// Check role and redirect to appropriate dashboard
const NavigateToDashboard = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    switch (user.role) {
        case 'SUPER_ADMIN':
            return <Navigate to="/admin" />;
        case 'COMPANY_OWNER':
            return <Navigate to="/owner" />;
        case 'PROJECT_MANAGER':
            return <Navigate to="/manager" />;
        case 'EMPLOYEE':
            return <Navigate to="/employee" />;
        default:
            // Valid token but unknown role (e.g. old enum 'Platform Admin')
            // Logout and redirect to login
            localStorage.removeItem('token');
            window.location.href = '/login';
            return null;
    }
};

export default App;
