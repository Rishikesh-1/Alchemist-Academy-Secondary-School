import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  User,
  Bell,
  X,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Clock,
  Medal,
  Sparkles,
  BookOpen,
  GraduationCap,
  ChevronRight,
  TrendingUp,
  FileText,
  Star,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useSchoolData } from '../../../context/SchoolDataContext';
import { fetchBehaviorRecords, recordBehaviorIncident } from '../../../services/api';
import { generateStudentBehaviorHistory } from '../../../data/mockExamResults';
import { generateDefaultSchoolStudents } from '../../../data/mockStudentDirectory';

const DEFAULT_INCIDENTS = [
  {
    id: 101,
    incident_date: '2026-03-28',
    incident_type: 'positive',
    points: 15,
    title: 'Inter-School Science Olympiad 1st Runner-Up',
    description: 'Represented Alchemist Academy with distinction in the regional robotics and science tournament.',
    action_taken: 'Awarded Gold Commendation Certificate & Honor Roll',
    guardian_notified: true,
    reported_by_name: 'Dr. K. Acharya',
    student_id: 1,
    first_name: 'Aarav',
    last_name: 'Sharma',
    class_name: 'Grade 10',
    roll_no: 1,
  },
  {
    id: 102,
    incident_date: '2026-03-24',
    incident_type: 'positive',
    points: 10,
    title: 'Library Mentorship & Reading Buddy Star',
    description: 'Volunteered 12 hours helping junior students with reading comprehension and homework club.',
    action_taken: 'Awarded Community Service Badge',
    guardian_notified: true,
    reported_by_name: 'Mandira Adhikari',
    student_id: 2,
    first_name: 'Sneha',
    last_name: 'Adhikari',
    class_name: 'Grade 10',
    roll_no: 2,
  },
  {
    id: 103,
    incident_date: '2026-03-18',
    incident_type: 'counseling',
    points: -5,
    title: 'Late Arrival Reflection & Commute Advisory',
    description: 'Arrived after morning assembly due to Kathmandu transit blockages; completed guidance review.',
    action_taken: 'Counseling completed • Parental advisory SMS transmitted',
    guardian_notified: true,
    reported_by_name: 'Bikram Karki',
    student_id: 3,
    first_name: 'Rohan',
    last_name: 'Shrestha',
    class_name: 'Grade 10',
    roll_no: 3,
  },
  {
    id: 104,
    incident_date: '2026-03-12',
    incident_type: 'positive',
    points: 20,
    title: 'Clean Campus Eco-Club Tree Plantation Drive',
    description: 'Led a squad of 15 students in planting 80 saplings across the north campus sports grounds.',
    action_taken: 'Commendation letter entered into cumulative academic dossier',
    guardian_notified: true,
    reported_by_name: 'RJ Rana',
    student_id: 4,
    first_name: 'Pooja',
    last_name: 'Karki',
    class_name: 'Grade 10',
    roll_no: 4,
  },
  {
    id: 105,
    incident_date: '2026-03-05',
    incident_type: 'disciplinary',
    points: -10,
    title: 'Uniform Compliance Breach & Mobile Device In Class',
    description: 'Unapproved smart device used during laboratory session without instructor authorization.',
    action_taken: 'Device secured until end of day; guardian conference arranged',
    guardian_notified: true,
    reported_by_name: 'RJ Rana',
    student_id: 9,
    first_name: 'Suman',
    last_name: 'Poudel',
    class_name: 'Grade 10',
    roll_no: 9,
  },
];

const LOCAL_STORAGE_BEHAVIOR_KEY = 'alchemist_sms_behavior_records_v1';

