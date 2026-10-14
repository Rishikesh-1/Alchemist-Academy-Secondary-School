import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultSiteData } from '../data/defaultSiteData';

const SiteContext = createContext();

const STORAGE_KEY = 'alchemist_academy_site_data_v2';

export const SiteProvider = ({ children }) => {
  const [siteData, setSiteData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Error loading site data from localStorage:', err);
    }
    return defaultSiteData;
  });

  // Client view state: 'landing' | 'admin-login' | 'dashboard'
  const [currentRoute, setCurrentRoute] = useState(() => {
    // Check URL query parameter (e.g. ?admin=true or hash #/admin/login)
    const params = new URLSearchParams(window.location.search);
    if (params.get('portal') === 'admin' || window.location.hash === '#/admin/login') {
      return 'admin-login';
    }
    return 'landing';
  });

  // Listen to hash changes for deep linking to /admin/login
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#/admin/login') {
        setCurrentRoute('admin-login');
      } else if (window.location.hash === '#/admin/dashboard') {
        setCurrentRoute('dashboard');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(siteData));
    } catch (err) {
      console.error('Error saving site data to localStorage:', err);
    }
  }, [siteData]);

  const updateSection = (sectionKey, updatedValues) => {
    setSiteData((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        ...updatedValues,
      },
    }));
  };

  const updateFullSiteData = (newData) => {
    setSiteData(newData);
  };

  const resetToDefault = () => {
    setSiteData(defaultSiteData);
    localStorage.removeItem(STORAGE_KEY);
  };

  const navigateTo = (route) => {
    setCurrentRoute(route);
    if (route === 'landing') {
      window.history.pushState(null, '', window.location.pathname);
    } else if (route === 'admin-login') {
      window.location.hash = '#/admin/login';
    } else if (route === 'dashboard') {
      window.location.hash = '#/admin/dashboard';
    }
  };

  return (
    <SiteContext.Provider
      value={{
        siteData,
        setSiteData,
        updateSection,
        updateFullSiteData,
        resetToDefault,
        currentRoute,
        setCurrentRoute,
        navigateTo,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSiteData = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSiteData must be used within a SiteProvider');
  }
  return context;
};
