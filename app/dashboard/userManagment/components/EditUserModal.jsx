"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function EditUserModal({ open, onClose, user, onSaved }) {
  const [loading, setLoading] = useState(false);

  // cursos institución
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState("");
  const [courses, setCourses] = useState([]);

  // detalle real del usuario (desde DB)
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detail, setDetail] = useState(null);

  // campos editables
  const [positionTitle, setPositionTitle] = useState("");

  // ✅ Estado editable: Activo/Inactivo (NO texto libre)
  const [isActive, setIsActive] = useState(true);

  // STUDENT
  const [studentCourseId, setStudentCourseId] = useState("");

  // TEACHER
  const [teacherCourseIds, setTeacherCourseIds] = useState([]);
  const [teacherChiefCourseId, setTeacherChiefCourseId] = useState("");

  const role = detail?.role ?? null;

  const ensureCoursesLoaded = async () => {
    if (coursesLoading) return;
    if (courses.length > 0) return;

    setCoursesLoading(true);
    setCoursesError("");

    try {
      const res = await fetch("/api/courses?onlyActive=1", { method: "GET" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCourses(Array.isArray(data?.courses) ? data.courses : []);
    } catch (e) {
      setCoursesError(e?.message || "No se pudieron cargar los cursos.");
    } finally {
      setCoursesLoading(false);
    }
  };

  const loadUserDetail = async (id) => {
    setDetailLoading(true);
    setDetailError("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "GET" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setDetail(data);

      // hidratar form según rol
      setPositionTitle(data?.positionTitle ?? "");
      setIsActive(Boolean(data?.isActive));

      if (data?.role === "STUDENT") {
        setStudentCourseId(data?.courseId ?? "");
        setTeacherCourseIds([]);
        setTeacherChiefCourseId("");
      }

      if (data?.role === "TEACHER") {
        const ids = Array.isArray(data?.teacherCourses)
          ? data.teacherCourses.map((tc) => tc.courseId)
          : [];
        setTeacherCourseIds(ids);

        const chief = Array.isArray(data?.teacherCourses)
          ? data.teacherCourses.find((tc) => tc.isChief)?.courseId
          : null;
        setTeacherChiefCourseId(chief ?? "");

        setStudentCourseId("");
      }

      if (data?.role === "ADMINISTRATIVE") {
        setStudentCourseId("");
        setTeacherCourseIds([]);
        setTeacherChiefCourseId("");
      }
    } catch (e) {
      setDetailError(e?.message || "No se pudo cargar el usuario.");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    if (!user?.id) return;

    ensureCoursesLoaded();
    loadUserDetail(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.id]);

  const filteredCourses = useMemo(() => {
    return courses
      .filter((c) => c?.isActive !== false)
      .sort((a, b) => (a.name || "").localeCompare(b.name || "", "es"));
  }, [courses]);

  const toggleTeacherCourse = (courseId) => {
    setTeacherCourseIds((prev) => {
      const exists = prev.includes(courseId);
      if (exists) {
        if (teacherChiefCourseId === courseId) setTeacherChiefCourseId("");
        return prev.filter((x) => x !== courseId);
      }
      return [...prev, courseId];
    });
  };

 // solo el onSave() reemplázalo por esto

const onSave = async () => {
  if (!detail || loading) return;

  // Validaciones rápidas UI (las definitivas igual van server-side)
  if (role === "STUDENT" && !studentCourseId) {
    alert("Debes asignar un curso al estudiante.");
    return;
  }

  if (role === "TEACHER" && teacherCourseIds.length === 0) {
    alert("Debes asignar al menos un curso al profesor.");
    return;
  }

  if (role === "TEACHER" && teacherChiefCourseId && !teacherCourseIds.includes(teacherChiefCourseId)) {
    alert("El curso jefe debe estar dentro de los cursos asignados.");
    return;
  }

  setLoading(true);
  try {
    const payload = {
      // siempre editable
      isActive,

      // solo admin
      positionTitle: role === "ADMINISTRATIVE" ? positionTitle : null,

      // solo student
      studentCourseId: role === "STUDENT" ? studentCourseId : null,

      // solo teacher
      teacherCourses:
        role === "TEACHER"
          ? teacherCourseIds.map((courseId) => ({
              courseId,
              isChief: teacherChiefCourseId === courseId,
            }))
          : [],
    };

   const res = await fetch(`/api/admin/users/${detail.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || "No se pudo guardar.");
    }

    await res.json(); // por si quieres usar retorno
    await onSaved?.(); // 🔥 esto hace “efectivo” en UI (mutateUsers)
  } catch (e) {
    alert(e?.message || "Error guardando cambios");
  } finally {
    setLoading(false);
  }
};



  const busy = loading || detailLoading || coursesLoading;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>
            Email no se puede cambiar. Estado solo Activo/Inactivo. Cursos según rol.
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <p className="text-sm text-gray-500">Sin usuario seleccionado.</p>
        ) : (
          <div className="space-y-4">
            {busy && <p className="text-sm text-gray-500">Cargando información...</p>}

            {detailError ? <p className="text-sm text-red-600">{detailError}</p> : null}
            {coursesError ? <p className="text-sm text-red-600">{coursesError}</p> : null}

            {detail ? (
              <>
                {/* base */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Nombre</Label>
                    <Input value={detail.fullName ?? ""} disabled />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={detail.email ?? ""} disabled />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Rol</Label>
                    <Input value={detail.role ?? ""} disabled />
                  </div>

                  {/* ✅ Estado editable solo con select */}
                  <div>
                    <Label>Estado</Label>
                    <Select
                      value={isActive ? "ACTIVE" : "INACTIVE"}
                      onValueChange={(v) => setIsActive(v === "ACTIVE")}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Activo</SelectItem>
                        <SelectItem value="INACTIVE">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* ADMINISTRATIVE */}
                {role === "ADMINISTRATIVE" ? (
                  <div>
                    <Label>Cargo</Label>
                    <Input
                      value={positionTitle}
                      onChange={(e) => setPositionTitle(e.target.value)}
                      placeholder="Ej: Coordinador académico"
                      disabled={loading}
                    />
                  </div>
                ) : null}

                {/* STUDENT */}
                {role === "STUDENT" ? (
                  <div className="space-y-2">
                    <Label>Curso del estudiante</Label>
                    <div className="max-h-[220px] overflow-auto border rounded p-2 space-y-2">
                      {filteredCourses.map((c) => (
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
                  </div>
                ) : null}

                {/* TEACHER */}
                {role === "TEACHER" ? (
                  <div className="space-y-2">
                    <Label>Cursos del profesor</Label>
                    <div className="max-h-[260px] overflow-auto border rounded p-2 space-y-2">
                      {filteredCourses.map((c) => {
                        const checked = teacherCourseIds.includes(c.id);
                        const isChiefSelected = teacherChiefCourseId === c.id;

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
                                checked={isChiefSelected}
                                onChange={() => setTeacherChiefCourseId(c.id)}
                                disabled={loading || !checked}
                                title={!checked ? "Selecciona el curso primero" : "Marcar como profesor jefe"}
                              />
                              Jefe
                            </label>
                          </div>
                        );
                      })}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      “Jefe” es opcional. Solo puedes marcar jefe dentro de los cursos seleccionados.
                    </p>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={busy || !detail}>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
