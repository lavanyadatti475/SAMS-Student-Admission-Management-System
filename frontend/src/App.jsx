import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import AdmissionWizard from './pages/student/AdmissionWizard';
import DocumentCenter from './pages/student/Documents';
import AdminDashboard from './pages/admin/AdminDashboard';
import ApplicationsPage from './pages/admin/Applications';
import AdminNotifications from './pages/admin/Notifications';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Notifications from "./pages/student/notifications";

function App() {
  const { user, loading } = useAuth();

  // Show loading while auth context is initializing
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student/dashboard" element={<ProtectedRoute role="student"><Layout><StudentDashboard /></Layout></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute role="student"><Layout><StudentProfile /></Layout></ProtectedRoute>} />
        <Route path="/student/admission" element={<ProtectedRoute role="student"><Layout><AdmissionWizard /></Layout></ProtectedRoute>} />
        <Route path="/student/documents" element={<ProtectedRoute role="student"><Layout><DocumentCenter /></Layout></ProtectedRoute>} />
        <Route path="/student/notifications" element={<ProtectedRoute role="student"><Layout><Notifications /></Layout></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
        <Route path="/admin/applications" element={<ProtectedRoute role="admin"><Layout><ApplicationsPage /></Layout></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute role="admin"><Layout><AdminNotifications /></Layout></ProtectedRoute>} />
        <Route path="*" element={<div className="flex min-h-screen items-center justify-center">Page not found</div>} />
      </Routes>
      
    </div>
  );
}

export default App;
