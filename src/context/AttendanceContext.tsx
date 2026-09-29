import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  ClassGroup,
  Student,
  AbsenceRecord,
  DashboardFilter,
  EducationLevel,
} from '../types';
import {
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_ABSENCES,
} from '../data/mockData';
import {
  getTodayDateString,
  getWeekStartAndEnd,
  getMonthStartAndEnd,
  isDateInRange,
} from '../utils/dateUtils';

interface AttendanceContextType {
  classes: ClassGroup[];
  students: Student[];
  absences: AbsenceRecord[];
  dashboardFilter: DashboardFilter;
  setDashboardFilter: React.Dispatch<React.SetStateAction<DashboardFilter>>;
  activeTab: 'dashboard' | 'students' | 'fast_entry' | 'data_management';
  setActiveTab: (tab: 'dashboard' | 'students' | 'fast_entry' | 'data_management') => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  addAbsence: (data: Omit<AbsenceRecord, 'id' | 'createdAt'>) => AbsenceRecord;
  batchAddAbsences: (items: Array<Omit<AbsenceRecord, 'id' | 'createdAt'>>) => void;
  updateAbsence: (id: string, updates: Partial<AbsenceRecord>) => void;
  deleteAbsence: (id: string) => void;
  toggleAbsenceJustification: (id: string, reason?: string) => void;
  resetToSampleData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => { success: boolean; error?: string };
  exportCSVReport: (recordsToExport?: AbsenceRecord[]) => void;
  filteredAbsences: AbsenceRecord[];
  allLevels: { id: EducationLevel; label: string }[];
}

