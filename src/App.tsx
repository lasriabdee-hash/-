/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { FastEntryView } from './components/FastEntryView';
import { StudentProfileModal } from './components/StudentProfileModal';
import { AddAbsenceModal } from './components/AddAbsenceModal';
import { EditAbsenceModal } from './components/EditAbsenceModal';
import { DataManagementModal } from './components/DataManagementModal';
import { AbsenceRecord, EducationLevel } from './types';
import { Database, ShieldCheck, HeartHandshake, Layers } from 'lucide-react';

function AttendanceAppContent() {
  const { activeTab, setActiveTab, selectedStudentId, setSelectedStudentId } = useAttendance();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalStudentId, setAddModalStudentId] = useState<string | undefined>(undefined);

  const [editingAbsence, setEditingAbsence] = useState<AbsenceRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Cross-navigation state from Dashboard to Students view
  const [targetClassForStudents, setTargetClassForStudents] = useState<string | undefined>(undefined);
  const [targetLevelForStudents, setTargetLevelForStudents] = useState<EducationLevel | 'all'>('all');

  const handleSelectClassFromDashboard = (classId: string, level: EducationLevel | 'all') => {
    setTargetClassForStudents(classId);
    setTargetLevelForStudents(level);
    setActiveTab('students');
  };

  const handleOpenAddModal = (studentId?: string) => {
    setAddModalStudentId(studentId);
    setIsAddModalOpen(true);
  };

  const handleEditAbsence = (absence: AbsenceRecord) => {
    setEditingAbsence(absence);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-['IBM_Plex_Sans_Arabic',sans-serif]">
      {/* Header */}
      <Header
        onOpenAddModal={() => handleOpenAddModal()}
        onOpenDataModal={() => setIsDataModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onSelectStudent={id => setSelectedStudentId(id)}
            onSelectClassInStudentsView={handleSelectClassFromDashboard}
          />
        )}

        {activeTab === 'students' && (
          <StudentsView
            onSelectStudent={id => setSelectedStudentId(id)}
            onOpenAddModalForStudent={id => handleOpenAddModal(id)}
            initialClassId={targetClassForStudents}
            initialLevel={targetLevelForStudents}
          />
        )}

        {activeTab === 'fast_entry' && <FastEntryView />}

        {activeTab === 'data_management' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3 border border-emerald-200/70">
                  <Database className="w-3.5 h-3.5" />
                  <span>نظام التفريغ والتدبير الداخلي</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  إدارة السجلات وقواعد البيانات الداخلية
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  تم الاستغناء عن تفريغ الملفات الخارجية؛ يتم حفظ كافة حصص الغياب، التبريرات، وتحديثات التلاميذ محلياً وبشكل تلقائي وسريع. يمكنك إجراء نسخ احتياطي أو تصدير واستيراد البيانات في أي وقت.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setIsDataModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Database className="w-4 h-4" />
                    <span>فتح مركز إدارة الملفات والنسخ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>منظومة تتبع وتفريغ الغياب المدرسي الداخلي — جميع الحقوق محفوظة</span>
          </div>
          <div>التفريغ مدمج في ملفات داخلية سريعة مع حفظ محلي دائم</div>
        </div>
      </footer>

      {/* ===================== MODALS ===================== */}
      {/* 1. Student Profile Modal */}
      {selectedStudentId && (
        <StudentProfileModal
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
          onEditAbsence={handleEditAbsence}
        />
      )}

      {/* 2. Add Absence Modal */}
      <AddAbsenceModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddModalStudentId(undefined);
        }}
        preSelectedStudentId={addModalStudentId}
      />

      {/* 3. Edit Absence Modal */}
      <EditAbsenceModal
        absence={editingAbsence}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingAbsence(null);
        }}
      />

      {/* 4. Data Management Modal */}
      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AttendanceProvider>
      <AttendanceAppContent />
    </AttendanceProvider>
  );
}
