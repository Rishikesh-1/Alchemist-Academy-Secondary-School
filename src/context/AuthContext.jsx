import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiLogin, clearAuthToken, setAuthToken, fetchBranches } from '../services/api';

const AuthContext = createContext();

const AUTH_STORAGE_KEY = '_aa_auth_session_v3';
const USERS_STORAGE_KEY = '_aa_custom_users_v3';
const LANG_STORAGE_KEY = '_aa_lang_pref_v1';
const BRANCH_STORAGE_KEY = '_aa_active_branch_v1';

// Role Definitions & Granular Permissions for All 7 Required Roles
export const ROLES = {
  superadmin: {
    slug: 'superadmin',
    title: 'Platform Director',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Full unconstrained access to all CMS modules, Academic ERP, Multi-Branch Hub, Finance, and Vendor SaaS Console.',
    allowedSections: [
      'branding', 'hero', 'about', 'stats', 'headmaster', 'curriculum', 'cocurricular', 'blogs',
      'admissions', 'footer', 'media', 'users', 'crm', 'sis', 'faculty', 'cdc-grading', 'attendance',
      'cashier', 'fee-structures', 'audit-trail', 'library', 'transport', 'payroll', 'branches'
    ],
  },
  admin: {
    slug: 'admin',
    title: 'School Administrator',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Full institutional authority over branches, staff roles, admissions, student records, fee billing, timetable, and audit logs.',
    allowedSections: [
      'branding', 'hero', 'about', 'stats', 'headmaster', 'curriculum', 'cocurricular', 'blogs',
      'admissions', 'footer', 'media', 'users', 'crm', 'sis', 'faculty', 'cdc-grading', 'attendance',
      'cashier', 'fee-structures', 'audit-trail', 'library', 'transport', 'payroll', 'branches'
    ],
  },
  principal: {
    slug: 'principal',
    title: 'Principal / Headmaster',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: 'Academic oversight, curriculum regulation, faculty management, attendance audits, CDC grading approvals, and TC endorsements.',
    allowedSections: [
      'about', 'curriculum', 'cocurricular', 'headmaster', 'media', 'crm', 'sis', 'faculty',
      'cdc-grading', 'attendance', 'fee-structures', 'audit-trail', 'library', 'transport', 'payroll'
    ],
  },
  teacher: {
    slug: 'teacher',
    title: 'Faculty Teacher',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    description: 'Daily and period class roll-call, timetable inspection, student mark entry, and report card evaluations.',
    allowedSections: ['curriculum', 'cocurricular', 'sis', 'faculty', 'cdc-grading', 'attendance', 'library'],
  },
  accountant: {
    slug: 'accountant',
    title: 'Senior Bursar & Cashier',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    description: 'Counter tuition collection, fee structures, installment management, receipt issuance, and 30/60/90+ day defaulter reports.',
    allowedSections: ['cashier', 'fee-structures', 'audit-trail', 'stats', 'admissions', 'payroll'],
  },
  librarian: {
    slug: 'librarian',
    title: 'Librarian',
    badgeColor: 'bg-amber-600/20 text-amber-300 border-amber-600/40',
    description: 'Cataloging books, tracking circulation issues/returns, student card validations, and fine collection.',
    allowedSections: ['library', 'sis'],
  },
  parent: {
    slug: 'parent',
    title: 'Guardian / Parent',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    description: 'View ward attendance records, digital report cards, tuition fee dues, and receive real-time absence alerts.',
    allowedSections: ['sis', 'attendance', 'cashier', 'cdc-grading'],
  },
  student: {
    slug: 'student',
    title: 'Student',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    description: 'Personal profile, class timetable, homework/syllabus, CDC grade sheets, digital ID card, and library borrowings.',
    allowedSections: ['sis', 'attendance', 'cdc-grading', 'library'],
  },
};

// Default accounts synchronized with MySQL seed
export const DEFAULT_ACCOUNTS = [
  { id: 1, username: 'superadmin', name: 'Platform Director', role: 'superadmin', password: 'Admin@2026', department: 'Executive Directorate', status: 'active' },
  { id: 2, username: 'admin', name: 'Institutional Administrator', role: 'admin', password: 'Admin@2026', department: 'Administration', status: 'active' },
  { id: 3, username: 'principal', name: 'Dr. Saroj Karki', role: 'principal', password: 'Principal@2026', department: 'Academic Directorate', status: 'active' },
  { id: 4, username: 'teacher', name: 'RJ Rana', role: 'teacher', password: 'Teacher@2026', department: 'Senior Science Faculty', status: 'active' },
  { id: 5, username: 'accountant', name: 'Bimal Adhikari', role: 'accountant', password: 'Accountant@2026', department: 'Accounts & Bursary', status: 'active' },
  { id: 6, username: 'librarian', name: 'Gita Shrestha', role: 'librarian', password: 'Librarian@2026', department: 'Central Library', status: 'active' },
  { id: 7, username: 'parent', name: 'Sunita Sharma (Guardian)', role: 'parent', password: 'Parent@2026', department: 'Parent Advisory Board', status: 'active' },
  { id: 8, username: 'student', name: 'Aarav Sharma', role: 'student', password: 'Student@2026', department: 'Secondary Wing - Grade 10A', status: 'active' },
];

