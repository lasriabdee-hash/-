import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Filter,
  BarChart3,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Layers,
  ArrowRight,
  Search,
  RotateCcw,
  BookOpen,
  PieChart,
  Flame,
  Activity,
  Lightbulb,
  Info,
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { EducationLevel, SESSION_PERIODS, TimeFilterMode } from '../types';
import {
  formatArabicDate,
  getArabicDayName,
  getTodayDateString,
  MOROCCAN_MONTHS,
} from '../utils/dateUtils';
import { SCHOOL_SUBJECTS } from '../data/mockData';

interface DashboardViewProps {
  onSelectStudent: (studentId: string) => void;
  onSelectClassInStudentsView: (classId: string, level: EducationLevel | 'all') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectStudent,
  onSelectClassInStudentsView,
}) => {
  const {
    classes,
    students,
    allLevels,
    dashboardFilter,
    setDashboardFilter,
    filteredAbsences,
    absences,
    exportCSVReport,
  } = useAttendance();

  const todayStr = getTodayDateString();

  // Classes filtered by current selected level
  const availableClasses = useMemo(() => {
    if (dashboardFilter.level === 'all') return classes;
    return classes.filter(c => c.level === dashboardFilter.level);
  }, [classes, dashboardFilter.level]);

  // Statistics Computations
  const totalHours = filteredAbsences.length;
  const unjustifiedHours = filteredAbsences.filter(a => !a.isJustified).length;
  const justifiedHours = filteredAbsences.filter(a => a.isJustified).length;
  const unjustifiedPercentage = totalHours > 0 ? Math.round((unjustifiedHours / totalHours) * 100) : 0;
  const justifiedPercentage = totalHours > 0 ? Math.round((justifiedHours / totalHours) * 100) : 0;

  // Unique absent students
  const uniqueAbsentStudentIds = useMemo(() => {
    return new Set(filteredAbsences.map(a => a.studentId));
  }, [filteredAbsences]);

  // Class by class statistics
  const classStats = useMemo(() => {
    const map = new Map<
      string,
      {
        classId: string;
        className: string;
        level: EducationLevel;
        levelLabel: string;
        studentCount: number;
        totalAbsences: number;
        unjustified: number;
        justified: number;
        absentStudentsCount: number;
      }
    >();

    availableClasses.forEach(cl => {
      const classStudents = students.filter(s => s.classId === cl.id);
      map.set(cl.id, {
        classId: cl.id,
        className: cl.name,
        level: cl.level,
        levelLabel: cl.levelLabel,
        studentCount: classStudents.length,
        totalAbsences: 0,
        unjustified: 0,
        justified: 0,
        absentStudentsCount: 0,
      });
    });

    const classAbsentStudentsMap = new Map<string, Set<string>>();

    filteredAbsences.forEach(rec => {
      const stats = map.get(rec.classId);
      if (stats) {
        stats.totalAbsences += 1;
        if (rec.isJustified) stats.justified += 1;
        else stats.unjustified += 1;

        if (!classAbsentStudentsMap.has(rec.classId)) {
          classAbsentStudentsMap.set(rec.classId, new Set());
        }
        classAbsentStudentsMap.get(rec.classId)!.add(rec.studentId);
      }
    });

    classAbsentStudentsMap.forEach((studentSet, classId) => {
      const stats = map.get(classId);
      if (stats) stats.absentStudentsCount = studentSet.size;
    });

    return Array.from(map.values()).sort((a, b) => b.totalAbsences - a.totalAbsences);
  }, [availableClasses, students, filteredAbsences]);

  // Top Most Absent Class
  const mostAbsentClass = classStats.length > 0 && classStats[0].totalAbsences > 0 ? classStats[0] : null;

  // Session slots statistics (S1 to S8)
  const sessionStats = useMemo(() => {
    const sessionMap = new Map<string, number>();
    SESSION_PERIODS.forEach(s => sessionMap.set(s.id, 0));

    filteredAbsences.forEach(rec => {
      const current = sessionMap.get(rec.session) || 0;
      sessionMap.set(rec.session, current + 1);
    });

    const maxVal = Math.max(...Array.from(sessionMap.values()), 1);

    return SESSION_PERIODS.map(s => {
      const count = sessionMap.get(s.id) || 0;
      const percentage = Math.round((count / maxVal) * 100);
      return {
        ...s,
        count,
        percentage,
      };
    });
  }, [filteredAbsences]);

  // Day of week statistics
  const dayOfWeekStats = useMemo(() => {
    const days = [
      { name: 'الإثنين', dayNum: 1, count: 0 },
      { name: 'الثلاثاء', dayNum: 2, count: 0 },
      { name: 'الأربعاء', dayNum: 3, count: 0 },
      { name: 'الخميس', dayNum: 4, count: 0 },
      { name: 'الجمعة', dayNum: 5, count: 0 },
      { name: 'السبت', dayNum: 6, count: 0 },
    ];

    filteredAbsences.forEach(rec => {
      const d = new Date(rec.date);
      const dayNum = d.getDay();
      const match = days.find(day => day.dayNum === dayNum);
      if (match) match.count += 1;
    });

    const maxVal = Math.max(...days.map(d => d.count), 1);
    return days.map(d => ({
      ...d,
      percentage: Math.round((d.count / maxVal) * 100),
    }));
  }, [filteredAbsences]);

  // Subject-wise absence statistics and breakdown
  const subjectStats = useMemo(() => {
    const map = new Map<
      string,
      { subject: string; total: number; unjustified: number; justified: number }
    >();

    SCHOOL_SUBJECTS.forEach(sub => {
      map.set(sub, { subject: sub, total: 0, unjustified: 0, justified: 0 });
    });

    filteredAbsences.forEach(rec => {
      const current = map.get(rec.subject) || {
        subject: rec.subject,
        total: 0,
        unjustified: 0,
        justified: 0,
      };
      current.total += 1;
      if (rec.isJustified) current.justified += 1;
      else current.unjustified += 1;
      map.set(rec.subject, current);
    });

    const list = Array.from(map.values()).sort((a, b) => b.total - a.total);
    const maxVal = Math.max(...list.map(s => s.total), 1);

    return list.map(item => ({
      ...item,
      percentage: totalHours > 0 ? Math.round((item.total / totalHours) * 100) : 0,
      barWidth: Math.round((item.total / maxVal) * 100),
    }));
  }, [filteredAbsences, totalHours]);

  // Heatmap cross-analysis: Subject x Day of Week
  const subjectByDayMatrix = useMemo(() => {
    const days = [
      { name: 'الإثنين', dayNum: 1 },
      { name: 'الثلاثاء', dayNum: 2 },
      { name: 'الأربعاء', dayNum: 3 },
      { name: 'الخميس', dayNum: 4 },
      { name: 'الجمعة', dayNum: 5 },
      { name: 'السبت', dayNum: 6 },
    ];

    // Get top 6 subjects by absences or first 6 subjects
    const topSubjects = subjectStats.slice(0, 6).map(s => s.subject);

    // Matrix: subject -> { [dayNum]: count }
    const matrix: { [subject: string]: { [dayNum: number]: number } } = {};
    topSubjects.forEach(sub => {
      matrix[sub] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    });

    let maxCellCount = 0;

    filteredAbsences.forEach(rec => {
      if (matrix[rec.subject]) {
        const d = new Date(rec.date);
        const dayNum = d.getDay();
        if (dayNum >= 1 && dayNum <= 6) {
          matrix[rec.subject][dayNum] = (matrix[rec.subject][dayNum] || 0) + 1;
          if (matrix[rec.subject][dayNum] > maxCellCount) {
            maxCellCount = matrix[rec.subject][dayNum];
          }
        }
      }
    });

    return {
      days,
      subjects: topSubjects,
      matrix,
      maxCellCount: Math.max(maxCellCount, 1),
    };
  }, [filteredAbsences, subjectStats]);

  // Detected Recurring Absence Patterns Insights
  const absencePatternInsights = useMemo(() => {
    const insights: {
      type: 'peak_day' | 'peak_subject' | 'critical_slot' | 'correlation';
      title: string;
      description: string;
      level: 'warning' | 'info' | 'critical';
    }[] = [];

    if (totalHours === 0) return insights;

    // 1. Peak Day
    const sortedDays = [...dayOfWeekStats].sort((a, b) => b.count - a.count);
    if (sortedDays.length > 0 && sortedDays[0].count > 0) {
      const topDay = sortedDays[0];
      const dayPct = Math.round((topDay.count / totalHours) * 100);
      insights.push({
        type: 'peak_day',
        title: `ذروة الغياب الأسبوعية: يوم ${topDay.name}`,
        description: `سُجل يوم ${topDay.name} أعلى معدل تغيب بواقع ${topDay.count} حصة (${dayPct}% من إجمالي غيابات الفترة).`,
        level: dayPct >= 30 ? 'critical' : 'warning',
      });
    }

    // 2. Peak Subject
    if (subjectStats.length > 0 && subjectStats[0].total > 0) {
      const topSub = subjectStats[0];
      const subPct = Math.round((topSub.total / totalHours) * 100);
      insights.push({
        type: 'peak_subject',
        title: `المادة الأكثر تسجيلاً للغياب: ${topSub.subject}`,
        description: `تتصدر مادة ${topSub.subject} بنسبة ${subPct}% (${topSub.total} حصة)، منها ${topSub.unjustified} حصة غير مبررة.`,
        level: 'warning',
      });
    }

    // 3. Peak Session Pattern (Morning vs Evening)
    const morningCount = sessionStats
      .filter(s => s.isMorning)
      .reduce((acc, s) => acc + s.count, 0);
    const eveningCount = sessionStats
      .filter(s => !s.isMorning)
      .reduce((acc, s) => acc + s.count, 0);

    if (morningCount > eveningCount && morningCount > 0) {
      const mPct = Math.round((morningCount / totalHours) * 100);
      insights.push({
        type: 'critical_slot',
        title: 'تركز الغياب في الفترة الصباحية (S1-S4)',
        description: `الغيابات الصباحية تمثل ${mPct}% من المجموع، خاصة الحصة الأولى S1 (08:30) المرتبطة بالتأخرات الصباحية.`,
        level: 'info',
      });
    } else if (eveningCount > morningCount && eveningCount > 0) {
      const ePct = Math.round((eveningCount / totalHours) * 100);
      insights.push({
        type: 'critical_slot',
        title: 'تركز الغياب في الفترة المسائية (S5-S8)',
        description: `الغيابات المسائية تمثل ${ePct}% من المجموع، مما يشير إلى تسربات محتملة بعد الزوال.`,
        level: 'warning',
      });
    }

    // 4. Combined Correlation Pattern (Most repeated Subject + Day combination)
    let highestCombo = { subject: '', dayName: '', count: 0 };
    subjectByDayMatrix.subjects.forEach(sub => {
      subjectByDayMatrix.days.forEach(d => {
        const c = subjectByDayMatrix.matrix[sub]?.[d.dayNum] || 0;
        if (c > highestCombo.count) {
          highestCombo = { subject: sub, dayName: d.name, count: c };
        }
      });
    });

    if (highestCombo.count >= 2) {
      insights.push({
        type: 'correlation',
        title: `نمط الغياب المتكرر: ${highestCombo.subject} يوم ${highestCombo.dayName}`,
        description: `تكرر الغياب في حصص مادة ${highestCombo.subject} يوم ${highestCombo.dayName} بواقع ${highestCombo.count} مرات ضمن النطاق المحدد.`,
        level: 'info',
      });
    }

    return insights;
  }, [totalHours, dayOfWeekStats, subjectStats, sessionStats, subjectByDayMatrix]);

  // Top 5 absent students in current filter
  const topAbsentStudents = useMemo(() => {
    const countMap = new Map<string, { total: number; unjustified: number; justified: number }>();
    filteredAbsences.forEach(rec => {
      const current = countMap.get(rec.studentId) || { total: 0, unjustified: 0, justified: 0 };
      current.total += 1;
      if (rec.isJustified) current.justified += 1;
      else current.unjustified += 1;
      countMap.set(rec.studentId, current);
    });

    const studentMap = new Map(students.map(s => [s.id, s]));
    const classMap = new Map(classes.map(c => [c.id, c]));

    return Array.from(countMap.entries())
      .map(([studentId, counts]) => {
        const student = studentMap.get(studentId);
        const classObj = student ? classMap.get(student.classId) : undefined;
        return {
          studentId,
          name: student ? student.fullName : studentId,
          className: classObj ? classObj.name : '',
          levelLabel: classObj ? classObj.levelLabel : '',
          ...counts,
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredAbsences, students, classes]);

  // Reset Filters Helper
  const handleResetFilters = () => {
    setDashboardFilter({
      level: 'all',
      classId: 'all',
      timeMode: 'this_month',
      specificDate: todayStr,
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      selectedMonth: '2026-09',
      selectedMonths: ['2026-09'],
      justificationStatus: 'all',
      searchQuery: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* ===================== FILTER PANEL ===================== */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                فلترة واختيار نطاق الإحصائيات (المستويات، الأقسام والمدد الزمنية)
              </h2>
              <p className="text-xs text-slate-500">
                حدد بدقة المستوى الدراسي أو القسم، واختر يوماً، أسبوعاً، شهراً أو عدة أشهر لمعاينة الغيابات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>إعادة ضبط الفلتر</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Level Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              1. المستوى الدراسي (المستوى)
            </label>
            <select
              value={dashboardFilter.level}
              onChange={e => {
                const newLevel = e.target.value as EducationLevel | 'all';
                setDashboardFilter(prev => ({
                  ...prev,
                  level: newLevel,
                  // If class was from another level, reset class to all
                  classId: 'all',
                }));
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 focus:outline-emerald-600 focus:bg-white cursor-pointer"
            >
              <option value="all">جميع المستويات والأقسام</option>
              <option value="1APIC">الأوليات (الأولى إعدادي - 1APIC)</option>
              <option value="2APIC">الثانيات (الثانية إعدادي - 2APIC)</option>
              <option value="3APIC">الثالثات (الثالثة إعدادي - 3APIC)</option>
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              2. القسم / المجموعة
            </label>
            <select
              value={dashboardFilter.classId}
              onChange={e => setDashboardFilter(prev => ({ ...prev, classId: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 focus:outline-emerald-600 focus:bg-white cursor-pointer"
            >
              <option value="all">
                {dashboardFilter.level === 'all'
                  ? 'كل الأقسام (جميع الأقسام)'
                  : `كل أقسام مستوى (${allLevels.find(l => l.id === dashboardFilter.level)?.label})`}
              </option>
              {availableClasses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time Period Filter Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              3. المدة الزمنية المراد معرفة إحصائياتها
            </label>
            <select
              value={dashboardFilter.timeMode}
              onChange={e =>
                setDashboardFilter(prev => ({
                  ...prev,
                  timeMode: e.target.value as TimeFilterMode,
                }))
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 focus:outline-emerald-600 focus:bg-white cursor-pointer"
            >
              <option value="today">اليوم الحالي ({formatArabicDate(todayStr, false)})</option>
              <option value="specific_day">يوم محدد بالتقويم</option>
              <option value="this_week">هذا الأسبوع الحالي</option>
              <option value="this_month">هذا الشهر الحالي (شتنبر 2026)</option>
              <option value="specific_month">شهر محدد (شتنبر، أكتوبر...)</option>
              <option value="multi_months">عدة أشهر محددة</option>
              <option value="custom_range">مجموعة أيام مخصصة (من - إلى)</option>
              <option value="all">كامل السنة الدراسية (بدون تحديد مدة)</option>
            </select>
          </div>

          {/* Justification Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              4. حالة التبرير
            </label>
            <select
              value={dashboardFilter.justificationStatus}
              onChange={e =>
                setDashboardFilter(prev => ({
                  ...prev,
                  justificationStatus: e.target.value as 'all' | 'justified' | 'unjustified',
                }))
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 focus:outline-emerald-600 focus:bg-white cursor-pointer"
            >
              <option value="all">الكل (المبرر وغير المبرر)</option>
              <option value="unjustified">غير المبرر فقط (المتخلف عن الإدلاء بمبرر)</option>
              <option value="justified">المبرر فقط (شهادات طبية وتراخيص)</option>
            </select>
          </div>
        </div>

        {/* Dynamic sub-controls depending on selected time mode */}
        <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center gap-3 bg-slate-50/70 p-3 rounded-xl">
          {dashboardFilter.timeMode === 'specific_day' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">اختر اليوم المحدد:</span>
              <input
                type="date"
                value={dashboardFilter.specificDate || todayStr}
                onChange={e => setDashboardFilter(prev => ({ ...prev, specificDate: e.target.value }))}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:outline-emerald-600"
              />
              {dashboardFilter.specificDate && (
                <span className="text-xs text-emerald-700 font-medium">
                  ({formatArabicDate(dashboardFilter.specificDate, true)})
                </span>
              )}
            </div>
          )}

          {dashboardFilter.timeMode === 'specific_month' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">اختر الشهر:</span>
              <select
                value={dashboardFilter.selectedMonth || '2026-09'}
                onChange={e => setDashboardFilter(prev => ({ ...prev, selectedMonth: e.target.value }))}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-emerald-600 cursor-pointer"
              >
                <option value="2026-09">شتنبر 2026</option>
                <option value="2026-10">أكتوبر 2026</option>
                <option value="2026-11">نونبر 2026</option>
                <option value="2026-12">دجنبر 2026</option>
                <option value="2027-01">يناير 2027</option>
                <option value="2027-02">فبراير 2027</option>
                <option value="2027-03">مارس 2027</option>
                <option value="2027-04">أبريل 2027</option>
                <option value="2027-05">ماي 2027</option>
                <option value="2027-06">يونيو 2027</option>
              </select>
            </div>
          )}

          {dashboardFilter.timeMode === 'multi_months' && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-slate-700">حدد الأشهر المطلوبة:</span>
              {[
                { id: '2026-09', label: 'شتنبر' },
                { id: '2026-10', label: 'أكتوبر' },
                { id: '2026-11', label: 'نونبر' },
                { id: '2026-12', label: 'دجنبر' },
                { id: '2027-01', label: 'يناير' },
              ].map(m => {
                const checked = (dashboardFilter.selectedMonths || []).includes(m.id);
                return (
                  <label
                    key={m.id}
                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                      checked
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={e => {
                        const current = dashboardFilter.selectedMonths || [];
                        const updated = e.target.checked
                          ? [...current, m.id]
                          : current.filter(id => id !== m.id);
                        setDashboardFilter(prev => ({ ...prev, selectedMonths: updated }));
                      }}
                      className="sr-only"
                    />
                    <span>{m.label}</span>
                  </label>
                );
              })}
            </div>
          )}

          {dashboardFilter.timeMode === 'custom_range' && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">من تاريخ:</span>
              <input
                type="date"
                value={dashboardFilter.startDate || '2026-09-01'}
                onChange={e => setDashboardFilter(prev => ({ ...prev, startDate: e.target.value }))}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono"
              />
              <span className="text-xs font-semibold text-slate-700">إلى تاريخ:</span>
              <input
                type="date"
                value={dashboardFilter.endDate || todayStr}
                onChange={e => setDashboardFilter(prev => ({ ...prev, endDate: e.target.value }))}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono"
              />
            </div>
          )}

          {/* Quick Search */}
          <div className="flex-1 min-w-[200px] flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="بحث سريع باسم التلميذ، المادة، أو رقم مسار..."
              value={dashboardFilter.searchQuery || ''}
              onChange={e => setDashboardFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden bg-transparent"
            />
            {dashboardFilter.searchQuery && (
              <button
                onClick={() => setDashboardFilter(prev => ({ ...prev, searchQuery: '' }))}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ===================== KPI METRICS CARDS ===================== */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Hours */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">إجمالي حصص الغياب</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{totalHours}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">ساعة / حصة مسجلة</p>
          </div>
        </div>

        {/* Unjustified Absences */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col justify-between bg-gradient-to-b from-white to-amber-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">الغياب غير المبرر</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-amber-900">{unjustifiedHours}</div>
              <span className="text-xs font-bold text-amber-700">{unjustifiedPercentage}%</span>
            </div>
            <p className="text-[11px] text-amber-700/80 mt-0.5">يتطلب إشعار الأولياء</p>
          </div>
        </div>

        {/* Justified Absences */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col justify-between bg-gradient-to-b from-white to-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">الغياب المبرر</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-emerald-900">{justifiedHours}</div>
              <span className="text-xs font-bold text-emerald-700">{justifiedPercentage}%</span>
            </div>
            <p className="text-[11px] text-emerald-700/80 mt-0.5">بشهادة أو ترخيص</p>
          </div>
        </div>

        {/* Unique Students Absent */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">التلاميذ المتغيبين</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{uniqueAbsentStudentIds.size}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">تلميذاً سُجل له غياب</p>
          </div>
        </div>

        {/* Most Absent Class */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">القسم الأكثر غياباً</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-base font-bold text-slate-900 truncate">
              {mostAbsentClass ? mostAbsentClass.className : 'لا غيابات'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {mostAbsentClass ? `${mostAbsentClass.totalAbsences} حصة غياب` : 'نظيفة'}
            </p>
          </div>
        </div>

        {/* Filter Scope Notice */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between bg-slate-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">الأقسام ضمن الفلتر</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{classStats.length}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">قسم / مجموعة دعم</p>
          </div>
        </div>
      </section>

      {/* ===================== VISUAL ANALYTICS & CHARTS ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes Absence Comparison Bar Chart (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-700" />
                <span>مقارنة إجمالي الغياب بين الأقسام (حسب الفلتر المحدد)</span>
              </h3>
              <p className="text-xs text-slate-500">
                مقارنة بصرية واضحة بين الغياب غير المبرر (برتقالي) والمبرر (أخضر) لكل قسم
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-amber-500"></span>
                <span>غير مبرر</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-emerald-600"></span>
                <span>مبرر</span>
              </span>
            </div>
          </div>

          {classStats.length === 0 || totalHours === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              لا توجد بيانات غياب مسجلة في هذا النطاق الزمني أو المستوى المحدد.
            </div>
          ) : (
            <div className="space-y-3.5">
              {classStats.map(stat => {
                const maxTotal = Math.max(...classStats.map(c => c.totalAbsences), 1);
                const unjustifiedWidth = (stat.unjustified / maxTotal) * 100;
                const justifiedWidth = (stat.justified / maxTotal) * 100;

                return (
                  <div
                    key={stat.classId}
                    className="group p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">{stat.className}</span>
                        <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                          {stat.levelLabel}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({stat.absentStudentsCount} تلميذاً متغيباً من أصل {stat.studentCount})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-slate-900 text-sm">{stat.totalAbsences} حصة</span>
                        <button
                          onClick={() => onSelectClassInStudentsView(stat.classId, stat.level)}
                          className="opacity-0 group-hover:opacity-100 text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-0.5 text-xs font-sans transition-opacity cursor-pointer"
                        >
                          <span>عرض التلاميذ</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Stacked Progress Bar */}
                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                      <div
                        style={{ width: `${unjustifiedWidth}%` }}
                        className="bg-amber-500 h-full transition-all duration-500 relative group/bar"
                        title={`غير مبرر: ${stat.unjustified} حصة`}
                      />
                      <div
                        style={{ width: `${justifiedWidth}%` }}
                        className="bg-emerald-600 h-full transition-all duration-500"
                        title={`مبرر: ${stat.justified} حصة`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Side Column: Session Peak Distribution (S1 to S8) */}
        <div className="space-y-6">
          {/* Session Hourly Peak Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>توزيع الغياب حسب حصص اليوم (S1 - S8)</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              معرفة ساعات الذروة التي يتغيب فيها التلاميذ (صباحاً أم مساءً)
            </p>

            <div className="space-y-2">
              {sessionStats.map(s => (
                <div key={s.id} className="flex items-center gap-2 text-xs">
                  <span className="w-16 font-mono font-medium text-slate-700 text-[11px] shrink-0">
                    {s.id} ({s.timeShort})
                  </span>
                  <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${s.percentage}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        s.isMorning ? 'bg-teal-600' : 'bg-indigo-600'
                      }`}
                    />
                  </div>
                  <span className="w-10 text-left font-mono font-bold text-slate-800 text-xs">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                <span>الحصص الصباحية (S1-S4)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                <span>الحصص المسائية (S5-S8)</span>
              </span>
            </div>
          </div>

          {/* Days of Week Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>توزيع الغياب حسب أيام الأسبوع</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3.5">
              رصد الأيام الأكثر تسجيلاً للغياب (الإثنين إلى السبت)
            </p>

            <div className="grid grid-cols-6 gap-2 text-center">
              {dayOfWeekStats.map(day => (
                <div key={day.name} className="flex flex-col items-center">
                  <div className="text-[11px] font-bold text-slate-800 font-mono mb-1">{day.count}</div>
                  <div className="w-full bg-slate-100 h-20 rounded-lg flex items-end p-1 justify-center">
                    <div
                      style={{ height: `${Math.max(day.percentage, 8)}%` }}
                      className="w-full bg-gradient-to-t from-emerald-700 to-teal-500 rounded-sm transition-all duration-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-600 mt-1 font-medium">{day.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== SUBJECT-WISE ABSENCE & PATTERNS SECTION ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-Wise Rates & Breakdown (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-700" />
                <span>معدلات ونسب الغياب حسب المادة الدراسية</span>
              </h3>
              <p className="text-xs text-slate-500">
                تحليل المواد التي تسجل أعلى نسب تغيب للتلاميذ مع تفصيل الغياب غير المبرر والمبرر
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-amber-500"></span>
                <span>غير مبرر</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-emerald-600"></span>
                <span>مبرر</span>
              </span>
            </div>
          </div>

          {totalHours === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              لا توجد بيانات غياب مسجلة في هذا النطاق الزمني.
            </div>
          ) : (
            <div className="space-y-3">
              {subjectStats.map(item => {
                const maxSubjectTotal = Math.max(...subjectStats.map(s => s.total), 1);
                const unjWidth = (item.unjustified / maxSubjectTotal) * 100;
                const jusWidth = (item.justified / maxSubjectTotal) * 100;

                return (
                  <div
                    key={item.subject}
                    className="p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">{item.subject}</span>
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.percentage}% من إجمالي الغياب
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-sm">
                          {item.unjustified} غير مبرر
                        </span>
                        <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-sm">
                          {item.justified} مبرر
                        </span>
                        <span className="font-bold text-slate-900 text-sm min-w-12 text-left">
                          {item.total} حصة
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                      <div
                        style={{ width: `${unjWidth}%` }}
                        className="bg-amber-500 h-full transition-all duration-500"
                        title={`غير مبرر: ${item.unjustified}`}
                      />
                      <div
                        style={{ width: `${jusWidth}%` }}
                        className="bg-emerald-600 h-full transition-all duration-500"
                        title={`مبرر: ${item.justified}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recurring Absence Patterns Insights (1 Column) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-600" />
                <span>أنماط الغياب الأكثر تكراراً</span>
              </h3>
              <span className="bg-amber-50 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
                رصد تحليلي
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3.5">
              استنتاج تلقائي لأنماط السلوك المتكرر في الغياب (الأيام الحرجة، المواد، وأوقات اليوم)
            </p>

            <div className="space-y-3">
              {absencePatternInsights.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  لا توجد أنماط كافية لرصد التكرار في النطاق المحدد.
                </div>
              ) : (
                absencePatternInsights.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      insight.level === 'critical'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : insight.level === 'warning'
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      {insight.level === 'critical' || insight.level === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      ) : (
                        <Lightbulb className="w-4 h-4 shrink-0 text-emerald-700" />
                      )}
                      <span>{insight.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                      {insight.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick takeaway tip */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600">
              تساعد هذه الأنماط إدارة المؤسسة والمستشارين في التوجيه على تحديد أسباب التعثر الدراسي واتخاذ إجراءات وقائية مبكرة.
            </p>
          </div>
        </div>
      </div>

      {/* ===================== CROSS HEATMAP: SUBJECT x DAY OF WEEK ===================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-700" />
              <span>مصفوفة تقاطع الغياب: المواد الدراسية × أيام الأسبوع (Heatmap)</span>
            </h3>
            <p className="text-xs text-slate-500">
              تحديد التوزيع الدقيق للغيابات عبر أيام الأسبوع والمواد لرصد أي تزامن غير معتاد (الخلايا الأكثر قتامة تمثل تكراراً أعلى)
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <span>تدرج الكثافة:</span>
            <span className="w-4 h-4 rounded-xs bg-slate-100 border border-slate-200" title="صفر"></span>
            <span className="w-4 h-4 rounded-xs bg-emerald-100" title="منخفض"></span>
            <span className="w-4 h-4 rounded-xs bg-emerald-300" title="متوسط"></span>
            <span className="w-4 h-4 rounded-xs bg-emerald-600" title="مرتفع"></span>
            <span className="w-4 h-4 rounded-xs bg-rose-600" title="ذروة"></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-600 font-semibold">
                <th className="py-2.5 px-4 text-right">المادة الدراسية</th>
                {subjectByDayMatrix.days.map(d => (
                  <th key={d.dayNum} className="py-2.5 px-3 min-w-20">
                    {d.name}
                  </th>
                ))}
                <th className="py-2.5 px-4 text-center font-bold text-slate-800">المجموع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjectByDayMatrix.subjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    لا توجد معطيات كافية للمصفوفة.
                  </td>
                </tr>
              ) : (
                subjectByDayMatrix.subjects.map(subject => {
                  let rowSum = 0;
                  return (
                    <tr key={subject} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-slate-800 text-right">
                        {subject}
                      </td>
                      {subjectByDayMatrix.days.map(d => {
                        const cellVal = subjectByDayMatrix.matrix[subject]?.[d.dayNum] || 0;
                        rowSum += cellVal;

                        // Calculate cell color intensity
                        let bgClass = 'bg-slate-50 text-slate-400';
                        if (cellVal > 0) {
                          const ratio = cellVal / subjectByDayMatrix.maxCellCount;
                          if (ratio >= 0.75) {
                            bgClass = 'bg-rose-600 text-white font-bold shadow-xs';
                          } else if (ratio >= 0.5) {
                            bgClass = 'bg-emerald-600 text-white font-bold';
                          } else if (ratio >= 0.25) {
                            bgClass = 'bg-emerald-200 text-emerald-900 font-semibold';
                          } else {
                            bgClass = 'bg-emerald-50 text-emerald-800';
                          }
                        }

                        return (
                          <td key={d.dayNum} className="py-2.5 px-3">
                            <div
                              className={`mx-auto w-10 h-7 rounded-lg flex items-center justify-center font-mono text-xs transition-transform hover:scale-110 ${bgClass}`}
                              title={`${subject} يوم ${d.name}: ${cellVal} حصة غياب`}
                            >
                              {cellVal}
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                        {rowSum}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== CLASSES SUMMARY TABLE & TOP ABSENTEES ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes Detailed Breakdown Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                جدول إحصائيات الأقسام التفصيلي (حسب الفلتر الحالي)
              </h3>
              <p className="text-xs text-slate-500">
                انقر على أي قسم لمعاينة لائحة تلاميذه وتفاصيل غياباتهم
              </p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
              {classStats.length} قسم
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">القسم / المجموعة</th>
                  <th className="py-3 px-3">المستوى</th>
                  <th className="py-3 px-3 text-center">مجموع التلاميذ</th>
                  <th className="py-3 px-3 text-center">المتغيبين</th>
                  <th className="py-3 px-3 text-center">غير مبرر</th>
                  <th className="py-3 px-3 text-center">مبرر</th>
                  <th className="py-3 px-3 text-center">إجمالي الحصص</th>
                  <th className="py-3 px-4 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStats.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      لا توجد بيانات للأقسام
                    </td>
                  </tr>
                ) : (
                  classStats.map(stat => (
                    <tr
                      key={stat.classId}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectClassInStudentsView(stat.classId, stat.level)}
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{stat.className}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{stat.levelLabel}</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-700">{stat.studentCount}</td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-900">
                        {stat.absentStudentsCount}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/50">
                          {stat.unjustified}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/50">
                          {stat.justified}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                        {stat.totalAbsences}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onSelectClassInStudentsView(stat.classId, stat.level);
                          }}
                          className="bg-emerald-50 hover:bg-emerald-700 hover:text-white text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          تلاميذ القسم
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 5 Most Absent Students in Scope */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>أعلى التلاميذ غياباً (في نطاق الفلتر)</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-3.5">
              انقر على اسم أي تلميذ لفتح بطاقته ورسومه البيانية وتعديل غيابه
            </p>

            <div className="space-y-2.5">
              {topAbsentStudents.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">لا يوجد تلاميذ متغيبين</div>
              ) : (
                topAbsentStudents.map((st, idx) => (
                  <div
                    key={st.studentId}
                    onClick={() => onSelectStudent(st.studentId)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 text-xs hover:text-emerald-800">
                          {st.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {st.className} • <span className="font-mono">{st.studentId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                        {st.total} حصة
                      </span>
                      {st.unjustified > 0 && (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-md">
                          {st.unjustified} غير مبرر
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">
              للاطلاع على كافة التلاميذ، انتقل إلى تبويب{' '}
              <span className="font-semibold text-emerald-800">«لائحة وإحصائيات التلاميذ»</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
