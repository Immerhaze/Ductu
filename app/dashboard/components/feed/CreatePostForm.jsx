// app/dashboard/components/feed/CreatePostForm.jsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getCoursesForPostTargetsAction } from "@/lib/server/actions/posts";

const MAX_CHARS = 2000;

const ROLE_OPTIONS = [
  { key: "TEACHER", label: "Profesores" },
  { key: "ADMINISTRATIVE", label: "Administrativos" },
];

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const FILE_LABEL = {
  "application/pdf": "PDF",
  "application/msword": "Word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
  "application/vnd.ms-excel": "Excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
  "application/vnd.ms-powerpoint": "PowerPoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PowerPoint",
  "image/jpeg": "Imagen",
  "image/png": "Imagen",
  "image/webp": "Imagen",
};

export default function CreatePostForm({ onPublish, currentUser }) {
  const [open, setOpen]                   = useState(false);
  const [postContent, setPostContent]     = useState("");
  const [selectedFile, setSelectedFile]   = useState(null);
  const [uploading, setUploading]         = useState(false);
  const [publishing, setPublishing]       = useState(false);
  const [uploadError, setUploadError]     = useState("");

  const [audienceType, setAudienceType]           = useState("ALL");
  const [selectedRoles, setSelectedRoles]         = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [coursesLoading, setCoursesLoading]       = useState(false);
  const [coursesError, setCoursesError]           = useState("");
  const [courses, setCourses]                     = useState([]);
  const [courseSearch, setCourseSearch]           = useState("");
  const [audienceMenuOpen, setAudienceMenuOpen]   = useState(false);
  const [entryPoint, setEntryPoint]               = useState("text");

  const fileInputRef = useRef(null);
  const textareaRef  = useRef(null);

  const userName        = currentUser?.fullName || "Usuario";
  const userRoleLabel   = currentUser?.role === "TEACHER" ? "Profesor" : currentUser?.role === "ADMINISTRATIVE" ? "Administración" : "Usuario";
  const avatarUrl       = currentUser?.avatarUrl || "https://github.com/shadcn.png";
  const isAdmin         = currentUser?.role === "ADMINISTRATIVE";
  const isTeacher       = currentUser?.role === "TEACHER";
  const teacherCanPostAll = true;
  const remainingChars  = useMemo(() => MAX_CHARS - postContent.length, [postContent]);
  const isLoading       = uploading || publishing;

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

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Tipo de archivo no permitido. Usa PDF, Word, Excel, PowerPoint o imágenes.");
      return;
    }

    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      setUploadError(`El archivo supera el límite de ${MAX_MB}MB.`);
      return;
    }

    setUploadError("");
    setSelectedFile(file);
  };

  useEffect(() => {
    if (!isAdmin && audienceType === "ROLE") { setAudienceType("COURSE"); setSelectedRoles([]); setSelectedCourseIds([]); }
    if (isTeacher && !teacherCanPostAll && audienceType === "ALL") { setAudienceType("COURSE"); setSelectedRoles([]); setSelectedCourseIds([]); }
  }, [isAdmin, isTeacher, teacherCanPostAll]); // eslint-disable-line

  useEffect(() => {
    if (!open) { setAudienceMenuOpen(false); return; }
    const t = setTimeout(async () => {
      if (entryPoint === "attachment") fileInputRef.current?.click?.();
      else if (entryPoint === "filter") { setAudienceMenuOpen(true); if (audienceType === "COURSE") await ensureCoursesLoaded(); }
      else textareaRef.current?.focus?.();
    }, 0);
    return () => clearTimeout(t);
  }, [open, entryPoint]); // eslint-disable-line

  const openFrom = (where) => { setEntryPoint(where); setOpen(true); };

  const audienceSummary = useMemo(() => {
    if (audienceType === "ALL") return "Toda la institución";
    if (audienceType === "ROLE") {
      const labels = ROLE_OPTIONS.filter((r) => selectedRoles.includes(r.key)).map((r) => r.label);
      return labels.length ? labels.join(", ") : "Selecciona roles";
    }
    const selected = courses.filter((c) => selectedCourseIds.includes(c.id)).map((c) => c.name);
    if (!selected.length) return "Selecciona cursos";
    const preview = selected.slice(0, 2);
    const rest = selected.length - preview.length;
    return `${preview.join(", ")}${rest > 0 ? ` +${rest} más` : ""}`;
  }, [audienceType, selectedRoles, selectedCourseIds, courses]);

  const filteredCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    return courses
      .filter((c) => c.isActive !== false)
      .filter((c) => q ? c.name.toLowerCase().includes(q) : true)
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [courses, courseSearch]);

  const toggleRole   = (roleKey)  => setSelectedRoles((prev) => prev.includes(roleKey) ? prev.filter((x) => x !== roleKey) : [...prev, roleKey]);
  const toggleCourse = (courseId) => setSelectedCourseIds((prev) => prev.includes(courseId) ? prev.filter((x) => x !== courseId) : [...prev, courseId]);

  const canPublish =
    postContent.trim().length > 0 &&
    postContent.length <= MAX_CHARS &&
    (audienceType !== "ROLE" || selectedRoles.length > 0) &&
    (audienceType !== "COURSE" || selectedCourseIds.length > 0) &&
    !(audienceType === "ALL" && isTeacher && !teacherCanPostAll) &&
    !(audienceType === "ROLE" && !isAdmin) &&
    !isLoading;

  const handlePublish = async () => {
    const text = postContent.trim();
    if (!text || isLoading) return;

    if (audienceType === "ROLE" && !isAdmin) { alert("Solo administradores pueden publicar por roles."); return; }
    if (audienceType === "ALL" && isTeacher && !teacherCanPostAll) { alert("Solo administradores pueden publicar a toda la institución."); return; }

    let targets = [];
    if (audienceType === "ALL")    targets = [{ type: "ALL" }];
    if (audienceType === "ROLE")   targets = selectedRoles.map((r) => ({ type: "ROLE", role: r }));
    if (audienceType === "COURSE") targets = selectedCourseIds.map((id) => ({ type: "COURSE", courseId: id }));

    try {
      // 1. Subir archivo si hay uno
      let attachment = null;
      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setUploadError(uploadData.error ?? "Error subiendo el archivo.");
          setUploading(false);
          return;
        }

        attachment = uploadData;
        setUploading(false);
      }

      // 2. Crear la publicación
      setPublishing(true);
      await onPublish?.({ content: text, targets, attachment });

      // 3. Reset
      setPostContent("");
      setSelectedFile(null);
      setUploadError("");
      setAudienceType(isTeacher && !teacherCanPostAll ? "COURSE" : "ALL");
      setSelectedRoles([]);
      setSelectedCourseIds([]);
      setCourseSearch("");
      setOpen(false);
    } catch (e) {
      alert(e?.message || "Error publicando");
    } finally {
      setUploading(false);
      setPublishing(false);
    }
  };

  const publishLabel = () => {
    if (uploading)  return "Subiendo archivo...";
    if (publishing) return "Publicando...";
    return "Publicar";
  };

  const resetAndClose = () => {
    setOpen(false);
    setPostContent("");
    setSelectedFile(null);
    setUploadError("");
    setSelectedRoles([]);
    setSelectedCourseIds([]);
    setCourseSearch("");
  };

  return (
    <>
      {/* Trigger card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
        <Avatar className="w-10 h-10 border-2 border-blue-500 shrink-0">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{userName?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>

        <button
          onClick={() => openFrom("text")}
          className="flex-1 text-left text-sm text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl px-4 py-2.5 cursor-pointer"
        >
          ¿Qué tienes en mente hoy?
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => openFrom("attachment")}
            className="p-2 text-gray-400 hover:text-blue-950 hover:bg-gray-100 rounded-lg transition-colors"
            title="Adjuntar archivo"
          >
            <span className="icon-[famicons--attach] text-lg" />
          </button>
          <button
            onClick={() => openFrom("filter")}
            className="p-2 text-gray-400 hover:text-blue-950 hover:bg-gray-100 rounded-lg transition-colors"
            title="Configurar visibilidad"
          >
            <span className="icon-[material-symbols--arrow-drop-down-circle-outline-rounded] text-lg" />
          </button>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else setOpen(true); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Crear publicación</DialogTitle>
          </DialogHeader>

          {/* Author */}
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <Avatar className="w-10 h-10 border-2 border-blue-500">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{userName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-gray-900">{userName}</p>
              <p className="text-xs text-gray-400">{userRoleLabel}</p>
            </div>
          </div>

          {/* Textarea */}
          <div className="py-2">
            <textarea
              ref={textareaRef}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Escribe tu publicación aquí..."
              disabled={isLoading}
              className="w-full resize-none text-sm text-gray-800 placeholder:text-gray-400 outline-none min-h-[120px] max-h-[240px] disabled:opacity-50"
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Visible para: <span className="font-medium text-gray-600">{audienceSummary}</span>
              </span>
              <span className={`text-xs ${remainingChars < 0 ? "text-red-500 font-medium" : "text-gray-400"}`}>
                {postContent.length}/{MAX_CHARS}
              </span>
            </div>
          </div>

          {/* Archivo adjunto preview */}
          {selectedFile && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <span className="text-lg shrink-0">
                {FILE_LABEL[selectedFile.type] === "Imagen" ? "🖼️" :
                 FILE_LABEL[selectedFile.type] === "PDF" ? "📄" :
                 FILE_LABEL[selectedFile.type] === "Word" ? "📝" :
                 FILE_LABEL[selectedFile.type] === "Excel" ? "📊" : "📎"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-800 truncate">{selectedFile.name}</p>
                <p className="text-xs text-blue-500 mt-0.5">
                  {FILE_LABEL[selectedFile.type] ?? "Archivo"} · {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {!isLoading && (
                <button
                  onClick={() => { setSelectedFile(null); setUploadError(""); }}
                  className="text-blue-400 hover:text-red-500 transition-colors text-sm shrink-0"
                >
                  ✕
                </button>
              )}
              {uploading && (
                <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin shrink-0" />
              )}
            </div>
          )}

          {/* Error de upload */}
          {uploadError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {uploadError}
            </p>
          )}

          {/* Visibilidad + acciones */}
          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <DropdownMenu open={audienceMenuOpen} onOpenChange={setAudienceMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  disabled={isLoading}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-950 transition-colors disabled:opacity-50"
                >
                  <span className="icon-[material-symbols--arrow-drop-down-circle-outline-rounded] text-base" />
                  Configurar visibilidad
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-[400px] p-3">
                <Tabs
                  value={audienceType}
                  onValueChange={async (v) => {
                    if (v === "ROLE" && !isAdmin) { setAudienceType("COURSE"); setSelectedRoles([]); setSelectedCourseIds([]); await ensureCoursesLoaded(); return; }
                    if (v === "ALL" && isTeacher && !teacherCanPostAll) { setAudienceType("COURSE"); setSelectedRoles([]); setSelectedCourseIds([]); await ensureCoursesLoaded(); return; }
                    setAudienceType(v);
                    if (v !== "ROLE") setSelectedRoles([]);
                    if (v !== "COURSE") setSelectedCourseIds([]);
                    if (v === "COURSE") await ensureCoursesLoaded();
                  }}
                >
                  <TabsList className={`grid w-full ${isAdmin ? "grid-cols-3" : "grid-cols-2"}`}>
                    <TabsTrigger value="ALL" disabled={isTeacher && !teacherCanPostAll}>Todos</TabsTrigger>
                    {isAdmin && <TabsTrigger value="ROLE">Roles</TabsTrigger>}
                    <TabsTrigger value="COURSE">Cursos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="ALL" className="mt-3">
                    <p className="text-xs text-gray-400">Visible para toda la institución.</p>
                  </TabsContent>

                  {isAdmin && (
                    <TabsContent value="ROLE" className="mt-3 space-y-2">
                      {ROLE_OPTIONS.map((r) => (
                        <label key={r.key} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={selectedRoles.includes(r.key)} onChange={() => toggleRole(r.key)} />
                          {r.label}
                        </label>
                      ))}
                    </TabsContent>
                  )}

                  <TabsContent value="COURSE" className="mt-3 space-y-2">
                    {coursesError && <p className="text-xs text-red-500">{coursesError}</p>}
                    <Input value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)} placeholder="Buscar curso..." className="h-8 text-xs" />
                    <div className="max-h-48 overflow-auto border rounded-lg p-2 space-y-1.5">
                      {coursesLoading ? (
                        <p className="text-xs text-gray-400">Cargando...</p>
                      ) : filteredCourses.length === 0 ? (
                        <p className="text-xs text-gray-400">{isTeacher ? "No tienes cursos asignados." : "No hay cursos."}</p>
                      ) : filteredCourses.map((c) => (
                        <label key={c.id} className="flex items-center gap-2 text-xs cursor-pointer">
                          <input type="checkbox" checked={selectedCourseIds.includes(c.id)} onChange={() => toggleCourse(c.id)} />
                          {c.name}
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setSelectedCourseIds(filteredCourses.map((c) => c.id))} disabled={filteredCourses.length === 0} className="text-xs h-7">Todos</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setSelectedCourseIds([])} disabled={selectedCourseIds.length === 0} className="text-xs h-7">Limpiar</Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Adjuntar + Publicar */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="file-attach"
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  selectedFile
                    ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                    : "text-gray-400 hover:text-blue-950 hover:bg-gray-100"
                } ${isLoading ? "pointer-events-none opacity-50" : ""}`}
                title="Adjuntar archivo"
              >
                <span className="icon-[famicons--attach] text-base" />
              </label>
              <input
                ref={fileInputRef}
                id="file-attach"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
                disabled={isLoading}
              />

              <Button
                onClick={handlePublish}
                disabled={!canPublish}
                className="bg-blue-950 hover:bg-blue-900 h-8 text-xs px-4 min-w-[90px]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {publishLabel()}
                  </span>
                ) : "Publicar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}