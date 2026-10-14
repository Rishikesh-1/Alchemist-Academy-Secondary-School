import React from 'react';
import { Quote, Sparkles } from 'lucide-react';
import { useSiteData } from '../context/SiteContext';

const HeadmasterQuote = () => {
  const { siteData } = useSiteData();
  const { headmaster } = siteData;

  return (
    <section id="quote" className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {headmaster.badge || "Leadership Message"}
          </div>
        </div>

        <div className="relative bg-slate-800/50 backdrop-blur-md rounded-3xl p-8 sm:p-14 lg:p-16 border border-slate-700/60 shadow-2xl text-center">
          
          {/* Quote Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-8 shadow-inner">
            <Quote className="w-8 h-8 sm:w-10 sm:h-10 rotate-180" />
          </div>

          {/* Quote Text */}
          <blockquote className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-quote italic font-normal text-slate-100 leading-relaxed max-w-4xl mx-auto mb-10">
            {headmaster.quote}
          </blockquote>

          {/* Author Details */}
          <div className="flex flex-col items-center justify-center">
            {headmaster.image && (
              <div className="w-16 h-16 rounded-full ring-2 ring-amber-400/50 p-1 mb-4 overflow-hidden bg-slate-700">
                <img
                  src={headmaster.image}
                  alt={`${headmaster.name} — ${headmaster.role}`}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            )}
            
            <h4 className="text-xl font-serif-brand font-bold text-white tracking-wide">
              {headmaster.name}
            </h4>
            
            <p className="text-sm font-medium text-amber-400 tracking-widest uppercase mt-1">
              {headmaster.role}
            </p>
            
            <span className="text-xs text-slate-400 mt-0.5">
              {headmaster.location}
            </span>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeadmasterQuote;
