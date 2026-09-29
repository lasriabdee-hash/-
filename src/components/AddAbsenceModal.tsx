import React, { useState, useMemo } from 'react';
import { X, PlusCircle, CheckCircle2, AlertTriangle, Calendar, Clock, BookOpen, User } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { EducationLevel, SESSION_PERIODS, SessionPeriod } from '../types';
import { getTodayDateString } from '../utils/dateUtils';
import { SCHOOL_SUBJECTS, JUSTIFICATION_REASONS } from '../data/mockData';

interface AddAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedStudentId?: string;
}

export const AddAbsenceModal: React.FC<AddAbsenceModalProps> = ({
  isOpen,
  onClose,
  preSelectedStudentId,
}) => {
  const { classes, students, addAbsence } = useAttendance();
  const todayStr = getTodayDateString();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(preSelectedStudentId || '');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [date, setDate] = useState<string>(todayStr);
  const [session, setSession] = useState<SessionPeriod>('S1');
  const [subject, setSubject] = useState<string>(SCHOOL_SUBJECTS[0]);
  const [isJustified, setIsJustified] = useState<boolean>(false);
  const [justificationReason, setJustificationReason] = useState<string>(JUSTIFICATION_REASONS[0]);
  const [note, setNote] = useState<string>('');

  // Sync preSelectedStudentId if provided
  React.useEffect(() => {
    if (preSelectedStudentId) {
      setSelectedStudentId(preSelectedStudentId);
      const st = students.find(s => s.id === preSelectedStudentId);
      if (st) setSelectedClassId(st.classId);
    } else if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
      setSelectedClassId(students[0].classId);
    }
  }, [preSelectedStudentId, students]);

  // Filter students based on class selection
  const availableStudents = useMemo(() => {
    if (selectedClassId === 'all') return students;
    return students.filter(s => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    addAbsence({
      studentId: student.id,
      classId: student.classId,
      date,
      session,
      subject,
      isJustified,
      justificationReason: isJustified ? justificationReason : undefined,
      justificationDate: isJustified ? date : undefined,
      note: note ? note : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">تسجيل غياب جديد (تفريغ داخلي)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Class Filter if no student preselected */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">القسم / المجموعة</label>
            <select
              value={selectedClassId}
              onChange={e => {
                const newClass = e.target.value;
                setSelectedClassId(newClass);
                const firstStudent = students.find(
                  s => newClass === 'all' || s.classId === newClass
                );
                if (firstStudent) setSelectedStudentId(firstStudent.id);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
            >
              <option value="all">جميع الأقسام</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.levelLabel})
                </option>
              ))}
            </select>
          </div>

          {/* Student Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">التلميذ المعني</label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium"
            >
              {availableStudents.map(st => (
                <option key={st.id} value={st.id}>
                  {st.fullName} — {st.id} ({st.classId})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Session */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">تاريخ الغياب</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">الحصة والساعة</label>
              <select
                value={session}
                onChange={e => setSession(e.target.value as SessionPeriod)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              >
                {SESSION_PERIODS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.id} — {s.time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">المادة الدراسية</label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
            >
              {SCHOOL_SUBJECTS.map(sub => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Justification Status */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
            <span className="block font-semibold text-slate-700">حالة تبرير الغياب</span>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="modal_justified"
                  checked={!isJustified}
                  onChange={() => setIsJustified(false)}
                  className="accent-emerald-700"
                />
                <span className="text-amber-800 font-semibold">غير مبرر</span>
              </label>

              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="modal_justified"
                  checked={isJustified}
                  onChange={() => setIsJustified(true)}
                  className="accent-emerald-700"
                />
                <span className="text-emerald-800 font-semibold">مبرر قانونياً</span>
              </label>
            </div>

            {isJustified && (
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  سبب التبرير
                </label>
                <select
                  value={justificationReason}
                  onChange={e => setJustificationReason(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800"
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

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ملاحظة إضافية (اختياري)
            </label>
            <input
              type="text"
              placeholder="مثال: رقم الشهادة الطبية أو تبرير الولي..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs cursor-pointer"
            >
              تسجيل الغياب
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
