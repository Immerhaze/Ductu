// app/dashboard/home/components/GeneralTopDataSection.jsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAppUser } from "@/app/auth/AppUserContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EVENT_TYPES = [
  { key: "GENERAL", label: "General", color: "#3b5bdb", bg: "#eef2ff" },
  { key: "EXAM", label: "Prueba", color: "#e03131", bg: "#fff5f5" },
  { key: "ASSIGNMENT", label: "Entrega", color: "#f59f00", bg: "#fff9db" },
  { key: "HOLIDAY", label: "Feriado", color: "#2f9e44", bg: "#ebfbee" },
  { key: "MEETING", label: "Reunión", color: "#7950f2", bg: "#f3f0ff" },
  { key: "OTHER", label: "Otro", color: "#868e96", bg: "#f8f9fa" },
];

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

function getEventType(type) {
  return EVENT_TYPES.find((t) => t.key === type) ?? EVENT_TYPES[0];
}


function EventBadge({ event, canDelete, onDelete }) {
  const et = getEventType(event.type);
  const date = new Date(event.date);
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: "1px solid #f0f0ec" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: et.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: et.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{event.title}</div>
        <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
          {et.label} · {date.toLocaleDateString("es-CL", { day: "2-digit", month: "short" })}
        </div>
        {event.description && (
          <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{event.description}</div>
        )}
        <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>
          {event.targets?.map((t) => t.type === "ALL" ? "Toda la institución" : t.type === "COURSE" ? t.course?.name : t.role).filter(Boolean).join(", ")}
        </div>
      </div>
      {canDelete && (
        <button onClick={() => onDelete(event.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 16, padding: 4 }}>✕</button>
      )}
    </div>
  );
}

