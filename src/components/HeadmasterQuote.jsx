import React, { useState } from 'react';
import { Quote, Sparkles, UserCheck } from 'lucide-react';
import { useSiteData } from '../context/SiteContext';

const HeadmasterQuote = ({ page = 'home' }) => {
  const { siteData } = useSiteData();
  
  // Extract all quotes or fallback to single headmaster
  const allQuotes = siteData.leadershipQuotes && siteData.leadershipQuotes.length > 0
    ? siteData.leadershipQuotes
    : (siteData.headmaster ? [{ id: 'quote-headmaster', ...siteData.headmaster, targetPage: 'home' }] : []);

  // Filter quotes relevant to current page (or 'both')
  const matchingQuotes = allQuotes.filter(
    (q) => q.targetPage === page || q.targetPage === 'both'
  );

  // Fallback to first available quote if none specifically targeted
  const displayQuotes = matchingQuotes.length > 0 ? matchingQuotes : allQuotes;

  const [activeIndex, setActiveIndex] = useState(0);

  if (displayQuotes.length === 0) return null;

  const currentQuote = displayQuotes[activeIndex] || displayQuotes[0];

  return (
    <section id="quote" className="py-10 sm:py-14 bg-slate-950 text-white relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* If multiple leaders are assigned to this section, show sleek tab pills */}
        {displayQuotes.length > 1 && (
          <div className="flex items-center justify-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
            {displayQuotes.map((q, idx) => (
              <button
                key={q.id || idx}
                onClick={() => setActiveIndex(idx)}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeIndex === idx
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 scale-105'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{q.name}</span>
                <span className="opacity-70 text-[10px]">({q.role})</span>
              </button>
            ))}
          </div>
        )}

        <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-slate-950/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl overflow-hidden transition-all duration-300">
          
          {/* Subtle background quote watermark */}
          <Quote className="absolute -bottom-4 -right-4 w-32 h-32 text-amber-400/[0.04] rotate-180 pointer-events-none" />

          {/* Top Label */}
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-300 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{currentQuote.badge || `${currentQuote.role}'s Message`}</span>
            </div>
            <Quote className="w-6 h-6 text-amber-400/30 rotate-180 hidden sm:block" />
          </div>

          {/* Quote Body - Compact & Readable */}
          <blockquote className="text-base sm:text-lg md:text-xl font-quote italic font-normal text-slate-100 leading-relaxed mb-6">
            {currentQuote.quote}
          </blockquote>

          {/* Author Details - Horizontal Lockup */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3.5">
              {currentQuote.image && (
                <div className="w-12 h-12 rounded-full ring-2 ring-amber-400/40 p-0.5 overflow-hidden bg-slate-800 shrink-0 shadow-md">
                  <img
                    src={currentQuote.image}
                    alt={`${currentQuote.name} — ${currentQuote.role}`}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              )}
              
              <div>
                <h4 className="text-sm sm:text-base font-serif-brand font-bold text-white tracking-wide">
                  {currentQuote.name}
                </h4>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-amber-400 uppercase tracking-wider">
                    {currentQuote.role}
                  </span>
                  {currentQuote.location && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{currentQuote.location}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1 text-[11px] uppercase tracking-widest text-slate-500 font-medium">
              <span>Alchemist Institutional Vision</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeadmasterQuote;