const STORAGE_KEY = 'school_attendance_app_v1';

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<ClassGroup[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_classes`);
      return saved ? JSON.parse(saved) : INITIAL_CLASSES;
    } catch {
      return INITIAL_CLASSES;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [absences, setAbsences] = useState<AbsenceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_absences`);
      return saved ? JSON.parse(saved) : INITIAL_ABSENCES;
    } catch {
      return INITIAL_ABSENCES;
    }
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'fast_entry' | 'data_management'>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const today = getTodayDateString();

  const [dashboardFilter, setDashboardFilter] = useState<DashboardFilter>({
    level: 'all',
    classId: 'all',
    timeMode: 'this_month',
    specificDate: today,
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    selectedMonth: '2026-09',
    selectedMonths: ['2026-09'],
    justificationStatus: 'all',
    searchQuery: '',
  });

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_classes`, JSON.stringify(classes));
      localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
      localStorage.setItem(`${STORAGE_KEY}_absences`, JSON.stringify(absences));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [classes, students, absences]);

  const allLevels: { id: EducationLevel; label: string }[] = [
    { id: '1APIC', label: 'الأولى إعدادي (1APIC)' },
    { id: '2APIC', label: 'الثانية إعدادي (2APIC)' },
    { id: '3APIC', label: 'الثالثة إعدادي (3APIC)' },
  ];

  const addAbsence = (data: Omit<AbsenceRecord, 'id' | 'createdAt'>): AbsenceRecord => {
    const newRecord: AbsenceRecord = {
      ...data,
      id: 'abs-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
    };
    setAbsences(prev => [newRecord, ...prev]);
    return newRecord;
  };

  const batchAddAbsences = (items: Array<Omit<AbsenceRecord, 'id' | 'createdAt'>>) => {
    const timestamp = new Date().toISOString();
    const newRecords: AbsenceRecord[] = items.map((item, idx) => ({
      ...item,
      id: 'abs-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: timestamp,
    }));
    setAbsences(prev => [...newRecords, ...prev]);
  };

  const updateAbsence = (id: string, updates: Partial<AbsenceRecord>) => {
    setAbsences(prev =>
      prev.map(item =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      )
    );
  };

  const deleteAbsence = (id: string) => {
    setAbsences(prev => prev.filter(item => item.id !== id));
  };

  const toggleAbsenceJustification = (id: string, reason?: string) => {
    setAbsences(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const nowJustified = !item.isJustified;
        return {
          ...item,
          isJustified: nowJustified,
          justificationReason: nowJustified ? reason || 'تم الإدلاء بمبرر مقبول' : undefined,
          justificationDate: nowJustified ? getTodayDateString() : undefined,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const resetToSampleData = () => {
    setClasses(INITIAL_CLASSES);
    setStudents(INITIAL_STUDENTS);
    setAbsences(INITIAL_ABSENCES);
    try {
      localStorage.removeItem(`${STORAGE_KEY}_classes`);
      localStorage.removeItem(`${STORAGE_KEY}_students`);
      localStorage.removeItem(`${STORAGE_KEY}_absences`);
    } catch (e) {
      console.error(e);
    }
  };

  const exportDataJSON = (): string => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      classes,
      students,
      absences,
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJSON = (jsonString: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.absences)) {
        return { success: false, error: 'صيغة الملف غير متوافقة (تأكد من وجود سجلات الغياب)' };
      }
      if (Array.isArray(parsed.classes) && parsed.classes.length > 0) {
        setClasses(parsed.classes);
      }
      if (Array.isArray(parsed.students) && parsed.students.length > 0) {
        setStudents(parsed.students);
      }
      setAbsences(parsed.absences);
      return { success: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'خطأ غير معروف في قراءة JSON';
      return { success: false, error: errorMsg };
    }
  };

  // CSV Report Generator
  const exportCSVReport = (recordsToExport?: AbsenceRecord[]) => {
    const records = recordsToExport || filteredAbsences;
    const studentMap = new Map(students.map(s => [s.id, s]));
    const classMap = new Map(classes.map(c => [c.id, c]));

    const headers = [
      'رقم مسار',
      'اسم التلميذ الكامل',
      'القسم',
      'المستوى',
      'التاريخ',
      'الحصة',
      'المادة',
      'حالة الغياب',
      'سبب التبرير',
      'ملاحظات',
    ];

    const rows = records.map(record => {
      const st = studentMap.get(record.studentId);
      const cl = classMap.get(record.classId);
      return [
        `"${record.studentId}"`,
        `"${st ? st.fullName : ''}"`,
        `"${cl ? cl.name : record.classId}"`,
        `"${cl ? cl.levelLabel : ''}"`,
        `"${record.date}"`,
        `"${record.session}"`,
        `"${record.subject}"`,
        `"${record.isJustified ? 'مبرر' : 'غير مبرر'}"`,
        `"${record.justificationReason || ''}"`,
        `"${record.note || ''}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_الغياب_المدرسي_${getTodayDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute filtered absences dynamically
  const filteredAbsences = useMemo(() => {
    const classMap = new Map(classes.map(c => [c.id, c]));
    const studentMap = new Map(students.map(s => [s.id, s]));

    return absences.filter(record => {
      const student = studentMap.get(record.studentId);
      const classObj = classMap.get(record.classId);

      // Level filter
      if (dashboardFilter.level !== 'all') {
        if (!classObj || classObj.level !== dashboardFilter.level) {
          return false;
        }
      }

      // Class filter
      if (dashboardFilter.classId !== 'all') {
        if (record.classId !== dashboardFilter.classId) {
          return false;
        }
      }

      // Justification status filter
      if (dashboardFilter.justificationStatus === 'justified' && !record.isJustified) {
        return false;
      }
      if (dashboardFilter.justificationStatus === 'unjustified' && record.isJustified) {
        return false;
      }

      // Time Filter Mode
      const recordDate = record.date;
      if (dashboardFilter.timeMode === 'today') {
        if (recordDate !== today) return false;
      } else if (dashboardFilter.timeMode === 'specific_day') {
        if (dashboardFilter.specificDate && recordDate !== dashboardFilter.specificDate) {
          return false;
        }
      } else if (dashboardFilter.timeMode === 'this_week') {
        const { start, end } = getWeekStartAndEnd(today);
        if (!isDateInRange(recordDate, start, end)) return false;
      } else if (dashboardFilter.timeMode === 'specific_week') {
        if (dashboardFilter.startDate && dashboardFilter.endDate) {
          if (!isDateInRange(recordDate, dashboardFilter.startDate, dashboardFilter.endDate)) {
            return false;
          }
        }
      } else if (dashboardFilter.timeMode === 'this_month') {
        const ym = today.slice(0, 7);
        const { start, end } = getMonthStartAndEnd(ym);
        if (!isDateInRange(recordDate, start, end)) return false;
      } else if (dashboardFilter.timeMode === 'specific_month') {
        if (dashboardFilter.selectedMonth) {
          const { start, end } = getMonthStartAndEnd(dashboardFilter.selectedMonth);
          if (!isDateInRange(recordDate, start, end)) return false;
        }
      } else if (dashboardFilter.timeMode === 'multi_months') {
        if (dashboardFilter.selectedMonths && dashboardFilter.selectedMonths.length > 0) {
          const recordYM = recordDate.slice(0, 7);
          if (!dashboardFilter.selectedMonths.includes(recordYM)) return false;
        }
      } else if (dashboardFilter.timeMode === 'custom_range') {
        if (!isDateInRange(recordDate, dashboardFilter.startDate, dashboardFilter.endDate)) {
          return false;
        }
      }

      // Search query in dashboard if any
      if (dashboardFilter.searchQuery && dashboardFilter.searchQuery.trim() !== '') {
        const q = dashboardFilter.searchQuery.toLowerCase().trim();
        const studentName = student ? student.fullName.toLowerCase() : '';
        const studentId = record.studentId.toLowerCase();
        const subject = record.subject.toLowerCase();
        if (!studentName.includes(q) && !studentId.includes(q) && !subject.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [absences, classes, students, dashboardFilter, today]);

  return (
    <AttendanceContext.Provider
      value={{
        classes,
        students,
        absences,
        dashboardFilter,
        setDashboardFilter,
        activeTab,
        setActiveTab,
        selectedStudentId,
        setSelectedStudentId,
        addAbsence,
        batchAddAbsences,
        updateAbsence,
        deleteAbsence,
        toggleAbsenceJustification,
        resetToSampleData,
        exportDataJSON,
        importDataJSON,
        exportCSVReport,
        filteredAbsences,
        allLevels,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
