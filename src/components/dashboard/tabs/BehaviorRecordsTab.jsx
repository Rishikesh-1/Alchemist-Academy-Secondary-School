import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useSchoolData } from '../../../context/SchoolDataContext';
import { fetchBehaviorRecords, recordBehaviorIncident } from '../../../services/api';

const BehaviorRecordsTab = ({ isDark }) => {
  const { lang, currentBranch } = useAuth();
  const { schoolData } = useSchoolData();
  const { classRoster = [] } = schoolData || {};

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    try {
      const res = await fetchBehaviorRecords();
      if (res.success && res.data?.records) {
        setRecords(res.data.records);
      }
    } catch (err) {
      console.error('Error fetching behavior records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentBranch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      alert('Please fill incident title.');
      return;
    }
    const res = await recordBehaviorIncident(form);
    if (res.success) {
      alert('Behavior incident logged successfully.');
      setShowAddModal(false);
      setForm({
        student_id: 1,
        incident_type: 'positive',
        title: '',
        points: 10,
        description: '',
        action_taken: 'Commendation certificate awarded',
        guardian_notified: true,
      });
      loadData();
    } else {
      alert(res.message || 'Failed to log incident.');
    }
  };

  // Filtered
  const filtered = records.filter((r) => {
    if (filterType !== 'all' && r.incident_type !== filterType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase().includes(q);
      const matchTitle = (r.title || '').toLowerCase().includes(q);
      return matchName || matchTitle;
    }
    return true;
  });

  // KPI calculations
  const totalPositive = records.filter((r) => r.incident_type === 'positive').length;
  const totalDisciplinary = records.filter((r) => r.incident_type === 'disciplinary').length;
  const netPoints = records.reduce((sum, r) => sum + (Number(r.points) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {lang === 'ne' ? 'विद्यार्थी आचरण तथा अनुशासन अभिलेख' : 'Behavior & Conduct Tracking'}
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'ne'
              ? 'सकारात्मक योग्यता अङ्क (Merit), अनुशासन उल्लङ्घन तथा परामर्श अभिलेखीकरण'
              : 'Merit recognition points, disciplinary interventions, counseling notes, and parent alert logs'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'ne' ? 'नयाँ आचरण प्रविष्टि' : 'Log Incident / Merit'}</span>
        </button>
      </div>

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
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Type & Points</th>
                <th className="px-4 py-3">Incident Title & Description</th>
                <th className="px-4 py-3">Action Taken</th>
                <th className="px-4 py-3">Guardian</th>
                <th className="px-4 py-3">Reported By</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className={`px-4 py-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    No behavior records matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const isPositive = r.incident_type === 'positive';
                  const isDisciplinary = r.incident_type === 'disciplinary';
                  return (
                    <tr
                      key={r.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className={`px-4 py-3 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{r.incident_date}</td>
                      <td className="px-4 py-3">
                        <div className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                          {r.first_name} {r.last_name}
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base font-bold">Log Conduct & Demerit / Merit Points</h2>
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

