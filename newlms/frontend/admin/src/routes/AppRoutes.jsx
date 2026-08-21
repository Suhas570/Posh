import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AuthCallback from '../pages/auth/AuthCallback';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageCourses from '../pages/admin/ManageCourses';
import ManageCategories from '../pages/admin/ManageCategories';
import Announcements from '../pages/admin/Announcements';
import PlatformSettings from '../pages/admin/PlatformSettings';
import ReportsAnalytics from '../pages/admin/ReportsAnalytics';
import ManageResources from '../pages/admin/ManageResources';
import Messaging from '../pages/admin/Messaging';
import ManageTutors from '../pages/admin/ManageTutors';
import CertificatesAdmin from '../pages/admin/CertificatesAdmin';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public: session handoff from the common home/login app */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/tutors" element={<ManageTutors />} />
        <Route path="/admin/courses" element={<ManageCourses />} />
        <Route path="/admin/resources" element={<ManageResources />} />
        <Route path="/admin/messages" element={<Messaging />} />
        <Route path="/admin/categories" element={<ManageCategories />} />
        <Route path="/admin/certificates" element={<CertificatesAdmin />} />
        <Route path="/admin/announcements" element={<Announcements />} />
        <Route path="/admin/settings" element={<PlatformSettings />} />
        <Route path="/admin/reports" element={<ReportsAnalytics />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
