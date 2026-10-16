import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  FileText,
  CreditCard,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  DollarSign,
  X,
  Edit2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  fetchHrData,
  applyStaffLeave,
  updateStaffLeaveStatus,
  fetchPayrollData,
  generateMonthlyPayroll,
  createStaff,
  updateStaff,
} from '../../../services/api';

const HumanResourceTab = ({ isDark }) => {
  const { lang, currentBranch } = useAuth();
  const [subTab, setSubTab] = useState('directory'); // 'directory' | 'leaves' | 'payroll'

  const [hrData, setHrData] = useState(null);
  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Staff Management Modal State
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffModalMode, setStaffModalMode] = useState('create'); // 'create' | 'edit'
  const [staffForm, setStaffForm] = useState({
    id: null,
    name: '',
    email: '',
    phone: '',
    role_name: 'teacher',
    status: 'active',
    password: '',
  });

  // Form State for Leave Application
  const [leaveForm, setLeaveForm] = useState({
    staff_user_id: '',
    leave_type: 'casual',
    from_date: new Date().toISOString().split('T')[0],
    to_date: new Date().toISOString().split('T')[0],
    days_count: 1,
    reason: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [hRes, pRes] = await Promise.allSettled([
        fetchHrData(),
        fetchPayrollData(),
      ]);
      if (hRes.status === 'fulfilled' && hRes.value?.success) {
        setHrData(hRes.value.data);
      }
      if (pRes.status === 'fulfilled' && pRes.value?.success) {
        setPayrollData(pRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching HR data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentBranch]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.reason) {
      alert('Reason for leave is required.');
      return;
    }
    const res = await applyStaffLeave(leaveForm);
    if (res.success) {
      alert('Leave application submitted successfully.');
      setShowApplyModal(false);
      loadData();
    } else {
      alert(res.message || 'Failed to submit leave.');
    }
  };

  const handleLeaveDecision = async (leaveId, decision) => {
    const notes = prompt(`Enter optional decision note for ${decision}:`) || '';
    const res = await updateStaffLeaveStatus(leaveId, decision, notes);
    if (res.success) {
      alert(`Leave application marked as ${decision}.`);
      loadData();
    } else {
      alert(res.message || 'Action failed.');
    }
  };

  const handleOpenCreateStaff = () => {
    setStaffModalMode('create');
    setStaffForm({
      id: null,
      name: '',
      email: '',
      phone: '',
      role_name: 'teacher',
      status: 'active',
      password: '',
    });
    setShowStaffModal(true);
  };

  const handleOpenEditStaff = (member) => {
    setStaffModalMode('edit');
    setStaffForm({
      id: member.id,
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      role_name: member.role_name || 'teacher',
      status: member.status || 'active',
      password: '',
    });
    setShowStaffModal(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.email) {
      alert('Staff name and email are required.');
      return;
    }
    try {
      let res;
      if (staffModalMode === 'create') {
        res = await createStaff(staffForm);
      } else {
        res = await updateStaff(staffForm);
      }
      if (res && res.success) {
        alert(res.message || 'Staff record saved successfully.');
        setShowStaffModal(false);
        loadData();
      } else {
        alert(res?.message || 'Failed to save staff record.');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const staff = hrData?.staff_directory || [];
  const leaves = hrData?.leaves || [];
  const payrollSlips = payrollData?.payslips || [];
  const payrollStructures = payrollData?.structures || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black">
            {lang === 'ne' ? 'मानव संसाधन तथा कर्मचारी व्यवस्थापन' : 'Human Resources & Workforce'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'ne'
              ? 'संकाय/कर्मचारी प्रोफाइल, बिदा स्वीकृति कार्यप्रवाह तथा मासिक तलब विवरण'
              : 'Institutional staff directory, leave lifecycle workflows, and monthly salary disbursement'}
          </p>
        </div>

        {subTab === 'directory' && (
          <button
            type="button"
            onClick={handleOpenCreateStaff}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ne' ? 'नयाँ शिक्षक / कर्मचारी थप्नुहोस्' : 'Add Teacher / Staff'}</span>
          </button>
        )}

        {subTab === 'leaves' && (
          <button
            type="button"
            onClick={() => setShowApplyModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ne' ? 'बिदा निवेदन दर्ता' : 'Apply for Leave'}</span>
          </button>
        )}
      </div>

      {/* Subtab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-700/50 pb-2">
        <button
          type="button"
          onClick={() => setSubTab('directory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'directory'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{lang === 'ne' ? 'कर्मचारी नामावली' : 'Staff Directory'}</span>
          <span className="ml-1 px-2 py-0.2 rounded-full text-[10px] bg-blue-500/30 text-blue-300">
            {staff.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'leaves'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{lang === 'ne' ? 'बिदा व्यवस्थापन' : 'Leave Approvals'}</span>
          <span className="ml-1 px-2 py-0.2 rounded-full text-[10px] bg-amber-500/30 text-amber-300">
            {leaves.filter((l) => l.status === 'pending').length} Pending
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('payroll')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'payroll'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{lang === 'ne' ? 'कर्मचारी तलब तथा पेस्लिप' : 'Staff Payroll'}</span>
        </button>
      </div>

      {/* Directory Tab */}
      {subTab === 'directory' && (
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
                  <th className="px-4 py-3">Staff Name</th>
                  <th className="px-4 py-3">Role / Designation</th>
                  <th className="px-4 py-3">Contact Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Account Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
                {staff.map((s) => (
                  <tr
                    key={s.id}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className={`px-4 py-3 font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{s.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                        isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {s.role_name}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{s.email}</td>
                    <td className={`px-4 py-3 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{s.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEditStaff(s)}
                        className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors cursor-pointer"
                        title="Edit Faculty / Staff Record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leaves Tab */}
      {subTab === 'leaves' && (
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
                  <th className="px-4 py-3">Staff Name</th>
                  <th className="px-4 py-3">Leave Type</th>
                  <th className="px-4 py-3">Dates & Days</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                      No leave applications submitted.
                    </td>
                  </tr>
                ) : (
                  leaves.map((l) => {
                    const isPending = l.status === 'pending';
                    const isApproved = l.status === 'approved';
                    return (
                      <tr
                        key={l.id}
                        className={`transition-colors ${
                          isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className={`px-4 py-3 font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                          {l.staff_name}
                          <div className="text-[10px] text-slate-400 font-normal">{l.role_name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {l.leave_type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {l.from_date} to {l.to_date}
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold">{l.days_count} Day(s)</div>
                        </td>
                        <td className={`px-4 py-3 max-w-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          <div>{l.reason}</div>
                          {l.decision_notes && (
                            <div className="text-[10px] text-slate-400 mt-0.5 italic">Note: {l.decision_notes}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isApproved
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : isPending
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleLeaveDecision(l.id, 'approved')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLeaveDecision(l.id, 'rejected')}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500">Processed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payroll Tab */}
      {subTab === 'payroll' && (
        <div className="space-y-4">
          <div
            className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className={`p-4 border-b flex items-center justify-between ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div>
                <h3 className="font-bold text-xs uppercase text-slate-400">Monthly Payroll Records</h3>
                <div className={`text-sm font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Disbursed Staff Salary Slips</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead
                  className={`uppercase tracking-wider font-bold text-[10px] border-b ${
                    isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <tr>
                    <th className="px-4 py-3">Staff Member</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3">Base Salary</th>
                    <th className="px-4 py-3">Allowances</th>
                    <th className="px-4 py-3">Deductions</th>
                    <th className="px-4 py-3 text-right">Net Payable</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
                  {payrollSlips.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                        No payslips generated for this period.
                      </td>
                    </tr>
                  ) : (
                    payrollSlips.map((p) => (
                      <tr
                        key={p.id}
                        className={`transition-colors ${
                          isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className={`px-4 py-3 font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{p.staff_name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {p.role_name}
                          </span>
                        </td>
                        <td className={`px-4 py-3 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {p.month}/{p.year}
                        </td>
                        <td className={`px-4 py-3 font-mono ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                          NPR {Number(p.basic_salary).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-mono text-emerald-500 font-semibold">
                          + NPR {Number(p.allowance).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-mono text-rose-500 font-semibold">
                          - NPR {Number(p.deduction).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-black font-mono text-emerald-500">
                          NPR {Number(p.net_salary).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold">Submit Staff Leave Application</h2>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Staff Member *</label>
                <select
                  required
                  value={leaveForm.staff_user_id}
                  onChange={(e) => setLeaveForm({ ...leaveForm, staff_user_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none"
                >
                  <option value="">Select Staff...</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role_name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Leave Type</label>
                <select
                  value={leaveForm.leave_type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none"
                >
                  <option value="casual">Casual Leave (आकस्मिक बिदा)</option>
                  <option value="sick">Sick Leave (बिरामी बिदा)</option>
                  <option value="maternity">Maternity Leave (प्रसूति बिदा)</option>
                  <option value="earned">Earned / Privilege Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">From Date</label>
                  <input
                    type="date"
                    value={leaveForm.from_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, from_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">To Date</label>
                  <input
                    type="date"
                    value={leaveForm.to_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, to_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Reason for Leave *</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Details of absence request..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT TEACHER OR STAFF MEMBER */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowStaffModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">
                {staffModalMode === 'create' ? 'Register Faculty / Staff Member' : 'Edit Staff Record'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              {staffModalMode === 'create'
                ? 'Create user credentials, assign institutional clearance role, and enroll in department.'
                : 'Update staff member profile, role designation, and operational status.'}
            </p>

            <form onSubmit={handleSaveStaff} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Saroj Karki or Bina Shrestha"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="saroj@alchemist.edu.np"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="9841000000"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Role / Designation *</label>
                  <select
                    value={staffForm.role_name}
                    onChange={(e) => setStaffForm({ ...staffForm, role_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="teacher">Faculty Teacher (विषय शिक्षक)</option>
                    <option value="admin">School Administrator (प्रशासक)</option>
                    <option value="principal">Principal (प्रधानाध्यापक)</option>
                    <option value="accountant">Accountant / Cashier (लेखापाल)</option>
                    <option value="librarian">Librarian (पुस्तकालय प्रमुख)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Account Status</label>
                  <select
                    value={staffForm.status}
                    onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="active">Active (सक्रिय)</option>
                    <option value="inactive">Inactive (निष्क्रिय)</option>
                    <option value="suspended">Suspended (निलम्बित)</option>
                  </select>
                </div>
              </div>

              {staffModalMode === 'create' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Initial Password (Default: Teacher@123)
                  </label>
                  <input
                    type="password"
                    placeholder="Leave blank for Teacher@123"
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md"
                >
                  {staffModalMode === 'create' ? 'Register Staff' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HumanResourceTab;

