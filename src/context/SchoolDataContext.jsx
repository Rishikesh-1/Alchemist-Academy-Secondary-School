import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialPortalData } from '../data/portalData';
import { initialTeacherData } from '../data/teacherData';
import { initialVendorData } from '../data/vendorData';

const SchoolDataContext = createContext();

const STORAGE_KEY = 'alchemist_master_school_state_v3';

export const SchoolDataProvider = ({ children }) => {
  // Master unified school state
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading school state:', e);
    }

    return {
      student: initialPortalData.student,
      attendanceCalendar: initialPortalData.attendanceCalendar,
      assignments: initialPortalData.assignments,
      bills: initialPortalData.bills,
      reportCard: initialPortalData.reportCard,
      timetable: initialPortalData.timetable,
      notices: initialPortalData.notices,
      teacher: initialTeacherData.teacher,
      classRoster: initialTeacherData.classRoster,
      teacherRoutine: initialTeacherData.teacherRoutine,
      vendorData: initialVendorData,

      // High-Tech Feature 1: Digital Bus GPS & Transit Route
      transitBus: {
        routeNo: 'Route 3 (Eastern Belt)',
        busNo: 'BA 2 KHA 8492',
        driverName: 'Hari Bahadur Tamang',
        driverPhone: '+977 9841556677',
        helperName: 'Bikash Rai',
        capacity: '36 Seats (Air Conditioned)',
        currentStatus: 'On Route • Approving Stop 3',
        etaToStudentStop: '9 Mins',
        speedKmH: 28,
        stops: [
          { name: 'Gokarneshwor Campus Hub', time: '08:20 AM', status: 'completed' },
          { name: 'Jorpati Oralo (Student Stop)', time: '08:35 AM', status: 'approaching', current: true },
          { name: 'Bouddha Stupa Gate', time: '08:48 AM', status: 'upcoming' },
          { name: 'Chabahil Ring Road', time: '09:02 AM', status: 'upcoming' },
          { name: 'Alchemist Academy Main Campus', time: '09:15 AM', status: 'destination' },
        ],
      },

      // High-Tech Feature 2: 1-on-1 Doubts & Teacher-Student Messages
      doubtsMessages: [
        {
          id: 'MSG-01',
          sender: 'student',
          senderName: 'Aarav Sharma',
          time: 'Oct 14, 05:20 PM',
          text: 'Respected RJ Sir, in Exercise 8.2 Question 24, should we consider the elevation angle before or after the boat moves 40 meters?',
          read: true,
        },
        {
          id: 'MSG-02',
          sender: 'teacher',
          senderName: 'RJ Rana (Senior Academic Guide)',
          time: 'Oct 14, 06:05 PM',
          text: 'Dear Aarav, calculate the first right triangle projection before the displacement. Then apply tan(60°) to find the height. Both diagrams are valid as long as variables are defined.',
          read: true,
        },
        {
          id: 'MSG-03',
          sender: 'student',
          senderName: 'Aarav Sharma',
          time: 'Today, 10:15 AM',
          text: 'Thank you Sir! Will quadratic applications be in the 2nd terminal syllabus as well?',
          read: true,
        },
        {
          id: 'MSG-04',
          sender: 'teacher',
          senderName: 'RJ Rana (Senior Academic Guide)',
          time: 'Today, 10:30 AM',
          text: 'Yes Aarav, quadratic equations, matrices, and heights/distances are mandatory components. Focus on step proofs.',
          read: false,
        },
      ],

      // High-Tech Feature 3: Live In-App Notifications
      notifications: [
        {
          id: 'notif-1',
          title: 'Math Assignment Graded',
          body: 'RJ Rana evaluated your Unit 8 Trigonometry proof: Scored 19/20 (A+).',
          time: '12m ago',
          type: 'academic',
          read: false,
        },
        {
          id: 'notif-2',
          title: 'Tuition Fee Invoice Cleared',
          body: 'Official receipt RCP-2026-1049 generated for Ashwin tuition (NPR 8,500).',
          time: '1h ago',
          type: 'billing',
          read: false,
        },
        {
          id: 'notif-3',
          title: 'Morning Attendance Verified',
          body: 'Marked Present (Punctual) at 09:30 AM roll call.',
          time: '3h ago',
          type: 'attendance',
          read: true,
        },
      ],
    };
  });

  // Persist master state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error persisting school state:', e);
    }
  }, [data]);

  // Action: Mark Roll Call (Teacher -> Updates Student Portal Live)
  const submitTeacherRollCall = (updatedRoster, date) => {
    setData((prev) => {
      // Find current student in roster
      const studentMatch = updatedRoster.find((s) => s.rollNo === prev.student.rollNo);
      const newStatus = studentMatch ? studentMatch.attendanceStatus : 'present';

      // Update student's calendar
      const updatedCalendar = prev.attendanceCalendar.map((d) => {
        if (d.day === 15) {
          return {
            ...d,
            status: newStatus,
            note: studentMatch?.attendanceNote || 'Roll call updated by RJ Rana',
          };
        }
        return d;
      });

      const totalDays = 26;
      const presentCount = updatedCalendar.filter((d) => d.status === 'present').length;
      const absentCount = updatedCalendar.filter((d) => d.status === 'absent').length;
      const lateCount = updatedCalendar.filter((d) => d.status === 'late').length;
      const newPercentage = ((presentCount / totalDays) * 100).toFixed(1);

      return {
        ...prev,
        classRoster: updatedRoster,
        attendanceCalendar: updatedCalendar,
        student: {
          ...prev.student,
          attendancePercentage: Number(newPercentage),
          presentDays: presentCount,
          absentDays: absentCount,
          lateDays: lateCount,
        },
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: 'Attendance Roll Call Recorded',
            body: `RJ Rana submitted class roll call for ${date}. Marked as ${newStatus.toUpperCase()}.`,
            time: 'Just now',
            type: 'attendance',
            read: false,
          },
          ...prev.notifications,
        ],
      };
    });
  };

  // Action: Grade Student Assignment (Teacher -> Updates Student Report & Notification Live)
  const gradeStudentAssignment = (assignmentId, studentId, marks, feedback) => {
    setData((prev) => {
      const updatedAssignments = prev.assignments.map((asg) => {
        if (asg.id === assignmentId) {
          return {
            ...asg,
            status: 'graded',
            obtainedMarks: Number(marks),
            grade: Number(marks) >= 18 ? 'A+' : Number(marks) >= 16 ? 'A' : 'B+',
            teacherRemarks: feedback,
          };
        }
        return asg;
      });

      return {
        ...prev,
        assignments: updatedAssignments,
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: 'Homework Evaluation Published',
            body: `RJ Rana reviewed your submission: Awarded ${marks} marks with remarks: "${feedback}".`,
            time: 'Just now',
            type: 'academic',
            read: false,
          },
          ...prev.notifications,
        ],
      };
    });
  };

  // Action: Student Submits Homework (Student -> Updates Teacher Roster Live)
  const submitStudentHomework = (assignmentId, fileName, studentNote) => {
    setData((prev) => {
      const updatedAssignments = prev.assignments.map((asg) => {
        if (asg.id === assignmentId) {
          return {
            ...asg,
            status: 'submitted',
            studentFile: fileName,
            submissionDate: 'Just now (Oct 15, 2026)',
            studentNotes: studentNote,
          };
        }
        return asg;
      });

      return {
        ...prev,
        assignments: updatedAssignments,
        teacher: {
          ...prev.teacher,
          pendingGradingCount: prev.teacher.pendingGradingCount + 1,
        },
      };
    });
  };

  // Action: Pay Fee / Record Cashier Payment (Updates Both Student Ledger & Cashier Live)
  const recordFeePayment = (paymentRecord) => {
    setData((prev) => {
      const amountPaid = paymentRecord.amount;
      const updatedBills = {
        ...prev.bills,
        outstandingDues: Math.max(0, prev.bills.outstandingDues - amountPaid),
        totalPaidThisYear: prev.bills.totalPaidThisYear + amountPaid,
        currentInvoice: {
          ...prev.bills.currentInvoice,
          status: 'paid',
        },
        paymentHistory: [paymentRecord, ...prev.bills.paymentHistory],
      };

      return {
        ...prev,
        bills: updatedBills,
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: 'Payment Receipt Issued',
            body: `Receipt ${paymentRecord.refNo || paymentRecord.receiptNo} generated for NPR ${amountPaid.toLocaleString()} via ${paymentRecord.method}.`,
            time: 'Just now',
            type: 'billing',
            read: false,
          },
          ...prev.notifications,
        ],
      };
    });
  };

  // Action: Send Doubt Message
  const sendDoubtMessage = (sender, text) => {
    const newMsg = {
      id: `MSG-${Date.now().toString().slice(-4)}`,
      sender,
      senderName:
        sender === 'student' ? data.student.name : 'RJ Rana (Senior Academic Guide)',
      time: 'Just now',
      text,
      read: sender === 'teacher',
    };

    setData((prev) => ({
      ...prev,
      doubtsMessages: [...prev.doubtsMessages, newMsg],
    }));
  };

  // Action: Update Terminal Exam Marks (Teacher -> Updates Report Card Live)
  const updateExamMarksheet = (marksheetRoster) => {
    setData((prev) => {
      const studentMarks = marksheetRoster.find((s) => s.rollNo === prev.student.rollNo);
      if (!studentMarks) return { ...prev, classRoster: marksheetRoster };

      const theory = studentMarks.examTheory || 72;
      const practical = studentMarks.examPractical || 25;
      const total = theory + practical;
      const grade = total >= 90 ? 'A+' : total >= 80 ? 'A' : 'B+';
      const gpa = total >= 90 ? 4.0 : total >= 80 ? 3.6 : 3.2;

      const updatedSubjects = prev.reportCard.subjects.map((sub) => {
        if (sub.name.includes('Math')) {
          return {
            ...sub,
            theoryObtained: theory,
            practicalObtained: practical,
            totalObtained: total,
            grade,
            gpa,
            remarks: studentMarks.remarks || 'Consistent analytical focus',
          };
        }
        return sub;
      });

      return {
        ...prev,
        classRoster: marksheetRoster,
        reportCard: {
          ...prev.reportCard,
          subjects: updatedSubjects,
        },
      };
    });
  };

  // Action: Toggle Client License in Vendor Hub (Enforces Remote Lock on Alchemist Academy)
  const setSchoolLicenseStatus = (schoolId, newStatus) => {
    setData((prev) => {
      const updatedClients = prev.vendorData.clientSchools.map((s) => {
        if (s.id === schoolId) {
          return {
            ...s,
            status: newStatus,
          };
        }
        return s;
      });

      return {
        ...prev,
        vendorData: {
          ...prev.vendorData,
          clientSchools: updatedClients,
        },
      };
    });
  };

  // Current client instance license status (Alchemist Academy)
  const currentSchoolInstance = data.vendorData.clientSchools.find(
    (s) => s.domain === 'alchemist.edu.np'
  ) || {
    status: 'active',
    plan: 'pro',
    licenseKey: 'LIC-ALCH-PRO-2026-X81A',
  };

  return (
    <SchoolDataContext.Provider
      value={{
        schoolData: data,
        setSchoolData: setData,
        submitTeacherRollCall,
        gradeStudentAssignment,
        submitStudentHomework,
        recordFeePayment,
        sendDoubtMessage,
        updateExamMarksheet,
        setSchoolLicenseStatus,
        currentSchoolInstance,
      }}
    >
      {children}
    </SchoolDataContext.Provider>
  );
};

export const useSchoolData = () => {
  const ctx = useContext(SchoolDataContext);
  if (!ctx) throw new Error('useSchoolData must be used within SchoolDataProvider');
  return ctx;
};

