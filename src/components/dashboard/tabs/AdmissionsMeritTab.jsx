import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Award,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  FileCheck,
  Send,
  X,
} from 'lucide-react';
import { fetchAdmissionsMeritList, publishMeritList } from '../../../services/api';
import { formatDualDate, toNepaliNumerals } from '../../../utils/nepaliCalendar';
import { getTranslation } from '../../../utils/translations';
import { useAuth } from '../../../context/AuthContext';

const AdmissionsMeritTab = ({ isDark }) => {
  const { lang, currentBranch } = useAuth();
  const [applications, setApplications] = useState([]);
  const [meritLists, setMeritLists] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Publish Merit List modal state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishForm, setPublishForm] = useState({
    title: 'General Merit List - Grade 10 (Session 2026 / 2083 BS)',
    quota: 'Open Merit',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAdmissionsMeritList(selectedClassId);
      if (res && res.success && res.data) {
        setApplications(res.data.applications || []);
        setMeritLists(res.data.merit_lists || []);
      }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedClassId, currentBranch?.id]);

  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await publishMeritList(publishForm.title, selectedClassId, publishForm.quota);
      if (res && res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        setShowPublishModal(false);
        loadData();
      } else {
        setStatusMessage({ type: 'error', text: res?.message || 'Failed to publish merit list.' });
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: e.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border ${
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div>
          <h4 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Award className="w-4 h-4 text-emerald-500" />
            <span>Admissions Pipeline & Entrance Merit Lists</span>
          </h4>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Review online application leads, score entrance tests, and publish official rank lists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(Number(e.target.value))}
            className={`rounded-xl px-3 py-1.5 text-xs border focus:outline-none ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            <option value={1}>Grade 10</option>
            <option value={2}>Grade 9</option>
            <option value={3}>Grade 8</option>
          </select>

          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>{getTranslation('publish_merit_list', lang)}</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-medium border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Applications Table */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b uppercase text-[10px] ${
                isDark ? 'border-slate-800 bg-slate-900 text-slate-400 font-bold' : 'border-slate-200 bg-slate-50 text-slate-700 font-bold'
              }`}>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Applicant Name</th>
                <th className="py-3 px-4">Parent Guardian</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4 text-center">Entrance Score</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="6" className={`py-8 text-center ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                    {loading ? 'Loading applicant pipeline...' : 'No admission applications found for this class.'}
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className={isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'}>
                    <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {app.merit_rank ? `#${app.merit_rank}` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{app.applicant_name}</div>
                      <div className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{app.application_no}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={isDark ? 'text-slate-300' : 'text-slate-700'}>{app.guardian_name}</div>
                      <div className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{app.guardian_phone}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">{app.class_name}</td>
                    <td className={`py-3 px-4 text-center font-mono font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {app.entrance_score !== null ? `${app.entrance_score}%` : 'Pending Test'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          app.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40'
                            : app.status === 'waitlisted'
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40'
                            : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: PUBLISH MERIT LIST */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative ${
            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={() => setShowPublishModal(false)}
              className={`absolute top-5 right-5 cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Publish Admissions Merit List</h3>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Rank applicants by entrance test scores and publish the official selection list.
            </p>

            <form onSubmit={handlePublishSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Merit List Title</label>
                <input
                  type="text"
                  required
                  value={publishForm.title}
                  onChange={(e) => setPublishForm({ ...publishForm, title: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Category / Quota</label>
                <select
                  value={publishForm.quota}
                  onChange={(e) => setPublishForm({ ...publishForm, quota: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Open Merit">Open Merit</option>
                  <option value="Merit Scholarship">Merit Scholarship</option>
                  <option value="Sports & Co-Curricular Quota">Sports & Co-Curricular Quota</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                >
                  Confirm & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionsMeritTab;

