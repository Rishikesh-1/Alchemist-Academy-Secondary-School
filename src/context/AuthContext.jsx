import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const AUTH_STORAGE_KEY = '_aa_auth_session_v2';
const USERS_STORAGE_KEY = '_aa_custom_users_v2';

// Role Definitions & Granular Permissions
export const ROLES = {
  superadmin: {
    title: 'Super Administrator',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Full unconstrained access to all branding, hero, admissions, curriculum, blogs, footer, media library, and user management.',
    allowedSections: [
      'branding',
      'hero',
      'about',
      'stats',
      'headmaster',
      'curriculum',
      'cocurricular',
      'blogs',
      'admissions',
      'footer',
      'media',
      'users',
    ],
  },
  editor: {
    title: 'Content Editor',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    description: 'Can draft, update, and publish school blog articles, update curriculum subjects, co-curricular news, and manage media.',
    allowedSections: ['blogs', 'curriculum', 'cocurricular', 'media'],
  },
  admissions: {
    title: 'Admissions Officer',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Dedicated access to admissions hotline numbers, enrollment CTAs, and student statistics counters.',
    allowedSections: ['admissions', 'stats', 'media'],
  },
  academic: {
    title: 'Academic Coordinator',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: 'Manages school curriculum pathways, about details, and co-curricular programs.',
    allowedSections: ['about', 'curriculum', 'cocurricular', 'headmaster', 'media'],
  },
};

// Default accounts available out of the box
export const DEFAULT_ACCOUNTS = [
  {
    id: 1,
    username: 'admin',
    name: 'Academic Director (Superadmin)',
    role: 'superadmin',
    password: 'AlchemistAdmin2026',
    department: 'Executive Administration',
    status: 'active',
  },
  {
    id: 2,
    username: 'editor',
    name: 'Rohan Shrestha (Editor)',
    role: 'editor',
    password: 'EditorPass2026',
    department: 'Media & Publications',
    status: 'active',
  },
  {
    id: 3,
    username: 'admissions',
    name: 'Sunita Adhikari (Admissions)',
    role: 'admissions',
    password: 'AdmissionsPass2026',
    department: 'Admissions & Enrollment',
    status: 'active',
  },
  {
    id: 4,
    username: 'coordinator',
    name: 'Pooja Thapa (Academic Coordinator)',
    role: 'academic',
    password: 'AcademicPass2026',
    department: 'Curriculum & Faculty',
    status: 'active',
  },
];

export const AuthProvider = ({ children }) => {
  // Accounts list (persisted so superadmin can add new staff with specific roles)
  const [users, setUsers] = useState(() => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load users from storage:', e);
    }
    return DEFAULT_ACCOUNTS;
  });

  // Current logged in session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
          return parsed.user;
        }
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Session load failed:', e);
    }
    return null;
  });

  const [authError, setAuthError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Sync users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users:', e);
    }
  }, [users]);

  // Authenticate against users store
  const login = (username, password) => {
    setAuthError('');

    if (loginAttempts >= 6) {
      setAuthError('Too many failed attempts. Login locked for 5 minutes.');
      return false;
    }

    const cleanUser = (username || '').trim().toLowerCase();
    const foundUser = users.find(
      (u) => u.username.toLowerCase() === cleanUser && u.password === password
    );

    if (foundUser) {
      if (foundUser.status === 'suspended') {
        setAuthError('This staff account is currently suspended. Contact the Super Administrator.');
        return false;
      }

      const sessionUser = {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
        name: foundUser.name,
        department: foundUser.department,
        status: foundUser.status || 'active',
        token: 'auth_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
      };

      const sessionData = {
        user: sessionUser,
        expiresAt: Date.now() + 2 * 60 * 60 * 1000, // 2-hour timeout
      };

      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
      setCurrentUser(sessionUser);
      setLoginAttempts(0);
      return true;
    } else {
      setLoginAttempts((prev) => prev + 1);
      setAuthError('Invalid username or administrative security key.');
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setCurrentUser(null);
  };

  // Check if current user has permission to view/edit a section
  const canAccessSection = (sectionId) => {
    if (!currentUser) return false;
    const roleDef = ROLES[currentUser.role];
    if (!roleDef) return false;
    return roleDef.allowedSections.includes(sectionId);
  };

  // Superadmin: Add new team member
  const addUser = (newUser) => {
    setUsers((prev) => [
      ...prev,
      {
        id: Date.now(),
        status: newUser.status || 'active',
        ...newUser,
      },
    ]);
  };

  // Superadmin: Maintain / Update existing team member
  const updateUser = (userId, updatedFields) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updatedFields } : u))
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => ({
        ...prev,
        ...updatedFields,
      }));
    }
  };

  // Superadmin: Remove team member
  const deleteUser = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const isAuthenticated = Boolean(currentUser);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        authError,
        login,
        logout,
        users,
        addUser,
        updateUser,
        deleteUser,
        canAccessSection,
        ROLES,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
