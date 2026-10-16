import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  FileText,
  CreditCard,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  DollarSign,
  X,
  Edit2,
  ShieldCheck,
  Calendar,
  BookOpen,
  Lock,
  Layers,
  GraduationCap,
  School,
  Trash2,
  Check,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  fetchHrData,
  applyStaffLeave,
  updateStaffLeaveStatus,
  fetchPayrollData,
  generateMonthlyPayroll,
  createStaff,
  updateStaff,
  fetchClassesOverview,
} from '../../../services/api';

const HumanResourceTab = ({ isDark }) => {
  const { lang, currentBranch } = useAuth();
  const [subTab, setSubTab] = useState('directory'); // 'directory' | 'leaves' | 'payroll'

  const HR_STORAGE_KEY = 'alchemist_sms_hr_data_cache_v1';
  const PAYROLL_STORAGE_KEY = 'alchemist_sms_payroll_cache_v1';
  const ROUTINE_STORAGE_KEY = 'alchemist_sms_teacher_routines_v1';
  const CLASSES_STORAGE_KEY = 'alchemist_sms_classes_cache_v1';

  const defaultStaff = [
    {
      id: 1,
      name: 'RJ Rana',
      email: 'rj.rana@alchemist.edu.np',
      phone: '+977 9841234567',
      role_name: 'teacher',
      department: 'Mathematics & STEM',
      teaching_subjects: ['Compulsory Mathematics', 'Optional Mathematics'],
      assigned_classes: ['Grade 10', 'Grade 9', 'Grade 11 - Science'],
      status: 'active',
      joined_date: '2024-04-14',
      salary: 65000,
      daily_routine: [
        { period: '1st Period', time: '09:30 - 10:15 AM', class: 'Grade 10 - Section A', subject: 'Compulsory Mathematics', room: 'Hall 302' },
        { period: '2nd Period', time: '10:15 - 11:00 AM', class: 'Grade 9 - Section B', subject: 'Compulsory Mathematics', room: 'Hall 204' },
        { period: '3rd Period', time: '11:00 - 11:45 AM', class: 'Grade 10 - Section B', subject: 'Optional Mathematics', room: 'Hall 304' },
        { period: '5th Period', time: '01:05 - 01:50 PM', class: 'Grade 11 - Science', subject: 'Advanced Mathematics', room: 'Sci Lab 1' },
      ],
    },
    {
      id: 2,
      name: 'Dr. K. Acharya',
      email: 'k.acharya@alchemist.edu.np',
      phone: '+977 9841987654',
      role_name: 'principal',
      department: 'Academics & Science',
      teaching_subjects: ['Science & Technology', 'Physics'],
      assigned_classes: ['Grade 11 - Science', 'Grade 10'],
      status: 'active',
      joined_date: '2023-01-10',
      salary: 85000,
      daily_routine: [
        { period: '2nd Period', time: '10:15 - 11:00 AM', class: 'Grade 11 - Science', subject: 'Physics Lab', room: 'Sci Lab 1' },
        { period: '4th Period', time: '11:45 - 12:30 PM', class: 'Grade 10 - Section A', subject: 'Science & Technology', room: 'Sci Lab 2' },
      ],
    },
    {
      id: 3,
      name: 'Suman Shrestha',
      email: 'suman.s@alchemist.edu.np',
      phone: '+977 9851122334',
      role_name: 'teacher',
      department: 'English & Humanities',
      teaching_subjects: ['Compulsory English', 'Literature & Creative Writing'],
      assigned_classes: ['Grade 10', 'Grade 9'],
      status: 'active',
      joined_date: '2024-05-01',
      salary: 58000,
      daily_routine: [
        { period: '1st Period', time: '09:30 - 10:15 AM', class: 'Grade 9 - Section A', subject: 'Compulsory English', room: 'Hall 201' },
        { period: '3rd Period', time: '11:00 - 11:45 AM', class: 'Grade 10 - Section A', subject: 'English Literature', room: 'Hall 302' },
      ],
    },
    {
      id: 4,
      name: 'Pooja Thapa',
      email: 'pooja.thapa@alchemist.edu.np',
      phone: '+977 9813445566',
      role_name: 'teacher',
      department: 'Computer Science & ICT',
      teaching_subjects: ['Computer Science', 'Web Technology & Python'],
      assigned_classes: ['Grade 12 - Management', 'Grade 10'],
      status: 'active',
      joined_date: '2024-06-15',
      salary: 60000,
      daily_routine: [
        { period: '2nd Period', time: '10:15 - 11:00 AM', class: 'Grade 12 - Management', subject: 'Computer Applications', room: 'Hall 401' },
        { period: '6th Period', time: '02:00 - 02:45 PM', class: 'Grade 10 - Section A', subject: 'Computer Coding', room: 'Computer Lab' },
      ],
    },
    {
      id: 5,
      name: 'Bikram Karki',
      email: 'bikram.k@alchemist.edu.np',
      phone: '+977 9861334455',
      role_name: 'teacher',
      department: 'Social Studies & Civics',
      teaching_subjects: ['Social Studies', 'Civics & Moral Education'],
      assigned_classes: ['Grade 9', 'Grade 8'],
      status: 'active',
      joined_date: '2024-08-01',
      salary: 55000,
      daily_routine: [
        { period: '2nd Period', time: '10:15 - 11:00 AM', class: 'Grade 9 - Section A', subject: 'Social Studies', room: 'Hall 201' },
      ],
    },
    {
      id: 8,
      name: 'Mandira Adhikari',
      email: 'mandira.adhikari@alchemist.edu.np',
      phone: '+977 9841889900',
      role_name: 'teacher',
      department: 'Nepali Language & Literature',
      teaching_subjects: ['Nepali (नेपाली अनिवार्य)', 'Nepali Byakaran (व्याकरण तथा रचना)'],
      assigned_classes: ['Grade 10', 'Grade 9'],
      status: 'active',
      joined_date: '2024-03-01',
      salary: 62000,
      daily_routine: [
        { period: '4th Period', time: '11:45 - 12:30 PM', class: 'Grade 10 - Section A', subject: 'Nepali Byakaran', room: 'Hall 302' },
        { period: '5th Period', time: '01:05 - 01:50 PM', class: 'Grade 9 - Section A', subject: 'Nepali Sahitya', room: 'Hall 201' },
      ],
    },
    {
      id: 6,
      name: 'Hari Bahadur Tamang',
      email: 'hari.tamang@alchemist.edu.np',
      phone: '+977 9841556677',
      role_name: 'staff',
      department: 'Transport Logistics (Route 3)',
      status: 'active',
      joined_date: '2023-09-01',
      salary: 35000,
    },
    {
      id: 7,
      name: 'Sita Sharma',
      email: 'cashier@alchemist.edu.np',
      phone: '+977 9801223344',
      role_name: 'accountant',
      department: 'Accounts & Bursar',
      status: 'active',
      joined_date: '2023-11-01',
      salary: 52000,
    },
  ];

  const defaultLeaves = [
    {
      id: 101,
      staff_name: 'Suman Shrestha',
      role_name: 'teacher',
      leave_type: 'casual',
      from_date: '2026-10-18',
      to_date: '2026-10-19',
      days_count: 2,
      reason: 'Family cultural ceremony and Dashain travel',
      status: 'approved',
      applied_on: '2026-10-12',
    },
    {
      id: 102,
      staff_name: 'Pooja Thapa',
      role_name: 'teacher',
      leave_type: 'medical',
      from_date: '2026-10-15',
      to_date: '2026-10-16',
      days_count: 1,
      reason: 'Dental appointment & seasonal flu checkup',
      status: 'pending',
      applied_on: '2026-10-14',
    },
  ];

  const defaultPayroll = {
    structures: [
      { id: 1, role_name: 'principal', basic_salary: 85000, allowance: 15000, tax_rate: 10 },
      { id: 2, role_name: 'teacher', basic_salary: 60000, allowance: 8000, tax_rate: 5 },
      { id: 3, role_name: 'accountant', basic_salary: 52000, allowance: 6000, tax_rate: 5 },
      { id: 4, role_name: 'staff', basic_salary: 35000, allowance: 4000, tax_rate: 1 },
    ],
    payslips: [
      { id: 201, staff_name: 'RJ Rana', month: 'Ashwin', year: '2083 BS', gross: 68000, deductions: 3400, net: 64600, status: 'paid', paid_on: '2026-10-05' },
      { id: 202, staff_name: 'Dr. K. Acharya', month: 'Ashwin', year: '2083 BS', gross: 100000, deductions: 10000, net: 90000, status: 'paid', paid_on: '2026-10-05' },
      { id: 203, staff_name: 'Sita Sharma', month: 'Ashwin', year: '2083 BS', gross: 58000, deductions: 2900, net: 55100, status: 'paid', paid_on: '2026-10-05' },
    ],
  };

  const getStoredHr = () => {
    try {
      const raw = localStorage.getItem(HR_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  const saveHrToStorage = (data) => {
    try {
      localStorage.setItem(HR_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  };

  const [hrData, setHrData] = useState(() => getStoredHr() || { staff_directory: defaultStaff, leaves: defaultLeaves });
  const [payrollData, setPayrollData] = useState(defaultPayroll);
  const [loading, setLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Available classes for assignments
  const [availableClasses, setAvailableClasses] = useState(['Grade 10', 'Grade 9', 'Grade 11 - Science', 'Grade 12 - Management']);

  // Staff Management Modal State
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffModalMode, setStaffModalMode] = useState('create'); // 'create' | 'edit'
  const [staffForm, setStaffForm] = useState({
    id: null,
    name: '',
    email: '',
    phone: '',
    role_name: 'teacher',
    department: 'Academics & Teaching',
    teaching_subjects: 'Mathematics',
    assigned_classes: ['Grade 10'],
    salary: 60000,
    status: 'active',
    password: '',
  });

  // Daily Routine & Class Schedule Assignment Modal
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [selectedTeacherForRoutine, setSelectedTeacherForRoutine] = useState(null);
  const [routinePeriods, setRoutinePeriods] = useState([]);
  const [newPeriodForm, setNewPeriodForm] = useState({
    period: '1st Period',
    time: '09:30 - 10:15 AM',
    class: 'Grade 10 - Section A',
    subject: 'Compulsory Mathematics',
    room: 'Hall 302',
  });

  // Form State for Leave Application
  const [leaveForm, setLeaveForm] = useState({
    staff_user_id: '',
    leave_type: 'casual',
    from_date: new Date().toISOString().split('T')[0],
    to_date: new Date().toISOString().split('T')[0],
    days_count: 1,
    reason: '',
  });

  const loadData = async () => {
    setLoading(true);
    const cachedHr = getStoredHr();
    try {
      const [hRes, pRes] = await Promise.allSettled([
        fetchHrData(),
        fetchPayrollData(),
      ]);
      if (hRes.status === 'fulfilled' && hRes.value?.success && hRes.value.data?.staff_directory?.length > 0) {
        setHrData(hRes.value.data);
        saveHrToStorage(hRes.value.data);
      } else if (cachedHr) {
        setHrData(cachedHr);
      } else {
        const initial = { staff_directory: defaultStaff, leaves: defaultLeaves };
        setHrData(initial);
        saveHrToStorage(initial);
      }

      if (pRes.status === 'fulfilled' && pRes.value?.success) {
        setPayrollData(pRes.value.data);
      }
    } catch (err) {
      console.warn('Backend HR data unavailable, using local cache:', err);
      if (cachedHr) {
        setHrData(cachedHr);
      } else {
        const initial = { staff_directory: defaultStaff, leaves: defaultLeaves };
        setHrData(initial);
        saveHrToStorage(initial);
      }
    } finally {
      setLoading(false);
    }

    // Load classes list for routine dropdowns
    try {
      const rawCls = localStorage.getItem(CLASSES_STORAGE_KEY);
      if (rawCls) {
        const parsed = JSON.parse(rawCls);
        if (parsed.length > 0) {
          setAvailableClasses(parsed.map((c) => c.name));
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
  }, [currentBranch]);

  // Leave Handlers
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.reason) {
      alert('Reason for leave is required.');
      return;
    }
    let backendSuccess = false;
    try {
      const res = await applyStaffLeave(leaveForm);
      if (res && res.success) {
        backendSuccess = true;
      }
    } catch (err) {
      console.warn('Backend applyStaffLeave unavailable, saving locally:', err);
    }

    const staffMember = (hrData?.staff_directory || []).find((s) => String(s.id) === String(leaveForm.staff_user_id));
    const newLeave = {
      id: Date.now(),
      staff_name: staffMember ? staffMember.name : 'Faculty Member',
      role_name: staffMember ? staffMember.role_name : 'teacher',
      leave_type: leaveForm.leave_type,
      from_date: leaveForm.from_date,
      to_date: leaveForm.to_date,
      days_count: leaveForm.days_count || 1,
      reason: leaveForm.reason,
      status: 'pending',
      applied_on: new Date().toISOString().split('T')[0],
    };

    const currentLeaves = hrData?.leaves || [];
    const updatedLeaves = [newLeave, ...currentLeaves];
    const updatedHr = {
      ...(hrData || {}),
      leaves: updatedLeaves,
    };
    setHrData(updatedHr);
    saveHrToStorage(updatedHr);
    setShowApplyModal(false);
    alert(`Leave application submitted successfully!${backendSuccess ? '' : ' (Saved locally)'}`);
  };

  const handleLeaveDecision = async (leaveId, decision) => {
    const notes = prompt(`Enter optional decision note for ${decision}:`) || '';
    try {
      await updateStaffLeaveStatus(leaveId, decision, notes);
    } catch (e) {
      console.warn('Backend updateStaffLeaveStatus unavailable, updating locally:', e);
    }

    const currentLeaves = hrData?.leaves || [];
    const updatedLeaves = currentLeaves.map((l) => (l.id === leaveId ? { ...l, status: decision } : l));
    const updatedHr = { ...(hrData || {}), leaves: updatedLeaves };
    setHrData(updatedHr);
    saveHrToStorage(updatedHr);
    alert(`Leave application marked as ${decision}.`);
  };

  // Staff Modal Openers
  const handleOpenCreateStaff = () => {
    setStaffModalMode('create');
    setStaffForm({
      id: null,
      name: '',
      email: '',
      phone: '',
      role_name: 'teacher',
      department: 'Academics & Teaching',
      teaching_subjects: 'Nepali, Mathematics',
      assigned_classes: ['Grade 10', 'Grade 9'],
      salary: 60000,
      status: 'active',
      password: '',
    });
    setShowStaffModal(true);
  };

  const handleOpenEditStaff = (member) => {
    setStaffModalMode('edit');
    const subjectsStr = Array.isArray(member.teaching_subjects)
      ? member.teaching_subjects.join(', ')
      : member.teaching_subjects || (member.department || 'General');

    setStaffForm({
      id: member.id,
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      role_name: member.role_name || 'teacher',
      department: member.department || (member.role_name === 'teacher' ? 'Academics & Teaching' : 'Administration'),
      teaching_subjects: subjectsStr,
      assigned_classes: Array.isArray(member.assigned_classes) ? member.assigned_classes : ['Grade 10'],
      salary: member.salary || (member.role_name === 'principal' ? 85000 : 60000),
      status: member.status || 'active',
      password: '',
    });
    setShowStaffModal(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.email) {
      alert('Staff name and email are required.');
      return;
    }

    let backendSuccess = false;
    try {
      let res;
      if (staffModalMode === 'create') {
        res = await createStaff(staffForm);
      } else {
        res = await updateStaff(staffForm);
      }
      if (res && res.success) {
        backendSuccess = true;
      }
    } catch (err) {
      console.warn('Backend staff API unavailable, saving locally:', err);
    }

    // Parse subjects into clean array
    const subjectList = typeof staffForm.teaching_subjects === 'string'
      ? staffForm.teaching_subjects.split(',').map((s) => s.trim()).filter(Boolean)
      : staffForm.teaching_subjects;

    const currentStaffList = hrData?.staff_directory || [];
    let updatedStaffList;

    if (staffModalMode === 'create') {
      const newStaffMember = {
        id: Date.now(),
        name: staffForm.name,
        email: staffForm.email,
        phone: staffForm.phone || '+977 98XXXXXXXX',
        role_name: staffForm.role_name || 'teacher',
        department: staffForm.department || (staffForm.role_name === 'teacher' ? 'Academics & Teaching' : 'Operations'),
        teaching_subjects: subjectList,
        assigned_classes: staffForm.assigned_classes || ['Grade 10'],
        salary: parseInt(staffForm.salary) || (staffForm.role_name === 'teacher' ? 60000 : 50000),
        status: staffForm.status || 'active',
        joined_date: new Date().toISOString().split('T')[0],
        daily_routine: [
          { period: '1st Period', time: '09:30 - 10:15 AM', class: 'Grade 10 - Section A', subject: subjectList[0] || 'Subject', room: 'Hall 302' },
        ],
      };
      updatedStaffList = [newStaffMember, ...currentStaffList];
    } else {
      updatedStaffList = currentStaffList.map((m) =>
        m.id === staffForm.id
          ? {
              ...m,
              ...staffForm,
              teaching_subjects: subjectList,
              assigned_classes: staffForm.assigned_classes,
              salary: parseInt(staffForm.salary) || m.salary || 60000,
            }
          : m
      );
    }

    const updatedHr = {
      ...(hrData || {}),
      staff_directory: updatedStaffList,
    };
    setHrData(updatedHr);
    saveHrToStorage(updatedHr);

    try {
      window.dispatchEvent(new CustomEvent('alchemist_sms_staff_updated', { detail: { staff: updatedStaffList } }));
    } catch (e) {}

    setShowStaffModal(false);
    alert(
      `Staff member "${staffForm.name}" ${
        staffModalMode === 'create' ? 'registered' : 'updated'
      } successfully!${backendSuccess ? '' : ' (Saved to local workspace)'}`
    );
  };

  // ROUTINE / DAILY CLASS SCHEDULE ASSIGNMENT HANDLERS
  const handleOpenRoutineModal = (teacher) => {
    setSelectedTeacherForRoutine(teacher);
    let routine = teacher.daily_routine || [];

    // Check central routine storage
    try {
      const raw = localStorage.getItem(ROUTINE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed[teacher.name] || parsed[teacher.id]) {
          routine = parsed[teacher.name] || parsed[teacher.id];
        }
      }
    } catch (e) {}

    setRoutinePeriods(routine.length > 0 ? routine : [
      { period: '1st Period', time: '09:30 - 10:15 AM', class: 'Grade 10 - Section A', subject: teacher.teaching_subjects?.[0] || 'Mathematics', room: 'Hall 302' },
      { period: '2nd Period', time: '10:15 - 11:00 AM', class: 'Grade 9 - Section B', subject: teacher.teaching_subjects?.[0] || 'Mathematics', room: 'Hall 204' },
      { period: 'Break', time: '11:45 - 12:20 PM', class: 'Staff Lounge', subject: 'Faculty Meeting & Lunch', room: 'Common Room' },
    ]);

    setNewPeriodForm({
      period: '1st Period',
      time: '09:30 - 10:15 AM',
      class: teacher.assigned_classes?.[0] ? `${teacher.assigned_classes[0]} - Section A` : 'Grade 10 - Section A',
      subject: teacher.teaching_subjects?.[0] || 'Subject',
      room: 'Room 201',
    });

    setShowRoutineModal(true);
  };

  const handleAddPeriodToRoutine = (e) => {
    e.preventDefault();
    if (!newPeriodForm.subject || !newPeriodForm.class) {
      alert('Class and subject are required for the routine period.');
      return;
    }
    setRoutinePeriods((prev) => [...prev, { ...newPeriodForm }]);
  };

  const handleRemovePeriod = (index) => {
    setRoutinePeriods((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveTeacherRoutine = () => {
    if (!selectedTeacherForRoutine) return;
    const teacher = selectedTeacherForRoutine;

    // 1. Save to central routine storage
    try {
      const raw = localStorage.getItem(ROUTINE_STORAGE_KEY);
      const routineMap = raw ? JSON.parse(raw) : {};
      routineMap[teacher.name] = routinePeriods;
      routineMap[teacher.id] = routinePeriods;
      localStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(routineMap));
    } catch (e) {}

    // 2. Update in HR directory state
    const currentStaffList = hrData?.staff_directory || [];
    const updatedStaffList = currentStaffList.map((m) =>
      m.id === teacher.id ? { ...m, daily_routine: routinePeriods } : m
    );
    const updatedHr = { ...(hrData || {}), staff_directory: updatedStaffList };
    setHrData(updatedHr);
    saveHrToStorage(updatedHr);

    // 3. Dispatch sync event so Teacher Cockpit immediately reflects it
    try {
      window.dispatchEvent(
        new CustomEvent('alchemist_sms_routine_updated', {
          detail: {
            teacherName: teacher.name,
            teacherId: teacher.id,
            routine: routinePeriods,
          },
        })
      );
    } catch (e) {}

    setShowRoutineModal(false);
    alert(`Daily routine and class schedule for ${teacher.name} updated & synchronized live to Teacher Cockpit!`);
  };

  const staff = hrData?.staff_directory || [];
  const leaves = hrData?.leaves || [];
  const payrollSlips = payrollData?.payslips || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-500" />
            <span>{lang === 'ne' ? 'मानव संसाधन तथा संकाय व्यवस्थापन' : 'Human Resources & Faculty Management'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Teacher subject specializations, multi-class assignments, daily routine schedule, and confidential payroll
          </p>
        </div>

        {subTab === 'directory' && (
          <button
            type="button"
            onClick={handleOpenCreateStaff}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ne' ? 'नयाँ शिक्षक / कर्मचारी थप्नुहोस्' : 'Add Teacher / Staff'}</span>
          </button>
        )}

        {subTab === 'leaves' && (
          <button
            type="button"
            onClick={() => setShowApplyModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ne' ? 'बिदा निवेदन दर्ता' : 'Apply for Leave'}</span>
          </button>
        )}
      </div>

      {/* Subtab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-700/50 pb-2">
        <button
          type="button"
          onClick={() => setSubTab('directory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'directory'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{lang === 'ne' ? 'कर्मचारी नामावली तथा दिनचर्या' : 'Staff Directory & Schedule'}</span>
          <span className="ml-1 px-2 py-0.2 rounded-full text-[10px] bg-blue-500/30 text-blue-300">
            {staff.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'leaves'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{lang === 'ne' ? 'बिदा व्यवस्थापन' : 'Leave Workflow'}</span>
          <span className="ml-1 px-2 py-0.2 rounded-full text-[10px] bg-amber-500/30 text-amber-300">
            {leaves.filter((l) => l.status === 'pending').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('payroll')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'payroll'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{lang === 'ne' ? 'कर्मचारी तलब तथा पेस्लिप' : 'Staff Payroll'}</span>
        </button>
      </div>

      {/* Directory Tab */}
      {subTab === 'directory' && (
        <div
          className={`rounded-3xl border overflow-hidden ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`uppercase tracking-wider font-bold text-[10px] border-b ${
                  isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <tr>
                  <th className="px-4 py-3.5">Staff & Contact</th>
                  <th className="px-4 py-3.5">Role / Department</th>
                  <th className="px-4 py-3.5">Subject Specialization</th>
                  <th className="px-4 py-3.5">Assigned Classes</th>
                  <th className="px-4 py-3.5">Confidential Salary</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
                {staff.map((s) => {
                  const isTeacher = s.role_name === 'teacher' || s.role_name === 'principal' || (s.department || '').toLowerCase().includes('teach');
                  const subjects = Array.isArray(s.teaching_subjects) ? s.teaching_subjects : (s.teaching_subjects ? [s.teaching_subjects] : []);
                  const classes = Array.isArray(s.assigned_classes) ? s.assigned_classes : (s.assigned_classes ? [s.assigned_classes] : []);

                  return (
                    <tr
                      key={s.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Name & Contact */}
                      <td className="px-4 py-3.5">
                        <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{s.email}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{s.phone || '9841000000'}</div>
                      </td>

                      {/* Role & Department */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                            s.role_name === 'teacher'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : s.role_name === 'principal'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {s.role_name}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1 max-w-[140px] truncate">{s.department}</div>
                      </td>

                      {/* Teaching Subjects */}
                      <td className="px-4 py-3.5">
                        {isTeacher && subjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[190px]">
                            {subjects.map((sub, idx) => {
                              const subLower = sub.toLowerCase();
                              const isNepali = subLower.includes('nepali');
                              const isScience = subLower.includes('science') || subLower.includes('physics');
                              const isMath = subLower.includes('math');

                              return (
                                <span
                                  key={idx}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                                    isNepali
                                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                                      : isScience
                                      ? 'bg-teal-500/10 text-teal-300 border-teal-500/20'
                                      : isMath
                                      ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                                      : 'bg-slate-800 text-slate-300 border-slate-700'
                                  }`}
                                >
                                  {isNepali ? '🇳🇵 ' : isScience ? '🔬 ' : isMath ? '📐 ' : '📖 '}
                                  {sub}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">— Non-Teaching</span>
                        )}
                      </td>

                      {/* Assigned Classes */}
                      <td className="px-4 py-3.5">
                        {isTeacher && classes.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[170px]">
                            {classes.map((cls, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold border ${
                                  isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                                }`}
                              >
                                {cls}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">—</span>
                        )}
                      </td>

                      {/* Confidential Salary */}
                      <td className="px-4 py-3.5">
                        <div
                          className="flex items-center gap-1.5 font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 w-fit"
                          title="Management System Confidential: Visible exclusively to school administrators."
                        >
                          <Lock className="w-3 h-3 text-emerald-400" />
                          <span>NPR {(s.salary || 60000).toLocaleString()}</span>
                          <span className="text-[9px] text-slate-400">/ mo</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          {s.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions: Daily Routine & Edit */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isTeacher && (
                            <button
                              type="button"
                              onClick={() => handleOpenRoutineModal(s)}
                              className="px-2.5 py-1 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 border border-indigo-500/30 font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                              title={`Assign Daily Routine & Class Schedule for ${s.name}`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>Set Routine</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenEditStaff(s)}
                            className="p-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors cursor-pointer"
                            title="Edit Staff Member Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leaves Tab */}
      {subTab === 'leaves' && (
        <div
          className={`rounded-3xl border overflow-hidden ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`uppercase tracking-wider font-bold text-[10px] border-b ${
                  isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <tr>
                  <th className="px-4 py-3">Staff Name</th>
                  <th className="px-4 py-3">Leave Type</th>
                  <th className="px-4 py-3">Dates & Days</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                      No leave applications submitted.
                    </td>
                  </tr>
                ) : (
                  leaves.map((l) => {
                    const isPending = l.status === 'pending';
                    const isApproved = l.status === 'approved';
                    return (
                      <tr
                        key={l.id}
                        className={`transition-colors ${
                          isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className={`px-4 py-3 font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                          {l.staff_name}
                          <div className="text-[10px] text-slate-400 font-normal">{l.role_name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {l.leave_type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {l.from_date} to {l.to_date}
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold">{l.days_count} Day(s)</div>
                        </td>
                        <td className={`px-4 py-3 max-w-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          <div>{l.reason}</div>
                          {l.decision_notes && (
                            <div className="text-[10px] text-slate-400 mt-0.5 italic">Note: {l.decision_notes}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isApproved
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : isPending
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleLeaveDecision(l.id, 'approved')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLeaveDecision(l.id, 'rejected')}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500">Processed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payroll Tab */}
      {subTab === 'payroll' && (
        <div className="space-y-4">
          <div
            className={`rounded-3xl border overflow-hidden ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Monthly Institutional Payroll Disbursement</h3>
                <p className="text-xs text-slate-400">Ashwin 2083 BS Salary records with automated tax deduction</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Staff Member</th>
                    <th className="px-4 py-3">Gross Salary</th>
                    <th className="px-4 py-3">Deductions / Tax</th>
                    <th className="px-4 py-3">Net Disbursed</th>
                    <th className="px-4 py-3">Disbursement Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {payrollSlips.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 font-bold text-white">{p.staff_name}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">NPR {p.gross.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-rose-400">NPR {p.deductions.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-400">NPR {p.net.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{p.paid_on}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: LEAVE APPLICATION ================= */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Apply for Staff Leave</h3>
            <p className="text-xs text-slate-400 mb-4">Submit leave request for administrative review.</p>

            <form onSubmit={handleApplyLeave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Select Staff Member *</label>
                <select
                  required
                  value={leaveForm.staff_user_id}
                  onChange={(e) => setLeaveForm({ ...leaveForm, staff_user_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none"
                >
                  <option value="">-- Choose Faculty Member --</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Leave Type</label>
                  <select
                    value={leaveForm.leave_type}
                    onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="casual">Casual Leave</option>
                    <option value="medical">Medical / Sick Leave</option>
                    <option value="maternity">Maternity / Paternity</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Total Days</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={leaveForm.days_count}
                    onChange={(e) => setLeaveForm({ ...leaveForm, days_count: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">From Date</label>
                  <input
                    type="date"
                    value={leaveForm.from_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, from_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">To Date</label>
                  <input
                    type="date"
                    value={leaveForm.to_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, to_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Reason for Leave *</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Details of absence request..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT TEACHER OR STAFF MEMBER ================= */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowStaffModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">
                {staffModalMode === 'create' ? 'Register Faculty / Staff Member' : 'Edit Staff Record'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {staffModalMode === 'create'
                ? 'Create faculty credentials, assign subject specializations, multi-class cohorts, and confidential salary.'
                : 'Update teacher subjects, assigned classes, and confidential institutional compensation.'}
            </p>

            <form onSubmit={handleSaveStaff} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandira Adhikari or RJ Rana"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="mandira@alchemist.edu.np"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="9841889900"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Role / Designation *</label>
                  <select
                    value={staffForm.role_name}
                    onChange={(e) => setStaffForm({ ...staffForm, role_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="teacher">Faculty Teacher (विषय शिक्षक)</option>
                    <option value="admin">School Administrator (प्रशासक)</option>
                    <option value="principal">Principal (प्रधानाध्यापक)</option>
                    <option value="accountant">Accountant / Cashier (लेखापाल)</option>
                    <option value="librarian">Librarian (पुस्तकालय प्रमुख)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Department Wing</label>
                  <input
                    type="text"
                    placeholder="e.g. Nepali Language or STEM"
                    value={staffForm.department}
                    onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Subject Specialization Input with Quick Chips */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-emerald-400">
                    Teaching Subjects (Specialization) *
                  </label>
                  <span className="text-[10px] text-slate-400">Click chips to add</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Nepali Language',
                    'Nepali Byakaran',
                    'Compulsory Mathematics',
                    'Optional Mathematics',
                    'Science & Technology',
                    'Physics',
                    'Compulsory English',
                    'Social Studies',
                    'Computer Science',
                    'Accountancy',
                    'Economics',
                  ].map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        const current = staffForm.teaching_subjects ? staffForm.teaching_subjects.split(',').map((s) => s.trim()) : [];
                        if (!current.includes(sub)) {
                          const updated = [...current, sub].join(', ');
                          setStaffForm({ ...staffForm, teaching_subjects: updated });
                        }
                      }}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-900 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-300 border border-slate-800 cursor-pointer transition-colors"
                    >
                      + {sub}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="e.g. Nepali Language, Nepali Byakaran, or Compulsory Mathematics"
                  value={staffForm.teaching_subjects}
                  onChange={(e) => setStaffForm({ ...staffForm, teaching_subjects: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              {/* Assigned Classes (Multi-Class Support) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <label className="block text-[11px] font-bold text-teal-400">
                  Assigned Classes (1 Teacher Can Teach Multiple Classes)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableClasses.map((clsName) => {
                    const isAssigned = (staffForm.assigned_classes || []).includes(clsName);
                    return (
                      <label
                        key={clsName}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isAssigned
                            ? 'bg-teal-500/15 border-teal-500/40 text-teal-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={(e) => {
                            const cur = staffForm.assigned_classes || [];
                            if (e.target.checked) {
                              setStaffForm({ ...staffForm, assigned_classes: [...cur, clsName] });
                            } else {
                              setStaffForm({ ...staffForm, assigned_classes: cur.filter((c) => c !== clsName) });
                            }
                          }}
                          className="rounded text-teal-500 focus:ring-0"
                        />
                        <span className="font-semibold">{clsName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Confidential Salary (Management System Only) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Confidential Monthly Salary (NPR) *</span>
                  </label>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    🔒 Admin Only
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">
                    NPR
                  </span>
                  <input
                    type="number"
                    min="15000"
                    step="1000"
                    required
                    value={staffForm.salary}
                    onChange={(e) => setStaffForm({ ...staffForm, salary: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Salary is securely stored and exclusively displayed inside the management administrative dashboard.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md"
                >
                  {staffModalMode === 'create' ? 'Register Staff Member' : 'Save Staff Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TEACHER DAILY ROUTINE & SCHEDULE MANAGER ================= */}
      {showRoutineModal && selectedTeacherForRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl relative max-h-[92vh] flex flex-col">
            <button
              onClick={() => setShowRoutineModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">
                  Assign Daily Class Routine: {selectedTeacherForRoutine.name}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure today's periods, assigned classes, and subject slots. Synchronizes live with Teacher Cockpit.
              </p>
            </div>

            {/* List of Scheduled Periods */}
            <div className="my-4 flex-1 overflow-y-auto space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>Today's Active Periods ({routinePeriods.length})</span>
                <span className="text-[10px] text-emerald-400 font-mono">Live Sync with Teacher Cockpit</span>
              </div>

              {routinePeriods.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
                  No periods scheduled for today yet. Use the form below to assign classes and subjects.
                </div>
              ) : (
                routinePeriods.map((slot, idx) => {
                  const isBreak = (slot.period || '').toLowerCase().includes('break');
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                        isBreak
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 font-mono font-bold text-[10px] text-indigo-300">
                          {slot.period}
                        </span>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{slot.subject}</span>
                            <span className="text-slate-400 text-[11px]">• {slot.class}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {slot.time} • Room: {slot.room}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemovePeriod(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 cursor-pointer transition-colors"
                        title="Remove Period Slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add New Period Form */}
            <form onSubmit={handleAddPeriodToRoutine} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">
                + Assign New Period Slot for Today
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Period Slot</label>
                  <select
                    value={newPeriodForm.period}
                    onChange={(e) => {
                      const p = e.target.value;
                      const timeMap = {
                        '1st Period': '09:30 - 10:15 AM',
                        '2nd Period': '10:15 - 11:00 AM',
                        '3rd Period': '11:00 - 11:45 AM',
                        'Break': '11:45 - 12:20 PM',
                        '4th Period': '12:20 - 01:05 PM',
                        '5th Period': '01:05 - 01:50 PM',
                        '6th Period': '02:00 - 02:45 PM',
                        '7th Period': '02:45 - 03:30 PM',
                      };
                      setNewPeriodForm({
                        ...newPeriodForm,
                        period: p,
                        time: timeMap[p] || newPeriodForm.time,
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                  >
                    <option value="1st Period">1st Period</option>
                    <option value="2nd Period">2nd Period</option>
                    <option value="3rd Period">3rd Period</option>
                    <option value="Break">Break / Lunch</option>
                    <option value="4th Period">4th Period</option>
                    <option value="5th Period">5th Period</option>
                    <option value="6th Period">6th Period</option>
                    <option value="7th Period">7th Period</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Assign Class Cohort</label>
                  <select
                    value={newPeriodForm.class}
                    onChange={(e) => setNewPeriodForm({ ...newPeriodForm, class: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                  >
                    {availableClasses.map((c) => (
                      <React.Fragment key={c}>
                        <option value={`${c} - Section A`}>{c} - Section A</option>
                        <option value={`${c} - Section B`}>{c} - Section B</option>
                      </React.Fragment>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nepali or Math"
                    value={newPeriodForm.subject}
                    onChange={(e) => setNewPeriodForm({ ...newPeriodForm, subject: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Room No</label>
                  <input
                    type="text"
                    required
                    placeholder="Hall 302"
                    value={newPeriodForm.room}
                    onChange={(e) => setNewPeriodForm({ ...newPeriodForm, room: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow"
                >
                  + Add Period to Today's Routine
                </button>
              </div>
            </form>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 mt-3">
              <button
                type="button"
                onClick={() => setShowRoutineModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTeacherRoutine}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Schedule & Sync to Teacher Cockpit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HumanResourceTab;
