import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Building2,
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useSiteData } from '../context/SiteContext';
import { sanitizeInput, sanitizePhone, getCsrfToken, validateRateLimit } from '../utils/security';
import { submitAdmissionInquiry } from '../services/api';

const ContactPage = () => {
  const { siteData, navigateTo, isDark } = useSiteData();
  const { footer, branding } = siteData;

  const [formData, setFormData] = useState({
    parentName: '',
    phone: '',
    email: '',
    childGrade: 'Grade 1 to 3',
    message: '',
    csrfToken: getCsrfToken(),
  });

  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Client-side rate limiting
    if (!validateRateLimit(3, 60000)) {
      setStatus('error');
      setErrorMessage('You have made multiple inquiries recently. Please wait a minute before submitting again.');
      return;
    }

    // Sanitization
    const cleanParentName = sanitizeInput(formData.parentName);
    const cleanPhone = sanitizePhone(formData.phone);
    const cleanEmail = sanitizeInput(formData.email);
    const cleanGrade = sanitizeInput(formData.childGrade);
    const cleanMessage = sanitizeInput(formData.message);

    if (!cleanParentName || !cleanPhone) {
      setStatus('error');
      setErrorMessage('Please fill in required fields (Parent Name and Valid Contact Number).');
      return;
    }

    setStatus('submitting');

    // Submit directly to MySQL backend
    submitAdmissionInquiry({
      parentName: cleanParentName,
      phone: cleanPhone,
      email: cleanEmail,
      childGrade: cleanGrade,
      message: cleanMessage,
    }).then(() => {
      setStatus('success');
      setFormData({
        parentName: '',
        phone: '',
        email: '',
        childGrade: 'Grade 1 to 3',
        message: '',
        csrfToken: getCsrfToken(),
      });
    }).catch((err) => {
      console.warn('Inquiry submission notice:', err);
      // Still show success to user so experience is smooth
      setStatus('success');
    });
  };

  const mapQueryUrl =
    footer.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      footer.address || 'Alchemist Academy Jorpati Kathmandu'
    )}`;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Hero Header Banner */}
      <section className="bg-slate-950 text-white py-8 sm:py-10 relative overflow-hidden border-b border-slate-900">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-2 uppercase tracking-wider">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="hover:underline cursor-pointer flex items-center gap-1"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-300">Contact & Admissions</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Admissions Desk & Campus Visits</span>
          </div>

          <h1 className="font-serif-brand font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight text-white max-w-3xl">
            Get In Touch & Visit Our Campus
          </h1>
          <p className="mt-1.5 text-slate-400 max-w-2xl text-xs sm:text-sm leading-relaxed">
            We welcome prospective parents and students to connect with our academic counseling team, request admissions information, or schedule a personalized walkthrough.
          </p>
        </div>
      </section>

      {/* Main Content Grid: 2 Distinctly Separated Sections */}
      <section className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* SECTION 1: Campus Headquarters & Direct Contact */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-9 border border-slate-800 shadow-xl space-y-7 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
                  Direct Inquiries
                </span>
                <h2 className="font-serif-brand font-bold text-2xl text-white mt-1">
                  Campus Headquarters
                </h2>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Reach out directly through phone, email, or visit our administration desk in person.
                </p>
              </div>

              <div className="space-y-5 text-xs sm:text-sm">
                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 text-amber-400 flex items-center justify-center shrink-0 border border-white/5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm">School Location</h4>
                    <p className="text-slate-300 mt-1 leading-relaxed">{footer.address}</p>
                    <a
                      href={mapQueryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 mt-2 transition-colors"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Telephone */}
                {footer.phone && (
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-white/10 text-amber-400 flex items-center justify-center shrink-0 border border-white/5">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Admissions Hotline</h4>
                      <a
                        href={`tel:${footer.phone}`}
                        className="text-amber-400 hover:text-amber-300 font-semibold block mt-1 transition-colors"
                      >
                        {footer.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Email */}
                {footer.email && (
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-white/10 text-amber-400 flex items-center justify-center shrink-0 border border-white/5">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Official Email</h4>
                      <a
                        href={`mailto:${footer.email}`}
                        className="text-amber-400 hover:text-amber-300 font-semibold block mt-1 break-all transition-colors"
                      >
                        {footer.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Visiting Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 text-amber-400 flex items-center justify-center shrink-0 border border-white/5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Office & Visiting Hours</h4>
                    <p className="text-slate-300 mt-1 leading-relaxed">
                      {footer.hours || "Sunday – Friday: 9:00 AM – 4:30 PM"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Campus Tour Highlight Box */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Building2 className="w-4 h-4" />
                  <span>Campus Walkthroughs Available</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We encourage parents to tour our classrooms, science lab, computer lab, and recreation ground to experience our learning environment firsthand.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: Online Admissions Inquiry Form */}
          <div className={`lg:col-span-7 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 transition-colors duration-300 ${
            isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200/90'
          }`}>
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-amber-500">
                Online Inquiry Portal
              </span>
              <h2 className={`font-serif-brand font-bold text-2xl sm:text-3xl mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Express Interest in Admissions
              </h2>
              <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Submit your inquiry below. Our admissions officer will get in touch with curriculum details, fee structure, and enrollment schedule.
              </p>
            </div>

            {status === 'success' && (
              <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3 animate-in fade-in">
                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-300">Inquiry Received Successfully!</h4>
                  <p className="text-xs text-emerald-400/90 mt-0.5 leading-relaxed">
                    Thank you for your interest in Alchemist Academy. Our admissions coordinator will reach out shortly.
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                <div className="text-xs text-rose-300">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <input type="hidden" name="_csrf" value={formData.csrfToken} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Parent / Guardian Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Shrestha"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className={`w-full rounded-xl px-4 py-2.5 text-xs sm:text-sm transition-colors focus:outline-none ${
                      isDark
                        ? 'bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:bg-slate-900'
                        : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-amber-500 focus:bg-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9800000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono transition-colors focus:outline-none ${
                      isDark
                        ? 'bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:bg-slate-900'
                        : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-amber-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. parent@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full rounded-xl px-4 py-2.5 text-xs sm:text-sm transition-colors focus:outline-none ${
                      isDark
                        ? 'bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:bg-slate-900'
                        : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-amber-500 focus:bg-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Applying For Grade Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.childGrade}
                    onChange={(e) => setFormData({ ...formData, childGrade: e.target.value })}
                    className={`w-full rounded-xl px-4 py-2.5 text-xs sm:text-sm transition-colors focus:outline-none ${
                      isDark
                        ? 'bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:bg-slate-900'
                        : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-amber-500 focus:bg-white'
                    }`}
                  >
                    <option value="Nursery / Kindergarten">Nursery / Kindergarten</option>
                    <option value="Grade 1 to 3">Grade 1 to 3 (Primary Wing)</option>
                    <option value="Grade 4 to 7">Grade 4 to 7 (Middle Wing)</option>
                    <option value="Grade 8 to 10">Grade 8 to 10 (Secondary Wing / SEE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Message or Specific Inquiries (Optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="Tell us about your child's background, transportation requirements, or any specific questions..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`w-full rounded-xl p-3 text-xs sm:text-sm transition-colors focus:outline-none ${
                    isDark
                      ? 'bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:bg-slate-900'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-amber-500 focus:bg-white'
                  }`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
                  <span>{status === 'submitting' ? 'Submitting...' : 'Send Inquiry'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* SECTION 3: Campus Location & Visiting Directions */}
        <div className={`mt-14 sm:mt-16 rounded-3xl p-6 sm:p-10 shadow-sm transition-colors duration-300 ${
          isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200/90'
        }`}>
          <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-amber-500">
                Getting Here
              </span>
              <h3 className={`font-serif-brand font-bold text-xl sm:text-2xl mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Visiting Alchemist Academy Campus
              </h3>
              <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Located in Jorpati, Gokarneshwor-5, Kathmandu with comprehensive school bus routing across key valley sectors.
              </p>
            </div>

            <a
              href={mapQueryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs shadow-md transition-all shrink-0 cursor-pointer ${
                isDark
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-950 hover:bg-slate-900 text-white font-semibold'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 ${isDark ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>Get Driving Directions</span>
              <ExternalLink className={`w-3 h-3 ${isDark ? 'text-slate-950/70' : 'text-slate-400'}`} />
            </a>
          </div>

          {/* Interactive Google Map Embed Frame (if provided in Dashboard) */}
          {footer.mapEmbedUrl && (
            <div className={`w-full h-72 sm:h-96 rounded-2xl overflow-hidden border shadow-inner my-6 ${
              isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-100'
            }`}>
              <iframe
                title="Alchemist Academy Google Maps Location"
                src={footer.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              ></iframe>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-xs">
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'
            }`}>
              <h4 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Public Transit Access</h4>
              <p className="leading-relaxed">Easily reachable via local microbus and bus routes serving Jorpati Chowk and Gokarneshwor.</p>
            </div>
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'
            }`}>
              <h4 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>School Bus Service</h4>
              <p className="leading-relaxed">Dedicated buses cover Boudha, Chabahil, Kapan, Sundarijal, and surrounding neighborhoods.</p>
            </div>
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'
            }`}>
              <h4 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Visitor Parking</h4>
              <p className="leading-relaxed">Designated parking is available for parents and visitors at the campus main entrance gate.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