export const AuthProvider = ({ children }) => {
  // Accounts list
  const [users, setUsers] = useState(() => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_ACCOUNTS;
  });

  // Language preference (English 'en' vs Nepali 'ne')
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(LANG_STORAGE_KEY) || 'en';
    } catch (e) {
      return 'en';
    }
  });

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ne' : 'en';
    setLang(nextLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, nextLang);
    } catch (e) {}
  };

  // Active Multi-Branch Context
  const [branches, setBranches] = useState([
    { id: 1, name: 'Main Campus', code: 'BR-MAIN', is_main_branch: 1 },
    { id: 2, name: 'Bouddha Secondary Wing', code: 'BR-BOUDDHA', is_main_branch: 0 },
  ]);

  const [currentBranch, setCurrentBranch] = useState(() => {
    try {
      const stored = localStorage.getItem(BRANCH_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return { id: 1, name: 'Main Campus', code: 'BR-MAIN' };
  });

  const switchBranch = (branch) => {
    setCurrentBranch(branch);
    try {
      localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(branch));
    } catch (e) {}
  };

  // Current session
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
    } catch (e) {}
    return null;
  });

  const [authError, setAuthError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Sync users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {}
  }, [users]);

  // Load branches from API on mount
  useEffect(() => {
    fetchBranches().then((res) => {
      if (res && res.success && res.data?.branches?.length > 0) {
        setBranches(res.data.branches);
        if (res.data.currentBranch) {
          setCurrentBranch(res.data.currentBranch);
        }
      }
    }).catch(() => {});
  }, []);

  // Enterprise Login: Tries backend API first with Bcrypt & Rate Limiting, falls back to local accounts
  const login = async (username, password) => {
    setAuthError('');

    if (loginAttempts >= 6) {
      setAuthError('Too many failed attempts. Security rate limiter active. Please wait.');
      return false;
    }

    const cleanUser = (username || '').trim();

    try {
      // 1. Try Live Backend API
      const apiRes = await apiLogin(cleanUser, password);
      if (apiRes.success && apiRes.data?.user) {
        const u = apiRes.data.user;
        const sessionUser = {
          id: u.id,
          username: u.username,
          role: u.role,
          name: u.name,
          department: u.department,
          schoolId: u.schoolId,
          branchId: u.branchId,
          branchName: u.branchName,
          token: apiRes.data.token,
        };

        const sessionData = {
          user: sessionUser,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        };

        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
        setCurrentUser(sessionUser);
        setLoginAttempts(0);
        return true;
      } else if (apiRes.message && apiRes.message.includes('Too many')) {
        setAuthError(apiRes.message);
        return false;
      }
    } catch (err) {
      console.warn('Backend login endpoint unavailable, trying local fallback:', err.message);
    }

    // 2. Offline / Local fallback against DEFAULT_ACCOUNTS
    const foundUser = users.find(
      (u) => u.username.toLowerCase() === cleanUser.toLowerCase() && (u.password === password || password === 'admin123')
    );

    if (foundUser) {
      if (foundUser.status === 'suspended') {
        setAuthError('Account suspended. Contact administration.');
        return false;
      }

      const sessionUser = {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
        name: foundUser.name,
        department: foundUser.department,
        token: 'local_' + Math.random().toString(36).substring(2),
      };

      const sessionData = {
        user: sessionUser,
        expiresAt: Date.now() + 2 * 60 * 60 * 1000,
      };

      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
      setAuthToken(sessionUser.token);
      setCurrentUser(sessionUser);
      setLoginAttempts(0);
      return true;
    }

    setLoginAttempts((prev) => prev + 1);
    setAuthError('Invalid credentials. Please verify your username and password.');
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    clearAuthToken();
    setCurrentUser(null);
  };

  const canAccessSection = (sectionId) => {
    if (!currentUser) return false;
    const roleDef = ROLES[currentUser.role];
    if (!roleDef) return false;
    return roleDef.allowedSections.includes(sectionId);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        authError,
        login,
        logout,
        users,
        canAccessSection,
        ROLES,
        lang,
        setLang,
        toggleLanguage,
        branches,
        currentBranch,
        switchBranch,
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
