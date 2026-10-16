// Comprehensive Exam Results, Historical Trends, and Student Behavior Records
// Alchemist Academy Secondary School - Unified Academic & Conduct Engine

export const EXAM_TERMS = [
  { id: 'term-2083-1', name: 'First Terminal Examination 2083', shortName: 'First Term', year: '2083 BS / 2026 AD', isCurrent: true, defaultStatus: 'published' },
  { id: 'term-2083-mid', name: 'Mid-Term Examination 2083', shortName: 'Mid Term', year: '2083 BS / 2026 AD', isCurrent: true, defaultStatus: 'draft' },
  { id: 'term-2083-third', name: 'Third Terminal Examination 2083', shortName: 'Third Term', year: '2083 BS / 2026 AD', isCurrent: true, defaultStatus: 'draft' },
  { id: 'term-2083-final', name: 'Final (Annual Board) Examination 2083', shortName: 'Final Term', year: '2083 BS / 2026 AD', isCurrent: true, defaultStatus: 'draft' },
  { id: 'term-2082-annual', name: 'Annual Examination 2082', shortName: 'Annual 2082', year: '2082 BS / 2025 AD', isCurrent: false, defaultStatus: 'published' },
  { id: 'term-2082-2', name: 'Second Terminal Examination 2082', shortName: '2nd Term 2082', year: '2082 BS / 2025 AD', isCurrent: false, defaultStatus: 'published' },
  { id: 'term-2082-1', name: 'First Terminal Examination 2082', shortName: '1st Term 2082', year: '2082 BS / 2025 AD', isCurrent: false, defaultStatus: 'published' },
];

export const GRADE_10_SUBJECTS = [
  { code: 'ENG-101', name: 'Compulsory English', thMax: 75, prMax: 25 },
  { code: 'NEP-102', name: 'Compulsory Nepali', thMax: 75, prMax: 25 },
  { code: 'MTH-103', name: 'Compulsory Mathematics', thMax: 75, prMax: 25 },
  { code: 'SCI-104', name: 'Compulsory Science & Technology', thMax: 75, prMax: 25 },
  { code: 'SOC-105', name: 'Social Studies & Life Skills', thMax: 75, prMax: 25 },
  { code: 'OPT-106', name: 'Optional I: Additional Mathematics', thMax: 75, prMax: 25 },
  { code: 'OPT-107', name: 'Optional II: Computer Science', thMax: 50, prMax: 50 },
];

export const calculateNepalCdcGrade = (totalMarks) => {
  if (totalMarks >= 90) return { grade: 'A+', gpa: 4.0, remarks: 'Outstanding' };
  if (totalMarks >= 80) return { grade: 'A', gpa: 3.6, remarks: 'Excellent' };
  if (totalMarks >= 70) return { grade: 'B+', gpa: 3.2, remarks: 'Very Good' };
  if (totalMarks >= 60) return { grade: 'B', gpa: 2.8, remarks: 'Good' };
  if (totalMarks >= 50) return { grade: 'C+', gpa: 2.4, remarks: 'Satisfactory' };
  if (totalMarks >= 40) return { grade: 'C', gpa: 2.0, remarks: 'Acceptable' };
  if (totalMarks >= 35) return { grade: 'D', gpa: 1.6, remarks: 'Basic' };
  return { grade: 'NG', gpa: 0.0, remarks: 'Not Graded' };
};

// Storage Keys
export const EXAM_TERMS_STATUS_STORAGE_KEY = 'alchemist_sms_exam_terms_status_v2';
export const TEACHER_MARKS_LEDGER_STORAGE_KEY = 'alchemist_sms_teacher_marks_ledger_v2';

