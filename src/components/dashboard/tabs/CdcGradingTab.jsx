import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Printer,
  Search,
  Eye,
  Plus,
  Save,
  Check,
  X,
} from 'lucide-react';
import { fetchExams, saveExamMarks, fetchReportCard } from '../../../services/api';
import { formatDualDate, toNepaliNumerals } from '../../../utils/nepaliCalendar';
import { getTranslation } from '../../../utils/translations';
import { useAuth } from '../../../context/AuthContext';

const CdcGradingTab = ({ isDark }) => {
  const { lang, currentBranch } = useAuth();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(1);
  const [selectedClassId, setSelectedClassId] = useState(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState(1);
  const [marksEntries, setMarksEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Report Card Modal State
  const [showReportCardModal, setShowReportCardModal] = useState(false);
  const [reportCardData, setReportCardData] = useState(null);

  // CDC Grade Calculator
  const computeGrade = (theory, practical) => {
    const total = Number(theory || 0) + Number(practical || 0);
    if (total >= 90) return { letter: 'A+', gp: 4.0, remarks: 'Outstanding' };
    if (total >= 80) return { letter: 'A', gp: 3.6, remarks: 'Excellent' };
    if (total >= 70) return { letter: 'B+', gp: 3.2, remarks: 'Very Good' };
    if (total >= 60) return { letter: 'B', gp: 2.8, remarks: 'Good' };
    if (total >= 50) return { letter: 'C+', gp: 2.4, remarks: 'Satisfactory' };
    if (total >= 40) return { letter: 'C', gp: 2.0, remarks: 'Acceptable' };
    if (total >= 35) return { letter: 'D', gp: 1.6, remarks: 'Basic' };
    return { letter: 'NG', gp: 0.0, remarks: 'Not Graded' };
  };

  // Load marks
  const loadMarks = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetchExams(selectedExamId, selectedClassId, selectedSubjectId);
      if (res && res.success) {
        if (res.data?.exams) setExams(res.data.exams);
        if (res.data?.marks) {
          setMarksEntries(res.data.marks);
        }
      }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    loadMarks();
  }, [selectedExamId, selectedClassId, selectedSubjectId]);

  // Handle Mark Change
  const handleMarkChange = (studentId, field, val) => {
    setMarksEntries((prev) =>
      prev.map((m) => {
        if (m.student_id === studentId) {
          const updated = { ...m, [field]: Number(val) };
          const computed = computeGrade(
            field === 'theory_marks' ? val : m.theory_marks,
            field === 'practical_marks' ? val : m.practical_marks
          );
          return {
            ...updated,
            total_marks: Number(updated.theory_marks || 0) + Number(updated.practical_marks || 0),
            grade_letter: computed.letter,
            grade_point: computed.gp,
            remarks: computed.remarks,
          };
        }
        return m;
      })
    );
  };

  // Save Marks to Backend
  const handleSave = async () => {
    try {
      const entries = marksEntries.map((m) => ({
        student_id: m.student_id,
        theory_marks: m.theory_marks,
        practical_marks: m.practical_marks,
        is_absent: m.is_absent ? 1 : 0,
        remarks: m.remarks,
      }));

      const res = await saveExamMarks(selectedExamId, selectedClassId, selectedSubjectId, entries);
      if (res && res.success) {
        setStatusMessage({ type: 'success', text: res.message });
      } else {
        setStatusMessage({ type: 'error', text: res?.message || 'Failed to save marks.' });
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: e.message });
    }
  };

  // Open Report Card
  const handleViewReportCard = async (studentId) => {
    try {
      const res = await fetchReportCard(studentId, selectedExamId);
      if (res && res.success && res.data) {
        setReportCardData(res.data);
        setShowReportCardModal(true);
      }
    } catch (e) {}
  };

  const subjects = [
    { id: 1, name: 'Compulsory English', code: 'ENG-101' },
    { id: 2, name: 'Compulsory Nepali', code: 'NEP-102' },
    { id: 3, name: 'Compulsory Mathematics', code: 'MTH-103' },
    { id: 4, name: 'Science & Technology', code: 'SCI-104' },
    { id: 5, name: 'Social Studies', code: 'SOC-105' },
  ];

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border ${
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Exam Selector */}
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Examination Term
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(Number(e.target.value))}
              className={`border rounded-xl px-3 py-1.5 text-xs ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              <option value={1}>First Terminal Examination 2026</option>
              <option value={2}>Half Yearly Examination 2026</option>
              <option value={3}>Mock SEE Pre-Board Exam 2026</option>
            </select>
          </div>

          {/* Class Selector */}
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Class / Grade
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(Number(e.target.value))}
              className={`border rounded-xl px-3 py-1.5 text-xs ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              <option value={1}>Grade 10</option>
              <option value={2}>Grade 9</option>
              <option value={3}>Grade 8</option>
            </select>
          </div>

          {/* Subject Selector */}
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
              className={`border rounded-xl px-3 py-1.5 text-xs font-bold ${
                isDark ? 'bg-slate-900 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-300 text-emerald-700'
              }`}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{getTranslation('save_marks', lang)}</span>
        </button>
      </div>

      {/* Status Banner */}
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

      {/* Marks Entry Table */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b font-bold uppercase text-[10px] ${isDark ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                <th className="py-3 px-4">Roll</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Theory (75)</th>
                <th className="py-3 px-4">Practical (25)</th>
                <th className="py-3 px-4">Total (100)</th>
                <th className="py-3 px-4">CDC Grade</th>
                <th className="py-3 px-4">Grade Point</th>
                <th className="py-3 px-4 text-right">Report Card</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
              {marksEntries.map((m) => {
                const total = Number(m.theory_marks || 0) + Number(m.practical_marks || 0);
                const grade = m.grade_letter || computeGrade(m.theory_marks, m.practical_marks).letter;
                const gp = m.grade_point !== undefined ? m.grade_point : computeGrade(m.theory_marks, m.practical_marks).gp;

                return (
                  <tr key={m.student_id} className={`transition-colors ${isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'}`}>
                    <td className={`py-3 px-4 font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {lang === 'ne' ? toNepaliNumerals(m.roll_no) : m.roll_no}
                    </td>
                    <td className="py-3 px-4">
                      <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {m.first_name} {m.last_name}
                      </div>
                      <div className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{m.admission_no}</div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        max="75"
                        value={m.theory_marks || ''}
                        onChange={(e) => handleMarkChange(m.student_id, 'theory_marks', e.target.value)}
                        className={`w-16 border rounded-lg px-2 py-1 text-xs font-mono ${
                          isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        max="25"
                        value={m.practical_marks || ''}
                        onChange={(e) => handleMarkChange(m.student_id, 'practical_marks', e.target.value)}
                        className={`w-16 border rounded-lg px-2 py-1 text-xs font-mono ${
                          isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </td>
                    <td className={`py-3 px-4 font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{total}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          grade.startsWith('A')
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40'
                            : grade.startsWith('B')
                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/40'
                            : grade.startsWith('C')
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {grade}
                      </span>
                    </td>
                    <td className={`py-3 px-4 font-mono font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{Number(gp).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleViewReportCard(m.student_id)}
                        className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 transition-colors cursor-pointer"
                        title="Generate Official CDC Grade Sheet"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* OFFICIAL REPORT CARD PRINT PREVIEW MODAL */}
      {showReportCardModal && reportCardData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`border rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-slate-900 border-indigo-500/30 text-white' : 'bg-white border-indigo-200 text-slate-900'
          }`}>
            <button
              onClick={() => setShowReportCardModal(false)}
              className={`absolute top-5 right-5 cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Grade Sheet Card */}
            <div className={`p-6 rounded-2xl border-2 space-y-4 ${
              isDark ? 'bg-slate-950 text-slate-100 border-indigo-500/30' : 'bg-slate-50 text-slate-900 border-indigo-200'
            }`}>
              {/* Institution Header */}
              <div className={`text-center border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  Government of Nepal • Curriculum Development Centre (CDC)
                </div>
                <h3 className={`text-xl font-bold font-serif-brand mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {reportCardData.school?.name || 'Alchemist Academy'}
                </h3>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {reportCardData.school?.address || 'Bouddha, Kathmandu'} • Affiliated to NEB
                </div>
                <div className={`mt-2 inline-block px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider ${
                  isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  Terminal Grade-Sheet (Academic Session 2026 / 2083 BS)
                </div>
              </div>

              {/* Student Metadata Dossier */}
              <div className={`grid grid-cols-2 gap-2 text-xs p-3 rounded-xl border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div>
                  Student Name: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{reportCardData.student?.first_name} {reportCardData.student?.last_name}</strong>
                </div>
                <div>
                  Class: <strong className={isDark ? 'text-emerald-400' : 'text-emerald-700'}>{reportCardData.student?.class_name}</strong>
                </div>
                <div>
                  Admission No: <strong className={`font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{reportCardData.student?.admission_no}</strong>
                </div>
                <div>
                  Roll No: <strong className={`font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{reportCardData.student?.roll_no}</strong>
                </div>
                <div className="col-span-2">
                  DOB: <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{formatDualDate(reportCardData.student?.dob_ad, lang)}</strong>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="overflow-x-auto">
                <table className={`w-full text-left text-xs border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <thead className={`text-[10px] uppercase ${isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-700 font-bold'}`}>
                    <tr>
                      <th className={`py-2 px-3 border-r ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>Subject</th>
                      <th className={`py-2 px-2 text-center border-r ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>Credit</th>
                      <th className={`py-2 px-2 text-center border-r ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>Theory</th>
                      <th className={`py-2 px-2 text-center border-r ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>Practical</th>
                      <th className={`py-2 px-2 text-center border-r ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>Total</th>
                      <th className={`py-2 px-2 text-center border-r ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>Grade</th>
                      <th className="py-2 px-2 text-center">Grade Point</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                    {reportCardData.subjects?.map((sub, i) => (
                      <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-slate-900/30' : 'hover:bg-slate-100/50'}`}>
                        <td className={`py-2 px-3 border-r font-medium ${isDark ? 'border-slate-800 text-slate-200' : 'border-slate-200 text-slate-800'}`}>
                          {sub.subject_name}
                        </td>
                        <td className={`py-2 px-2 text-center border-r font-mono ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>{sub.credit_hours || 4.0}</td>
                        <td className={`py-2 px-2 text-center border-r font-mono ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>{sub.theory_marks || 0}</td>
                        <td className={`py-2 px-2 text-center border-r font-mono ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>{sub.practical_marks || 0}</td>
                        <td className={`py-2 px-2 text-center border-r font-mono font-bold ${isDark ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-900'}`}>{sub.total_marks || 0}</td>
                        <td className={`py-2 px-2 text-center border-r font-bold ${isDark ? 'border-slate-800 text-emerald-400' : 'border-slate-200 text-emerald-700'}`}>{sub.grade_letter || 'A'}</td>
                        <td className={`py-2 px-2 text-center font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{sub.grade_point || '3.6'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Results */}
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <div className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Cumulative GPA</div>
                  <div className={`text-lg font-bold font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    {reportCardData.summary?.gpa || '3.75'}
                  </div>
                </div>
                <div>
                  <div className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Overall Grade</div>
                  <div className={`text-lg font-bold font-mono ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                    {reportCardData.summary?.overall_grade || 'A+'}
                  </div>
                </div>
                <div>
                  <div className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Result Status</div>
                  <div className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    isDark ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-emerald-800 bg-emerald-50 border-emerald-300'
                  }`}>
                    {reportCardData.summary?.result_status || 'Passed'}
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className={`pt-6 flex justify-between text-[11px] font-bold border-t ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
              }`}>
                <div>Class Teacher Signature</div>
                <div>Examination Controller</div>
                <div>Principal / Headmaster Stamp</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{getTranslation('print_report_card', lang)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CdcGradingTab;

