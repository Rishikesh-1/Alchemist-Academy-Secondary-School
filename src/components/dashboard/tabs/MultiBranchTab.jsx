import React, { useState } from 'react';
import {
  Building2,
  Users,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Plus,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useSchoolData } from '../../../context/SchoolDataContext';

const MultiBranchTab = ({ isDark }) => {
  const { branches, currentBranch, switchBranch, lang } = useAuth();
  const { schoolData } = useSchoolData();

  const [showAddModal, setShowAddModal] = useState(false);

  // Mock cross-branch comparative telemetry
  const branchMetrics = [
    {
      id: 1,
      name: 'Main Campus (Kathmandu)',
      code: 'BR-MAIN',
      address: 'Alchemist Way, Chabahil, Kathmandu',
      phone: '+977-1-4481920',
      email: 'kathmandu@alchemist.edu.np',
      lead: 'Dr. Saroj Karki (Principal)',
      students: 98,
      teachers: 28,
      feeCollectionRate: '94%',
      avgAttendance: '96.2%',
      isPrimary: true,
    },
    {
      id: 2,
      name: 'Bouddha Junior Campus',
      code: 'BR-BOUDDHA',
      address: 'Tusal Road, Bouddha, Kathmandu',
      phone: '+977-1-4478120',
      email: 'bouddha@alchemist.edu.np',
      lead: 'Mrs. Sunita Thapa (Branch Head)',
      students: 30,
      teachers: 10,
      feeCollectionRate: '89%',
      avgAttendance: '93.5%',
      isPrimary: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {lang === 'ne' ? 'बहु-शाखा तथा क्याम्पस व्यवस्थापन' : 'Multi-Branch & Campus Hub'}
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'ne'
              ? 'केन्द्रीय व्यवस्थापन, क्याम्पस कार्यसम्पादन तुलना तथा शाखा स्तरिय नियन्त्रण'
              : 'Cross-campus administration, synchronized multi-branch reporting, and workspace switching'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'ne' ? 'नयाँ क्याम्पस शाखा थप्नुहोस्' : 'Register New Campus'}</span>
        </button>
      </div>

      {/* Active Workspace Banner */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
          isDark ? 'bg-slate-950 border-emerald-500/30 text-white' : 'bg-emerald-50/70 border-emerald-300 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Active Management Workspace
            </div>
            <div className="text-sm font-black">{currentBranch?.name || 'Main Campus (Kathmandu)'}</div>
          </div>
        </div>
        <div className="text-right text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
            SYNCED & ISOLATED
          </span>
        </div>
      </div>

      {/* Campus Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {branchMetrics.map((b) => {
          const isActive = b.id === currentBranch?.id;
          return (
            <div
              key={b.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                isActive
                  ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30'
                  : isDark ? 'border-slate-800 hover:border-slate-700' : 'border-slate-200 hover:border-slate-300 shadow-sm'
              } ${isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900 shadow-xs'}`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{b.name}</h3>
                      {b.isPrimary && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold">
                          HQ
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{b.code}</span>
                  </div>

                  {isActive ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => switchBranch({ id: b.id, name: b.name, code: b.code })}
                      className={`px-3 py-1 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                        isDark ? 'border-slate-700 hover:border-emerald-500 text-slate-300' : 'border-slate-300 hover:border-emerald-500 text-slate-700 bg-slate-50'
                      }`}
                    >
                      Switch To
                    </button>
                  )}
                </div>

                <div className={`space-y-1.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
                    <span>{b.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
                    <span className="font-mono">{b.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
                    <span>{b.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                    <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{b.lead}</span>
                  </div>
                </div>

                {/* Micro Stats */}
                <div className={`grid grid-cols-4 gap-2 pt-3 border-t text-center ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                    <div className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Students</div>
                    <div className={`text-sm font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{b.students}</div>
                  </div>
                  <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                    <div className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Faculty</div>
                    <div className={`text-sm font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{b.teachers}</div>
                  </div>
                  <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                    <div className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fee Recv</div>
                    <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">{b.feeCollectionRate}</div>
                  </div>
                  <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                    <div className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Att. Rate</div>
                    <div className="text-sm font-black text-blue-600 dark:text-blue-400">{b.avgAttendance}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Branch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h2 className="text-base font-bold">Register New Campus Branch</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Expand institution multi-tenant branch cluster</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('New campus branch registration logged with database cluster.');
                setShowAddModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Campus Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lalitpur Science Wing"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Branch Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="BR-LALITPUR"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none uppercase ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="01-5522334"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Physical Address</label>
                <input
                  type="text"
                  placeholder="Jawalakhel, Lalitpur, Nepal"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiBranchTab;

