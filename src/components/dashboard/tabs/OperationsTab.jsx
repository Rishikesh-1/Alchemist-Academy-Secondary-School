import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Bus,
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  Printer,
  Calendar,
  DollarSign,
  Phone,
  UserCheck,
  X,
} from 'lucide-react';
import {
  fetchLibraryData,
  issueLibraryBook,
  returnLibraryBook,
  fetchTransportData,
  fetchPayrollData,
  generateMonthlyPayroll,
} from '../../../services/api';
import { formatDualDate, toNepaliNumerals } from '../../../utils/nepaliCalendar';
import { getTranslation } from '../../../utils/translations';
import { useAuth } from '../../../context/AuthContext';

const OperationsTab = ({ isDark }) => {
  const { lang, currentBranch } = useAuth();
  const [subTab, setSubTab] = useState('library'); // 'library' | 'transport' | 'payroll'

  // Library state
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({ book_id: 1, student_id: 1, due_days: 14 });

  // Transport state
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);

  // Payroll state
  const [payrollStructures, setPayrollStructures] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [month, setMonth] = useState(10);
  const [year, setYear] = useState(2026);
  const [statusMessage, setStatusMessage] = useState(null);

  // Load Library
  const loadLibrary = async () => {
    try {
      const res = await fetchLibraryData();
      if (res && res.success && res.data) {
        setBooks(res.data.books || []);
        setIssues(res.data.issues || []);
      }
    } catch (e) {}
  };

  // Load Transport
  const loadTransport = async () => {
    try {
      const res = await fetchTransportData();
      if (res && res.success && res.data) {
        setVehicles(res.data.vehicles || []);
        setRoutes(res.data.routes || []);
      }
    } catch (e) {}
  };

  // Load Payroll
  const loadPayroll = async () => {
    try {
      const res = await fetchPayrollData(month, year);
      if (res && res.success && res.data) {
        setPayrollStructures(res.data.structures || []);
        setPayslips(res.data.payslips || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (subTab === 'library') loadLibrary();
    if (subTab === 'transport') loadTransport();
    if (subTab === 'payroll') loadPayroll();
  }, [subTab, month, year, currentBranch?.id]);

  // Handle Book Issue
  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await issueLibraryBook(issueForm.book_id, issueForm.student_id, issueForm.due_days);
      if (res && res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        setShowIssueModal(false);
        loadLibrary();
      } else {
        setStatusMessage({ type: 'error', text: res?.message || 'Failed to issue book.' });
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: e.message });
    }
  };

  // Handle Book Return
  const handleReturnBook = async (issueId) => {
    try {
      const res = await returnLibraryBook(issueId, 0);
      if (res && res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        loadLibrary();
      } else {
        setStatusMessage({ type: 'error', text: res?.message || 'Failed to return book.' });
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: e.message });
    }
  };

  // Generate Payroll Slips
  const handleGeneratePayroll = async () => {
    try {
      const res = await generateMonthlyPayroll(month, year);
      if (res && res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        loadPayroll();
      } else {
        setStatusMessage({ type: 'error', text: res?.message || 'Payroll generation failed.' });
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: e.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('library')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'library' ? 'bg-amber-600 text-white shadow' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Library Circulation</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('transport')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'transport' ? 'bg-cyan-600 text-white shadow' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>Transport & Bus Fleet</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('payroll')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'payroll' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Staff Payroll & Payslips</span>
          </button>
        </div>
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

      {/* 1. LIBRARY CIRCULATION VIEW */}
      {subTab === 'library' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 flex-wrap gap-2">
            <div>
              <h4 className="text-sm font-bold text-white">Central Library Inventory & Borrowing</h4>
              <p className="text-xs text-slate-400">Track book catalog, borrower cards, and due returns.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowIssueModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Book to Student</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Catalog */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <h5 className="text-xs font-bold uppercase text-slate-400 mb-3">Books in Catalog ({books.length})</h5>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {books.map((b) => (
                  <div key={b.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{b.title}</div>
                      <div className="text-[10px] text-slate-400">By {b.author} • ISBN: {b.isbn}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-mono font-bold">{b.available_copies} / {b.total_copies}</div>
                      <div className="text-[9px] text-slate-500">{b.shelf_location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Issues */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <h5 className="text-xs font-bold uppercase text-slate-400 mb-3">Active Borrowings ({issues.length})</h5>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {issues.map((iss) => (
                  <div key={iss.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{iss.book_title}</div>
                      <div className="text-[10px] text-slate-400">
                        Borrower: {iss.first_name} {iss.last_name} ({iss.admission_no})
                      </div>
                      <div className="text-[9px] text-amber-400 font-mono">Due: {iss.due_date}</div>
                    </div>
                    <div>
                      {iss.status === 'issued' ? (
                        <button
                          type="button"
                          onClick={() => handleReturnBook(iss.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer"
                        >
                          Return Book
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{iss.status}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TRANSPORT & BUS TRANSIT VIEW */}
      {subTab === 'transport' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <h4 className="text-sm font-bold text-white">Campus Bus Transit & Route Management</h4>
            <p className="text-xs text-slate-400">Active bus vehicles, driver phone contacts, and student stops.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicles */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <h5 className="text-xs font-bold uppercase text-slate-400 mb-3">Vehicle Fleet ({vehicles.length})</h5>
              <div className="space-y-2.5">
                {vehicles.map((v) => (
                  <div key={v.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Bus className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white font-mono">{v.vehicle_no}</div>
                        <div className="text-[10px] text-slate-400">Driver: {v.driver_name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-[11px] text-slate-300 font-mono">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{v.driver_phone}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Cap: {v.capacity} Seats</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Routes */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <h5 className="text-xs font-bold uppercase text-slate-400 mb-3">Pickup Routes ({routes.length})</h5>
              <div className="space-y-2.5">
                {routes.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white">{r.route_name}</div>
                      <div className="font-mono font-bold text-emerald-400">NPR {Number(r.monthly_fare).toLocaleString()}/mo</div>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Vehicle: <span className="font-mono text-cyan-300">{r.vehicle_no || 'Ba 2 Kha 9912'}</span> • Driver: {r.driver_name}
                    </div>
                    {r.stops?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {r.stops.map((stop, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-300">
                            {stop.stop_name} ({stop.pickup_time})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. STAFF PAYROLL & PAYSLIPS VIEW */}
      {subTab === 'payroll' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 flex-wrap gap-3">
            <div>
              <h4 className="text-sm font-bold text-white">Staff Compensation & Payroll Ledger</h4>
              <p className="text-xs text-slate-400">
                Monthly automated payslip generation with allowances, CIT, EPF, and tax deductions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              >
                {[
                  { m: 1, name: 'January / Magh' },
                  { m: 2, name: 'February / Falgun' },
                  { m: 3, name: 'March / Chaitra' },
                  { m: 4, name: 'April / Baisakh' },
                  { m: 5, name: 'May / Jestha' },
                  { m: 6, name: 'June / Ashadh' },
                  { m: 7, name: 'July / Shrawan' },
                  { m: 8, name: 'August / Bhadra' },
                  { m: 9, name: 'September / Ashwin' },
                  { m: 10, name: 'October / Kartik' },
                  { m: 11, name: 'November / Mangsir' },
                  { m: 12, name: 'December / Poush' },
                ].map((item) => (
                  <option key={item.m} value={item.m}>
                    {item.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleGeneratePayroll}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>{getTranslation('generate_payslips', lang)}</span>
              </button>
            </div>
          </div>

          {/* Payslips Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Staff Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Basic Salary</th>
                    <th className="py-3 px-4">Allowances</th>
                    <th className="py-3 px-4">Deductions (Tax/EPF)</th>
                    <th className="py-3 px-4 text-right">Net Payable</th>
                    <th className="py-3 px-4 text-right">Print Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {payslips.map((ps) => (
                    <tr key={ps.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{ps.staff_name}</div>
                        <div className="text-[10px] text-slate-400">{ps.staff_email}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-400">{ps.role_name}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">NPR {Number(ps.basic_salary).toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-teal-400">+ NPR {Number(ps.allowances).toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-rose-400">- NPR {Number(ps.deductions).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        NPR {Number(ps.net_salary).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-300 cursor-pointer"
                          title="Print Official Payslip"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE BOOK */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowIssueModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Issue Library Book</h3>
            <p className="text-xs text-slate-400 mb-4">Validate student borrowing card and record due date.</p>

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Book</label>
                <select
                  value={issueForm.book_id}
                  onChange={(e) => setIssueForm({ ...issueForm, book_id: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.available_copies} available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Student ID #</label>
                <input
                  type="number"
                  value={issueForm.student_id}
                  onChange={(e) => setIssueForm({ ...issueForm, student_id: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Loan Duration (Days)</label>
                <input
                  type="number"
                  value={issueForm.due_days}
                  onChange={(e) => setIssueForm({ ...issueForm, due_days: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationsTab;