// 1. Get Exam Term Release Status
export const getExamTermsStatus = () => {
  try {
    const raw = localStorage.getItem(EXAM_TERMS_STATUS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  const defaults = {
    'term-2083-1': { status: 'published', label: 'Released to Student Portal', releasedAt: '2026-03-20', releasedBy: 'Exam Controller' },
    'term-2083-mid': { status: 'draft', label: 'Draft / Grading in Progress', releasedAt: null, releasedBy: null },
    'term-2083-third': { status: 'draft', label: 'Draft / Upcoming', releasedAt: null, releasedBy: null },
    'term-2083-final': { status: 'draft', label: 'Draft / Upcoming', releasedAt: null, releasedBy: null },
    'term-2082-annual': { status: 'published', label: 'Archived / Official', releasedAt: '2025-04-10', releasedBy: 'Exam Board' },
    'term-2082-2': { status: 'published', label: 'Archived / Official', releasedAt: '2025-01-15', releasedBy: 'Exam Board' },
    'term-2082-1': { status: 'published', label: 'Archived / Official', releasedAt: '2024-09-22', releasedBy: 'Exam Board' },
  };

  try {
    localStorage.setItem(EXAM_TERMS_STATUS_STORAGE_KEY, JSON.stringify(defaults));
  } catch (e) {}
  return defaults;
};

// 2. Set Exam Term Release Status (Publish / Unrelease)
export const setExamTermStatus = (termId, newStatus, author = 'Admin') => {
  const current = getExamTermsStatus();
  current[termId] = {
    status: newStatus,
    label: newStatus === 'published' ? 'Released to Student Portal' : 'Draft / Grading in Progress',
    releasedAt: newStatus === 'published' ? new Date().toISOString().split('T')[0] : null,
    releasedBy: author,
  };

  try {
    localStorage.setItem(EXAM_TERMS_STATUS_STORAGE_KEY, JSON.stringify(current));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('alchemist_exam_results_updated', { detail: { termId, newStatus } }));
    }
  } catch (e) {}

  return current;
};

// 3. Save Teacher Entered Marks for a Subject & Cohort
export const saveTeacherSubjectMarks = (termId, classId, section, subjectCode, marksList, teacherName = 'Teacher') => {
  let ledger = {};
  try {
    const raw = localStorage.getItem(TEACHER_MARKS_LEDGER_STORAGE_KEY);
    if (raw) ledger = JSON.parse(raw);
  } catch (e) {}

  const key = `${termId}_${classId}_${section}_${subjectCode}`;
  ledger[key] = {
    termId,
    classId,
    section,
    subjectCode,
    teacherName,
    updatedAt: new Date().toISOString(),
    marks: marksList, // array of { rollNo, studentId, theory, practical, remarks }
  };

  try {
    localStorage.setItem(TEACHER_MARKS_LEDGER_STORAGE_KEY, JSON.stringify(ledger));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('alchemist_exam_results_updated', { detail: { termId, subjectCode } }));
    }
  } catch (e) {}

  return ledger;
};

// 4. Retrieve Teacher Entered Marks for a Subject & Cohort
export const getTeacherSubjectMarks = (termId, classId, section, subjectCode) => {
  try {
    const raw = localStorage.getItem(TEACHER_MARKS_LEDGER_STORAGE_KEY);
    if (raw) {
      const ledger = JSON.parse(raw);
      // Try exact key first
      const exactKey = `${termId}_${classId}_${section}_${subjectCode}`;
      if (ledger[exactKey]) return ledger[exactKey].marks;
      // Try with 'all' section
      const allKey = `${termId}_${classId}_all_${subjectCode}`;
      if (ledger[allKey]) return ledger[allKey].marks;
    }
  } catch (e) {}
  return null;
};

