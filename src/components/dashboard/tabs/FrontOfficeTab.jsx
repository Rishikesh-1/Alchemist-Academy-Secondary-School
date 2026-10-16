import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  PhoneCall,
  UserPlus,
  Clock,
  CheckCircle2,
  LogOut,
  Calendar,
  Printer,
  Search,
  Plus,
  X,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  fetchFrontOfficeVisitors,
  fetchFrontOfficeCalls,
  addFrontOfficeVisitor,
  checkoutFrontOfficeVisitor,
  logFrontOfficeCall,
} from '../../../services/api';

const FrontOfficeTab = ({ isDark }) => {
  const { lang, currentBranch } = useAuth();
  const [subTab, setSubTab] = useState('visitors'); // 'visitors' | 'calls'

  // Data states
  const [visitors, setVisitors] = useState([]);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);

  // Modals
  const [showAddVisitor, setShowAddVisitor] = useState(false);
  const [showLogCall, setShowLogCall] = useState(false);
  const [printPass, setPrintPass] = useState(null);

  // Form states
  const [visitorForm, setVisitorForm] = useState({
    visitor_name: '',
    phone: '',
    id_card_type: 'Citizenship',
    id_card_number: '',
    purpose: 'Admission inquiry for new session',
    person_to_meet: 'Admissions Counselor',
  });

  const [callForm, setCallForm] = useState({
    caller_name: '',
    phone: '',
    call_type: 'incoming',
    duration_minutes: 5,
    description: '',
    next_follow_up_date: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      if (subTab === 'visitors') {
        const res = await fetchFrontOfficeVisitors();
        if (res.success && res.data?.visitors) {
          setVisitors(res.data.visitors);
        }
      } else {
        const res = await fetchFrontOfficeCalls();
        if (res.success && res.data?.calls) {
          setCalls(res.data.calls);
        }
      }
    } catch (err) {
      console.error('Error loading front office data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [subTab, currentBranch]);

  // Submit Add Visitor
  const handleAddVisitor = async (e) => {
    e.preventDefault();
    if (!visitorForm.visitor_name || !visitorForm.phone) {
      alert('Visitor name and phone are required.');
      return;
    }
    const res = await addFrontOfficeVisitor(visitorForm);
    if (res.success) {
      setStatusMsg({ type: 'success', text: `Visitor pass ${res.data?.pass_no} generated!` });
      setShowAddVisitor(false);
      setVisitorForm({
        visitor_name: '',
        phone: '',
        id_card_type: 'Citizenship',
        id_card_number: '',
        purpose: 'Admission inquiry for new session',
        person_to_meet: 'Admissions Counselor',
      });
      loadData();
      if (res.data?.visitor) {
        setPrintPass(res.data.visitor);
      }
    } else {
      alert(res.message || 'Failed to add visitor.');
    }
  };

  // Check out visitor
  const handleCheckout = async (passNo) => {
    if (!window.confirm(`Check out visitor pass #${passNo}?`)) return;
    const res = await checkoutFrontOfficeVisitor(passNo);
    if (res.success) {
      setStatusMsg({ type: 'success', text: `Visitor checked out successfully.` });
      loadData();
    } else {
      alert(res.message || 'Checkout failed.');
    }
  };

  // Submit Log Call
  const handleLogCall = async (e) => {
    e.preventDefault();
    if (!callForm.caller_name || !callForm.phone) {
      alert('Caller name and phone are required.');
      return;
    }
    const res = await logFrontOfficeCall(callForm);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Call logged successfully.' });
      setShowLogCall(false);
      setCallForm({
        caller_name: '',
        phone: '',
        call_type: 'incoming',
        duration_minutes: 5,
        description: '',
        next_follow_up_date: '',
      });
      loadData();
    } else {
      alert(res.message || 'Failed to log call.');
    }
  };

  // Filtered lists
  const filteredVisitors = visitors.filter(
    (v) =>
      v.visitor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.phone?.includes(searchTerm) ||
      v.pass_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCalls = calls.filter(
    (c) =>
      c.caller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black">
            {lang === 'ne' ? 'फ्रन्ट अफिस तथा आगन्तुक व्यवस्थापन' : 'Front Office & Reception'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'ne'
              ? 'आगन्तुक सुरक्षा पास, फोन कल दर्ता तथा परामर्श अभिलेख'
              : 'Visitor security passes, communication logs, and front-desk reception telemetry'}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          {subTab === 'visitors' ? (
            <button
              type="button"
              onClick={() => setShowAddVisitor(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ne' ? 'नयाँ आगन्तुक दर्ता' : 'Issue Gate Pass'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowLogCall(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ne' ? 'नयाँ फोन कल दर्ता' : 'Log Phone Call'}</span>
            </button>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
          <span>{statusMsg.text}</span>
          <button type="button" onClick={() => setStatusMsg(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Subtab Switcher */}
      <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
        <button
          type="button"
          onClick={() => setSubTab('visitors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'visitors'
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{lang === 'ne' ? 'आगन्तुक सुरक्षा पास' : 'Visitor Gate Passes'}</span>
          <span className="ml-1 px-2 py-0.2 rounded-full text-[10px] bg-emerald-500/30 text-emerald-500 font-bold">
            {visitors.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('calls')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'calls'
              ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>{lang === 'ne' ? 'फोन कल अभिलेख' : 'Phone Call Logs'}</span>
          <span className="ml-1 px-2 py-0.2 rounded-full text-[10px] bg-blue-500/30 text-blue-500 font-bold">
            {calls.length}
          </span>
        </button>

        {/* Search */}
        <div className="ml-auto relative w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'ne' ? 'नाम, फोन वा पास खोज्नुहोस्...' : 'Search records...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
        </div>
      </div>

      {/* Visitors Section */}
      {subTab === 'visitors' && (
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
                  <th className="px-4 py-3">Pass No</th>
                  <th className="px-4 py-3">Visitor Info</th>
                  <th className="px-4 py-3">ID Proof</th>
                  <th className="px-4 py-3">Purpose & Meet</th>
                  <th className="px-4 py-3">In / Out Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
                {filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={`px-4 py-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      No visitor passes found. Click "Issue Gate Pass" to register a visitor.
                    </td>
                  </tr>
                ) : (
                  filteredVisitors.map((v) => {
                    const isCheckedIn = v.status === 'checked_in';
                    return (
                      <tr
                        key={v.id}
                        className={`transition-colors ${
                          isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span className={`font-mono font-bold px-2 py-0.5 rounded-md border ${
                            isDark ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-emerald-700 bg-emerald-50 border-emerald-300'
                          }`}>
                            {v.pass_no}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{v.visitor_name}</div>
                          <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{v.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={isDark ? 'text-slate-300' : 'text-slate-700'}>{v.id_card_type}</div>
                          <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{v.id_card_number || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{v.purpose}</div>
                          <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Meeting: {v.person_to_meet}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`flex items-center gap-1 text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <Clock className="w-3 h-3 text-emerald-500" />
                            <span>In: {new Date(v.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {v.check_out_time && (
                            <div className={`flex items-center gap-1 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              <LogOut className="w-3 h-3 text-rose-500" />
                              <span>Out: {new Date(v.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isCheckedIn
                                ? isDark
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                  : 'bg-amber-50 text-amber-700 border border-amber-300'
                                : isDark
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            }`}
                          >
                            {isCheckedIn ? 'ON CAMPUS' : 'CHECKED OUT'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPrintPass(v)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                              }`}
                              title="Print Visitor Pass"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            {isCheckedIn && (
                              <button
                                type="button"
                                onClick={() => handleCheckout(v.pass_no)}
                                className={`px-2.5 py-1 rounded-lg border font-semibold text-[11px] transition-colors cursor-pointer ${
                                  isDark ? 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/40 text-rose-300' : 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-700'
                                }`}
                              >
                                Check Out
                              </button>
                            )}
                          </div>
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

      {/* Calls Section */}
      {subTab === 'calls' && (
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
                  <th className="px-4 py-3">Caller Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Call Date</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Call Summary</th>
                  <th className="px-4 py-3">Next Follow-up</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
                {filteredCalls.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={`px-4 py-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      No call records logged yet. Click "Log Phone Call" to create an inquiry entry.
                    </td>
                  </tr>
                ) : (
                  filteredCalls.map((c) => (
                    <tr
                      key={c.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className={`px-4 py-3 font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{c.caller_name}</td>
                      <td className={`px-4 py-3 font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{c.phone}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            c.call_type === 'incoming'
                              ? isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-700 border border-blue-200'
                              : isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {c.call_type}
                        </span>
                      </td>
                      <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{c.call_date}</td>
                      <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{c.duration_minutes} mins</td>
                      <td className={`px-4 py-3 max-w-xs truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`} title={c.description}>
                        {c.description || 'General Inquiry'}
                      </td>
                      <td className="px-4 py-3">
                        {c.next_follow_up_date ? (
                          <span className={`font-semibold px-2 py-0.5 rounded-md border ${
                            isDark ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-amber-700 bg-amber-50 border-amber-300'
                          }`}>
                            {c.next_follow_up_date}
                          </span>
                        ) : (
                          <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Issue Visitor Pass */}
      {showAddVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Issue Campus Visitor Gate Pass</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddVisitor(false)}
                className={`cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVisitor} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Visitor Full Name *</label>
                  <input
                    type="text"
                    required
                    value={visitorForm.visitor_name}
                    onChange={(e) => setVisitorForm({ ...visitorForm, visitor_name: e.target.value })}
                    placeholder="e.g. Ramesh Poudel"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={visitorForm.phone}
                    onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })}
                    placeholder="e.g. 9841000000"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>ID Card Type</label>
                  <select
                    value={visitorForm.id_card_type}
                    onChange={(e) => setVisitorForm({ ...visitorForm, id_card_type: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Citizenship">Citizenship (नागरिकता)</option>
                    <option value="National ID">National ID (राष्ट्रिय परिचयपत्र)</option>
                    <option value="Driving License">Driving License (सवारी चालक अनुमति)</option>
                    <option value="Passport">Passport</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>ID Card Number</label>
                  <input
                    type="text"
                    value={visitorForm.id_card_number}
                    onChange={(e) => setVisitorForm({ ...visitorForm, id_card_number: e.target.value })}
                    placeholder="e.g. 27-01-72-9102"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Person To Meet</label>
                <input
                  type="text"
                  value={visitorForm.person_to_meet}
                  onChange={(e) => setVisitorForm({ ...visitorForm, person_to_meet: e.target.value })}
                  placeholder="e.g. Principal / Admissions Officer"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Purpose of Visit</label>
                <textarea
                  rows="2"
                  value={visitorForm.purpose}
                  onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setShowAddVisitor(false)}
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
                  Generate Pass & Check In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Phone Call */}
      {showLogCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-blue-500" />
                <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Log Front Office Phone Call</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowLogCall(false)}
                className={`cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogCall} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Caller Name *</label>
                  <input
                    type="text"
                    required
                    value={callForm.caller_name}
                    onChange={(e) => setCallForm({ ...callForm, caller_name: e.target.value })}
                    placeholder="e.g. Maya Tamang"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={callForm.phone}
                    onChange={(e) => setCallForm({ ...callForm, phone: e.target.value })}
                    placeholder="e.g. 9851000000"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Call Type</label>
                  <select
                    value={callForm.call_type}
                    onChange={(e) => setCallForm({ ...callForm, call_type: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="incoming">Incoming (आगमन)</option>
                    <option value="outgoing">Outgoing (प्रस्थान)</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={callForm.duration_minutes}
                    onChange={(e) => setCallForm({ ...callForm, duration_minutes: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Call Description / Inquiry</label>
                <textarea
                  rows="2"
                  value={callForm.description}
                  onChange={(e) => setCallForm({ ...callForm, description: e.target.value })}
                  placeholder="Details of inquiry or discussion..."
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Next Follow-Up Date (Optional)</label>
                <input
                  type="date"
                  value={callForm.next_follow_up_date}
                  onChange={(e) => setCallForm({ ...callForm, next_follow_up_date: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setShowLogCall(false)}
                  className={`px-4 py-2 rounded-xl border cursor-pointer ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  Save Call Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Visitor Gate Pass Badge */}
      {printPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white text-slate-900 p-6 space-y-4 shadow-2xl border-4 border-emerald-500 animate-in zoom-in-95">
            <div className="text-center border-b pb-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                CAMPUS SECURITY GATE PASS
              </div>
              <h3 className="text-lg font-black mt-0.5">ALCHEMIST ACADEMY</h3>
              <div className="text-[10px] text-slate-500">Kathmandu, Nepal • Entry Verification</div>
            </div>

            <div className="text-center py-2 bg-emerald-50 rounded-2xl border border-emerald-200">
              <div className="text-[10px] uppercase font-bold text-slate-400">Gate Pass Number</div>
              <div className="text-xl font-mono font-black text-emerald-600 tracking-wider">
                {printPass.pass_no}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500 font-semibold">Visitor:</span>
                <span className="font-bold">{printPass.visitor_name}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500 font-semibold">Phone:</span>
                <span className="font-mono">{printPass.phone}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500 font-semibold">Meeting:</span>
                <span className="font-bold">{printPass.person_to_meet}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500 font-semibold">Purpose:</span>
                <span className="text-right max-w-[180px] truncate">{printPass.purpose}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500 font-semibold">Check-in:</span>
                <span>{new Date(printPass.check_in_time || Date.now()).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pass</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintPass(null)}
                className="py-2 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrontOfficeTab;

