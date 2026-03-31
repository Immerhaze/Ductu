// app/dashboard/grades/[studentId]/page.jsx
'use client';

import AdminStudentDetail from '../components/admin/AdminStudentDetail';

export default function StudentDetailPage({ params }) {
  const { studentId } = params;

  if (!studentId) {
    return <div className="p-4 text-red-500">Error: ID de estudiante no proporcionado.</div>;
  }

  return <AdminStudentDetail studentId={studentId} />;
}