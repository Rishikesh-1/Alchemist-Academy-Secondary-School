import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  FileQuestion,
  Clock,
  CheckCircle2,
  Plus,
  Play,
  Layers,
  Sparkles,
  X,
  Eye,
  Filter,
  TrendingUp,
  Search,
  ArrowLeft,
  ChevronRight,
  Printer,
  LineChart,
  UserCheck,
  ShieldCheck,
  Medal,
  GraduationCap,
  Users,
} from 'lucide-react';
import CdcGradingTab from './CdcGradingTab';
import StudentResultProfileModal from './StudentResultProfileModal';
import { useAuth } from '../../../context/AuthContext';
import { fetchOnlineAssessments, createOnlineAssessment } from '../../../services/api';
import {
  CLASS_RESULT_SUMMARIES,
  generateStudentMultiTermResults,
  generateStudentBehaviorHistory,
  getExamTermsStatus,
  setExamTermStatus,
} from '../../../data/mockExamResults';
import {
  generateDefaultSchoolStudents,
  DEFAULT_GRADE_10_STUDENTS,
  DEFAULT_GRADE_9_STUDENTS,
  DEFAULT_GRADE_11_STUDENTS,
  DEFAULT_GRADE_12_STUDENTS,
} from '../../../data/mockStudentDirectory';

