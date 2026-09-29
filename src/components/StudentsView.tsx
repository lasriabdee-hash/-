import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  PlusCircle,
  Eye,
  School,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { EducationLevel, Student } from '../types';

interface StudentsViewProps {
  onSelectStudent: (studentId: string) => void;
  onOpenAddModalForStudent: (studentId: string) => void;
  initialClassId?: string;
  initialLevel?: EducationLevel | 'all';
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  onSelectStudent,
  onOpenAddModalForStudent,
  initialClassId,
  initialLevel,
}) => {
  const { classes, students, absences, allLevels } = useAttendance();

  // Filters state
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel | 'all'>(initialLevel || 'all');
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyWithAbsences, setOnlyWithAbsences] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'order' | 'name' | 'absences'>('absences');

  // Available classes for selected level
  const availableClasses = useMemo(() => {
    if (selectedLevel === 'all') return classes;
    return classes.filter(c => c.level === selectedLevel);
  }, [classes, selectedLevel]);

  // Map student absence counts
  const studentAbsenceMap = useMemo(() => {
    const map = new Map<string, { total: number; unjustified: number; justified: number }>();
    students.forEach(s => {
      map.set(s.id, { total: 0, unjustified: 0, justified: 0 });
    });

    absences.forEach(a => {
      const current = map.get(a.studentId) || { total: 0, unjustified: 0, justified: 0 };
      current.total += 1;
      if (a.isJustified) current.justified += 1;
      else current.unjustified += 1;
      map.set(a.studentId, current);
    });

    return map;
  }, [students, absences]);

  // Filter students
  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return students.filter(st => {
      // Level filter
      if (selectedLevel !== 'all' && st.level !== selectedLevel) {
        return false;
      }

      // Class filter
      if (selectedClassId !== 'all' && st.classId !== selectedClassId) {
        return false;
      }

      const counts = studentAbsenceMap.get(st.id) || { total: 0, unjustified: 0, justified: 0 };

      // Only with absences toggle
      if (onlyWithAbsences && counts.total === 0) {
        return false;
      }

      // Search query in first name, last name, full name, or Massar ID
      if (q) {
        const matchName = st.fullName.toLowerCase().includes(q);
        const matchId = st.id.toLowerCase().includes(q);
        const matchFirst = st.firstName.toLowerCase().includes(q);
        const matchLast = st.lastName.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchFirst && !matchLast) {
          return false;
        }
      }

      return true;
    });
  }, [students, selectedLevel, selectedClassId, onlyWithAbsences, searchQuery, studentAbsenceMap]);

  // Sort students
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      if (sortBy === 'absences') {
        const countsA = studentAbsenceMap.get(a.id)?.total || 0;
        const countsB = studentAbsenceMap.get(b.id)?.total || 0;
        return countsB - countsA;
      }
      if (sortBy === 'name') {
        return a.fullName.localeCompare(b.fullName, 'ar');
      }
      return a.orderInClass - b.orderInClass;
    });
  }, [filteredStudents, sortBy, studentAbsenceMap]);

  // Current selected class details
  const currentClassObj = classes.find(c => c.id === selectedClassId);

  // Quick stats for the current filtered list
  const totalFilteredStudents = filteredStudents.length;
  const totalFilteredAbsences = filteredStudents.reduce(
    (acc, st) => acc + (studentAbsenceMap.get(st.id)?.total || 0),
    0
  );
  const totalFilteredUnjustified = filteredStudents.reduce(
    (acc, st) => acc + (studentAbsenceMap.get(st.id)?.unjustified || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* ===================== FILTER & SEARCH BAR ===================== */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                لائحة تلاميذ الأقسام والبحث الفردي
              </h2>
              <p className="text-xs text-slate-500">
                اختر المستوى والقسم لتظهر لك لائحة تلاميذه، ابحث بالاسم أو اللقب، واضغط على اسم أي تلميذ لمعاينة غياباته ورسومه البيانية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              النتائج: <strong>{totalFilteredStudents}</strong> تلميذاً
            </span>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Level Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              1. اختيار المستوى
            </label>
            <select
              value={selectedLevel}
              onChange={e => {
                const newLevel = e.target.value as EducationLevel | 'all';
                setSelectedLevel(newLevel);
                setSelectedClassId('all');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 focus:outline-emerald-600 focus:bg-white cursor-pointer"
            >
              <option value="all">جميع المستويات</option>
              <option value="1APIC">الأوليات (الأولى إعدادي)</option>
              <option value="2APIC">الثانيات (الثانية إعدادي)</option>
              <option value="3APIC">الثالثات (الثالثة إعدادي)</option>
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              2. اختيار القسم / المجموعة
            </label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 focus:outline-emerald-600 focus:bg-white cursor-pointer font-medium"
            >
              <option value="all">
                {selectedLevel === 'all'
                  ? 'كل الأقسام'
                  : `جميع أقسام مستوى (${allLevels.find(l => l.id === selectedLevel)?.label})`}
              </option>
              {availableClasses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input (By Name, Surname, or Massar) */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              3. البحث بالاسم، اللقب (النسب) أو رقم مسار
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="اكتب اسم التلميذ، لقبه، أو كود مسار (مثال: المكطع أو R180039027)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-8 py-2 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-emerald-600 focus:bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Toggles & Sorting */}
        <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={onlyWithAbsences}
                onChange={e => setOnlyWithAbsences(e.target.checked)}
                className="rounded-sm text-emerald-700 focus:ring-emerald-500 w-4 h-4 accent-emerald-700"
              />
              <span>إظهار التلاميذ المسجل لهم غياب فقط</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              ترتيب حسب:
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                onClick={() => setSortBy('absences')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  sortBy === 'absences' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                الأكثر غياباً
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  sortBy === 'name' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                الاسم (أبجدياً)
              </button>
              <button
                onClick={() => setSortBy('order')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  sortBy === 'order' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                رقم الترتيب
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CLASS SUMMARY HEADER (IF CLASS SELECTED) ===================== */}
      {currentClassObj && (
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                {currentClassObj.levelLabel}
              </span>
              <h3 className="text-lg font-bold">{currentClassObj.name}</h3>
            </div>
            <p className="text-xs text-emerald-100 mt-1">
              الأستاذ المنسق/الرئيس: {currentClassObj.tutorTeacher || 'غير محدد'} • القاعة: {currentClassObj.room || 'محددة'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/15">
              <div className="text-lg font-bold">{totalFilteredStudents}</div>
              <div className="text-[11px] text-emerald-100">تلميذاً بالقسم</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/15">
              <div className="text-lg font-bold">{totalFilteredAbsences}</div>
              <div className="text-[11px] text-emerald-100">مجموع حصص الغياب</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/15">
              <div className="text-lg font-bold text-amber-300">{totalFilteredUnjustified}</div>
              <div className="text-[11px] text-amber-200">غير مبرر</div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== STUDENTS TABLE / LIST ===================== */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              لائحة التلاميذ ({sortedStudents.length})
            </h3>
            <p className="text-xs text-slate-500">
              انقر على أي تلميذ لفتح ملف غيابه التفصيلي مع الرسوم البيانية، تبرير أي غياب أو حذفه
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-3 text-center w-12">ر.ت</th>
                <th className="py-3 px-4">الاسم الكامل للتلميذ</th>
                <th className="py-3 px-3">رقم مسار</th>
                <th className="py-3 px-3">القسم والمستوى</th>
                <th className="py-3 px-3 text-center">مجموع الغياب</th>
                <th className="py-3 px-3 text-center">غير مبرر</th>
                <th className="py-3 px-3 text-center">مبرر</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    لم يتم العثور على تلاميذ يطابقون خيارات البحث أو الفلتر المحددة.
                  </td>
                </tr>
              ) : (
                sortedStudents.map(student => {
                  const counts = studentAbsenceMap.get(student.id) || {
                    total: 0,
                    unjustified: 0,
                    justified: 0,
                  };
                  const studentClassObj = classes.find(c => c.id === student.classId);

                  return (
                    <tr
                      key={student.id}
                      onClick={() => onSelectStudent(student.id)}
                      className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                    >
                      {/* Order */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">
                        {student.orderInClass}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4 font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              student.gender === 'F'
                                ? 'bg-pink-100 text-pink-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {student.gender === 'F' ? 'ب' : 'ذ'}
                          </span>
                          <span>{student.fullName}</span>
                        </div>
                      </td>

                      {/* Massar Code */}
                      <td className="py-3 px-3 font-mono text-slate-600 text-xs">
                        {student.id}
                      </td>

                      {/* Class */}
                      <td className="py-3 px-3 text-slate-600">
                        <div className="font-semibold text-slate-800">
                          {studentClassObj?.name || student.classId}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {studentClassObj?.levelLabel}
                        </div>
                      </td>

                      {/* Total Absences */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                            counts.total === 0
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-slate-900 text-white'
                          }`}
                        >
                          {counts.total} حصة
                        </span>
                      </td>

                      {/* Unjustified Absences */}
                      <td className="py-3 px-3 text-center">
                        {counts.unjustified > 0 ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-100 text-amber-800 border border-amber-300/60">
                            {counts.unjustified}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">0</span>
                        )}
                      </td>

                      {/* Justified Absences */}
                      <td className="py-3 px-3 text-center">
                        {counts.justified > 0 ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                            {counts.justified}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">0</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectStudent(student.id)}
                            className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-700 hover:text-white text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                            title="عرض الغيابات والرسوم البيانية"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>الملف والرسوم</span>
                          </button>

                          <button
                            onClick={() => onOpenAddModalForStudent(student.id)}
                            className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="تسجيل غياب جديد لهذا التلميذ"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
