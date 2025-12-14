import { useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('jwt');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const saveSession = (data: { user: User; jwt: string }) => {
    localStorage.setItem('jwt', data.jwt);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    setUser(null);
  };

  const signIn = async (identifier: string, password: string) => {
    const data = await api.login(identifier, password);
    saveSession(data);
    return data;
  };

  const signUp = async (username: string, email: string, password: string) => {
    const data = await api.register(username, email, password);
    saveSession(data);
    return data;
  };

  return { user, signIn, signUp, logout, loading };
};