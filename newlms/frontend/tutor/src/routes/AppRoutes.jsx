import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AuthCallback from '../pages/auth/AuthCallback';

// Tutor Pages
import Dashboard from '../pages/dashboard/Dashboard';
import Courses from '../pages/courses/Courses';
import AddCourse from '../pages/courses/AddCourse';
import EditCourse from '../pages/courses/EditCourse';
import CourseDetails from '../pages/courses/CourseDetails';
import Analytics from '../pages/analytics/Analytics';
import ContentLibrary from '../pages/content-library/ContentLibrary';
import CourseReviews from '../pages/course-reviews/CourseReviews';
import Announcements from '../pages/announcements/Announcements';
import Calendar from '../pages/calendar/Calendar';
import Messages from '../pages/messages/Messages';
import Assignments from '../pages/assignments/Assignments';
import Settings from '../pages/settings/Settings';
import HRResults from '../components/assignments/HRResults';
import HRResultDetail from '../components/assignments/HRResultDetail';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public: session handoff from the common home/login app */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Tutor Module Routes (requires a valid session) */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/add" element={<AddCourse />} />
        <Route path="/courses/edit/:id" element={<EditCourse />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/content-library" element={<ContentLibrary />} />
        <Route path="/reviews" element={<CourseReviews />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/assignments/hr/results" element={<HRResults />} />
        <Route path="/assignments/hr/results/:attemptId" element={<HRResultDetail />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      
      {/* Catch all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
