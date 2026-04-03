// app/dashboard/schedule/components/AdminScheduleView.jsx
"use client";

import { useEffect, useState } from "react";
import ScheduleGrid from "./ScheduleGrid";
import BlocksManager from "./BlocksManager";
import SlotModal from "./SlotModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const DAYS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
];

export default function AdminScheduleView() {
  const [tab, setTab]               = useState("schedule"); // "schedule" | "blocks"
  const [courses, setCourses]       = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [blocks, setBlocks]         = useState([]);
  const [slots, setSlots]           = useState([]);
  const [subjects, setSubjects]     = useState([]);
  const [teachers, setTeachers]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [activeDays, setActiveDays] = useState([1, 2, 3, 4, 5]);

  // Modal
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingSlot, setEditingSlot] = useState(null); // { blockId, dayOfWeek, slot? }

  useEffect(() => {
    async function loadInit() {
      const [coursesRes, subjectsRes, teachersRes] = await Promise.all([
        fetch("/api/courses?onlyActive=1"),
        fetch("/api/subjects"),
        fetch("/api/admin/users"),
      ]);
      const coursesData  = await coursesRes.json();
      const subjectsData = await subjectsRes.json();
      const usersData    = await teachersRes.json();

      setCourses(Array.isArray(coursesData?.courses) ? coursesData.courses : []);
      setSubjects(Array.isArray(subjectsData?.subjects) ? subjectsData.subjects : []);
      setTeachers((Array.isArray(usersData) ? usersData : []).filter((u) => u.rol === "TEACHER"));

      // Cargar bloques
      const blocksRes = await fetch("/api/schedule/blocks");
      const blocksData = await blocksRes.json();
      setBlocks(blocksData.blocks ?? []);
    }
    loadInit();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    async function loadSchedule() {
      setLoading(true);
      try {
        const res = await fetch(`/api/schedule/course/${selectedCourseId}`);
        const data = await res.json();
        setSlots(data.slots ?? []);
        if (data.blocks?.length > 0) setBlocks(data.blocks);
      } finally {
        setLoading(false);
      }
    }
    loadSchedule();
  }, [selectedCourseId]);

  const handleCellClick = (blockId, dayOfWeek) => {
    const existing = slots.find(
      (s) => s.blockId === blockId && s.dayOfWeek === dayOfWeek
    );
    setEditingSlot({ blockId, dayOfWeek, slot: existing ?? null });
    setModalOpen(true);
  };

  const handleSlotSaved = (slot) => {
    setSlots((prev) => {
      const exists = prev.find(
        (s) => s.blockId === slot.blockId && s.dayOfWeek === slot.dayOfWeek
      );
      if (exists) return prev.map((s) => (s.id === exists.id ? slot : s));
      return [...prev, slot];
    });
  };

  const handleSlotDeleted = (blockId, dayOfWeek) => {
    setSlots((prev) =>
      prev.filter((s) => !(s.blockId === blockId && s.dayOfWeek === dayOfWeek))
    );
  };

  const handleBlocksChanged = (newBlocks) => {
    setBlocks(newBlocks);
  };

  const toggleDay = (day) => {
    setActiveDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  return (
    <div className="px-12 py-9 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Horarios</p>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de horarios</h1>
        <p className="text-sm text-gray-400 mt-1">Configura los bloques y asigna clases a cada curso</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        {[
          { key: "schedule", label: "Horario por curso" },
          { key: "blocks", label: "Bloques horarios" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? "border-blue-950 text-blue-950"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "blocks" && (
        <BlocksManager blocks={blocks} onChanged={handleBlocksChanged} />
      )}

      {tab === "schedule" && (
        <div className="space-y-6">
          {/* Selector de curso + días */}
          <div className="flex items-end gap-6 flex-wrap">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">
                Curso
              </label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="w-[220px] bg-white border-gray-200">
                  <SelectValue placeholder="Seleccionar curso..." />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">
                Días a mostrar
              </label>
              <div className="flex gap-2">
                {DAYS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => toggleDay(d.value)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                      activeDays.includes(d.value)
                        ? "bg-blue-950 text-white border-blue-950"
                        : "bg-white text-gray-500 border-gray-200 hover:border-blue-200"
                    }`}
                  >
                    {d.label.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!selectedCourseId ? (
            <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">
              <p className="text-4xl mb-4">📋</p>
              <p className="text-sm font-semibold text-gray-700">Selecciona un curso</p>
              <p className="text-xs text-gray-400 mt-2">
                Elige un curso para ver y editar su horario semanal.
              </p>
            </div>
          ) : blocks.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">
              <p className="text-4xl mb-4">⏰</p>
              <p className="text-sm font-semibold text-gray-700">Sin bloques horarios</p>
              <p className="text-xs text-gray-400 mt-2">
                Ve a la pestaña{" "}
                <button onClick={() => setTab("blocks")} className="text-blue-600 underline">
                  Bloques horarios
                </button>{" "}
                para crear los bloques primero.
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-950 rounded-full animate-spin" />
            </div>
          ) : (
            <ScheduleGrid
              blocks={blocks}
              slots={slots}
              days={activeDays}
              dayLabels={["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]}
              onCellClick={handleCellClick}
              readOnly={false}
            />
          )}
        </div>
      )}

      {modalOpen && editingSlot && (
        <SlotModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingSlot(null); }}
          blockId={editingSlot.blockId}
          dayOfWeek={editingSlot.dayOfWeek}
          existingSlot={editingSlot.slot}
          courseId={selectedCourseId}
          subjects={subjects}
          teachers={teachers}
          blocks={blocks}
          days={DAYS}
          onSaved={handleSlotSaved}
          onDeleted={handleSlotDeleted}
        />
      )}
    </div>
  );
}