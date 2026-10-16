import React, { useState, useEffect } from 'react';
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
  LogOut,
  GraduationCap,
  Layers,
  School,
  RefreshCw,
} from 'lucide-react';
import { useSiteData } from '../context/SiteContext';
import { useSchoolData } from '../context/SchoolDataContext';
import { saveAttendance } from '../services/api';
import TeacherLoginScreen from './portal/TeacherLoginScreen';
import {
  generateDefaultSchoolStudents,
  DEFAULT_GRADE_10_STUDENTS,
  DEFAULT_GRADE_9_STUDENTS,
  DEFAULT_GRADE_11_STUDENTS,
  DEFAULT_GRADE_12_STUDENTS,
} from '../data/mockStudentDirectory';
import {
  EXAM_TERMS,
  GRADE_10_SUBJECTS,
  calculateNepalCdcGrade,
  getExamTermsStatus,
  setExamTermStatus,
  saveTeacherSubjectMarks,
  getTeacherSubjectMarks,
} from '../data/mockExamResults';

const FACULTY_DIRECTORY = [
  {
    id: 'TCH-102',
    name: 'RJ Rana',
    email: 'rj.rana@alchemist.edu.np',
    role: 'Senior Academic Guide & Mathematics Coordinator',
    subject: 'Compulsory Mathematics',
    secondarySubject: 'Optional Mathematics',
    primaryClass: 'Grade 10 - Section A',
    assignedClasses: ['Grade 10 - Section A', 'Grade 10 - Section B', 'Grade 9 - Section A'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    color: 'from-blue-600 to-indigo-700',
    tag: 'Math Lead',
  },
  {
    id: 'TCH-103',
    name: 'Mandira Adhikari',
    email: 'mandira.adhikari@alchemist.edu.np',
    role: 'Department Head & Senior Nepali Faculty',
    subject: 'Nepali Language & Literature',
    secondarySubject: 'Nepali Grammar',
    primaryClass: 'Grade 10 - Section B',
    assignedClasses: ['Grade 10 - Section A', 'Grade 10 - Section B', 'Grade 9 - Section A'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    color: 'from-amber-600 to-rose-600',
    tag: 'Nepali Specialist',
  },
  {
    id: 'TCH-104',
    name: 'Bikram Karki',
    email: 'bikram.karki@alchemist.edu.np',
    role: 'Science Laboratory In-Charge & Class Mentor',
    subject: 'Compulsory Science & Technology',
    secondarySubject: 'Environmental Science',
    primaryClass: 'Grade 9 - Section A',
    assignedClasses: ['Grade 9 - Section A', 'Grade 10 - Section A', 'Grade 10 - Section B'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    color: 'from-emerald-600 to-teal-700',
    tag: 'Science Lead',
  },
  {
    id: 'TCH-105',
    name: 'Dr. K. Acharya',
    email: 'dr.acharya@alchemist.edu.np',
    role: 'Higher Secondary Academic Coordinator',
    subject: 'Physics & Advanced STEM',
    secondarySubject: 'Applied Chemistry',
    primaryClass: 'Grade 11 - Section A (Bio-Math)',
    assignedClasses: ['Grade 11 - Section A (Bio-Math)', 'Grade 12 - Section A (Accounts & Eco)'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    color: 'from-purple-600 to-indigo-800',
    tag: '+2 Science Head',
  },
  {
    id: 'TCH-106',
    name: 'Suman Shrestha',
    email: 'suman.shrestha@alchemist.edu.np',
    role: 'Social Studies & Moral Education Lead',
    subject: 'Social Studies & Life Skills',
    secondarySubject: 'Civics',
    primaryClass: 'Grade 10 - Section B',
    assignedClasses: ['Grade 10 - Section B', 'Grade 9 - Section A'],
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    color: 'from-cyan-600 to-blue-700',
    tag: 'Social Studies',
  },
];

const COHORT_OPTIONS = [
  { id: 'g10-a', classId: 1, className: 'Grade 10', section: 'Section A', label: 'Grade 10 - Section A (18 Students)' },
  { id: 'g10-b', classId: 1, className: 'Grade 10', section: 'Section B', label: 'Grade 10 - Section B (18 Students)' },
  { id: 'g10-all', classId: 1, className: 'Grade 10', section: 'all', label: 'Grade 10 - All Cohorts (36 Students)' },
  { id: 'g9-a', classId: 2, className: 'Grade 9', section: 'Section A', label: 'Grade 9 - Section A (32 Students)' },
  { id: 'g11-sci', classId: 3, className: 'Grade 11 - Science', section: 'Section A (Bio-Math)', label: 'Grade 11 - Science (28 Students)' },
  { id: 'g12-mgmt', classId: 4, className: 'Grade 12 - Management', section: 'Section A (Accounts & Eco)', label: 'Grade 12 - Management (25 Students)' },
];

const getDefaultRoutineForTeacher = (facultyName = '') => {
  if (facultyName.includes('Mandira')) {
    return [
      { period: '1st Period', time: '09:30 - 10:15 AM', subject: 'Nepali Grammar & Composition', class: 'Grade 9 - Section A', room: 'Hall 201' },
      { period: '2nd Period', time: '10:15 - 11:00 AM', subject: 'Compulsory Nepali Literature', class: 'Grade 10 - Section A', room: 'Hall 302' },
      { period: '3rd Period', time: '11:00 - 11:45 AM', subject: 'Compulsory Nepali Literature', class: 'Grade 10 - Section B', room: 'Hall 304' },
      { period: 'Break', time: '11:45 - 12:20 PM', subject: 'Staff Lunch & Academic Meeting', class: 'Staff Lounge', room: 'Teachers Common Room' },
      { period: '4th Period', time: '12:20 - 01:05 PM', subject: 'Creative Writing & Drama Club', class: 'Secondary Cohort', room: 'Auditorium' },
      { period: '6th Period', time: '01:50 - 02:35 PM', subject: 'Language Remedial & Consultation', class: 'Grade 10 Doubt Desk', room: 'Room 205' },
    ];
  }
  if (facultyName.includes('Bikram')) {
    return [
      { period: '1st Period', time: '09:30 - 10:15 AM', subject: 'Compulsory Science Theory', class: 'Grade 10 - Section B', room: 'Hall 304' },
      { period: '2nd Period', time: '10:15 - 11:00 AM', subject: 'Physics & Chemistry Practical', class: 'Grade 10 - Section A', room: 'Sci Lab 1' },
      { period: 'Break', time: '11:45 - 12:20 PM', subject: 'Staff Lunch & Lab Maintenance', class: 'Science Directorate', room: 'Sci Prep Room' },
      { period: '4th Period', time: '12:20 - 01:05 PM', subject: 'Compulsory Science & Technology', class: 'Grade 9 - Section A', room: 'Hall 201' },
      { period: '5th Period', time: '01:05 - 01:50 PM', subject: 'Environmental Science & Eco Club', class: 'Eco Rangers', room: 'Hall 201' },
    ];
  }
  if (facultyName.includes('Acharya')) {
    return [
      { period: '2nd Period', time: '10:15 - 11:00 AM', subject: 'Higher Secondary Physics (+2)', class: 'Grade 11 - Section A', room: 'Sci Lab 1' },
      { period: '3rd Period', time: '11:00 - 11:45 AM', subject: 'Mechanics & Thermodynamics', class: 'Grade 12 - Management', room: 'Hall 401' },
      { period: 'Break', time: '11:45 - 12:20 PM', subject: 'Faculty Refreshment', class: 'Senior Faculty Room', room: 'Suite 201' },
      { period: '5th Period', time: '01:05 - 01:50 PM', subject: 'Advanced STEM & Robotics Lab', class: 'Grade 11 & 12', room: 'STEM Lab' },
    ];
  }
  // Default RJ Rana (Mathematics)
  return [
    { period: '1st Period', time: '09:30 - 10:15 AM', subject: 'Compulsory Mathematics', class: 'Grade 10 - Section A', room: 'Hall 302' },
    { period: '2nd Period', time: '10:15 - 11:00 AM', subject: 'Compulsory Mathematics', class: 'Grade 9 - Section A', room: 'Hall 201' },
    { period: '3rd Period', time: '11:00 - 11:45 AM', subject: 'Optional Mathematics', class: 'Grade 10 - Section B', room: 'Hall 304' },
    { period: 'Break', time: '11:45 - 12:20 PM', subject: 'Staff Lunch & Faculty Meeting', class: 'Teachers Common Room', room: 'Staff Lounge' },
    { period: '5th Period', time: '01:05 - 01:50 PM', subject: 'Mathematics Doubts & SEE Prep', class: 'Grade 10 - Section A', room: 'Hall 302' },
    { period: '7th Period', time: '02:35 - 03:20 PM', subject: 'Advanced Vedic Math & Olympiad', class: 'Co-Curricular Group', room: 'STEM Lab' },
  ];
};

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

  // Active Teacher Profile State
  const [activeFaculty, setActiveFaculty] = useState(() => {
    try {
      const sess = sessionStorage.getItem('_aa_teacher_auth_session');
      if (sess) {
        const parsed = JSON.parse(sess);
        if (parsed.teacherName) {
          return {
            id: parsed.teacherId || 'TCH-102',
            name: parsed.teacherName,
            email: parsed.teacherEmail || 'rj.rana@alchemist.edu.np',
            role: parsed.teacherRole || 'Senior Academic Guide',
            subject: parsed.teacherSubject || 'Compulsory Mathematics',
            primaryClass: parsed.primaryClass || 'Grade 10 - Section A',
            assignedClasses: parsed.assignedClasses || ['Grade 10 - Section A', 'Grade 10 - Section B', 'Grade 9 - Section A'],
            avatar: parsed.teacherAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
          };
        }
      }
    } catch (e) {}
    return {
      id: teacher?.id || 'TCH-102',
      name: teacher?.name || 'RJ Rana',
      email: teacher?.email || 'rj.rana@alchemist.edu.np',
      role: teacher?.title || 'Senior Academic Guide & Mathematics Coordinator',
      subject: 'Compulsory Mathematics',
      primaryClass: 'Grade 10 - Section A',
      assignedClasses: ['Grade 10 - Section A', 'Grade 10 - Section B', 'Grade 9 - Section A'],
      avatar: teacher?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    };
  });

  // Teacher Authentication Session Gate
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const sess = sessionStorage.getItem('_aa_teacher_auth_session');
      return sess ? Boolean(JSON.parse(sess)?.authenticated) : false;
    } catch (e) {
      return false;
    }
  });

  const handleLogout = () => {
    sessionStorage.removeItem('_aa_teacher_auth_session');
    setIsAuthenticated(false);
  };

  const handleSwitchFaculty = (faculty) => {
    setActiveFaculty(faculty);
    sessionStorage.setItem(
      '_aa_teacher_auth_session',
      JSON.stringify({
        authenticated: true,
        teacherId: faculty.id,
        teacherName: faculty.name,
        teacherEmail: faculty.email,
        teacherRole: faculty.role,
        teacherSubject: faculty.subject,
        teacherAvatar: faculty.avatar,
        primaryClass: faculty.primaryClass,
        assignedClasses: faculty.assignedClasses,
        timestamp: Date.now(),
      })
    );
  };

  // Active Workspace Tab: 'attendance' | 'assignments' | 'gradebook' | 'doubts' | 'routine'
  const [activeTab, setActiveTab] = useState('attendance');

  // Storage Keys
  const ATTENDANCE_STORAGE_KEY = 'alchemist_sms_daily_attendance_records_v1';
  const ROUTINE_STORAGE_KEY = 'alchemist_sms_teacher_routines_v1';

  // Attendance form & Cohort state
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedCohortId, setSelectedCohortId] = useState('g10-a');
  const [roster, setRoster] = useState([]);
  const [attendanceSubmittedNotice, setAttendanceSubmittedNotice] = useState(false);

  // Dynamic Routine state loaded from Admin Management
  const [routineList, setRoutineList] = useState(() => {
    try {
      const raw = localStorage.getItem(ROUTINE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed[activeFaculty.name] || parsed[activeFaculty.id]) {
          return parsed[activeFaculty.name] || parsed[activeFaculty.id];
        }
      }
    } catch (e) {}
    return getDefaultRoutineForTeacher(activeFaculty.name);
  });

  // Helper to load cohort students and check existing saved attendance
  const loadRosterForCohort = (cohortId, dateToLoad = attendanceDate) => {
    const selected = COHORT_OPTIONS.find((c) => c.id === cohortId) || COHORT_OPTIONS[0];
    let allStudents = [];
    try {
      const raw = localStorage.getItem('alchemist_sms_students_cache_v1');
      if (raw) allStudents = JSON.parse(raw);
    } catch (e) {}
    if (!allStudents || allStudents.length < 36) {
      allStudents = generateDefaultSchoolStudents();
    }

    let cohortStudents = [];
    if (selected.classId === 1) {
      if (selected.section === 'Section A') {
        cohortStudents = allStudents.filter(
          (s) =>
            (String(s.class_id) === '1' || (s.class_name && s.class_name.includes('10'))) &&
            (String(s.section).includes('A') || String(s.section_name).includes('A'))
        );
      } else if (selected.section === 'Section B') {
        cohortStudents = allStudents.filter(
          (s) =>
            (String(s.class_id) === '1' || (s.class_name && s.class_name.includes('10'))) &&
            (String(s.section).includes('B') || String(s.section_name).includes('B'))
        );
      } else {
        cohortStudents = allStudents.filter(
          (s) => String(s.class_id) === '1' || (s.class_name && s.class_name.includes('10'))
        );
      }
    } else if (selected.classId === 2) {
      cohortStudents = allStudents.filter(
        (s) => String(s.class_id) === '2' || (s.class_name && s.class_name.includes('9'))
      );
    } else if (selected.classId === 3) {
      cohortStudents = allStudents.filter(
        (s) => String(s.class_id) === '3' || (s.class_name && s.class_name.includes('11'))
      );
    } else if (selected.classId === 4) {
      cohortStudents = allStudents.filter(
        (s) => String(s.class_id) === '4' || (s.class_name && s.class_name.includes('12'))
      );
    }

    if (cohortStudents.length === 0) {
      cohortStudents = DEFAULT_GRADE_10_STUDENTS.slice(0, 18);
    }

    // Check if attendance already recorded in alchemist_sms_daily_attendance_records_v1
    let savedRosterMap = new Map();
    try {
      const rawAtt = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      if (rawAtt) {
        const parsed = JSON.parse(rawAtt);
        const dayRecord = parsed[dateToLoad]?.[selected.classId];
        if (dayRecord && Array.isArray(dayRecord.roster)) {
          dayRecord.roster.forEach((r) => savedRosterMap.set(String(r.student_id || r.roll_no), r));
        }
      }
    } catch (e) {}

    const mapped = cohortStudents.map((st, idx) => {
      const saved = savedRosterMap.get(String(st.id || st.admission_no || st.roll_no));
      const roll = st.roll_no || st.rollNo || idx + 1;
      const status = saved?.attendance_status || saved?.status || 'present';
      const note = saved?.attendance_remarks || saved?.remarks || 'Punctual';
      return {
        rollNo: roll,
        id: st.id || st.admission_no || `STU-${roll}`,
        admissionNo: st.admission_no || `ADM-2026-${roll}`,
        name: st.name || `${st.first_name || ''} ${st.last_name || ''}`.trim(),
        gender: st.gender === 'male' || st.gender === 'Male' ? 'Male' : 'Female',
        contact: st.guardian_phone || st.phone || '9841234567',
        guardian: st.guardian_name || 'Guardian',
        attendanceStatus: status,
        attendanceNote: note,
        examTheory: 68 + (idx % 8),
        examPractical: 23 + (idx % 3),
        photo_url: st.photo_url || st.avatar,
        avatar: st.avatar || st.photo_url,
      };
    });

    setRoster(mapped);
    setGradebookData(mapped);
    return mapped;
  };

  // Sync effect when date, cohort, or active faculty changes
  useEffect(() => {
    loadRosterForCohort(selectedCohortId, attendanceDate);
    setRoutineList(getDefaultRoutineForTeacher(activeFaculty.name));

    const syncFromManagement = () => {
      try {
        const routineRaw = localStorage.getItem(ROUTINE_STORAGE_KEY);
        if (routineRaw) {
          const parsedRoutine = JSON.parse(routineRaw);
          const found = parsedRoutine[activeFaculty.name] || parsedRoutine[activeFaculty.id];
          if (found && Array.isArray(found) && found.length > 0) {
            setRoutineList(found);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('alchemist_sms_attendance_updated', syncFromManagement);
    window.addEventListener('alchemist_sms_routine_updated', syncFromManagement);
    window.addEventListener('storage', syncFromManagement);
    return () => {
      window.removeEventListener('alchemist_sms_attendance_updated', syncFromManagement);
      window.removeEventListener('alchemist_sms_routine_updated', syncFromManagement);
      window.removeEventListener('storage', syncFromManagement);
    };
  }, [attendanceDate, selectedCohortId, activeFaculty.name]);

  // Homework Modal State
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

  // Gradebook / Terminal Marks Multi-Term & Subject State
  const SUBJECT_CODE_MAP = {
    'Compulsory Mathematics': 'MTH-103',
    'Compulsory Science & Technology': 'SCI-104',
    'Compulsory English': 'ENG-101',
    'Compulsory Nepali': 'NEP-102',
    'Social Studies & Life Skills': 'SOC-105',
    'Optional I: Additional Mathematics': 'OPT-106',
    'Optional II: Computer Science': 'OPT-107',
  };

  const [selectedExamTermId, setSelectedExamTermId] = useState('term-2083-1');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState(() => {
    return SUBJECT_CODE_MAP[activeFaculty.subject] || 'MTH-103';
  });
  const [examTermsStatus, setExamTermsStatus] = useState(() => getExamTermsStatus());
  const [releaseActionNotice, setReleaseActionNotice] = useState('');
  const [gradebookData, setGradebookData] = useState([]);
  const [gradebookSavedNotice, setGradebookSavedNotice] = useState(false);

  // Sync exam terms status from events
  useEffect(() => {
    const handleUpdate = () => {
      setExamTermsStatus(getExamTermsStatus());
    };
    window.addEventListener('alchemist_exam_results_updated', handleUpdate);
    return () => window.removeEventListener('alchemist_exam_results_updated', handleUpdate);
  }, []);

  // Sync gradebook data whenever cohort, term, or subject changes
  useEffect(() => {
    const selectedCohort = COHORT_OPTIONS.find((c) => c.id === selectedCohortId) || COHORT_OPTIONS[0];
    const existing = getTeacherSubjectMarks(
      selectedExamTermId,
      selectedCohort.classId,
      selectedCohort.section,
      selectedSubjectCode
    );

    if (existing && Array.isArray(existing) && existing.length > 0) {
      const merged = roster.map((st) => {
        const found = existing.find((m) => Number(m.rollNo) === Number(st.rollNo));
        return {
          ...st,
          examTheory: found ? found.theory : 60,
          examPractical: found ? found.practical : 24,
          remarks: found ? found.remarks : 'Consistent effort',
        };
      });
      setGradebookData(merged);
    } else {
      // Baseline calculation for term
      const baseline = roster.map((st) => {
        const roll = Number(st.rollNo || 1);
        let defaultTh = Math.min(75, 58 + (roll % 14));
        let defaultPr = 24;
        if (selectedExamTermId === 'term-2083-mid') defaultTh = Math.min(75, 61 + (roll % 12));
        if (selectedExamTermId === 'term-2083-third') defaultTh = Math.min(75, 63 + (roll % 10));
        if (selectedExamTermId === 'term-2083-final') defaultTh = Math.min(75, 65 + (roll % 9));
        return {
          ...st,
          examTheory: defaultTh,
          examPractical: defaultPr,
          remarks: 'Good analytical understanding',
        };
      });
      setGradebookData(baseline);
    }
  }, [selectedCohortId, selectedExamTermId, selectedSubjectCode, roster]);

  // Faculty ID Card modal state
  const [showFacultyIDModal, setShowFacultyIDModal] = useState(false);

  // Teacher reply state for doubts
  const [replyInput, setReplyInput] = useState('');

  // Helper to calculate Grade and GPA from total marks (out of 100)
  const calculateGradeAndGpa = (total) => {
    return calculateNepalCdcGrade(total);
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

  const handleSubmitAttendance = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    submitTeacherRollCall(roster, attendanceDate);

    const selectedCohort = COHORT_OPTIONS.find((c) => c.id === selectedCohortId) || COHORT_OPTIONS[0];
    const targetClassId = selectedCohort.classId;
    const targetClassName = selectedCohort.className;

    // 1. Calculate live counts
    const totalCount = roster.length;
    const presentCount = roster.filter((s) => s.attendanceStatus === 'present').length;
    const absentCount = roster.filter((s) => s.attendanceStatus === 'absent').length;
    const lateCount = roster.filter((s) => s.attendanceStatus === 'late').length;
    const rate = totalCount > 0 ? Number(((presentCount / totalCount) * 100).toFixed(1)) : 0;

    const formattedRecords = roster.map((s) => ({
      student_id: s.id || s.rollNo,
      roll_no: s.rollNo,
      first_name: s.name ? s.name.split(' ')[0] : 'Student',
      last_name: s.name ? s.name.split(' ').slice(1).join(' ') : `#${s.rollNo}`,
      admission_no: s.admissionNo || `AA-2026-${1000 + s.rollNo}`,
      section: selectedCohort.section === 'all' ? 'Section A' : selectedCohort.section,
      guardian_phone: s.contact || '9841000000',
      attendance_status: s.attendanceStatus || 'present',
      attendance_remarks: s.attendanceNote || '',
    }));

    // 2. Persist to unified localStorage so SMS dashboard and Admin Attendance Cards update instantly
    try {
      const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      const attendanceMap = raw ? JSON.parse(raw) : {};
      if (!attendanceMap[attendanceDate]) {
        attendanceMap[attendanceDate] = {};
      }

      // Merge with existing records for this class if partial section
      const existingClassRecord = attendanceMap[attendanceDate]?.[targetClassId] || {};
      const existingRoster = existingClassRecord.roster || [];
      const updatedRosterMap = new Map();
      existingRoster.forEach((r) => updatedRosterMap.set(String(r.student_id || r.roll_no), r));
      formattedRecords.forEach((r) => updatedRosterMap.set(String(r.student_id || r.roll_no), r));
      const mergedRoster = Array.from(updatedRosterMap.values());

      const mergedTotal = mergedRoster.length;
      const mergedPresent = mergedRoster.filter((s) => s.attendance_status === 'present').length;
      const mergedAbsent = mergedRoster.filter((s) => s.attendance_status === 'absent').length;
      const mergedLate = mergedRoster.filter((s) => s.attendance_status === 'late').length;
      const mergedRate = mergedTotal > 0 ? Number(((mergedPresent / mergedTotal) * 100).toFixed(1)) : 0;

      attendanceMap[attendanceDate][targetClassId] = {
        class_id: targetClassId,
        class_name: targetClassName,
        status: 'marked',
        marked_by: `${activeFaculty.name} (${activeFaculty.subject})`,
        marked_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        total: mergedTotal,
        present: mergedPresent,
        absent: mergedAbsent,
        late: mergedLate,
        rate: mergedRate,
        roster: mergedRoster,
      };
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendanceMap));

      // Dispatch real-time sync event to SMS tab
      window.dispatchEvent(
        new CustomEvent('alchemist_sms_attendance_updated', {
          detail: { date: attendanceDate, classId: targetClassId, records: mergedRoster, rate: mergedRate },
        })
      );
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.warn('LocalStorage attendance sync error:', err);
    }

    // 3. Persist to backend
    try {
      const apiRecords = roster.map((s) => ({
        student_id: s.id || s.rollNo,
        status: s.attendanceStatus || 'present',
        remarks: s.attendanceNote || '',
      }));
      await saveAttendance(attendanceDate, apiRecords, 'daily');
    } catch (err) {
      console.warn('Backend attendance sync:', err);
    }

    setAttendanceSubmittedNotice(true);
    setTimeout(() => setAttendanceSubmittedNotice(false), 4000);
  };

  // Gradebook Inline Theory / Practical Marks Change
  const handleGradebookChange = (rollNo, field, val) => {
    const updated = gradebookData.map((s) => {
      if (s.rollNo === rollNo) {
        return {
          ...s,
          [field]: field === 'remarks' ? val : Math.max(0, Number(val) || 0),
        };
      }
      return s;
    });
    setGradebookData(updated);
  };

  const handleAutoFillPracticals = (defaultVal = 25) => {
    const updated = gradebookData.map((s) => ({
      ...s,
      examPractical: defaultVal,
    }));
    setGradebookData(updated);
  };

  const handleSaveGradebook = () => {
    const selectedCohort = COHORT_OPTIONS.find((c) => c.id === selectedCohortId) || COHORT_OPTIONS[0];
    const marksList = gradebookData.map((s) => ({
      rollNo: s.rollNo,
      studentId: s.id || s.rollNo,
      name: s.name,
      theory: Number(s.examTheory) || 0,
      practical: Number(s.examPractical) || 0,
      remarks: s.remarks || 'Consistent effort',
    }));

    saveTeacherSubjectMarks(
      selectedExamTermId,
      selectedCohort.classId,
      selectedCohort.section,
      selectedSubjectCode,
      marksList,
      activeFaculty.name
    );

    updateExamMarksheet(gradebookData);
    setGradebookSavedNotice(true);
    setTimeout(() => setGradebookSavedNotice(false), 3500);
  };

  const handleToggleReleaseTerm = () => {
    const currentStatus = examTermsStatus[selectedExamTermId]?.status || 'draft';
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
    const updated = setExamTermStatus(selectedExamTermId, nextStatus, activeFaculty.name);
    setExamTermsStatus(updated);
    setReleaseActionNotice(
      nextStatus === 'published'
        ? `Result for ${selectedExamTermId} has been successfully RELEASED! It is now visible live to students on their portal.`
        : `Result for ${selectedExamTermId} has been REVERTED TO DRAFT. It is now hidden from students while grading is completed.`
    );
    setTimeout(() => setReleaseActionNotice(''), 5000);
  };

  // Send Teacher Consultation Message
  const handleTeacherReply = (e) => {
    e.preventDefault();
    if (!replyInput.trim()) return;
    sendDoubtMessage('teacher', replyInput.trim());
    setReplyInput('');
  };

  if (!isAuthenticated) {
    return (
      <TeacherLoginScreen
        onLoginSuccess={(selectedFaculty) => {
          if (selectedFaculty) setActiveFaculty(selectedFaculty);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  // Live Attendance KPIs for currently viewed cohort
  const totalStudents = roster.length;
  const presentCount = roster.filter((s) => s.attendanceStatus === 'present').length;
  const absentCount = roster.filter((s) => s.attendanceStatus === 'absent').length;
  const lateCount = roster.filter((s) => s.attendanceStatus === 'late').length;
  const attendanceRate = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : '100.0';

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
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
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

              <button
                type="button"
                onClick={() => navigateTo('sms')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-sm"
                title="Return to SMS Management Dashboard"
              >
                <School className="w-3.5 h-3.5" />
                <span>SMS Dashboard</span>
              </button>

              <div className="h-6 w-px bg-slate-300 dark:bg-slate-800 hidden sm:block" />

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-sm sm:text-base tracking-tight truncate">
                      Teacher Cockpit
                    </h1>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 shrink-0">
                      Academic Suite
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {branding.name} • Live School Management Sync
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Faculty Switcher & Controls */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Faculty Switcher Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs">
                <span className="text-slate-400 hidden xl:inline">Faculty:</span>
                <select
                  value={activeFaculty.id}
                  onChange={(e) => {
                    const chosen = FACULTY_DIRECTORY.find((f) => f.id === e.target.value);
                    if (chosen) handleSwitchFaculty(chosen);
                  }}
                  className="bg-transparent font-bold text-blue-600 dark:text-blue-400 outline-none cursor-pointer"
                >
                  {FACULTY_DIRECTORY.map((f) => (
                    <option key={f.id} value={f.id} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                      {f.name} ({f.tag})
                    </option>
                  ))}
                </select>
              </div>

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
                onClick={toggleTheme}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors border cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 transition-all cursor-pointer"
                title="Lock Session & Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Sign Out</span>
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
              : 'bg-gradient-to-br from-white via-blue-50/20 to-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={activeFaculty.avatar}
                  alt={activeFaculty.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-blue-500/30 shadow-md"
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
                    {activeFaculty.name}
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {activeFaculty.subject}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {activeFaculty.primaryClass}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500">Faculty ID:</span>{' '}
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                      {activeFaculty.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500">Designation:</span>{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Class Mentor</span>
                  </div>
                  <div className="col-span-2 truncate">
                    <span className="text-slate-400 dark:text-slate-500">Email:</span>{' '}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {activeFaculty.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Multi-Class Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                Assigned Classes:
              </span>
              {(activeFaculty.assignedClasses || []).map((clsName) => (
                <span
                  key={clsName}
                  className="px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-xs"
                >
                  {clsName}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
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
                    ? 'bg-blue-600 text-white shadow-md'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-white text-blue-600'
                        : isDark
                        ? 'bg-slate-800 text-blue-400'
                        : 'bg-blue-100 text-blue-700'
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
              {/* Header with Cohort & Date Pickers */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    <span>Daily Roll Call Attendance</span>
                    <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      {activeFaculty.subject}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select any cohort to take attendance. Changes synchronize live to School Management System & parent mobile apps.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Cohort Selector */}
                  <div className="flex items-center gap-1.5 bg-slate-950/80 dark:bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-slate-400">Class:</span>
                    <select
                      value={selectedCohortId}
                      onChange={(e) => setSelectedCohortId(e.target.value)}
                      className="bg-transparent font-bold text-white outline-none cursor-pointer"
                    >
                      {COHORT_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Input */}
                  <div className="flex items-center gap-1.5 bg-slate-950/80 dark:bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="bg-transparent font-mono font-semibold outline-none cursor-pointer"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMarkAll('present')}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Mark All Present
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMarkAll('absent')}
                    className="px-3 py-2 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* KPI Telemetry Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-5">
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Students</span>
                  <span className="text-xl font-bold font-mono text-white mt-1 block">{totalStudents}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Present</span>
                  <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">{presentCount}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Absent</span>
                  <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">{absentCount}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Late</span>
                  <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">{lateCount}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Attendance Rate</span>
                  <span className="text-xl font-bold font-mono text-blue-400 mt-1 block">{attendanceRate}%</span>
                </div>
              </div>

              {attendanceSubmittedNotice && (
                <div className="my-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>
                      Daily roll call for {attendanceDate} saved & synchronized live to School Management System & Student Badges!
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    LIVE SYNCED
                  </span>
                </div>
              )}

              {/* Roster Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr
                      className={`border-b text-slate-400 uppercase text-[11px] tracking-wider ${
                        isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <th className="py-3 px-4">Roll</th>
                      <th className="py-3 px-4">Student Name & Photo</th>
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
                        <tr key={s.id || s.rollNo} className="hover:bg-slate-500/5 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-400">#{s.rollNo}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">
                            <div className="flex items-center gap-3">
                              <img
                                src={s.photo_url || s.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=0D9488&color=fff&size=80`}
                                alt={s.name}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                              />
                              <div>
                                <span>{s.name}</span>
                                <span className="block text-[11px] font-normal text-slate-400 font-mono">
                                  {s.admissionNo} • {s.gender}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleStudentAttendance(s.rollNo, 'present')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  isPresent
                                    ? 'bg-emerald-600 text-white shadow-xs scale-105'
                                    : 'border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-emerald-500'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleStudentAttendance(s.rollNo, 'late')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  isLate
                                    ? 'bg-amber-500 text-white shadow-xs scale-105'
                                    : 'border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-amber-500'
                                }`}
                              >
                                Late
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleStudentAttendance(s.rollNo, 'absent')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  isAbsent
                                    ? 'bg-rose-600 text-white shadow-xs scale-105'
                                    : 'border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-rose-500'
                                }`}
                              >
                                Absent
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={s.attendanceNote}
                              onChange={(e) => handleUpdateStudentNote(s.rollNo, e.target.value)}
                              placeholder="e.g. Punctual, Sick note, Bus delayed..."
                              className={`w-full max-w-xs px-2.5 py-1 rounded-lg border text-xs outline-none ${
                                isDark
                                  ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-400'
                                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500'
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

              {/* Submit & Sync Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
                <span className="text-xs text-slate-400">
                  Total Present: <strong className="text-emerald-500">{presentCount}</strong> • Absent: <strong className="text-rose-500">{absentCount}</strong> • Late: <strong className="text-amber-500">{lateCount}</strong>
                </span>

                <button
                  type="button"
                  onClick={handleSubmitAttendance}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save & Sync Roll Call with School Dashboard</span>
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
                  Review student solution submissions, award marks, and provide qualitative feedback.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNewAssignmentModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Issue New Homework</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {assignments.map((asg) => (
                <div
                  key={asg.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10">
                          {asg.id}
                        </span>
                        <h4 className="font-bold text-sm text-white">{asg.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{asg.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-mono">Due: {asg.dueDate}</span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {asg.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 3. TERMINAL MARKSHEET & RESULT RELEASE HUB ================= */}
        {activeTab === 'gradebook' && (
          <div className="space-y-6">
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              {/* Header & Term Selector */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                      Terminal Academic Assessment Engine
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Nepal CDC Grading Standard
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                    Record Marks & Release Student Results
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter theory (max 75) and practical (max 25) marks. Results auto-evaluate CDC letter grades, GPA, and sync directly to SMS and the Student Portal when released.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleAutoFillPracticals(25)}
                    className="px-3.5 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 cursor-pointer"
                    title="Set 25 marks for all students"
                  >
                    Auto-Fill Practicals (25)
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveGradebook}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save & Sync with SMS</span>
                  </button>
                </div>
              </div>

              {/* Term Selection Bar */}
              <div className="my-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-x-auto no-scrollbar pb-1">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
                    Academic Term:
                  </span>
                  {[
                    { id: 'term-2083-1', label: '1st Term 2083' },
                    { id: 'term-2083-mid', label: 'Mid-Term 2083' },
                    { id: 'term-2083-third', label: '3rd Term 2083' },
                    { id: 'term-2083-final', label: 'Final (Board) 2083' },
                  ].map((term) => {
                    const isSelected = selectedExamTermId === term.id;
                    const termStatus = examTermsStatus[term.id]?.status || 'draft';
                    const isPub = termStatus === 'published';

                    return (
                      <button
                        key={term.id}
                        type="button"
                        onClick={() => setSelectedExamTermId(term.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md'
                            : isDark
                            ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>{term.label}</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isPub ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                          title={isPub ? 'Released to Students' : 'Draft'}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Cohort & Subject Selectors */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Cohort */}
                  <select
                    value={selectedCohortId}
                    onChange={(e) => setSelectedCohortId(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-white font-bold text-xs px-3 py-2 rounded-xl outline-none cursor-pointer"
                  >
                    {COHORT_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        {c.label}
                      </option>
                    ))}
                  </select>

                  {/* Subject */}
                  <select
                    value={selectedSubjectCode}
                    onChange={(e) => setSelectedSubjectCode(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-blue-400 font-bold text-xs px-3 py-2 rounded-xl outline-none cursor-pointer"
                  >
                    {GRADE_10_SUBJECTS.map((sub) => (
                      <option key={sub.code} value={sub.code} className="bg-slate-900 text-white">
                        {sub.name} ({sub.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Release to Student Portal Banner */}
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  (examTermsStatus[selectedExamTermId]?.status || 'draft') === 'published'
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {(examTermsStatus[selectedExamTermId]?.status || 'draft') === 'published' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          (examTermsStatus[selectedExamTermId]?.status || 'draft') === 'published'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {(examTermsStatus[selectedExamTermId]?.status || 'draft') === 'published'
                          ? 'RELEASED TO STUDENT PROTOCOL'
                          : 'DRAFT / GRADING IN PROGRESS'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {(examTermsStatus[selectedExamTermId]?.status || 'draft') === 'published'
                          ? 'Students can view their marksheets and trending graphs.'
                          : 'Hidden from student protocol while marks are being entered.'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleReleaseTerm}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                    (examTermsStatus[selectedExamTermId]?.status || 'draft') === 'published'
                      ? 'bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                  }`}
                >
                  {(examTermsStatus[selectedExamTermId]?.status || 'draft') === 'published'
                    ? '🔒 Revert to Draft (Unrelease)'
                    : '🚀 Release Result to Student Portal'}
                </button>
              </div>

              {/* Action Notices */}
              {releaseActionNotice && (
                <div className="mt-3 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{releaseActionNotice}</span>
                </div>
              )}

              {gradebookSavedNotice && (
                <div className="mt-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Terminal marksheet successfully evaluated, saved, and synchronized live to the School Management System & Student Report Cards!
                  </span>
                </div>
              )}

              {/* Real-Time Telemetry Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
                  <span className="text-[11px] text-slate-400">Class Cohort Roster</span>
                  <div className="text-xl font-bold text-blue-400 mt-0.5">{gradebookData.length} Students</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <span className="text-[11px] text-slate-400">Subject Class Average</span>
                  <div className="text-xl font-bold text-emerald-400 mt-0.5">
                    {gradebookData.length > 0
                      ? (
                          gradebookData.reduce(
                            (acc, curr) => acc + (Number(curr.examTheory || 0) + Number(curr.examPractical || 0)),
                            0
                          ) / gradebookData.length
                        ).toFixed(1)
                      : '0.0'}{' '}
                    / 100
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <span className="text-[11px] text-slate-400">Average Subject GPA</span>
                  <div className="text-xl font-bold text-amber-400 mt-0.5 font-mono">
                    {gradebookData.length > 0
                      ? (
                          gradebookData.reduce((acc, curr) => {
                            const tot = Number(curr.examTheory || 0) + Number(curr.examPractical || 0);
                            return acc + calculateGradeAndGpa(tot).gpa;
                          }, 0) / gradebookData.length
                        ).toFixed(2)
                      : '0.00'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
                  <span className="text-[11px] text-slate-400">Pass Rate (&ge; 40%)</span>
                  <div className="text-xl font-bold text-purple-400 mt-0.5">
                    {gradebookData.length > 0
                      ? (
                          (gradebookData.filter(
                            (s) => Number(s.examTheory || 0) + Number(s.examPractical || 0) >= 40
                          ).length /
                            gradebookData.length) *
                          100
                        ).toFixed(0)
                      : '100'}
                    %
                  </div>
                </div>
              </div>

              {/* Inline Evaluation Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr
                      className={`border-b text-slate-400 uppercase text-[11px] tracking-wider ${
                        isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <th className="py-3 px-4">Roll</th>
                      <th className="py-3 px-4">Student Name & Photo</th>
                      <th className="py-3 px-3 text-center">Theory (Max 75)</th>
                      <th className="py-3 px-3 text-center">Practical (Max 25)</th>
                      <th className="py-3 px-3 text-center">Total (100)</th>
                      <th className="py-3 px-3 text-center">Nepal CDC Grade</th>
                      <th className="py-3 px-3 text-center">GPA Point</th>
                      <th className="py-3 px-4">Evaluator Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {gradebookData.map((s) => {
                      const theory = Number(s.examTheory || 0);
                      const practical = Number(s.examPractical || 0);
                      const total = theory + practical;
                      const { grade, gpa } = calculateGradeAndGpa(total);
                      const photo =
                        s.avatar ||
                        s.photo_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=0D9488&color=fff`;

                      return (
                        <tr key={s.id || s.rollNo} className="hover:bg-slate-500/5 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-400">#{s.rollNo}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img src={photo} alt="" className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-500/30" />
                              <div>
                                <span className="font-semibold text-slate-800 dark:text-slate-100">{s.name}</span>
                                <span className="block text-[10px] font-mono text-slate-400">
                                  {s.admissionNo || `ADM-2026-${1000 + Number(s.rollNo)}`}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Theory input */}
                          <td className="py-3 px-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max="75"
                              value={s.examTheory ?? 0}
                              onChange={(e) => handleGradebookChange(s.rollNo, 'examTheory', e.target.value)}
                              className="w-16 px-2 py-1 text-center font-mono font-bold rounded-lg bg-slate-950 border border-slate-700 text-white focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          </td>

                          {/* Practical input */}
                          <td className="py-3 px-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max="25"
                              value={s.examPractical ?? 0}
                              onChange={(e) => handleGradebookChange(s.rollNo, 'examPractical', e.target.value)}
                              className="w-16 px-2 py-1 text-center font-mono font-bold rounded-lg bg-slate-950 border border-slate-700 text-white focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          </td>

                          {/* Auto-Evaluated Total */}
                          <td className="py-3 px-3 text-center font-mono font-bold text-blue-400">
                            {total}
                          </td>

                          {/* Auto-Evaluated CDC Grade */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-xs ${
                                grade.startsWith('A')
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : grade.startsWith('B')
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {grade}
                            </span>
                          </td>

                          {/* Auto-Evaluated GPA */}
                          <td className="py-3 px-3 text-center font-mono font-bold text-slate-300">
                            {gpa.toFixed(1)}
                          </td>

                          {/* Remarks */}
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={s.remarks || 'Consistent effort'}
                              onChange={(e) => handleGradebookChange(s.rollNo, 'remarks', e.target.value)}
                              className="w-full min-w-[140px] px-2.5 py-1 text-xs rounded-lg bg-slate-950/60 border border-slate-700 text-slate-300 focus:ring-1 focus:ring-blue-500 outline-none"
                              placeholder="Remarks..."
                            />
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

        {/* ================= 4. DOUBTS DESK ================= */}
        {activeTab === 'doubts' && (
          <div className="space-y-6">
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <h3 className="text-xl font-bold mb-4">Student Doubts Desk</h3>
              <p className="text-xs text-slate-400 mb-6">
                1-on-1 academic consultation with students. Clarify textbook exercises and provide guidance.
              </p>

              <div className="space-y-3 mb-6 max-h-[350px] overflow-y-auto">
                {doubtsMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl border text-xs ${
                      msg.sender === 'teacher'
                        ? 'bg-blue-950/40 border-blue-500/30 ml-8'
                        : 'bg-slate-950 border-slate-800 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white">{msg.senderName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{msg.time}</span>
                    </div>
                    <p className="text-slate-300">{msg.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleTeacherReply} className="flex gap-2">
                <input
                  type="text"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder="Type advice or formula step..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-400"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= 5. TEACHING ROUTINE ================= */}
        {activeTab === 'routine' && (
          <div className="space-y-6">
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold">{activeFaculty.name}'s Daily Teaching Schedule</h3>
                  <p className="text-xs text-slate-400">
                    Synchronized live with School Management System Admin Routine Scheduler.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Routine
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {routineList.map((slot, idx) => {
                  const isBreak = (slot.period || '').toLowerCase().includes('break');
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        isBreak
                          ? 'bg-amber-500/10 border-amber-500/30'
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
                        <span className="font-medium text-blue-400">{slot.room}</span>
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
                  <div className="font-serif-brand font-bold text-base tracking-wider uppercase text-blue-400">
                    {branding.name}
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-slate-400">
                    Faculty & Academic Directorate
                  </p>
                  <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-blue-500/20 text-[9px] font-bold uppercase tracking-widest text-blue-400 border border-blue-500/40">
                    Senior Faculty Member
                  </div>
                </div>

                <div className="text-center my-3">
                  <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden ring-4 ring-blue-500/40 shadow-xl">
                    <img src={activeFaculty.avatar} alt={activeFaculty.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-lg mt-3">{activeFaculty.name}</h4>
                  <div className="text-xs text-blue-400 font-semibold">{activeFaculty.subject}</div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">ID: {activeFaculty.id}</div>
                </div>

                <div className="bg-slate-950/80 rounded-2xl p-3 text-[11px] space-y-1 border border-slate-800 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span>{activeFaculty.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Primary Class:</span>
                    <span>{activeFaculty.primaryClass}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Validity:</span>
                    <span>March 2027</span>
                  </div>
                </div>

                <div className="text-center text-[9px] text-slate-500 uppercase tracking-widest">
                  Official Educator Credential
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print PVC Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPortal;
