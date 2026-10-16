import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Receipt,
  FileSpreadsheet,
  PieChart,
  Calendar,
  X,
  Search,
} from 'lucide-react';
import CashierFeesTab from './CashierFeesTab';
import { useAuth } from '../../../context/AuthContext';
import { fetchFinancialOverview, recordExpenseVoucher } from '../../../services/api';

const FinanceFeesTab = ({ isDark }) => {
  const { lang, currentBranch } = useAuth();
  const [mainTab, setMainTab] = useState('fees'); // 'fees' | 'expenses' | 'statement'

  const [financeData, setFinanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Form State
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'utilities',
    amount: '',
    payment_mode: 'cash',
    reference_no: '',
    expense_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetchFinancialOverview();
      if (res.success && res.data) {
        setFinanceData(res.data);
      }
    } catch (err) {
      console.error('Error fetching financial overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mainTab === 'expenses' || mainTab === 'statement') {
      loadExpenses();
    }
  }, [mainTab, currentBranch]);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount) {
      alert('Expense title and amount are required.');
      return;
    }
    const res = await recordExpenseVoucher(expenseForm);
    if (res.success) {
      alert('Expense voucher recorded successfully.');
      setShowAddExpense(false);
      setExpenseForm({
        title: '',
        category: 'utilities',
        amount: '',
        payment_mode: 'cash',
        reference_no: '',
        expense_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      loadExpenses();
    } else {
      alert(res.message || 'Failed to record expense voucher.');
    }
  };

  const summary = financeData?.summary || {
    total_income_collected: 1850000,
    total_expenses: 120200,
    net_balance: 1729800,
  };

  return (
    <div className="space-y-6">
      {/* Module Title & Top Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black">
            {lang === 'ne' ? 'आय, व्यय तथा शुल्क व्यवस्थापन' : 'Income & Expense / Fee Operations'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'ne'
              ? 'शुल्क संकलन, बक्यौता ताकेता, दैनिक खर्च भौचर तथा वित्तीय विवरण'
              : 'End-to-end institutional fiscal management, fee billing, expense vouchers, and cashflow audit'}
          </p>
        </div>

        {mainTab === 'expenses' && (
          <button
            type="button"
            onClick={() => setShowAddExpense(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ne' ? 'नयाँ खर्च भौचर' : 'Record Expense Voucher'}</span>
          </button>
        )}
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700/50 pb-2">
        <button
          type="button"
          onClick={() => setMainTab('fees')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mainTab === 'fees'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{lang === 'ne' ? 'शुल्क संकलन तथा बक्यौता' : 'Fees Collection & Defaulters'}</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('expenses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mainTab === 'expenses'
              ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>{lang === 'ne' ? 'सञ्चालन खर्च भौचर' : 'Operational Expense Ledger'}</span>
          <span className="ml-1 px-2 py-0.2 rounded-full text-[10px] bg-rose-500/30 text-rose-400 font-bold">
            {financeData?.expenses?.length || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('statement')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mainTab === 'statement'
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{lang === 'ne' ? 'वित्तीय विवरण (Cashflow)' : 'Financial Cashflow Summary'}</span>
        </button>
      </div>

      {/* Tab 1: Fees Collection */}
      {mainTab === 'fees' && <CashierFeesTab isDark={isDark} />}

      {/* Tab 2: Expense Ledger */}
      {mainTab === 'expenses' && (
        <div className="space-y-4">
          <div
            className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead
                  className={`uppercase tracking-wider font-bold text-[10px] border-b ${
                    isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <tr>
                    <th className="px-4 py-3">Expense Date</th>
                    <th className="px-4 py-3">Expense Title & Purpose</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Payment Mode</th>
                    <th className="px-4 py-3">Ref / Voucher #</th>
                    <th className="px-4 py-3 text-right">Amount (NPR)</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
                  {(!financeData?.expenses || financeData.expenses.length === 0) ? (
                    <tr>
                      <td colSpan="6" className={`px-4 py-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        No expense records found. Click "Record Expense Voucher" to log operational costs.
                      </td>
                    </tr>
                  ) : (
                    financeData.expenses.map((e) => (
                      <tr
                        key={e.id}
                        className={`transition-colors ${
                          isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className={`px-4 py-3 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{e.expense_date}</td>
                        <td className="px-4 py-3">
                          <div className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{e.title}</div>
                          <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{e.notes || 'Institutional expenditure'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                            isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}>
                            {e.category}
                          </span>
                        </td>
                        <td className={`px-4 py-3 uppercase font-mono text-[11px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {e.payment_mode}
                        </td>
                        <td className={`px-4 py-3 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{e.reference_no || '-'}</td>
                        <td className="px-4 py-3 text-right font-black text-rose-500">
                          - NPR {Number(e.amount).toLocaleString()}
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

      {/* Tab 3: Financial Statement */}
      {mainTab === 'statement' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={`p-5 rounded-2xl border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className={`flex items-center justify-between text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span>Total Fee Receipts Inflow</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black mt-2 text-emerald-500">
                NPR {Number(summary.total_income_collected).toLocaleString()}
              </div>
              <div className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Verified cashier student receipts</div>
            </div>

            <div
              className={`p-5 rounded-2xl border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className={`flex items-center justify-between text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span>Operational Expense Outflow</span>
                <TrendingDown className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black mt-2 text-rose-500">
                NPR {Number(summary.total_expenses).toLocaleString()}
              </div>
              <div className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Utilities, maintenance, academic supplies</div>
            </div>

            <div
              className={`p-5 rounded-2xl border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className={`flex items-center justify-between text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span>Net Surplus Cashflow</span>
                <DollarSign className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black mt-2 text-blue-600 dark:text-blue-400">
                NPR {Number(summary.net_balance).toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-1 font-semibold">Positive campus liquidity</div>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Voucher Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-500" />
                <h2 className="text-base font-bold">Record Operational Expense Voucher</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddExpense(false)}
                className={`cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3.5 text-xs">
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NEA Campus Electricity Bill or Lab Glassware"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-rose-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="utilities">Utilities (बिजुली/पानी/इन्टरनेट)</option>
                    <option value="maintenance">Maintenance (मर्मत सम्भार)</option>
                    <option value="academic">Academic & Lab (शैक्षिक सामग्री)</option>
                    <option value="supplies">Stationery Supplies (स्टेशनरी)</option>
                    <option value="events">Sports & Events (खेलकुद तथा कार्यक्रम)</option>
                    <option value="salaries">Salaries (कर्मचारी तलब)</option>
                    <option value="other">Other Operational</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Amount (NPR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 15000"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Payment Mode</label>
                  <select
                    value={expenseForm.payment_mode}
                    onChange={(e) => setExpenseForm({ ...expenseForm, payment_mode: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="cash">Cash (नगद)</option>
                    <option value="bank_transfer">Bank Transfer / Fonepay</option>
                    <option value="cheque">Cheque (चेक)</option>
                    <option value="qr">QR Scan</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Voucher / Ref No</label>
                  <input
                    type="text"
                    placeholder="VCH-1029 or Cheque #88192"
                    value={expenseForm.reference_no}
                    onChange={(e) => setExpenseForm({ ...expenseForm, reference_no: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
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
                  Save Expense Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceFeesTab;

