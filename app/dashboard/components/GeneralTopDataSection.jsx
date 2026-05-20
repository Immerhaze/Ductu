// app/dashboard/components/GeneralTopDataSection.jsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAppUser } from "@/components/providers/AppUserContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EVENT_TYPES = [
  { key: "GENERAL",    label: "General",   color: "#3b5bdb", bg: "#eef2ff" },
  { key: "EXAM",       label: "Prueba",    color: "#e03131", bg: "#fff5f5" },
  { key: "ASSIGNMENT", label: "Entrega",   color: "#f59f00", bg: "#fff9db" },
  { key: "HOLIDAY",    label: "Feriado",   color: "#2f9e44", bg: "#ebfbee" },
  { key: "MEETING",    label: "Reunión",   color: "#7950f2", bg: "#f3f0ff" },
  { key: "OTHER",      label: "Otro",      color: "#868e96", bg: "#f8f9fa" },
];

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS   = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

function getEventType(type) {
  return EVENT_TYPES.find((t) => t.key === type) ?? EVENT_TYPES[0];
}

function EventBadge({ event, canDelete, onDelete }) {
  const et   = getEventType(event.type);
  const date = new Date(event.date);
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: et.bg }}>
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: et.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{event.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {et.label} · {date.toLocaleDateString("es-CL", { day: "2-digit", month: "short" })}
        </p>
        {event.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.description}</p>
        )}
      </div>
      {canDelete && (
        <button onClick={() => onDelete(event.id)} className="text-gray-300 hover:text-red-400 transition-colors text-sm shrink-0 mt-0.5">✕</button>
      )}
    </div>
  );
}

