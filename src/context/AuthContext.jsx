import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService, KEYS } from '../services/storage';
import { seedData } from '../data/seedData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize seed data if not present
    seedData();

    // Check for logged in user
    const currentUser = storageService.get(KEYS.CURRENT_USER);
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const login = (email, password) => {
    const users = storageService.getAll(KEYS.USERS);
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      // Don't store password in session ideally, but this is a frontend demo
      const userToStore = { id: foundUser.id, name: foundUser.name, email: foundUser.email, role: foundUser.role };
      storageService.set(KEYS.CURRENT_USER, userToStore);
      setUser(userToStore);
      return { success: true };
    }
    
    return { success: false, message: 'Invalid email or password' };
  };

  const logout = () => {
    storageService.remove(KEYS.CURRENT_USER);
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
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
