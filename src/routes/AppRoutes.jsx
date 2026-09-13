import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import Landing from '../pages/public/Landing';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import Departments from '../pages/departments/Departments';
import Sessions from '../pages/sessions/Sessions';
import Lecturers from '../pages/lecturers/Lecturers';
import Students from '../pages/students/Students';
import StudentDetail from '../pages/students/StudentDetail';
import Courses from '../pages/courses/Courses';
import CourseAllocation from '../pages/allocations/CourseAllocation';
import CourseRegistration from '../pages/registrations/CourseRegistration';
import Attendance from '../pages/attendance/Attendance';
import EnterResults from '../pages/results/EnterResults';
import ViewResults from '../pages/results/ViewResults';
import AcademicRecords from '../pages/results/AcademicRecords';
import PerformanceAnalytics from '../pages/analytics/PerformanceAnalytics';
import RiskPrediction from '../pages/analytics/RiskPrediction';
import Recommendations from '../pages/analytics/Recommendations';
import Reports from '../pages/reports/Reports';
import Settings from '../pages/settings/Settings';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<MainLayout />}>
        {/* Available to everyone */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Core system management (Admin Only) */}
        <Route path="/departments" element={<ProtectedRoute allowedRoles={['ADMIN']}><Departments /></ProtectedRoute>} />
        <Route path="/sessions" element={<ProtectedRoute allowedRoles={['ADMIN']}><Sessions /></ProtectedRoute>} />
        <Route path="/lecturers" element={<ProtectedRoute allowedRoles={['ADMIN']}><Lecturers /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute allowedRoles={['ADMIN']}><Courses /></ProtectedRoute>} />
        <Route path="/allocation" element={<ProtectedRoute allowedRoles={['ADMIN']}><CourseAllocation /></ProtectedRoute>} />
        <Route path="/registration" element={<ProtectedRoute allowedRoles={['ADMIN']}><CourseRegistration /></ProtectedRoute>} />
        
        {/* Student Records (All Roles) */}
        <Route path="/students" element={<ProtectedRoute allowedRoles={['ADMIN', 'LECTURER', 'ADVISER']}><Students /></ProtectedRoute>} />
        <Route path="/students/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'LECTURER', 'ADVISER']}><StudentDetail /></ProtectedRoute>} />
        
        {/* Results & Attendance */}
        <Route path="/attendance" element={<ProtectedRoute allowedRoles={['ADMIN', 'LECTURER']}><Attendance /></ProtectedRoute>} />
        <Route path="/results/enter" element={<ProtectedRoute allowedRoles={['ADMIN', 'LECTURER']}><EnterResults /></ProtectedRoute>} />
        <Route path="/results/view" element={<ProtectedRoute allowedRoles={['ADMIN', 'LECTURER', 'ADVISER']}><ViewResults /></ProtectedRoute>} />
        <Route path="/records" element={<ProtectedRoute allowedRoles={['ADMIN', 'ADVISER']}><AcademicRecords /></ProtectedRoute>} />
        
        {/* Analytics (Admin & Adviser) */}
        <Route path="/analytics/performance" element={<ProtectedRoute allowedRoles={['ADMIN', 'ADVISER']}><PerformanceAnalytics /></ProtectedRoute>} />
        <Route path="/analytics/risk" element={<ProtectedRoute allowedRoles={['ADMIN', 'ADVISER']}><RiskPrediction /></ProtectedRoute>} />
        <Route path="/analytics/recommendations" element={<ProtectedRoute allowedRoles={['ADMIN', 'ADVISER']}><Recommendations /></ProtectedRoute>} />
        
        {/* Reports & System (Admin Only) */}
        <Route path="/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><Reports /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><Settings /></ProtectedRoute>} />

      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
