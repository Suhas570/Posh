import React, { createContext, useContext, useState, useEffect } from 'react';
import { HOME_URL, roleLabel } from '../utils/appConfig';

const AuthContext = createContext(null);

function readStoredUser() {
  const saved = localStorage.getItem('user');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        role: roleLabel(parsed.role),
        avatar:
          parsed.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(parsed.name || 'User')}&background=1e3a8a&color=fff`,
      };
    } catch (e) {
      // fall through
    }
  }
  return null;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const updateProfile = (profileData) => {
    setUser((prev) => ({
      ...prev,
      ...profileData,
    }));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('auth');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();
    setUser(null);
    window.location.href = `${HOME_URL}/login`;
  };

  return (
    <AuthContext.Provider value={{ user, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
