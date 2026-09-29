import React, { useState } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  RotateCcw,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileJson,
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { getTodayDateString } from '../utils/dateUtils';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ isOpen, onClose }) => {
  const {
    classes,
    students,
    absences,
    exportDataJSON,
    importDataJSON,
    exportCSVReport,
    resetToSampleData,
  } = useAttendance();

  const [importNotice, setImportNotice] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleDownloadJSON = () => {
    const dataStr = exportDataJSON();
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_attendance_database_${getTodayDateString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      const res = importDataJSON(text);
      if (res.success) {
        setImportNotice({ success: true, message: 'تم استرجاع قاعدة البيانات الداخلية بنجاح!' });
      } else {
        setImportNotice({ success: false, message: res.error || 'فشل في استيراد البيانات' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (
      window.confirm(
        'هل أنت متأكد من رغبتك في إعادة ضبط السجلات الداخلية إلى البيانات النموذجية الأولية؟'
      )
    ) {
      resetToSampleData();
      setImportNotice({ success: true, message: 'تمت استعادة البيانات النموذجية الأولية بنجاح.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">إدارة الملفات الداخلية والنسخ الاحتياطي</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs">
          {importNotice && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 ${
                importNotice.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {importNotice.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{importNotice.message}</span>
            </div>
          )}

          {/* Current Database Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="font-bold text-slate-900 text-sm mb-2">إحصائيات الملفات الداخلية الحالية</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[11px] block">الأقسام المسجلة</span>
                <span className="text-base font-bold text-slate-900 font-mono">{classes.length}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[11px] block">مجموع التلاميذ</span>
                <span className="text-base font-bold text-slate-900 font-mono">{students.length}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[11px] block">سجلات الغياب</span>
                <span className="text-base font-bold text-emerald-800 font-mono">{absences.length}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2.5">
              يتم حفظ كافة العمليات والتعديلات تلقائياً في التخزين الداخلي للمتصفح (Local Database).
            </p>
          </div>

          {/* Backup / Export Section */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">تصدير وحفظ النسخ الاحتياطية</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleDownloadJSON}
                className="p-3 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center gap-3 text-right transition-all cursor-pointer group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-emerald-800">
                    تنزيل نسخة احتياطية كاملة (JSON)
                  </div>
                  <div className="text-[11px] text-slate-500">حفظ كافة الأقسام، التلاميذ والغيابات</div>
                </div>
              </button>

              <button
                onClick={() => exportCSVReport()}
                className="p-3 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center gap-3 text-right transition-all cursor-pointer group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-blue-800">
                    تصدير تقرير الغيابات (CSV)
                  </div>
                  <div className="text-[11px] text-slate-500">متوافق مع برنامج Excel ومسار</div>
                </div>
              </button>
            </div>
          </div>

          {/* Restore / Import Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm">استرجاع واستيراد قاعدة بيانات سابقة</h4>
            <label className="p-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/60 hover:bg-emerald-50/20 transition-all text-center">
              <Upload className="w-6 h-6 text-slate-500" />
              <div>
                <span className="font-bold text-slate-800 block text-xs">
                  اختر ملف نسخة احتياطية (backup_attendance_*.json)
                </span>
                <span className="text-[11px] text-slate-500">
                  سيتم استرجاع كافة السجلات والأقسام فوراً
                </span>
              </div>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Reset to Sample Data */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">إعادة ضبط البيانات النموذجية</span>
              <span className="text-[11px] text-slate-500">
                استرجاع قائمة الأقسام (1APIC، 2APIC، TARL) والغيابات التوضيحية
              </span>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
