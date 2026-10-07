import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe, logoutUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('zta_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore authenticated session on initial mount
  useEffect(() => {
    async function restoreSession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getMe(token);
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        } else {
          // Token invalid or expired
          logout();
        }
      } catch (err) {
        console.warn('Session restoration failed:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, [token]);

  /**
   * Log in user
   */
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await loginUser({ email, password });
      if (response.success && response.data) {
        const { token: receivedToken, user: receivedUser } = response.data;
        localStorage.setItem('zta_token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true, user: receivedUser };
      }
      throw new Error(response.message || 'Login failed');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  /**
   * Register new user
   */
  const register = async ({ name, email, password, role }) => {
    setError(null);
    try {
      const response = await registerUser({ name, email, password, role });
      if (response.success && response.data) {
        const { token: receivedToken, user: receivedUser } = response.data;
        localStorage.setItem('zta_token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true, user: receivedUser };
      }
      throw new Error(response.message || 'Registration failed');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  /**
   * Log out user
   */
  const logout = async () => {
    try {
      if (token) {
        await logoutUser(token);
      }
    } catch (err) {
      console.warn('Logout network call error:', err.message);
    } finally {
      localStorage.removeItem('zta_token');
      setToken(null);
      setUser(null);
      setError(null);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
