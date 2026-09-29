import React, { useState, useEffect } from 'react';
import { X, Edit2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { AbsenceRecord, SESSION_PERIODS, SessionPeriod } from '../types';
import { SCHOOL_SUBJECTS, JUSTIFICATION_REASONS } from '../data/mockData';

interface EditAbsenceModalProps {
  absence: AbsenceRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditAbsenceModal: React.FC<EditAbsenceModalProps> = ({
  absence,
  isOpen,
  onClose,
}) => {
  const { students, classes, updateAbsence } = useAttendance();

  const [date, setDate] = useState<string>('');
  const [session, setSession] = useState<SessionPeriod>('S1');
  const [subject, setSubject] = useState<string>(SCHOOL_SUBJECTS[0]);
  const [isJustified, setIsJustified] = useState<boolean>(false);
  const [justificationReason, setJustificationReason] = useState<string>(JUSTIFICATION_REASONS[0]);
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (absence) {
      setDate(absence.date);
      setSession(absence.session);
      setSubject(absence.subject);
      setIsJustified(absence.isJustified);
      setJustificationReason(absence.justificationReason || JUSTIFICATION_REASONS[0]);
      setNote(absence.note || '');
    }
  }, [absence]);

  if (!isOpen || !absence) return null;

  const student = students.find(s => s.id === absence.studentId);
  const studentClass = classes.find(c => c.id === absence.classId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAbsence(absence.id, {
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
            <Edit2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">تعديل تسجيل غياب</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Student Info Box */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="font-bold text-slate-900 text-sm">{student?.fullName}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              رقم مسار: <span className="font-mono text-slate-700">{student?.id}</span> • القسم:{' '}
              {studentClass?.name}
            </div>
          </div>

          {/* Date & Session */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">تاريخ الغياب (اليوم)</label>
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
            <span className="block font-semibold text-slate-700">تعديل حالة التبرير</span>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="edit_justified"
                  checked={!isJustified}
                  onChange={() => setIsJustified(false)}
                  className="accent-emerald-700"
                />
                <span className="text-amber-800 font-semibold">غير مبرر</span>
              </label>

              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="edit_justified"
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
                  سبب التبرير القانوني
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
            <label className="block font-semibold text-slate-700 mb-1">الملاحظات</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="ملاحظة أو رقم الشهادة الطبية..."
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
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