// Generates multi-term marks for a student based on baseline performance + teacher overrides
export const generateStudentMultiTermResults = (student) => {
  const roll = Number(student.roll_no || student.rollNo || 1);
  const statusObj = getExamTermsStatus();

  // Load teacher overrides ledger
  let teacherLedger = {};
  try {
    const raw = localStorage.getItem(TEACHER_MARKS_LEDGER_STORAGE_KEY);
    if (raw) teacherLedger = JSON.parse(raw);
  } catch (e) {}

  const termsData = {
    'term-2082-1': {
      termId: 'term-2082-1',
      termName: 'First Terminal Examination 2082',
      session: 'Academic Year 2082 BS',
      subjects: [
        { code: 'ENG-101', name: 'Compulsory English', th: Math.min(75, 52 + (roll % 15)), pr: 23, remarks: 'Fluent comprehension' },
        { code: 'NEP-102', name: 'Compulsory Nepali', th: Math.min(75, 48 + (roll % 14)), pr: 22, remarks: 'Good composition' },
        { code: 'MTH-103', name: 'Compulsory Mathematics', th: Math.min(75, 54 + (roll % 18)), pr: 24, remarks: 'Sound algebraic logic' },
        { code: 'SCI-104', name: 'Compulsory Science & Technology', th: Math.min(75, 50 + (roll % 16)), pr: 23, remarks: 'Good scientific method' },
        { code: 'SOC-105', name: 'Social Studies & Life Skills', th: Math.min(75, 53 + (roll % 13)), pr: 22, remarks: 'Active engagement' },
        { code: 'OPT-106', name: 'Optional I: Additional Mathematics', th: Math.min(75, 49 + (roll % 17)), pr: 24, remarks: 'Steady progress' },
        { code: 'OPT-107', name: 'Optional II: Computer Science', th: Math.min(50, 36 + (roll % 10)), pr: 46, remarks: 'Good coding concepts' },
      ],
    },
    'term-2082-2': {
      termId: 'term-2082-2',
      termName: 'Second Terminal Examination 2082',
      session: 'Academic Year 2082 BS',
      subjects: [
        { code: 'ENG-101', name: 'Compulsory English', th: Math.min(75, 55 + (roll % 15)), pr: 24, remarks: 'Eloquent expression' },
        { code: 'NEP-102', name: 'Compulsory Nepali', th: Math.min(75, 51 + (roll % 14)), pr: 23, remarks: 'Neat handwriting' },
        { code: 'MTH-103', name: 'Compulsory Mathematics', th: Math.min(75, 58 + (roll % 16)), pr: 24, remarks: 'Analytical proof clarity' },
        { code: 'SCI-104', name: 'Compulsory Science & Technology', th: Math.min(75, 53 + (roll % 15)), pr: 24, remarks: 'Good lab notes' },
        { code: 'SOC-105', name: 'Social Studies & Life Skills', th: Math.min(75, 56 + (roll % 12)), pr: 23, remarks: 'Insightful perspectives' },
        { code: 'OPT-106', name: 'Optional I: Additional Mathematics', th: Math.min(75, 53 + (roll % 16)), pr: 24, remarks: 'Matrix operations mastered' },
        { code: 'OPT-107', name: 'Optional II: Computer Science', th: Math.min(50, 39 + (roll % 9)), pr: 47, remarks: 'Proficient in Python logic' },
      ],
    },
    'term-2082-annual': {
      termId: 'term-2082-annual',
      termName: 'Annual Examination 2082',
      session: 'Academic Year 2082 BS (Final)',
      subjects: [
        { code: 'ENG-101', name: 'Compulsory English', th: Math.min(75, 58 + (roll % 14)), pr: 24, remarks: 'High vocabulary mastery' },
        { code: 'NEP-102', name: 'Compulsory Nepali', th: Math.min(75, 54 + (roll % 13)), pr: 24, remarks: 'Great grammatical precision' },
        { code: 'MTH-103', name: 'Compulsory Mathematics', th: Math.min(75, 62 + (roll % 12)), pr: 25, remarks: 'Geometry and trig excellence' },
        { code: 'SCI-104', name: 'Compulsory Science & Technology', th: Math.min(75, 57 + (roll % 14)), pr: 24, remarks: 'Outstanding experiment conduct' },
        { code: 'SOC-105', name: 'Social Studies & Life Skills', th: Math.min(75, 59 + (roll % 12)), pr: 24, remarks: 'Thoughtful socio-economic analysis' },
        { code: 'OPT-106', name: 'Optional I: Additional Mathematics', th: Math.min(75, 57 + (roll % 15)), pr: 25, remarks: 'Sharp analytical problem solver' },
        { code: 'OPT-107', name: 'Optional II: Computer Science', th: Math.min(50, 42 + (roll % 7)), pr: 48, remarks: 'Exceptional programming project' },
      ],
    },
    'term-2083-1': {
      termId: 'term-2083-1',
      termName: 'First Terminal Examination 2083',
      session: 'Academic Year 2083 BS (Term 1)',
      subjects: [
        { code: 'ENG-101', name: 'Compulsory English', th: Math.min(75, 62 + (roll % 12)), pr: 25, remarks: 'Exceptional literary analysis' },
        { code: 'NEP-102', name: 'Compulsory Nepali', th: Math.min(75, 58 + (roll % 12)), pr: 24, remarks: 'Strong creative writing & essay' },
        { code: 'MTH-103', name: 'Compulsory Mathematics', th: Math.min(75, 65 + (roll % 10)), pr: 25, remarks: 'Mastered SEE height and distances' },
        { code: 'SCI-104', name: 'Compulsory Science & Technology', th: Math.min(75, 61 + (roll % 12)), pr: 25, remarks: 'Thorough scientific explanation' },
        { code: 'SOC-105', name: 'Social Studies & Life Skills', th: Math.min(75, 62 + (roll % 10)), pr: 24, remarks: 'Civic responsibilities well documented' },
        { code: 'OPT-106', name: 'Optional I: Additional Mathematics', th: Math.min(75, 61 + (roll % 12)), pr: 25, remarks: 'Coordinate transformation pro' },
        { code: 'OPT-107', name: 'Optional II: Computer Science', th: Math.min(50, 45 + (roll % 5)), pr: 49, remarks: 'Exemplary algorithm construction' },
      ],
    },
    'term-2083-mid': {
      termId: 'term-2083-mid',
      termName: 'Mid-Term Examination 2083',
      session: 'Academic Year 2083 BS (Term 2)',
      subjects: [
        { code: 'ENG-101', name: 'Compulsory English', th: Math.min(75, 64 + (roll % 11)), pr: 25, remarks: 'Advanced comprehension' },
        { code: 'NEP-102', name: 'Compulsory Nepali', th: Math.min(75, 60 + (roll % 11)), pr: 24, remarks: 'Accurate syntax and structure' },
        { code: 'MTH-103', name: 'Compulsory Mathematics', th: Math.min(75, 66 + (roll % 9)), pr: 25, remarks: 'Excellent vectors and calculus' },
        { code: 'SCI-104', name: 'Compulsory Science & Technology', th: Math.min(75, 63 + (roll % 11)), pr: 25, remarks: 'Practical lab report distinction' },
        { code: 'SOC-105', name: 'Social Studies & Life Skills', th: Math.min(75, 63 + (roll % 10)), pr: 25, remarks: 'Exemplary project presentation' },
        { code: 'OPT-106', name: 'Optional I: Additional Mathematics', th: Math.min(75, 63 + (roll % 11)), pr: 25, remarks: 'Superb statistical analysis' },
        { code: 'OPT-107', name: 'Optional II: Computer Science', th: Math.min(50, 46 + (roll % 4)), pr: 49, remarks: 'Web application and database pro' },
      ],
    },
    'term-2083-third': {
      termId: 'term-2083-third',
      termName: 'Third Terminal Examination 2083',
      session: 'Academic Year 2083 BS (Term 3)',
      subjects: [
        { code: 'ENG-101', name: 'Compulsory English', th: Math.min(75, 65 + (roll % 10)), pr: 25, remarks: 'Superior oral & written delivery' },
        { code: 'NEP-102', name: 'Compulsory Nepali', th: Math.min(75, 61 + (roll % 10)), pr: 25, remarks: 'Fine linguistic balance' },
        { code: 'MTH-103', name: 'Compulsory Mathematics', th: Math.min(75, 67 + (roll % 8)), pr: 25, remarks: 'Flawless SEE model set solutions' },
        { code: 'SCI-104', name: 'Compulsory Science & Technology', th: Math.min(75, 64 + (roll % 10)), pr: 25, remarks: 'In-depth chemical formula mastery' },
        { code: 'SOC-105', name: 'Social Studies & Life Skills', th: Math.min(75, 64 + (roll % 9)), pr: 25, remarks: 'Comprehensive world history notes' },
        { code: 'OPT-106', name: 'Optional I: Additional Mathematics', th: Math.min(75, 65 + (roll % 10)), pr: 25, remarks: 'Top notch theorem deductions' },
        { code: 'OPT-107', name: 'Optional II: Computer Science', th: Math.min(50, 47 + (roll % 3)), pr: 50, remarks: 'Clean algorithmic architecture' },
      ],
    },
    'term-2083-final': {
      termId: 'term-2083-final',
      termName: 'Final (Annual Board) Examination 2083',
      session: 'Academic Year 2083 BS (Final Annual)',
      subjects: [
        { code: 'ENG-101', name: 'Compulsory English', th: Math.min(75, 66 + (roll % 9)), pr: 25, remarks: 'Graduation standard vocabulary' },
        { code: 'NEP-102', name: 'Compulsory Nepali', th: Math.min(75, 62 + (roll % 9)), pr: 25, remarks: 'Board-level composition mastery' },
        { code: 'MTH-103', name: 'Compulsory Mathematics', th: Math.min(75, 68 + (roll % 7)), pr: 25, remarks: 'High distinction marks in math' },
        { code: 'SCI-104', name: 'Compulsory Science & Technology', th: Math.min(75, 65 + (roll % 9)), pr: 25, remarks: 'Exemplary physics & bio precision' },
        { code: 'SOC-105', name: 'Social Studies & Life Skills', th: Math.min(75, 65 + (roll % 8)), pr: 25, remarks: 'Broad civic perspective' },
        { code: 'OPT-106', name: 'Optional I: Additional Mathematics', th: Math.min(75, 66 + (roll % 9)), pr: 25, remarks: 'Rigorous mathematical proof' },
        { code: 'OPT-107', name: 'Optional II: Computer Science', th: Math.min(50, 48 + (roll % 2)), pr: 50, remarks: 'Mastery in system architecture' },
      ],
    },
  };

  // Check teacher overrides for each term
  Object.keys(termsData).forEach((termKey) => {
    const raw = termsData[termKey];
    raw.subjects = raw.subjects.map((sub) => {
      // Look across teacherLedger for matches
      let overrideTh = null;
      let overridePr = null;
      let overrideRem = null;

      Object.values(teacherLedger).forEach((entry) => {
        if (entry.termId === termKey && entry.subjectCode === sub.code && Array.isArray(entry.marks)) {
          const match = entry.marks.find((m) => Number(m.rollNo) === roll);
          if (match) {
            overrideTh = Number(match.theory);
            overridePr = Number(match.practical);
            if (match.remarks) overrideRem = match.remarks;
          }
        }
      });

      return {
        ...sub,
        th: overrideTh !== null ? overrideTh : sub.th,
        pr: overridePr !== null ? overridePr : sub.pr,
        remarks: overrideRem !== null ? overrideRem : sub.remarks,
      };
    });
  });

  // Compile calculations and trend timeline
  const processedTerms = {};
  const trendPoints = [];

  Object.keys(termsData).forEach((key) => {
    const raw = termsData[key];
    let totalObtained = 0;
    let totalMax = 0;
    let gpaSum = 0;

    const subjectsWithGrades = raw.subjects.map((sub) => {
      const total = (Number(sub.th) || 0) + (Number(sub.pr) || 0);
      const cdc = calculateNepalCdcGrade(total);
      totalObtained += total;
      totalMax += 100;
      gpaSum += cdc.gpa;
      return {
        ...sub,
        total,
        grade: cdc.grade,
        gpa: cdc.gpa,
        remarks: sub.remarks || cdc.remarks,
      };
    });

    const averageGpa = Number((gpaSum / subjectsWithGrades.length).toFixed(2));
    const percentage = Number(((totalObtained / totalMax) * 100).toFixed(1));
    const overallCdc = calculateNepalCdcGrade(percentage);
    const termStatus = statusObj[key]?.status || 'published';
    const isPublished = termStatus === 'published';

    processedTerms[key] = {
      ...raw,
      subjects: subjectsWithGrades,
      totalObtained,
      totalMax,
      percentage,
      gpa: averageGpa,
      overallGrade: overallCdc.grade,
      rank: Math.max(1, Math.min(36, roll + Math.floor(Math.sin(roll) * 3))),
      classTotal: 36,
      resultStatus: percentage >= 40 ? 'Promoted with Distinction' : 'Needs Support',
      isPublished,
      statusLabel: statusObj[key]?.label || (isPublished ? 'Released to Students' : 'Draft / Grading in Progress'),
      releasedAt: statusObj[key]?.releasedAt || null,
      releasedBy: statusObj[key]?.releasedBy || null,
    };

    trendPoints.push({
      termKey: key,
      termLabel: key === 'term-2082-1' ? '1st Term 2082' :
                 key === 'term-2082-2' ? '2nd Term 2082' :
                 key === 'term-2082-annual' ? 'Annual 2082' :
                 key === 'term-2083-1' ? '1st Term 2083' :
                 key === 'term-2083-mid' ? 'Mid-Term 2083' :
                 key === 'term-2083-third' ? '3rd Term 2083' : 'Final 2083',
      gpa: averageGpa,
      percentage,
      isPublished,
    });
  });

  return {
    studentId: student.id || student.admission_no,
    studentName: student.name || `${student.first_name} ${student.last_name}`,
    rollNo: roll,
    terms: processedTerms,
    trendPoints,
    latestGpa: processedTerms['term-2083-1'].gpa,
    previousGpa: processedTerms['term-2082-annual'].gpa,
    gpaDelta: Number((processedTerms['term-2083-1'].gpa - processedTerms['term-2082-annual'].gpa).toFixed(2)),
  };
};

