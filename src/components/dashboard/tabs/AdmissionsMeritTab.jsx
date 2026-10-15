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
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Admissions Pipeline & Entrance Merit Lists</span>
          </h4>
          <p className="text-xs text-slate-400">
            Review online application leads, score entrance tests, and publish official rank lists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
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
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Applications Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Applicant Name</th>
                <th className="py-3 px-4">Parent Guardian</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4 text-center">Entrance Score</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    {loading ? 'Loading applicant pipeline...' : 'No admission applications found for this class.'}
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {app.merit_rank ? `#${app.merit_rank}` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{app.applicant_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{app.application_no}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-300">{app.guardian_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{app.guardian_phone}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-400">{app.class_name}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-white text-sm">
                      {app.entrance_score !== null ? `${app.entrance_score}%` : 'Pending Test'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          app.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : app.status === 'waitlisted'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-400'
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
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowPublishModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Publish Admissions Merit List</h3>
            <p className="text-xs text-slate-400 mb-4">
              Rank applicants by entrance test scores and publish the official selection list.
            </p>

            <form onSubmit={handlePublishSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Merit List Title</label>
                <input
                  type="text"
                  required
                  value={publishForm.title}
                  onChange={(e) => setPublishForm({ ...publishForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category / Quota</label>
                <select
                  value={publishForm.quota}
                  onChange={(e) => setPublishForm({ ...publishForm, quota: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
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

