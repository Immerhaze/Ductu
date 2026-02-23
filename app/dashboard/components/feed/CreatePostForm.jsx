'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { getCoursesForPostTargetsAction } from "./actions/posts";

const MAX_CHARS = 2000;

const ROLE_OPTIONS = [
  { key: "TEACHER", label: "Profesores" },
  { key: "ADMINISTRATIVE", label: "Administrativos" },
];

export default function CreatePostForm({
  onPublish,
  currentUser, // ideal: { fullName, role, avatarUrl, isSuperAdmin }
}) {
  const [open, setOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Audience
  const [audienceType, setAudienceType] = useState("ALL"); // ALL | ROLE | COURSE
  const [selectedRoles, setSelectedRoles] = useState([]); // ["TEACHER", "ADMINISTRATIVE"]
  const [selectedCourseIds, setSelectedCourseIds] = useState([]); // ["uuid", ...]

  // Cursos (para selector)
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState("");
  const [courses, setCourses] = useState([]); // [{id,name,isActive}]
  const [courseSearch, setCourseSearch] = useState("");

  // Menus
  const [audienceMenuOpen, setAudienceMenuOpen] = useState(false);

  // Entry point
  const [entryPoint, setEntryPoint] = useState("text"); // "text" | "attachment" | "filter"

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const userName = currentUser?.fullName || "Marwin Gaviria";
  const userRoleLabel =
    currentUser?.role === "TEACHER"
      ? "Profesor"
      : currentUser?.role === "ADMINISTRATIVE"
        ? "Administración"
        : "Usuario";
  const avatarUrl = currentUser?.avatarUrl || "https://github.com/shadcn.png";

  const isAdmin = currentUser?.role === "ADMINISTRATIVE";
  const isTeacher = currentUser?.role === "TEACHER";

  /**
   * Política:
   * - Admin: ALL / ROLE / COURSE
   * - Teacher: ALL (solo si isSuperAdmin) / COURSE (solo cursos asignados o jefe)
   * - Teacher: ROLE no aplica (se oculta)
   */
  const teacherCanPostAll = Boolean(currentUser?.isSuperAdmin);

  const remainingChars = useMemo(() => MAX_CHARS - postContent.length, [postContent]);

  const ensureCoursesLoaded = async () => {
    setCoursesLoading(true);
    setCoursesError("");
    try {
      const res = await getCoursesForPostTargetsAction();
      setCourses(res?.courses || []);
    } catch (e) {
      setCoursesError(e?.message || "No se pudieron cargar los cursos.");
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ok =
      file.type === "application/pdf" ||
      file.type === "image/jpeg" ||
      file.type === "image/png";

    if (!ok) {
      alert("Selecciona un archivo válido (PDF, JPG, PNG).");
      return;
    }
    setSelectedFile(file);
  };

  useEffect(() => {
    // seguridad UX: si el usuario cambia (o currentUser tarda) ajusta audienciaType si no corresponde
    if (!isAdmin && audienceType === "ROLE") {
      setAudienceType("COURSE");
      setSelectedRoles([]);
      setSelectedCourseIds([]);
    }

    if (isTeacher && !teacherCanPostAll && audienceType === "ALL") {
      setAudienceType("COURSE");
      setSelectedRoles([]);
      setSelectedCourseIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, isTeacher, teacherCanPostAll]);

  useEffect(() => {
    if (!open) {
      setAudienceMenuOpen(false);
      return;
    }

    const t = setTimeout(async () => {
      if (entryPoint === "attachment") {
        fileInputRef.current?.click?.();
      } else if (entryPoint === "filter") {
        setAudienceMenuOpen(true);
        if (audienceType === "COURSE") await ensureCoursesLoaded();
      } else {
        textareaRef.current?.focus?.();
      }
    }, 0);

    return () => clearTimeout(t);
    // no agrego audienceType aquí para evitar loops, tal como lo tenías
  }, [open, entryPoint]); // eslint-disable-line react-hooks/exhaustive-deps

  const openFrom = (where) => {
    setEntryPoint(where);
    setOpen(true);
  };

  const audienceSummary = useMemo(() => {
    if (audienceType === "ALL") return "Visible para: Toda la institución";

    if (audienceType === "ROLE") {
      const labels = ROLE_OPTIONS
        .filter((r) => selectedRoles.includes(r.key))
        .map((r) => r.label);
      return labels.length ? `Visible para: ${labels.join(", ")}` : "Visible para: (Selecciona roles)";
    }

    const selected = courses
      .filter((c) => selectedCourseIds.includes(c.id))
      .map((c) => c.name);

    if (!selected.length) return "Visible para: (Selecciona cursos)";
    const preview = selected.slice(0, 3);
    const rest = selected.length - preview.length;
    return `Visible para: ${preview.join(", ")}${rest > 0 ? ` +${rest} más` : ""}`;
  }, [audienceType, selectedRoles, selectedCourseIds, courses]);

  const filteredCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    return courses
      .filter((c) => c.isActive !== false)
      .filter((c) => (q ? c.name.toLowerCase().includes(q) : true))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [courses, courseSearch]);

  const toggleRole = (roleKey) => {
    setSelectedRoles((prev) => {
      const exists = prev.includes(roleKey);
      if (exists) return prev.filter((x) => x !== roleKey);
      return [...prev, roleKey];
    });
  };

  const toggleCourse = (courseId) => {
    setSelectedCourseIds((prev) => {
      const exists = prev.includes(courseId);
      if (exists) return prev.filter((x) => x !== courseId);
      return [...prev, courseId];
    });
  };

  const canPublish =
    postContent.trim().length > 0 &&
    postContent.length <= MAX_CHARS &&
    (audienceType !== "ROLE" || selectedRoles.length > 0) &&
    (audienceType !== "COURSE" || selectedCourseIds.length > 0) &&
    !(audienceType === "ALL" && isTeacher && !teacherCanPostAll) &&
    !(audienceType === "ROLE" && !isAdmin);

  const handlePublish = async () => {
    const text = postContent.trim();
    if (!text) return;

    if (selectedFile) {
      alert("Adjuntos: por ahora no se suben (falta storage). Quita el adjunto para publicar.");
      return;
    }

    // hard guard UI (igual debe validarse en server)
    if (audienceType === "ROLE" && !isAdmin) {
      alert("Solo administradores pueden publicar por roles.");
      return;
    }
    if (audienceType === "ALL" && isTeacher && !teacherCanPostAll) {
      alert("Solo administradores (o superadmin) pueden publicar a toda la institución.");
      return;
    }

    let targets = [];
    if (audienceType === "ALL") targets = [{ type: "ALL" }];
    if (audienceType === "ROLE") targets = selectedRoles.map((r) => ({ type: "ROLE", role: r }));
    if (audienceType === "COURSE") targets = selectedCourseIds.map((id) => ({ type: "COURSE", courseId: id }));

    try {
      if (onPublish) {
        await onPublish({ content: text, targets, attachment: null });
      }

      setPostContent("");
      setSelectedFile(null);

      // Reset según rol:
      if (isTeacher && !teacherCanPostAll) {
        setAudienceType("COURSE");
      } else {
        setAudienceType("ALL");
      }

      setSelectedRoles([]);
      setSelectedCourseIds([]);
      setCourseSearch("");
      setOpen(false);
    } catch (e) {
      alert(e?.message || "Error publicando");
    }
  };

  return (
    <>
      {/* Caja principal */}
      <div className="w-full max-w-5xl h-44 bg-blue-950 flex flex-row items-center p-8 rounded-xl mb-16">
        <section className="w-1/4 h-full flex justify-center items-center">
          <Avatar className="w-32 h-auto border-2 border-blue-500">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{userName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </section>

        <section className="w-3/4 h-1/2 flex flex-col items-center space-y-8">
          <Input
            type="text"
            placeholder="Que tienes en mente hoy"
            className="bg-white rounded-4xl p-4 cursor-pointer"
            readOnly
            onClick={() => openFrom("text")}
          />

          <div className="w-full h-full flex flex-row items-center justify-end pr-4">
            <button
              type="button"
              onClick={() => openFrom("attachment")}
              className="cursor-pointer text-gray-300 hover:text-white flex items-center space-x-1"
            >
              <span className="icon-[famicons--attach] text-xl"></span>
              <span>Adjuntar</span>
            </button>

            <button
              type="button"
              onClick={() => openFrom("filter")}
              className="ml-4 text-gray-300 hover:text-white flex items-center space-x-1"
            >
              <span>Visibilidad</span>
              <span className="icon-[material-symbols--arrow-drop-down-circle-outline-rounded] text-xl"></span>
            </button>
          </div>
        </section>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2/5">
          <div className="w-full border-b-[0.5px] flex justify-center border-gray-400 pb-4">
            <DialogHeader>
              <DialogTitle>Crear Publicación</DialogTitle>
            </DialogHeader>
          </div>

          {/* Header con usuario */}
          <div className="w-full flex flex-row items-center justify-center h-auto gap-4">
            <Avatar className="w-15 h-auto border-2 border-blue-500">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{userName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <span className="w-full text-lg">
              {userName} / <span className="text-blue-500 font-semibold">{userRoleLabel}</span>
            </span>
          </div>

          {/* Text */}
          <div className="p-4">
            <textarea
              ref={textareaRef}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Escribe tu publicación aquí..."
              className="w-full p-2 border rounded"
              style={{ minHeight: "120px", maxHeight: "300px", resize: "vertical" }}
            />
            <div className="mt-2 flex justify-between text-sm text-gray-500">
              <span>{audienceSummary}</span>
              <span className={remainingChars < 0 ? "text-red-600 font-medium" : ""}>
                {postContent.length}/{MAX_CHARS}
              </span>
            </div>
          </div>

          {/* Visibilidad */}
          <div className="px-4">
            <DropdownMenu open={audienceMenuOpen} onOpenChange={setAudienceMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="text-gray-600 hover:text-blue-950 flex items-center space-x-1 cursor-pointer"
                >
                  <span className="font-medium">Configurar visibilidad</span>
                  <span className="icon-[material-symbols--arrow-drop-down-circle-outline-rounded] text-xl"></span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-[420px] p-3">
                <Tabs
                  value={audienceType}
                  onValueChange={async (v) => {
                    // Bloqueos por rol/política
                    if (v === "ROLE" && !isAdmin) {
                      setAudienceType("COURSE");
                      setSelectedRoles([]);
                      setSelectedCourseIds([]);
                      await ensureCoursesLoaded();
                      return;
                    }

                    if (v === "ALL" && isTeacher && !teacherCanPostAll) {
                      setAudienceType("COURSE");
                      setSelectedRoles([]);
                      setSelectedCourseIds([]);
                      await ensureCoursesLoaded();
                      return;
                    }

                    setAudienceType(v);

                    if (v !== "ROLE") setSelectedRoles([]);
                    if (v !== "COURSE") setSelectedCourseIds([]);

                    if (v === "COURSE") await ensureCoursesLoaded();
                  }}
                >
                  {/* Admin: 3 tabs. Teacher: 2 tabs (Roles oculto). */}
                  <TabsList className={`grid w-full ${isAdmin ? "grid-cols-3" : "grid-cols-2"}`}>
                    <TabsTrigger value="ALL" disabled={isTeacher && !teacherCanPostAll}>
                      Todos
                    </TabsTrigger>

                    {isAdmin ? <TabsTrigger value="ROLE">Roles</TabsTrigger> : null}

                    <TabsTrigger value="COURSE">Cursos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="ALL" className="mt-3">
                    {isTeacher && !teacherCanPostAll ? (
                      <p className="text-sm text-muted-foreground">
                        Solo administradores (o superadmin) pueden publicar a toda la institución. Usa “Cursos”.
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Visible para toda la institución.</p>
                    )}
                  </TabsContent>

                  {isAdmin ? (
                    <TabsContent value="ROLE" className="mt-3 space-y-2">
                      <p className="text-sm text-muted-foreground">Selecciona los roles que verán la publicación.</p>
                      <div className="space-y-2">
                        {ROLE_OPTIONS.map((r) => {
                          const checked = selectedRoles.includes(r.key);
                          return (
                            <label key={r.key} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleRole(r.key)}
                              />
                              {r.label}
                            </label>
                          );
                        })}
                      </div>
                    </TabsContent>
                  ) : null}

                  <TabsContent value="COURSE" className="mt-3 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {isAdmin
                        ? "Selecciona los cursos que verán la publicación."
                        : "Selecciona los cursos que te corresponden (donde enseñas o eres profesor jefe)."}
                    </p>

                    {coursesError && <p className="text-sm text-red-600">{coursesError}</p>}

                    <Input
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      placeholder="Buscar curso (ej: 1° Medio, 7°B, 101...)"
                    />

                    <div className="max-h-[220px] overflow-auto border rounded p-2 space-y-2">
                      {coursesLoading ? (
                        <p className="text-sm text-muted-foreground">Cargando cursos...</p>
                      ) : filteredCourses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          {isTeacher
                            ? "No tienes cursos asignados para publicar."
                            : "No hay cursos disponibles."}
                        </p>
                      ) : (
                        filteredCourses.map((c) => {
                          const checked = selectedCourseIds.includes(c.id);
                          return (
                            <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleCourse(c.id)}
                              />
                              {c.name}
                            </label>
                          );
                        })
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedCourseIds(filteredCourses.map((c) => c.id))}
                        disabled={filteredCourses.length === 0}
                      >
                        Seleccionar todos (filtrados)
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedCourseIds([])}
                        disabled={selectedCourseIds.length === 0}
                      >
                        Limpiar
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Actions row */}
          <div className="flex justify-end p-4">
            <div className="w-full h-full flex flex-row items-center justify-end pr-4 gap-4">
              <div className="flex items-center space-x-1">
                <label
                  htmlFor="file-attach"
                  className="cursor-pointer text-gray-500 hover:text-blue-950 flex items-center space-x-1"
                >
                  <span className="icon-[famicons--attach] text-xl"></span>
                  <span>Adjuntar</span>
                </label>

                <input
                  ref={fileInputRef}
                  id="file-attach"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />

                {selectedFile?.name ? (
                  <span className="text-xs text-gray-500 max-w-[220px] truncate">
                    {selectedFile.name}
                  </span>
                ) : null}
              </div>

              <Button
                className="bg-blue-500 hover:bg-blue-950 cursor-pointer"
                onClick={handlePublish}
                disabled={!canPublish}
              >
                Publicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
