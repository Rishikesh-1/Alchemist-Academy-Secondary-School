import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  MessageSquare,
  AlertTriangle,
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  X,
  ExternalLink,
  Users,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  fetchCommunicationNotices,
  publishCommunicationNotice,
  toggleNoticeStatus,
} from '../../../services/api';

const CommunicateTab = ({ isDark }) => {
  const { lang, currentBranch } = useAuth();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    content: '',
    audience: 'all',
    priority: 'normal',
    publish_date: new Date().toISOString().split('T')[0],
    attachment_url: '',
  });

  const loadNotices = async () => {
    setLoading(true);
    try {
      const res = await fetchCommunicationNotices(audienceFilter === 'all' ? null : audienceFilter);
      if (res.success && res.data?.notices) {
        setNotices(res.data.notices);
      }
    } catch (err) {
      console.error('Error fetching notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, [audienceFilter, currentBranch]);

  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      alert('Title and content are required.');
      return;
    }
    const res = await publishCommunicationNotice(form);
    if (res.success) {
      alert('Notice successfully published and broadcasted to recipients.');
      setShowPublishModal(false);
      setForm({
        title: '',
        content: '',
        audience: 'all',
        priority: 'normal',
        publish_date: new Date().toISOString().split('T')[0],
        attachment_url: '',
      });
      loadNotices();
    } else {
      alert(res.message || 'Failed to publish notice.');
    }
  };

  const handleToggle = async (id, currentStatus) => {
    const nextStatus = currentStatus ? 0 : 1;
    const res = await toggleNoticeStatus(id, nextStatus);
    if (res.success) {
      loadNotices();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {lang === 'ne' ? 'सञ्चार तथा डिजिटल सूचना पाटी' : 'Communication & Notice Board'}
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'ne'
              ? 'आधिकारिक परिपत्र, अभिभावक तथा शिक्षक सन्देश र तत्काल इन-एप सूचना प्रसारण'
              : 'Institutional circulars, multi-channel notices, and synchronized parent/staff broadcasts'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPublishModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'ne' ? 'नयाँ परिपत्र प्रकाशन' : 'Publish Circular Notice'}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className={`flex items-center gap-2 border-b pb-2 overflow-x-auto ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        {['all', 'parents', 'students', 'teachers', 'staff'].map((aud) => (
          <button
            key={aud}
            type="button"
            onClick={() => setAudienceFilter(aud)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
              audienceFilter === aud
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            {aud === 'all' ? (lang === 'ne' ? 'सबै दर्शक' : 'All Audiences') : aud}
          </button>
        ))}
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {notices.length === 0 ? (
          <div className={`col-span-full p-8 rounded-2xl border text-center border-dashed ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-300 text-slate-600 bg-white'}`}>
            No notices published for this audience segment.
          </div>
        ) : (
          notices.map((n) => {
            const isUrgent = n.priority === 'urgent';
            const isHigh = n.priority === 'high';
            return (
              <div
                key={n.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isUrgent
                    ? isDark ? 'border-rose-500/50 bg-rose-500/5' : 'border-rose-300 bg-rose-50/60 shadow-sm'
                    : isHigh
                    ? isDark ? 'border-amber-500/40 bg-amber-500/5' : 'border-amber-300 bg-amber-50/60 shadow-sm'
                    : isDark
                    ? 'border-slate-800 bg-slate-950'
                    : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          isUrgent
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            : isHigh
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700 font-bold'
                        }`}
                      >
                        {n.priority}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        Target: {n.audience}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{n.publish_date}</span>
                  </div>

                  <h3 className={`font-extrabold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{n.title}</h3>
                  <p className={`text-xs leading-relaxed whitespace-pre-line ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {n.content}
                  </p>

                  {n.attachment_url && (
                    <div className="pt-1">
                      <a
                        href={n.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Attached Circular Document</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] ${isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                  <div>
                    Published by: <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>{n.publisher_name || 'Admin'}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle(n.id, n.is_published)}
                    className={`px-2.5 py-0.5 rounded-full font-bold cursor-pointer ${
                      n.is_published
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {n.is_published ? 'LIVE BROADCAST' : 'DRAFT'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Publish Notice Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-rose-500" />
                <h2 className="text-base font-bold">Publish Circular Announcement</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className={`cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Notice Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Sports Meet 2026 - Schedule & Uniform Notice"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-rose-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Target Audience</label>
                  <select
                    value={form.audience}
                    onChange={(e) => setForm({ ...form, audience: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="all">All Stakeholders (सबै)</option>
                    <option value="parents">Guardians & Parents Only</option>
                    <option value="teachers">Teaching Faculty Only</option>
                    <option value="students">Students Only</option>
                    <option value="staff">Administrative Staff</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Broadcast Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="normal">Normal Circular</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Alert (Red Banner)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Full Circular Content *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Enter notice details, reporting timings, guidelines..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-rose-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Attachment PDF / Document URL</label>
                <input
                  type="url"
                  placeholder="https://alchemist.edu.np/notices/sports-meet.pdf"
                  value={form.attachment_url}
                  onChange={(e) => setForm({ ...form, attachment_url: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className={`px-4 py-2 rounded-xl border cursor-pointer ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                >
                  Publish & Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicateTab;

