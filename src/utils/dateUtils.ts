export const MOROCCAN_MONTHS: { [key: number]: string } = {
  1: 'يناير',
  2: 'فبراير',
  3: 'مارس',
  4: 'أبريل',
  5: 'ماي',
  6: 'يونيو',
  7: 'يوليوز',
  8: 'غشت',
  9: 'شتنبر',
  10: 'أكتوبر',
  11: 'نونبر',
  12: 'دجنبر',
};

export const ARABIC_DAYS: { [key: number]: string } = {
  0: 'الأحد',
  1: 'الإثنين',
  2: 'الثلاثاء',
  3: 'الأربعاء',
  4: 'الخميس',
  5: 'الجمعة',
  6: 'السبت',
};

export function getArabicDayName(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return ARABIC_DAYS[d.getDay()] || '';
}

export function formatArabicDate(dateStr: string, includeDayName = true): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  const monthName = MOROCCAN_MONTHS[month] || parts[1];
  const dayName = includeDayName ? getArabicDayName(dateStr) + ' ' : '';
  return `${dayName}${day} ${monthName} ${year}`;
}

export function getTodayDateString(): string {
  // Use 2026-09-29 as reference or real current date
  const now = new Date();
  // If year is 2026, format as YYYY-MM-DD
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getWeekStartAndEnd(dateStr: string): { start: string; end: string } {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday
  // In Moroccan schools, week starts on Monday (1) and ends on Saturday (6)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const dayNum = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${dayNum}`;
  };

  return {
    start: formatDate(monday),
    end: formatDate(saturday),
  };
}

export function getMonthStartAndEnd(yearMonth: string): { start: string; end: string } {
  // yearMonth is "YYYY-MM"
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const lastDay = new Date(year, month, 0).getDate();
  const mStr = String(month).padStart(2, '0');

  return {
    start: `${year}-${mStr}-01`,
    end: `${year}-${mStr}-${String(lastDay).padStart(2, '0')}`,
  };
}

export function isDateInRange(targetDate: string, startDate?: string, endDate?: string): boolean {
  if (!startDate && !endDate) return true;
  if (startDate && targetDate < startDate) return false;
  if (endDate && targetDate > endDate) return false;
  return true;
}
