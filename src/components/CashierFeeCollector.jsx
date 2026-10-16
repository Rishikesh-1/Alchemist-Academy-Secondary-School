import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  DollarSign,
  Printer,
  Receipt,
  User,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Plus,
  Check,
  Smartphone,
  Phone,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useSiteData } from '../context/SiteContext';
import { useSchoolData } from '../context/SchoolDataContext';

// Default Student Accounts Directory for Cashier Lookup
const SAMPLE_STUDENTS = [
  {
    id: 'STU-1001',
    rollNo: 14,
    name: 'Aarav Sharma',
    grade: 'Grade 10',
    section: 'Section A',
    guardian: 'RJ Rana & Sunita Sharma',
    phone: '+977 9841234567',
    busRoute: 'Route 3: Jorpati Oralo - Chabahil',
    outstandingDues: 8500,
    paidThisYear: 42500,
    feeItems: [
      { id: 'item-1', label: 'Monthly Tuition Fee (Ashwin)', amount: 5500, selected: true },
      { id: 'item-2', label: 'Computer & Science Lab Fee', amount: 1200, selected: true },
      { id: 'item-3', label: 'School Bus Transportation (Route 3)', amount: 1500, selected: true },
      { id: 'item-4', label: 'Digital Library & LMS Access', amount: 300, selected: true },
    ],
  },
  {
    id: 'STU-1002',
    rollNo: 2,
    name: 'Sneha Adhikari',
    grade: 'Grade 10',
    section: 'Section A',
    guardian: 'Hari Prasad Adhikari',
    phone: '+977 9841987654',
    busRoute: 'Self Commute / Pedestrian',
    outstandingDues: 6700,
    paidThisYear: 45000,
    feeItems: [
      { id: 'item-1', label: 'Monthly Tuition Fee (Ashwin)', amount: 5500, selected: true },
      { id: 'item-2', label: 'Computer & Science Lab Fee', amount: 1200, selected: true },
    ],
  },
  {
    id: 'STU-1003',
    rollNo: 5,
    name: 'Ayush Gurung',
    grade: 'Grade 10',
    section: 'Section A',
    guardian: 'Dhan Bahadur Gurung',
    phone: '+977 9843344556',
    busRoute: 'Route 1: Gokarna - Jorpati',
    outstandingDues: 12200,
    paidThisYear: 38000,
    feeItems: [
      { id: 'item-1', label: 'Monthly Tuition Fee (Bhadra + Ashwin)', amount: 10000, selected: true },
      { id: 'item-2', label: 'First Terminal Examination Fee', amount: 1000, selected: true },
      { id: 'item-3', label: 'Bus Transportation (2 Months)', amount: 1200, selected: true },
    ],
  },
];

const INITIAL_TRANSACTIONS = [
  {
    receiptNo: 'RCP-2026-1049',
    studentName: 'Aarav Sharma',
    rollNo: 14,
    grade: 'Grade 10-A',
    amount: 8500,
    method: 'Cash Counter',
    date: '2026-10-15 11:20 AM',
    cashier: 'RJ Rana',
    status: 'completed',
  },
  {
    receiptNo: 'RCP-2026-1048',
    studentName: 'Rohan Shrestha',
    rollNo: 3,
    grade: 'Grade 10-A',
    amount: 7000,
    method: 'Counter Fonepay QR',
    date: '2026-10-15 10:45 AM',
    cashier: 'Sunita Adhikari',
    status: 'completed',
  },
  {
    receiptNo: 'RCP-2026-1047',
    studentName: 'Diya Karki',
    rollNo: 4,
    grade: 'Grade 10-A',
    amount: 5500,
    method: 'Bank Cheque (Nabil Bank)',
    date: '2026-10-14 02:15 PM',
    cashier: 'RJ Rana',
    status: 'completed',
  },
];

