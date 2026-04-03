// app/dashboard/grades/components/GradesClient.jsx
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAppUser } from "@/components/providers/AppUserContext";
import GradeSelectors from "./GradeSelectors";
import GradeStats from "./GradeStats";
import StudentGradeCard from "./StudentGradeCard";
import AddGradeModal from "./AddGradeModal";
import {
  EmptySelectState,
  EmptyStudentsState,
  EmptySearchState,
  EmptyAssignmentsState,
  LoadingState,
} from "./EmptyState";

export default function GradesClient() {
  const { me } = useAppUser();
  const isAdmin = me?.role === "ADMINISTRATIVE";

  const [assignments, setAssignments]                   = useState([]);
  const [periods, setPeriods]                           = useState([]);
  const [loadingSetup, setLoadingSetup]                 = useState(true);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [selectedPeriodId, setSelectedPeriodId]         = useState("");
  const [students, setStudents]                         = useState([]);
  const [grades, setGrades]                             = useState([]);
  const [policy, setPolicy]                             = useState({ passingGrade: 4.0, scaleMin: 1.0, scaleMax: 7.0 });
  const [loadingGrades, setLoadingGrades]               = useState(false);
  const [search, setSearch]                             = useState("");
  const [modalOpen, setModalOpen]                       = useState(false);
  const [selectedStudent, setSelectedStudent]           = useState(null);
  const [editingGrade, setEditingGrade]                 = useState(null);

  // Esperar a que me cargue antes de hacer fetch
  useEffect(() => {
    if (!me?.role) return;

    async function load() {
      setLoadingSetup(true);
      try {
        const url = isAdmin
          ? "/api/grades/admin-overview"
          : "/api/grades/my-assignments";
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        setAssignments(data.assignments ?? []);
        setPeriods(data.periods ?? []);
        if (data.assignments?.length > 0) setSelectedAssignmentId(data.assignments[0].id);
        const active = data.periods?.find((p) => p.isActive);
        if (active) setSelectedPeriodId(active.id);
        else if (data.periods?.length > 0) setSelectedPeriodId(data.periods[0].id);
      } finally {
        setLoadingSetup(false);
      }
    }

    load();
  }, [me?.role]); // eslint-disable-line

  useEffect(() => {
    if (!selectedAssignmentId || !selectedPeriodId) return;
    async function load() {
      setLoadingGrades(true);
      try {
        const res = await fetch(`/api/grades?assignmentId=${selectedAssignmentId}&periodId=${selectedPeriodId}`);
        if (!res.ok) return;
        const data = await res.json();
        setStudents(data.students ?? []);
        setGrades(data.grades ?? []);
        setPolicy(data.policy ?? { passingGrade: 4.0, scaleMin: 1.0, scaleMax: 7.0 });
      } finally {
        setLoadingGrades(false);
      }
    }
    load();
  }, [selectedAssignmentId, selectedPeriodId]);

  const gradesByStudent = useMemo(() => {
    const map = {};
    grades.forEach((g) => {
      if (!map[g.studentId]) map[g.studentId] = [];
      map[g.studentId].push(g);
    });
    return map;
  }, [grades]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? students.filter((s) => s.fullName?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q))
      : students;
  }, [students, search]);

  const stats = useMemo(() => {
    const avgs = students
      .map((s) => {
        const sg = gradesByStudent[s.id] ?? [];
        if (!sg.length) return null;
        return sg.reduce((a, g) => a + Number(g.value), 0) / sg.length;
      })
      .filter((v) => v !== null);

    const passing = avgs.filter((v) => v >= policy.passingGrade).length;
    const avg = avgs.length
      ? Math.round((avgs.reduce((a, b) => a + b, 0) / avgs.length) * 10) / 10
      : "—";

    return {
      total: students.length,
      withGrades: avgs.length,
      passing,
      failing: avgs.length - passing,
      avg,
    };
  }, [students, gradesByStudent, policy]);

  const selectedAssignment = useMemo(
    () => assignments.find((a) => a.id === selectedAssignmentId),
    [assignments, selectedAssignmentId]
  );

  const openAddGrade = (student) => {
    setSelectedStudent(student);
    setEditingGrade(null);
    setModalOpen(true);
  };

  const openEditGrade = (grade) => {
    setSelectedStudent(students.find((s) => s.id === grade.studentId) ?? null);
    setEditingGrade(grade);
    setModalOpen(true);
  };

  const handleDeleteGrade = useCallback(async (gradeId) => {
    if (!confirm("¿Eliminar esta nota?")) return;
    const res = await fetch(`/api/grades/${gradeId}`, { method: "DELETE" });
    if (res.ok) setGrades((prev) => prev.filter((g) => g.id !== gradeId));
  }, []);

  const handleGradeSaved = useCallback((grade, isEdit) => {
    setGrades((prev) =>
      isEdit
        ? prev.map((g) => (g.id === grade.id ? { ...g, ...grade } : g))
        : [...prev, grade]
    );
  }, []);

  const ready = selectedAssignmentId && selectedPeriodId;

  // Mientras el usuario no carga
  if (!me) return <LoadingState message="Cargando..." />;

  // Mientras cargan las asignaciones
  if (loadingSetup) return <LoadingState message="Cargando asignaciones..." />;

  return (
    <div className="px-12 py-9 bg-gray-50 min-h-screen font-sans">

      {/* Header */}
      <div className="mb-7">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          Calificaciones
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Libro de notas</h1>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {selectedAssignment && (
            <p className="text-sm text-gray-400">
              {selectedAssignment.course.name} · {selectedAssignment.subject.name}
              {isAdmin && selectedAssignment.teacher && (
                <span className="text-gray-300"> · {selectedAssignment.teacher.fullName}</span>
              )}
            </p>
          )}
          {isAdmin && (
            <span className="text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-0.5 rounded-full">
              Vista administrador · solo lectura
            </span>
          )}
        </div>
      </div>

      {/* Sin asignaciones */}
      {assignments.length === 0 ? (
        <EmptyAssignmentsState isAdmin={isAdmin} />
      ) : (
        <>
          <GradeSelectors
            assignments={assignments}
            periods={periods}
            selectedAssignmentId={selectedAssignmentId}
            selectedPeriodId={selectedPeriodId}
            search={search}
            onAssignmentChange={setSelectedAssignmentId}
            onPeriodChange={setSelectedPeriodId}
            onSearchChange={setSearch}
            isAdmin={isAdmin}
          />

          {students.length > 0 && (
            <GradeStats stats={stats} passingGrade={policy.passingGrade} />
          )}

          {!ready ? (
            <EmptySelectState />
          ) : loadingGrades ? (
            <LoadingState message="Cargando notas del curso..." />
          ) : students.length === 0 ? (
            <EmptyStudentsState
              courseName={selectedAssignment?.course.name}
              subjectName={selectedAssignment?.subject.name}
            />
          ) : filteredStudents.length === 0 ? (
            <EmptySearchState search={search} />
          ) : (
            <div className="flex flex-col gap-3">
              {filteredStudents.map((student) => (
                <StudentGradeCard
                  key={student.id}
                  student={student}
                  grades={gradesByStudent[student.id] ?? []}
                  passingGrade={policy.passingGrade}
                  onAddGrade={openAddGrade}
                  onEditGrade={openEditGrade}
                  onDeleteGrade={handleDeleteGrade}
                  readOnly={isAdmin}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal solo para teachers */}
      {!isAdmin && (
        <AddGradeModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={handleGradeSaved}
          assignmentId={selectedAssignmentId}
          periodId={selectedPeriodId}
          student={selectedStudent}
          policy={policy}
          editingGrade={editingGrade}
        />
      )}
    </div>
  );
}