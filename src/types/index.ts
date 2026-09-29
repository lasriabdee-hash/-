export type EducationLevel = '1APIC' | '2APIC' | '3APIC';

export interface ClassGroup {
  id: string;
  name: string; // e.g. "1APIC-1", "1APIC-2", "2APIC-10", "3APIC-1"
  level: EducationLevel;
  levelLabel: string; // "الأولى إعدادي", "الثانية إعدادي", "الثالثة إعدادي"
  room?: string;
  tutorTeacher?: string;
}

export interface Student {
  id: string; // Massar code e.g. "R180039027"
  firstName: string; // الاسم الشخصي
  lastName: string; // الاسم العائلي
  fullName: string;
  gender: 'M' | 'F';
  classId: string;
  level: EducationLevel;
  orderInClass: number; // رقم الترتيب بالقسم 1-40
  birthDate?: string;
  guardianPhone?: string;
}

export type SessionPeriod = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8';

export interface SessionInfo {
  id: SessionPeriod;
  label: string; // "الحصة 1 (08:30 - 09:30)"
  time: string; // "08:30 - 09:30"
  timeShort: string; // "08:30"
  periodNumber: number; // 1 to 8
  isMorning: boolean;
}

export const SESSION_PERIODS: SessionInfo[] = [
  { id: 'S1', label: 'الحصة 1 (08:30 - 09:30)', time: '08:30 - 09:30', timeShort: '08:30', periodNumber: 1, isMorning: true },
  { id: 'S2', label: 'الحصة 2 (09:30 - 10:30)', time: '09:30 - 10:30', timeShort: '09:30', periodNumber: 2, isMorning: true },
  { id: 'S3', label: 'الحصة 3 (10:30 - 11:30)', time: '10:30 - 11:30', timeShort: '10:30', periodNumber: 3, isMorning: true },
  { id: 'S4', label: 'الحصة 4 (11:30 - 12:30)', time: '11:30 - 12:30', timeShort: '11:30', periodNumber: 4, isMorning: true },
  { id: 'S5', label: 'الحصة 5 (14:30 - 15:30)', time: '14:30 - 15:30', timeShort: '14:30', periodNumber: 5, isMorning: false },
  { id: 'S6', label: 'الحصة 6 (15:30 - 16:30)', time: '15:30 - 16:30', timeShort: '15:30', periodNumber: 6, isMorning: false },
  { id: 'S7', label: 'الحصة 7 (16:30 - 17:30)', time: '16:30 - 17:30', timeShort: '16:30', periodNumber: 7, isMorning: false },
  { id: 'S8', label: 'الحصة 8 (17:30 - 18:30)', time: '17:30 - 18:30', timeShort: '17:30', periodNumber: 8, isMorning: false },
];

export interface AbsenceRecord {
  id: string; // unique UUID
  studentId: string; // Massar code
  classId: string;
  date: string; // YYYY-MM-DD
  session: SessionPeriod;
  subject: string; // e.g. "الرياضيات", "اللغة العربية"
  isJustified: boolean; // مبرر أم غير مبرر
  justificationReason?: string; // e.g. "شهادة طبية", "إذن إدارة", "ظرف عائلي"
  justificationDate?: string; // تاريخ الإدلاء بالتبرير
  note?: string; // ملاحظات إضافية
  createdAt: string;
  updatedAt?: string;
}

export type TimeFilterMode =
  | 'today'
  | 'specific_day'
  | 'this_week'
  | 'specific_week'
  | 'custom_range'
  | 'this_month'
  | 'specific_month'
  | 'multi_months'
  | 'all';

export interface DashboardFilter {
  level: 'all' | EducationLevel;
  classId: 'all' | string;
  timeMode: TimeFilterMode;
  specificDate?: string; // YYYY-MM-DD
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  selectedMonth?: string; // YYYY-MM
  selectedMonths?: string[]; // ["2026-09", "2026-10", ...]
  justificationStatus: 'all' | 'justified' | 'unjustified';
  searchQuery?: string;
}

export interface StudentFilter {
  level: 'all' | EducationLevel;
  classId: string; // specific class selected or 'all'
  searchQuery: string; // name or Massar code
  onlyWithAbsences: boolean;
}
