import React from 'react';
import { Building2, Check, ChevronDown } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const BranchSwitcher = ({ isDark }) => {
  const { branches, currentBranch, switchBranch, lang } = useAuth();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-emerald-500'
            : 'bg-white border-slate-300 text-slate-800 hover:border-emerald-500 shadow-xs'
        }`}
        title="Switch Campus Branch"
      >
        <Building2 className="w-3.5 h-3.5 text-emerald-500" />
        <span className="max-w-[130px] truncate">{currentBranch?.name || 'Main Campus'}</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`absolute left-0 mt-2 w-56 rounded-2xl border shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {lang === 'ne' ? 'क्याम्पस शाखा चयन' : 'Select Institutional Branch'}
            </div>
            {branches.map((b) => {
              const active = b.id === currentBranch?.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    switchBranch(b);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                    active
                      ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20'
                      : isDark
                      ? 'hover:bg-slate-800 text-slate-300'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{b.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{b.code || 'BR-MAIN'}</div>
                  </div>
                  {active && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default BranchSwitcher;
