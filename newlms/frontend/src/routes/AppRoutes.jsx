import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from '../components/layout/DashboardLayout';
import StudentLayout from '../components/layout/StudentLayout';

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

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import BrowseCourses from '../pages/student/BrowseCourses';
import MyLearning from '../pages/student/MyLearning';
import LearningPlayer from '../pages/student/LearningPlayer';
import StudentCalendar from '../pages/student/StudentCalendar';
import StudentMessages from '../pages/student/StudentMessages';
import StudentProgress from '../pages/student/StudentProgress';
import StudentProfile from '../pages/student/StudentProfile';
import StudentSettings from '../pages/student/StudentSettings';
import { 
  StudentAssignments, 
  StudentCertificates, 
  StudentAnnouncements, 
  StudentNotifications 
} from '../pages/student/StudentPlaceholders';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Tutor Module Routes */}
      <Route element={<DashboardLayout />}>
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
        <Route path="/settings" element={<Settings />} />
      </Route>
      
      {/* Student Module Routes */}
      <Route element={<StudentLayout />}>
        <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/my-learning" element={<MyLearning />} />
        <Route path="/student/browse" element={<BrowseCourses />} />
        <Route path="/student/player/:courseId" element={<LearningPlayer />} />
        <Route path="/student/assignments" element={<StudentAssignments />} />
        <Route path="/student/announcements" element={<StudentAnnouncements />} />
        <Route path="/student/calendar" element={<StudentCalendar />} />
        <Route path="/student/messages" element={<StudentMessages />} />
        <Route path="/student/certificates" element={<StudentCertificates />} />
        <Route path="/student/progress" element={<StudentProgress />} />
        <Route path="/student/notifications" element={<StudentNotifications />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/settings" element={<StudentSettings />} />
      </Route>
      
      {/* Catch all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