function MiniCalendar({ events, currentMonth, currentYear, selectedDay, onSelectDay, onPrevMonth, onNextMonth }) {
  const today = new Date();
  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      const d = new Date(e.date);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(e);
      }
    });
    return map;
  }, [events, currentYear, currentMonth]);

  const firstDay    = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const cells       = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onPrevMonth} className="text-gray-400 hover:text-gray-700 text-lg px-1 transition-colors">‹</button>
        <span className="text-xs font-semibold text-gray-700">{MONTHS[currentMonth]} {currentYear}</span>
        <button onClick={onNextMonth} className="text-gray-400 hover:text-gray-700 text-lg px-1 transition-colors">›</button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[9px] font-semibold text-gray-300 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dayEvents  = eventsByDay[day] ?? [];
          const isSelected = selectedDay === day;
          const isToday    = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
          return (
            <button
              key={day}
              onClick={() => onSelectDay(day)}
              className={`flex flex-col items-center rounded-lg py-1 px-0.5 text-[11px] font-medium transition-colors min-h-[30px] ${
                isSelected ? "bg-blue-950 text-white" : isToday ? "bg-blue-50 text-blue-700 ring-1 ring-blue-300" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {day}
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span key={e.id} className="w-1 h-1 rounded-full" style={{ background: isSelected ? "rgba(255,255,255,0.7)" : getEventType(e.type).color }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CreateEventModal({ open, onClose, onCreated, courses }) {
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [type, setType]               = useState("GENERAL");
  const [date, setDate]               = useState("");
  const [endDate, setEndDate]         = useState("");
  const [targetType, setTargetType]   = useState("ALL");
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");

  const toggleCourse = (id) => setSelectedCourseIds((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );

  const handleSubmit = async () => {
    if (!title.trim() || !date) { setError("Título y fecha son requeridos."); return; }
    if (targetType === "COURSE" && selectedCourseIds.length === 0) { setError("Selecciona al menos un curso."); return; }
    const targets = targetType === "ALL" ? [{ type: "ALL" }] : selectedCourseIds.map((id) => ({ type: "COURSE", courseId: id }));
    setSaving(true); setError("");
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
    } catch { setError("Error de red."); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-[95vw]">
        <DialogHeader><DialogTitle>Nuevo evento</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <Input placeholder="Título del evento *" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Descripción (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue placeholder="Tipo de evento" /></SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((t) => <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Fecha inicio *</label>
              <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Fecha fin (opcional)</label>
              <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <Select value={targetType} onValueChange={(v) => { setTargetType(v); setSelectedCourseIds([]); }}>
            <SelectTrigger><SelectValue placeholder="Visibilidad" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toda la institución</SelectItem>
              <SelectItem value="COURSE">Cursos específicos</SelectItem>
            </SelectContent>
          </Select>
          {targetType === "COURSE" && (
            <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-200 p-3 space-y-2">
              {courses.length === 0 ? <p className="text-sm text-gray-400">No hay cursos disponibles</p> : courses.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={selectedCourseIds.includes(c.id)} onChange={() => toggleCourse(c.id)} />
                  {c.name}
                </label>
              ))}
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button className="bg-blue-950 hover:bg-blue-900" onClick={handleSubmit} disabled={saving}>
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
  const today  = new Date();

  const [events, setEvents]               = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [courses, setCourses]             = useState([]);
  const [currentMonth, setCurrentMonth]   = useState(today.getMonth());
  const [currentYear, setCurrentYear]     = useState(today.getFullYear());
  const [selectedDay, setSelectedDay]     = useState(today.getDate());
  const [createOpen, setCreateOpen]       = useState(false);
  const [calendarOpen, setCalendarOpen]   = useState(false);

  const canCreate = me?.role === "TEACHER" || me?.role === "ADMINISTRATIVE";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/calendar");
        if (!res.ok) return;
        const data = await res.json();
        setEvents(data.events ?? []);
      } finally { setLoadingEvents(false); }
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

  const selectedDayEvents = useMemo(() => events.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === selectedDay;
  }), [events, currentYear, currentMonth, selectedDay]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events.filter((e) => new Date(e.date) >= now).slice(0, 5);
  }, [events]);

  const todayEvents = useMemo(() => events.filter((e) => {
    const d = new Date(e.date);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }), [events]);

  const nextEvent = useMemo(() => {
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    return events.find((e) => new Date(e.date) >= todayEnd) ?? null;
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

  const roleLabel = (() => {
    if (!me) return "";
    if (me.role === "TEACHER") return "Profesor";
    if (me.role === "ADMINISTRATIVE") return "Administración";
    if (me.role === "STUDENT") return "Estudiante";
    return "";
  })();

  return (
    <>
      {/* ── Banner compacto ── */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 shrink-0">
        <div className="flex items-center justify-between gap-3">

          {/* Saludo */}
          <div className="min-w-0 shrink-0">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest hidden sm:block">
              {today.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest sm:hidden">
              {today.toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 mt-0.5">
              Hola, <span className="text-blue-600">{me?.fullName?.split(" ", 1)[0] ?? "Usuario"}</span>
              <span className="text-xs sm:text-sm font-normal text-gray-400 ml-1.5 hidden sm:inline">{roleLabel}</span>
            </h1>
          </div>

          {/* Chips de eventos — solo md+ */}
          <div className="hidden md:flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
            {!loadingEvents && (
              <>
                {todayEvents.length > 0 ? (
                  <>
                    <span className="text-xs text-gray-400 shrink-0">Hoy:</span>
                    {todayEvents.slice(0, 2).map((e) => {
                      const et = getEventType(e.type);
                      return (
                        <span key={e.id} className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 max-w-[140px] truncate" style={{ background: et.bg, color: et.color }}>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: et.color }} />
                          {e.title}
                        </span>
                      );
                    })}
                    {todayEvents.length > 2 && <span className="text-xs text-gray-400 shrink-0">+{todayEvents.length - 2}</span>}
                  </>
                ) : (
                  <span className="text-xs text-gray-300">Sin eventos hoy</span>
                )}

                {nextEvent && (
                  <>
                    <span className="text-gray-200 shrink-0 hidden lg:inline">·</span>
                    <span className="text-xs text-gray-400 shrink-0 hidden lg:inline">Próximo:</span>
                    {(() => {
                      const et = getEventType(nextEvent.type);
                      const label = new Date(nextEvent.date).toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
                      return (
                        <span className="hidden lg:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 max-w-[150px] truncate" style={{ background: et.bg, color: et.color }}>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: et.color }} />
                          {nextEvent.title} · {label}
                        </span>
                      );
                    })()}
                  </>
                )}
              </>
            )}
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCalendarOpen((v) => !v)}
              className={`flex items-center gap-1 sm:gap-1.5 text-xs font-medium px-2.5 sm:px-3 py-2 rounded-xl border transition-colors ${
                calendarOpen ? "bg-blue-950 text-white border-blue-950" : "bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:text-blue-950"
              }`}
            >
              <span className="icon-[material-symbols--calendar-month-outline] text-base" />
              <span className="hidden sm:inline">Calendario</span>
            </button>

            {canCreate && (
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-1 sm:gap-1.5 text-xs font-medium px-2.5 sm:px-3 py-2 rounded-xl bg-blue-950 text-white hover:bg-blue-900 transition-colors"
              >
                <span className="icon-[lucide--plus] text-base" />
                <span className="hidden sm:inline">Nuevo evento</span>
              </button>
            )}
          </div>
        </div>

        {/* Chips móvil — debajo del saludo en pantallas pequeñas */}
        {!loadingEvents && (todayEvents.length > 0 || nextEvent) && (
          <div className="flex md:hidden items-center gap-2 mt-2 overflow-x-auto pb-0.5">
            {todayEvents.length > 0 && (
              <>
                <span className="text-[10px] text-gray-400 shrink-0">Hoy:</span>
                {todayEvents.slice(0, 1).map((e) => {
                  const et = getEventType(e.type);
                  return (
                    <span key={e.id} className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 max-w-[120px] truncate" style={{ background: et.bg, color: et.color }}>
                      <span className="w-1 h-1 rounded-full shrink-0" style={{ background: et.color }} />
                      {e.title}
                    </span>
                  );
                })}
                {todayEvents.length > 1 && <span className="text-[10px] text-gray-400 shrink-0">+{todayEvents.length - 1}</span>}
              </>
            )}
            {nextEvent && (() => {
              const et = getEventType(nextEvent.type);
              const label = new Date(nextEvent.date).toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
              return (
                <>
                  {todayEvents.length > 0 && <span className="text-gray-200 shrink-0">·</span>}
                  <span className="text-[10px] text-gray-400 shrink-0">Próx:</span>
                  <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 max-w-[120px] truncate" style={{ background: et.bg, color: et.color }}>
                    <span className="w-1 h-1 rounded-full shrink-0" style={{ background: et.color }} />
                    {nextEvent.title} · {label}
                  </span>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* ── Panel calendario colapsable ── */}
      {calendarOpen && (
        <div className="bg-gray-50 border-b border-gray-100 px-4 sm:px-6 py-4 shrink-0">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Mini calendario */}
            <MiniCalendar
              events={events}
              currentMonth={currentMonth}
              currentYear={currentYear}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              onPrevMonth={() => {
                if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
                else setCurrentMonth((m) => m - 1);
              }}
              onNextMonth={() => {
                if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
                else setCurrentMonth((m) => m + 1);
              }}
            />

            {/* Eventos del día seleccionado */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 max-h-64 overflow-y-auto">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                {selectedDay} de {MONTHS[currentMonth]}
              </p>
              <p className="text-xs text-gray-400 mb-3">
                {selectedDayEvents.length === 0 ? "Sin eventos" : `${selectedDayEvents.length} evento${selectedDayEvents.length > 1 ? "s" : ""}`}
              </p>
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-gray-300">Sin eventos este día</p>
                </div>
              ) : selectedDayEvents.map((e) => (
                <EventBadge
                  key={e.id}
                  event={e}
                  canDelete={canCreate && (me?.role === "ADMINISTRATIVE" || e.createdBy?.id === me?.id)}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Próximos eventos */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 max-h-64 overflow-y-auto sm:col-span-2 lg:col-span-1">
              <p className="text-xs font-semibold text-gray-700 mb-3">Próximos eventos</p>
              {loadingEvents ? (
                <p className="text-xs text-gray-400">Cargando...</p>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-gray-300">Sin eventos próximos</p>
                </div>
              ) : upcomingEvents.map((e) => (
                <EventBadge
                  key={e.id}
                  event={e}
                  canDelete={canCreate && (me?.role === "ADMINISTRATIVE" || e.createdBy?.id === me?.id)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <CreateEventModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
        courses={courses}
      />
    </>
  );
}