const BehaviorRecordsTab = ({ isDark }) => {
  const { lang, currentBranch } = useAuth();
  const { schoolData } = useSchoolData();

  // All students from directory
  const allStudents = useMemo(() => {
    return generateDefaultSchoolStudents();
  }, []);

  // Main Sub-view: 'dossier' (Cumulative Records Since Joined) or 'ledger' (All Campus Incidents)
  const [activeSubView, setActiveSubView] = useState('dossier');

  // Selected Student for Cumulative Dossier
  const [selectedStudentId, setSelectedStudentId] = useState(1);
  const [studentCohortFilter, setStudentCohortFilter] = useState('Grade 10');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Timeline category filter inside dossier
  const [dossierCategoryFilter, setDossierCategoryFilter] = useState('all');

  // Ledger state
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BEHAVIOR_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return DEFAULT_INCIDENTS;
  });

  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'positive' | 'disciplinary' | 'counseling'
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    student_id: 1,
    incident_type: 'positive',
    title: '',
    points: 10,
    description: '',
    action_taken: 'Commendation certificate awarded',
    guardian_notified: true,
  });

  const loadData = async () => {
    try {
      const res = await fetchBehaviorRecords();
      if (res.success && res.data?.records && res.data.records.length > 0) {
        setRecords(res.data.records);
        localStorage.setItem(LOCAL_STORAGE_BEHAVIOR_KEY, JSON.stringify(res.data.records));
      }
    } catch (err) {
      console.warn('Backend behavior records API unavailable, using cached records.');
    }
  };

  useEffect(() => {
    loadData();
  }, [currentBranch]);

  // Selected student object
  const selectedStudent = useMemo(() => {
    const found = allStudents.find((s) => s.id === selectedStudentId);
    return found || allStudents[0];
  }, [allStudents, selectedStudentId]);

  // Cumulative dossier for selected student
  const studentDossier = useMemo(() => {
    if (!selectedStudent) return null;
    const baseHistory = generateStudentBehaviorHistory(selectedStudent);

    // Merge in any custom incidents logged for this student in `records`
    const studentCustomIncidents = records.filter(
      (r) => Number(r.student_id) === Number(selectedStudent.id) ||
             (r.first_name && selectedStudent.first_name && r.first_name.toLowerCase() === selectedStudent.first_name.toLowerCase())
    );

    const mergedTimeline = [...baseHistory.timeline];
    studentCustomIncidents.forEach((ci) => {
      // Check if already in timeline
      if (!mergedTimeline.some((e) => e.title === ci.title)) {
        mergedTimeline.push({
          id: `CUSTOM-${ci.id}`,
          date: ci.incident_date || '2026-03-25',
          dateBs: '2082-12-12',
          type: ci.incident_type,
          category: ci.incident_type === 'positive' ? 'Academic Excellence' : 'Guidance & Conduct',
          title: ci.title,
          description: ci.description,
          points: Number(ci.points) || 10,
          awardedBy: ci.reported_by_name || 'Class Teacher',
          status: 'Recorded in Official Dossier',
          badge: ci.incident_type === 'positive' ? 'Merit Citation' : null,
        });
      }
    });

    mergedTimeline.sort((a, b) => new Date(b.date) - new Date(a.date));
    const netPoints = mergedTimeline.reduce((acc, curr) => acc + (Number(curr.points) || 0), 0);

    return {
      ...baseHistory,
      netPoints,
      conductGrade: netPoints >= 80 ? 'Exemplary A+' : netPoints >= 60 ? 'Commendable A' : 'Good B+',
      timeline: mergedTimeline,
      totalMerits: mergedTimeline.filter((e) => e.type === 'positive').length,
      totalCounseling: mergedTimeline.filter((e) => e.type !== 'positive').length,
    };
  }, [selectedStudent, records]);

  // Filtered timeline in dossier
  const filteredTimeline = useMemo(() => {
    if (!studentDossier?.timeline) return [];
    if (dossierCategoryFilter === 'all') return studentDossier.timeline;
    if (dossierCategoryFilter === 'positive') return studentDossier.timeline.filter((e) => e.type === 'positive');
    if (dossierCategoryFilter === 'counseling') return studentDossier.timeline.filter((e) => e.type !== 'positive');
    return studentDossier.timeline.filter((e) => e.category?.toLowerCase().includes(dossierCategoryFilter.toLowerCase()));
  }, [studentDossier, dossierCategoryFilter]);

  // Filtered student list for quick selection
  const filteredStudentsForPicker = useMemo(() => {
    return allStudents.filter((s) => {
      if (studentCohortFilter !== 'all') {
        const gradeMatch = s.grade?.toLowerCase().includes(studentCohortFilter.toLowerCase()) ||
                           s.class_name?.toLowerCase().includes(studentCohortFilter.toLowerCase());
        if (!gradeMatch) return false;
      }
      if (studentSearchQuery) {
        const q = studentSearchQuery.toLowerCase();
        const nameMatch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(q);
        const rollMatch = String(s.roll_no || s.rollNo).includes(q);
        const admMatch = (s.admission_no || s.studentId || '').toLowerCase().includes(q);
        return nameMatch || rollMatch || admMatch;
      }
      return true;
    });
  }, [allStudents, studentCohortFilter, studentSearchQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      alert('Please fill incident title.');
      return;
    }

    const targetStudent = allStudents.find((s) => Number(s.id) === Number(form.student_id)) || selectedStudent;
    const newRecord = {
      id: Date.now(),
      incident_date: new Date().toISOString().split('T')[0],
      incident_type: form.incident_type,
      points: form.points,
      title: form.title,
      description: form.description,
      action_taken: form.action_taken,
      guardian_notified: form.guardian_notified,
      reported_by_name: 'Coordinator',
      student_id: targetStudent.id,
      first_name: targetStudent.first_name,
      last_name: targetStudent.last_name,
      class_name: targetStudent.grade || targetStudent.class_name || 'Grade 10',
      roll_no: targetStudent.roll_no || targetStudent.rollNo || 1,
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    localStorage.setItem(LOCAL_STORAGE_BEHAVIOR_KEY, JSON.stringify(updated));

    // Try API
    try {
      await recordBehaviorIncident({
        ...form,
        student_id: targetStudent.id,
      });
    } catch (err) {
      // offline/mock handled
    }

    alert(`Conduct entry logged successfully for ${targetStudent.name || targetStudent.first_name}!`);
    setShowAddModal(false);
    setForm({
      student_id: selectedStudentId,
      incident_type: 'positive',
      title: '',
      points: 10,
      description: '',
      action_taken: 'Commendation certificate awarded',
      guardian_notified: true,
    });
  };

  // Filtered general ledger
  const filteredLedger = records.filter((r) => {
    if (filterType !== 'all' && r.incident_type !== filterType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase().includes(q);
      const matchTitle = (r.title || '').toLowerCase().includes(q);
      return matchName || matchTitle;
    }
    return true;
  });

  // KPI calculations for ledger
  const totalPositive = records.filter((r) => r.incident_type === 'positive').length;
  const totalDisciplinary = records.filter((r) => r.incident_type === 'disciplinary').length;
  const netPoints = records.reduce((sum, r) => sum + (Number(r.points) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {lang === 'ne' ? 'विद्यार्थी आचरण तथा अनुशासन प्रणाली' : 'Student Behavior & Conduct Records'}
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
              Since Joining
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'ne'
              ? 'भर्ना मितिदेखिका सम्पूर्ण आचरण, मेरिट पोइन्ट, पुरस्कार तथा परामर्श अभिलेखहरू'
              : 'Complete historical dossier of merit commendations, discipline logs, and counseling records since admission'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setForm((f) => ({ ...f, student_id: selectedStudentId }));
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ne' ? 'नयाँ आचरण प्रविष्टि' : 'Log Incident / Merit'}</span>
          </button>
        </div>
      </div>

      {/* Primary View Switcher: Dossier (Since Joined) vs Incident Ledger */}
      <div
        className={`flex items-center gap-1 p-1 rounded-2xl border ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}
      >
        <button
          type="button"
          onClick={() => setActiveSubView('dossier')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubView === 'dossier'
              ? 'bg-emerald-600 text-white shadow-md'
              : isDark
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Student Cumulative Dossier (Since Joined)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubView('ledger')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubView === 'ledger'
              ? 'bg-emerald-600 text-white shadow-md'
              : isDark
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Campus Incident & Merit Ledger ({records.length})</span>
        </button>
      </div>

      {/* ================= VIEW 1: STUDENT CUMULATIVE DOSSIER (SINCE JOINED) ================= */}
      {activeSubView === 'dossier' && (
        <div className="space-y-6">
          {/* Cohort & Student Picker Bar */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Cohort Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {['Grade 10', 'Grade 9', 'Grade 11', 'Grade 12', 'all'].map((cohort) => (
                  <button
                    key={cohort}
                    type="button"
                    onClick={() => setStudentCohortFilter(cohort)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      studentCohortFilter === cohort
                        ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/40'
                        : isDark
                        ? 'text-slate-400 hover:text-slate-200 bg-slate-900'
                        : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                    }`}
                  >
                    {cohort === 'all' ? 'All Classes' : cohort}
                  </button>
                ))}
              </div>

              {/* Student Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student by name, roll, or ID..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Quick Student Selector Avatars / Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {filteredStudentsForPicker.slice(0, 15).map((st) => {
                const isSelected = st.id === selectedStudentId;
                const photo =
                  st.photo_url ||
                  st.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(st.name || st.first_name)}&background=0D9488&color=fff`;

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStudentId(st.id)}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                        : isDark
                        ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                    }`}
                  >
                    <img src={photo} alt="" className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20" />
                    <span>{st.name || `${st.first_name} ${st.last_name}`}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{st.roll_no || st.rollNo}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Dossier Overview Hero Card */}
          {selectedStudent && studentDossier && (
            <div
              className={`p-6 sm:p-7 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
                isDark
                  ? 'bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border-slate-800 text-white'
                  : 'bg-gradient-to-br from-white via-emerald-50/20 to-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                {/* Student Identity */}
                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={
                        selectedStudent.photo_url ||
                        selectedStudent.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=0D9488&color=fff&size=200`
                      }
                      alt={selectedStudent.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-emerald-500/30 shadow-md"
                    />
                    <span
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] text-white font-bold"
                      title="Enrolled & In Good Standing"
                    >
                      ✓
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight truncate">
                        {selectedStudent.name || `${selectedStudent.first_name} ${selectedStudent.last_name}`}
                      </h2>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30">
                        {selectedStudent.grade || selectedStudent.class_name} • {selectedStudent.section || selectedStudent.section_name}
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Roll: #{selectedStudent.roll_no || selectedStudent.rollNo}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 mt-2.5 text-xs text-slate-400">
                      <div>
                        <span className="text-slate-500">Admission No:</span>{' '}
                        <span className="font-mono font-semibold text-slate-200">
                          {selectedStudent.admission_no || selectedStudent.studentId || 'ADM-2026'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Enrolled Since:</span>{' '}
                        <strong className="text-emerald-400 font-semibold">{studentDossier.joiningDate}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Campus Tenure:</span>{' '}
                        <span className="text-slate-300 font-medium">{studentDossier.tenure}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Guardian:</span>{' '}
                        <span className="text-slate-300 truncate">{selectedStudent.guardian_name || 'Sunita Sharma'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score telemetry badges */}
                <div className="flex items-center gap-3 shrink-0">
                  <div
                    className={`p-3.5 rounded-2xl border text-center ${
                      isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cumulative Merits</span>
                    <span className="text-2xl font-black font-mono text-emerald-500">
                      +{studentDossier.netPoints}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Total Points</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl border text-center ${
                      isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Conduct Grade</span>
                    <span className="text-2xl font-black text-blue-500">
                      {studentDossier.conductGrade}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Permanent Standing</span>
                  </div>
                </div>
              </div>

              {/* Badges and Citations Showcase */}
              <div className="mt-6 pt-5 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Merit Honors & Badges Earned Since Enrollment</span>
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    {studentDossier.badges.length} Certified Badges
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {studentDossier.badges.map((badge, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-xs hover:scale-105 transition-transform"
                    >
                      <Medal className="w-3.5 h-3.5 text-amber-400" />
                      <span>{badge}</span>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, student_id: selectedStudent.id, incident_type: 'positive' }));
                      setShowAddModal(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Award New Badge / Merit</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Chronological Behavior Timeline Since Joining */}
          {studentDossier && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Chronological Behavior & Achievement Log Since Joining
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {filteredTimeline.length} Entries
                  </span>
                </div>

                {/* Timeline Category Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'All Records' },
                    { id: 'positive', label: 'Merits Only' },
                    { id: 'Academic', label: 'Academics' },
                    { id: 'Science', label: 'STEM & Co-Curricular' },
                    { id: 'Discipline', label: 'Attendance & Conduct' },
                    { id: 'counseling', label: 'Counseling & Guidance' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setDossierCategoryFilter(cat.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        dossierCategoryFilter === cat.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isDark
                          ? 'bg-slate-900 text-slate-400 hover:text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline Cards */}
              <div className="space-y-3">
                {filteredTimeline.length === 0 ? (
                  <div
                    className={`p-8 rounded-2xl border text-center ${
                      isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    No behavior records matching selected filter.
                  </div>
                ) : (
                  filteredTimeline.map((entry) => {
                    const isPositive = entry.type === 'positive';
                    return (
                      <div
                        key={entry.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all text-xs ${
                          isPositive
                            ? isDark
                              ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40'
                              : 'bg-white border-slate-200 hover:border-emerald-500/40 shadow-xs'
                            : isDark
                            ? 'bg-amber-950/20 border-amber-500/30'
                            : 'bg-amber-50/50 border-amber-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                isPositive
                                  ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {isPositive ? `+${entry.points} Merits` : `${entry.points} Points`}
                            </span>
                            <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {entry.title}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 font-semibold">
                              {entry.category}
                            </span>
                            {entry.badge && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                                <Medal className="w-3 h-3 text-amber-400" />
                                {entry.badge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono shrink-0">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{entry.date} ({entry.dateBs} BS)</span>
                          </div>
                        </div>

                        <p className={`mt-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {entry.description}
                        </p>

                        <div className={`mt-3 pt-2.5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] ${
                          isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                        }`}>
                          <span>
                            Logged By: <strong className={isDark ? 'text-slate-300' : 'text-slate-800'}>{entry.awardedBy}</strong>
                          </span>
                          <span className="font-semibold text-emerald-500 dark:text-emerald-400">
                            ✓ {entry.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 2: CAMPUS INCIDENT & MERIT LEDGER ================= */}
      {activeSubView === 'ledger' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Commendations (Merits)</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400">{totalPositive}</div>
              <div className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Excellence in academics & leadership</div>
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Disciplinary Cases</span>
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black mt-2 text-rose-600 dark:text-rose-400">{totalDisciplinary}</div>
              <div className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Classroom disruption & uniform breach</div>
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Campus Net Conduct Score</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <HeartHandshake className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black mt-2 text-blue-600 dark:text-blue-400">+{netPoints} pts</div>
              <div className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Cumulative student conduct balance</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['all', 'positive', 'disciplinary', 'counseling'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    filterType === t
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search student or incident..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Table */}
          <div
            className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead
                  className={`uppercase tracking-wider font-bold text-[10px] border-b ${
                    isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700 font-bold'
                  }`}
                >
                  <tr>
                    <th className="px-4 py-3">Incident Date</th>
                    <th className="px-4 py-3">Student Name (Click to View History)</th>
                    <th className="px-4 py-3">Type & Points</th>
                    <th className="px-4 py-3">Incident Title & Description</th>
                    <th className="px-4 py-3">Action Taken</th>
                    <th className="px-4 py-3">Guardian</th>
                    <th className="px-4 py-3">Reported By</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
                  {filteredLedger.length === 0 ? (
                    <tr>
                      <td colSpan="7" className={`px-4 py-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        No behavior records matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLedger.map((r) => {
                      const isPositive = r.incident_type === 'positive';
                      const isDisciplinary = r.incident_type === 'disciplinary';
                      return (
                        <tr
                          key={r.id}
                          className={`transition-colors cursor-pointer ${
                            isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'
                          }`}
                          onClick={() => {
                            if (r.student_id) setSelectedStudentId(Number(r.student_id));
                            setActiveSubView('dossier');
                          }}
                        >
                          <td className={`px-4 py-3 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{r.incident_date}</td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-emerald-500 hover:underline flex items-center gap-1.5">
                              <span>{r.first_name} {r.last_name}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </div>
                            <div className={`text-[10px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {r.class_name || 'Class 10'} • Roll #{r.roll_no || 1}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isPositive
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                  : isDisciplinary
                                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                  : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                              }`}
                            >
                              {isPositive ? `+${r.points} Merits` : `${r.points} Demerits`}
                            </span>
                          </td>
                          <td className="px-4 py-3 max-w-sm">
                            <div className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{r.title}</div>
                            <div className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{r.description}</div>
                          </td>
                          <td className={`px-4 py-3 font-medium ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                            {r.action_taken || 'Counseling advised'}
                          </td>
                          <td className="px-4 py-3">
                            {r.guardian_notified ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                NOTIFIED
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">Internal</span>
                            )}
                          </td>
                          <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{r.reported_by_name || 'Coordinator'}</td>
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base font-bold">Log Student Conduct / Merit Recognition</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className={`cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Student selector */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                  Target Student *
                </label>
                <select
                  value={form.student_id}
                  onChange={(e) => setForm({ ...form, student_id: Number(e.target.value) })}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  {allStudents.slice(0, 50).map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name || `${st.first_name} ${st.last_name}`} ({st.grade || 'Grade 10'} • Roll #{st.roll_no || st.rollNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Incident Type</label>
                  <select
                    value={form.incident_type}
                    onChange={(e) => {
                      const t = e.target.value;
                      setForm({
                        ...form,
                        incident_type: t,
                        points: t === 'positive' ? 10 : -5,
                      });
                    }}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="positive">Positive Merit (+)</option>
                    <option value="disciplinary">Disciplinary Demerit (-)</option>
                    <option value="counseling">Counseling Session</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Points Value</label>
                  <input
                    type="number"
                    value={form.points}
                    onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Incident / Achievement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Olympiad Medalist or Dress Code Violation"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Detailed Description</label>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Facts, witness statements, or achievements..."
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Action Taken / Resolution</label>
                <input
                  type="text"
                  value={form.action_taken}
                  onChange={(e) => setForm({ ...form, action_taken: e.target.value })}
                  placeholder="e.g. Issued commendation certificate or warning letter"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="notifyGuardian"
                  checked={form.guardian_notified}
                  onChange={(e) => setForm({ ...form, guardian_notified: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="notifyGuardian" className={`font-semibold cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Notify Guardian via In-App Alert & SMS
                </label>
              </div>

              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-xl border cursor-pointer ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BehaviorRecordsTab;