const ExaminationsTab = ({ isDark }) => {
  const { lang, currentBranch } = useAuth();
  const [mainTab, setMainTab] = useState('results'); // 'results' | 'grading' | 'cbt'

  // Results Sub-View: 'classes' | 'roster'
  const [resultsView, setResultsView] = useState('classes');
  const [selectedClassId, setSelectedClassId] = useState(1);
  const [selectedSection, setSelectedSection] = useState('all');
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);

  // Term Selection & Official Release State
  const [selectedExamTermId, setSelectedExamTermId] = useState('term-2083-1');
  const [examTermsStatus, setExamTermsStatus] = useState(() => getExamTermsStatus());

  useEffect(() => {
    const handleUpdate = () => {
      setExamTermsStatus(getExamTermsStatus());
    };
    window.addEventListener('alchemist_exam_results_updated', handleUpdate);
    return () => window.removeEventListener('alchemist_exam_results_updated', handleUpdate);
  }, []);

  const handleToggleTermRelease = (termId) => {
    const cur = examTermsStatus[termId]?.status || 'draft';
    const next = cur === 'published' ? 'draft' : 'published';
    const updated = setExamTermStatus(termId, next, 'SMS Examination Controller');
    setExamTermsStatus(updated);
  };

  // Online CBT State
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [systemFilter, setSystemFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // CBT Form State
  const [form, setForm] = useState({
    title: '',
    exam_system: 'online_quiz',
    class_id: 1,
    subject_id: 1,
    total_marks: 50,
    duration_minutes: 60,
    pass_marks: 20,
    start_time: '',
    end_time: '',
    questions: [
      {
        id: 1,
        question: '',
        options: ['', '', '', ''],
        correct_index: 0,
        marks: 5,
      },
    ],
  });

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const res = await fetchOnlineAssessments(systemFilter === 'all' ? null : systemFilter);
      if (res && res.success && res.data?.assessments) {
        setAssessments(res.data.assessments);
      }
    } catch (err) {
      console.error('Error fetching online assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mainTab === 'cbt') {
      loadAssessments();
    }
  }, [mainTab, systemFilter, currentBranch]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.start_time || !form.end_time) {
      alert('Please fill exam title and scheduled start/end times.');
      return;
    }
    const res = await createOnlineAssessment({
      ...form,
      questions: form.questions.filter((q) => q.question.trim().length > 0),
    });
    if (res && res.success) {
      alert('Assessment successfully scheduled & published.');
      setShowCreateModal(false);
      loadAssessments();
    } else {
      alert(res?.message || 'Failed to create assessment.');
    }
  };

  // Helper to get students for the selected class
  const getStudentsForClass = (clsId) => {
    let allStudents = [];
    try {
      const raw = localStorage.getItem('alchemist_sms_students_cache_v1');
      if (raw) allStudents = JSON.parse(raw);
    } catch (e) {}
    if (!allStudents || allStudents.length < 36) {
      allStudents = generateDefaultSchoolStudents();
    }

    if (clsId === 1) {
      return allStudents.filter((s) => String(s.class_id) === '1' || (s.class_name && s.class_name.includes('10')));
    }
    if (clsId === 2) {
      return allStudents.filter((s) => String(s.class_id) === '2' || (s.class_name && s.class_name.includes('9')));
    }
    if (clsId === 3) {
      return allStudents.filter((s) => String(s.class_id) === '3' || (s.class_name && s.class_name.includes('11')));
    }
    if (clsId === 4) {
      return allStudents.filter((s) => String(s.class_id) === '4' || (s.class_name && s.class_name.includes('12')));
    }
    return DEFAULT_GRADE_10_STUDENTS;
  };

  const currentClassSummary =
    CLASS_RESULT_SUMMARIES.find((c) => c.classId === selectedClassId) || CLASS_RESULT_SUMMARIES[0];
  const currentClassStudents = getStudentsForClass(selectedClassId);

  // Filtered Students in the class roster view
  const filteredStudents = currentClassStudents.filter((st) => {
    if (selectedSection !== 'all') {
      const stSec = (st.section || st.section_name || 'Section A').toLowerCase();
      const selSec = selectedSection.toLowerCase();
      if (!stSec.includes(selSec.replace('section', '').trim())) return false;
    }

    if (searchStudent.trim()) {
      const q = searchStudent.trim().toLowerCase();
      const name = (st.name || `${st.first_name || ''} ${st.last_name || ''}`).toLowerCase();
      const roll = String(st.roll_no || st.rollNo || '');
      const adm = String(st.admission_no || st.admissionNo || '').toLowerCase();
      if (!name.includes(q) && !roll.includes(q) && !adm.includes(q)) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black">
            {lang === 'ne' ? 'परीक्षा व्यवस्थापन तथा नतिजा प्रणाली' : 'Examination Results & Performance Hub'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'ne'
              ? 'विद्यार्थीहरूको विगत तथा वर्तमान परीक्षा नतिजा, ट्रेन्डिङ ग्राफ र आचरण विश्लेषण'
              : 'Multi-term student marks records, historical trajectory graphs, class analytics, and behavioral dossier.'}
          </p>
        </div>

        {mainTab === 'cbt' && (
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ne' ? 'नयाँ CBT परीक्षा सिर्जना' : 'Create CBT Exam'}</span>
          </button>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <div
        className={`flex items-center gap-2 border-b pb-2 overflow-x-auto no-scrollbar ${
          isDark ? 'border-slate-700/50' : 'border-slate-200'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setMainTab('results');
            setResultsView('classes');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            mainTab === 'results'
              ? 'bg-blue-600 text-white shadow-md'
              : isDark
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <LineChart className="w-4 h-4" />
          <span>{lang === 'ne' ? 'नतिजा तथा ट्रेन्ड्स ग्राफ' : 'Academic Results & Trending Graphs'}</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('grading')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            mainTab === 'grading'
              ? 'bg-emerald-600 text-white shadow-md'
              : isDark
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{lang === 'ne' ? 'CDC ग्रेडिङ तथा लब्धाङ्क पत्र' : 'CDC Grading & Terminal Marksheet'}</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('cbt')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            mainTab === 'cbt'
              ? 'bg-indigo-600 text-white shadow-md'
              : isDark
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileQuestion className="w-4 h-4" />
          <span>{lang === 'ne' ? 'अनलाइन CBT परीक्षा' : 'Online CBT Assessments'}</span>
        </button>
      </div>

      {/* ================= 1. RESULTS & TRENDS VIEW ================= */}
      {mainTab === 'results' && (
        <div className="space-y-6">
          {/* Term Switcher & Official Release Control Bar */}
          <div
            className={`p-4 sm:p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
                Terminal Cycle:
              </span>
              {[
                { id: 'term-2083-1', label: '1st Term 2083' },
                { id: 'term-2083-mid', label: 'Mid-Term 2083' },
                { id: 'term-2083-third', label: '3rd Term 2083' },
                { id: 'term-2083-final', label: 'Final (Board) 2083' },
              ].map((term) => {
                const isSelected = selectedExamTermId === term.id;
                const status = examTermsStatus[term.id]?.status || 'draft';
                const isPub = status === 'published';

                return (
                  <button
                    key={term.id}
                    type="button"
                    onClick={() => setSelectedExamTermId(term.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md'
                        : isDark
                        ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{term.label}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${isPub ? 'bg-emerald-400' : 'bg-amber-400'}`}
                      title={isPub ? 'Released to Students' : 'Draft / Grading'}
                    />
                  </button>
                );
              })}
            </div>

            {/* Release Status & Action */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    (examTermsStatus[selectedExamTermId]?.status || 'draft') === 'published'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {(examTermsStatus[selectedExamTermId]?.status || 'draft') === 'published'
                    ? '✓ RELEASED TO STUDENT PORTAL'
                    : '⏳ DRAFT (NOT RELEASED)'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleToggleTermRelease(selectedExamTermId)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  (examTermsStatus[selectedExamTermId]?.status || 'draft') === 'published'
                    ? 'bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                }`}
              >
                {(examTermsStatus[selectedExamTermId]?.status || 'draft') === 'published'
                  ? '🔒 Revert to Draft'
                  : '🚀 Release to Student Portal'}
              </button>
            </div>
          </div>

          {/* VIEW A: CLASS CARDS OVERVIEW */}
          {resultsView === 'classes' && (
            <div className="space-y-6">
              {/* Telemetry KPI Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div
                  className={`p-4 rounded-3xl border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Students Evaluated
                  </span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">121 Students</div>
                  <span className="text-[11px] text-emerald-400 font-semibold mt-0.5 block">
                    ✓ All Cohorts Recorded
                  </span>
                </div>

                <div
                  className={`p-4 rounded-3xl border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Campus Average GPA
                  </span>
                  <div className="text-2xl font-bold font-mono text-blue-400 mt-1">3.60 / 4.0</div>
                  <span className="text-[11px] text-blue-400/80 font-semibold mt-0.5 block">
                    ▲ +0.14 vs Previous Academic Year
                  </span>
                </div>

                <div
                  className={`p-4 rounded-3xl border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Campus Pass Rate
                  </span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">96.7%</div>
                  <span className="text-[11px] text-emerald-400 font-semibold mt-0.5 block">
                    44.6% Distinction Ratio
                  </span>
                </div>

                <div
                  className={`p-4 rounded-3xl border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Campus Valedictorian Lead
                  </span>
                  <div className="text-xl font-bold text-amber-400 mt-1 truncate">Anil Sharma</div>
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                    Grade 11 Sci • 3.98 GPA (93.4%)
                  </span>
                </div>
              </div>

              {/* Class Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {CLASS_RESULT_SUMMARIES.map((cls) => {
                  const gpaPercent = Math.min(100, (cls.avgGpa / 4.0) * 100);

                  return (
                    <div
                      key={cls.classId}
                      className={`p-6 rounded-3xl border transition-all duration-300 hover:shadow-xl relative flex flex-col justify-between group ${
                        isDark
                          ? 'bg-slate-900/90 border-slate-800 hover:border-blue-500/50'
                          : 'bg-white border-slate-200 hover:border-blue-400 shadow-sm'
                      }`}
                    >
                      <div>
                        {/* Top Badges */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                            {cls.faculty}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            {cls.passRate}% Pass Rate
                          </span>
                        </div>

                        {/* Title & Enrolled */}
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                            {cls.className}
                          </h3>
                          <span className="text-xs font-mono text-slate-400">
                            {cls.studentCount} Students Enrolled
                          </span>
                        </div>

                        {/* GPA Progress Bar */}
                        <div className="mt-4 mb-5 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-slate-400 font-medium">Class Average GPA:</span>
                            <span className="font-mono font-bold text-blue-400 text-sm">
                              {cls.avgGpa.toFixed(2)} <span className="text-slate-500 font-normal">/ 4.00</span>
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500"
                              style={{ width: `${gpaPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Class Insights Grid */}
                        <div className="space-y-2 text-xs py-2 border-y border-slate-800/80">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Medal className="w-3.5 h-3.5 text-amber-400" />
                              <span>Top Scorer:</span>
                            </span>
                            <span className="font-semibold text-white">
                              {cls.topScorer.name}{' '}
                              <span className="font-mono text-amber-400 font-bold">
                                ({cls.topScorer.gpa} GPA)
                              </span>
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                              <span>Top Subject:</span>
                            </span>
                            <span className="font-medium text-slate-300 truncate max-w-[200px]">
                              {cls.topSubject}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClassId(cls.classId);
                          setSelectedSection('all');
                          setResultsView('roster');
                        }}
                        className="w-full mt-5 py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Users className="w-4 h-4" />
                        <span>Manage {cls.className} Results & Marksheets ({cls.studentCount})</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW B: CLASS STUDENT ROSTER DRILLDOWN */}
          {resultsView === 'roster' && (
            <div className="space-y-6">
              {/* Back Button & Class Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setResultsView('classes')}
                    className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Classes</span>
                  </button>

                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>{currentClassSummary.className} Marksheets & Result Dossier</span>
                      <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        {currentClassStudents.length} Students
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Click any student to view their multi-term marksheets, trending GPA graphs, and permanent behavioral dossier.
                    </p>
                  </div>
                </div>

                {/* Print All Class Results */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Class Result Ledger</span>
                </button>
              </div>

              {/* Filters & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: `All Sections (${currentClassStudents.length})` },
                    { id: 'Section A', label: 'Section A' },
                    { id: 'Section B', label: 'Section B' },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setSelectedSection(sec.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedSection === sec.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : isDark
                          ? 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    placeholder="Search by student name or roll..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Student Results Table */}
              <div className="rounded-3xl border border-slate-800 overflow-hidden bg-slate-900/90 shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                        <th className="py-3 px-4">Roll</th>
                        <th className="py-3 px-4">Student Name & ID</th>
                        <th className="py-3 px-3">Section</th>
                        <th className="py-3 px-3 text-center">
                          {selectedExamTermId === 'term-2083-1'
                            ? '1st Term 2083'
                            : selectedExamTermId === 'term-2083-mid'
                            ? 'Mid-Term 2083'
                            : selectedExamTermId === 'term-2083-third'
                            ? '3rd Term 2083'
                            : 'Final Board 2083'}{' '}
                          GPA
                        </th>
                        <th className="py-3 px-3 text-center">Overall Grade</th>
                        <th className="py-3 px-3 text-center">Past Trajectory</th>
                        <th className="py-3 px-3 text-center">Conduct Rating</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-sans">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="py-8 text-center text-slate-400">
                            No students found matching your criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((st) => {
                          const results = generateStudentMultiTermResults(st);
                          const activeTermData = results.terms[selectedExamTermId] || results.terms['term-2083-1'];
                          const behavior = generateStudentBehaviorHistory(st);
                          const studentName = st.name || `${st.first_name || ''} ${st.last_name || ''}`.trim();
                          const roll = st.roll_no || st.rollNo || 1;
                          const photo =
                            st.photo_url ||
                            st.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=0D9488&color=fff&size=80`;

                          return (
                            <tr
                              key={st.id || roll}
                              className="hover:bg-slate-800/40 transition-colors"
                            >
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                                #{roll}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={photo}
                                    alt={studentName}
                                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                                  />
                                  <div>
                                    <span className="font-bold text-white text-sm block">
                                      {studentName}
                                    </span>
                                    <span className="text-[11px] font-mono text-slate-400 font-normal">
                                      {st.admission_no || `ADM-2026-${roll}`}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-3">
                                <span className="font-semibold text-slate-300">
                                  {st.section || st.section_name || 'Section A'}
                                </span>
                              </td>

                              <td className="py-3.5 px-3 text-center">
                                <span className="font-mono font-bold text-sm text-blue-400">
                                  {activeTermData.gpa.toFixed(2)}
                                </span>
                                <span className="block text-[10px] text-slate-400">/ 4.00</span>
                              </td>

                              <td className="py-3.5 px-3 text-center">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                                    activeTermData.overallGrade.startsWith('A')
                                      ? 'bg-emerald-500/20 text-emerald-400'
                                      : 'bg-blue-500/20 text-blue-400'
                                  }`}
                                >
                                  {activeTermData.overallGrade}
                                </span>
                              </td>

                              <td className="py-3.5 px-3 text-center">
                                <span
                                  className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded ${
                                    results.gpaDelta >= 0
                                      ? 'text-emerald-400 bg-emerald-500/10'
                                      : 'text-rose-400 bg-rose-500/10'
                                  }`}
                                >
                                  {results.gpaDelta >= 0 ? '▲ +' : '▼ '}
                                  {results.gpaDelta}
                                </span>
                              </td>

                              <td className="py-3.5 px-3 text-center">
                                <span className="text-xs font-semibold text-slate-300 block">
                                  {behavior.conductGrade}
                                </span>
                                <span className="text-[10px] font-mono text-emerald-400">
                                  +{behavior.netPoints} pts
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => setSelectedStudentForModal(st)}
                                  className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-blue-400 hover:text-white font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                                  title="View complete marksheets and past trending graphs"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Result & Trends</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 2. CDC GRADING & MARKSHEET ENTRY ================= */}
      {mainTab === 'grading' && <CdcGradingTab isDark={isDark} />}

      {/* ================= 3. ONLINE CBT ASSESSMENTS ================= */}
      {mainTab === 'cbt' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Curriculum System:
            </span>
            {['all', 'cbse', 'standard', 'online_quiz'].map((sys) => (
              <button
                key={sys}
                type="button"
                onClick={() => setSystemFilter(sys)}
                className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                  systemFilter === sys
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sys.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {assessments.length === 0 ? (
              <div
                className={`col-span-full p-8 rounded-2xl border text-center border-dashed ${
                  isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-300'
                }`}
              >
                No online examinations found for selected curriculum. Click "Create CBT Exam" to schedule a test.
              </div>
            ) : (
              assessments.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                      {item.exam_system}
                    </span>
                    <h3 className="font-bold text-sm text-white mt-2">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Duration: {item.duration_minutes} Mins • Total: {item.total_marks} Marks
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Pass Marks: {item.pass_marks}</span>
                    <span className="text-emerald-400 font-bold">Active CBT</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: Full Student Marksheet & Behavioral Profile */}
      {selectedStudentForModal && (
        <StudentResultProfileModal
          student={selectedStudentForModal}
          onClose={() => setSelectedStudentForModal(null)}
          isDark={isDark}
        />
      )}

      {/* Modal: Create CBT Exam */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base">Schedule New CBT Online Assessment</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold mb-1 text-slate-300">Exam Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Grade 10 Mathematics SEE Rapid Assessment"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1 text-slate-300">Curriculum System</label>
                  <select
                    value={form.exam_system}
                    onChange={(e) => setForm({ ...form, exam_system: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                  >
                    <option value="online_quiz">Online CBT Quiz</option>
                    <option value="cbse">CBSE International Pre-Test</option>
                    <option value="standard">NEB Standard Mid-Term</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1 text-slate-300">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1 text-slate-300">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1 text-slate-300">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                >
                  Schedule Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExaminationsTab;
