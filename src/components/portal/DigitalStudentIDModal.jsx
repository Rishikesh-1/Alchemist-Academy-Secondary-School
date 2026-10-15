import React, { useState } from 'react';
import {
  Printer,
  QrCode,
  ShieldCheck,
  Download,
  RotateCw,
  Sparkles,
  Phone,
  MapPin,
  Check,
} from 'lucide-react';
import { useSiteData } from '../../context/SiteContext';

const DigitalStudentIDModal = ({ student, onClose }) => {
  const { siteData, isDark } = useSiteData();
  const { branding, footer } = siteData;
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div
        className={`w-full max-w-md rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-base">Digital PVC Student ID Badge</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* The Digital PVC ID Card Container */}
        <div className="my-6 perspective-1000 flex justify-center">
          <div
            className={`w-[340px] h-[520px] rounded-3xl border-2 shadow-2xl overflow-hidden relative flex flex-col justify-between transition-all duration-500 ${
              isFlipped
                ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-slate-700 text-slate-100'
                : 'bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 border-amber-400/40 text-white'
            }`}
          >
            {/* Lanyard Hole Clip */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-3 bg-black/30 rounded-full border border-white/20" />

            {!isFlipped ? (
              /* CARD FRONT */
              <div className="p-6 pt-7 flex flex-col justify-between h-full relative z-10">
                {/* Header */}
                <div className="text-center">
                  <div className="font-serif-brand font-bold text-lg tracking-wider uppercase leading-tight drop-shadow-md">
                    {branding.name}
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-amber-100 font-semibold mt-0.5">
                    Government Recognized • Kathmandu, Nepal
                  </p>
                  <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-bold uppercase tracking-widest border border-white/30">
                    Student Identity Card • 2026-2027
                  </div>
                </div>

                {/* Photo & Identity */}
                <div className="text-center my-3">
                  <div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden ring-4 ring-white/80 shadow-2xl relative">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-xl mt-3 drop-shadow-sm">{student.name}</h4>
                  <div className="text-xs font-semibold text-amber-100 mt-0.5">
                    {student.grade} • {student.section}
                  </div>
                  <div className="inline-block mt-1 font-mono text-xs px-2.5 py-0.5 rounded-full bg-black/30 text-amber-200">
                    Roll: #{student.rollNo} • ID: {student.registrationNo}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-[11px] grid grid-cols-2 gap-2 border border-white/20">
                  <div>
                    <span className="text-amber-200/80 block text-[9px] uppercase">Blood Group</span>
                    <strong className="text-white text-xs">{student.bloodGroup}</strong>
                  </div>
                  <div>
                    <span className="text-amber-200/80 block text-[9px] uppercase">Validity</span>
                    <strong className="text-white text-xs">March 2027</strong>
                  </div>
                  <div className="col-span-2 truncate">
                    <span className="text-amber-200/80 block text-[9px] uppercase">Emergency Phone</span>
                    <strong className="text-white text-xs font-mono">{student.guardianPhone}</strong>
                  </div>
                </div>

                {/* Barcode & Hologram footer */}
                <div className="flex items-center justify-between pt-2">
                  <div className="font-mono text-[9px] tracking-widest opacity-80">
                    |||||||| | ||||| |||| ||||||
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-300 via-rose-300 to-indigo-300 flex items-center justify-center opacity-80 shadow-inner">
                    <ShieldCheck className="w-4 h-4 text-slate-900" />
                  </div>
                </div>
              </div>
            ) : (
              /* CARD BACK */
              <div className="p-6 pt-7 flex flex-col justify-between h-full text-xs">
                <div className="text-center border-b border-slate-800 pb-3">
                  <h5 className="font-bold text-sm tracking-wide text-amber-400 uppercase">
                    Institutional Instructions
                  </h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    This card is non-transferable property of {branding.name}.
                  </p>
                </div>

                <div className="space-y-3 text-[11px] text-slate-300 leading-relaxed my-3">
                  <p>1. Must be worn visibly inside school premises and during school transit.</p>
                  <p>2. Required for entry to science labs, computer rooms, and examination halls.</p>
                  <p>3. If found, please return to Jorpati Oralo, Gokarneshwor-05 or call 01-4912267.</p>
                </div>

                {/* QR Code Verification */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <QrCode className="w-12 h-12 text-amber-400 shrink-0" />
                  <div className="text-[10px] text-slate-400">
                    <strong className="text-slate-200 block">Cryptographic Verification:</strong>
                    Scan to verify enrollment authenticity on school domain.
                  </div>
                </div>

                {/* Signature */}
                <div className="pt-3 border-t border-slate-800 text-right">
                  <div className="font-serif-brand text-xs text-amber-400 font-bold">
                    Karmendra Vimal
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase">Headmaster Signature</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Flip & Print Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Flip to {isFlipped ? 'Front' : 'Back'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Badge</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalStudentIDModal;

