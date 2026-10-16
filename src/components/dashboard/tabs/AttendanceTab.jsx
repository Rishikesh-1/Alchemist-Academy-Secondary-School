import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Search,
  Check,
  X,
} from 'lucide-react';
import AttendanceTimetableTab from './AttendanceTimetableTab';
import { useAuth } from '../../../context/AuthContext';
import { fetchHrData, markStaffAttendance } from '../../../services/api';

const AttendanceTab = ({ isDark }) => {
  const { lang, currentBranch } = useAuth();
  const [activeSub, setActiveSub] = useState('students'); // 'students' | 'staff'

  // Staff Attendance State
  const [staffData, setStaffData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const loadStaffAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetchHrData(selectedDate);
      if (res.success && res.data) {
        setStaffData(res.data);
      }
    } catch (err) {
      console.error('Error fetching staff attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSub === 'staff') {
      loadStaffAttendance();
    }
  }, [activeSub, selectedDate, currentBranch]);

  const handleMarkStaff = async (staffUserId, status) => {
    try {
      const res = await markStaffAttendance({
        staff_user_id: staffUserId,
        attendance_date: selectedDate,
        status: status,
      });
      if (res.success) {
        setStatusMsg({ type: 'success', text: `Marked staff member as ${status}.` });
        loadStaffAttendance();
      }
    } catch (err) {
      alert('Error updating staff attendance.');
    }
  };

  const staffDirectory = staffData?.staff_directory || [];
  const staffAttRecords = staffData?.attendance_records || [];
  const staffSummary = staffData?.summary || { total_staff: 0, present: 0, late: 0, absent: 0, on_leave: 0 };

  // Map attendance record by staff_user_id
  const attMap = {};
  staffAttRecords.forEach((r) => {
    attMap[r.staff_user_id] = r;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black">
            {lang === 'ne' ? 'दैनिक हाजिरी व्यवस्थापन (विद्यार्थी तथा कर्मचारी)' : 'Daily Attendance Telemetry'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'ne'
              ? 'विद्यार्थीको दैनिक/घण्टीगत हाजिरी, अभिभावकलाई अनुपस्थित सन्देश तथा संकाय/कर्मचारी हाजिरी'
              : 'Classroom student roll calls, parent absence SMS alerts, and staff biometric attendance muster'}
          </p>
        </div>
      </div>

      {/* Subtab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-700/50 pb-2">
        <button
          type="button"
          onClick={() => setActiveSub('students')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSub === 'students'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{lang === 'ne' ? 'विद्यार्थी हाजिरी तथा समयतालिका' : 'Student Attendance & Timetable'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSub('staff')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSub === 'staff'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{lang === 'ne' ? 'कर्मचारी तथा संकाय हाजिरी' : 'Staff & Faculty Muster'}</span>
          <span className="ml-1 px-2 py-0.2 rounded-full text-[10px] bg-blue-500/30 text-blue-300">
            {staffSummary.present} / {staffSummary.total_staff}
          </span>
        </button>
      </div>

      {activeSub === 'students' ? (
        <AttendanceTimetableTab isDark={isDark} />
      ) : (
        <div className="space-y-4">
          {/* Staff Attendance Toolbar */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-400">Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`px-3 py-1.5 rounded-xl text-xs border focus:outline-none ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-emerald-400">Present: {staffSummary.present}</span>
              <span className="text-amber-400">Late: {staffSummary.late}</span>
              <span className="text-rose-400">Absent: {staffSummary.absent}</span>
              <span className="text-blue-400">On Leave: {staffSummary.on_leave}</span>
            </div>
          </div>

          {/* Staff Roster Table */}
          <div
            className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead
                  className={`uppercase tracking-wider font-bold text-[10px] border-b ${
                    isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <tr>
                    <th className="px-4 py-3">Staff Member</th>
                    <th className="px-4 py-3">Role / Designation</th>
                    <th className="px-4 py-3">In Time</th>
                    <th className="px-4 py-3">Out Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Quick Mark</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
                  {staffDirectory.map((staff) => {
                    const rec = attMap[staff.id];
                    const currentStatus = rec?.status || 'unmarked';
                    return (
                      <tr
                        key={staff.id}
                        className={`transition-colors ${
                          isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{staff.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{staff.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                            isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}>
                            {staff.role_name}
                          </span>
                        </td>
                        <td className={`px-4 py-3 font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{rec?.in_time || '-'}</td>
                        <td className={`px-4 py-3 font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{rec?.out_time || '-'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              currentStatus === 'present'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : currentStatus === 'late'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : currentStatus === 'absent'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : currentStatus === 'on_leave'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {currentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleMarkStaff(staff.id, 'present')}
                              className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[10px] font-bold cursor-pointer"
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkStaff(staff.id, 'late')}
                              className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-[10px] font-bold cursor-pointer"
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkStaff(staff.id, 'absent')}
                              className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-[10px] font-bold cursor-pointer"
                            >
                              Absent
                            </button>
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
    </div>
  );
};

export default AttendanceTab;

