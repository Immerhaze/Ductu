'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { createInvitation } from '@/lib/server/actions/invitations';

const ROLES = [
  { label: 'Administrativo', value: 'ADMINISTRATIVE' },
  { label: 'Docente',        value: 'TEACHER' },
  { label: 'Estudiante',     value: 'STUDENT' },
];

const POSITION_HINTS = {
  ADMINISTRATIVE: 'Ej: Director, Coordinador Académico, Secretaria',
  TEACHER:        'Ej: Profesor de Matemáticas, Profesor de Historia',
  STUDENT:        'Opcional · Ej: Delegado de curso',
};

export default function InviteUserModal({ open, onClose, onInvited }) {
  const [email, setEmail]                 = useState('');
  const [role, setRole]                   = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');

  const [courses, setCourses]         = useState([]);
  const [subjects, setSubjects]       = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');

  const [studentCourseId, setStudentCourseId] = useState('');
  const [teacherAssignments, setTeacherAssignments] = useState([]);

  const needsCourses = role === 'STUDENT' || role === 'TEACHER';

  const loadData = async () => {
    if (courses.length > 0) return;
    setDataLoading(true);
    try {
      const [coursesRes, subjectsRes] = await Promise.all([
        fetch('/api/courses?onlyActive=1'),
        fetch('/api/subjects'),
      ]);
      const coursesData  = await coursesRes.json();
      const subjectsData = await subjectsRes.json();
      setCourses(Array.isArray(coursesData?.courses) ? coursesData.courses : []);
      setSubjects(Array.isArray(subjectsData?.subjects) ? subjectsData.subjects : []);
    } catch {
      setError('No se pudieron cargar los cursos o asignaturas.');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (open && needsCourses) loadData();
  }, [open, needsCourses]); // eslint-disable-line

  useEffect(() => {
    setStudentCourseId('');
    setTeacherAssignments([]);
    setCourseSearch('');
    setPositionTitle('');
    setError('');
  }, [role]);

  useEffect(() => {
    if (!open) {
      setEmail(''); setRole(''); setPositionTitle('');
      setStudentCourseId(''); setTeacherAssignments([]);
      setCourseSearch(''); setError('');
    }
  }, [open]);

  const filteredCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    return courses
      .filter((c) => c?.isActive !== false)
      .filter((c) => q ? c.name.toLowerCase().includes(q) : true)
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [courses, courseSearch]);

  const toggleTeacherCourse = (courseId) => {
    setTeacherAssignments((prev) => {
      const exists = prev.find((a) => a.courseId === courseId);
      if (exists) return prev.filter((a) => a.courseId !== courseId);
      return [...prev, { courseId, subjectId: '', isChief: false }];
    });
  };

  const updateAssignment = (courseId, field, value) => {
    setTeacherAssignments((prev) =>
      prev.map((a) => {
        if (field === 'isChief' && value === true && a.courseId !== courseId) {
          return { ...a, isChief: false };
        }
        if (a.courseId !== courseId) return a;
        return { ...a, [field]: value };
      })
    );
  };

  const canSubmit = useMemo(() => {
    if (!email.trim() || !role) return false;
    if (role === 'STUDENT') return Boolean(studentCourseId);
    if (role === 'TEACHER') {
      if (teacherAssignments.length === 0) return false;
      return teacherAssignments.every((a) => a.subjectId);
    }
    return true;
  }, [email, role, studentCourseId, teacherAssignments]);

  const handleInvite = async () => {
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await createInvitation({
        email: email.trim().toLowerCase(),
        role,
        positionTitle,
        studentCourseId: role === 'STUDENT' ? studentCourseId : null,
        teacherCourseAssignments: role === 'TEACHER' ? teacherAssignments : [],
      });
      await onInvited?.({ email, role });
      onClose?.();
    } catch (e) {
      setError(e?.message ?? 'Error creando invitación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose?.(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invitar usuario</DialogTitle>
          <DialogDescription>
            Se creará la invitación y se enviará un email automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">

          {/* Email */}
          <div>
            <Label>Email *</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@correo.com"
              disabled={loading}
            />
          </div>

          {/* Rol */}
          <div>
            <Label>Rol *</Label>
            <Select value={role} onValueChange={setRole} disabled={loading}>
              <SelectTrigger><SelectValue placeholder="Selecciona un rol" /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cargo */}
          {role && (
            <div>
              <Label>
                Cargo / Título
                {role === 'ADMINISTRATIVE' ? ' *' : ' (opcional)'}
              </Label>
              <Input
                value={positionTitle}
                onChange={(e) => setPositionTitle(e.target.value)}
                placeholder={POSITION_HINTS[role] ?? ''}
                disabled={loading}
              />
            </div>
          )}

          {/* Cursos */}
          {needsCourses && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>
                  {role === 'STUDENT' ? 'Curso *' : 'Cursos y asignaturas *'}
                </Label>
                {dataLoading && (
                  <span className="text-xs text-muted-foreground">Cargando...</span>
                )}
              </div>

              <Input
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Buscar curso..."
                disabled={loading || dataLoading}
              />

              {/* STUDENT: radio */}
              {role === 'STUDENT' && (
                <div className="max-h-52 overflow-auto border rounded-lg p-2 space-y-2">
                  {filteredCourses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay cursos disponibles.</p>
                  ) : filteredCourses.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="student-course"
                        checked={studentCourseId === c.id}
                        onChange={() => setStudentCourseId(c.id)}
                        disabled={loading}
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              )}

              {/* TEACHER: checkbox + asignatura + jefatura */}
              {role === 'TEACHER' && (
                <div className="space-y-2">
                  <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                    {filteredCourses.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-3">
                        No hay cursos disponibles.
                      </p>
                    ) : filteredCourses.map((c) => {
                      const assignment = teacherAssignments.find((a) => a.courseId === c.id);
                      const isSelected = Boolean(assignment);

                      return (
                        <div
                          key={c.id}
                          className={`p-3 space-y-2 transition-colors ${isSelected ? 'bg-indigo-50' : ''}`}
                        >
                          {/* Checkbox + jefatura */}
                          <div className="flex items-center justify-between gap-3">
                            <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleTeacherCourse(c.id)}
                                disabled={loading}
                              />
                              {c.name}
                            </label>

                            {isSelected && (
                              <label className="flex items-center gap-1.5 text-xs text-blue-700 cursor-pointer select-none">
                                <input
                                  type="radio"
                                  name="teacher-chief"
                                  checked={assignment?.isChief ?? false}
                                  onChange={() => updateAssignment(c.id, 'isChief', true)}
                                  disabled={loading}
                                />
                                Profesor jefe
                              </label>
                            )}
                          </div>

                          {/* Selector de asignatura — select nativo para evitar z-index issues */}
                          {isSelected && (
                            <div className="pl-6 flex flex-col gap-1">
                              <select
                                value={assignment?.subjectId ?? ''}
                                onChange={(e) => updateAssignment(c.id, 'subjectId', e.target.value)}
                                disabled={loading || subjects.length === 0}
                                className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                              >
                                <option value="">— Selecciona asignatura —</option>
                                {subjects.map((s) => (
                                  <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                              </select>
                              {!assignment?.subjectId && (
                                <p className="text-xs text-red-500">Asignatura requerida</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Resumen */}
                  {teacherAssignments.length > 0 && (
                    <div className="text-xs text-muted-foreground bg-gray-50 rounded-lg px-3 py-2">
                      {teacherAssignments.length} curso{teacherAssignments.length > 1 ? 's' : ''} seleccionado{teacherAssignments.length > 1 ? 's' : ''} ·{' '}
                      {teacherAssignments.filter((a) => a.subjectId).length} con asignatura ·{' '}
                      {teacherAssignments.some((a) => a.isChief) ? '1 profesor jefe' : 'sin jefatura asignada'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleInvite}
            disabled={loading || !canSubmit}
            className="bg-blue-950 hover:bg-blue-900"
          >
            {loading ? 'Enviando...' : 'Enviar invitación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}