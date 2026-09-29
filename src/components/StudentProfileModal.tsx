import React, { useState, useMemo } from 'react';
import {
  X,
  User,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  BookOpen,
  PlusCircle,
  Edit2,
  Trash2,
  Check,
  Printer,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { AbsenceRecord, SESSION_PERIODS, SessionPeriod } from '../types';
import {
  formatArabicDate,
  getArabicDayName,
  getTodayDateString,
} from '../utils/dateUtils';
import { SCHOOL_SUBJECTS, JUSTIFICATION_REASONS } from '../data/mockData';

interface StudentProfileModalProps {
  studentId: string;
  onClose: () => void;
  onEditAbsence: (absence: AbsenceRecord) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  studentId,
  onClose,
  onEditAbsence,
}) => {
  const {
    students,
    classes,
    absences,
    deleteAbsence,
    toggleAbsenceJustification,
    addAbsence,
  } = useAttendance();

  const student = students.find(s => s.id === studentId);
  const studentClass = student ? classes.find(c => c.id === student.classId) : undefined;

  // Student's all absences sorted newest first
  const studentAbsences = useMemo(() => {
    return absences
      .filter(a => a.studentId === studentId)
      .sort((a, b) => b.date.localeCompare(a.date) || b.session.localeCompare(a.session));
  }, [absences, studentId]);

  const totalAbsences = studentAbsences.length;
  const unjustifiedCount = studentAbsences.filter(a => !a.isJustified).length;
  const justifiedCount = studentAbsences.filter(a => a.isJustified).length;

  // State for inline add absence form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDate, setNewDate] = useState(getTodayDateString());
  const [newSession, setNewSession] = useState<SessionPeriod>('S1');
  const [newSubject, setNewSubject] = useState(SCHOOL_SUBJECTS[0]);
  const [newIsJustified, setNewIsJustified] = useState(false);
  const [newReason, setNewReason] = useState(JUSTIFICATION_REASONS[0]);
  const [newNote, setNewNote] = useState('');

  // State for justification reason picker modal for existing absence
  const [justifyingAbsenceId, setJustifyingAbsenceId] = useState<string | null>(null);
  const [selectedJustifyReason, setSelectedJustifyReason] = useState(JUSTIFICATION_REASONS[0]);

  // State for printable statement
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Student Session Slots Distribution
  const sessionBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    SESSION_PERIODS.forEach(s => map.set(s.id, 0));
    studentAbsences.forEach(a => {
      map.set(a.session, (map.get(a.session) || 0) + 1);
    });
    const maxVal = Math.max(...Array.from(map.values()), 1);
    return SESSION_PERIODS.map(s => ({
      ...s,
      count: map.get(s.id) || 0,
      percentage: Math.round(((map.get(s.id) || 0) / maxVal) * 100),
    }));
  }, [studentAbsences]);

  // Student Subjects Breakdown
  const subjectBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    studentAbsences.forEach(a => {
      map.set(a.subject, (map.get(a.subject) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count);
  }, [studentAbsences]);

  if (!student) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentClass) return;

    addAbsence({
      studentId: student.id,
      classId: student.classId,
      date: newDate,
      session: newSession,
      subject: newSubject,
      isJustified: newIsJustified,
      justificationReason: newIsJustified ? newReason : undefined,
      justificationDate: newIsJustified ? newDate : undefined,
      note: newNote ? newNote : undefined,
    });

    setShowAddForm(false);
    setNewNote('');
    setNewIsJustified(false);
  };

  const handleConfirmJustification = () => {
    if (justifyingAbsenceId) {
      toggleAbsenceJustification(justifyingAbsenceId, selectedJustifyReason);
      setJustifyingAbsenceId(null);
    }
  };

  const handleDeleteAbsence = (absenceId: string, dateStr: string, sessionLabel: string) => {
    if (window.confirm(`هل أنت متأكد من حذف تسجيل غياب يوم ${dateStr} (${sessionLabel})؟`)) {
      deleteAbsence(absenceId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* ===================== HEADER ===================== */}
        <div className="bg-gradient-to-l from-slate-900 to-slate-800 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-700/80 text-white flex items-center justify-center shadow-inner font-bold text-lg">
              {student.gender === 'F' ? 'طالبة' : 'تلميذ'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight">{student.fullName}</h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  الرقم الترتيبي: {student.orderInClass}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap font-sans">
                <span>
                  القسم: <strong className="text-white">{studentClass?.name}</strong>
                </span>
                <span>•</span>
                <span>
                  المستوى: <strong className="text-white">{studentClass?.levelLabel}</strong>
                </span>
                <span>•</span>
                <span>
                  رقم مسار: <strong className="font-mono text-emerald-300">{student.id}</strong>
                </span>
                {student.guardianPhone && (
                  <>
                    <span>•</span>
                    <span>هاتف الولي: {student.guardianPhone}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
              title="طباعة بطاقة غياب التلميذ"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ===================== BODY CONTENT ===================== */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">مجموع ساعات الغياب</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{totalAbsences}</div>
              <span className="text-[11px] text-slate-400">حصة مسجلة</span>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl">
              <span className="text-xs text-amber-800 font-medium">الغياب غير المبرر</span>
              <div className="text-2xl font-bold text-amber-900 mt-1">{unjustifiedCount}</div>
              <span className="text-[11px] text-amber-700 font-semibold">
                {totalAbsences > 0 ? Math.round((unjustifiedCount / totalAbsences) * 100) : 0}% من المجموع
              </span>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl">
              <span className="text-xs text-emerald-800 font-medium">الغياب المبرر</span>
              <div className="text-2xl font-bold text-emerald-900 mt-1">{justifiedCount}</div>
              <span className="text-[11px] text-emerald-700 font-semibold">
                {totalAbsences > 0 ? Math.round((justifiedCount / totalAbsences) * 100) : 0}% من المجموع
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl flex flex-col justify-between">
              <span className="text-xs text-slate-500 font-medium">وضعية المواظبة</span>
              <div className="mt-1">
                {unjustifiedCount === 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> مواظب ممتاز
                  </span>
                ) : unjustifiedCount < 4 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3.5 h-3.5" /> تنبيه أولي
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-100/70 px-2 py-0.5 rounded-full">
                    <ShieldAlert className="w-3.5 h-3.5" /> استدعاء الولي
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5">وفق القانون الداخلي</span>
            </div>
          </div>

          {/* ===================== CHARTS SECTION FOR THE STUDENT ===================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Session Hours Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>توزيع غيابات التلميذ حسب الحصص (S1 إلى S8)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mb-3">
                يوضح الحصص التي يميل التلميذ للتغيب فيها أكثر
              </p>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center">
                {sessionBreakdown.map(s => (
                  <div key={s.id} className="flex flex-col items-center">
                    <span className="text-[10px] font-mono font-bold text-slate-700">{s.count}</span>
                    <div className="w-full bg-slate-100 h-14 rounded-md flex items-end p-0.5 justify-center">
                      <div
                        style={{ height: `${s.count > 0 ? Math.max(s.percentage, 15) : 0}%` }}
                        className={`w-full rounded-xs transition-all ${
                          s.isMorning ? 'bg-teal-600' : 'bg-indigo-600'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 mt-1">{s.id}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>توزيع الغياب حسب المواد الدراسية</span>
              </h4>
              <p className="text-[11px] text-slate-500 mb-3">
                عدد الحصص المتغيب فيها في كل مادة
              </p>

              <div className="space-y-1.5 max-h-28 overflow-y-auto">
                {subjectBreakdown.length === 0 ? (
                  <div className="text-xs text-slate-400 py-3 text-center">لا غيابات مسجلة للتلميذ</div>
                ) : (
                  subjectBreakdown.map(sub => (
                    <div key={sub.subject} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700">{sub.subject}</span>
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-sm">
                        {sub.count} حصة
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ===================== ADD NEW ABSENCE FOR THIS STUDENT ===================== */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
            <div className="p-3.5 bg-slate-100/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-800">
                  إضافة غياب محدد في يوم وساعة محددة للتلميذ
                </span>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 px-3 py-1 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                {showAddForm ? 'إلغاء الإضافة' : '+ إضافة غياب الآن'}
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddSubmit} className="p-4 bg-white border-t border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      تاريخ الغياب (اليوم)
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      الحصة / الساعة المحددة
                    </label>
                    <select
                      value={newSession}
                      onChange={e => setNewSession(e.target.value as SessionPeriod)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    >
                      {SESSION_PERIODS.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.id} - {s.time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">المادة الدراسية</label>
                    <select
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    >
                      {SCHOOL_SUBJECTS.map(sub => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">حالة التبرير</label>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="justified"
                          checked={!newIsJustified}
                          onChange={() => setNewIsJustified(false)}
                          className="accent-emerald-600"
                        />
                        <span className="text-amber-800 font-medium">غير مبرر</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="justified"
                          checked={newIsJustified}
                          onChange={() => setNewIsJustified(true)}
                          className="accent-emerald-600"
                        />
                        <span className="text-emerald-800 font-medium">مبرر قانونياً</span>
                      </label>
                    </div>

                    {newIsJustified && (
                      <div className="mt-2">
                        <select
                          value={newReason}
                          onChange={e => setNewReason(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                        >
                          {JUSTIFICATION_REASONS.map(r => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ملاحظة إضافية (اختياري)
                    </label>
                    <input
                      type="text"
                      placeholder="رقم الشهادة الطبية أو ملاحظة الإدارة..."
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer shadow-xs"
                  >
                    حفظ الغياب الجديد في الملف الداخلي
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ===================== DETAILED ABSENCE LOG TABLE ===================== */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  سجل غيابات التلميذ التفصيلي ({studentAbsences.length} حصة)
                </h4>
                <p className="text-[11px] text-slate-500">
                  يمكنك تغيير حالة أي غياب إلى مبرر/غير مبرر، تعديله، أو حذفه بنقرة واحدة
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                مرتب من الأحدث إلى الأقدم
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">التاريخ واليوم</th>
                    <th className="py-2.5 px-3">الحصة والساعة</th>
                    <th className="py-2.5 px-3">المادة</th>
                    <th className="py-2.5 px-3">الحالة والسبب</th>
                    <th className="py-2.5 px-3">ملاحظات</th>
                    <th className="py-2.5 px-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentAbsences.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        لا توجد غيابات مسجلة لهذا التلميذ حتى الآن.
                      </td>
                    </tr>
                  ) : (
                    studentAbsences.map(record => {
                      const sessionObj = SESSION_PERIODS.find(s => s.id === record.session);
                      return (
                        <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Date */}
                          <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                            <div>{formatArabicDate(record.date, true)}</div>
                            <span className="text-[10px] text-slate-400 font-mono">{record.date}</span>
                          </td>

                          {/* Session */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                              {record.session}
                            </span>
                            <span className="text-slate-500 text-[11px] mr-1.5">
                              ({sessionObj?.timeShort || record.session})
                            </span>
                          </td>

                          {/* Subject */}
                          <td className="py-2.5 px-3 text-slate-800 font-medium">{record.subject}</td>

                          {/* Status & Reason */}
                          <td className="py-2.5 px-3">
                            {record.isJustified ? (
                              <div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  مبرر
                                </span>
                                {record.justificationReason && (
                                  <div className="text-[11px] text-slate-600 mt-0.5">
                                    {record.justificationReason}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  غير مبرر
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Notes */}
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                            {record.note || '—'}
                          </td>

                          {/* Action Buttons: Toggle, Edit, Delete */}
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              {/* Toggle Justification */}
                              <button
                                onClick={() => {
                                  if (record.isJustified) {
                                    toggleAbsenceJustification(record.id);
                                  } else {
                                    setJustifyingAbsenceId(record.id);
                                  }
                                }}
                                className={`text-[11px] font-semibold px-2 py-1 rounded-md border transition-colors cursor-pointer ${
                                  record.isJustified
                                    ? 'bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-800 border-slate-200'
                                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200'
                                }`}
                                title={record.isJustified ? 'إلغاء التبرير' : 'تبرير هذا الغياب'}
                              >
                                {record.isJustified ? 'إلغاء التبرير' : 'تبرير الغياب'}
                              </button>

                              {/* Edit Button */}
                              <button
                                onClick={() => onEditAbsence(record)}
                                className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                title="تعديل هذا الغياب (الساعة، اليوم أو المادة)"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() =>
                                  handleDeleteAbsence(
                                    record.id,
                                    record.date,
                                    sessionObj ? sessionObj.timeShort : record.session
                                  )
                                }
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                title="حذف هذا الغياب"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
          </div>
        </div>

        {/* ===================== FOOTER ===================== */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            تاريخ التحديث: {formatArabicDate(getTodayDateString(), true)}
          </span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>

      {/* Modal for selecting justification reason */}
      {justifyingAbsenceId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl p-5 max-w-sm w-full animate-in fade-in duration-150">
            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>تبرير غياب التلميذ</span>
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              حدد سبب التبرير القانوني المعتمد بالإدارة التربوية:
            </p>
            <select
              value={selectedJustifyReason}
              onChange={e => setSelectedJustifyReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 mb-4"
            >
              {JUSTIFICATION_REASONS.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setJustifyingAbsenceId(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmJustification}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer"
              >
                تأكيد التبرير
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
