// src/services/api.js
// Client API layer communicating with cPanel PHP backend & SQLite/MySQL

// Determine API Base URL
// In production or local Apache/cPanel: "/api"
// In Vite dev (port 5173): falls back to current host or proxy
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const CURRENT_SCHOOL_ID = 1;

/**
 * 1. Fetch Site Settings from MySQL
 */
export async function fetchSiteSettings(schoolId = CURRENT_SCHOOL_ID) {
  try {
    const res = await fetch(`${API_BASE_URL}/site-settings.php?school_id=${schoolId}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data.success && data.data?.settings) {
      return data.data.settings;
    }
  } catch (err) {
    console.warn('Backend site-settings unavailable; using local cache/defaults:', err.message);
  }
  return null;
}

/**
 * 2. Save Site Settings to MySQL
 */
export async function saveSiteSettings(settingsPayload, schoolId = CURRENT_SCHOOL_ID) {
  try {
    const res = await fetch(`${API_BASE_URL}/site-settings.php?school_id=${schoolId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-School-Id': String(schoolId),
      },
      body: JSON.stringify(settingsPayload),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error saving site settings to server:', err);
    return { success: false, message: err.message };
  }
}

/**
 * 3. Upload File to /uploads/{school_id}/
 */
export async function uploadMediaFile(file, metadata = {}, schoolId = CURRENT_SCHOOL_ID) {
  const formData = new FormData();
  formData.append('file', file);
  if (metadata.title) formData.append('title', metadata.title);
  if (metadata.altText) formData.append('altText', metadata.altText);
  if (metadata.category) formData.append('category', metadata.category);
  if (metadata.tags) formData.append('tags', metadata.tags);

  try {
    const res = await fetch(`${API_BASE_URL}/upload.php`, {
      method: 'POST',
      headers: {
        'X-School-Id': String(schoolId),
      },
      body: formData,
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Upload error:', err);
    return { success: false, message: err.message };
  }
}

/**
 * 4. Submit Admission Lead
 */
export async function submitAdmissionInquiry(inquiryData, schoolId = CURRENT_SCHOOL_ID) {
  try {
    const res = await fetch(`${API_BASE_URL}/admissions.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-School-Id': String(schoolId),
      },
      body: JSON.stringify(inquiryData),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Inquiry submission error:', err);
    return { success: false, message: err.message };
  }
}

/**
 * 5. Fetch Admission Inquiries for Dashboard CRM
 */
export async function fetchAdmissionInquiries(status = null, schoolId = CURRENT_SCHOOL_ID) {
  try {
    let url = `${API_BASE_URL}/admissions.php?school_id=${schoolId}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.success && data.data?.inquiries) {
      return data.data.inquiries;
    }
  } catch (err) {
    console.warn('Failed to fetch inquiries:', err.message);
  }
  return [];
}

/**
 * 6. Update Inquiry Lead Status
 */
export async function updateInquiryStatus(inquiryId, leadStatus, counselorNotes = null, schoolId = CURRENT_SCHOOL_ID) {
  try {
    const res = await fetch(`${API_BASE_URL}/admissions.php`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-School-Id': String(schoolId),
      },
      body: JSON.stringify({
        id: inquiryId,
        lead_status: leadStatus,
        counselor_notes: counselorNotes,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error('Update status error:', err);
    return { success: false, message: err.message };
  }
}

// -------------------------------------------------------------
// TOKEN & AUTHENTICATED REQUEST HELPERS
// -------------------------------------------------------------
const TOKEN_STORAGE_KEY = '_aa_jwt_token_v2';

export function getAuthToken() {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem(TOKEN_STORAGE_KEY) || null;
}

export function setAuthToken(token, persist = false) {
  if (token) {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    if (persist) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

export function clearAuthToken() {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    'X-School-Id': String(CURRENT_SCHOOL_ID),
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({ success: false, message: 'Invalid response from server' }));
  return data;
}

// -------------------------------------------------------------
// 7. Multi-Tenant Auth & User Profile API
// -------------------------------------------------------------
export async function apiLogin(username, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-School-Id': String(CURRENT_SCHOOL_ID),
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success && data.data?.token) {
      setAuthToken(data.data.token);
    }
    return data;
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, message: err.message };
  }
}

export async function apiGetCurrentUser() {
  return fetchWithAuth(`${API_BASE_URL}/auth/me.php`);
}

// -------------------------------------------------------------
// 8. Branches & School Context
// -------------------------------------------------------------
export async function fetchBranches(schoolId = CURRENT_SCHOOL_ID) {
  return fetchWithAuth(`${API_BASE_URL}/schools/branches.php?school_id=${schoolId}`);
}

// -------------------------------------------------------------
// 9. Student Profiles, CSV Bulk Import, Promotions & TC
// -------------------------------------------------------------
export async function fetchStudents(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchWithAuth(`${API_BASE_URL}/students/index.php?${query}`);
}

export async function registerStudent(studentData) {
  return fetchWithAuth(`${API_BASE_URL}/students/index.php`, {
    method: 'POST',
    body: JSON.stringify(studentData),
  });
}

export async function importStudentsCsv(rows) {
  return fetchWithAuth(`${API_BASE_URL}/students/import_csv.php`, {
    method: 'POST',
    body: JSON.stringify({ rows }),
  });
}

export async function promoteStudents(payload) {
  return fetchWithAuth(`${API_BASE_URL}/students/promote.php`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchTransferCertificates(studentId = null, tcNumber = null) {
  let url = `${API_BASE_URL}/students/transfer_certificate.php?`;
  if (studentId) url += `student_id=${studentId}&`;
  if (tcNumber) url += `tc_number=${encodeURIComponent(tcNumber)}`;
  return fetchWithAuth(url);
}

export async function issueTransferCertificate(payload) {
  return fetchWithAuth(`${API_BASE_URL}/students/transfer_certificate.php`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// -------------------------------------------------------------
// 10. Attendance & Absence Alerts
// -------------------------------------------------------------
export async function fetchAttendance(date, classId = null, type = 'daily') {
  let url = `${API_BASE_URL}/attendance/index.php?date=${date}&type=${type}`;
  if (classId) url += `&class_id=${classId}`;
  return fetchWithAuth(url);
}

export async function saveAttendance(date, records, type = 'daily') {
  return fetchWithAuth(`${API_BASE_URL}/attendance/index.php`, {
    method: 'POST',
    body: JSON.stringify({ date, records, attendance_type: type }),
  });
}

export async function sendAbsenceAlerts(date, classId = null, channel = 'sms') {
  return fetchWithAuth(`${API_BASE_URL}/attendance/alerts.php`, {
    method: 'POST',
    body: JSON.stringify({ date, class_id: classId, channel }),
  });
}

// -------------------------------------------------------------
// 11. Fees, Invoices, Receipts & Defaulters
// -------------------------------------------------------------
export async function fetchFeeStructures() {
  return fetchWithAuth(`${API_BASE_URL}/fees/structures.php`);
}

export async function collectFeePayment(paymentData) {
  return fetchWithAuth(`${API_BASE_URL}/fees/collect.php`, {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
}

export async function fetchFeeReceipts(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchWithAuth(`${API_BASE_URL}/fees/collect.php?${query}`);
}

export async function fetchFeeDefaulters() {
  return fetchWithAuth(`${API_BASE_URL}/fees/defaulters.php`);
}

export async function sendFeeDueReminders(invoiceIds, channel = 'sms') {
  return fetchWithAuth(`${API_BASE_URL}/fees/defaulters.php`, {
    method: 'POST',
    body: JSON.stringify({ invoice_ids: invoiceIds, channel }),
  });
}

// -------------------------------------------------------------
// 12. Timetable & Clash Validation
// -------------------------------------------------------------
export async function fetchTimetable(classId = null, teacherId = null) {
  let url = `${API_BASE_URL}/timetable/index.php?`;
  if (classId) url += `class_id=${classId}&`;
  if (teacherId) url += `teacher_id=${teacherId}`;
  return fetchWithAuth(url);
}

export async function saveTimetableSlot(slotData) {
  return fetchWithAuth(`${API_BASE_URL}/timetable/index.php`, {
    method: 'POST',
    body: JSON.stringify(slotData),
  });
}

// -------------------------------------------------------------
// 13. Exams, CDC Marks & Report Cards
// -------------------------------------------------------------
export async function fetchExams(examId = null, classId = null, subjectId = null) {
  let url = `${API_BASE_URL}/exams/index.php?`;
  if (examId) url += `exam_id=${examId}&`;
  if (classId) url += `class_id=${classId}&`;
  if (subjectId) url += `subject_id=${subjectId}`;
  return fetchWithAuth(url);
}

export async function saveExamMarks(examId, classId, subjectId, entries) {
  return fetchWithAuth(`${API_BASE_URL}/exams/index.php`, {
    method: 'POST',
    body: JSON.stringify({ action: 'save_marks', exam_id: examId, class_id: classId, subject_id: subjectId, entries }),
  });
}

export async function fetchReportCard(studentId, examId) {
  return fetchWithAuth(`${API_BASE_URL}/exams/report_card.php?student_id=${studentId}&exam_id=${examId}`);
}

// -------------------------------------------------------------
// 14. Admissions Merit Lists
// -------------------------------------------------------------
export async function fetchAdmissionsMeritList(classId = null) {
  let url = `${API_BASE_URL}/admissions/merit_list.php?`;
  if (classId) url += `class_id=${classId}`;
  return fetchWithAuth(url);
}

export async function publishMeritList(title, classId, quota = 'Open Merit') {
  return fetchWithAuth(`${API_BASE_URL}/admissions/merit_list.php`, {
    method: 'POST',
    body: JSON.stringify({ action: 'publish_merit_list', title, class_id: classId, quota }),
  });
}

// -------------------------------------------------------------
// 15. Operations: Library, Transport & Payroll
// -------------------------------------------------------------
export async function fetchLibraryData() {
  return fetchWithAuth(`${API_BASE_URL}/operations/library.php`);
}

export async function issueLibraryBook(bookId, studentId, dueDays = 14) {
  return fetchWithAuth(`${API_BASE_URL}/operations/library.php`, {
    method: 'POST',
    body: JSON.stringify({ action: 'issue_book', book_id: bookId, student_id: studentId, due_days: dueDays }),
  });
}

export async function returnLibraryBook(issueId, finePaid = 0) {
  return fetchWithAuth(`${API_BASE_URL}/operations/library.php`, {
    method: 'POST',
    body: JSON.stringify({ action: 'return_book', issue_id: issueId, fine_paid: finePaid }),
  });
}

export async function fetchTransportData() {
  return fetchWithAuth(`${API_BASE_URL}/operations/transport.php`);
}

export async function fetchPayrollData(month = null, year = null) {
  let url = `${API_BASE_URL}/operations/payroll.php?`;
  if (month) url += `month=${month}&`;
  if (year) url += `year=${year}`;
  return fetchWithAuth(url);
}

export async function generateMonthlyPayroll(month, year) {
  return fetchWithAuth(`${API_BASE_URL}/operations/payroll.php`, {
    method: 'POST',
    body: JSON.stringify({ action: 'generate_monthly_slips', month, year }),
  });
}

// -------------------------------------------------------------
// 16. Audit Trail & Notifications
// -------------------------------------------------------------
export async function fetchAuditLogs(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchWithAuth(`${API_BASE_URL}/audit/index.php?${query}`);
}

export async function fetchNotifications() {
  return fetchWithAuth(`${API_BASE_URL}/notifications/index.php`);
}

