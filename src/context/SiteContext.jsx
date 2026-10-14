import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultSiteData } from '../data/defaultSiteData';

const SiteContext = createContext();

const STORAGE_KEY = 'alchemist_academy_site_data_v2';

export const SiteProvider = ({ children }) => {
  const [siteData, setSiteData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultSiteData,
          ...parsed,
          branding: {
            ...defaultSiteData.branding,
            ...(parsed.branding || {}),
          },
        };
      }
    } catch (err) {
      console.error('Error loading site data from localStorage:', err);
    }
    return defaultSiteData;
  });

  // Route parsing helper
  const parseRouteFromLocation = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('portal') === 'admin' || window.location.hash === '#/admin/login') {
      return 'admin-login';
    }
    if (window.location.hash === '#/admin/dashboard') {
      return 'dashboard';
    }
    const cleanHash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    if (cleanHash === 'about') return 'about';
    if (cleanHash === 'academics' || cleanHash === 'curriculum') return 'academics';
    if (cleanHash === 'activities' || cleanHash === 'co-curricular') return 'activities';
    if (cleanHash === 'blog' || cleanHash === 'blogs' || cleanHash === 'news') return 'blog';
    if (cleanHash === 'contact' || cleanHash === 'admissions') return 'contact';
    return 'home';
  };

  // Client view state: 'home' | 'about' | 'academics' | 'activities' | 'blog' | 'contact' | 'admin-login' | 'dashboard'
  const [currentRoute, setCurrentRoute] = useState(parseRouteFromLocation);

  // Listen to hash changes for deep linking to each dedicated page & admin portal
  useEffect(() => {
    const handleHash = () => {
      const target = parseRouteFromLocation();
      setCurrentRoute(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Live dynamic browser tab Favicon and Title sync
  useEffect(() => {
    const faviconUrl =
      siteData.branding?.favicon ||
      (siteData.branding?.logoType === 'image' && siteData.branding?.logoImage
        ? siteData.branding.logoImage
        : './favicon.svg');

    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconUrl;

    if (siteData.branding?.name) {
      const pageSuffix =
        currentRoute === 'about'
          ? ' | About Our School'
          : currentRoute === 'academics'
          ? ' | Academic Curriculum'
          : currentRoute === 'activities'
          ? ' | Co-Curricular & Athletics'
          : currentRoute === 'blog'
          ? ' | School Blog & News'
          : currentRoute === 'contact'
          ? ' | Admissions & Contact'
          : currentRoute === 'admin-login'
          ? ' | Staff Portal'
          : currentRoute === 'dashboard'
          ? ' | CMS Dashboard'
          : ` | ${siteData.branding.tagline || 'Excellence in Education'}`;
      document.title = `${siteData.branding.name}${pageSuffix}`;
    }
  }, [siteData.branding, currentRoute]);

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
    if (route === 'home' || route === 'landing') {
      window.location.hash = '#/';
    } else if (route === 'admin-login') {
      window.location.hash = '#/admin/login';
    } else if (route === 'dashboard') {
      window.location.hash = '#/admin/dashboard';
    } else {
      window.location.hash = `#/${route}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
