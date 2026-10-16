import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  FileCheck,
  AlertTriangle,
  Send,
  Printer,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  Plus,
  X,
} from 'lucide-react';
import CashierFeeCollector from '../../CashierFeeCollector';
import {
  fetchFeeStructures,
  fetchFeeDefaulters,
  sendFeeDueReminders,
  fetchFeeReceipts,
} from '../../../services/api';
import { formatDualDate, toNepaliNumerals } from '../../../utils/nepaliCalendar';
import { getTranslation } from '../../../utils/translations';
import { useAuth } from '../../../context/AuthContext';

const CashierFeesTab = ({ isDark }) => {
  const { lang, currentBranch } = useAuth();
  const [subTab, setSubTab] = useState('cashier'); // 'cashier' | 'structures' | 'defaulters' | 'ledger'

  // Structures state
  const [structures, setStructures] = useState([]);
  const [categories, setCategories] = useState([]);

  // Defaulters state
  const [defaultersData, setDefaultersData] = useState({
    total_defaulters: 0,
    total_outstanding: 0,
    aging: {},
    defaulters: [],
  });
  const [selectedAgingBucket, setSelectedAgingBucket] = useState('all');

  // Ledger state
  const [receipts, setReceipts] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);

  // Load structures
  const loadStructures = async () => {
    try {
      const res = await fetchFeeStructures();
      if (res && res.success && res.data) {
        setStructures(res.data.structures || []);
        setCategories(res.data.categories || []);
      }
    } catch (e) {}
  };

  // Load defaulters
  const loadDefaulters = async () => {
    try {
      const res = await fetchFeeDefaulters();
      if (res && res.success && res.data) {
        setDefaultersData(res.data);
      }
    } catch (e) {}
  };

  // Load receipts ledger
  const loadLedger = async () => {
    try {
      const res = await fetchFeeReceipts();
      if (res && res.success && res.data?.receipts) {
        setReceipts(res.data.receipts);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (subTab === 'structures') loadStructures();
    if (subTab === 'defaulters') loadDefaulters();
    if (subTab === 'ledger') loadLedger();
  }, [subTab, currentBranch?.id]);

  // Dispatch Fee Reminders to Defaulters
  const handleSendReminders = async (invoiceIds) => {
    try {
      const ids = invoiceIds || defaultersData.defaulters.map((d) => d.id);
      if (ids.length === 0) {
        setStatusMessage({ type: 'error', text: 'No defaulters selected.' });
        return;
      }
      const res = await sendFeeDueReminders(ids, 'sms');
      if (res && res.success) {
        setStatusMessage({ type: 'success', text: res.message });
      } else {
        setStatusMessage({ type: 'error', text: res?.message || 'Failed to dispatch reminders.' });
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: e.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className={`flex items-center justify-between border-b pb-3 flex-wrap gap-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSubTab('cashier')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'cashier'
                ? 'bg-teal-600 text-white shadow'
                : isDark
                ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Counter Terminal</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('defaulters')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'defaulters'
                ? 'bg-rose-600 text-white shadow'
                : isDark
                ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Defaulters Aging Report</span>
            {defaultersData.total_defaulters > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                {defaultersData.total_defaulters}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSubTab('structures')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'structures'
                ? 'bg-indigo-600 text-white shadow'
                : isDark
                ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Fee Tariffs & Installments</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('ledger')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'ledger'
                ? 'bg-emerald-600 text-white shadow'
                : isDark
                ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Receipts Ledger</span>
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

      {/* SUB-VIEW 1: CASHIER FEE COLLECTOR */}
      {subTab === 'cashier' && <CashierFeeCollector isDark={isDark} />}

      {/* SUB-VIEW 2: DEFAULTERS AGING REPORT */}
      {subTab === 'defaulters' && (
        <div className="space-y-4">
          {/* Defaulter Aging Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Outstanding</div>
              <div className="text-xl font-bold font-mono text-rose-500 mt-1">
                NPR {Number(defaultersData.total_outstanding).toLocaleString()}
              </div>
              <div className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{defaultersData.total_defaulters} Students overdue</div>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="text-[10px] uppercase font-bold text-amber-500">Under 30 Days</div>
              <div className="text-xl font-bold font-mono text-amber-500 mt-1">
                {defaultersData.aging?.under_30_count || 0}
              </div>
              <div className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Grace period active</div>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="text-[10px] uppercase font-bold text-orange-500">30 - 60 Days</div>
              <div className="text-xl font-bold font-mono text-orange-500 mt-1">
                {defaultersData.aging?.days_30_60_count || 0}
              </div>
              <div className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Late fee penalty applied</div>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-rose-900/40 bg-rose-950/10' : 'bg-rose-50/60 border-rose-200 shadow-sm'}`}>
              <div className="text-[10px] uppercase font-bold text-rose-600">60 - 90+ Days</div>
              <div className="text-xl font-bold font-mono text-rose-600 mt-1">
                {(defaultersData.aging?.days_60_90_count || 0) + (defaultersData.aging?.over_90_count || 0)}
              </div>
              <div className="text-[10px] text-rose-600 mt-0.5 font-semibold">Critical recovery list</div>
            </div>
          </div>

          {/* Action Bar */}
          <div className={`flex items-center justify-between p-3.5 rounded-2xl border flex-wrap gap-2 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Automated Fee Due Reminders Engine:
            </span>
            <button
              type="button"
              onClick={() => handleSendReminders()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Reminders to All Defaulters (SMS)</span>
            </button>
          </div>

          {/* Defaulters Table */}
          <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white shadow-sm'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b font-bold uppercase text-[10px] ${isDark ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                    <th className="py-3 px-4">Student & Adm #</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Guardian Contact</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Overdue Days</th>
                    <th className="py-3 px-4 text-right">Outstanding (NPR)</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                  {defaultersData.defaulters.length === 0 ? (
                    <tr>
                      <td colSpan="7" className={`py-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        No outstanding fee defaulters recorded.
                      </td>
                    </tr>
                  ) : (
                    defaultersData.defaulters.map((d) => (
                      <tr key={d.id} className={`transition-colors ${isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'}`}>
                        <td className="py-3 px-4">
                          <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {d.first_name} {d.last_name}
                          </div>
                          <div className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{d.admission_no}</div>
                        </td>
                        <td className={`py-3 px-4 font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{d.class_name}</td>
                        <td className="py-3 px-4">
                          <div className={isDark ? 'text-slate-300' : 'text-slate-800 font-medium'}>{d.guardian_name}</div>
                          <div className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{d.guardian_phone}</div>
                        </td>
                        <td className={`py-3 px-4 font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{d.due_date}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-300'
                          }`}>
                            {d.overdue_days} Days
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-500">
                          NPR {Number(d.outstanding_balance).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleSendReminders([d.id])}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                              isDark
                                ? 'bg-slate-900 border-slate-700 hover:border-emerald-500 text-slate-200'
                                : 'bg-slate-100 border-slate-300 hover:border-emerald-500 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            Send SMS
                          </button>
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

      {/* SUB-VIEW 3: FEE TARIFFS & INSTALLMENTS */}
      {subTab === 'structures' && (
        <div className="space-y-4">
          <div className={`rounded-2xl border p-4 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white shadow-sm'}`}>
            <h4 className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Approved Tuition & Institutional Tariffs</h4>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Configured fee schedules, monthly/annual installments, and late fee penalties per class.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b font-bold uppercase text-[10px] ${isDark ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Fee Category</th>
                    <th className="py-3 px-4">Billing Frequency</th>
                    <th className="py-3 px-4">Installments</th>
                    <th className="py-3 px-4">Due Day</th>
                    <th className="py-3 px-4 text-right">Amount (NPR)</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                  {structures.map((s) => (
                    <tr key={s.id} className={`transition-colors ${isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'}`}>
                      <td className={`py-3 px-4 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.class_name}</td>
                      <td className={`py-3 px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{s.category_name}</td>
                      <td className={`py-3 px-4 uppercase text-[10px] font-bold font-mono ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
                        {s.billing_frequency}
                      </td>
                      <td className={`py-3 px-4 font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{s.installments_count}</td>
                      <td className={`py-3 px-4 font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Day {s.due_date_day}</td>
                      <td className={`py-3 px-4 text-right font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        NPR {Number(s.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: RECEIPTS LEDGER */}
      {subTab === 'ledger' && (
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white shadow-sm'}`}>
          <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Immutable Fee Receipts Ledger</h4>
            <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{receipts.length} Transactions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b font-bold uppercase text-[10px] ${isDark ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Cashier</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-right">Print</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                {receipts.map((r) => (
                  <tr key={r.id} className={`transition-colors ${isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'}`}>
                    <td className={`py-3 px-4 font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{r.receipt_no}</td>
                    <td className="py-3 px-4">
                      <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {r.first_name} {r.last_name}
                      </div>
                      <div className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{r.admission_no}</div>
                    </td>
                    <td className={`py-3 px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{formatDualDate(r.payment_date?.slice(0, 10), lang)}</td>
                    <td className={`py-3 px-4 uppercase text-[10px] font-bold ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>{r.payment_mode}</td>
                    <td className={`py-3 px-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{r.cashier_name || 'Bursar Desk'}</td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      NPR {Number(r.amount_paid).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className={`p-1.5 rounded-lg border cursor-pointer ${
                          isDark
                            ? 'bg-slate-900 border-slate-700 hover:border-emerald-500 text-slate-300'
                            : 'bg-slate-100 border-slate-300 hover:border-emerald-500 text-slate-700 hover:bg-slate-200'
                        }`}
                        title="Print Receipt"
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
      )}
    </div>
  );
};

export default CashierFeesTab;
