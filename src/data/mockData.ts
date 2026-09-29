import { ClassGroup, Student, AbsenceRecord } from '../types';

export const INITIAL_CLASSES: ClassGroup[] = [
  // الأولى إعدادي
  { id: '1APIC-1', name: '1APIC-1 (الأولى 1)', level: '1APIC', levelLabel: 'الأولى إعدادي', room: 'قاعة 1', tutorTeacher: 'أ. المنصوري' },
  { id: '1APIC-2', name: '1APIC-2 (الأولى 2)', level: '1APIC', levelLabel: 'الأولى إعدادي', room: 'قاعة 2', tutorTeacher: 'أ. العلوي' },
  { id: '1APIC-3', name: '1APIC-3 (الأولى 3)', level: '1APIC', levelLabel: 'الأولى إعدادي', room: 'قاعة 3', tutorTeacher: 'أ. التازي' },

  // الثانية إعدادي
  { id: '2APIC-1', name: '2APIC-1 (الثانية 1)', level: '2APIC', levelLabel: 'الثانية إعدادي', room: 'قاعة 4', tutorTeacher: 'أ. العمراني' },
  { id: '2APIC-2', name: '2APIC-2 (الثانية 2)', level: '2APIC', levelLabel: 'الثانية إعدادي', room: 'قاعة 5', tutorTeacher: 'أ. بنسعيد' },
  { id: '2APIC-10', name: 'TARL-2APIC-10 (مجموعة الدعم)', level: '2APIC', levelLabel: 'الثانية إعدادي', room: 'قاعة الدعم 2', tutorTeacher: 'أ. الصديقي' },

  // الثالثة إعدادي
  { id: '3APIC-1', name: '3APIC-1 (الثالثة 1)', level: '3APIC', levelLabel: 'الثالثة إعدادي', room: 'قاعة 7', tutorTeacher: 'أ. الوردي' },
  { id: '3APIC-2', name: '3APIC-2 (الثالثة 2)', level: '3APIC', levelLabel: 'الثالثة إعدادي', room: 'قاعة 8', tutorTeacher: 'أ. الفاسي' },
];

export const SCHOOL_SUBJECTS = [
  'الرياضيات',
  'اللغة العربية',
  'اللغة الفرنسية',
  'العلوم الفيزيائية',
  'علوم الحياة والأرض',
  'الاجتماعيات',
  'التربية الإسلامية',
  'اللغة الإنجليزية',
  'الإعلاميات',
  'التربية البدنية',
];

export const JUSTIFICATION_REASONS = [
  'شهادة طبية معتمدة',
  'ترخيص كتابي من الإدارة التربوية',
  'ظرف عائلي قاهر مبرر',
  'استدعاء رسمي للمشاركة في نشاط مدرسي',
  'إشعار مسبق من ولي الأمر',
  'حادث طارئ مبرر',
];