function CreateEventModal({ open, onClose, onCreated, courses }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("GENERAL");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [targetType, setTargetType] = useState("ALL");
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleCourse = (id) => setSelectedCourseIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSubmit = async () => {
    if (!title.trim() || !date) { setError("Título y fecha son requeridos."); return; }
    if (targetType === "COURSE" && selectedCourseIds.length === 0) { setError("Selecciona al menos un curso."); return; }

    let targets = [];
    if (targetType === "ALL") targets = [{ type: "ALL" }];
    if (targetType === "COURSE") targets = selectedCourseIds.map((id) => ({ type: "COURSE", courseId: id }));

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, type, date, endDate: endDate || null, targets }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al crear evento"); return; }
      onCreated(data.event);
      setTitle(""); setDescription(""); setType("GENERAL"); setDate(""); setEndDate(""); setTargetType("ALL"); setSelectedCourseIds([]);
      onClose();
    } catch {
      setError("Error de red.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
  <DialogContent className="w-full max-w-lg overflow-hidden">
    <DialogHeader>
      <DialogTitle>Nuevo evento</DialogTitle>
    </DialogHeader>

    <div className="flex flex-col gap-4 py-2">
      <Input
        className="w-full"
        placeholder="Título del evento"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Input
        className="w-full"
        placeholder="Descripción (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Tipo de evento" />
        </SelectTrigger>
        <SelectContent>
          {EVENT_TYPES.map((t) => (
            <SelectItem key={t.key} value={t.key}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <label className="mb-1 block text-xs text-slate-500">
            Fecha inicio
          </label>
          <Input
            className="w-full min-w-0"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="min-w-0">
          <label className="mb-1 block text-xs text-slate-500">
            Fecha fin (opcional)
          </label>
          <Input
            className="w-full min-w-0"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <Select
        value={targetType}
        onValueChange={(v) => {
          setTargetType(v);
          setSelectedCourseIds([]);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Visibilidad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Toda la institución</SelectItem>
          <SelectItem value="COURSE">Cursos específicos</SelectItem>
        </SelectContent>
      </Select>

      {targetType === "COURSE" && (
        <div className="max-h-40 overflow-y-auto rounded-md border border-slate-200 p-3">
          {courses.length === 0 ? (
            <span className="text-sm text-slate-400">
              No hay cursos disponibles
            </span>
          ) : (
            <div className="flex flex-col gap-2">
              {courses.map((c) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedCourseIds.includes(c.id)}
                    onChange={() => toggleCourse(c.id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <span className="text-sm text-red-600">
          {error}
        </span>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button className="bg-blue-950" onClick={handleSubmit} disabled={saving}>
          {saving ? "Guardando..." : "Crear evento"}
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
  );
}

export default function GeneralTopDataSection() {
  const { me } = useAppUser();
  const today = new Date();

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [courses, setCourses] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [createOpen, setCreateOpen] = useState(false);

  const canCreate = me?.role === "TEACHER" || me?.role === "ADMINISTRATIVE";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/calendar");
        if (!res.ok) return;
        const data = await res.json();
        setEvents(data.events ?? []);
      } finally {
        setLoadingEvents(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!canCreate) return;
    async function loadCourses() {
      try {
        const res = await fetch("/api/courses");
        if (!res.ok) return;
        const data = await res.json();
        setCourses(data.courses ?? []);
      } catch {}
    }
    loadCourses();
  }, [canCreate]);

  const selectedDayEvents = useMemo(() => {
    return events.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === selectedDay;
    });
  }, [events, currentYear, currentMonth, selectedDay]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => new Date(e.date) >= now)
      .slice(0, 5);
  }, [events]);

  const handleDelete = async (eventId) => {
    try {
      const res = await fetch(`/api/calendar/${eventId}`, { method: "DELETE" });
      if (res.ok) setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch {}
  };

  const handleCreated = (event) => {
    setEvents((prev) => [...prev, event].sort((a, b) => new Date(a.date) - new Date(b.date)));
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  // const roleLabel = me?.role === "TEACHER" ? "Profesor" : me?.role === "ADMINISTRATIVE" ? "Administración" : me?.role === "STUDENT" ? "Estudiante" : "";
    const roleLabel = (() => {
  if (!me) return "";

  if (me.role === "TEACHER") return "Profesor";
  if (me.role === "ADMINISTRATIVE") return "Administración";

  if (me.role === "STUDENT") {
    const courseName = me.student?.courseName;
    return courseName
      ? `Estudiante · ${courseName}`
      : "Estudiante";
  }

  return "";
})();


// Reemplaza el return completo de GeneralTopDataSection
return (
    <div style={{ background: "#f7f7f5", padding: "20px 48px 16px", fontFamily: "'DM Sans', sans-serif", borderBottom: "1px solid #e8e8e3" }}>

      {/* Header saludo + botón en una sola línea */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", color: "#aaa", textTransform: "uppercase" }}>
              {today.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
              Hola, <span style={{ color: "#3b5bdb" }}>{me?.fullName?.split(" ", 2).join(" ") ?? "Usuario"}</span>
              <span style={{ fontSize: 14, fontWeight: 400, color: "#aaa", marginLeft: 8 }}>{roleLabel}</span>
            </h1>
          </div>
        </div>

        {canCreate && (
          <button
            onClick={() => setCreateOpen(true)}
            style={{ background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            + Nuevo evento
          </button>
        )}
      </div>

      {/* Grid compacto: calendario pequeño + eventos del día + próximos */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 1fr", gap: 16 }}>

        {/* Calendario compacto */}
        <div style={{ background: "#fff", border: "1px solid #e8e8e3", borderRadius: 14, padding: "14px 14px 10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#888", padding: "0 4px" }}>‹</button>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a" }}>{MONTHS[currentMonth]} {currentYear}</span>
            <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#888", padding: "0 4px" }}>›</button>
          </div>

          {/* Días de la semana */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, marginBottom: 2 }}>
            {DAYS.map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 600, color: "#bbb", padding: "2px 0" }}>{d}</div>
            ))}
          </div>

          {/* Celdas del mes */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
            {(() => {
              const firstDay = new Date(currentYear, currentMonth, 1).getDay();
              const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
              const today2 = new Date();
              const eventsByDay = {};
              events.forEach((e) => {
                const d = new Date(e.date);
                if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
                  const day = d.getDate();
                  if (!eventsByDay[day]) eventsByDay[day] = [];
                  eventsByDay[day].push(e);
                }
              });

              const cells = [];
              for (let i = 0; i < firstDay; i++) cells.push(null);
              for (let d = 1; d <= daysInMonth; d++) cells.push(d);

              return cells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />;
                const dayEvents = eventsByDay[day] ?? [];
                const isSelected = selectedDay === day;
                const isToday = day === today2.getDate() && currentMonth === today2.getMonth() && currentYear === today2.getFullYear();
                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      borderRadius: 6,
                      padding: "3px 2px",
                      cursor: "pointer",
                      background: isSelected ? "#3b5bdb" : isToday ? "#eef2ff" : "transparent",
                      border: isToday && !isSelected ? "1px solid #3b5bdb" : "1px solid transparent",
                      minHeight: 28,
                    }}
                  >
                    <div style={{ textAlign: "center", fontSize: 11, fontWeight: isSelected || isToday ? 700 : 400, color: isSelected ? "#fff" : isToday ? "#3b5bdb" : "#1a1a1a" }}>
                      {day}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                      {dayEvents.slice(0, 2).map((e) => {
                        const et = getEventType(e.type);
                        return <div key={e.id} style={{ width: 4, height: 4, borderRadius: "50%", background: et.color }} />;
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Eventos del día seleccionado */}
        <div style={{ background: "#fff", border: "1px solid #e8e8e3", borderRadius: 14, padding: "14px 16px", overflowY: "auto", maxHeight: 220 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", marginBottom: 2 }}>
            {selectedDay} de {MONTHS[currentMonth]}
          </div>
          <div style={{ fontSize: 11, color: "#aaa", marginBottom: 12 }}>
            {selectedDayEvents.length === 0 ? "Sin eventos" : `${selectedDayEvents.length} evento${selectedDayEvents.length > 1 ? "s" : ""}`}
          </div>
          {selectedDayEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#ddd", fontSize: 12 }}>Sin eventos este día</div>
          ) : (
            selectedDayEvents.map((e) => (
              <EventBadge
                key={e.id}
                event={e}
                canDelete={canCreate && (me?.role === "ADMINISTRATIVE" || e.createdBy?.id === me?.id)}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {/* Próximos eventos */}
        <div style={{ background: "#fff", border: "1px solid #e8e8e3", borderRadius: 14, padding: "14px 16px", overflowY: "auto", maxHeight: 220 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", marginBottom: 12 }}>Próximos eventos</div>
          {loadingEvents ? (
            <div style={{ fontSize: 12, color: "#aaa" }}>Cargando...</div>
          ) : upcomingEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#ddd", fontSize: 12 }}>Sin eventos próximos</div>
          ) : (
            upcomingEvents.map((e) => (
              <EventBadge
                key={e.id}
                event={e}
                canDelete={canCreate && (me?.role === "ADMINISTRATIVE" || e.createdBy?.id === me?.id)}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      <CreateEventModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
        courses={courses}
      />
    </div>
  );
}