
import React, { createContext, useContext, useState, useEffect } from 'react';
import { persistenceService } from '../services/supabase';

interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (email: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const demoUser = localStorage.getItem('vidyamitra_user');
    if (demoUser) {
      setUser(JSON.parse(demoUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, fullName: string) => {
    // Mock Sign In
    const mockUser = { id: 'u_' + Date.now(), email, full_name: fullName };
    setUser(mockUser);
    localStorage.setItem('vidyamitra_user', JSON.stringify(mockUser));
    
    // Sync with persistence for dashboard
    await persistenceService.updateProfile({ full_name: fullName });
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('vidyamitra_user');
    // Optional: clear mock DB to reset experience
    // localStorage.removeItem('vidyamitra_mock_db');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
