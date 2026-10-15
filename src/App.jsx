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
import StudentPortal from './components/StudentPortal';
import TeacherPortal from './components/TeacherPortal';
import VendorMasterHub from './components/VendorMasterHub';
import LicenseLockScreen from './components/LicenseLockScreen';
import { SchoolDataProvider, useSchoolData } from './context/SchoolDataContext';
import AboutPage from './pages/AboutPage';
import AcademicsPage from './pages/AcademicsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';

function AppRouter() {
  const { currentRoute, isDark } = useSiteData();
  const { isAuthenticated } = useAuth();
  const { currentSchoolInstance } = useSchoolData();

  // Option 2 Remote Killswitch: If client instance license is suspended by Vendor Master Console, lock institution domain
  if (currentSchoolInstance?.status === 'suspended' && currentRoute !== 'vendor-hub') {
    return <LicenseLockScreen />;
  }

  // 1. Ecosystem Route: Student & Parent Portal
  if (currentRoute === 'student-portal') {
    return <StudentPortal />;
  }

  // 2. Ecosystem Route: Teacher Cockpit & Grading Workspace
  if (currentRoute === 'teacher-portal') {
    return <TeacherPortal />;
  }

  // 3. Ecosystem Route: Vendor Master Command Center (Rishi's Multi-School Console)
  if (currentRoute === 'vendor-hub') {
    return <VendorMasterHub />;
  }

  // 3. Secret/Gated Route: Admin Login Portal
  if (currentRoute === 'admin-login') {
    if (isAuthenticated) {
      return <Dashboard />;
    }
    return <AdminLogin />;
  }

  // 4. Secret/Gated Route: CMS Dashboard (Protected by RBAC)
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
            <HeadmasterQuote page="home" />
            <Curriculum />
            <CoCurricular />
            <Blog />
            <AdmissionsCTA />
          </>
        );
    }
  };

  return (
    <div className={`min-h-screen w-full overflow-x-hidden flex flex-col font-sans selection:bg-amber-600 selection:text-white transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Semantic Top Navigation */}
      <Navbar />

      <main className="flex-grow w-full overflow-x-hidden">
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
        <SchoolDataProvider>
          <AppRouter />
        </SchoolDataProvider>
      </SiteProvider>
    </AuthProvider>
  );
}

export default App;
