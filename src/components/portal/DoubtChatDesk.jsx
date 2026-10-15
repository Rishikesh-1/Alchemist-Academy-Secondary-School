import React, { useState } from 'react';
import {
  Send,
  MessageSquare,
  Sparkles,
  User,
  CheckCheck,
  Bot,
  HelpCircle,
} from 'lucide-react';
import { useSchoolData } from '../../context/SchoolDataContext';

const DoubtChatDesk = () => {
  const { schoolData, sendDoubtMessage } = useSchoolData();
  const { doubtsMessages, student, teacher } = schoolData;
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userQuestion = inputText.trim();
    sendDoubtMessage('student', userQuestion);
    setInputText('');

    // Teacher simulated intelligent pedagogical reply after 1.5 seconds
    setTimeout(() => {
      let replyText =
        'Dear Aarav, excellent question. Review Section 4 of your textbook worksheet and ensure your step proof clarifies the boundary cases. Feel free to bring your rough register to Faculty Room 104 during 3rd period office hours tomorrow.';

      if (userQuestion.toLowerCase().includes('exam') || userQuestion.toLowerCase().includes('syllabus')) {
        replyText =
          'Regarding the examination syllabus: Units 1 to 8 are included. Focus especially on Trigonometry Heights & Distances and Coordinate Geometry transformations.';
      } else if (userQuestion.toLowerCase().includes('homework') || userQuestion.toLowerCase().includes('due')) {
        replyText =
          'Homework submissions are due by 5:00 PM tomorrow. Please ensure your ray diagrams and calculation steps are neat and legible.';
      }

      sendDoubtMessage('teacher', replyText);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                1-on-1 Academic Doubts Desk
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                Teacher Online
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct consultation channel with Class Guide <strong>RJ Rana</strong>
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 sm:text-right">
          Office Hours: <strong className="text-amber-500">11:00 AM – 11:45 AM</strong> (Period 3)
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col h-[520px]">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {doubtsMessages.map((msg) => {
            const isStudent = msg.sender === 'student';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {msg.senderName}
                  </span>
                  <span>•</span>
                  <span>{msg.time}</span>
                </div>

                <div
                  className={`p-4 rounded-2xl max-w-lg text-xs leading-relaxed shadow-xs ${
                    isStudent
                      ? 'bg-amber-500 text-white rounded-tr-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-xs'
                  }`}
                >
                  {msg.text}
                </div>

                {isStudent && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 mr-1">
                    <CheckCheck className="w-3 h-3 text-blue-400" />
                    <span>Delivered</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your question or doubt for RJ Sir (e.g. Unit test syllabus, formula derivation)..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
          />

          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask Sir</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoubtChatDesk;

