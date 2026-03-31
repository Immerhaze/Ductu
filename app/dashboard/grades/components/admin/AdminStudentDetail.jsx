// app/dashboard/grades/components/admin/AdminStudentDetail.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// ── Constantes ────────────────────────────────────────────────────────────────

const CATEGORY_LABEL = {
  EXAM: 'Prueba', QUIZ: 'Control', ASSIGNMENT: 'Trabajo',
  PROJECT: 'Proyecto', ORAL: 'Presentación oral', OTHER: 'Otro',
};

const CATEGORY_CLASSES = {
  EXAM: 'bg-red-50 text-red-700', QUIZ: 'bg-yellow-50 text-yellow-700',
  ASSIGNMENT: 'bg-indigo-50 text-indigo-700', PROJECT: 'bg-purple-50 text-purple-700',
  ORAL: 'bg-green-50 text-green-700', OTHER: 'bg-gray-100 text-gray-600',
};

const ANNOTATION_CONFIG = {
  POSITIVE:    { label: 'Positiva',    bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: '⭐' },
  NEGATIVE:    { label: 'Negativa',    bg: 'bg-red-50',   text: 'text-red-700',   border: 'border-red-200',   icon: '⚠️' },
  OBSERVATION: { label: 'Observación', bg: 'bg-blue-50',  text: 'text-blue-700',  border: 'border-blue-200',  icon: '📝' },
};

const TAB_LABELS = [
  { key: 'academic',     label: 'Académico' },
  { key: 'annotations',  label: 'Anotaciones' },
  { key: 'achievements', label: 'Logros' },
  { key: 'plans',        label: 'Plan de mejora' },
];

// ── Sub-componentes de UI ─────────────────────────────────────────────────────

