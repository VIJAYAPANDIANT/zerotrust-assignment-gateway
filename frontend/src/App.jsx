import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';

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

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {user.role === 'student' && <StudentDashboard />}
        {user.role === 'faculty' && <FacultyDashboard />}
        {user.role !== 'student' && user.role !== 'faculty' && (
          <div className="dashboard-container">
            <h2>Logged in as {user.role}</h2>
            <p>Welcome, {user.name} ({user.email})</p>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
