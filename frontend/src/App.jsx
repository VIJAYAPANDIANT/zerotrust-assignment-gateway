import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentAssignments from './pages/StudentAssignments';
import StudentSubmissions from './pages/StudentSubmissions';
import FacultyDashboard from './pages/FacultyDashboard';
import FacultyAssignments from './pages/FacultyAssignments';
import FacultySubmissions from './pages/FacultySubmissions';
import FacultySubmissionDetail from './pages/FacultySubmissionDetail';
import SecurityDashboard from './pages/SecurityDashboard';

// Protected Route wrapper enforcing student role
function StudentRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Verifying student session...</p>
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Protected Route wrapper enforcing faculty role
function FacultyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Verifying faculty credentials...</p>
      </div>
    );
  }

  if (!user || user.role !== 'faculty') {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Protected Route wrapper for authenticated users (Admin / Dev testing)
function AuthenticatedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Verifying Zero Trust session credentials...</p>
      </div>
    );
  }

  if (!user) {
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
              ) : user.role === 'admin' ? (
                <Navigate to="/security/logs" replace />
              ) : (
                <Navigate to="/faculty/dashboard" replace />
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

          {/* Faculty Specific Routes */}
          <Route
            path="/faculty/dashboard"
            element={
              <FacultyRoute>
                <FacultyDashboard />
              </FacultyRoute>
            }
          />
          <Route
            path="/faculty/assignments"
            element={
              <FacultyRoute>
                <FacultyAssignments />
              </FacultyRoute>
            }
          />
          <Route
            path="/faculty/submissions"
            element={
              <FacultyRoute>
                <FacultySubmissions />
              </FacultyRoute>
            }
          />
          <Route
            path="/faculty/submissions/:id"
            element={
              <FacultyRoute>
                <FacultySubmissionDetail />
              </FacultyRoute>
            }
          />

          {/* Security & Access Audit Dashboard (Admin / Dev testing) */}
          <Route
            path="/security/logs"
            element={
              <AuthenticatedRoute>
                <SecurityDashboard />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/security"
            element={<Navigate to="/security/logs" replace />}
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