// Generate authentic student rosters
export const INITIAL_STUDENTS: Student[] = [
  // 2APIC-10 (TARL Group)
  { id: 'R180039027', firstName: 'محمد أمين', lastName: 'المكطع', fullName: 'المكطع محمد أمين', gender: 'M', classId: '2APIC-10', level: '2APIC', orderInClass: 1, guardianPhone: '0661234501' },
  { id: 'R180039028', firstName: 'فاطمة الزهراء', lastName: 'الإدريسي', fullName: 'الإدريسي فاطمة الزهراء', gender: 'F', classId: '2APIC-10', level: '2APIC', orderInClass: 2, guardianPhone: '0661234502' },
  { id: 'R180039029', firstName: 'يوسف', lastName: 'بنجلون', fullName: 'بنجلون يوسف', gender: 'M', classId: '2APIC-10', level: '2APIC', orderInClass: 3, guardianPhone: '0661234503' },
  { id: 'R180039030', firstName: 'سلمى', lastName: 'المرابط', fullName: 'المرابط سلمى', gender: 'F', classId: '2APIC-10', level: '2APIC', orderInClass: 4, guardianPhone: '0661234504' },
  { id: 'R180039031', firstName: 'أيوب', lastName: 'العمراني', fullName: 'العمراني أيوب', gender: 'M', classId: '2APIC-10', level: '2APIC', orderInClass: 5, guardianPhone: '0661234505' },
  { id: 'R180039032', firstName: 'هبة', lastName: 'التازي', fullName: 'التازي هبة', gender: 'F', classId: '2APIC-10', level: '2APIC', orderInClass: 6, guardianPhone: '0661234506' },
  { id: 'R180039033', firstName: 'أحمد', lastName: 'الصديقي', fullName: 'الصديقي أحمد', gender: 'M', classId: '2APIC-10', level: '2APIC', orderInClass: 7, guardianPhone: '0661234507' },
  { id: 'R180039034', firstName: 'خديجة', lastName: 'بنسعيد', fullName: 'بنسعيد خديجة', gender: 'F', classId: '2APIC-10', level: '2APIC', orderInClass: 8, guardianPhone: '0661234508' },
  { id: 'R180039035', firstName: 'حمزة', lastName: 'الشريف', fullName: 'الشريف حمزة', gender: 'M', classId: '2APIC-10', level: '2APIC', orderInClass: 9, guardianPhone: '0661234509' },
  { id: 'R180039036', firstName: 'زينب', lastName: 'العلوي', fullName: 'العلوي زينب', gender: 'F', classId: '2APIC-10', level: '2APIC', orderInClass: 10, guardianPhone: '0661234510' },
  { id: 'R180039037', firstName: 'عمر', lastName: 'الناصري', fullName: 'الناصري عمر', gender: 'M', classId: '2APIC-10', level: '2APIC', orderInClass: 11, guardianPhone: '0661234511' },
  { id: 'R180039038', firstName: 'مريم', lastName: 'المنصوري', fullName: 'المنصوري مريم', gender: 'F', classId: '2APIC-10', level: '2APIC', orderInClass: 12, guardianPhone: '0661234512' },
  { id: 'R180039039', firstName: 'إلياس', lastName: 'الفاسي', fullName: 'الفاسي إلياس', gender: 'M', classId: '2APIC-10', level: '2APIC', orderInClass: 13, guardianPhone: '0661234513' },
  { id: 'R180039040', firstName: 'آية', lastName: 'الوردي', fullName: 'الوردي آية', gender: 'F', classId: '2APIC-10', level: '2APIC', orderInClass: 14, guardianPhone: '0661234514' },
  { id: 'R180039041', firstName: 'سعد', lastName: 'أحلامين', fullName: 'أحلامين سعد', gender: 'M', classId: '2APIC-10', level: '2APIC', orderInClass: 15, guardianPhone: '0661234515' },

  // 1APIC-1 (الأوليات)
  { id: 'R190011201', firstName: 'آدم', lastName: 'اليزيدي', fullName: 'اليزيدي آدم', gender: 'M', classId: '1APIC-1', level: '1APIC', orderInClass: 1, guardianPhone: '0662211001' },
  { id: 'R190011202', firstName: 'دعاء', lastName: 'البرنوصي', fullName: 'البرنوصي دعاء', gender: 'F', classId: '1APIC-1', level: '1APIC', orderInClass: 2, guardianPhone: '0662211002' },
  { id: 'R190011203', firstName: 'ريان', lastName: 'البورقادي', fullName: 'البورقادي ريان', gender: 'M', classId: '1APIC-1', level: '1APIC', orderInClass: 3, guardianPhone: '0662211003' },
  { id: 'R190011204', firstName: 'سارة', lastName: 'الزهراوي', fullName: 'الزهراوي سارة', gender: 'F', classId: '1APIC-1', level: '1APIC', orderInClass: 4, guardianPhone: '0662211004' },
  { id: 'R190011205', firstName: 'وليد', lastName: 'الكوهن', fullName: 'الكوهن وليد', gender: 'M', classId: '1APIC-1', level: '1APIC', orderInClass: 5, guardianPhone: '0662211005' },
  { id: 'R190011206', firstName: 'أسماء', lastName: 'الركراكي', fullName: 'الركراكي أسماء', gender: 'F', classId: '1APIC-1', level: '1APIC', orderInClass: 6, guardianPhone: '0662211006' },
  { id: 'R190011207', firstName: 'طه', lastName: 'الصنهاجي', fullName: 'الصنهاجي طه', gender: 'M', classId: '1APIC-1', level: '1APIC', orderInClass: 7, guardianPhone: '0662211007' },
  { id: 'R190011208', firstName: 'نور الهدى', lastName: 'المتوكل', fullName: 'المتوكل نور الهدى', gender: 'F', classId: '1APIC-1', level: '1APIC', orderInClass: 8, guardianPhone: '0662211008' },
  { id: 'R190011209', firstName: 'ياسين', lastName: 'الداودي', fullName: 'الداودي ياسين', gender: 'M', classId: '1APIC-1', level: '1APIC', orderInClass: 9, guardianPhone: '0662211009' },
  { id: 'R190011210', firstName: 'إكرام', lastName: 'الحدادي', fullName: 'الحدادي إكرام', gender: 'F', classId: '1APIC-1', level: '1APIC', orderInClass: 10, guardianPhone: '0662211010' },

  // 1APIC-2
  { id: 'R190022301', firstName: 'بلال', lastName: 'المريني', fullName: 'المريني بلال', gender: 'M', classId: '1APIC-2', level: '1APIC', orderInClass: 1, guardianPhone: '0663322001' },
  { id: 'R190022302', firstName: 'أميمة', lastName: 'الزويني', fullName: 'الزويني أميمة', gender: 'F', classId: '1APIC-2', level: '1APIC', orderInClass: 2, guardianPhone: '0663322002' },
  { id: 'R190022303', firstName: 'سامي', lastName: 'الوزاني', fullName: 'الوزاني سامي', gender: 'M', classId: '1APIC-2', level: '1APIC', orderInClass: 3, guardianPhone: '0663322003' },
  { id: 'R190022304', firstName: 'رانية', lastName: 'البقالي', fullName: 'البقالي رانية', gender: 'F', classId: '1APIC-2', level: '1APIC', orderInClass: 4, guardianPhone: '0663322004' },
  { id: 'R190022305', firstName: 'أنس', lastName: 'الشرقاوي', fullName: 'الشرقاوي أنس', gender: 'M', classId: '1APIC-2', level: '1APIC', orderInClass: 5, guardianPhone: '0663322005' },
  { id: 'R190022306', firstName: 'حسناء', lastName: 'الغماري', fullName: 'الغماري حسناء', gender: 'F', classId: '1APIC-2', level: '1APIC', orderInClass: 6, guardianPhone: '0663322006' },

  // 2APIC-1 (الثانيات)
  { id: 'R180011101', firstName: 'مهدي', lastName: 'الكتاني', fullName: 'الكتاني مهدي', gender: 'M', classId: '2APIC-1', level: '2APIC', orderInClass: 1, guardianPhone: '0664433001' },
  { id: 'R180011102', firstName: 'شيماء', lastName: 'الحسني', fullName: 'الحسني شيماء', gender: 'F', classId: '2APIC-1', level: '2APIC', orderInClass: 2, guardianPhone: '0664433002' },
  { id: 'R180011103', firstName: 'أمين', lastName: 'الغزواني', fullName: 'الغزواني أمين', gender: 'M', classId: '2APIC-1', level: '2APIC', orderInClass: 3, guardianPhone: '0664433003' },
  { id: 'R180011104', firstName: 'هاجر', lastName: 'الشكراوي', fullName: 'الشكراوي هاجر', gender: 'F', classId: '2APIC-1', level: '2APIC', orderInClass: 4, guardianPhone: '0664433004' },
  { id: 'R180011105', firstName: 'طارق', lastName: 'البوعناني', fullName: 'البوعناني طارق', gender: 'M', classId: '2APIC-1', level: '2APIC', orderInClass: 5, guardianPhone: '0664433005' },

  // 3APIC-1 (الثالثات)
  { id: 'R170055401', firstName: 'عثمان', lastName: 'السباعي', fullName: 'السباعي عثمان', gender: 'M', classId: '3APIC-1', level: '3APIC', orderInClass: 1, guardianPhone: '0665544001' },
  { id: 'R170055402', firstName: 'وئام', lastName: 'العلمي', fullName: 'العلمي وئام', gender: 'F', classId: '3APIC-1', level: '3APIC', orderInClass: 2, guardianPhone: '0665544002' },
  { id: 'R170055403', firstName: 'نبيل', lastName: 'الزروالي', fullName: 'الزروالي نبيل', gender: 'M', classId: '3APIC-1', level: '3APIC', orderInClass: 3, guardianPhone: '0665544003' },
  { id: 'R170055404', firstName: 'فردوس', lastName: 'اليعقوبي', fullName: 'اليعقوبي فردوس', gender: 'F', classId: '3APIC-1', level: '3APIC', orderInClass: 4, guardianPhone: '0665544004' },
  { id: 'R170055405', firstName: 'رضى', lastName: 'التلمساني', fullName: 'التلمساني رضى', gender: 'M', classId: '3APIC-1', level: '3APIC', orderInClass: 5, guardianPhone: '0665544005' },
];

