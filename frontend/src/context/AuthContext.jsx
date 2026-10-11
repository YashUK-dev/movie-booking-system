import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authService.getCurrentUser();
      if (res?.success) {
        setUser(res.data);
      }
    } catch {
      // Token invalid/expired - try refresh
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshRes = await authService.refresh(refreshToken);
          if (refreshRes?.success) {
            localStorage.setItem('accessToken', refreshRes.data.accessToken);
            localStorage.setItem('refreshToken', refreshRes.data.refreshToken);
            // Retry getting user
            const userRes = await authService.getCurrentUser();
            if (userRes?.success) {
              setUser(userRes.data);
            }
          }
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res?.success) {
      const { user: userData, accessToken, refreshToken } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(userData);
    }
    return res;
  };

  const register = async (credentials) => {
    const res = await authService.register(credentials);
    if (res?.success) {
      const { user: userData, accessToken, refreshToken } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(userData);
    }
    return res;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore errors on logout
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      loading: false,
      login: async () => {},
      register: async () => {},
      logout: async () => {},
      checkAuth: async () => {},
    };
  }
  return context;
};
