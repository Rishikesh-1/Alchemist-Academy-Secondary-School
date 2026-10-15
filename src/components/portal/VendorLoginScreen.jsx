import React, { useState } from 'react';
import { Crown, ShieldCheck, Lock, Eye, EyeOff, AlertTriangle, ArrowLeft, KeyRound } from 'lucide-react';
import { useSiteData } from '../../context/SiteContext';

const VendorLoginScreen = ({ onLoginSuccess }) => {
  const { navigateTo } = useSiteData();

  const [passkey, setPasskey] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPass = passkey.trim();
    if (!cleanPass) {
      setErrorMessage('Please enter the Master Vendor Authentication Passkey.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      // Exclusively Rishi Kesh Rana's Master Passkeys
      const validPasskeys = [
        'Rishi@2026',
        'rishi2026',
        'rjrana2026',
      ];

      if (validPasskeys.includes(cleanPass)) {
        sessionStorage.setItem(
          '_aa_vendor_auth_session',
          JSON.stringify({
            authenticated: true,
            tier: 'Software Owner & Architect (Rishi Kesh Rana)',
            timestamp: Date.now(),
          })
        );
        setSubmitting(false);
        onLoginSuccess();
      } else {
        setSubmitting(false);
        setErrorMessage('Access Denied. Invalid Master Vendor Token. This console is strictly reserved for Rishi Kesh Rana.');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Back to public site button */}
      <button
        type="button"
        onClick={() => navigateTo('home')}
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to School Website</span>
      </button>

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        {/* Security Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Crown className="w-8 h-8 text-amber-400" />
        </div>

        <div className="text-center mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30">
            Multi-School Cloud SaaS Core
          </span>
          <h1 className="text-2xl font-bold font-serif-brand text-white mt-2">
            Vendor SaaS Console
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Reserved exclusively for Software Architect <strong className="text-slate-200">Rishi Kesh Rana</strong>. Customer school fleets, license tokens & subscription billing control.
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Master Developer Passkey
            </label>
            <div className="relative">
              <input
                type={showPasskey ? 'text' : 'password'}
                required
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter master passkey"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all pr-11 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPasskey(!showPasskey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                tabIndex={-1}
              >
                {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {submitting ? (
              <span>Verifying Root Architect Token...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Unlock SaaS Infrastructure</span>
              </>
            )}
          </button>
        </form>

        {/* Developer Helper Box */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Rishi's Master Passkey:</span>
              <button
                type="button"
                onClick={() => setPasskey('Rishi@2026')}
                className="text-[11px] font-bold text-purple-400 underline hover:text-purple-300 cursor-pointer"
              >
                [Auto-Fill Key]
              </button>
            </div>
            <div className="text-[11px] text-slate-400 font-mono text-left">
              Passkey: <span className="text-purple-400 font-bold">Rishi@2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorLoginScreen;
