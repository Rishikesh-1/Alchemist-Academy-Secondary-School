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

