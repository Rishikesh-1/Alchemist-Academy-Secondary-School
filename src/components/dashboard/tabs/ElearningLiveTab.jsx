import React, { useState, useEffect } from 'react';
import {
  Video,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  Plus,
  Play,
  Layers,
  Sparkles,
  X,
  CheckCircle2,
  Tv,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  fetchElearningCourses,
  fetchLiveClasses,
  createElearningCourse,
  scheduleLiveClass,
} from '../../../services/api';

const ElearningLiveTab = ({ isDark }) => {
  const { lang, currentBranch } = useAuth();
  const [subTab, setSubTab] = useState('live'); // 'live' | 'courses'

  const [courses, setCourses] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);

  // Forms
  const [liveForm, setLiveForm] = useState({
    title: '',
    platform: 'zoom',
    class_id: 1,
    subject_id: 1,
    meeting_id: '',
    meeting_password: '',
    join_url: '',
    start_time: '',
    duration_minutes: 45,
  });

  const [courseForm, setCourseForm] = useState({
    title: '',
    class_id: 1,
    subject_id: 1,
    description: '',
    thumbnail_url: '',
    total_lessons: 12,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, lRes] = await Promise.allSettled([
        fetchElearningCourses(),
        fetchLiveClasses(),
      ]);
      if (cRes.status === 'fulfilled' && cRes.value?.success) {
        setCourses(cRes.value.data?.courses || []);
      }
      if (lRes.status === 'fulfilled' && lRes.value?.success) {
        setLiveClasses(lRes.value.data?.live_classes || []);
      }
    } catch (err) {
      console.error('Error fetching elearning data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentBranch]);

  // Handle Schedule Live Class
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!liveForm.title || !liveForm.join_url || !liveForm.start_time) {
      alert('Please fill title, start time, and meeting URL.');
      return;
    }
    const res = await scheduleLiveClass(liveForm);
    if (res.success) {
      alert('Live virtual class scheduled successfully.');
      setShowScheduleModal(false);
      setLiveForm({
        title: '',
        platform: 'zoom',
        class_id: 1,
        subject_id: 1,
        meeting_id: '',
        meeting_password: '',
        join_url: '',
        start_time: '',
        duration_minutes: 45,
      });
      loadData();
    } else {
      alert(res.message || 'Failed to schedule class.');
    }
  };

  // Handle Create Course
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    if (!courseForm.title) {
      alert('Please fill course title.');
      return;
    }
    const res = await createElearningCourse(courseForm);
    if (res.success) {
      alert('Course module created successfully.');
      setShowCourseModal(false);
      setCourseForm({
        title: '',
        class_id: 1,
        subject_id: 1,
        description: '',
        thumbnail_url: '',
        total_lessons: 12,
      });
      loadData();
    } else {
      alert(res.message || 'Failed to create course.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black">
            {lang === 'ne' ? 'अनलाइन पाठ्यक्रम तथा भर्चुअल लाइभ कक्षा' : 'Online Courses & Live Classes'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'ne'
              ? 'जुम, गुगल मिट तथा जित्सी मार्फत प्रत्यक्ष भर्चुअल कक्षाहरू र डिजिटल ई-लर्निङ मोड्युलहरू'
              : 'Real-time hybrid video conferencing (Zoom / Meet / Jitsi) and structured digital study modules'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {subTab === 'live' ? (
            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ne' ? 'लाइभ कक्षा तालिका' : 'Schedule Live Class'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowCourseModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ne' ? 'नयाँ कोर्ष सिर्जना' : 'Create Course Module'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
        <button
          type="button"
          onClick={() => setSubTab('live')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'live'
              ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30'
              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>{lang === 'ne' ? 'प्रत्यक्ष भर्चुअल कक्षाहरू' : 'Live Virtual Classes'}</span>
          <span className="ml-1 px-2 py-0.2 rounded-full text-[10px] bg-purple-500/30 text-purple-500 font-bold">
            {liveClasses.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('courses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'courses'
              ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{lang === 'ne' ? 'ई-लर्निङ पाठ्यक्रम' : 'E-Learning Courses'}</span>
          <span className="ml-1 px-2 py-0.2 rounded-full text-[10px] bg-indigo-500/30 text-indigo-500 font-bold">
            {courses.length}
          </span>
        </button>
      </div>

      {/* Live Virtual Classes Section */}
      {subTab === 'live' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveClasses.length === 0 ? (
              <div className={`col-span-full p-8 rounded-2xl border text-center border-dashed ${
                isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-300'
              }`}>
                No virtual live classes scheduled. Click "Schedule Live Class" to set up a Zoom or Google Meet room.
              </div>
            ) : (
              liveClasses.map((item) => {
                const isZoom = item.platform === 'zoom';
                const isMeet = item.platform === 'google_meet';
                return (
                  <div
                    key={item.id}
                    className={`p-5 rounded-2xl border transition-all hover:shadow-lg flex flex-col justify-between ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            isZoom
                              ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                              : isMeet
                              ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                              : 'bg-purple-500/20 text-purple-600 border border-purple-500/30'
                          }`}
                        >
                          {item.platform === 'google_meet' ? 'Google Meet' : item.platform.toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-300'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>

                      <h3 className={`font-bold text-sm line-clamp-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{item.title}</h3>
                      <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {item.class_name || 'Class 10'} • {item.subject_name || 'Science'}
                      </div>

                      <div className={`mt-4 p-3 rounded-xl border space-y-1.5 text-[11px] ${
                        isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className={`flex items-center justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          <span className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            <Clock className="w-3.5 h-3.5 text-purple-500" />
                            Start Time:
                          </span>
                          <span className="font-semibold">{new Date(item.start_time).toLocaleString()}</span>
                        </div>
                        <div className={`flex items-center justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Duration:</span>
                          <span>{item.duration_minutes} Minutes</span>
                        </div>
                        {item.meeting_id && (
                          <div className={`flex items-center justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Meeting ID:</span>
                            <span className="font-mono text-purple-500 font-semibold">{item.meeting_id}</span>
                          </div>
                        )}
                        {item.meeting_password && (
                          <div className={`flex items-center justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Passcode:</span>
                            <span className={`font-mono ${isDark ? 'text-slate-300' : 'text-slate-800 font-semibold'}`}>{item.meeting_password}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`mt-4 pt-3 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
                      <a
                        href={item.join_url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 transition-all"
                      >
                        <Video className="w-4 h-4" />
                        <span>Launch Virtual Classroom</span>
                        <ExternalLink className="w-3 h-3 opacity-80" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Course Catalog Section */}
      {subTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.length === 0 ? (
            <div className={`col-span-full p-8 rounded-2xl border text-center border-dashed ${
              isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-300'
            }`}>
              No online courses published yet. Click "Create Course Module" to add interactive curriculum.
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all hover:shadow-lg ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div>
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-36 object-cover"
                    />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-tr from-indigo-900 to-purple-900 flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-indigo-300 opacity-60" />
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        isDark ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {course.class_name || 'Grade 10'} • {course.subject_name || 'Science'}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {course.course_status}
                      </span>
                    </div>

                    <h3 className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{course.title}</h3>
                    <p className={`text-xs line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{course.description}</p>
                  </div>
                </div>

                <div className={`p-4 pt-2 border-t flex items-center justify-between text-xs ${
                  isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
                }`}>
                  <div>
                    <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{course.total_lessons}</span> Modules
                  </div>
                  <div>
                    Faculty: <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{course.teacher_name || 'Dr. Saroj Karki'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Schedule Live Class Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-500" />
                <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Schedule Virtual Live Session</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className={`cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Session Title *</label>
                <input
                  type="text"
                  required
                  value={liveForm.title}
                  onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })}
                  placeholder="e.g. Physics Numerical Mastery & Q&A"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Platform</label>
                  <select
                    value={liveForm.platform}
                    onChange={(e) => setLiveForm({ ...liveForm, platform: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="zoom">Zoom Video</option>
                    <option value="google_meet">Google Meet</option>
                    <option value="jitsi">Jitsi Meet</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Duration (Minutes)</label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    value={liveForm.duration_minutes}
                    onChange={(e) => setLiveForm({ ...liveForm, duration_minutes: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Start Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={liveForm.start_time}
                  onChange={(e) => setLiveForm({ ...liveForm, start_time: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Meeting Join URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://zoom.us/j/123456789 or https://meet.google.com/xyz"
                  value={liveForm.join_url}
                  onChange={(e) => setLiveForm({ ...liveForm, join_url: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Meeting ID</label>
                  <input
                    type="text"
                    placeholder="891-2234-9981"
                    value={liveForm.meeting_id}
                    onChange={(e) => setLiveForm({ ...liveForm, meeting_id: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Passcode</label>
                  <input
                    type="text"
                    placeholder="e.g. Chem2026"
                    value={liveForm.meeting_password}
                    onChange={(e) => setLiveForm({ ...liveForm, meeting_password: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className={`px-4 py-2 rounded-xl border cursor-pointer ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer"
                >
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Create New Course Module</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCourseModal(false)}
                className={`cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCourseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Course Title *</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="e.g. Advanced Thermodynamics Masterclass"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Description</label>
                <textarea
                  rows="3"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Course syllabus summary and learning objectives..."
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Total Lessons</label>
                  <input
                    type="number"
                    min="1"
                    value={courseForm.total_lessons}
                    onChange={(e) => setCourseForm({ ...courseForm, total_lessons: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Thumbnail URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={courseForm.thumbnail_url}
                    onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className={`px-4 py-2 rounded-xl border cursor-pointer ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElearningLiveTab;

