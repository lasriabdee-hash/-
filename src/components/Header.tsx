import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  Database,
  Download,
  PlusCircle,
  School,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { formatArabicDate, getTodayDateString } from '../utils/dateUtils';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenDataModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal, onOpenDataModal }) => {
  const { activeTab, setActiveTab, absences, exportCSVReport } = useAttendance();
  const todayStr = getTodayDateString();

  const totalAbsences = absences.length;
  const unjustifiedCount = absences.filter(a => !a.isJustified).length;
  const justifiedCount = absences.filter(a => a.isJustified).length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & School Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                  منظومة تتبع وإحصائيات الغياب المدرسي
                </h1>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                  تدبير داخلي
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                تفريغ رقمي مباشر، إحصائيات المستويات والأقسام، وملفات المتابعة الفردية للتلاميذ
              </p>
            </div>
          </div>

          {/* Quick Date & Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100/90 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>اليوم: {formatArabicDate(todayStr, true)}</span>
            </div>

            {/* Quick Metrics Tag */}
            <div className="flex items-center gap-1 text-xs">
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/70 px-2.5 py-1 rounded-lg font-medium" title="الغيابات غير المبررة المسجلة">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{unjustifiedCount} غير مبرر</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/70 px-2.5 py-1 rounded-lg font-medium" title="الغيابات المبررة">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{justifiedCount} مبرر</span>
              </span>
            </div>

            {/* Add Absence Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs md:text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>تسجيل غياب</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={() => exportCSVReport()}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs md:text-sm font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="تصدير كشف الغياب الكامل CSV"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span className="hidden md:inline">تصدير CSV</span>
            </button>

            {/* Database & Backup */}
            <button
              onClick={onOpenDataModal}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs md:text-sm font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="النسخ الاحتياطي وإدارة الملفات الداخلية"
            >
              <Database className="w-4 h-4 text-slate-600" />
              <span className="hidden lg:inline">الملفات والنسخ</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 mt-3.5 border-t border-slate-100 pt-2.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>لوحة إحصائيات الأقسام</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'students'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>لائحة وإحصائيات التلاميذ</span>
          </button>

          <button
            onClick={() => setActiveTab('fast_entry')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'fast_entry'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <CalendarCheck2 className="w-4 h-4" />
            <span>تفريغ وتعبئة حصة</span>
          </button>

          <button
            onClick={() => setActiveTab('data_management')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'data_management'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>الملفات الداخلية والنسخ الاحتياطي</span>
          </button>
        </div>
      </div>
    </header>
  );
};
