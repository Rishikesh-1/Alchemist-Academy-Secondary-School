import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  BookOpen,
  Award,
  Calendar,
  Send,
  Plus,
  Upload,
  Download,
  Search,
  Check,
  X,
  ArrowLeft,
  Sun,
  Moon,
  Sparkles,
  MessageSquare,
  ChevronRight,
  Filter,
  Save,
  Printer,
  Smartphone,
  IdCard,
  QrCode,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';
import { useSiteData } from '../context/SiteContext';
import { useSchoolData } from '../context/SchoolDataContext';

const TeacherPortal = () => {
  const { siteData, navigateTo, isDark, toggleTheme } = useSiteData();
  const { branding, footer } = siteData;

  const {
    schoolData,
    submitTeacherRollCall,
    gradeStudentAssignment,
    updateExamMarksheet,
    sendDoubtMessage,
  } = useSchoolData();

  const {
    teacher,
    classRoster,
    assignments,
    teacherRoutine,
    doubtsMessages,
  } = schoolData;

  // Active Workspace Tab: 'attendance' | 'assignments' | 'gradebook' | 'doubts' | 'routine'
  const [activeTab, setActiveTab] = useState('attendance');

  // Attendance form state
  const [attendanceDate, setAttendanceDate] = useState('2026-10-15');
  const [roster, setRoster] = useState(classRoster);
  const [attendanceSubmittedNotice, setAttendanceSubmittedNotice] = useState(false);

  // New Homework Modal State
  const [showNewAssignmentModal, setShowNewAssignmentModal] = useState(false);
  const [newSubject, setNewSubject] = useState('Compulsory Mathematics');
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newMarks, setNewMarks] = useState(20);
  const [newDesc, setNewDesc] = useState('');
  const [newAttachment, setNewAttachment] = useState('');

  // Grading Modal State
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeInputMarks, setGradeInputMarks] = useState('19');
  const [gradeFeedback, setGradeFeedback] = useState('Exemplary working steps and neat presentation.');
  const [gradingSuccessNotice, setGradingSuccessNotice] = useState(false);

  // Gradebook / Terminal Marks inline editing state
  const [gradebookData, setGradebookData] = useState(classRoster);
  const [gradebookSavedNotice, setGradebookSavedNotice] = useState(false);

  // Faculty ID Card modal state
  const [showFacultyIDModal, setShowFacultyIDModal] = useState(false);

  // Teacher reply state for doubts
  const [replyInput, setReplyInput] = useState('');

  // Helper to calculate Grade and GPA from total marks (out of 100)
  const calculateGradeAndGpa = (total) => {
    if (total >= 90) return { grade: 'A+', gpa: 4.0 };
    if (total >= 80) return { grade: 'A', gpa: 3.6 };
    if (total >= 70) return { grade: 'B+', gpa: 3.2 };
    if (total >= 60) return { grade: 'B', gpa: 2.8 };
    if (total >= 50) return { grade: 'C+', gpa: 2.4 };
    if (total >= 40) return { grade: 'C', gpa: 2.0 };
    return { grade: 'D', gpa: 1.6 };
  };

  // Bulk Attendance Actions
  const handleMarkAll = (status) => {
    const updated = roster.map((s) => ({
      ...s,
      attendanceStatus: status,
      attendanceNote: status === 'present' ? 'Punctual' : s.attendanceNote,
    }));
    setRoster(updated);
  };

  const handleToggleStudentAttendance = (rollNo, nextStatus) => {
    const updated = roster.map((s) => (s.rollNo === rollNo ? { ...s, attendanceStatus: nextStatus } : s));
    setRoster(updated);
  };

  const handleUpdateStudentNote = (rollNo, note) => {
    const updated = roster.map((s) => (s.rollNo === rollNo ? { ...s, attendanceNote: note } : s));
    setRoster(updated);
  };

  const handleSubmitAttendance = (e) => {
    e.preventDefault();
    submitTeacherRollCall(roster, attendanceDate);
    setAttendanceSubmittedNotice(true);
    setTimeout(() => setAttendanceSubmittedNotice(false), 4000);
  };

  // Grade Student Submission (Syncs to Student Portal Live!)
  const handleSaveGrading = (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    gradeStudentAssignment(
      selectedSubmission.assignmentId || 'ASG-101',
      selectedSubmission.studentId,
      gradeInputMarks,
      gradeFeedback
    );

    setGradingSuccessNotice(true);
    setTimeout(() => {
      setGradingSuccessNotice(false);
      setSelectedSubmission(null);
    }, 1000);
  };

  // Gradebook Inline Theory / Practical Marks Change
  const handleGradebookChange = (rollNo, field, val) => {
    const num = Math.max(0, Number(val) || 0);
    const updated = gradebookData.map((s) => {
      if (s.rollNo === rollNo) {
        return {
          ...s,
          [field]: num,
        };
      }
      return s;
    });
    setGradebookData(updated);
  };

  const handleSaveGradebook = () => {
    updateExamMarksheet(gradebookData);
    setGradebookSavedNotice(true);
    setTimeout(() => setGradebookSavedNotice(false), 3000);
  };

  // Send Teacher Consultation Message
  const handleTeacherReply = (e) => {
    e.preventDefault();
    if (!replyInput.trim()) return;
    sendDoubtMessage('teacher', replyInput.trim());
    setReplyInput('');
  };

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
                    ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300'
                    : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title="Return to Public Website"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Website</span>
              </button>

              <div className="h-6 w-px bg-slate-300 dark:bg-slate-800 hidden sm:block" />

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold shadow-sm shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-sm sm:text-base tracking-tight truncate">
                      Teacher Cockpit
                    </h1>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 shrink-0">
                      Faculty Portal
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {branding.name} • Class Teacher Workspace
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Quick actions, Theme Toggle, Cross-Portal Fast Links */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowFacultyIDModal(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/30 transition-colors cursor-pointer"
              >
                <IdCard className="w-3.5 h-3.5" />
                <span>Faculty ID</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo('student-portal')}
                className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-amber-400'
                    : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-amber-600'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student View</span>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors border cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Teacher Banner Profile */}
      <section className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-6">
        <div
          className={`relative overflow-hidden rounded-3xl border shadow-lg transition-all p-5 sm:p-7 ${
            isDark
              ? 'bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border-slate-800 text-white'
              : 'bg-gradient-to-br from-white via-amber-50/20 to-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={teacher.avatar}
                  alt={teacher.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-amber-500/30 shadow-md"
                />
                <span
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] text-white font-bold"
                  title="On Duty"
                >
                  ✓
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                    {teacher.name}
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                    {teacher.classTeacherOf}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {teacher.department}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500">Staff ID:</span>{' '}
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                      {teacher.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500">Office Room:</span>{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{teacher.room}</span>
                  </div>
                  <div className="col-span-2 truncate">
                    <span className="text-slate-400 dark:text-slate-500">Contact:</span>{' '}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {teacher.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick KPI Badges */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <div
                className={`flex-1 sm:flex-initial px-4 py-3 rounded-2xl border ${
                  isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-slate-400">Class Roll</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-blue-500 mt-0.5">
                  {teacher.totalStudentsInClass} Students
                </div>
              </div>

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
                  {teacher.todayAttendanceRate}
                </div>
              </div>

              <div
                className={`flex-1 sm:flex-initial px-4 py-3 rounded-2xl border ${
                  isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-slate-400">Pending Review</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-amber-500 mt-0.5">
                  {assignments.filter((a) => a.status === 'submitted').length + 2} Submissions
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Section Navigation Tabs */}
      <section className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mt-6">
        <div
          className={`flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar p-1.5 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          {[
            { id: 'attendance', label: 'Daily Roll Call', icon: Users },
            { id: 'assignments', label: 'Homework & Grading Hub', icon: FileText },
            { id: 'gradebook', label: 'Terminal Exam Marksheet', icon: Award },
            { id: 'doubts', label: 'Student Doubts Desk', icon: MessageSquare, badge: doubtsMessages.filter((m) => m.sender === 'student').length },
            { id: 'routine', label: 'Teaching Routine', icon: Calendar },
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
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Tab Content Display */}
      <main className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mt-6">
        {/* ================= 1. DAILY ROLL CALL ATTENDANCE ================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">
                    Daily Roll Call • {teacher.classTeacherOf}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Submitting marks attendance across student and parent portals and initiates automated morning SMS alerts.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => handleMarkAll('present')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Mark All Present
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMarkAll('absent')}
                    className="px-3 py-1.5 rounded-xl border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {attendanceSubmittedNotice && (
                <div className="my-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>
                      Daily roll call for {attendanceDate} saved & synchronized live to Student Portal!
                    </span>
                  </div>
                  <span className="text-[11px] font-mono">STATUS: SYNCED</span>
                </div>
              )}

              {/* Roster Table */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr
                      className={`border-b text-slate-400 uppercase text-[11px] tracking-wider ${
                        isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <th className="py-3 px-4">Roll</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Teacher Remark / Exemption Note</th>
                      <th className="py-3 px-4">Guardian Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {roster.map((s) => {
                      const isPresent = s.attendanceStatus === 'present';
                      const isAbsent = s.attendanceStatus === 'absent';
                      const isLate = s.attendanceStatus === 'late';

                      return (
                        <tr key={s.rollNo} className="hover:bg-slate-500/5 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-500">#{s.rollNo}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">
                            {s.name}
                            <span className="block text-[11px] font-normal text-slate-400">
                              {s.id} • {s.gender}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleStudentAttendance(s.rollNo, 'present')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  isPresent
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-emerald-500'
                                }`}
                              >
                                P
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleStudentAttendance(s.rollNo, 'absent')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  isAbsent
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-rose-500'
                                }`}
                              >
                                A
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleStudentAttendance(s.rollNo, 'late')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  isLate
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-amber-500'
                                }`}
                              >
                                L
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={s.attendanceNote}
                              onChange={(e) => handleUpdateStudentNote(s.rollNo, e.target.value)}
                              placeholder="Add reason..."
                              className={`w-full px-2.5 py-1 rounded-lg border text-xs outline-none ${
                                isDark
                                  ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-amber-500'
                              }`}
                            />
                          </td>

                          <td className="py-3 px-4 text-xs font-mono text-slate-400">
                            {s.guardian} ({s.contact})
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Total Present:{' '}
                  <strong className="text-emerald-500">
                    {roster.filter((s) => s.attendanceStatus === 'present').length}
                  </strong>{' '}
                  • Absent:{' '}
                  <strong className="text-rose-500">
                    {roster.filter((s) => s.attendanceStatus === 'absent').length}
                  </strong>
                </span>

                <button
                  type="button"
                  onClick={handleSubmitAttendance}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Roll Call & Broadcast SMS</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. HOMEWORK & GRADING HUB ================= */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Class Homework & Grading Hub</h3>
                <p className="text-xs text-slate-400">
                  Review student solution submissions, award marks, and provide qualitative feedback
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNewAssignmentModal(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Issue New Homework</span>
              </button>
            </div>

            <div className="space-y-5">
              {assignments.map((asg) => (
                <div
                  key={asg.id}
                  className={`p-6 rounded-3xl border transition-all ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30">
                          {asg.subject}
                        </span>
                        <span className="text-xs text-slate-400">Due: {asg.dueDate}</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mt-2">
                        {asg.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                        {asg.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="px-4 py-2 rounded-2xl border text-center bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700">
                        <div className="text-xs text-slate-400">Status</div>
                        <div className="text-sm font-bold text-emerald-500 uppercase">{asg.status}</div>
                      </div>
                    </div>
                  </div>

                  {/* Submission item for Aarav Sharma */}
                  <div className="mt-4 pt-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
                      Student Submission Queue:
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div
                        className={`p-4 rounded-2xl border flex flex-col justify-between text-xs ${
                          asg.status === 'graded'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/30'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 dark:text-slate-100">
                              Aarav Sharma (Roll #14)
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">1.8 MB PDF</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                            "{asg.studentNotes || 'Respected Sir, completed all problems with projection diagrams.'}"
                          </p>
                          <div className="mt-2 text-[11px] font-mono text-purple-400 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{asg.studentFile || 'Aarav_Sharma_Math_Unit8.pdf'}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            {asg.status === 'graded' ? `Score: ${asg.obtainedMarks || 19}/20 (${asg.grade || 'A+'})` : 'Pending Teacher Evaluation'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSubmission({
                                assignmentId: asg.id,
                                studentId: 'STU-1001',
                                studentName: 'Aarav Sharma',
                                rollNo: 14,
                                fileName: asg.studentFile || 'Aarav_Sharma_Math_Unit8.pdf',
                              });
                            }}
                            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] cursor-pointer"
                          >
                            {asg.status === 'graded' ? 'Update Grade' : 'Grade Submission'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 3. TERMINAL MARKSHEET ================= */}
        {activeTab === 'gradebook' && (
          <div className="space-y-6">
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                    Gradebook Terminal Marks Entry
                  </span>
                  <h3 className="text-xl font-bold mt-1">
                    First Terminal Examination 2026 • Compulsory Mathematics
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter student theory (max 75) and practical (max 25) marks. Real-time sync to Student Report Cards.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveGradebook}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Sync Report Cards</span>
                </button>
              </div>

              {gradebookSavedNotice && (
                <div className="my-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>
                    Marksheet updated and synced live to Aarav Sharma's Official Report Card!
                  </span>
                </div>
              )}

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr
                      className={`border-b text-slate-400 uppercase text-[11px] tracking-wider ${
                        isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <th className="py-3 px-4">Roll</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-3 text-center">Theory (75)</th>
                      <th className="py-3 px-3 text-center">Practical (25)</th>
                      <th className="py-3 px-3 text-center">Total (100)</th>
                      <th className="py-3 px-3 text-center">Grade</th>
                      <th className="py-3 px-3 text-center">GPA</th>
                      <th className="py-3 px-4">Teacher Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {gradebookData.map((s) => {
                      const total = (s.examTheory || 0) + (s.examPractical || 0);
                      const { grade, gpa } = calculateGradeAndGpa(total);

                      return (
                        <tr key={s.rollNo} className="hover:bg-slate-500/5 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-500">#{s.rollNo}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100">
                            {s.name}
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max="75"
                              value={s.examTheory}
                              onChange={(e) => handleGradebookChange(s.rollNo, 'examTheory', e.target.value)}
                              className={`w-16 px-2 py-1 rounded-lg border text-center font-mono font-bold text-xs outline-none ${
                                isDark
                                  ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500'
                              }`}
                            />
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max="25"
                              value={s.examPractical}
                              onChange={(e) => handleGradebookChange(s.rollNo, 'examPractical', e.target.value)}
                              className={`w-16 px-2 py-1 rounded-lg border text-center font-mono font-bold text-xs outline-none ${
                                isDark
                                  ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500'
                              }`}
                            />
                          </td>

                          <td className="py-3.5 px-3 text-center font-mono font-bold text-amber-500 text-sm">
                            {total}
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-emerald-500/10 text-emerald-500">
                              {grade}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-center font-mono font-bold text-xs">
                            {gpa.toFixed(1)}
                          </td>

                          <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 italic">
                            {s.remarks}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. STUDENT DOUBTS CONSULTATION ================= */}
        {activeTab === 'doubts' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Academic Doubts Consultation Desk</h3>
                <p className="text-xs text-slate-400">
                  Real-time direct chat channel with student Aarav Sharma
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col h-[520px]">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {doubtsMessages.map((msg) => {
                  const isTeacher = msg.sender === 'teacher';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isTeacher ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {msg.senderName}
                        </span>
                        <span>•</span>
                        <span>{msg.time}</span>
                      </div>

                      <div
                        className={`p-4 rounded-2xl max-w-lg text-xs leading-relaxed shadow-xs ${
                          isTeacher
                            ? 'bg-amber-500 text-white rounded-tr-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={handleTeacherReply}
                className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder="Type advice or guidance to Aarav (e.g. Bring your rough register to office hours)..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs outline-none focus:border-amber-500"
                />

                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reply</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= 5. ROUTINE ================= */}
        {activeTab === 'routine' && (
          <div className="space-y-6">
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold">RJ Rana's Daily Teaching Schedule</h3>
                  <p className="text-xs text-slate-400">
                    Faculty Department: Mathematics & STEM Sciences • Academic Year 2026
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 self-start cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Routine
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teacherRoutine.map((slot, idx) => {
                  const isBreak = slot.period.toLowerCase().includes('break');
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        isBreak
                          ? isDark
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-amber-50 border-amber-200'
                          : isDark
                          ? 'bg-slate-800/40 border-slate-800'
                          : 'bg-slate-50 border-slate-200'
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
                        <span>Class: {slot.class}</span>
                        <span className="font-medium text-amber-500">{slot.room}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: FACULTY PVC STAFF ID ================= */}
      {showFacultyIDModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div
            className={`w-full max-w-md rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base">Faculty Identity Badge</h3>
              <button
                type="button"
                onClick={() => setShowFacultyIDModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-6 flex justify-center">
              <div className="w-[320px] h-[480px] rounded-3xl border-2 border-slate-700 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-6 flex flex-col justify-between shadow-2xl relative">
                <div className="text-center">
                  <div className="font-serif-brand font-bold text-base tracking-wider uppercase text-amber-400">
                    {branding.name}
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-slate-400">
                    Faculty & Academic Directorate
                  </p>
                  <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-amber-500/20 text-[9px] font-bold uppercase tracking-widest text-amber-400 border border-amber-500/40">
                    Senior Faculty Member
                  </div>
                </div>

                <div className="text-center my-3">
                  <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden ring-4 ring-amber-500/40 shadow-xl">
                    <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-lg mt-3">{teacher.name}</h4>
                  <div className="text-xs text-amber-400 font-semibold">{teacher.title}</div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">ID: {teacher.id}</div>
                </div>

                <div className="bg-slate-950/80 rounded-2xl p-3 text-[11px] space-y-1 border border-slate-800 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span>Mathematics</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Office Suite:</span>
                    <span>{teacher.room}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Emergency:</span>
                    <span>{teacher.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <QrCode className="w-8 h-8 text-amber-400" />
                  <div className="text-[9px] text-right text-slate-500 uppercase">
                    Authorized Faculty Badge
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFacultyIDModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Badge</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: GRADE STUDENT SUBMISSION ================= */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <form
            onSubmit={handleSaveGrading}
            className={`w-full max-w-md rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
                  Grading Review
                </span>
                <h3 className="font-bold text-lg mt-0.5">
                  {selectedSubmission.studentName} (Roll #{selectedSubmission.rollNo})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl border font-mono bg-slate-950 border-slate-800 text-slate-300">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Submitted File</div>
                <div className="font-bold text-purple-400 mt-1">{selectedSubmission.fileName}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Obtained Marks (out of 20)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  required
                  value={gradeInputMarks}
                  onChange={(e) => setGradeInputMarks(e.target.value)}
                  className="w-full rounded-xl border p-3 font-mono font-bold text-base outline-none bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Teacher Remarks & Feedback
                </label>
                <textarea
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="Great analytical solution, step proofs are clean..."
                  className="w-full rounded-xl border p-3 outline-none bg-slate-950 border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer"
              >
                Save Grade & Sync Live
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TeacherPortal;
