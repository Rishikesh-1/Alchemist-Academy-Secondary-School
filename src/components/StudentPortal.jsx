import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  CreditCard,
  Award,
  BookOpen,
  Bell,
  User,
  Download,
  Upload,
  ShieldCheck,
  Check,
  ExternalLink,
  ChevronRight,
  Printer,
  QrCode,
  ArrowLeft,
  Smartphone,
  Eye,
  RefreshCw,
  Sun,
  Moon,
  Sparkles,
  Search,
  MessageSquare,
  Bus,
  BadgeCheck,
  IdCard,
} from 'lucide-react';
import { useSiteData } from '../context/SiteContext';
import { useSchoolData } from '../context/SchoolDataContext';
import DigitalStudentIDModal from './portal/DigitalStudentIDModal';
import ExamAdmitCardModal from './portal/ExamAdmitCardModal';
import BusTransitTracker from './portal/BusTransitTracker';
import DoubtChatDesk from './portal/DoubtChatDesk';

const StudentPortal = () => {
  const { siteData, navigateTo, isDark, toggleTheme } = useSiteData();
  const { branding } = siteData;

  const {
    schoolData,
    submitStudentHomework,
    recordFeePayment,
  } = useSchoolData();

  const {
    student,
    attendanceCalendar,
    assignments,
    bills,
    reportCard,
    timetable,
    notices,
    notifications,
  } = schoolData;

  // Active View Tab: 'overview' | 'attendance' | 'assignments' | 'fees' | 'reportCard' | 'transit' | 'doubts' | 'timetable' | 'notices'
  const [activeTab, setActiveTab] = useState('overview');

  // Role Persona: 'student' | 'parent'
  const [userRole, setUserRole] = useState('student');

  // Homework filter
  const [assignmentFilter, setAssignmentFilter] = useState('all');

  // Modals
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState('esewa');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState(null);

  const [submissionModalAssignment, setSubmissionModalAssignment] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [studentRemarks, setStudentRemarks] = useState('');

  const [showPrintReportModal, setShowPrintReportModal] = useState(false);
  const [showIDCardModal, setShowIDCardModal] = useState(false);
  const [showAdmitCardModal, setShowAdmitCardModal] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Homework submission
  const handleAssignmentSubmit = (e) => {
    e.preventDefault();
    if (!submissionModalAssignment) return;

    const file = uploadedFileName || `${student.name.replace(/\s+/g, '_')}_solution.pdf`;
    submitStudentHomework(submissionModalAssignment.id, file, studentRemarks);

    setSubmissionModalAssignment(null);
    setUploadedFileName('');
    setStudentRemarks('');
  };

  // Digital fee payment simulation
  const handleExecutePayment = () => {
    setPaymentProcessing(true);

    setTimeout(() => {
      const refNo = `${selectedPaymentGateway.toUpperCase()}-${Math.floor(100000000 + Math.random() * 900000000)}`;
      const amountPaid = bills.currentInvoice.totalAmount;

      const newPayment = {
        id: `PAY-${Date.now().toString().slice(-5)}`,
        invoiceNo: bills.currentInvoice.invoiceNo,
        description: `${bills.currentInvoice.month} Clearance`,
        date: new Date().toISOString().split('T')[0],
        amount: amountPaid,
        method:
          selectedPaymentGateway === 'esewa'
            ? 'eSewa Mobile Wallet'
            : selectedPaymentGateway === 'khalti'
            ? 'Khalti Digital Wallet'
            : 'Fonepay QR / Mobile Banking',
        refNo,
        status: 'paid',
      };

      recordFeePayment(newPayment);
      setPaymentProcessing(false);
      setPaymentSuccessReceipt(newPayment);
    }, 1200);
  };

  const filteredAssignments = assignments.filter((asg) => {
    if (assignmentFilter === 'all') return true;
    return asg.status === assignmentFilter;
  });

  const unreadNotifsCount = notifications?.filter((n) => !n.read).length || 0;

  return (
    <div
      className={`min-h-screen w-full font-sans transition-colors duration-300 pb-20 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Banner Navigation */}
      <header
        className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors ${
          isDark
            ? 'bg-slate-950/90 border-slate-800/80 text-white'
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
        }`}
      >
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
            {/* Left: School brand & back button */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button
                type="button"
                onClick={() => navigateTo('home')}
                className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer ${
                  isDark
                    ? 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300'
                    : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title="Return to Public Website"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Website</span>
              </button>

              <div className="h-6 w-px bg-slate-300 dark:bg-slate-800 hidden sm:block" />

              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                  style={{ backgroundColor: branding.logoColor || '#e67300' }}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-sm sm:text-base tracking-tight truncate">
                      {branding.name}
                    </h1>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 shrink-0">
                      Smart Campus
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Student & Parent Digital Portal • 2026 Academic Session
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Notification Center + Persona Switcher + Fast Tools + Theme Toggle */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Notification Bell Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors border relative cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title="Campus Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {unreadNotifsCount}
                    </span>
                  )}
                </button>

                {/* Notifications Panel */}
                {showNotifDropdown && (
                  <div
                    className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-2xl p-4 z-50 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-400">
                        Live Notifications
                      </span>
                      <span className="text-[10px] text-amber-500 font-semibold">Real-Time Sync</span>
                    </div>

                    <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                      {notifications?.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-2.5 rounded-xl border text-xs ${
                            notif.read
                              ? isDark
                                ? 'bg-slate-950/40 border-slate-800 text-slate-400'
                                : 'bg-slate-50 border-slate-100 text-slate-600'
                              : isDark
                              ? 'bg-amber-500/10 border-amber-500/30 text-white'
                              : 'bg-amber-50 border-amber-200 text-slate-900'
                          }`}
                        >
                          <div className="flex justify-between items-center font-bold text-[11px]">
                            <span>{notif.title}</span>
                            <span className="text-[9px] text-slate-400 font-normal">{notif.time}</span>
                          </div>
                          <p className="text-[11px] mt-0.5 leading-relaxed">{notif.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Persona Switcher Pill */}
              <div
                className={`flex items-center p-1 rounded-xl border text-xs font-semibold ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setUserRole('student')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    userRole === 'student'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setUserRole('parent')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    userRole === 'parent'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Parent
                </button>
              </div>

              {/* Theme switcher */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors border cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
                title={isDark ? 'Light mode' : 'Dark mode'}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Student Banner Profile */}
      <section className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-6">
        <div
          className={`relative overflow-hidden rounded-3xl border shadow-lg transition-all p-5 sm:p-7 ${
            isDark
              ? 'bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border-slate-800 text-white'
              : 'bg-gradient-to-br from-white via-amber-50/20 to-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            {/* Student Avatar and Identity */}
            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-amber-500/30 shadow-md"
                />
                <span
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] text-white font-bold"
                  title="Enrolled & Active"
                >
                  ✓
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                    {student.name}
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                    {student.grade} • {student.section}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Roll: #{student.rollNo}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500">ID:</span>{' '}
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                      {student.registrationNo}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500">Blood Group:</span>{' '}
                    <span className="font-semibold text-rose-500">{student.bloodGroup}</span>
                  </div>
                  <div className="col-span-2 truncate">
                    <span className="text-slate-400 dark:text-slate-500">
                      {userRole === 'parent' ? 'Guide:' : 'Guardian:'}
                    </span>{' '}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {userRole === 'parent' ? student.classTeacher : student.guardianName}
                    </span>
                  </div>
                </div>

                {/* Instant Digital Credential Actions */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowIDCardModal(true)}
                    className="px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <IdCard className="w-3.5 h-3.5" />
                    <span>PVC Student ID</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAdmitCardModal(true)}
                    className="px-3 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <BadgeCheck className="w-3.5 h-3.5" />
                    <span>Exam Admit Card</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick KPI Badges */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              {/* Attendance % */}
              <div
                className={`flex-1 sm:flex-initial px-4 py-3 rounded-2xl border ${
                  isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-slate-400">Attendance</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-emerald-500 mt-0.5">
                  {student.attendancePercentage}%
                </div>
              </div>

              {/* Latest GPA */}
              <div
                className={`flex-1 sm:flex-initial px-4 py-3 rounded-2xl border ${
                  isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-slate-400">Terminal GPA</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-amber-500 mt-0.5">
                  {reportCard.gpa}{' '}
                  <span className="text-xs font-semibold text-slate-400">({reportCard.overallGrade})</span>
                </div>
              </div>

              {/* Outstanding Fee Status */}
              <div
                className={`flex-1 sm:flex-initial px-4 py-3 rounded-2xl border ${
                  bills.outstandingDues > 0
                    ? isDark
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : 'bg-rose-50 border-rose-200'
                    : isDark
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-emerald-50 border-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard
                    className={`w-4 h-4 ${
                      bills.outstandingDues > 0 ? 'text-rose-500' : 'text-emerald-500'
                    }`}
                  />
                  <span className="text-xs text-slate-400">Fees Due</span>
                </div>
                <div
                  className={`text-lg sm:text-xl font-bold mt-0.5 ${
                    bills.outstandingDues > 0 ? 'text-rose-500' : 'text-emerald-500'
                  }`}
                >
                  {bills.outstandingDues > 0 ? `NPR ${bills.outstandingDues.toLocaleString()}` : 'Cleared ✓'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Section Navigation Bar */}
      <section className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mt-6">
        <div
          className={`flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar p-1.5 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          {[
            { id: 'overview', label: 'Overview', icon: BookOpen },
            { id: 'attendance', label: 'Attendance', icon: Clock },
            { id: 'assignments', label: 'Assignments', icon: FileText, badge: assignments.filter((a) => a.status === 'pending').length },
            { id: 'fees', label: 'Fees & Invoices', icon: CreditCard, alert: bills.outstandingDues > 0 },
            { id: 'reportCard', label: 'Report Card', icon: Award },
            { id: 'transit', label: 'Campus Bus GPS', icon: Bus },
            { id: 'doubts', label: 'Teacher Doubts Desk', icon: MessageSquare },
            { id: 'timetable', label: 'Class Timetable', icon: Calendar },
            { id: 'notices', label: 'Notices', icon: Bell, badge: notices.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-white shadow-sm'
                    : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-white text-amber-600'
                        : isDark
                        ? 'bg-slate-800 text-amber-400'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {tab.alert && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Tab Content Display */}
      <main className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mt-6">
        {/* ================= 1. OVERVIEW DASHBOARD ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Today's Schedule */}
              <div
                className={`p-6 rounded-3xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-base">Today's Schedule</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('timetable')}
                    className="text-xs font-semibold text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Full Routine <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {timetable.slice(0, 4).map((slot, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                        isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          {slot.subject}
                        </div>
                        <div className="text-slate-400 mt-0.5">
                          {slot.teacher} • {slot.room}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-500">
                        {slot.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Pending Homework */}
              <div
                className={`p-6 rounded-3xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold text-base">Pending Homework</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className="text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {assignments
                    .filter((a) => a.status === 'pending')
                    .slice(0, 3)
                    .map((asg) => (
                      <div
                        key={asg.id}
                        className={`p-3 rounded-2xl border text-xs ${
                          isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-500">{asg.subject}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500">
                            Due {asg.dueDate}
                          </span>
                        </div>
                        <p className="font-medium text-slate-700 dark:text-slate-200 mt-1 line-clamp-1">
                          {asg.title}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">Teacher: {asg.teacher}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSubmissionModalAssignment(asg);
                              setActiveTab('assignments');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Card 3: Notice & Circular Highlights */}
              <div
                className={`p-6 rounded-3xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-rose-500" />
                    <h3 className="font-bold text-base">Campus Circulars</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('notices')}
                    className="text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    All Notices <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {notices.map((notice) => (
                    <div
                      key={notice.id}
                      className={`p-3 rounded-2xl border text-xs ${
                        notice.urgent
                          ? isDark
                            ? 'bg-rose-500/10 border-rose-500/30'
                            : 'bg-rose-50/70 border-rose-200'
                          : isDark
                          ? 'bg-slate-800/40 border-slate-800'
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {notice.category}
                        </span>
                        <span className="text-[10px] text-slate-400">{notice.date}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 mt-1.5">
                        {notice.title}
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {notice.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fee Alert Banner */}
            {bills.outstandingDues > 0 && (
              <div
                className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isDark
                    ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/30'
                    : 'bg-gradient-to-r from-amber-50 via-orange-50 to-white border-amber-200'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100">
                      Pending School Fees for {bills.currentInvoice.month}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Amount Due: <strong className="text-rose-500">NPR {bills.outstandingDues.toLocaleString()}</strong> • Due before {bills.currentInvoice.dueDate}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('fees');
                    setPaymentModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Pay with eSewa / Khalti</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= 2. ATTENDANCE ================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className={`p-5 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="text-xs text-slate-400">Total Working Days</span>
                <div className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">
                  {student.totalWorkingDays} Days
                </div>
              </div>
              <div className={`p-5 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="text-xs text-slate-400">Days Present</span>
                <div className="text-2xl font-bold mt-1 text-emerald-500">
                  {student.presentDays} Days
                </div>
              </div>
              <div className={`p-5 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="text-xs text-slate-400">Absences (Recorded)</span>
                <div className="text-2xl font-bold mt-1 text-rose-500">
                  {student.absentDays} Day
                </div>
              </div>
              <div className={`p-5 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="text-xs text-slate-400">Attendance Ratio</span>
                <div className="text-2xl font-bold mt-1 text-amber-500">
                  {student.attendancePercentage}%
                </div>
              </div>
            </div>

            <div className={`p-6 sm:p-8 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold">Monthly Attendance Log</h3>
                  <p className="text-xs text-slate-400">
                    Ashwin / October 2026 • Verified by Senior Academic Guide RJ Rana
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs flex-wrap">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Present (P)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500" /> Absent (A)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /> Late (L)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-400" /> Holiday</span>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 gap-3">
                {attendanceCalendar.map((item) => {
                  const isPresent = item.status === 'present';
                  const isAbsent = item.status === 'absent';
                  const isLate = item.status === 'late';

                  return (
                    <div
                      key={item.day}
                      className={`p-3.5 rounded-2xl border text-center transition-all hover:scale-105 ${
                        isPresent
                          ? isDark
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : isAbsent
                          ? isDark
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : 'bg-rose-50 border-rose-200 text-rose-700'
                          : isLate
                          ? isDark
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                          : isDark
                          ? 'bg-slate-800/40 border-slate-700/50 text-slate-400'
                          : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                        Oct {item.day}
                      </div>
                      <div className="text-xl font-bold my-1 font-mono">
                        {isPresent ? 'P' : isAbsent ? 'A' : isLate ? 'L' : 'H'}
                      </div>
                      <div className="text-[10px] truncate" title={item.note}>
                        {item.note}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. ASSIGNMENTS ================= */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">Class Assignments & Homework</h3>
                <p className="text-xs text-slate-400">
                  Upload completed homework files, track teacher remarks, and check grades
                </p>
              </div>

              <div
                className={`flex items-center p-1 rounded-xl border text-xs font-semibold ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                {[
                  { id: 'all', label: 'All' },
                  { id: 'pending', label: 'Pending' },
                  { id: 'submitted', label: 'Submitted' },
                  { id: 'graded', label: 'Graded' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setAssignmentFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      assignmentFilter === f.id
                        ? 'bg-amber-500 text-white'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredAssignments.map((asg) => {
                const isPending = asg.status === 'pending';
                const isSubmitted = asg.status === 'submitted';
                const isGraded = asg.status === 'graded';

                return (
                  <div
                    key={asg.id}
                    className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-500 text-white">
                          {asg.subject}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            isPending
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                              : isSubmitted
                              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                          }`}
                        >
                          {isPending ? 'Due: ' + asg.dueDate : isSubmitted ? 'Submitted' : `Graded: ${asg.grade} (${asg.obtainedMarks}/${asg.totalMarks})`}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-3">
                        {asg.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {asg.description}
                      </p>

                      {asg.attachmentName && (
                        <div
                          className={`mt-3 p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                            isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="font-mono text-[11px] truncate">{asg.attachmentName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => alert(`Downloading teacher resource: ${asg.attachmentName}`)}
                            className="text-amber-500 hover:text-amber-600 font-semibold text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                        </div>
                      )}

                      {isGraded && asg.teacherRemarks && (
                        <div className="mt-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">Teacher Remarks:</span>{' '}
                          <span className="text-slate-700 dark:text-slate-300 italic">"{asg.teacherRemarks}"</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Guide: {asg.teacher}</span>

                      {isPending ? (
                        <button
                          type="button"
                          onClick={() => setSubmissionModalAssignment(asg)}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" /> Submit Work
                        </button>
                      ) : (
                        <span className="text-emerald-500 font-semibold flex items-center gap-1">
                          <Check className="w-4 h-4" /> Submitted
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= 4. BILLS & FEES ================= */}
        {activeTab === 'fees' && (
          <div className="space-y-6">
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-500">
                    Smart Tuition Ledger
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100">
                    {bills.outstandingDues > 0 ? (
                      <>
                        NPR {bills.outstandingDues.toLocaleString()}{' '}
                        <span className="text-sm font-normal text-rose-500">Due for Payment</span>
                      </>
                    ) : (
                      <>
                        <span className="text-emerald-500">All Dues Cleared</span> ✓
                      </>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Invoice: <strong className="text-slate-700 dark:text-slate-300">{bills.currentInvoice.invoiceNo}</strong> • Month: {bills.currentInvoice.month} • Due by {bills.currentInvoice.dueDate}
                  </p>
                </div>

                {bills.outstandingDues > 0 && (
                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(true)}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-5 h-5" />
                    <span>Pay Online (eSewa / Khalti / Fonepay)</span>
                  </button>
                )}
              </div>

              <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3">
                  Current Month Breakdown ({bills.currentInvoice.month})
                </h4>
                <div
                  className={`rounded-2xl border divide-y ${
                    isDark
                      ? 'border-slate-800 divide-slate-800 bg-slate-950/50'
                      : 'border-slate-200 divide-slate-100 bg-slate-50/50'
                  }`}
                >
                  {bills.currentInvoice.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                        NPR {item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="p-4 flex items-center justify-between text-sm sm:text-base font-bold bg-amber-500/5">
                    <span>Total Amount</span>
                    <span className="font-mono text-amber-500">
                      NPR {bills.currentInvoice.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History Log */}
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">Transaction History & Receipts</h3>
                  <p className="text-xs text-slate-400">
                    Official digital receipts with bank authorization codes
                  </p>
                </div>
                <div className="text-xs text-slate-400">
                  Total Paid This Year: <strong className="text-emerald-500">NPR {bills.totalPaidThisYear.toLocaleString()}</strong>
                </div>
              </div>

              <div className="space-y-3">
                {bills.paymentHistory.map((receipt) => (
                  <div
                    key={receipt.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {receipt.description}
                        </div>
                        <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                          Invoice: {receipt.invoiceNo} • Ref: {receipt.refNo} • {receipt.method}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-slate-800 dark:text-slate-100">
                          NPR {receipt.amount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">{receipt.date}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPaymentSuccessReceipt(receipt)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= 5. REPORT CARD ================= */}
        {activeTab === 'reportCard' && (
          <div className="space-y-6">
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30">
                      Official Marksheet
                    </span>
                    <span className="text-xs text-slate-400">{reportCard.session}</span>
                  </div>
                  <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">
                    {reportCard.examName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Student: <strong className="text-slate-700 dark:text-slate-200">{student.name}</strong> • Roll No: #{student.rollNo} • Class Rank: <strong className="text-amber-500">{reportCard.rank}</strong> out of {reportCard.classTotalStudents}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPrintReportModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Official Grade Sheet</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
                  <span className="text-xs text-slate-400">Cumulative GPA</span>
                  <div className="text-2xl font-bold text-amber-500 mt-0.5">{reportCard.gpa}</div>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <span className="text-xs text-slate-400">Overall Grade</span>
                  <div className="text-2xl font-bold text-emerald-500 mt-0.5">{reportCard.overallGrade}</div>
                </div>
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center">
                  <span className="text-xs text-slate-400">Total Marks</span>
                  <div className="text-2xl font-bold text-blue-500 mt-0.5">{reportCard.totalMarksObtained} / {reportCard.maximumMarks}</div>
                </div>
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-center">
                  <span className="text-xs text-slate-400">Percentage</span>
                  <div className="text-2xl font-bold text-purple-500 mt-0.5">{reportCard.percentage}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr
                      className={`border-b text-slate-400 uppercase text-[11px] tracking-wider ${
                        isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-3 text-center">Theory (75)</th>
                      <th className="py-3 px-3 text-center">Practical (25)</th>
                      <th className="py-3 px-3 text-center">Total (100)</th>
                      <th className="py-3 px-3 text-center">Grade</th>
                      <th className="py-3 px-3 text-center">GPA</th>
                      <th className="py-3 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {reportCard.subjects.map((sub) => (
                      <tr key={sub.code} className="hover:bg-slate-500/5 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100">
                          {sub.name}
                          <span className="block text-[10px] font-mono text-slate-400 font-normal">
                            {sub.code}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono">{sub.theoryObtained}</td>
                        <td className="py-3.5 px-3 text-center font-mono">{sub.practicalObtained}</td>
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-amber-500">
                          {sub.totalObtained}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-emerald-500/10 text-emerald-500">
                            {sub.grade}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-semibold">{sub.gpa.toFixed(1)}</td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 italic">
                          {sub.remarks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 6. CAMPUS BUS GPS TRANSIT ================= */}
        {activeTab === 'transit' && <BusTransitTracker />}

        {/* ================= 7. 1-ON-1 DOUBTS DESK ================= */}
        {activeTab === 'doubts' && <DoubtChatDesk />}

        {/* ================= 8. CLASS TIMETABLE ================= */}
        {activeTab === 'timetable' && (
          <div className="space-y-6">
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold">Grade 10 Daily Class Timetable</h3>
                  <p className="text-xs text-slate-400">
                    Class Room: Hall 302 • Class Teacher: RJ Rana • Shift: Morning 9:30 AM – 3:30 PM
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 self-start cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Timetable
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {timetable.map((slot, index) => {
                  const isBreak = slot.period.toLowerCase().includes('break');
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-2xl border transition-all ${
                        isBreak
                          ? isDark
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-amber-50 border-amber-200'
                          : isDark
                          ? 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isBreak
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {slot.period}
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-400">
                          {slot.time}
                        </span>
                      </div>
                      <div className="font-bold text-base mt-2 text-slate-800 dark:text-slate-100">
                        {slot.subject}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                        <span>Instructor: {slot.teacher}</span>
                        <span className="font-medium text-amber-500">{slot.room}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= 9. NOTICES ================= */}
        {activeTab === 'notices' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                    notice.urgent
                      ? isDark
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : 'bg-rose-50 border-rose-200 shadow-xs'
                      : isDark
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        {notice.category}
                      </span>
                      <span className="text-xs text-slate-400">{notice.date}</span>
                    </div>

                    <h4 className="font-bold text-base text-slate-800 dark:text-slate-100 mt-3">
                      {notice.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      {notice.body}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Issued by Administration</span>
                    <button
                      type="button"
                      onClick={() => alert(`Notice ID: ${notice.id} acknowledged.`)}
                      className="text-amber-500 font-bold hover:underline cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: DIGITAL PVC STUDENT ID ================= */}
      {showIDCardModal && (
        <DigitalStudentIDModal
          student={student}
          onClose={() => setShowIDCardModal(false)}
        />
      )}

      {/* ================= MODAL: EXAM ADMIT CARD / HALL TICKET ================= */}
      {showAdmitCardModal && (
        <ExamAdmitCardModal
          student={student}
          reportCard={reportCard}
          onClose={() => setShowAdmitCardModal(false)}
        />
      )}

      {/* ================= MODAL: DIGITAL FEE PAYMENT (eSewa / Khalti / Fonepay) ================= */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Instant Fee Checkout</h3>
                  <p className="text-xs text-slate-400">Secure 256-bit Encrypted Payment</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div
              className={`my-5 p-4 rounded-2xl border text-xs sm:text-sm ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Invoice: {bills.currentInvoice.invoiceNo}</span>
                <span>{bills.currentInvoice.month}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-base mt-2">
                <span>Total Amount Due:</span>
                <span className="text-emerald-500 font-mono text-lg">
                  NPR {bills.currentInvoice.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Digital Payment Gateway
            </label>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { id: 'esewa', name: 'eSewa', color: 'bg-emerald-600', sub: 'Nepal Wallet #1' },
                { id: 'khalti', name: 'Khalti', color: 'bg-purple-600', sub: 'Digital Wallet' },
                { id: 'fonepay', name: 'Fonepay QR', color: 'bg-red-600', sub: 'Interbank Scan' },
              ].map((gw) => (
                <button
                  key={gw.id}
                  type="button"
                  onClick={() => setSelectedPaymentGateway(gw.id)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedPaymentGateway === gw.id
                      ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/10'
                      : isDark
                      ? 'border-slate-800 bg-slate-800/40 hover:bg-slate-800'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${gw.color}`} />
                  <div className="font-bold text-xs">{gw.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{gw.sub}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={paymentProcessing}
                onClick={handleExecutePayment}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {paymentProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm NPR {bills.currentInvoice.totalAmount.toLocaleString()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: RECEIPT PREVIEW ================= */}
      {paymentSuccessReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div
            className={`w-full max-w-md rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Payment Verified Successfully!</h3>
              <p className="text-xs text-slate-400 mt-1">Official Electronic Fee Receipt</p>
            </div>

            <div
              className={`my-6 p-4 rounded-2xl border space-y-2 text-xs font-mono ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex justify-between">
                <span className="text-slate-400">School:</span>
                <span className="font-bold">{branding.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Student:</span>
                <span>{student.name} ({student.grade})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Invoice:</span>
                <span>{paymentSuccessReceipt.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Txn Ref:</span>
                <span className="text-emerald-500">{paymentSuccessReceipt.refNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gateway:</span>
                <span>{paymentSuccessReceipt.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span>{paymentSuccessReceipt.date}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-sm">
                <span>Amount Paid:</span>
                <span className="text-emerald-500">NPR {paymentSuccessReceipt.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentSuccessReceipt(null);
                  setPaymentModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SUBMIT HOMEWORK ================= */}
      {submissionModalAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <form
            onSubmit={handleAssignmentSubmit}
            className={`w-full max-w-lg rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
                  {submissionModalAssignment.subject}
                </span>
                <h3 className="font-bold text-lg mt-0.5">{submissionModalAssignment.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSubmissionModalAssignment(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Attach Solution File (PDF, DOCX, or Image)
                </label>
                <div
                  className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-colors ${
                    isDark
                      ? 'border-slate-700 bg-slate-950/40 hover:border-amber-500'
                      : 'border-slate-300 bg-slate-50 hover:border-amber-500'
                  }`}
                  onClick={() => {
                    const sample = `${student.name.replace(/\s+/g, '_')}_${submissionModalAssignment.subject.slice(0, 4)}_UnitSol.pdf`;
                    setUploadedFileName(sample);
                  }}
                >
                  <Upload className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {uploadedFileName ? `Attached: ${uploadedFileName}` : 'Click to select / simulate file upload'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Maximum file size: 25 MB</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Notes to Teacher ({submissionModalAssignment.teacher})
                </label>
                <textarea
                  rows={3}
                  value={studentRemarks}
                  onChange={(e) => setStudentRemarks(e.target.value)}
                  placeholder="Respected teacher, here is my completed assignment..."
                  className={`w-full rounded-xl border p-3 text-xs outline-none focus:ring-2 focus:ring-amber-500 ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-white'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSubmissionModalAssignment(null)}
                className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Turn In Assignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: PRINT REPORT CARD ================= */}
      {showPrintReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-5">
              <h2 className="text-xl font-bold font-serif-brand tracking-wider">{branding.name}</h2>
              <p className="text-xs text-slate-400">Jorpati Oralo, Gokarneshwor-05, Kathmandu, Nepal</p>
              <div className="inline-block mt-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 font-bold text-xs uppercase tracking-wider border border-amber-500/30">
                Official Academic Grade Sheet • {reportCard.examName}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 my-5 text-xs">
              <div>
                <span className="text-slate-400">Student Name:</span> <strong>{student.name}</strong>
              </div>
              <div>
                <span className="text-slate-400">Roll No:</span> <strong>#{student.rollNo}</strong>
              </div>
              <div>
                <span className="text-slate-400">Class:</span> <strong>{student.grade} - {student.section}</strong>
              </div>
              <div>
                <span className="text-slate-400">Reg No:</span> <strong>{student.registrationNo}</strong>
              </div>
            </div>

            <table className="w-full text-left text-xs mb-6">
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                  <th className="p-2">Subject</th>
                  <th className="p-2 text-center">Marks (100)</th>
                  <th className="p-2 text-center">Grade</th>
                  <th className="p-2 text-center">GPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {reportCard.subjects.map((s) => (
                  <tr key={s.code}>
                    <td className="p-2 font-medium">{s.name}</td>
                    <td className="p-2 text-center font-mono font-bold">{s.totalObtained}</td>
                    <td className="p-2 text-center font-bold text-emerald-500">{s.grade}</td>
                    <td className="p-2 text-center font-mono">{s.gpa.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold mb-6">
              <span>Overall GPA: {reportCard.gpa} ({reportCard.overallGrade})</span>
              <span>Class Rank: {reportCard.rank}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPrintReportModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
