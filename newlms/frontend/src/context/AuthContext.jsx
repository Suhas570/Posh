import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tutor_lms_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      name: 'Manoj',
      role: 'Instructor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
      email: 'manoj@tutorlms.com',
      notifications: {
        email: true,
        push: false,
        courseUpdates: true
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('tutor_lms_user', JSON.stringify(user));
  }, [user]);

  const updateProfile = (profileData) => {
    setUser(prev => ({
      ...prev,
      ...profileData
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
