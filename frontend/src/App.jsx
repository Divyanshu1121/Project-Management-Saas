import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import EmailVerification from './pages/auth/EmailVerification';
import Unauthorized from './pages/auth/Unauthorized';
import Layout from './components/layout/Layout';
import AdminDashboard from './pages/admin/AdminDashboard';
import CompanyDashboard from './pages/owner/CompanyDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ProjectsPage from './pages/manager/ProjectsPage';
import ProjectView from './pages/manager/ProjectView';
import ManagerTasksPage from './pages/manager/ManagerTasksPage';
import KanbanBoard from './pages/manager/KanbanBoard';
import ManagerTeamPage from './pages/manager/ManagerTeamPage';
import WorkloadPage from './pages/manager/WorkloadPage';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeTasksPage from './pages/employee/EmployeeTasksPage';
import EmployeeTimeLogsPage from './pages/employee/EmployeeTimeLogsPage';
import LeaveRequest from './pages/employee/LeaveRequest';
import TimelineCalendarPage from './pages/manager/TimelineCalendarPage';
import HRDashboard from './pages/hr/HRDashboard';
import SettingsPage from './pages/common/SettingsPage';
import ReportsPage from './pages/reports/ReportsPage';
import TimeLogsPage from './pages/tasks/TimeLogsPage';
import GlobalChatPage from './pages/common/GlobalChatPage';
import Landing from './pages/common/Landing';

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
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route path="/" element={<NavigateToDashboard />} />

            <Route element={<Layout />}>
                <Route
                    path="admin/*"
                    element={
                        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'superadmin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="manager"
                    element={
                        <ProtectedRoute allowedRoles={['PROJECT_MANAGER']}>
                            <ManagerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manager/projects"
                    element={
                        <ProtectedRoute allowedRoles={['PROJECT_MANAGER']}>
                            <ProjectsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manager/projects/:id"
                    element={
                        <ProtectedRoute allowedRoles={['PROJECT_MANAGER']}>
                            <ProjectView />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manager/workload"
                    element={
                        <ProtectedRoute allowedRoles={['PROJECT_MANAGER']}>
                            <WorkloadPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manager/tasks"
                    element={
                        <ProtectedRoute allowedRoles={['PROJECT_MANAGER']}>
                            <ManagerTasksPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manager/team"
                    element={
                        <ProtectedRoute allowedRoles={['PROJECT_MANAGER']}>
                            <ManagerTeamPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manager/kanban"
                    element={
                        <ProtectedRoute allowedRoles={['PROJECT_MANAGER']}>
                            <KanbanBoard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manager/timeline-calendar"
                    element={
                        <ProtectedRoute allowedRoles={['PROJECT_MANAGER']}>
                            <TimelineCalendarPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manager/reports"
                    element={
                        <ProtectedRoute allowedRoles={['PROJECT_MANAGER']}>
                            <ReportsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="employee"
                    element={
                        <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                            <EmployeeDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="employee/tasks"
                    element={
                        <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                            <EmployeeTasksPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="employee/time-logs"
                    element={
                        <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                            <EmployeeTimeLogsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="employee/leave"
                    element={
                        <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                            <LeaveRequest />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="settings"
                    element={
                        <ProtectedRoute allowedRoles={['PROJECT_MANAGER', 'EMPLOYEE', 'HR', 'COMPANY_OWNER', 'owner', 'CEO', 'CTO', 'CFO', 'COO']}>
                            <SettingsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="chat"
                    element={
                        <ProtectedRoute allowedRoles={['PROJECT_MANAGER', 'EMPLOYEE', 'HR']}>
                            <GlobalChatPage />
                        </ProtectedRoute>
                    }
                />

                {/* ── HR (shared layout, sub-routes) ── */}
                <Route
                    path="hr"
                    element={
                        <ProtectedRoute allowedRoles={['HR']}>
                            <HRDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="hr/employees"
                    element={
                        <ProtectedRoute allowedRoles={['HR']}>
                            <HRDashboard defaultSection="employees" />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="hr/leadership"
                    element={
                        <ProtectedRoute allowedRoles={['HR']}>
                            <HRDashboard defaultSection="leadership" />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="hr/leaves"
                    element={
                        <ProtectedRoute allowedRoles={['HR']}>
                            <HRDashboard defaultSection="leaves" />
                        </ProtectedRoute>
                    }
                />

                {/* ── Company / Owners (shared layout) ── */}
                <Route
                    path="company"
                    element={
                        <ProtectedRoute allowedRoles={['COMPANY_OWNER', 'owner', 'CEO', 'CTO', 'CFO', 'COO']}>
                            <CompanyDashboard defaultSection="dashboard" />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="company/c-executives"
                    element={
                        <ProtectedRoute allowedRoles={['COMPANY_OWNER', 'owner', 'CEO', 'CTO', 'CFO', 'COO']}>
                            <CompanyDashboard defaultSection="c-executives" />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="company/projects"
                    element={
                        <ProtectedRoute allowedRoles={['COMPANY_OWNER', 'owner', 'CEO', 'CTO', 'CFO', 'COO']}>
                            <CompanyDashboard defaultSection="projects" />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="company/teams"
                    element={
                        <ProtectedRoute allowedRoles={['COMPANY_OWNER', 'owner', 'CEO', 'CTO', 'CFO', 'COO']}>
                            <CompanyDashboard defaultSection="teams" />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="company/tasks"
                    element={
                        <ProtectedRoute allowedRoles={['COMPANY_OWNER', 'owner', 'CEO', 'CTO', 'CFO', 'COO']}>
                            <CompanyDashboard defaultSection="tasks" />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="company/reports"
                    element={
                        <ProtectedRoute allowedRoles={['COMPANY_OWNER', 'owner', 'CEO', 'CTO', 'CFO', 'COO']}>
                            <CompanyDashboard defaultSection="reports" />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="company/settings"
                    element={
                        <ProtectedRoute allowedRoles={['COMPANY_OWNER', 'owner', 'CEO', 'CTO', 'CFO', 'COO']}>
                            <CompanyDashboard defaultSection="settings" />
                        </ProtectedRoute>
                    }
                />
            </Route>

            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
}

const NavigateToDashboard = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Landing />;

    switch (user.role) {
        case 'SUPER_ADMIN':
        case 'superadmin':
            return <Navigate to="/admin" />;
        case 'COMPANY_OWNER':
        case 'owner':
        case 'CEO':
        case 'CTO':
        case 'CFO':
        case 'COO':
            return <Navigate to="/company" />;
        case 'HR':
            return <Navigate to="/hr" />;
        case 'PROJECT_MANAGER':
            return <Navigate to="/manager" />;
        case 'EMPLOYEE':
            return <Navigate to="/employee" />;
        default:
            localStorage.removeItem('token');
            window.location.href = '/login';
            return null;
    }
};

export default App;