function SubjectCard({ subject, passingGrade }) {
  const [open, setOpen] = useState(false);
  const passing = subject.avgGrade >= passingGrade;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className={`w-3 h-3 rounded-full shrink-0 ${passing ? 'bg-green-500' : 'bg-red-500'}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{subject.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {subject.teacher} · {subject.gradesCount} {subject.gradesCount === 1 ? 'nota' : 'notas'}
          </p>
        </div>
        <div className="text-right shrink-0 mr-4">
          <p className={`text-2xl font-bold leading-none ${passing ? 'text-green-600' : 'text-red-500'}`}>
            {subject.avgGrade}
          </p>
          <p className={`text-xs mt-1 font-medium ${passing ? 'text-green-500' : 'text-red-400'}`}>
            {passing ? 'Aprobado' : 'Reprobado'}
          </p>
        </div>
        <span className={`text-gray-400 text-sm transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </div>

      {open && subject.grades.length > 0 && (
        <div className="border-t border-gray-100 px-6 pb-4 pt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left py-2 font-medium">Evaluación</th>
                <th className="text-left py-2 font-medium">Categoría</th>
                <th className="text-left py-2 font-medium">Período</th>
                <th className="text-right py-2 font-medium">Nota</th>
              </tr>
            </thead>
            <tbody>
              {subject.grades.map(g => (
                <tr key={g.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2">
                    <p className="font-medium text-gray-800">{g.title ?? 'Sin título'}</p>
                    {g.comment && <p className="text-xs text-gray-400 mt-0.5">{g.comment}</p>}
                  </td>
                  <td className="py-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${CATEGORY_CLASSES[g.category] ?? CATEGORY_CLASSES.OTHER}`}>
                      {CATEGORY_LABEL[g.category] ?? g.category}
                    </span>
                  </td>
                  <td className="py-2 text-xs text-gray-500">{g.period}</td>
                  <td className={`py-2 text-right font-bold ${g.value >= 4 ? 'text-green-600' : 'text-red-500'}`}>
                    {Number(g.value).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AcademicTab({ academic }) {
  const { overallAvg, passingGrade, subjectSummaries, atRisk } = academic;

  if (!subjectSummaries.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">
        <p className="text-4xl mb-4">📚</p>
        <p className="text-sm font-semibold text-gray-700">Sin notas registradas</p>
        <p className="text-xs text-gray-400 mt-2">Las notas aparecerán aquí una vez que los docentes las ingresen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {atRisk.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 flex items-start gap-4">
          <span className="text-2xl shrink-0">🚨</span>
          <div>
            <p className="text-sm font-semibold text-red-700 mb-2">
              {atRisk.length} {atRisk.length === 1 ? 'materia en riesgo' : 'materias en riesgo'}
            </p>
            <div className="flex flex-wrap gap-2">
              {atRisk.map(s => (
                <span key={s.id} className="text-xs font-medium bg-red-100 text-red-700 px-3 py-1 rounded-lg">
                  {s.name} — {s.avgGrade}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Promedio general</p>
          <p className={`text-3xl font-bold ${overallAvg >= passingGrade ? 'text-green-600' : 'text-red-500'}`}>
            {overallAvg || '—'}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Asignaturas</p>
          <p className="text-3xl font-bold text-gray-900">{subjectSummaries.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Aprobadas</p>
          <p className="text-3xl font-bold text-green-600">
            {subjectSummaries.filter(s => s.passing).length}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Detalle por asignatura</p>
        <div className="space-y-3">
          {subjectSummaries
            .sort((a, b) => a.avgGrade - b.avgGrade)
            .map(s => <SubjectCard key={s.id} subject={s} passingGrade={passingGrade} />)}
        </div>
      </div>
    </div>
  );
}

function AnnotationsTab({ studentId, annotations, onAdded }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter]       = useState('ALL');
  const [type, setType]           = useState('OBSERVATION');
  const [title, setTitle]         = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate]           = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const filtered = filter === 'ALL' ? annotations : annotations.filter(a => a.type === filter);

  const reset = () => { setType('OBSERVATION'); setTitle(''); setDescription(''); setDate(new Date().toISOString().split('T')[0]); setError(''); };

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) { setError('Título y descripción son requeridos.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/grades/${studentId}/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, description, date }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Error guardando'); return; }
      onAdded(data.annotation);
      reset(); setModalOpen(false);
    } catch { setError('Error de red.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['ALL', 'POSITIVE', 'NEGATIVE', 'OBSERVATION'].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                filter === t ? 'bg-blue-950 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t === 'ALL' ? 'Todas' : ANNOTATION_CONFIG[t].label}
            </button>
          ))}
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-blue-950 hover:bg-blue-900 text-sm">
          + Agregar anotación
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-12 text-center">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-sm font-semibold text-gray-700">Sin anotaciones</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => {
            const cfg = ANNOTATION_CONFIG[a.type] ?? ANNOTATION_CONFIG.OBSERVATION;
            return (
              <div key={a.id} className={`border rounded-2xl p-5 ${cfg.bg} ${cfg.border}`}>
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0">{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-sm font-semibold ${cfg.text}`}>{a.title}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md bg-white bg-opacity-60 ${cfg.text}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{a.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(a.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                      {a.author?.fullName ? ` · ${a.author.fullName}` : ''}
                      {a.course?.name ? ` · ${a.course.name}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={v => { if (!v) { reset(); setModalOpen(false); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nueva anotación</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Tipo</label>
              <div className="flex gap-2">
                {Object.entries(ANNOTATION_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setType(key)}
                    className={`flex-1 text-xs font-medium py-2 rounded-lg border transition-colors ${
                      type === key ? `${cfg.bg} ${cfg.text} ${cfg.border}` : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    {cfg.icon} {cfg.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Título *</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Participación destacada" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Descripción *</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe la situación..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-y min-h-[80px] font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Fecha</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { reset(); setModalOpen(false); }} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-950 hover:bg-blue-900">
              {saving ? 'Guardando...' : 'Guardar anotación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AchievementsTab({ studentId, achievements, onAdded }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle]         = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate]           = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const reset = () => { setTitle(''); setDescription(''); setDate(new Date().toISOString().split('T')[0]); setError(''); };

  const handleSave = async () => {
    if (!title.trim()) { setError('El título es requerido.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/grades/${studentId}/achievements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, date }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Error guardando'); return; }
      onAdded(data.achievement);
      reset(); setModalOpen(false);
    } catch { setError('Error de red.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setModalOpen(true)} className="bg-blue-950 hover:bg-blue-900 text-sm">
          + Agregar logro
        </Button>
      </div>

      {achievements.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-12 text-center">
          <p className="text-3xl mb-3">🏆</p>
          <p className="text-sm font-semibold text-gray-700">Sin logros registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map(a => (
            <div key={a.id} className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">🏆</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-yellow-800">{a.title}</p>
                  {a.description && <p className="text-sm text-yellow-700 mt-1 leading-relaxed">{a.description}</p>}
                  <p className="text-xs text-yellow-600 mt-2">
                    {new Date(a.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                    {a.author?.fullName ? ` · ${a.author.fullName}` : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={v => { if (!v) { reset(); setModalOpen(false); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nuevo logro</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Título *</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Primer lugar olimpiada de matemáticas" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Descripción (opcional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe el logro..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-y min-h-[72px] font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Fecha</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { reset(); setModalOpen(false); }} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-950 hover:bg-blue-900">
              {saving ? 'Guardando...' : 'Guardar logro'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlansTab({ studentId, plans, onAdded, onCompleted }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [goal, setGoal]           = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate]     = useState('');
  const [saving, setSaving]       = useState(false);
  const [completing, setCompleting] = useState(null);
  const [error, setError]         = useState('');

  const reset = () => { setGoal(''); setDescription(''); setDueDate(''); setError(''); };

  const handleSave = async () => {
    if (!goal.trim()) { setError('El objetivo es requerido.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/grades/${studentId}/improvement-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, description, dueDate: dueDate || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Error guardando'); return; }
      onAdded(data.plan);
      reset(); setModalOpen(false);
    } catch { setError('Error de red.'); }
    finally { setSaving(false); }
  };

  const handleComplete = async (planId) => {
    setCompleting(planId);
    try {
      const res = await fetch(`/api/grades/${studentId}/improvement-plans/${planId}`, { method: 'PATCH' });
      if (res.ok) onCompleted(planId);
    } finally { setCompleting(null); }
  };

  const active    = plans.filter(p => !p.isCompleted);
  const completed = plans.filter(p => p.isCompleted);

  const PlanCard = ({ plan }) => (
    <div className={`border rounded-2xl p-5 ${plan.isCompleted ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-indigo-50 border-indigo-200'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{plan.isCompleted ? '✅' : '🎯'}</span>
            <p className={`text-sm font-semibold ${plan.isCompleted ? 'text-gray-500 line-through' : 'text-indigo-800'}`}>
              {plan.goal}
            </p>
          </div>
          {plan.description && <p className="text-sm text-gray-600 mt-1 leading-relaxed pl-7">{plan.description}</p>}
          <div className="flex items-center gap-3 mt-2 pl-7">
            {plan.dueDate && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                plan.isCompleted ? 'bg-gray-100 text-gray-500' :
                new Date(plan.dueDate) < new Date() ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'
              }`}>
                📅 {new Date(plan.dueDate).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            )}
            {plan.author?.fullName && <span className="text-xs text-gray-400">Por {plan.author.fullName}</span>}
          </div>
          {plan.isCompleted && plan.completedAt && (
            <p className="text-xs text-green-600 mt-1 pl-7">
              Completado el {new Date(plan.completedAt).toLocaleDateString('es-CL')}
            </p>
          )}
        </div>
        {!plan.isCompleted && (
          <button
            onClick={() => handleComplete(plan.id)}
            disabled={completing === plan.id}
            className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
          >
            {completing === plan.id ? '...' : 'Marcar completado'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setModalOpen(true)} className="bg-blue-950 hover:bg-blue-900 text-sm">
          + Nuevo plan de mejora
        </Button>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-12 text-center">
          <p className="text-3xl mb-3">🎯</p>
          <p className="text-sm font-semibold text-gray-700">Sin planes de mejora</p>
          <p className="text-xs text-gray-400 mt-1">Crea un plan para ayudar al alumno a mejorar su rendimiento.</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Activos ({active.length})</p>
              <div className="space-y-3">{active.map(p => <PlanCard key={p.id} plan={p} />)}</div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Completados ({completed.length})</p>
              <div className="space-y-3">{completed.map(p => <PlanCard key={p.id} plan={p} />)}</div>
            </div>
          )}
        </>
      )}

      <Dialog open={modalOpen} onOpenChange={v => { if (!v) { reset(); setModalOpen(false); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nuevo plan de mejora</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Objetivo *</label>
              <Input value={goal} onChange={e => setGoal(e.target.value)} placeholder="Ej: Mejorar promedio de Matemáticas a 5.0" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Descripción (opcional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe las acciones a tomar..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-y min-h-[80px] font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Fecha límite (opcional)</label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { reset(); setModalOpen(false); }} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-950 hover:bg-blue-900">
              {saving ? 'Guardando...' : 'Crear plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function AdminStudentDetail({ studentId }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('academic');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [data, setData]           = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/grades/${studentId}/profile`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setData(await res.json());
      } catch { setError('No se pudo cargar el perfil del alumno.'); }
      finally { setLoading(false); }
    }
    load();
  }, [studentId]);

  const handleAnnotationAdded  = (a) => setData(p => ({ ...p, annotations:    [a, ...(p.annotations    ?? [])] }));
  const handleAchievementAdded = (a) => setData(p => ({ ...p, achievements:    [a, ...(p.achievements   ?? [])] }));
  const handlePlanAdded        = (a) => setData(p => ({ ...p, improvementPlans:[a, ...(p.improvementPlans ?? [])] }));
  const handlePlanCompleted    = (id) => setData(p => ({
    ...p,
    improvementPlans: p.improvementPlans.map(pl =>
      pl.id === id ? { ...pl, isCompleted: true, completedAt: new Date().toISOString() } : pl
    ),
  }));

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center space-y-3">
        <div>
          <p className="text-red-500 text-sm">{error || 'Perfil no encontrado'}</p>
          <button onClick={() => router.back()} className="text-sm text-blue-600 underline mt-2">Volver</button>
        </div>
      </div>
    );
  }

  const { student, academic, annotations, achievements, improvementPlans } = data;

  return (
    <div className="min-h-screen bg-gray-50 font-sans -m-4">

      {/* Header */}
      <div className="bg-blue-950 px-12 py-8">
        <button
          onClick={() => router.back()}
          className="text-blue-300 hover:text-white text-sm mb-6 flex items-center gap-2 transition-colors"
        >
          ← Volver
        </button>

        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-indigo-500 flex items-center justify-center text-3xl font-bold text-white shrink-0">
            {student.fullName?.charAt(0) ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white">{student.fullName ?? 'Sin nombre'}</h1>
            <p className="text-blue-300 text-sm mt-1">{student.email}</p>
            <div className="flex items-center gap-3 mt-2">
              {student.course && (
                <span className="text-xs font-medium bg-blue-900 text-blue-200 px-3 py-1 rounded-full">
                  {student.course.name}
                </span>
              )}
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                student.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
              }`}>
                {student.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          {/* KPIs */}
          <div className="hidden md:flex gap-4 shrink-0">
            <div className="bg-blue-900 rounded-xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-white">{academic.overallAvg || '—'}</p>
              <p className="text-xs text-blue-300 mt-1">Promedio general</p>
            </div>
            <div className="bg-blue-900 rounded-xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-white">{academic.atRisk?.length ?? 0}</p>
              <p className="text-xs text-blue-300 mt-1">En riesgo</p>
            </div>
            <div className="bg-blue-900 rounded-xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-white">
                {improvementPlans?.filter(p => !p.isCompleted).length ?? 0}
              </p>
              <p className="text-xs text-blue-300 mt-1">Planes activos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-12">
        <div className="flex">
          {TAB_LABELS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-950 text-blue-950'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div className="px-12 py-8">
        {activeTab === 'academic'     && <AcademicTab    academic={academic} />}
        {activeTab === 'annotations'  && <AnnotationsTab studentId={studentId} annotations={annotations}       onAdded={handleAnnotationAdded} />}
        {activeTab === 'achievements' && <AchievementsTab studentId={studentId} achievements={achievements}    onAdded={handleAchievementAdded} />}
        {activeTab === 'plans'        && <PlansTab        studentId={studentId} plans={improvementPlans}       onAdded={handlePlanAdded} onCompleted={handlePlanCompleted} />}
      </div>
    </div>
  );
}