// Generates complete behavioral history since student joined
export const generateStudentBehaviorHistory = (student) => {
  const roll = Number(student.roll_no || student.rollNo || 1);
  const name = student.name || `${student.first_name} ${student.last_name}`;

  const baseEvents = [
    {
      id: `BEH-1-${roll}`,
      date: '2024-05-15',
      dateBs: '2081-02-02',
      type: 'positive',
      category: 'Orientation & Induction',
      title: 'Exemplary Campus Induction & Punctual Enrollment',
      description: `Completed comprehensive student orientation and showed enthusiastic leadership in peer cohort activities.`,
      points: 10,
      awardedBy: 'RJ Rana (Class Teacher)',
      status: 'Recorded in Official Dossier',
      badge: 'Early Bird Star',
    },
    {
      id: `BEH-2-${roll}`,
      date: '2024-09-20',
      dateBs: '2081-06-04',
      type: 'positive',
      category: 'Academic Excellence',
      title: 'Term 1 Mathematics Quest Champion',
      description: `Achieved 100% score on mental mathematics and speed problem solving tournament.`,
      points: 15,
      awardedBy: 'Mandira Adhikari (Academic Head)',
      status: 'Recorded in Official Dossier',
      badge: 'Math Quest Medal',
    },
    {
      id: `BEH-3-${roll}`,
      date: '2025-01-18',
      dateBs: '2081-10-04',
      type: 'positive',
      category: 'Co-Curricular & Civic Leadership',
      title: 'Inter-House Winter Science Fair Gold Citation',
      description: `Designed and presented a working model on eco-friendly Himalayan hydropower generation with outstanding public speaking.`,
      points: 25,
      awardedBy: 'Dr. K. Acharya (Senior Science Faculty)',
      status: 'Recorded in Official Dossier',
      badge: 'STEM Innovator',
    },
    {
      id: `BEH-4-${roll}`,
      date: '2025-06-10',
      dateBs: '2082-02-27',
      type: 'positive',
      category: 'Community Service',
      title: 'Peer Tutoring & Reading Buddy Mentorship Award',
      description: `Volunteered 18 hours assisting Grade 5 primary students with remedial reading and homework clinics.`,
      points: 20,
      awardedBy: 'Bikram Karki (Student Welfare)',
      status: 'Recorded in Official Dossier',
      badge: 'Civic Leader',
    },
    {
      id: `BEH-5-${roll}`,
      date: '2025-11-22',
      dateBs: '2082-08-06',
      type: 'positive',
      category: 'Discipline & Punctuality',
      title: 'Unbroken 100% Attendance Milestone (Term 2)',
      description: `Zero recorded absences or unexcused lates across the entire winter academic semester.`,
      points: 15,
      awardedBy: 'RJ Rana (Class Teacher)',
      status: 'Recorded in Official Dossier',
      badge: 'Perfect Attendance',
    },
    {
      id: `BEH-6-${roll}`,
      date: '2026-03-05',
      dateBs: '2082-11-21',
      type: 'positive',
      category: 'Sports & Team Spirit',
      title: 'Annual Sports Meet Badminton Runner-Up',
      description: `Demonstrated outstanding sportsmanship, fair play, and respectful conduct across competitive doubles fixtures.`,
      points: 15,
      awardedBy: 'Sports Directorate',
      status: 'Recorded in Official Dossier',
      badge: 'Fair Play Badge',
    },
  ];

  if (roll === 3 || roll === 9) {
    baseEvents.push({
      id: `BEH-DISC-${roll}`,
      date: '2025-08-14',
      dateBs: '2082-04-29',
      type: 'counseling',
      category: 'Guidance & Counseling',
      title: 'Traffic Commute Delay & Morning Assembly Reflection',
      description: `Student arrived 20 minutes late due to Ring Road transport stoppage. Attended a 15-minute counseling session on proactive time buffering. Resolved with positive reflection.`,
      points: -5,
      awardedBy: 'Bikram Karki (Counselor)',
      status: 'Counseling Completed • Resolved',
      badge: null,
    });
  }

  const netPoints = baseEvents.reduce((acc, curr) => acc + curr.points, 0);

  return {
    studentId: student.id || student.admission_no,
    studentName: name,
    joiningDate: 'May 2024 (2081 BS)',
    tenure: '2 Years, 5 Months',
    conductGrade: netPoints >= 80 ? 'Exemplary A+' : netPoints >= 60 ? 'Commendable A' : 'Good B+',
    totalMerits: baseEvents.filter((e) => e.type === 'positive').length,
    totalCounseling: baseEvents.filter((e) => e.type !== 'positive').length,
    netPoints,
    badges: baseEvents.filter((e) => e.badge).map((e) => e.badge),
    timeline: baseEvents.sort((a, b) => new Date(b.date) - new Date(a.date)),
  };
};

