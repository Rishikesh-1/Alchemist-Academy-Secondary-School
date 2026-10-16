import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  GraduationCap,
  HeartHandshake,
  Layers,
  LineChart,
  Medal,
  Printer,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  User,
  X,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import {
  EXAM_TERMS,
  generateStudentMultiTermResults,
  generateStudentBehaviorHistory,
} from '../../../data/mockExamResults';

const StudentResultProfileModal = ({ student, onClose, isDark = true }) => {
  if (!student) return null;

  const [activeTab, setActiveTab] = useState('marksheet'); // 'marksheet' | 'behavior'
  const [selectedTermId, setSelectedTermId] = useState('term-2083-1');

  // Compute academic results and behavior history
  const multiTermResults = generateStudentMultiTermResults(student);
  const currentTermResult = multiTermResults.terms[selectedTermId] || multiTermResults.terms['term-2083-1'];
  const behaviorHistory = generateStudentBehaviorHistory(student);

  const studentName = student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim();
  const rollNo = student.roll_no || student.rollNo || 1;
  const admNo = student.admission_no || student.admissionNo || student.studentId || 'ADM-2026';
  const grade = student.grade || student.class_name || 'Grade 10';
  const section = student.section || student.section_name || 'Section A';
  const photo =
    student.photo_url ||
    student.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=0D9488&color=fff&size=200&bold=true`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className={`w-full max-w-4xl max-h-[92vh] rounded-3xl border flex flex-col shadow-2xl transition-all overflow-hidden ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-5 sm:p-6 border-b flex items-center justify-between relative overflow-hidden ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 min-w-0 z-10">
            <img
              src={photo}
              alt={studentName}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-blue-500/40 shadow-md shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold truncate">{studentName}</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Roll: #{rollNo}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  {behaviorHistory.conductGrade}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {grade} • {section} • Admission: <span className="font-mono">{admNo}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 z-10">
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Print Marksheet"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div
          className={`flex items-center gap-2 px-6 pt-3 border-b text-xs font-bold ${
            isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('marksheet')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'marksheet'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Academic Marksheets & Historical Trends</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('behavior')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'behavior'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Student Conduct & Behavior Dossier (Since Joined)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
              +{behaviorHistory.netPoints} pts
            </span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* ================= TAB 1: MARKSHEET & TRENDS ================= */}
          {activeTab === 'marksheet' && (
            <div className="space-y-6">
              {/* Term Selector & Live Telemetry */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {EXAM_TERMS.map((term) => (
                    <button
                      key={term.id}
                      type="button"
                      onClick={() => setSelectedTermId(term.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedTermId === term.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : isDark
                          ? 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {term.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400">Trajectory:</span>
                  <span
                    className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-0.5 rounded-full ${
                      multiTermResults.gpaDelta >= 0
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>
                      {multiTermResults.gpaDelta >= 0 ? '+' : ''}
                      {multiTermResults.gpaDelta} GPA Trend
                    </span>
                  </span>
                </div>
              </div>

              {/* Historical Trend Graph (Interactive SVG Visualization) */}
              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-blue-400" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                      Multi-Terminal GPA & Percentage Trajectory
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    4 Recorded Evaluation Cycles
                  </span>
                </div>

                {/* SVG Trend Graph */}
                <div className="relative pt-2 pb-1">
                  <div className="h-36 sm:h-44 w-full flex items-end justify-between gap-4 px-4 sm:px-8 border-b border-slate-700/60 pb-2 relative">
                    {/* Background grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-15">
                      <div className="border-b border-dashed border-slate-500 w-full" />
                      <div className="border-b border-dashed border-slate-500 w-full" />
                      <div className="border-b border-dashed border-slate-500 w-full" />
                    </div>

                    {multiTermResults.trendPoints.map((pt, idx) => {
                      const isSelected = pt.termKey === selectedTermId;
                      // Heights normalized to max GPA 4.0
                      const heightPercent = Math.max(20, Math.min(100, (pt.gpa / 4.0) * 100));

                      return (
                        <div
                          key={pt.termKey}
                          onClick={() => setSelectedTermId(pt.termKey)}
                          className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative z-10"
                        >
                          {/* Value Tooltip Badge */}
                          <div
                            className={`mb-2 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold shadow-md transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white scale-110'
                                : 'bg-slate-800 text-slate-300 group-hover:scale-105'
                            }`}
                          >
                            GPA {pt.gpa.toFixed(2)} ({pt.percentage}%)
                          </div>

                          {/* Bar */}
                          <div
                            className={`w-10 sm:w-14 rounded-t-xl transition-all duration-300 ${
                              isSelected
                                ? 'bg-gradient-to-t from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/25 ring-2 ring-blue-400'
                                : 'bg-slate-700/60 hover:bg-slate-600/80'
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          />

                          {/* Term Label */}
                          <span
                            className={`text-[11px] font-semibold mt-2 truncate max-w-full ${
                              isSelected ? 'text-blue-400 font-bold' : 'text-slate-400'
                            }`}
                          >
                            {pt.termLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Term Score KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Cumulative GPA
                  </span>
                  <div className="text-2xl font-bold font-mono text-blue-400 mt-0.5">
                    {currentTermResult.gpa.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-blue-300/80 font-semibold">Scale: 4.00</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Overall Grade
                  </span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                    {currentTermResult.overallGrade}
                  </div>
                  <span className="text-[10px] text-emerald-300/80 font-semibold">CDC Standard</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Total Marks
                  </span>
                  <div className="text-2xl font-bold font-mono text-purple-400 mt-0.5">
                    {currentTermResult.totalObtained} / {currentTermResult.totalMax}
                  </div>
                  <span className="text-[10px] text-purple-300/80 font-semibold">
                    {currentTermResult.percentage}% Score
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Class Standing
                  </span>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-0.5">
                    #{currentTermResult.rank}
                  </div>
                  <span className="text-[10px] text-amber-300/80 font-semibold">
                    Out of {currentTermResult.classTotal} Cohort
                  </span>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="rounded-2xl border overflow-hidden border-slate-800">
                <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                    Subject-Wise Marksheet Breakdown • {currentTermResult.termName}
                  </h4>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    ✓ {currentTermResult.resultStatus}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                        <th className="py-2.5 px-3">Subject Name</th>
                        <th className="py-2.5 px-2 text-center">Theory (75)</th>
                        <th className="py-2.5 px-2 text-center">Practical (25)</th>
                        <th className="py-2.5 px-2 text-center font-bold">Total (100)</th>
                        <th className="py-2.5 px-2 text-center font-bold">Grade</th>
                        <th className="py-2.5 px-2 text-center font-bold">GPA</th>
                        <th className="py-2.5 px-3">Evaluator Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {currentTermResult.subjects.map((sub) => (
                        <tr key={sub.code} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-white block">{sub.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">{sub.code}</span>
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono text-slate-300">{sub.th}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-slate-300">{sub.pr}</td>
                          <td className="py-2.5 px-2 text-center font-mono font-bold text-blue-400">
                            {sub.total}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                sub.grade.startsWith('A')
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}
                            >
                              {sub.grade}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono font-semibold text-slate-200">
                            {sub.gpa.toFixed(1)}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-400 italic">
                            {sub.remarks}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: BEHAVIOR DOSSIER (SINCE JOINED) ================= */}
          {activeTab === 'behavior' && (
            <div className="space-y-6">
              {/* Dossier Header */}
              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                      Permanent Student Behavioral Dossier
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1.5">
                      Cumulative Record Since Admission
                    </h3>
                    <p className="text-xs text-slate-400">
                      Enrolled: <strong className="text-white">{behaviorHistory.joiningDate}</strong> • Total Tenure: {behaviorHistory.tenure}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Merit Score</span>
                      <span className="text-xl font-bold font-mono text-emerald-400">
                        +{behaviorHistory.netPoints}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Conduct</span>
                      <span className="text-xl font-bold font-mono text-blue-400">
                        {behaviorHistory.conductGrade}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Earned Badges Row */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Honors & Badges Earned:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {behaviorHistory.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold"
                      >
                        <Medal className="w-3.5 h-3.5 text-amber-400" />
                        <span>{badge}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chronological Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Chronological Behavior & Commendation Log Since Day 1</span>
                </h4>

                <div className="space-y-3">
                  {behaviorHistory.timeline.map((entry) => {
                    const isPositive = entry.type === 'positive';
                    return (
                      <div
                        key={entry.id}
                        className={`p-4 rounded-2xl border transition-all text-xs ${
                          isPositive
                            ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40'
                            : 'bg-amber-950/20 border-amber-500/30'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                isPositive
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {isPositive ? `+${entry.points} Points` : `${entry.points} Points`}
                            </span>
                            <span className="font-bold text-sm text-white">{entry.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              {entry.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono shrink-0">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>{entry.date} ({entry.dateBs} BS)</span>
                          </div>
                        </div>

                        <p className="text-slate-300 mt-2 leading-relaxed">{entry.description}</p>

                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <span>
                            Logged By: <strong className="text-slate-300">{entry.awardedBy}</strong>
                          </span>
                          <span className="font-semibold text-emerald-400">{entry.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentResultProfileModal;

