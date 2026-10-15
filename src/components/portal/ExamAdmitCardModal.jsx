import React from 'react';
import {
  Printer,
  QrCode,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Clock,
  Award,
} from 'lucide-react';
import { useSiteData } from '../../context/SiteContext';

const ExamAdmitCardModal = ({ student, reportCard, onClose }) => {
  const { siteData, isDark } = useSiteData();
  const { branding, footer } = siteData;

  const examRoutines = [
    { date: 'Oct 26, 2026', time: '10:00 - 01:00 PM', subject: 'Compulsory Mathematics', room: 'Hall 302 (Seat #14)' },
    { date: 'Oct 28, 2026', time: '10:00 - 01:00 PM', subject: 'Science & Technology', room: 'Hall 302 (Seat #14)' },
    { date: 'Oct 30, 2026', time: '10:00 - 01:00 PM', subject: 'English Literature', room: 'Hall 302 (Seat #14)' },
    { date: 'Nov 02, 2026', time: '10:00 - 01:00 PM', subject: 'Nepali Language', room: 'Hall 302 (Seat #14)' },
    { date: 'Nov 04, 2026', time: '10:00 - 01:00 PM', subject: 'Social Studies & Values', room: 'Hall 302 (Seat #14)' },
    { date: 'Nov 06, 2026', time: '10:00 - 12:30 PM', subject: 'Computer Science', room: 'IT Lab 2 (Terminal #08)' },
    { date: 'Nov 08, 2026', time: '10:00 - 01:00 PM', subject: 'Optional Mathematics', room: 'Hall 302 (Seat #14)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-lg">Official Examination Admit Card</h3>
            <p className="text-xs text-slate-400">Terminal Examination 2026 • Verified Hall Ticket</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Printable Ticket Body */}
        <div className="my-6 p-6 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/70 space-y-5">
          {/* Institution Header */}
          <div className="text-center border-b border-slate-300 dark:border-slate-700 pb-4">
            <h2 className="font-serif-brand font-bold text-xl tracking-wider text-slate-900 dark:text-white uppercase">
              {branding.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Jorpati Oralo, Gokarneshwor-05, Kathmandu, Nepal • Phone: {footer.phone}
            </p>
            <div className="inline-block mt-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 font-bold text-xs uppercase tracking-wider border border-amber-500/30">
              Examination Admit Card & Entry Permit
            </div>
          </div>

          {/* Student Info & Photo Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs flex-1">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Candidate Name</span>
                <strong className="text-sm text-slate-800 dark:text-slate-100">{student.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Exam Roll Number</span>
                <strong className="text-sm font-mono text-amber-500">#{student.rollNo}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Class & Section</span>
                <strong className="text-xs text-slate-700 dark:text-slate-300">{student.grade} - {student.section}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Registration ID</span>
                <strong className="text-xs font-mono text-slate-700 dark:text-slate-300">{student.registrationNo}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Allocated Hall</span>
                <strong className="text-xs text-slate-700 dark:text-slate-300">Hall 302 (Seat #14)</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Dues Clearance</span>
                <strong className="text-xs text-emerald-500 font-bold">Cleared (Eligible) ✓</strong>
              </div>
            </div>

            <div className="w-24 h-28 rounded-xl overflow-hidden ring-2 ring-slate-400 shrink-0 shadow-md">
              <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Examination Subject Schedule */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
              Examination Schedule & Seating Routine
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    <th className="p-2">Date</th>
                    <th className="p-2">Time</th>
                    <th className="p-2">Subject</th>
                    <th className="p-2">Room / Seat</th>
                    <th className="p-2 text-center">Invigilator Sign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {examRoutines.map((routine, idx) => (
                    <tr key={idx} className="hover:bg-slate-500/5">
                      <td className="p-2 font-mono text-slate-700 dark:text-slate-300">{routine.date}</td>
                      <td className="p-2 font-mono text-slate-500">{routine.time}</td>
                      <td className="p-2 font-semibold text-slate-800 dark:text-slate-100">{routine.subject}</td>
                      <td className="p-2 text-slate-600 dark:text-slate-400">{routine.room}</td>
                      <td className="p-2 text-center border-l border-slate-200 dark:border-slate-800 opacity-30">
                        _________
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Exam Rules & Seal */}
          <div className="pt-4 border-t border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="text-[10px] text-slate-500 leading-relaxed max-w-sm">
              * Candidates must be seated 15 minutes before commencement.<br />
              * Electronic devices, calculators (unless permitted), and unauthorized papers are prohibited.
            </div>

            <div className="flex items-center gap-4">
              <QrCode className="w-12 h-12 text-slate-700 dark:text-slate-300" />
              <div className="text-right">
                <div className="font-serif-brand font-bold text-xs text-amber-500">
                  Karmendra Vimal
                </div>
                <div className="text-[9px] uppercase text-slate-400">Controller of Examinations</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Admit Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamAdmitCardModal;