// Summary metrics for Class Cards in Result Hub
export const CLASS_RESULT_SUMMARIES = [
  {
    classId: 1,
    className: 'Grade 10',
    faculty: 'Secondary Division',
    studentCount: 36,
    avgGpa: 3.64,
    passRate: 97.2,
    distinctionRate: 47.2,
    topScorer: { name: 'Aarav Sharma', gpa: 3.95, percentage: 91.2, roll: 1 },
    topSubject: 'Compulsory Mathematics (84.5% Class Avg)',
    sparkline: [3.42, 3.55, 3.61, 3.64],
    status: 'Term 1 Complete',
  },
  {
    classId: 2,
    className: 'Grade 9',
    faculty: 'Secondary Division',
    studentCount: 32,
    avgGpa: 3.48,
    passRate: 93.8,
    distinctionRate: 37.5,
    topScorer: { name: 'Bishal Rijal', gpa: 3.88, percentage: 89.0, roll: 1 },
    topSubject: 'Science & Technology (82.1% Class Avg)',
    sparkline: [3.31, 3.39, 3.44, 3.48],
    status: 'Term 1 Complete',
  },
  {
    classId: 3,
    className: 'Grade 11 - Science',
    faculty: 'Higher Secondary (+2 Science)',
    studentCount: 28,
    avgGpa: 3.72,
    passRate: 100.0,
    distinctionRate: 53.6,
    topScorer: { name: 'Anil Sharma', gpa: 3.98, percentage: 93.4, roll: 1 },
    topSubject: 'Physics & STEM (87.2% Class Avg)',
    sparkline: [3.51, 3.62, 3.68, 3.72],
    status: 'Term 1 Complete',
  },
  {
    classId: 4,
    className: 'Grade 12 - Management',
    faculty: 'Higher Secondary (+2 Management)',
    studentCount: 25,
    avgGpa: 3.56,
    passRate: 96.0,
    distinctionRate: 40.0,
    topScorer: { name: 'Anupama Subedi', gpa: 3.92, percentage: 90.6, roll: 1 },
    topSubject: 'Accountancy & Economics (85.0% Class Avg)',
    sparkline: [3.38, 3.45, 3.51, 3.56],
    status: 'Term 1 Complete',
  },
];
