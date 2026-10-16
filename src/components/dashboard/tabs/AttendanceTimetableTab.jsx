import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Plus,
  ShieldAlert,
  Users,
  Search,
  Check,
  X,
} from 'lucide-react';
import {
  fetchAttendance,
  saveAttendance,
  sendAbsenceAlerts,
  fetchTimetable,
  saveTimetableSlot,
} from '../../../services/api';
import { formatDualDate, toNepaliNumerals } from '../../../utils/nepaliCalendar';
import { getTranslation } from '../../../utils/translations';
import { useAuth } from '../../../context/AuthContext';

const AttendanceTimetableTab = ({ isDark }) => {
  const { lang, currentBranch } = useAuth();
  const [subView, setSubView] = useState('attendance'); // 'attendance' | 'timetable'

  // Attendance state
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attType, setAttType] = useState('daily'); // 'daily' | 'period_1' .. 'period_8'
  const [classId, setClassId] = useState(1);
  const [roster, setRoster] = useState([]);
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, late: 0 });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Timetable state
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [timetableTeachers, setTimetableTeachers] = useState([]);
  const [timetableSubjects, setTimetableSubjects] = useState([]);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [slotForm, setSlotForm] = useState({
    class_id: 1,
    subject_id: 1,
    teacher_id: 4,
    day_of_week: 'Sunday',
    period_no: 1,
    start_time: '10:00:00',
    end_time: '10:45:00',
    room_no: 'Room 101',
  });
  const [clashError, setClashError] = useState(null);

  // Load Attendance sheet
  const loadAttendance = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetchAttendance(date, classId, attType);
      if (res && res.success && res.data?.roster) {
        setRoster(res.data.roster);
        setSummary(res.data.summary || {});
      }
    } catch (e) {
      console.warn('Attendance load error:', e);
    }
    setLoading(false);
  };

  // Load Timetable
  const loadTimetable = async () => {
    try {
      const res = await fetchTimetable(classId);
      if (res && res.success && res.data?.slots) {
        setTimetableSlots(res.data.slots);
        if (res.data.teachers) setTimetableTeachers(res.data.teachers);
        if (res.data.subjects) setTimetableSubjects(res.data.subjects);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (subView === 'attendance') {
      loadAttendance();
    } else {
      loadTimetable();
    }
  }, [subView, date, attType, classId, currentBranch?.id]);

  // Bulk mark status locally
  const handleMarkStudent = (studentId, newStatus) => {
    setRoster((prev) =>
      prev.map((item) => (item.student_id === studentId ? { ...item, attendance_status: newStatus } : item))
    );
  };

  const handleMarkAll = (status) => {
    setRoster((prev) => prev.map((item) => ({ ...item, attendance_status: status })));
  };

  // Save Attendance to Backend
  const handleSaveAttendance = async () => {
    try {
      const records = roster.map((r) => ({
        student_id: r.student_id,
        status: r.attendance_status === 'unmarked' ? 'present' : r.attendance_status,
        remarks: r.attendance_remarks || '',
      }));

      const res = await saveAttendance(date, records, attType);
      if (res && res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        loadAttendance();
      } else {
        setStatusMessage({ type: 'error', text: res?.message || 'Failed to save attendance.' });
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: e.message });
    }
  };

  // Dispatch Absence Alerts to Parents
  const handleSendAlerts = async () => {
    try {
      const res = await sendAbsenceAlerts(date, classId, 'sms');
      if (res && res.success) {
        setStatusMessage({
          type: 'success',
          text: `Absence alerts sent to ${res.data?.alerts_sent || 0} parent guardians via SMS.`,
        });
      } else {
        setStatusMessage({ type: 'error', text: res?.message || 'Failed to dispatch alerts.' });
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: e.message });
    }
  };

  // Add Timetable Slot with Clash Detection
  const handleAddSlot = async (e) => {
    e.preventDefault();
    setClashError(null);
    try {
      const res = await saveTimetableSlot(slotForm);
      if (res && res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        setShowAddSlotModal(false);
        loadTimetable();
      } else if (res && res.data?.clash_type) {
        setClashError(res.message);
      } else {
        setClashError(res?.message || 'Failed to schedule slot.');
      }
    } catch (e) {
      setClashError(e.message);
    }
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="space-y-6">
      {/* Sub-view Switcher Tabs */}
      <div className={`flex items-center justify-between border-b pb-3 flex-wrap gap-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubView('attendance')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subView === 'attendance'
                ? 'bg-emerald-600 text-white shadow-sm'
                : isDark
                ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{lang === 'ne' ? 'हाजिरी व्यवस्थापन (दैनिक तथा घण्टी)' : 'Daily & Period Attendance'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('timetable')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subView === 'timetable'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isDark
                ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{lang === 'ne' ? 'समयतालिका तथा जुध्ने जाँच' : 'Timetable & Clash Detection'}</span>
          </button>
        </div>

        {/* Dual Date Header */}
        <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {formatDualDate(date, lang)}
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
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIEW 1: ATTENDANCE */}
      {subView === 'attendance' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Date Input */}
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Attendance Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`border rounded-xl px-3 py-1.5 text-xs ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Class Selector */}
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Select Class
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(Number(e.target.value))}
                  className={`border rounded-xl px-3 py-1.5 text-xs ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value={1}>Grade 10</option>
                  <option value={2}>Grade 9</option>
                  <option value={3}>Grade 8</option>
                </select>
              </div>

              {/* Attendance Mode: Daily vs Period */}
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Marking Mode
                </label>
                <select
                  value={attType}
                  onChange={(e) => setAttType(e.target.value)}
                  className={`border rounded-xl px-3 py-1.5 text-xs font-bold font-mono ${
                    isDark ? 'bg-slate-900 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-300 text-emerald-700'
                  }`}
                >
                  <option value="daily">Daily Roll-Call</option>
                  <option value="period_1">Period 1 (10:00 - 10:45)</option>
                  <option value="period_2">Period 2 (10:45 - 11:30)</option>
                  <option value="period_3">Period 3 (11:30 - 12:15)</option>
                  <option value="period_4">Period 4 (12:15 - 01:00)</option>
                  <option value="period_5">Period 5 (01:45 - 02:30)</option>
                  <option value="period_6">Period 6 (02:30 - 03:15)</option>
                  <option value="period_7">Period 7 (03:15 - 04:00)</option>
                  <option value="period_8">Period 8 (04:00 - 04:45)</option>
                </select>
              </div>
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleMarkAll('present')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                  isDark
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('absent')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                  isDark
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30'
                    : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                }`}
              >
                Mark All Absent
              </button>

              <button
                type="button"
                onClick={handleSendAlerts}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow cursor-pointer"
                title="Send SMS/In-App alert to parents of absent students"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{getTranslation('send_absence_alerts', lang)}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAttendance}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 shadow cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{getTranslation('mark_attendance', lang)}</span>
              </button>
            </div>
          </div>

          {/* Roster Roll-Call List */}
          <div className={`rounded-2xl border overflow-hidden ${
            isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white shadow-sm'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b font-bold uppercase text-[10px] ${
                    isDark ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}>
                    <th className="py-3 px-4">Roll</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Admission #</th>
                    <th className="py-3 px-4">Guardian Phone</th>
                    <th className="py-3 px-4 text-center">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                  {roster.map((st) => {
                    const status = st.attendance_status;
                    return (
                      <tr key={st.student_id} className={`transition-colors ${isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'}`}>
                        <td className={`py-3 px-4 font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {lang === 'ne' ? toNepaliNumerals(st.roll_no) : st.roll_no}
                        </td>
                        <td className={`py-3 px-4 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {st.first_name} {st.last_name}
                        </td>
                        <td className={`py-3 px-4 font-mono font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{st.admission_no}</td>
                        <td className={`py-3 px-4 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{st.guardian_phone || '9851000000'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {[
                              { id: 'present', label: 'P', color: 'bg-emerald-500 text-white' },
                              { id: 'absent', label: 'A', color: 'bg-rose-500 text-white' },
                              { id: 'late', label: 'L', color: 'bg-amber-500 text-white' },
                              { id: 'excused', label: 'E', color: 'bg-blue-500 text-white' },
                            ].map((btn) => (
                              <button
                                key={btn.id}
                                type="button"
                                onClick={() => handleMarkStudent(st.student_id, btn.id)}
                                className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                  status === btn.id
                                    ? btn.color + ' ring-2 ring-white/40 shadow'
                                    : isDark
                                    ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600'
                                    : 'bg-slate-100 text-slate-700 border border-slate-300 hover:border-slate-400'
                                }`}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TIMETABLE & CLASH DETECTION */}
      {subView === 'timetable' && (
        <div className="space-y-4">
          <div className={`flex items-center justify-between p-4 rounded-2xl border flex-wrap gap-3 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div>
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Weekly Class Schedule Matrix</h4>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Automated validation prevents room collisions and double-booking faculty.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddSlotModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Period Slot</span>
            </button>
          </div>

          {/* Timetable Grid */}
          <div className={`rounded-2xl border overflow-x-auto ${
            isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white shadow-sm'
          }`}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-bold uppercase text-[10px] ${
                  isDark ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}>
                  <th className="py-3 px-4 w-24">Day</th>
                  {periods.map((p) => (
                    <th key={p} className={`py-3 px-3 text-center border-l ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      Period {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                {days.map((day) => (
                  <tr key={day} className={`transition-colors ${isDark ? 'hover:bg-slate-900/30' : 'hover:bg-slate-50'}`}>
                    <td className={`py-4 px-4 font-bold whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>{day}</td>
                    {periods.map((period) => {
                      const slot = timetableSlots.find(
                        (s) => s.day_of_week === day && Number(s.period_no) === period
                      );
                      return (
                        <td key={period} className={`py-3 px-2 text-center border-l align-top ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                          {slot ? (
                            <div className={`p-2 rounded-xl border text-left space-y-0.5 ${
                              isDark ? 'bg-slate-900 border-indigo-500/30' : 'bg-indigo-50/70 border-indigo-200 shadow-xs'
                            }`}>
                              <div className={`font-bold text-[11px] truncate ${isDark ? 'text-indigo-300' : 'text-indigo-900'}`}>{slot.subject_name}</div>
                              <div className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{slot.teacher_name}</div>
                              <div className={`text-[9px] font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-700 font-semibold'}`}>{slot.room_no}</div>
                            </div>
                          ) : (
                            <div className={`py-3 text-[10px] italic ${isDark ? 'text-slate-700' : 'text-slate-400'}`}>—</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD TIMETABLE SLOT WITH CLASH DETECTION */}
      {showAddSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative ${
            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={() => {
                setShowAddSlotModal(false);
                setClashError(null);
              }}
              className={`absolute top-5 right-5 cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Schedule Timetable Period</h3>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Enter schedule details. The system checks for faculty and room conflicts before saving.
            </p>

            {clashError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950 border border-rose-500/50 flex items-start gap-2.5 text-xs text-rose-300">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{clashError}</span>
              </div>
            )}

            <form onSubmit={handleAddSlot} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Day of Week</label>
                  <select
                    value={slotForm.day_of_week}
                    onChange={(e) => setSlotForm({ ...slotForm, day_of_week: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 text-xs ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Period Number</label>
                  <select
                    value={slotForm.period_no}
                    onChange={(e) => setSlotForm({ ...slotForm, period_no: Number(e.target.value) })}
                    className={`w-full border rounded-xl px-3 py-2 text-xs ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {periods.map((p) => (
                      <option key={p} value={p}>
                        Period {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Subject</label>
                <select
                  value={slotForm.subject_id}
                  onChange={(e) => setSlotForm({ ...slotForm, subject_id: Number(e.target.value) })}
                  className={`w-full border rounded-xl px-3 py-2 text-xs ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  {timetableSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Assigned Teacher</label>
                <select
                  value={slotForm.teacher_id}
                  onChange={(e) => setSlotForm({ ...slotForm, teacher_id: Number(e.target.value) })}
                  className={`w-full border rounded-xl px-3 py-2 text-xs ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  {timetableTeachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Room No</label>
                  <input
                    type="text"
                    value={slotForm.room_no}
                    onChange={(e) => setSlotForm({ ...slotForm, room_no: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 text-xs ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Time Slot</label>
                  <input
                    type="text"
                    value={`${slotForm.start_time.slice(0, 5)} - ${slotForm.end_time.slice(0, 5)}`}
                    disabled
                    className={`w-full border rounded-xl px-3 py-2 text-xs ${
                      isDark ? 'bg-slate-950/50 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSlotModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                >
                  Verify & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTimetableTab;

