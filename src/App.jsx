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

function AppRouter() {
  const { currentRoute, navigateTo } = useSiteData();
  const { isAuthenticated } = useAuth();

  // 1. Secret/Gated Route: Admin Login Portal
  if (currentRoute === 'admin-login') {
    if (isAuthenticated) {
      // If already logged in, navigate straight to the dashboard
      return <Dashboard />;
    }
    return <AdminLogin />;
  }

  // 2. Secret/Gated Route: CMS Dashboard (Protected by RBAC)
  if (currentRoute === 'dashboard') {
    if (!isAuthenticated) {
      // Unauthorized visitor attempting to view CMS is redirected to the login gate
      return <AdminLogin />;
    }
    return <Dashboard />;
  }

  // 3. Public Student / Parent / Visitor Portal (Pure Landing Page)
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-amber-600 selection:text-white">
      {/* Semantic Top Navigation */}
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />

        {/* School at a Glance Stats */}
        <Stats />

        {/* About & Mission Section */}
        <About />

        {/* Leadership Message */}
        <HeadmasterQuote />

        {/* Academic Curriculum Grid */}
        <Curriculum />

        {/* Co-curricular Activities */}
        <CoCurricular />

        {/* School Blog & Updates */}
        <Blog />

        {/* Admissions Call to Action */}
        <AdmissionsCTA />
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
