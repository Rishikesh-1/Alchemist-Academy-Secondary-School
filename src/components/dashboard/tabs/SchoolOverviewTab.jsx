import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Calendar,
  CreditCard,
  Video,
  Bell,
  Building2,
  TrendingUp,
  ShieldCheck,
  Clock,
  ArrowRight,
  PlusCircle,
  FileText,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useSchoolData } from '../../../context/SchoolDataContext';
import { formatDualDate } from '../../../utils/nepaliCalendar';
import { fetchFinancialOverview, fetchHrData, fetchCommunicationNotices } from '../../../services/api';

const SchoolOverviewTab = ({ isDark, onNavigateTab }) => {
  const { currentUser, currentBranch, lang } = useAuth();
  const { schoolData } = useSchoolData();
  const { classRoster = [] } = schoolData || {};

  const [financeSummary, setFinanceSummary] = useState(null);
  const [hrSummary, setHrSummary] = useState(null);
  const [urgentNotices, setUrgentNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const totalStudents = classRoster.reduce((acc, c) => acc + (c.students?.length || 0), 0) || 128;

  useEffect(() => {
    let isMounted = true;
    async function loadOverview() {
      try {
        const [finRes, hrRes, commRes] = await Promise.allSettled([
          fetchFinancialOverview(),
          fetchHrData(),
          fetchCommunicationNotices(),
        ]);

        if (isMounted) {
          if (finRes.status === 'fulfilled' && finRes.value?.success) {
            setFinanceSummary(finRes.value.data?.summary);
          }
          if (hrRes.status === 'fulfilled' && hrRes.value?.success) {
            setHrSummary(hrRes.value.data?.summary);
          }
          if (commRes.status === 'fulfilled' && commRes.value?.success) {
            const list = commRes.value.data?.notices || [];
            setUrgentNotices(list.filter((n) => n.priority === 'urgent' || n.priority === 'high').slice(0, 3));
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    }
    loadOverview();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalCollected = financeSummary?.total_income_collected || 1850000;
  const staffPresent = hrSummary?.present || 32;
  const totalStaff = hrSummary?.total_staff || 38;
  const staffAttRate = totalStaff > 0 ? Math.round((staffPresent / totalStaff) * 100) : 92;

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div
        className={`p-6 rounded-3xl border relative overflow-hidden transition-all shadow-sm ${
          isDark
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-500/30'
            : 'bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-white border-emerald-200'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                {lang === 'ne' ? 'कार्यकारी ड्यासबोर्ड' : 'Executive Overview'}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {currentBranch?.name || 'Main Campus'} • {formatDualDate(new Date())}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {lang === 'ne' ? 'नमस्ते' : 'Welcome'}, {currentUser?.name || 'Administrator'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              {lang === 'ne'
                ? 'सम्पूर्ण क्याम्पस, विद्यार्थी, संकाय तथा आर्थिक स्थितिको प्रत्यक्ष अवलोकन।'
                : 'Real-time telemetry and management controls for campus operations, academic schedules, and fiscal flows.'}
            </p>
          </div>

          {/* Dual Date Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2.5 rounded-2xl border text-right ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="text-[10px] font-bold uppercase text-slate-400">
                {lang === 'ne' ? 'नेपाली मिति' : 'Bikram Sambat (BS)'}
              </div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatDualDate(new Date())}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Enrolled Students */}
        <div
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
            isDark ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
          onClick={() => onNavigateTab && onNavigateTab('student-info')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {lang === 'ne' ? 'कुल विद्यार्थी' : 'Active Students'}
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black">{totalStudents}</span>
            <span className="text-xs font-semibold text-emerald-500">
              {lang === 'ne' ? '१००% सक्रिय' : '100% active'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {classRoster.length} {lang === 'ne' ? 'कक्षा समूहहरू' : 'academic cohorts'}
          </div>
        </div>

        {/* KPI 2: Staff Duty Attendance */}
        <div
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
            isDark ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
          onClick={() => onNavigateTab && onNavigateTab('attendance')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {lang === 'ne' ? 'कर्मचारी हाजिरी' : 'Staff on Duty'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black">{staffPresent} / {totalStaff}</span>
            <span className="text-xs font-semibold text-emerald-500">{staffAttRate}%</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {lang === 'ne' ? 'दैनिक बिहानको रोल कल' : 'Morning muster verified'}
          </div>
        </div>

        {/* KPI 3: Fee Collection This Term */}
        <div
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
            isDark ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
          onClick={() => onNavigateTab && onNavigateTab('finance-fees')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {lang === 'ne' ? 'शुल्क संकलन' : 'Collections'}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black">NPR {(totalCollected / 1000).toFixed(0)}k</span>
            <span className="text-xs font-semibold text-emerald-500">+12%</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {financeSummary?.receipts_count || 12} {lang === 'ne' ? 'रसिद जारी' : 'official receipts issued'}
          </div>
        </div>

        {/* KPI 4: Digital Campus Connectivity */}
        <div
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
            isDark ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
          onClick={() => onNavigateTab && onNavigateTab('elearning')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {lang === 'ne' ? 'अनलाइन कक्षा' : 'Virtual Classroom'}
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Video className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black">2</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
              Zoom / Meet
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {lang === 'ne' ? 'आजका निर्धारित कक्षाहरू' : 'Sessions scheduled today'}
          </div>
        </div>
      </div>

      {/* Quick Launchpad Buttons */}
      <div
        className={`p-5 rounded-2xl border ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          {lang === 'ne' ? 'द्रुत कार्यहरू (Quick Actions)' : 'Executive Shortcuts'}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('front-office')}
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
              isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <span className="text-xs font-semibold">{lang === 'ne' ? 'आगन्तुक पास' : 'Visitor Pass'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('student-info')}
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
              isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <PlusCircle className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-semibold">{lang === 'ne' ? 'विद्यार्थी भर्ना' : 'Add Student'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('attendance')}
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
              isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-semibold">{lang === 'ne' ? 'दैनिक हाजिरी' : 'Take Roll Call'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('finance-fees')}
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
              isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-semibold">{lang === 'ne' ? 'शुल्क संकलन' : 'Receive Fee'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('elearning')}
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
              isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Video className="w-5 h-5 text-purple-500" />
            <span className="text-xs font-semibold">{lang === 'ne' ? 'लाइभ कक्षा' : 'Live Class'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('communicate')}
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
              isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-5 h-5 text-rose-500" />
            <span className="text-xs font-semibold">{lang === 'ne' ? 'सूचना प्रकाशन' : 'Post Circular'}</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Urgent Circulars & Multi-Branch Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Bulletins & Notices */}
        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold">{lang === 'ne' ? 'ताजा सूचना तथा सर्कुलर' : 'Priority Notices & Alerts'}</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('communicate')}
              className="text-xs font-semibold text-emerald-500 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              {lang === 'ne' ? 'सबै हेर्नुहोस्' : 'View All'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {urgentNotices.length === 0 ? (
              <div className="p-4 rounded-xl border text-center text-xs text-slate-400 border-dashed">
                {lang === 'ne' ? 'कुनै आपतकालीन सूचना छैन' : 'No urgent alerts posted today'}
              </div>
            ) : (
              urgentNotices.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    n.priority === 'urgent'
                      ? 'border-rose-500/40 bg-rose-500/5'
                      : isDark
                      ? 'border-slate-800 bg-slate-900/60'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        n.priority === 'urgent' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {n.priority}
                    </span>
                    <span className="text-[10px] text-slate-400">{n.publish_date}</span>
                  </div>
                  <h3 className="text-xs font-bold mt-1.5">{n.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{n.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Multi-Branch Campus Health */}
        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold">{lang === 'ne' ? 'क्याम्पस शाखाहरू' : 'Campus Infrastructure'}</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('multi-branch')}
              className="text-xs font-semibold text-emerald-500 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              {lang === 'ne' ? 'व्यवस्थापन' : 'Branch Hub'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs">Main Campus (Kathmandu)</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                    PRIMARY
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Grade 1 to 12 • Science & Management Wing</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-black text-emerald-500">98 Students</div>
                <div className="text-[10px] text-slate-400">28 Faculty</div>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs">Bouddha Junior Wing</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/20 text-blue-400">
                    BRANCH #2
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Pre-Primary to Grade 5 • Activity Learning</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-black text-blue-500">30 Students</div>
                <div className="text-[10px] text-slate-400">10 Faculty</div>
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border border-dashed text-center text-xs text-slate-400 ${
                isDark ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              {lang === 'ne'
                ? 'शाखा परिवर्तन गर्न माथि दायाँ कुनामा रहेको "सक्रिय शाखा" छान्नुहोस्।'
                : 'Switch active campus via the Branch selector in the top bar to filter all telemetry.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolOverviewTab;

