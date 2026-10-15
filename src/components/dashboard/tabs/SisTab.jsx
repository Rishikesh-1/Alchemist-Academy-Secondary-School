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
} from 'lucide-react';
import {
  fetchStudents,
  registerStudent,
  importStudentsCsv,
  promoteStudents,
  issueTransferCertificate,
} from '../../../services/api';
import { formatDualDate, toNepaliNumerals } from '../../../utils/nepaliCalendar';
import { getTranslation } from '../../../utils/translations';
import { useAuth } from '../../../context/AuthContext';

const SisTab = ({ isDark, onSelectStudentForID, classRoster = [] }) => {
  const { lang, currentBranch } = useAuth();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showTcModal, setShowTcModal] = useState(false);
  const [selectedStudentForTC, setSelectedStudentForTC] = useState(null);
  const [issuedTcData, setIssuedTcData] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

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

  useEffect(() => {
    loadData();
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
            <tbody className="divide-y divide-slate-800/40">
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
                      className={`transition-colors hover:bg-slate-800/30 ${
                        isDark ? 'text-slate-200' : 'text-slate-800'
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
                            <div className="font-bold text-white">{studentName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Roll: {lang === 'ne' ? toNepaliNumerals(roll) : roll}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-emerald-400">{className}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{admNo}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-300">{guardian}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Phone className="w-2.5 h-2.5 text-slate-500" />
                          <span>{phone}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-[11px] text-slate-300">
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
              <img
                src={selectedProfile.photo_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedProfile.first_name || selectedProfile.name}`}
                alt="Profile"
                className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 object-cover"
              />
              <div>
                <h3 className="text-xl font-bold text-white">
                  {selectedProfile.first_name ? `${selectedProfile.first_name} ${selectedProfile.last_name || ''}` : selectedProfile.name}
                </h3>
                <div className="text-xs text-emerald-400 font-mono">
                  Adm: {selectedProfile.admission_no || selectedProfile.studentId} • Roll: {selectedProfile.roll_no || selectedProfile.rollNumber}
                </div>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SisTab;

