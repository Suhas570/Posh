import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import api from '../services/api';

// ============================================================
// DEMO MODE CONFIGURATION
// ============================================================
// When DEMO_MODE is true, the login page accepts ANY email and
// ANY password. No credential verification is performed.
// The user simply selects a role and clicks Login.
// ============================================================
const DEMO_MODE = true;

interface AuthContextType {
  token: string | null;
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string, selectedRole?: UserRole) => Promise<void>;
  logout: () => void;
  updateUserProfile: (profileData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          setToken(storedToken);
          setUser(parsedUser);
          setRole(parsedUser.role);

          // In DEMO_MODE, skip server-side profile sync to avoid
          // authentication blocking the demo session.
          if (DEMO_MODE) {
            setLoading(false);
            return;
          }

          // Verify with server/sync profile
          const res = await api.get('/employee/profile');
          if (res.data.success && res.data.data) {
            const updatedUser = { ...parsedUser, employeeProfile: res.data.data };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } catch (error) {
          console.error('Failed to sync auth session:', error);
          // Don't log out immediately if server is temporarily down, but handle error
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email: string, password: string, selectedRole?: UserRole) => {
    setLoading(true);

    // ============================================================
    // DEMO MODE: Accept ANY email and ANY password.
    // The backend authController is configured to accept any
    // credentials in demo mode, so we still call the API to get
    // a real JWT token and real user data (with employee profile).
    // This keeps POSH complaints and other features working.
    // ============================================================
    if (DEMO_MODE) {
      try {
        // Call the backend login API - it accepts any credentials in demo mode
        const res = await api.post('/auth/login', { email, password });
        if (res.data.success) {
          const { token: receivedToken, user: receivedUser } = res.data;

          // Override the role with the selected role from the login page
          // so the user lands on the correct dashboard
          const finalUser = { ...receivedUser, role: selectedRole || receivedUser.role };

          localStorage.setItem('token', receivedToken);
          localStorage.setItem('user', JSON.stringify(finalUser));
          localStorage.setItem('demoMode', 'true');
          localStorage.removeItem('selectedRole');

          setToken(receivedToken);
          setUser(finalUser);
          setRole(finalUser.role);
          setLoading(false);
          return;
        }
      } catch (error: any) {
        // If the backend is not available, fall back to a local demo session
        console.warn('Backend login failed in demo mode, using local demo session:', error?.message);

        // Determine the role: use the explicitly selected role if provided,
        // otherwise fall back to the role stored in localStorage
        let demoRole: UserRole = selectedRole || 'Employee';

        if (!selectedRole) {
          const storedRole = localStorage.getItem('selectedRole') as UserRole | null;
          if (storedRole && ['Employee', 'Admin', 'Super Admin', 'Internal Committee'].includes(storedRole)) {
            demoRole = storedRole;
          }
        }

        // Build a demo user object
        const demoUser: User = {
          id: 'demo-user-' + Date.now(),
          email: email || 'demo@hrms.com',
          role: demoRole
        };

        // Store demo session
        localStorage.setItem('token', 'demo-mode-token');
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('demoMode', 'true');
        localStorage.removeItem('selectedRole');

        setToken('demo-mode-token');
        setUser(demoUser);
        setRole(demoRole);
        setLoading(false);
        return;
      }
    }

    // ============================================================
    // NORMAL MODE: Real authentication (unchanged)
    // ============================================================
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(receivedUser));
        
        setToken(receivedToken);
        setUser(receivedUser);
        setRole(receivedUser.role);
      }
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('demoMode');
    localStorage.removeItem('selectedRole');
    setToken(null);
    setUser(null);
    setRole(null);
    window.location.href = '/login';
  };

  const updateUserProfile = (profileData: any) => {
    if (user) {
      const updatedUser = { ...user, employeeProfile: { ...user.employeeProfile, ...profileData } };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, role, loading, login, logout, updateUserProfile }}>
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