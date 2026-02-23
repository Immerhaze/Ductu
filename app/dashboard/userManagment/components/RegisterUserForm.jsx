'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import { createInvitation } from '../../invitations/actions';

export default function InviteUserModal({ open, onClose, onInvited }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(''); // 'ADMINISTRATIVE' | 'TEACHER' | 'STUDENT'
  const [loading, setLoading] = useState(false);

  // Cursos (selector)
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState('');
  const [courses, setCourses] = useState([]); // [{id,name,isActive}]
  const [courseSearch, setCourseSearch] = useState('');

  // STUDENT: 1 curso
  const [studentCourseId, setStudentCourseId] = useState('');

  // TEACHER: N cursos + (opcional) 1 curso jefe
  const [teacherCourseIds, setTeacherCourseIds] = useState([]);
  const [teacherChiefCourseId, setTeacherChiefCourseId] = useState(''); // 0..1

  const roles = [
    { label: 'Administrador', value: 'ADMINISTRATIVE' },
    { label: 'Profesor', value: 'TEACHER' },
    { label: 'Estudiante', value: 'STUDENT' },
  ];

  const needsCourses = role === 'STUDENT' || role === 'TEACHER';

  const ensureCoursesLoaded = async () => {
    if (coursesLoading) return;
    if (courses.length > 0) return;

    setCoursesLoading(true);
    setCoursesError('');

    try {
      // Endpoint sugerido: GET /api/courses?onlyActive=1
      const res = await fetch('/api/courses?onlyActive=1', { method: 'GET' });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'No se pudieron cargar los cursos.');
      }
      const data = await res.json();
      setCourses(Array.isArray(data?.courses) ? data.courses : []);
    } catch (e) {
      setCoursesError(e?.message || 'No se pudieron cargar los cursos.');
    } finally {
      setCoursesLoading(false);
    }
  };

  // Cargar cursos cuando el modal abre y el rol requiere cursos
  useEffect(() => {
    if (!open) return;
    if (!needsCourses) return;
    ensureCoursesLoaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, needsCourses]);

  // Reset asignaciones cuando cambia el rol
  useEffect(() => {
    setStudentCourseId('');
    setTeacherCourseIds([]);
    setTeacherChiefCourseId('');
    setCourseSearch('');
  }, [role]);

  const filteredCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    return courses
      .filter((c) => c?.isActive !== false)
      .filter((c) => (q ? (c.name || '').toLowerCase().includes(q) : true))
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es'));
  }, [courses, courseSearch]);

  const toggleTeacherCourse = (courseId) => {
    setTeacherCourseIds((prev) => {
      const exists = prev.includes(courseId);

      // Si se quita el curso que era jefe, limpiar jefe
      if (exists && teacherChiefCourseId === courseId) {
        setTeacherChiefCourseId('');
      }

      if (exists) return prev.filter((x) => x !== courseId);
      return [...prev, courseId];
    });
  };

  const canSubmit = useMemo(() => {
    if (!email.trim()) return false;
    if (!role) return false;
    if (role === 'STUDENT') return Boolean(studentCourseId);
    if (role === 'TEACHER') return teacherCourseIds.length > 0;
    return true; // ADMIN
  }, [email, role, studentCourseId, teacherCourseIds]);

  const handleInvite = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const cleanEmail = (email ?? '').trim().toLowerCase();
      const cleanRole = (role ?? '').trim();

      if (!cleanEmail) throw new Error('Email requerido');
      if (!cleanRole) throw new Error('Rol requerido');

      if (cleanRole === 'STUDENT') {
        if (!studentCourseId) throw new Error('Debes asignar un curso al estudiante.');
      }

      if (cleanRole === 'TEACHER') {
        if (teacherCourseIds.length === 0) throw new Error('Debes asignar al menos un curso al profesor.');
        if (teacherChiefCourseId && !teacherCourseIds.includes(teacherChiefCourseId)) {
          throw new Error('El curso jefe debe estar dentro de los cursos asignados.');
        }
      }

      const teacherCourseAssignments =
        cleanRole === 'TEACHER'
          ? teacherCourseIds.map((courseId) => ({
              courseId,
              isChief: teacherChiefCourseId === courseId,
            }))
          : [];

      const res = await createInvitation({
        email: cleanEmail,
        role: cleanRole,
        studentCourseId: cleanRole === 'STUDENT' ? studentCourseId : null,
        teacherCourseAssignments: cleanRole === 'TEACHER' ? teacherCourseAssignments : [],
      });

      await onInvited?.({
        email: cleanEmail,
        role: cleanRole,
        inviteUrl: res.inviteUrl,
      });

      await navigator.clipboard.writeText(res.inviteUrl);
      alert('Link copiado al portapapeles');

      setEmail('');
      setRole('');
      setStudentCourseId('');
      setTeacherCourseIds([]);
      setTeacherChiefCourseId('');
      setCourseSearch('');

      onClose?.();
    } catch (e) {
      alert(e?.message || 'Error creando invitación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invitar usuario</DialogTitle>
          <DialogDescription>Se enviará una invitación para unirse a la institución.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Email *</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@correo.com"
              disabled={loading}
            />
          </div>

          <div>
            <Label>Rol *</Label>
            <Select value={role} onValueChange={setRole} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {needsCourses ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{role === 'STUDENT' ? 'Curso del estudiante *' : 'Cursos del profesor *'}</Label>
                {coursesLoading ? <span className="text-xs text-muted-foreground">Cargando...</span> : null}
              </div>

              {coursesError ? <p className="text-sm text-red-600">{coursesError}</p> : null}

              <Input
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Buscar curso (ej: 7°B, 1° Medio A, 101...)"
                disabled={loading || coursesLoading}
              />

              {role === 'STUDENT' ? (
                <div className="max-h-[220px] overflow-auto border rounded p-2 space-y-2">
                  {filteredCourses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay cursos disponibles.</p>
                  ) : (
                    filteredCourses.map((c) => (
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
                    ))
                  )}
                </div>
              ) : null}

              {role === 'TEACHER' ? (
                <>
                  <div className="max-h-[220px] overflow-auto border rounded p-2 space-y-2">
                    {filteredCourses.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hay cursos disponibles.</p>
                    ) : (
                      filteredCourses.map((c) => {
                        const checked = teacherCourseIds.includes(c.id);
                        const isChief = teacherChiefCourseId === c.id;

                        return (
                          <div key={c.id} className="flex items-center justify-between gap-3">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleTeacherCourse(c.id)}
                                disabled={loading}
                              />
                              {c.name}
                            </label>

                            <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                              <input
                                type="radio"
                                name="teacher-chief-course"
                                checked={isChief}
                                onChange={() => setTeacherChiefCourseId(c.id)}
                                disabled={loading || !checked}
                                title={!checked ? 'Selecciona el curso primero' : 'Marcar como profesor jefe'}
                              />
                              Jefe
                            </label>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setTeacherCourseIds(filteredCourses.map((c) => c.id))}
                      disabled={loading || filteredCourses.length === 0}
                    >
                      Seleccionar todos (filtrados)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setTeacherCourseIds([]);
                        setTeacherChiefCourseId('');
                      }}
                      disabled={loading || (teacherCourseIds.length === 0 && !teacherChiefCourseId)}
                    >
                      Limpiar
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    “Jefe” es opcional. Si lo marcas, ese profesor será el único que verá publicaciones tipo COURSE
                    (además de los alumnos del curso).
                  </p>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleInvite} disabled={loading || !canSubmit}>
            {loading ? 'Enviando...' : 'Enviar invitación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
