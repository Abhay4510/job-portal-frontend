'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'recruiter';
  profile?: {
    address?: string;
    education?: Array<{
      collegeName?: string;
      schoolName?: string;
      degree: string;
      graduationYear: number;
    }>;
    skills?: string[];
    experience?: Array<{
      company: string;
      position: string;
      duration: string;
      description: string;
    }>;
  };
  company?: {
    name: string;
    description: string;
    address: string;
    website: string;
    industry: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: string | null;
  loading: boolean;
  login: (token: string, userRole: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (authToken: string) => {
    try {
      const response = await fetch('https://job-portal-backend-82a8.vercel.app/api/user/profile', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();
      if (data.success === true) {
        setUser(data);
      } else {
        logout();
      }
    } catch {
      // Remove unused error variable
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);  // fetchUser is defined inside the component, so it's stable

  const login = (newToken: string, userRole: string) => {
    setToken(newToken);
    setRole(userRole);
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', userRole);
    fetchUser(newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, role, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}