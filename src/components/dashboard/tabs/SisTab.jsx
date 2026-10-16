import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Upload,
  ArrowRightCircle,
  FileBadge,
  Eye,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Printer,
  Download,
  Calendar,
  Phone,
  Mail,
  MapPin,
  X,
  Edit2,
  Layers,
  School,
  Bookmark,
  UserCheck,
  GraduationCap,
  LayoutGrid,
  Camera,
  Trash2,
  FolderOpen,
  ListFilter,
} from 'lucide-react';
import {
  fetchStudents,
  registerStudent,
  updateStudent,
  importStudentsCsv,
  promoteStudents,
  issueTransferCertificate,
  fetchClassesOverview,
  createAcademicClass,
  updateAcademicClass,
  addClassSection,
  deleteAcademicClass,
} from '../../../services/api';
import { formatDualDate, toNepaliNumerals } from '../../../utils/nepaliCalendar';
import { getTranslation } from '../../../utils/translations';
import { useAuth } from '../../../context/AuthContext';
import ImageFieldWithPicker from '../../ImageFieldWithPicker';
import MediaPickerModal from '../../MediaPickerModal';

const SisTab = ({ isDark, onSelectStudentForID, classRoster = [] }) => {
  const { lang, currentBranch } = useAuth();
  const [activeSubView, setActiveSubView] = useState('classes'); // 'classes' | 'students'
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classesOverview, setClassesOverview] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showTcModal, setShowTcModal] = useState(false);
  const [selectedStudentForTC, setSelectedStudentForTC] = useState(null);
  const [issuedTcData, setIssuedTcData] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);

  // Class & Section Management Modals
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);

  const [classForm, setClassForm] = useState({
    id: null,
    name: '',
    faculty: 'Secondary',
    order_index: 10,
    section_name: 'Section A',
    room_no: 'Room 201',
    class_teacher_id: '',
    capacity: 40,
  });

  const [sectionForm, setSectionForm] = useState({
    class_id: null,
    class_name: '',
    name: 'Section B',
    room_no: 'Room 202',
    class_teacher_id: '',
    capacity: 40,
  });

  // Forms
  const [addForm, setAddForm] = useState({
    first_name: '',
    last_name: '',
    class_id: '',
    roll_no: '',
    admission_no: '',
    gender: 'male',
    dob_ad: '2010-05-15',
    dob_bs: '2067-02-01',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    address: 'Kathmandu, Nepal',
    photo_url: '',
  });

  const [editForm, setEditForm] = useState({
    id: null,
    first_name: '',
    last_name: '',
    class_id: '',
    roll_no: '',
    admission_no: '',
    gender: 'male',
    dob_ad: '2010-05-15',
    dob_bs: '2067-02-01',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    address: 'Kathmandu, Nepal',
    photo_url: '',
    status: 'active',
  });

  const [csvText, setCsvText] = useState(
    "first_name,last_name,class,roll_no,gender,guardian_name,guardian_phone\nSuman,Adhikari,Grade 10,12,male,Bishnu Adhikari,9851099881\nPooja,Tamang,Grade 10,13,female,Karma Tamang,9841223344\nAayush,Karki,Grade 9,5,male,Dipendra Karki,9813009988"
  );

  const [promoteForm, setPromoteForm] = useState({
    from_class_id: '',
    to_class_id: '',
    remarks: 'Annual Exam Promotion',
  });

  const [tcForm, setTcForm] = useState({
    reason_for_leaving: 'Completed Secondary Education / Higher Studies',
    conduct: 'Exemplary',
    remarks: 'Cleared all institutional dues. Character certificate issued.',
  });

  const [actionMessage, setActionMessage] = useState(null);

  // Load students from API
  const loadData = async () => {
    setLoading(true);
    try {
      const params = { branch_id: currentBranch?.id || 1 };
      if (selectedClass !== 'all') params.class_id = selectedClass;
      if (search) params.search = search;

      const res = await fetchStudents(params);
      if (res && res.success && res.data?.students) {
        setStudents(res.data.students);
        if (res.data.classes) setClasses(res.data.classes);
      } else {
        // Fallback to local roster if backend data empty
        setStudents(classRoster);
      }
    } catch (e) {
      setStudents(classRoster);
    }
    setLoading(false);
  };

  // Load classes overview with sections and teachers
  const loadClassesData = async () => {
    const defaultClasses = [
      {
        id: 1,
        name: 'Grade 10',
        faculty: 'Secondary',
        order_index: 10,
        student_count: 36,
        total_capacity: 40,
        primary_room: 'Hall 302',
        sections: [
          { id: 101, name: 'Section A', room_no: 'Hall 302', capacity: 40, class_teacher_name: 'RJ Rana' },
          { id: 102, name: 'Section B', room_no: 'Hall 304', capacity: 40, class_teacher_name: 'Suman Shrestha' },
        ],
      },
      {
        id: 2,
        name: 'Grade 9',
        faculty: 'Secondary',
        order_index: 9,
        student_count: 32,
        total_capacity: 40,
        primary_room: 'Hall 201',
        sections: [
          { id: 201, name: 'Section A', room_no: 'Hall 201', capacity: 40, class_teacher_name: 'Bikram Karki' },
        ],
      },
      {
        id: 3,
        name: 'Grade 11 - Science',
        faculty: 'Higher Secondary (Science)',
        order_index: 11,
        student_count: 28,
        total_capacity: 35,
        primary_room: 'Sci Lab 1',
        sections: [
          { id: 301, name: 'Section A (Bio-Math)', room_no: 'Sci Lab 1', capacity: 35, class_teacher_name: 'Dr. K. Acharya' },
        ],
      },
      {
        id: 4,
        name: 'Grade 12 - Management',
        faculty: 'Higher Secondary (Management)',
        order_index: 12,
        student_count: 25,
        total_capacity: 35,
        primary_room: 'Hall 401',
        sections: [
          { id: 401, name: 'Section A (Accounts & Eco)', room_no: 'Hall 401', capacity: 35, class_teacher_name: 'Pooja Thapa' },
        ],
      },
    ];

    const defaultTeachers = [
      { id: 1, name: 'RJ Rana', email: 'rj.rana@alchemist.edu.np', department: 'Mathematics' },
      { id: 2, name: 'Dr. K. Acharya', email: 'k.acharya@alchemist.edu.np', department: 'Science' },
      { id: 3, name: 'Suman Shrestha', email: 'suman@alchemist.edu.np', department: 'English' },
      { id: 4, name: 'Pooja Thapa', email: 'pooja@alchemist.edu.np', department: 'Computer Science' },
    ];

    try {
      const res = await fetchClassesOverview(currentBranch?.id || 1);
      if (res && res.success && res.data?.classes && res.data.classes.length > 0) {
        setClassesOverview(res.data.classes);
        if (res.data.teachers) setTeachersList(res.data.teachers);
        setClasses(res.data.classes);
      } else {
        setClassesOverview(defaultClasses);
        setTeachersList(defaultTeachers);
        setClasses(defaultClasses);
      }
    } catch (e) {
      console.warn('Backend classes overview unavailable, using local defaults:', e);
      setClassesOverview(defaultClasses);
      setTeachersList(defaultTeachers);
      setClasses(defaultClasses);
    }
  };

  useEffect(() => {
    loadData();
    loadClassesData();
  }, [currentBranch?.id, selectedClass]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  // 1. Submit Add Student
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerStudent(addForm);
      if (res && res.success) {
        setActionMessage({ type: 'success', text: res.message || 'Student enrolled successfully.' });
        setShowAddModal(false);
        loadData();
      } else {
        setActionMessage({ type: 'error', text: res?.message || 'Failed to register student.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  // Open Edit Modal with Pre-filled Student Details
  const handleOpenEdit = (st) => {
    const rawName = st.name || '';
    const nameParts = rawName.trim().split(' ');
    setEditForm({
      id: st.id,
      first_name: st.first_name || nameParts[0] || '',
      last_name: st.last_name || nameParts.slice(1).join(' ') || '',
      class_id: st.class_id || (classes[0]?.id || 1),
      roll_no: st.roll_no || st.rollNo || 1,
      admission_no: st.admission_no || st.admissionNo || '',
      gender: st.gender || 'male',
      dob_ad: st.dob_ad || '2010-05-15',
      dob_bs: st.dob_bs || '2067-02-01',
      guardian_name: st.guardian_name || st.guardianName || '',
      guardian_phone: st.guardian_phone || st.guardianPhone || '',
      guardian_email: st.guardian_email || st.guardianEmail || '',
      address: st.address || 'Kathmandu, Nepal',
      photo_url: st.photo_url || st.avatar || '',
      status: st.status || 'active',
    });
    setShowEditModal(true);
  };

  // Submit Edit Student
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateStudent(editForm);
      if (res && res.success) {
        setActionMessage({ type: 'success', text: res.message || 'Student record updated successfully.' });
        setShowEditModal(false);
        if (selectedProfile && selectedProfile.id === editForm.id) {
          setSelectedProfile({ ...selectedProfile, ...editForm });
        }
        loadData();
      } else {
        setActionMessage({ type: 'error', text: res?.message || 'Failed to update student.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  // 2. Submit Bulk CSV Import
  const handleCsvImport = async () => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map((h) => h.trim());
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        if (values.length === headers.length) {
          const row = {};
          headers.forEach((h, idx) => (row[h] = values[idx]));
          rows.push(row);
        }
      }

      const res = await importStudentsCsv(rows);
      if (res && res.success) {
        setActionMessage({ type: 'success', text: res.message });
        setShowImportModal(false);
        loadData();
      } else {
        setActionMessage({ type: 'error', text: res?.message || 'CSV Import failed.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  // 3. Submit Class Promotion
  const handlePromoteSubmit = async (e) => {
    e.preventDefault();
    try {
      const studentsInClass = students
        .filter((s) => String(s.class_id) === String(promoteForm.from_class_id))
        .map((s) => s.id);

      if (studentsInClass.length === 0) {
        setActionMessage({ type: 'error', text: 'No students found in the selected source class.' });
        return;
      }

      const res = await promoteStudents({
        student_ids: studentsInClass,
        to_class_id: promoteForm.to_class_id,
        remarks: promoteForm.remarks,
      });

      if (res && res.success) {
        setActionMessage({ type: 'success', text: res.message });
        setShowPromoteModal(false);
        loadData();
      } else {
        setActionMessage({ type: 'error', text: res?.message || 'Promotion failed.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  // 4. Issue Transfer Certificate
  const handleIssueTC = async (e) => {
    e.preventDefault();
    if (!selectedStudentForTC) return;

    try {
      const res = await issueTransferCertificate({
        student_id: selectedStudentForTC.id,
        reason_for_leaving: tcForm.reason_for_leaving,
        conduct: tcForm.conduct,
        remarks: tcForm.remarks,
      });

      if (res && res.success) {
        setIssuedTcData(res.data);
        setActionMessage({ type: 'success', text: res.message });
        loadData();
      } else {
        setActionMessage({ type: 'error', text: res?.message || 'Failed to issue TC.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  // 5. Academic Class & Section Management Handlers
  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const res = await createAcademicClass({
        ...classForm,
        branch_id: currentBranch?.id || 1,
      });
      if (res && res.success) {
        setActionMessage({ type: 'success', text: res.message || 'Class registered successfully.' });
        setShowAddClassModal(false);
        loadClassesData();
        loadData();
      } else {
        setActionMessage({ type: 'error', text: res?.message || 'Failed to create class.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  const handleOpenEditClass = (cls) => {
    setClassForm({
      id: cls.id,
      name: cls.name || '',
      faculty: cls.faculty || 'Secondary',
      order_index: cls.order_index || 1,
      room_no: cls.primary_room || cls.sections?.[0]?.room_no || 'Room 101',
      class_teacher_id: cls.sections?.[0]?.class_teacher_id || '',
      capacity: cls.total_capacity || 40,
    });
    setShowEditClassModal(true);
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    try {
      const res = await updateAcademicClass(classForm);
      if (res && res.success) {
        setActionMessage({ type: 'success', text: res.message || 'Class updated successfully.' });
        setShowEditClassModal(false);
        loadClassesData();
        loadData();
      } else {
        setActionMessage({ type: 'error', text: res?.message || 'Failed to update class.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  const handleOpenAddSection = (cls) => {
    const secCount = cls.sections ? cls.sections.length : 0;
    const nextLetter = String.fromCharCode(65 + secCount);
    setSectionForm({
      class_id: cls.id,
      class_name: cls.name,
      name: `Section ${nextLetter}`,
      room_no: `Room ${100 + (cls.id * 10) + secCount + 1}`,
      class_teacher_id: '',
      capacity: 40,
    });
    setShowAddSectionModal(true);
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    try {
      const res = await addClassSection(sectionForm);
      if (res && res.success) {
        setActionMessage({ type: 'success', text: res.message || 'Section added successfully.' });
        setShowAddSectionModal(false);
        loadClassesData();
      } else {
        setActionMessage({ type: 'error', text: res?.message || 'Failed to add section.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  const handleDeleteClass = async (classId, className) => {
    if (!window.confirm(`Are you sure you want to remove "${className}"? If there are active students enrolled, they must be reassigned first.`)) {
      return;
    }
    try {
      const res = await deleteAcademicClass(classId);
      if (res && res.success) {
        setActionMessage({ type: 'success', text: res.message || 'Academic class deleted successfully.' });
        loadClassesData();
        loadData();
      } else {
        setActionMessage({ type: 'error', text: res?.message || 'Failed to delete class.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  const handleUpdateStudentPhoto = async (newPhotoUrl) => {
    if (!selectedProfile) return;
    try {
      const res = await updateStudent({
        id: selectedProfile.id,
        photo_url: newPhotoUrl,
      });
      if (res && res.success) {
        setSelectedProfile((prev) => ({ ...prev, photo_url: newPhotoUrl }));
        setStudents((prev) =>
          prev.map((s) => (s.id === selectedProfile.id ? { ...s, photo_url: newPhotoUrl } : s))
        );
        setActionMessage({ type: 'success', text: 'Student profile photo updated successfully.' });
        setIsPhotoPickerOpen(false);
      } else {
        setActionMessage({ type: 'error', text: res?.message || 'Failed to update photo.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  const handleViewStudentsForClass = (classId) => {
    setSelectedClass(String(classId));
    setActiveSubView('students');
  };

  return (
    <div className="space-y-6">
      {/* Action Message Banner */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-medium border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub-view Navigation Switcher & Header Controls */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className={`flex items-center gap-1.5 p-1 rounded-2xl border w-fit ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-300'
        }`}>
          <button
            type="button"
            onClick={() => setActiveSubView('classes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubView === 'classes'
                ? 'bg-emerald-600 text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>{lang === 'ne' ? 'कक्षा समूहहरू र शाखा' : 'Class Cohorts & Sections'}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              isDark ? 'bg-slate-950/60 text-emerald-300' : 'bg-emerald-100 text-emerald-800 font-bold'
            }`}>
              {classesOverview.length || classes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('students')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubView === 'students'
                ? 'bg-emerald-600 text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>{lang === 'ne' ? 'विद्यार्थी निर्देशिका' : 'Student Master Directory'}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              isDark ? 'bg-slate-950/60 text-emerald-300' : 'bg-emerald-100 text-emerald-800 font-bold'
            }`}>
              {students.length}
            </span>
          </button>
        </div>

        {activeSubView === 'classes' && (
          <button
            type="button"
            onClick={() => {
              setClassForm({
                id: null,
                name: '',
                faculty: 'Secondary',
                order_index: (classesOverview.length || 0) + 1,
                section_name: 'Section A',
                room_no: `Room ${100 + ((classesOverview.length || 0) + 1) * 2}`,
                class_teacher_id: teachersList[0]?.id || '',
                capacity: 40,
              });
              setShowAddClassModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ne' ? '+ नयाँ कक्षा थप्नुहोस्' : '+ Add New Class / Grade'}</span>
          </button>
        )}
      </div>

      {/* VIEW A: CLASS COHORTS & SECTIONS CARDS */}
      {activeSubView === 'classes' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'ne' ? 'कुल कक्षाहरू' : 'Total Classes'}</div>
              <div className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{classesOverview.length || classes.length}</div>
              <div className="text-[10px] text-emerald-500 mt-1 flex items-center gap-1 font-medium">
                <School className="w-3 h-3" /> Active academic grades
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'ne' ? 'सक्रिय सेक्सनहरू' : 'Active Sections'}</div>
              <div className="text-2xl font-black text-teal-500 mt-1">
                {classesOverview.reduce((sum, c) => sum + (c.sections ? c.sections.length : 1), 0)}
              </div>
              <div className="text-[10px] text-teal-600 dark:text-teal-300 mt-1 flex items-center gap-1 font-medium">
                <Layers className="w-3 h-3" /> Dedicated classrooms
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'ne' ? 'भर्ना भएका विद्यार्थी' : 'Total Enrolled'}</div>
              <div className="text-2xl font-black text-indigo-500 mt-1">
                {classesOverview.reduce((sum, c) => sum + (parseInt(c.student_count) || 0), 0) || students.length}
              </div>
              <div className="text-[10px] text-indigo-600 dark:text-indigo-300 mt-1 flex items-center gap-1 font-medium">
                <Users className="w-3 h-3" /> Active students
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'ne' ? 'औसत क्षमता' : 'Avg Capacity'}</div>
              <div className="text-2xl font-black text-amber-500 mt-1">
                {(() => {
                  const totalStudents = classesOverview.reduce((sum, c) => sum + (parseInt(c.student_count) || 0), 0);
                  const totalCap = classesOverview.reduce((sum, c) => sum + (parseInt(c.total_capacity) || 40), 0);
                  return totalCap > 0 ? `${Math.round((totalStudents / totalCap) * 100)}%` : '0%';
                })()}
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-300 mt-1 flex items-center gap-1 font-medium">
                <UserCheck className="w-3 h-3" /> Seat utilization
              </div>
            </div>
          </div>

          {/* Class Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classesOverview.length === 0 ? (
              <div className={`col-span-full py-12 text-center rounded-3xl border border-dashed ${
                isDark ? 'border-slate-800 bg-slate-900/30' : 'border-slate-300 bg-slate-50'
              }`}>
                <School className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h4 className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>No Academic Classes Found</h4>
                <p className="text-xs text-slate-400 mb-4">Initialize your grade levels and sections for this branch.</p>
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  + Add First Class
                </button>
              </div>
            ) : (
              classesOverview.map((cls) => {
                const studentCount = parseInt(cls.student_count) || 0;
                const capacity = parseInt(cls.total_capacity) || 40;
                const pct = Math.min(100, Math.round((studentCount / capacity) * 100));
                const barColor = pct >= 90 ? 'bg-rose-500' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500';

                // Faculty badge styling
                const faculty = cls.faculty || 'Secondary';
                let facultyBadge = isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200';
                if (faculty.includes('Science')) facultyBadge = 'bg-purple-500/10 text-purple-500 dark:text-purple-300 border-purple-500/30';
                else if (faculty.includes('Management')) facultyBadge = 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30';
                else if (faculty.includes('Primary')) facultyBadge = 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/30';
                else if (faculty.includes('Secondary')) facultyBadge = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30';

                return (
                  <div
                    key={cls.id}
                    className={`rounded-3xl border p-5 transition-all flex flex-col justify-between shadow-lg relative group ${
                      isDark
                        ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:shadow-emerald-950/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${facultyBadge}`}>
                          {faculty}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                            isDark ? 'bg-slate-950/80 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            Index #{cls.order_index || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenEditClass(cls)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDark ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                            }`}
                            title="Edit Class Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClass(cls.id, cls.name)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDark
                                ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 border border-rose-800/40'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200'
                            }`}
                            title="Delete Class"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Class Title */}
                      <h3 className={`text-xl font-black tracking-tight flex items-center justify-between ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        <span>{cls.name}</span>
                        <span className="text-xs font-mono font-medium text-emerald-500">
                          {studentCount} <span className={isDark ? 'text-slate-500 font-normal' : 'text-slate-400 font-normal'}>/ {capacity}</span>
                        </span>
                      </h3>

                      {/* Capacity Progress Bar */}
                      <div className="mt-2.5 mb-4">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Occupancy</span>
                          <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{pct}% filled</span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden border ${
                          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-200 border-slate-300'
                        }`}>
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Class Metadata */}
                      <div className={`space-y-2 py-3 border-y text-xs ${
                        isDark ? 'border-slate-800/60' : 'border-slate-100'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-400">
                            <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Class Teacher:</span>
                          </div>
                          <span className={`font-semibold truncate max-w-[150px] ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            {cls.primary_teacher || 'Unassigned'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-400">
                            <School className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Room No:</span>
                          </div>
                          <span className={`font-semibold ${
                            isDark ? 'text-slate-200' : 'text-slate-700'
                          }`}>
                            {cls.primary_room || 'Room 101'}
                          </span>
                        </div>
                      </div>

                      {/* Sections List */}
                      <div className="mt-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="w-3 h-3 text-teal-500" />
                            Sections ({cls.sections ? cls.sections.length : 1})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenAddSection(cls)}
                            className="text-[11px] font-bold text-teal-500 hover:text-teal-600 inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Add Section
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {cls.sections && cls.sections.length > 0 ? (
                            cls.sections.map((sec) => (
                              <div
                                key={sec.id}
                                className={`px-2.5 py-1 rounded-xl border text-[11px] flex items-center gap-1.5 ${
                                  isDark ? 'bg-slate-950 border-slate-800/80 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                                }`}
                              >
                                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{sec.name}</span>
                                <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                  {sec.room_no || 'TBD'}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Section A (Default)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Action Buttons */}
                    <div className={`pt-2 border-t flex items-center gap-2 ${
                      isDark ? 'border-slate-800/80' : 'border-slate-100'
                    }`}>
                      <button
                        type="button"
                        onClick={() => handleViewStudentsForClass(cls.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Manage Students ({studentCount})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenAddSection(cls)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700 text-teal-300' : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200'
                        }`}
                        title="Add Section to Class"
                      >
                        <Layers className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW B: STUDENT MASTER DIRECTORY */}
      {activeSubView === 'students' && (
        <div className="space-y-6">
          {/* Header with Search and Action Buttons */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search & Class Filter */}
            <div className="flex flex-1 items-center gap-2">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={getTranslation('search', lang) + ' (Name, Roll, Admission No)'}
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                />
              </form>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="all">{lang === 'ne' ? 'सबै कक्षाहरू' : 'All Classes'}</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {selectedClass !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedClass('all')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs hover:text-white cursor-pointer"
                >
                  Clear Filter
                </button>
              )}
            </div>

            {/* Action Buttons: Add, Bulk CSV, Promote */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{getTranslation('add_student', lang)}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{getTranslation('bulk_import_csv', lang)}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPromoteModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
              >
                <ArrowRightCircle className="w-4 h-4" />
                <span>{getTranslation('promote_students', lang)}</span>
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className={`rounded-2xl border overflow-hidden transition-colors ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isDark ? 'bg-slate-900/80 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    <th className="py-3 px-4">{lang === 'ne' ? 'विद्यार्थी / रोल' : 'Student & Roll'}</th>
                    <th className="py-3 px-4">{lang === 'ne' ? 'कक्षा / भर्ना नं.' : 'Class & Adm #'}</th>
                    <th className="py-3 px-4">{lang === 'ne' ? 'अभिभावक विवरण' : 'Guardian Details'}</th>
                    <th className="py-3 px-4">{lang === 'ne' ? 'जन्ममिति (AD/BS)' : 'DOB (AD / BS)'}</th>
                    <th className="py-3 px-4">{lang === 'ne' ? 'अवस्था' : 'Status'}</th>
                    <th className="py-3 px-4 text-right">{lang === 'ne' ? 'कार्यहरू' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        {loading ? 'Fetching student records...' : 'No students found.'}
                      </td>
                    </tr>
                  ) : (
                    students.map((st) => {
                      const studentName = st.first_name ? `${st.first_name} ${st.last_name || ''}` : st.name;
                      const roll = st.roll_no || st.rollNumber || '—';
                      const admNo = st.admission_no || st.studentId || 'ADM-2026';
                      const className = st.class_name || st.grade || 'Grade 10';
                      const guardian = st.guardian_name || st.parentName || 'Bikash Shrestha';
                      const phone = st.guardian_phone || st.phone || '9851000000';
                      const status = st.status || 'active';

                      return (
                        <tr
                          key={st.id || admNo}
                          className={`transition-colors ${
                            isDark ? 'hover:bg-slate-800/30 text-slate-200' : 'hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={st.photo_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${studentName}`}
                                alt={studentName}
                                className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 object-cover"
                              />
                              <div>
                                <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{studentName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  Roll: {lang === 'ne' ? toNepaliNumerals(roll) : roll}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-emerald-500">{className}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{admNo}</div>
                          </td>

                          <td className="py-3 px-4">
                            <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{guardian}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                              <Phone className="w-2.5 h-2.5 text-slate-500" />
                              <span>{phone}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {formatDualDate(st.dob_ad || '2010-05-15', lang)}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : status === 'transferred'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Digital Student ID */}
                              <button
                                type="button"
                                onClick={() => onSelectStudentForID && onSelectStudentForID(st)}
                                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
                                title="Generate Digital Student ID Card"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>

                              {/* Transfer Certificate (TC) */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStudentForTC(st);
                                  setShowTcModal(true);
                                }}
                                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors cursor-pointer"
                                title="Issue Official Transfer Certificate (TC)"
                              >
                                <FileBadge className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Student Record */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(st)}
                                className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors cursor-pointer"
                                title="Edit Student Information"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* View Full Profile */}
                              <button
                                type="button"
                                onClick={() => setSelectedProfile(st)}
                                className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors cursor-pointer"
                                title="View Student Dossier & Documents"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
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

      {/* MODAL 1: REGISTER STUDENT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">New Student Registration</h3>
            <p className="text-xs text-slate-400 mb-5">Create official student profile and enroll in branch roster.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.first_name}
                    onChange={(e) => setAddForm({ ...addForm, first_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.last_name}
                    onChange={(e) => setAddForm({ ...addForm, last_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Class / Grade *</label>
                  <select
                    required
                    value={addForm.class_id}
                    onChange={(e) => setAddForm({ ...addForm, class_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="">Select Grade</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Roll No</label>
                  <input
                    type="number"
                    value={addForm.roll_no}
                    onChange={(e) => setAddForm({ ...addForm, roll_no: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Guardian Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.guardian_name}
                    onChange={(e) => setAddForm({ ...addForm, guardian_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Guardian Phone *</label>
                  <input
                    type="text"
                    required
                    value={addForm.guardian_phone}
                    onChange={(e) => setAddForm({ ...addForm, guardian_phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">DOB (AD)</label>
                  <input
                    type="date"
                    value={addForm.dob_ad}
                    onChange={(e) => setAddForm({ ...addForm, dob_ad: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">DOB (BS e.g. 2067-02-01)</label>
                  <input
                    type="text"
                    value={addForm.dob_bs}
                    onChange={(e) => setAddForm({ ...addForm, dob_bs: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Permanent Address</label>
                <input
                  type="text"
                  value={addForm.address}
                  onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <ImageFieldWithPicker
                  label="Student Profile Photo"
                  value={addForm.photo_url}
                  onChange={(url) => setAddForm({ ...addForm, photo_url: url })}
                  category="Students"
                  helpText="Select from Media Library, upload a photo, or paste a direct image URL."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Register Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK IMPORT CSV */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setShowImportModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Bulk Student CSV / Excel Importer</h3>
            <p className="text-xs text-slate-400 mb-4">
              Paste CSV text or edit template below. Each row creates a student profile linked to {currentBranch?.name}.
            </p>

            <textarea
              rows="6"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-emerald-300 focus:outline-none mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCsvImport}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white"
              >
                Start Bulk Ingestion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PROMOTE STUDENTS */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowPromoteModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Class Academic Promotion</h3>
            <p className="text-xs text-slate-400 mb-4">
              Promote an entire cohort to the next grade level with audit ledger logging.
            </p>

            <form onSubmit={handlePromoteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">From Class *</label>
                <select
                  required
                  value={promoteForm.from_class_id}
                  onChange={(e) => setPromoteForm({ ...promoteForm, from_class_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="">Select Origin Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Promote To Class *</label>
                <select
                  required
                  value={promoteForm.to_class_id}
                  onChange={(e) => setPromoteForm({ ...promoteForm, to_class_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="">Select Destination Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Promotion Remarks</label>
                <input
                  type="text"
                  value={promoteForm.remarks}
                  onChange={(e) => setPromoteForm({ ...promoteForm, remarks: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPromoteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Execute Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: TRANSFER CERTIFICATE (TC) ISSUER & PRINT PREVIEW */}
      {showTcModal && selectedStudentForTC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowTcModal(false);
                setIssuedTcData(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!issuedTcData ? (
              <>
                <h3 className="text-lg font-bold text-amber-300 mb-1">Issue Official Transfer Certificate (TC)</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Issuing a TC officially transfers the student and marks their status as 'Transferred'.
                </p>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 mb-4 text-xs space-y-1">
                  <div>
                    Student: <span className="font-bold text-white">{selectedStudentForTC.first_name || selectedStudentForTC.name}</span>
                  </div>
                  <div>
                    Admission No: <span className="font-mono text-emerald-400">{selectedStudentForTC.admission_no || selectedStudentForTC.studentId}</span>
                  </div>
                </div>

                <form onSubmit={handleIssueTC} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Leaving</label>
                    <input
                      type="text"
                      value={tcForm.reason_for_leaving}
                      onChange={(e) => setTcForm({ ...tcForm, reason_for_leaving: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Conduct & Character</label>
                    <input
                      type="text"
                      value={tcForm.conduct}
                      onChange={(e) => setTcForm({ ...tcForm, conduct: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Administrative Remarks</label>
                    <input
                      type="text"
                      value={tcForm.remarks}
                      onChange={(e) => setTcForm({ ...tcForm, remarks: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowTcModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white"
                    >
                      Endorse & Issue TC
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Printable Certificate View */
              <div className="space-y-4 text-center">
                <div className="p-6 bg-amber-50 text-slate-950 rounded-2xl border-4 border-double border-amber-700 text-left space-y-3 font-serif">
                  <div className="text-center border-b border-amber-300 pb-2">
                    <div className="text-xs uppercase tracking-wider font-bold text-amber-900">
                      Alchemist Academy • Transfer Certificate
                    </div>
                    <div className="text-xl font-bold font-serif-brand">Certificate of Transfer</div>
                    <div className="text-[10px] text-amber-800">
                      Affiliated to NEB & Ministry of Education, Nepal • Reg: NEB-99821
                    </div>
                  </div>

                  <div className="text-xs leading-relaxed space-y-1.5 pt-2">
                    <div>
                      This is to certify that <strong>{issuedTcData.student_name}</strong> was a bonafide student of this institution.
                    </div>
                    <div>
                      Certificate Number: <span className="font-mono font-bold text-amber-900">{issuedTcData.tc_number}</span>
                    </div>
                    <div>
                      Date of Issue: <strong>{formatDualDate(issuedTcData.issue_date, lang)}</strong>
                    </div>
                    <div>
                      Security Token: <span className="font-mono text-[10px] text-slate-600">{issuedTcData.verification_token}</span>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between text-[11px] font-sans font-bold border-t border-amber-300">
                    <div>Class Teacher Signature</div>
                    <div>Principal / Headmaster Stamp</div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Certificate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTcModal(false);
                      setIssuedTcData(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 5: STUDENT DOSSIER & PROFILE */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProfile(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div
                className="relative group cursor-pointer shrink-0"
                onClick={() => setIsPhotoPickerOpen(true)}
                title="Click to Change Student Photo"
              >
                <img
                  src={selectedProfile.photo_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedProfile.first_name || selectedProfile.name}`}
                  alt="Profile"
                  className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/70 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold">
                  <Camera className="w-4 h-4 mb-0.5 text-amber-400" />
                  <span>Change</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white truncate">
                  {selectedProfile.first_name ? `${selectedProfile.first_name} ${selectedProfile.last_name || ''}` : selectedProfile.name}
                </h3>
                <div className="text-xs text-emerald-400 font-mono">
                  Adm: {selectedProfile.admission_no || selectedProfile.studentId} • Roll: {selectedProfile.roll_no || selectedProfile.rollNumber}
                </div>
                <button
                  type="button"
                  onClick={() => setIsPhotoPickerOpen(true)}
                  className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Update Photo (Media Library)</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Guardian Information</div>
                <div className="font-semibold text-slate-200">{selectedProfile.guardian_name || selectedProfile.parentName}</div>
                <div className="text-slate-400">{selectedProfile.guardian_phone || selectedProfile.phone}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Academic & Date Records</div>
                <div>Class: <span className="font-semibold text-slate-200">{selectedProfile.class_name || selectedProfile.grade}</span></div>
                <div>DOB: <span className="text-slate-200">{formatDualDate(selectedProfile.dob_ad || '2010-05-15', lang)}</span></div>
                <div>Address: <span className="text-slate-200">{selectedProfile.address || 'Kathmandu, Nepal'}</span></div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEdit(selectedProfile);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            <MediaPickerModal
              isOpen={isPhotoPickerOpen}
              onClose={() => setIsPhotoPickerOpen(false)}
              onSelect={(item) => handleUpdateStudentPhoto(item.url)}
              currentValue={selectedProfile.photo_url}
              title={`Change Photo for ${selectedProfile.first_name || selectedProfile.name}`}
            />
          </div>
        </div>
      )}

      {/* MODAL 6: EDIT STUDENT RECORD */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <Edit2 className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Edit Student Record</h3>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Update official demographics, academic cohort, guardian contacts, or enrollment status.
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Class / Grade *</label>
                  <select
                    required
                    value={editForm.class_id}
                    onChange={(e) => setEditForm({ ...editForm, class_id: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Roll No</label>
                  <input
                    type="number"
                    value={editForm.roll_no}
                    onChange={(e) => setEditForm({ ...editForm, roll_no: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="transferred">Transferred</option>
                    <option value="graduated">Graduated</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    value={editForm.guardian_name}
                    onChange={(e) => setEditForm({ ...editForm, guardian_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Guardian Phone</label>
                  <input
                    type="tel"
                    value={editForm.guardian_phone}
                    onChange={(e) => setEditForm({ ...editForm, guardian_phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Guardian Email</label>
                  <input
                    type="email"
                    value={editForm.guardian_email}
                    onChange={(e) => setEditForm({ ...editForm, guardian_email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">DOB (AD)</label>
                  <input
                    type="date"
                    value={editForm.dob_ad}
                    onChange={(e) => setEditForm({ ...editForm, dob_ad: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">DOB (BS)</label>
                  <input
                    type="text"
                    value={editForm.dob_bs}
                    placeholder="2067-02-01"
                    onChange={(e) => setEditForm({ ...editForm, dob_bs: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Physical Residential Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <ImageFieldWithPicker
                  label="Student Profile Photo"
                  value={editForm.photo_url}
                  onChange={(url) => setEditForm({ ...editForm, photo_url: url })}
                  category="Students"
                  helpText="Select from Media Library, upload a photo, or paste a direct image URL."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: ADD CLASS / GRADE */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddClassModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Add New Academic Class</h3>
                <p className="text-xs text-slate-400">Create a new class / grade cohort with an initial section</p>
              </div>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Class / Grade Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grade 12 or Nursery"
                    value={classForm.name}
                    onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Faculty / Academic Wing</label>
                  <select
                    value={classForm.faculty}
                    onChange={(e) => setClassForm({ ...classForm, faculty: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Pre-Primary">Pre-Primary (Kindergarten)</option>
                    <option value="Primary">Primary (Grade 1 - 5)</option>
                    <option value="Lower Secondary">Lower Secondary (Grade 6 - 8)</option>
                    <option value="Secondary">Secondary (Grade 9 - 10 / SEE)</option>
                    <option value="+2 Science">+2 Science (NEB)</option>
                    <option value="+2 Management">+2 Management (NEB)</option>
                    <option value="+2 Humanities">+2 Humanities / Arts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Display Order Sequence</label>
                  <input
                    type="number"
                    min="1"
                    value={classForm.order_index}
                    onChange={(e) => setClassForm({ ...classForm, order_index: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Student Capacity</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={classForm.capacity}
                    onChange={(e) => setClassForm({ ...classForm, capacity: parseInt(e.target.value) || 40 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Initial Section Setup
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Section Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Section A"
                      value={classForm.section_name}
                      onChange={(e) => setClassForm({ ...classForm, section_name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Room Number</label>
                    <input
                      type="text"
                      placeholder="Room 201"
                      value={classForm.room_no}
                      onChange={(e) => setClassForm({ ...classForm, room_no: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Class Teacher</label>
                  <select
                    value={classForm.class_teacher_id}
                    onChange={(e) => setClassForm({ ...classForm, class_teacher_id: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Select Teacher --</option>
                    {teachersList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md"
                >
                  Create Class Cohort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: EDIT CLASS */}
      {showEditClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditClassModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Edit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Edit Academic Class</h3>
                <p className="text-xs text-slate-400">Update class name, faculty wing, sequence and assigned teacher</p>
              </div>
            </div>

            <form onSubmit={handleUpdateClass} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Class / Grade Name *</label>
                  <input
                    type="text"
                    required
                    value={classForm.name}
                    onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Faculty / Academic Wing</label>
                  <select
                    value={classForm.faculty}
                    onChange={(e) => setClassForm({ ...classForm, faculty: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Pre-Primary">Pre-Primary (Kindergarten)</option>
                    <option value="Primary">Primary (Grade 1 - 5)</option>
                    <option value="Lower Secondary">Lower Secondary (Grade 6 - 8)</option>
                    <option value="Secondary">Secondary (Grade 9 - 10 / SEE)</option>
                    <option value="+2 Science">+2 Science (NEB)</option>
                    <option value="+2 Management">+2 Management (NEB)</option>
                    <option value="+2 Humanities">+2 Humanities / Arts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Display Order Sequence</label>
                  <input
                    type="number"
                    min="1"
                    value={classForm.order_index}
                    onChange={(e) => setClassForm({ ...classForm, order_index: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Capacity</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={classForm.capacity}
                    onChange={(e) => setClassForm({ ...classForm, capacity: parseInt(e.target.value) || 40 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Room No</label>
                  <input
                    type="text"
                    value={classForm.room_no}
                    onChange={(e) => setClassForm({ ...classForm, room_no: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Class Teacher</label>
                  <select
                    value={classForm.class_teacher_id}
                    onChange={(e) => setClassForm({ ...classForm, class_teacher_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Select Teacher --</option>
                    {teachersList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditClassModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-md"
                >
                  Save Class Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 8: ADD SECTION */}
      {showAddSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddSectionModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Add New Section</h3>
                <p className="text-xs text-slate-400">
                  Adding parallel cohort to <span className="text-emerald-400 font-bold">{sectionForm.class_name}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleAddSection} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Section Identifier *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Section B, Section C"
                  value={sectionForm.name}
                  onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    placeholder="Room 205"
                    value={sectionForm.room_no}
                    onChange={(e) => setSectionForm({ ...sectionForm, room_no: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Section Capacity</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={sectionForm.capacity}
                    onChange={(e) => setSectionForm({ ...sectionForm, capacity: parseInt(e.target.value) || 40 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Section Class Teacher</label>
                <select
                  value={sectionForm.class_teacher_id}
                  onChange={(e) => setSectionForm({ ...sectionForm, class_teacher_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="">-- Select Teacher --</option>
                  {teachersList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white cursor-pointer shadow-md"
                >
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SisTab;

