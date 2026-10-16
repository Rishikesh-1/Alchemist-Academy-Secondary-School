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
} from 'lucide-react';
import CdcGradingTab from './CdcGradingTab';
import { useAuth } from '../../../context/AuthContext';
import { fetchOnlineAssessments, createOnlineAssessment } from '../../../services/api';

const ExaminationsTab = ({ isDark }) => {
  const { lang, currentBranch } = useAuth();
  const [mainTab, setMainTab] = useState('cbt'); // 'cbt' | 'grading'

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [systemFilter, setSystemFilter] = useState('all'); // 'all' | 'cbse' | 'standard' | 'online_quiz'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState(null);

  // Form State
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
      if (res.success && res.data?.assessments) {
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
    if (res.success) {
      alert('Assessment successfully scheduled & published.');
      setShowCreateModal(false);
      loadAssessments();
    } else {
      alert(res.message || 'Failed to create assessment.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black">
            {lang === 'ne' ? 'परीक्षा व्यवस्थापन तथा मूल्याङ्कन' : 'Examinations & Assessments Engine'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'ne'
              ? 'CBSE, राष्ट्रिय पाठ्यक्रम (CDC) तथा कम्प्युटरमा आधारित अनलाइन CBT मूल्याङ्कन'
              : 'Multi-curriculum examination orchestration: CBSE, NEB/CDC Standard, and Online CBT Quizzes'}
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

      {/* Main Tabs */}
      <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
        <button
          type="button"
          onClick={() => setMainTab('cbt')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mainTab === 'cbt'
              ? 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/30'
              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileQuestion className="w-4 h-4" />
          <span>{lang === 'ne' ? 'अनलाइन CBT तथा बहु-प्रणाली परीक्षा' : 'Online CBT & Multi-System'}</span>
          <span className="ml-1 px-2 py-0.2 rounded-full text-[10px] bg-indigo-500/30 text-indigo-400 font-bold">
            {assessments.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('grading')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mainTab === 'grading'
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{lang === 'ne' ? 'CDC ग्रेडिङ तथा लब्धाङ्क पत्र (Report Cards)' : 'CDC Grading & Report Cards'}</span>
        </button>
      </div>

      {/* Content */}
      {mainTab === 'grading' ? (
        <CdcGradingTab isDark={isDark} />
      ) : (
        <div className="space-y-4">
          {/* Subfilter */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Curriculum System:</span>
            {['all', 'cbse', 'standard', 'online_quiz'].map((sys) => (
              <button
                key={sys}
                type="button"
                onClick={() => setSystemFilter(sys)}
                className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                  systemFilter === sys
                    ? 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/30'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sys.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {assessments.length === 0 ? (
              <div className={`col-span-full p-8 rounded-2xl border text-center border-dashed ${
                isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-300'
              }`}>
                No online examinations found for selected curriculum. Click "Create CBT Exam" to schedule a test.
              </div>
            ) : (
              assessments.map((a) => {
                const isCbse = a.exam_system === 'cbse';
                const isOnline = a.exam_system === 'online_quiz';
                return (
                  <div
                    key={a.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between hover:shadow-lg ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            isCbse
                              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                              : isOnline
                              ? 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/30'
                              : 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                          }`}
                        >
                          {a.exam_system.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {a.status.toUpperCase()}
                        </span>
                      </div>

                      <h3 className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{a.title}</h3>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {a.class_name || 'Class 10'} • {a.subject_name || 'Science'}
                      </div>

                      <div className={`p-3 rounded-xl border space-y-1.5 text-[11px] ${
                        isDark ? 'bg-slate-900/60 border-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>
                        <div className="flex justify-between">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Total Marks:</span>
                          <span className={`font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{a.total_marks} Marks</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Duration:</span>
                          <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{a.duration_minutes} Mins</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Pass Criteria:</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{a.pass_marks} Marks</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Questions:</span>
                          <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{a.question_count || 3} Questions</span>
                        </div>
                      </div>
                    </div>

                    <div className={`mt-4 pt-3 border-t flex items-center justify-between ${
                      isDark ? 'border-slate-800/80' : 'border-slate-200'
                    }`}>
                      <button
                        type="button"
                        onClick={() => setPreviewQuestions(a)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                          isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Questions</span>
                      </button>

                      <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {new Date(a.start_time).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Preview Questions Modal */}
      {previewQuestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div>
                <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{previewQuestions.title}</h2>
                <div className={`text-xs uppercase font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {previewQuestions.exam_system} • {previewQuestions.total_marks} Total Marks
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewQuestions(null)}
                className={`cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto text-xs">
              {(previewQuestions.questions || []).map((q, idx) => (
                <div key={idx} className={`p-3.5 rounded-xl border space-y-2 ${
                  isDark ? 'bg-slate-800/60 border-slate-700/80 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <div className="flex items-start justify-between font-bold">
                    <span>Q{idx + 1}. {q.question}</span>
                    <span className="text-emerald-500 text-[10px]">[{q.marks || 2} Marks]</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {(q.options || []).map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-1.5 rounded-lg border ${
                          oIdx === q.correct_index
                            ? isDark
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                              : 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                            : isDark
                            ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}. {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className={`text-right pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setPreviewQuestions(null)}
                className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule CBT Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-indigo-500" />
                <h2 className="text-base font-bold">Schedule Online Assessment / CBT</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className={`cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Assessment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10 Science Online CBT Quiz"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Curriculum System</label>
                  <select
                    value={form.exam_system}
                    onChange={(e) => setForm({ ...form, exam_system: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="online_quiz">Online CBT Quiz</option>
                    <option value="cbse">CBSE International Pre-Test</option>
                    <option value="standard">NEB Standard Mid-Term</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Duration (Minutes)</label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>End Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`px-4 py-2 rounded-xl border cursor-pointer ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
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

