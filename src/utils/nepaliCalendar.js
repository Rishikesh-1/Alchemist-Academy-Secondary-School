// src/utils/nepaliCalendar.js
// AD (Gregorian) <-> BS (Bikram Sambat) Dual Calendar Engine & Nepali Numerals

export const NEPALI_MONTHS_EN = [
  'Baisakh',
  'Jestha',
  'Ashadh',
  'Shrawan',
  'Bhadra',
  'Ashwin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
];

export const NEPALI_MONTHS_NP = [
  'बैशाख',
  'जेठ',
  'असार',
  'साउन',
  'भदौ',
  'असोज',
  'कार्तिक',
  'मंसिर',
  'पुस',
  'माघ',
  'फागुन',
  'चैत',
];

export const NEPALI_DAYS_NP = [
  'आइतबार',
  'सोमबार',
  'मंगलबार',
  'बुधबार',
  'बिहीबार',
  'शुक्रबार',
  'शनिबार',
];

export const NEPALI_DAYS_EN = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const NEPALI_NUMERALS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

/**
 * Convert English Arabic numerals (0-9) to Nepali Devanagari numerals (०-९)
 */
export function toNepaliNumerals(num) {
  if (num === null || num === undefined) return '';
  return String(num).replace(/[0-9]/g, (digit) => NEPALI_NUMERALS[parseInt(digit, 10)]);
}

/**
 * Approximate conversion from AD date (YYYY-MM-DD) to Bikram Sambat (BS)
 * Bikram Sambat is approximately +56 years 8 months ahead of Gregorian
 */
export function convertAdToBs(adDateString) {
  if (!adDateString) return '';
  const d = new Date(adDateString);
  if (isNaN(d.getTime())) return adDateString;

  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12
  const day = d.getDate();

  // Reference offset: Jan-April is +56 years, May-Dec is +57 years
  let bsYear = year + 57;
  let bsMonth = (month + 8) % 12 || 12;
  let bsDay = day + 13;

  if (month <= 4) {
    bsYear = year + 56;
  }
  if (bsDay > 30) {
    bsDay -= 30;
  }

  const pad = (n) => String(n).padStart(2, '0');
  return `${bsYear}-${pad(bsMonth)}-${pad(bsDay)}`;
}

/**
 * Format date showing both AD and BS
 * e.g., "2026-10-16 AD (२०८३-०६-२९ BS)"
 */
export function formatDualDate(adDateString, lang = 'en') {
  if (!adDateString) return '—';
  const bs = convertAdToBs(adDateString);
  if (lang === 'ne') {
    return `${toNepaliNumerals(bs)} वि.सं. (${adDateString} ई.सं.)`;
  }
  return `${adDateString} AD (${bs} BS)`;
}

