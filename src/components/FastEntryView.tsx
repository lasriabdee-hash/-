import React, { useState, useMemo } from 'react';
import {
  CalendarCheck2,
  Calendar,
  Clock,
  BookOpen,
  Users,
  CheckCircle2,
  AlertTriangle,
  Save,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { SESSION_PERIODS, SessionPeriod, EducationLevel } from '../types';
import { formatArabicDate, getTodayDateString } from '../utils/dateUtils';
import { SCHOOL_SUBJECTS, JUSTIFICATION_REASONS } from '../data/mockData';

export const FastEntryView: React.FC = () => {
  const { classes, students, absences, batchAddAbsences, deleteAbsence } = useAttendance();
  const todayStr = getTodayDateString();

  const [date, setDate] = useState<string>(todayStr);
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '2APIC-10');
  const [session, setSession] = useState<SessionPeriod>('S1');
  const [subject, setSubject] = useState<string>(SCHOOL_SUBJECTS[0]);

  // Selected students marked as absent in this session draft: studentId -> { justified: boolean, reason?: string, note?: string }
  const [absentDraft, setAbsentDraft] = useState<
    Map<string, { isJustified: boolean; reason?: string; note?: string }>
  >(new Map());

  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Students of selected class
  const classStudents = useMemo(() => {
    return students
      .filter(s => s.classId === selectedClassId)
      .sort((a, b) => a.orderInClass - b.orderInClass);
  }, [students, selectedClassId]);

  // Existing absences already recorded in DB for this exact date, class, and session
  const existingSessionAbsences = useMemo(() => {
    return absences.filter(
      a => a.date === date && a.classId === selectedClassId && a.session === session
    );
  }, [absences, date, selectedClassId, session]);

  // When class, date, or session changes, pre-load existing absences into draft
  React.useEffect(() => {
    const draft = new Map<string, { isJustified: boolean; reason?: string; note?: string }>();
    existingSessionAbsences.forEach(a => {
      draft.set(a.studentId, {
        isJustified: a.isJustified,
        reason: a.justificationReason,
        note: a.note,
      });
    });
    setAbsentDraft(draft);
    setSavedNotice(null);
  }, [existingSessionAbsences, selectedClassId, date, session]);

  // Toggle student absent status
  const handleToggleStudent = (studentId: string) => {
    setAbsentDraft(prev => {
      const next = new Map(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.set(studentId, { isJustified: false });
      }
      return next;
    });
  };

  // Toggle justified status for an absent student
  const handleToggleJustified = (studentId: string) => {
    setAbsentDraft(prev => {
      const next = new Map(prev);
      const current = next.get(studentId);
      if (current) {
        next.set(studentId, {
          ...current,
          isJustified: !current.isJustified,
          reason: !current.isJustified ? JUSTIFICATION_REASONS[0] : undefined,
        });
      }
      return next;
    });
  };

  // Save all to internal database
  const handleSaveSession = () => {
    // 1. Remove previously stored absences for this exact slot
    existingSessionAbsences.forEach(old => {
      deleteAbsence(old.id);
    });

    // 2. Add the newly selected draft absences
    const newRecords = Array.from(absentDraft.entries()).map(([stId, data]) => ({
      studentId: stId,
      classId: selectedClassId,
      date,
      session,
      subject,
      isJustified: data.isJustified,
      justificationReason: data.reason,
      justificationDate: data.isJustified ? date : undefined,
      note: data.note,
    }));

    if (newRecords.length > 0) {
      batchAddAbsences(newRecords);
    }

    setSavedNotice(
      `تم تفريغ وحفظ غياب الحصة بنجاح في السجل الداخلي (${absentDraft.size} تلميذاً متغيباً)`
    );

    setTimeout(() => {
      setSavedNotice(null);
    }, 4500);
  };

  const selectedClassObj = classes.find(c => c.id === selectedClassId);
  const selectedSessionObj = SESSION_PERIODS.find(s => s.id === session);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                تفريغ وتعبئة غياب حصة مباشرة (التدبير الداخلي)
              </h2>
              <p className="text-xs text-slate-500">
                حدد التاريخ، القسم، الحصة والمادة ثم انقر على أسماء التلاميذ المتغيبين للحفظ الفوري في قاعدة البيانات
              </p>
            </div>
          </div>

          {savedNotice && (
            <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{savedNotice}</span>
            </div>
          )}
        </div>

        {/* Selection Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              1. تاريخ الحصة (اليوم)
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 font-mono focus:outline-emerald-600 focus:bg-white"
            />
            <span className="block text-[11px] text-emerald-700 mt-1 font-medium">
              {formatArabicDate(date, true)}
            </span>
          </div>

          {/* Class Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              2. القسم / المجموعة
            </label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 focus:outline-emerald-600 focus:bg-white cursor-pointer"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.levelLabel})
                </option>
              ))}
            </select>
          </div>

          {/* Session Selector (S1-S8) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              3. الحصة والساعة
            </label>
            <select
              value={session}
              onChange={e => setSession(e.target.value as SessionPeriod)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 focus:outline-emerald-600 focus:bg-white cursor-pointer"
            >
              {SESSION_PERIODS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.id} — {s.time} {s.isMorning ? '(صباح)' : '(مساء)'}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              4. المادة الدراسية
            </label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 focus:outline-emerald-600 focus:bg-white cursor-pointer"
            >
              {SCHOOL_SUBJECTS.map(sub => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">
              عدد المتغيبين المحدد للحصة:
              <strong className="text-slate-900 mx-1 font-mono text-sm">{absentDraft.size}</strong>
              من أصل <strong className="text-slate-900 mx-1">{classStudents.length}</strong> تلميذ
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAbsentDraft(new Map())}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
            >
              إلغاء تحديد الكل (الكل حاضر)
            </button>

            <button
              onClick={handleSaveSession}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs md:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>تأكيد وحفظ غياب الحصة داخلياً</span>
            </button>
          </div>
        </div>
      </section>

      {/* Student Roster Grid for Quick Ticking */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              لائحة تلاميذ قسم {selectedClassObj?.name}
            </h3>
            <p className="text-xs text-slate-500">
              انقر على بطاقة التلميذ لتعيينه <span className="font-bold text-rose-700">«غائباً»</span>، ويمكنك تبديل التبرير بنقرة على الزر الداخلي
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-300"></span>
              <span>حاضر</span>
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span>غائب</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {classStudents.map(student => {
            const isAbsent = absentDraft.has(student.id);
            const absentData = absentDraft.get(student.id);

            return (
              <div
                key={student.id}
                onClick={() => handleToggleStudent(student.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                  isAbsent
                    ? 'bg-rose-50/90 border-rose-300 shadow-xs'
                    : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center font-mono">
                      {student.orderInClass}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isAbsent ? 'bg-rose-600 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isAbsent ? 'غائب' : 'حاضر'}
                    </span>
                  </div>

                  <div className="font-bold text-slate-900 text-xs">{student.fullName}</div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">{student.id}</div>
                </div>

                {/* Justification toggle if absent */}
                {isAbsent && (
                  <div
                    className="mt-3 pt-2 border-t border-rose-200/80 flex items-center justify-between text-[11px]"
                    onClick={e => e.stopPropagation()}
                  >
                    <span className="text-slate-600">التبرير:</span>
                    <button
                      onClick={() => handleToggleJustified(student.id)}
                      className={`px-2 py-0.5 rounded-md font-semibold text-[10px] cursor-pointer transition-colors ${
                        absentData?.isJustified
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                    >
                      {absentData?.isJustified ? 'مبرر ✓' : 'غير مبرر'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
