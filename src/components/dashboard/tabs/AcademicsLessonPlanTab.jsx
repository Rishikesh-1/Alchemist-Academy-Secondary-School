import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  Layers,
  Sparkles,
  X,
  TrendingUp,
  Sliders,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  fetchLessonPlans,
  createLessonPlan,
  updateLessonProgress,
} from '../../../services/api';

const AcademicsLessonPlanTab = ({ isDark }) => {
  const { lang, currentBranch } = useAuth();

  const [plans, setPlans] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [summary, setSummary] = useState({ total_units: 0, completed: 0, in_progress: 0, avg_progress: 0 });
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    class_id: 1,
    subject_id: 1,
    week_no: 1,
    unit_name: 'Unit 1: Force and Motion',
    topic_title: '',
    learning_objectives: '',
    teaching_method: 'Interactive Classroom Lecture & Simulation',
    planned_date: new Date().toISOString().split('T')[0],
  });

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await fetchLessonPlans(
        selectedClassId || null,
        selectedSubjectId || null
      );
      if (res.success && res.data) {
        setPlans(res.data.plans || []);
        setClasses(res.data.classes || []);
        setSubjects(res.data.subjects || []);
        setSummary(res.data.summary || {});
      }
    } catch (err) {
      console.error('Error fetching lesson plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [selectedClassId, selectedSubjectId, currentBranch]);

  const handleUpdateStatus = async (id, status, pct) => {
    try {
      const res = await updateLessonProgress(id, status, pct);
      if (res.success) {
        loadPlans();
      }
    } catch (err) {
      alert('Error updating lesson progress.');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!form.topic_title) {
      alert('Topic title is required.');
      return;
    }
    const res = await createLessonPlan(form);
    if (res.success) {
      alert('Lesson plan added successfully.');
      setShowAddModal(false);
      setForm({
        class_id: 1,
        subject_id: 1,
        week_no: 1,
        unit_name: 'Unit 1: Force and Motion',
        topic_title: '',
        learning_objectives: '',
        teaching_method: 'Interactive Classroom Lecture & Simulation',
        planned_date: new Date().toISOString().split('T')[0],
      });
      loadPlans();
    } else {
      alert(res.message || 'Failed to add lesson plan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {lang === 'ne' ? 'शैक्षिक योजना तथा पाठ्यक्रम पाठ योजना' : 'Academics & Lesson Plans'}
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'ne'
              ? 'पाठ्यक्रम प्रगति अनुगमन, हप्तागत पाठ योजना तथा सिकाइ उपलब्धी मूल्याङ्कन'
              : 'Curriculum syllabus coverage tracking, weekly unit lesson plans, and instructional milestones'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'ne' ? 'नयाँ पाठ योजना थप्नुहोस्' : 'Create Lesson Plan'}</span>
        </button>
      </div>

      {/* Curriculum Coverage Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <span className={`text-xs font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Units Planned</span>
          <div className={`text-2xl font-black mt-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{summary.total_units} Units</div>
          <div className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Structured curriculum modules</div>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <span className={`text-xs font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fully Completed</span>
          <div className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400">{summary.completed} Units</div>
          <div className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Lectures & practicals concluded</div>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <span className={`text-xs font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Currently in Progress</span>
          <div className="text-2xl font-black mt-2 text-blue-600 dark:text-blue-400">{summary.in_progress} Units</div>
          <div className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Active weekly classroom study</div>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <span className={`text-xs font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Overall Syllabus Pacing</span>
          <div className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400">{summary.avg_progress}%</div>
          <div className={`w-full h-1.5 rounded-full mt-2 overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${summary.avg_progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <label className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Class:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className={`px-3 py-1.5 rounded-xl text-xs border focus:outline-none ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            <option value="">All Academic Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Subject:</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className={`px-3 py-1.5 rounded-xl text-xs border focus:outline-none ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lesson Plans Timeline Cards */}
      <div className="space-y-3">
        {plans.length === 0 ? (
          <div className={`p-8 rounded-2xl border text-center border-dashed ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-300 text-slate-600 bg-white'}`}>
            No lesson plans found for selected filters. Click "Create Lesson Plan" to add unit curriculum.
          </div>
        ) : (
          plans.map((p) => {
            const isDone = p.completion_status === 'completed';
            const inProg = p.completion_status === 'in_progress';
            return (
              <div
                key={p.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                        Week {p.week_no}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                        {p.class_name} • {p.subject_name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : inProg
                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                            : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.completion_status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className={`font-extrabold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {p.unit_name}: {p.topic_title}
                    </h3>
                    <p className={`text-xs max-w-3xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {p.learning_objectives}
                    </p>

                    <div className={`flex items-center gap-4 text-[11px] pt-1 flex-wrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span>Method: <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>{p.teaching_method}</strong></span>
                      <span>Faculty: <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>{p.teacher_name}</strong></span>
                      <span>Planned: <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>{p.planned_date}</strong></span>
                    </div>
                  </div>

                  {/* Progress & Quick Controls */}
                  <div className={`w-full md:w-56 shrink-0 space-y-2 p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Coverage:</span>
                      <span className={isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}>
                        {p.completion_percentage}%
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                      <div
                        className={`h-full rounded-full transition-all ${
                          isDone ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${p.completion_percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(p.id, 'planned', 0)}
                        className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        }`}
                      >
                        Reset (0%)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(p.id, 'in_progress', 50)}
                        className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
                          isDark ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300' : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        Active (50%)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(p.id, 'completed', 100)}
                        className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
                          isDark ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        Done (100%)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Lesson Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base font-bold">Add Curriculum Unit / Lesson Plan</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className={`cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Class</label>
                  <select
                    value={form.class_id}
                    onChange={(e) => setForm({ ...form, class_id: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Subject</label>
                  <select
                    value={form.subject_id}
                    onChange={(e) => setForm({ ...form, subject_id: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Week Number</label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={form.week_no}
                    onChange={(e) => setForm({ ...form, week_no: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Planned Date</label>
                  <input
                    type="date"
                    value={form.planned_date}
                    onChange={(e) => setForm({ ...form, planned_date: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Unit / Chapter Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3: Chemical Reactions & Acids"
                  value={form.unit_name}
                  onChange={(e) => setForm({ ...form, unit_name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Topic / Lesson Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acid-Base Indicators & pH Scale Calculations"
                  value={form.topic_title}
                  onChange={(e) => setForm({ ...form, topic_title: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Learning Objectives</label>
                <textarea
                  rows="2"
                  placeholder="Students will be able to deduce and test pH using universal indicators..."
                  value={form.learning_objectives}
                  onChange={(e) => setForm({ ...form, learning_objectives: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Teaching Method / Materials</label>
                <input
                  type="text"
                  placeholder="e.g. Laboratory titration demonstration & smartboard slides"
                  value={form.teaching_method}
                  onChange={(e) => setForm({ ...form, teaching_method: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
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
                  Save Lesson Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicsLessonPlanTab;

