import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentAssignments from './pages/StudentAssignments';
import StudentSubmissions from './pages/StudentSubmissions';
import FacultyDashboard from './pages/FacultyDashboard';

// Protected Route wrapper enforcing student role
function StudentRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Verifying session credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'student') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Verifying Zero Trust session credentials...</p>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {user && <Navbar />}
      <main className="main-content">
        <Routes>
          {/* Root Entrypoint */}
          <Route
            path="/"
            element={
              !user ? (
                <AuthPage />
              ) : user.role === 'student' ? (
                <Navigate to="/student/dashboard" replace />
              ) : (
                <FacultyDashboard />
              )
            }
          />

          {/* Student Specific Routes */}
          <Route
            path="/student/dashboard"
            element={
              <StudentRoute>
                <StudentDashboard />
              </StudentRoute>
            }
          />
          <Route
            path="/student/assignments"
            element={
              <StudentRoute>
                <StudentAssignments />
              </StudentRoute>
            }
          />
          <Route
            path="/student/submissions"
            element={
              <StudentRoute>
                <StudentSubmissions />
              </StudentRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