// Helper to generate realistic sample absences
function createSampleAbsences(): AbsenceRecord[] {
  const records: AbsenceRecord[] = [];
  let idCounter = 1;

  const datesAndData = [
    // Today & recent days in Sept 2026
    { date: '2026-09-29', studentId: 'R180039027', classId: '2APIC-10', session: 'S1' as const, subject: 'الرياضيات', justified: false },
    { date: '2026-09-29', studentId: 'R180039027', classId: '2APIC-10', session: 'S2' as const, subject: 'الرياضيات', justified: false },
    { date: '2026-09-29', studentId: 'R180039031', classId: '2APIC-10', session: 'S5' as const, subject: 'اللغة الفرنسية', justified: true, reason: 'إشعار مسبق من ولي الأمر' },
    { date: '2026-09-29', studentId: 'R190011201', classId: '1APIC-1', session: 'S1' as const, subject: 'اللغة العربية', justified: false },
    { date: '2026-09-29', studentId: 'R190011205', classId: '1APIC-1', session: 'S4' as const, subject: 'التربية الإسلامية', justified: true, reason: 'ترخيص كتابي من الإدارة التربوية' },
    
    // Yesterday
    { date: '2026-09-28', studentId: 'R180039029', classId: '2APIC-10', session: 'S3' as const, subject: 'علوم الحياة والأرض', justified: false },
    { date: '2026-09-28', studentId: 'R180039035', classId: '2APIC-10', session: 'S1' as const, subject: 'العلوم الفيزيائية', justified: true, reason: 'شهادة طبية معتمدة' },
    { date: '2026-09-28', studentId: 'R180039035', classId: '2APIC-10', session: 'S2' as const, subject: 'العلوم الفيزيائية', justified: true, reason: 'شهادة طبية معتمدة' },
    { date: '2026-09-28', studentId: 'R190022301', classId: '1APIC-2', session: 'S7' as const, subject: 'الاجتماعيات', justified: false },
    { date: '2026-09-28', studentId: 'R170055401', classId: '3APIC-1', session: 'S1' as const, subject: 'الرياضيات', justified: false },

    // Last week (Sept 21-26)
    { date: '2026-09-25', studentId: 'R180039027', classId: '2APIC-10', session: 'S5' as const, subject: 'اللغة الإنجليزية', justified: false },
    { date: '2026-09-25', studentId: 'R180039037', classId: '2APIC-10', session: 'S6' as const, subject: 'التربية البدنية', justified: false },
    { date: '2026-09-24', studentId: 'R180039033', classId: '2APIC-10', session: 'S2' as const, subject: 'اللغة الفرنسية', justified: true, reason: 'ظرف عائلي قاهر مبرر' },
    { date: '2026-09-24', studentId: 'R180039033', classId: '2APIC-10', session: 'S3' as const, subject: 'اللغة الفرنسية', justified: true, reason: 'ظرف عائلي قاهر مبرر' },
    { date: '2026-09-23', studentId: 'R190011203', classId: '1APIC-1', session: 'S1' as const, subject: 'الرياضيات', justified: false },
    { date: '2026-09-23', studentId: 'R190011209', classId: '1APIC-1', session: 'S1' as const, subject: 'الرياضيات', justified: false },
    { date: '2026-09-22', studentId: 'R180011101', classId: '2APIC-1', session: 'S3' as const, subject: 'اللغة العربية', justified: true, reason: 'شهادة طبية معتمدة' },
    { date: '2026-09-22', studentId: 'R180011101', classId: '2APIC-1', session: 'S4' as const, subject: 'اللغة العربية', justified: true, reason: 'شهادة طبية معتمدة' },
    { date: '2026-09-21', studentId: 'R180039027', classId: '2APIC-10', session: 'S1' as const, subject: 'الرياضيات', justified: false },

    // Middle of September (Sept 14-19 - matches TARL sheet mentioned in notebook)
    { date: '2026-09-18', studentId: 'R180039027', classId: '2APIC-10', session: 'S3' as const, subject: 'اللغة العربية', justified: true, reason: 'شهادة طبية معتمدة' },
    { date: '2026-09-17', studentId: 'R180039041', classId: '2APIC-10', session: 'S7' as const, subject: 'الإعلاميات', justified: false },
    { date: '2026-09-16', studentId: 'R180039030', classId: '2APIC-10', session: 'S2' as const, subject: 'الرياضيات', justified: false },
    { date: '2026-09-15', studentId: 'R190011201', classId: '1APIC-1', session: 'S5' as const, subject: 'العلوم الفيزيائية', justified: false },
    { date: '2026-09-15', studentId: 'R190011201', classId: '1APIC-1', session: 'S6' as const, subject: 'العلوم الفيزيائية', justified: false },
    { date: '2026-09-14', studentId: 'R170055403', classId: '3APIC-1', session: 'S1' as const, subject: 'اللغة الفرنسية', justified: false },
    { date: '2026-09-14', studentId: 'R170055404', classId: '3APIC-1', session: 'S2' as const, subject: 'اللغة الفرنسية', justified: true, reason: 'ترخيص كتابي من الإدارة التربوية' },

    // Previous month (October/November or earlier dates for multi-month stats test)
    { date: '2026-09-10', studentId: 'R180039029', classId: '2APIC-10', session: 'S1' as const, subject: 'التربية الإسلامية', justified: false },
    { date: '2026-09-09', studentId: 'R180039035', classId: '2APIC-10', session: 'S8' as const, subject: 'التربية البدنية', justified: false },
    { date: '2026-09-08', studentId: 'R190022305', classId: '1APIC-2', session: 'S2' as const, subject: 'الرياضيات', justified: true, reason: 'شهادة طبية معتمدة' },
    { date: '2026-09-07', studentId: 'R180011104', classId: '2APIC-1', session: 'S4' as const, subject: 'الاجتماعيات', justified: false },
    { date: '2026-09-04', studentId: 'R180039027', classId: '2APIC-10', session: 'S5' as const, subject: 'علوم الحياة والأرض', justified: false },
    { date: '2026-09-03', studentId: 'R170055401', classId: '3APIC-1', session: 'S6' as const, subject: 'الرياضيات', justified: false },
    { date: '2026-09-02', studentId: 'R180039031', classId: '2APIC-10', session: 'S1' as const, subject: 'اللغة العربية', justified: true, reason: 'إشعار مسبق من ولي الأمر' },
  ];

  datesAndData.forEach(item => {
    records.push({
      id: `abs-${idCounter++}`,
      studentId: item.studentId,
      classId: item.classId,
      date: item.date,
      session: item.session,
      subject: item.subject,
      isJustified: item.justified,
      justificationReason: item.reason,
      justificationDate: item.justified ? item.date : undefined,
      note: item.justified ? 'تم التأشير بالإدارة' : undefined,
      createdAt: `${item.date}T08:30:00.000Z`,
    });
  });

  return records;
}

export const INITIAL_ABSENCES: AbsenceRecord[] = createSampleAbsences();
