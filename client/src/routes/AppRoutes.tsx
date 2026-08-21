import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

// Auth Pages
import Login from '../pages/auth/Login';

// Employee Portal Pages
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import EmployeeAttendance from '../pages/employee/EmployeeAttendance';
import EmployeeLeave from '../pages/employee/EmployeeLeave';
import EmployeePayslips from '../pages/employee/EmployeePayslips';
import EmployeePOSH from '../pages/employee/EmployeePOSH';
import EmployeeProfile from '../pages/employee/EmployeeProfile';

// Admin Portal Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import EmployeeManagement from '../pages/admin/EmployeeManagement';
import DepartmentManagement from '../pages/admin/DepartmentManagement';
import AttendanceManagement from '../pages/admin/AttendanceManagement';
import LeaveApprovals from '../pages/admin/LeaveApprovals';
import PayrollManagement from '../pages/admin/PayrollManagement';
import POSHManagement from '../pages/admin/POSHManagement';

// Super Admin Portal Pages
import SuperAdminDashboard from '../pages/superadmin/SuperAdminDashboard';
import RolePermissions from '../pages/superadmin/RolePermissions';
import UserManagement from '../pages/superadmin/UserManagement';
import AuditLogs from '../pages/superadmin/AuditLogs';
import SystemSettings from '../pages/superadmin/SystemSettings';

// IC Portal Pages
import ICDashboard from '../pages/ic/ICDashboard';
import ICCases from '../pages/ic/ICCases';
import ICCaseDetails from '../pages/ic/ICCaseDetails';
import ICMembers from '../pages/ic/ICMembers';

// Shared fallback
import Unauthorized from '../pages/shared/Unauthorized';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Employee Protected Routes */}
      <Route
        path="/employee/*"
        element={
          <ProtectedRoute allowedRoles={['Employee']}>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<EmployeeDashboard />} />
                <Route path="attendance" element={<EmployeeAttendance />} />
                <Route path="leave" element={<EmployeeLeave />} />
                <Route path="payslips" element={<EmployeePayslips />} />
                <Route path="posh" element={<EmployeePOSH />} />
                <Route path="profile" element={<EmployeeProfile />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="employees" element={<EmployeeManagement />} />
                <Route path="departments" element={<DepartmentManagement />} />
                <Route path="attendance" element={<AttendanceManagement />} />
                <Route path="leaves" element={<LeaveApprovals />} />
                <Route path="payroll" element={<PayrollManagement />} />
                <Route path="posh" element={<POSHManagement />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Super Admin Protected Routes */}
      <Route
        path="/superadmin/*"
        element={
          <ProtectedRoute allowedRoles={['Super Admin']}>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<SuperAdminDashboard />} />
                <Route path="roles" element={<RolePermissions />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="audit-logs" element={<AuditLogs />} />
                <Route path="settings" element={<SystemSettings />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* IC Protected Routes */}
      <Route
        path="/ic/*"
        element={
          <ProtectedRoute allowedRoles={['Internal Committee']}>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<ICDashboard />} />
                <Route path="cases" element={<ICCases />} />
                <Route path="cases/:id" element={<ICCaseDetails />} />
                <Route path="members" element={<ICMembers />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback Catch-all redirects to correct landing */}
      <Route
        path="*"
        element={
          <Navigate
            to={
              localStorage.getItem('token')
                ? (() => {
                    try {
                      const user = JSON.parse(localStorage.getItem('user') || '');
                      if (user.role === 'Employee') return '/employee/dashboard';
                      if (user.role === 'Admin') return '/admin/dashboard';
                      if (user.role === 'Super Admin') return '/superadmin/dashboard';
                      if (user.role === 'Internal Committee') return '/ic/dashboard';
                    } catch (e) {}
                    return '/login';
                  })()
                : '/login'
            }
            replace
          />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
