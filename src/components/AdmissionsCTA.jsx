import React, { useState } from 'react';
import { CheckCircle, Sparkles, Phone, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useSiteData } from '../context/SiteContext';
import { sanitizeText, sanitizePhone, getCsrfToken, checkRateLimit } from '../utils/security';
import { submitAdmissionInquiry } from '../services/api';

const AdmissionsCTA = () => {
  const { siteData } = useSiteData();
  const { admissions } = siteData;

  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    parentName: '',
    phone: '',
    grade: 'Grade 1',
    csrfToken: getCsrfToken(),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    // 1. Client-Side Rate Limit check
    if (!checkRateLimit(4, 60000)) {
      setFormError('Too many submissions in a short period. Please wait a moment and try again.');
      return;
    }

    // 2. Sanitize and Validate Inputs
    const cleanName = sanitizeText(formData.parentName);
    const cleanPhone = sanitizePhone(formData.phone);

    if (cleanName.length < 2) {
      setFormError('Please provide a valid parent or guardian name.');
      return;
    }

    if (cleanPhone.length < 7) {
      setFormError('Please enter a valid telephone or mobile number.');
      return;
    }

    // 3. Persist lead directly to MySQL backend
    submitAdmissionInquiry({
      parentName: cleanName,
      phone: cleanPhone,
      childGrade: formData.grade,
      message: 'Submitted via Home Admissions CTA',
    }).catch((err) => console.warn('Inquiry background submit:', err));

    // Input is safe & validated
    setSubmitted(true);
  };

  return (
    <section id="admissions" className="py-20 relative overflow-hidden bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white">
      {/* Subtle background graphics */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-400/20 via-transparent to-black/30 pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-slate-950/40 backdrop-blur-md rounded-3xl p-8 sm:p-12 lg:p-16 border border-white/20 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Heading and Prompt */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              {admissions.badge && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-200 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  {admissions.badge}
                </div>
              )}

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-brand font-bold text-white leading-tight">
                {admissions.title}
              </h2>

              <p className="text-amber-100/90 text-base sm:text-lg max-w-2xl leading-relaxed">
                {admissions.description}
              </p>

              {/* Quick Contact Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-amber-100">
                {admissions.phone && (
                  <a href={`tel:${admissions.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-amber-300" />
                    </div>
                    <span>{admissions.phone}</span>
                  </a>
                )}
                {admissions.phone && admissions.email && (
                  <span className="hidden sm:inline text-amber-400/40">•</span>
                )}
                {admissions.email && (
                  <a href={`mailto:${admissions.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-amber-300" />
                    </div>
                    <span>{admissions.email}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Interactive Quick Inquiry / Enroll Card */}
            <div className="lg:col-span-5">
              <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/50">
                {submitted ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold font-serif-brand text-slate-900">
                      Inquiry Received!
                    </h3>
                    <p className="text-sm text-slate-600">
                      Thank you for your interest in Alchemist Academy. Our admissions office will reach out shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-4 text-xs font-semibold text-amber-600 hover:text-amber-700 underline"
                    >
                      Submit another inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Hidden CSRF Anti-Forgery Token */}
                    <input type="hidden" name="csrf_token" value={formData.csrfToken} />

                    <div className="text-center">
                      <h3 className="text-xl font-bold font-serif-brand text-slate-900">
                        Express Interest
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Get full prospectus and enrollment schedule
                      </p>
                    </div>

                    {formError && (
                      <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-700">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div>
                      <label htmlFor="parent-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Parent / Guardian Name
                      </label>
                      <input
                        id="parent-name"
                        type="text"
                        required
                        maxLength={80}
                        placeholder="e.g. Ramesh Sharma"
                        value={formData.parentName}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-number" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Contact Number
                      </label>
                      <input
                        id="contact-number"
                        type="tel"
                        required
                        maxLength={25}
                        placeholder="e.g. +977 98XXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="applying-grade" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Applying For Grade
                      </label>
                      <select
                        id="applying-grade"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all bg-white"
                      >
                        <option>Nursery / Kindergarten</option>
                        <option>Grade 1 to 3</option>
                        <option>Grade 4 to 7</option>
                        <option>Grade 8 to 10</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 py-3.5 px-6 rounded-full font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <span>{admissions.btnText || "Enroll Now"}</span>
                      <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default AdmissionsCTA;