const CashierFeeCollector = ({ isDark: propIsDark }) => {
  const { siteData, isDark: contextIsDark } = useSiteData();
  const isDark = propIsDark !== undefined ? propIsDark : contextIsDark;
  const { branding, footer } = siteData;

  // Search & Selected Student
  const [searchTerm, setSearchTerm] = useState('14');
  const [selectedStudent, setSelectedStudent] = useState(SAMPLE_STUDENTS[0]);

  // Fee items selection for current student
  const [feeItems, setFeeItems] = useState(SAMPLE_STUDENTS[0].feeItems);

  // Payment Form State
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' | 'cheque' | 'fonepay' | 'bank_slip'
  const [chequeNo, setChequeNo] = useState('');
  const [bankName, setBankName] = useState('');
  const [concessionDiscount, setConcessionDiscount] = useState(0);
  const [cashierName, setCashierName] = useState('RJ Rana (Senior Cashier)');
  const [notes, setNotes] = useState('');

  // Transactions Log
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

  // Printable Receipt Modal State
  const [activeReceiptModal, setActiveReceiptModal] = useState(null);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState(false);

  // Student Search Handler
  const handleSearchStudent = (term) => {
    setSearchTerm(term);
    const clean = term.toLowerCase().trim();
    if (!clean) return;

    const match = SAMPLE_STUDENTS.find(
      (s) =>
        s.rollNo.toString() === clean ||
        s.name.toLowerCase().includes(clean) ||
        s.id.toLowerCase().includes(clean)
    );

    if (match) {
      setSelectedStudent(match);
      setFeeItems(match.feeItems);
    }
  };

  // Toggle Fee Item Selection
  const handleToggleFeeItem = (id) => {
    setFeeItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  // Calculate Payable Total
  const subtotal = feeItems
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.amount, 0);
  const payableTotal = Math.max(0, subtotal - Number(concessionDiscount || 0));

  // Process Counter Fee Collection
  const handleProcessCollection = (e) => {
    e.preventDefault();
    if (payableTotal <= 0) {
      alert('Please select at least one fee head to collect.');
      return;
    }

    const receiptNo = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newTxn = {
      receiptNo,
      studentName: selectedStudent.name,
      rollNo: selectedStudent.rollNo,
      grade: `${selectedStudent.grade}-${selectedStudent.section}`,
      amount: payableTotal,
      method:
        paymentMode === 'cash'
          ? 'Cash Counter'
          : paymentMode === 'cheque'
          ? `Cheque (${bankName} #${chequeNo})`
          : paymentMode === 'fonepay'
          ? 'Counter Fonepay QR'
          : 'Bank Deposit Slip',
      date: formattedDate,
      cashier: cashierName,
      status: 'completed',
      collectedItems: feeItems.filter((i) => i.selected),
      guardian: selectedStudent.guardian,
      phone: selectedStudent.phone,
      discount: concessionDiscount,
    };

    setTransactions([newTxn, ...transactions]);
    recordFeePayment(newTxn);
    setActiveReceiptModal(newTxn);
    setPaymentSuccessToast(true);
    setTimeout(() => setPaymentSuccessToast(false), 4000);

    // Update remaining dues
    setSelectedStudent((prev) => ({
      ...prev,
      outstandingDues: Math.max(0, prev.outstandingDues - payableTotal),
      paidThisYear: prev.paidThisYear + payableTotal,
    }));
  };

  // Quick Daily Stats
  const todayTotal = transactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Cashier & Fee Counter Terminal
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30">
                  Accounts Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Record counter cash, cheques & QR receipts with instant official print slips
              </p>
            </div>
          </div>

          {/* Today's Counter Stats */}
          <div className="flex items-center gap-3">
            <div
              className={`p-3 px-4 rounded-2xl border text-right ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Today's Collections
              </div>
              <div className="text-xl font-bold font-mono text-emerald-500">
                NPR {todayTotal.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Search Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Student Search & Rapid Fee Invoicing
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchStudent(e.target.value)}
                placeholder="Search student by Roll # (e.g. 14, 2, 5), Name (e.g. Aarav Sharma), or Student ID..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none border transition-colors ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500'
                }`}
              />
            </div>

            {/* Quick Demo Student Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
              {SAMPLE_STUDENTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSelectedStudent(s);
                    setFeeItems(s.feeItems);
                    setSearchTerm(s.rollNo.toString());
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                    selectedStudent.id === s.id
                      ? 'bg-teal-500 text-white border-teal-600 shadow-xs'
                      : isDark
                      ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Roll #{s.rollNo} • {s.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Cashier Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Selected Student Details & Balance Card */}
        <div className="space-y-6">
          <div
            className={`p-6 rounded-3xl border shadow-sm ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
                {selectedStudent.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate">
                  {selectedStudent.name}
                </h3>
                <p className="text-xs text-teal-500 font-semibold">
                  {selectedStudent.grade} - {selectedStudent.section} • Roll #{selectedStudent.rollNo}
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  ID: {selectedStudent.id}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 text-xs pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Guardian Name:</span>
                <span className="font-semibold">{selectedStudent.guardian}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mobile Phone:</span>
                <span className="font-mono text-teal-400">{selectedStudent.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transport:</span>
                <span className="truncate max-w-[170px] text-right">{selectedStudent.busRoute}</span>
              </div>
            </div>

            {/* Dues Balance Summary */}
            <div
              className={`mt-5 p-4 rounded-2xl border space-y-2 ${
                selectedStudent.outstandingDues > 0
                  ? isDark
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : 'bg-rose-50 border-rose-200'
                  : isDark
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-emerald-50 border-emerald-200'
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Outstanding Balance:</span>
                <span
                  className={`font-mono font-bold text-base ${
                    selectedStudent.outstandingDues > 0 ? 'text-rose-500' : 'text-emerald-500'
                  }`}
                >
                  NPR {selectedStudent.outstandingDues.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Total Cleared This Year:</span>
                <span className="font-mono font-semibold text-emerald-500">
                  NPR {selectedStudent.paidThisYear.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col (2 cols span): Fee Item Selection & Payment Collection */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleProcessCollection}
            className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <h3 className="text-lg font-bold pb-3 border-b border-slate-100 dark:border-slate-800">
              Select Fee Heads for Collection
            </h3>

            {/* Fee Items Checklist */}
            <div className="my-4 space-y-2">
              {feeItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleFeeItem(item.id)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    item.selected
                      ? isDark
                        ? 'bg-teal-950/20 border-teal-500/40 text-white'
                        : 'bg-teal-50/60 border-teal-300 text-slate-900'
                      : isDark
                      ? 'bg-slate-950/40 border-slate-800 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        item.selected
                          ? 'bg-teal-500 text-white'
                          : 'border border-slate-400 dark:border-slate-600'
                      }`}
                    >
                      {item.selected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="font-semibold text-xs sm:text-sm">{item.label}</span>
                  </div>

                  <span className="font-mono font-bold text-xs sm:text-sm">
                    NPR {item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Concession / Discount & Payment Mode Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Scholarship / Discount (NPR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={concessionDiscount}
                  onChange={(e) => setConcessionDiscount(e.target.value)}
                  placeholder="0"
                  className={`w-full rounded-xl border p-2.5 text-xs font-mono outline-none ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className={`w-full rounded-xl border p-2.5 text-xs font-semibold outline-none cursor-pointer ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="cash">Cash Counter Payment</option>
                  <option value="fonepay">Counter Fonepay QR Scan</option>
                  <option value="cheque">Bank Cheque</option>
                  <option value="bank_slip">Bank Deposit Slip</option>
                </select>
              </div>
            </div>

            {/* Cheque details (if cheque selected) */}
            {paymentMode === 'cheque' && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <input
                  type="text"
                  placeholder="Bank Name (e.g. Nabil Bank)"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className={`rounded-xl border p-2 text-xs outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Cheque No (e.g. CHQ-991204)"
                  value={chequeNo}
                  onChange={(e) => setChequeNo(e.target.value)}
                  className={`rounded-xl border p-2 text-xs outline-none font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            )}

            {/* Cashier Collector Name */}
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Cashier Authorized Signature
              </label>
              <input
                type="text"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                className={`w-full rounded-xl border p-2.5 text-xs outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            {/* Total Summary and Submit Action */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400">Total Net Payable:</span>
                <div className="text-2xl font-bold font-mono text-teal-400">
                  NPR {payableTotal.toLocaleString()}
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Receipt className="w-4 h-4" />
                <span>Record Fee & Generate Stamped Receipt</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Transactions Audit Log Table */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">Counter Transactions Ledger</h3>
            <p className="text-xs text-slate-400">Recent official receipts issued at the counter</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr
                className={`border-b text-slate-400 uppercase text-[11px] tracking-wider ${
                  isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <th className="py-3 px-3">Receipt #</th>
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">Class</th>
                <th className="py-3 px-3">Payment Mode</th>
                <th className="py-3 px-3 text-right">Amount (NPR)</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Cashier</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.map((tx) => (
                <tr key={tx.receiptNo} className="hover:bg-slate-500/5 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-teal-400">{tx.receiptNo}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100">
                    {tx.studentName}
                  </td>
                  <td className="py-3 px-3 font-mono">{tx.grade}</td>
                  <td className="py-3 px-3 font-medium">{tx.method}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-500">
                    NPR {tx.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-slate-400">{tx.date}</td>
                  <td className="py-3 px-3 text-slate-400">{tx.cashier}</td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => setActiveReceiptModal(tx)}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-[11px] font-semibold flex items-center gap-1 mx-auto cursor-pointer"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: OFFICIAL STAMPED RECEIPT ================= */}
      {activeReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all relative ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Header */}
            <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="font-serif-brand font-bold text-xl tracking-wider">{branding.name}</h3>
              <p className="text-[11px] text-slate-400">
                Jorpati Oralo, Gokarneshwor-05, Kathmandu • Phone: {footer.phone}
              </p>
              <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-teal-500/10 text-teal-400 font-bold text-xs uppercase tracking-wider border border-teal-500/30">
                Official Fee Collection Receipt
              </div>
            </div>

            {/* Receipt Meta */}
            <div className="my-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Receipt No:</span>
                <span className="font-bold text-teal-400">{activeReceiptModal.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Student Name:</span>
                <span className="font-bold">{activeReceiptModal.studentName} ({activeReceiptModal.grade})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Roll No:</span>
                <span>#{activeReceiptModal.rollNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Mode:</span>
                <span>{activeReceiptModal.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date & Time:</span>
                <span>{activeReceiptModal.date}</span>
              </div>
            </div>

            {/* Amount Box */}
            <div
              className={`p-4 rounded-2xl border my-4 flex items-center justify-between font-mono ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-xs text-slate-400 font-sans font-bold uppercase">Total Amount Received:</span>
              <span className="text-xl font-bold text-emerald-500">
                NPR {activeReceiptModal.amount.toLocaleString()}
              </span>
            </div>

            {/* Stamped Seal & Signature */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              {/* Institutional Ink Stamp Badge */}
              <div className="border-2 border-dashed border-rose-500/50 rounded-xl p-2 text-center text-[10px] text-rose-500 font-bold uppercase tracking-wider rotate-[-3deg]">
                ✓ VERIFIED & RECEIVED<br />
                ACCOUNTS DEPT
              </div>

              <div className="text-right">
                <div className="font-bold text-xs">{activeReceiptModal.cashier}</div>
                <div className="text-[10px] text-slate-400">Authorized Bursar Signature</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setActiveReceiptModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierFeeCollector;

