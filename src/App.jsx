import React from 'react';
import { SiteProvider, useSiteData } from './context/SiteContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Stats from './components/Stats';
import HeadmasterQuote from './components/HeadmasterQuote';
import Curriculum from './components/Curriculum';
import CoCurricular from './components/CoCurricular';
import Blog from './components/Blog';
import AdmissionsCTA from './components/AdmissionsCTA';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import AdminLogin from './components/AdminLogin';
import AboutPage from './pages/AboutPage';
import AcademicsPage from './pages/AcademicsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';

function AppRouter() {
  const { currentRoute } = useSiteData();
  const { isAuthenticated } = useAuth();

  // 1. Secret/Gated Route: Admin Login Portal
  if (currentRoute === 'admin-login') {
    if (isAuthenticated) {
      return <Dashboard />;
    }
    return <AdminLogin />;
  }

  // 2. Secret/Gated Route: CMS Dashboard (Protected by RBAC)
  if (currentRoute === 'dashboard') {
    if (!isAuthenticated) {
      return <AdminLogin />;
    }
    return <Dashboard />;
  }

  // 3. Render Dedicated Page or Full Landing Overview
  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'about':
        return <AboutPage />;
      case 'academics':
        return <AcademicsPage />;
      case 'activities':
        return <ActivitiesPage />;
      case 'blog':
        return <BlogPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return (
          <>
            <Hero />
            <Stats />
            <About />
            <HeadmasterQuote />
            <Curriculum />
            <CoCurricular />
            <Blog />
            <AdmissionsCTA />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-amber-600 selection:text-white">
      {/* Semantic Top Navigation */}
      <Navbar />

      <main className="flex-grow">
        {renderCurrentPage()}
      </main>

      {/* Semantic Footer */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SiteProvider>
        <AppRouter />
      </SiteProvider>
    </AuthProvider>
  );
}

export default App;
