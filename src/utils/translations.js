// src/utils/translations.js
// Bilingual English & Nepali UI dictionary for School Management System

export const TRANSLATIONS = {
  en: {
    // Header & Global
    sms_title: 'School Management System (SMS)',
    academic_session: 'Academic Session',
    main_campus: 'Main Campus',
    branch_switcher: 'Active Branch',
    sign_out: 'Sign Out',
    website_cms: 'Website CMS',
    public_site: 'Public Site',
    light_mode: 'Light Mode',
    dark_mode: 'Dark Mode',
    language: 'Language',

    // Roles
    superadmin: 'Platform Director',
    admin: 'School Administrator',
    principal: 'Principal / Headmaster',
    teacher: 'Faculty Teacher',
    accountant: 'Bursar & Accountant',
    librarian: 'Librarian',
    parent: 'Guardian / Parent',
    student: 'Student',

    // Navigation Tabs
    crm: 'Admissions & CRM',
    sis: 'Student Profiles & TC',
    attendance: 'Attendance & Timetable',
    cashier: 'Fees & Defaulters',
    grading: 'CDC & NEB Grading Engine',
    library: 'Library Catalog',
    transport: 'Transport Transit',
    payroll: 'Staff Payroll',
    audit: 'Audit Trail Logs',

    // Actions & Buttons
    search: 'Search...',
    filter: 'Filter',
    add_student: 'Register Student',
    bulk_import_csv: 'Bulk Import CSV',
    promote_students: 'Promote Class',
    issue_tc: 'Issue Transfer Certificate',
    mark_attendance: 'Submit Attendance',
    send_absence_alerts: 'Send Absence Alerts to Parents',
    collect_fee: 'Receive Fee Payment',
    generate_receipt: 'Print Official Receipt',
    send_fee_reminders: 'Send Due Reminders',
    clash_check: 'Check Timetable Clash',
    save_marks: 'Save Student Marks',
    print_report_card: 'Print CDC Report Card',
    publish_merit_list: 'Publish Merit List',
    generate_payslips: 'Generate Monthly Payslips',

    // Statuses
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    paid: 'Paid',
    unpaid: 'Unpaid',
    partial: 'Partial',
    active: 'Active',
    transferred: 'Transferred',
    graduated: 'Graduated',
    outstanding: 'Outstanding',
  },

  ne: {
    // Header & Global
    sms_title: 'विद्यालय तथा क्याम्पस व्यवस्थापन प्रणाली (SMS)',
    academic_session: 'शैक्षिक सत्र',
    main_campus: 'मुख्य क्याम्पस',
    branch_switcher: 'सक्रिय शाखा',
    sign_out: 'लगआउट गर्नुहोस्',
    website_cms: 'वेबसाइट CMS',
    public_site: 'सार्वजनिक वेबसाइट',
    light_mode: 'उज्यालो मोड',
    dark_mode: 'अँध्यारो मोड',
    language: 'भाषा',

    // Roles
    superadmin: 'प्लेटफर्म निर्देशक',
    admin: 'विद्यालय प्रशासक',
    principal: 'प्रधानाध्यापक / प्रिन्सिपल',
    teacher: 'विषय शिक्षक',
    accountant: 'लेखापाल तथा क्यासियर',
    librarian: 'पुस्तकालय प्रमुख',
    parent: 'अभिभावक',
    student: 'विद्यार्थी',

    // Navigation Tabs
    crm: 'भर्ना तथा CRM',
    sis: 'विद्यार्थी विवरण तथा चारित्रिक प्रमाणपत्र (TC)',
    attendance: 'दैनिक/घण्टी हाजिरी तथा समयतालिका',
    cashier: 'शुल्क संकलन तथा बाँकी बक्यौता',
    grading: 'पाठ्यक्रम विकास केन्द्र (CDC) ग्रेडिङ',
    library: 'पुस्तकालय तथा पुस्तक वितरण',
    transport: 'यातायात तथा बस सेवा',
    payroll: 'कर्मचारी तलब तथा भुक्तानी',
    audit: 'अपरिवर्तनीय अडिट लग',

    // Actions & Buttons
    search: 'खोज्नुहोस्...',
    filter: 'छान्नुहोस्',
    add_student: 'नयाँ विद्यार्थी दर्ता',
    bulk_import_csv: 'CSV बाट एकमुष्ट आयात',
    promote_students: 'कक्षा पदोन्नति गर्नुहोस्',
    issue_tc: 'स्थानान्तरण प्रमाणपत्र (TC) जारी',
    mark_attendance: 'हाजिरी सुरक्षित गर्नुहोस्',
    send_absence_alerts: 'अभिभावकलाई अनुपस्थित सन्देश पठाउनुहोस्',
    collect_fee: 'शुल्क भुक्तानी लिनुहोस्',
    generate_receipt: 'आधिकारिक रसिद प्रिन्ट',
    send_fee_reminders: 'बक्यौता ताकेता सन्देश पठाउनुहोस्',
    clash_check: 'समयतालिका जुध्ने जाँच',
    save_marks: 'प्राप्ताङ्क प्रविष्टि गर्नुहोस्',
    print_report_card: 'CDC ग्रेडसिट प्रिन्ट गर्नुहोस्',
    publish_merit_list: 'योग्यता क्रम सूची (Merit List) प्रकाशन',
    generate_payslips: 'मासिक तलब विवरण तयार गर्नुहोस्',

    // Statuses
    present: 'उपस्थित',
    absent: 'अनुपस्थित',
    late: 'ढिलो',
    paid: 'भुक्तानी सम्पन्न',
    unpaid: 'बाँकी',
    partial: 'आंशिक',
    active: 'सक्रिय',
    transferred: 'स्थानान्तरित (TC)',
    graduated: 'उत्तीर्ण',
    outstanding: 'कुल बाँकी',
  },
};

export function getTranslation(key, lang = 'en') {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
}
