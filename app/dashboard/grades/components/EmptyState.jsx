// app/dashboard/grades/components/EmptyState.jsx
"use client";

export function EmptySelectState() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl py-16 px-8 flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl">
        📒
      </div>
      <div>
        <p className="text-base font-semibold text-gray-700 mb-1">Selecciona un curso y período</p>
        <p className="text-sm text-gray-400 max-w-xs">
          Elige la asignatura y el período académico en los selectores de arriba para ver y gestionar las notas de tus alumnos.
        </p>
      </div>
      <div className="flex gap-6 mt-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">1</span>
          Elige curso · asignatura
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">2</span>
          Elige período
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">3</span>
          Agrega notas
        </div>
      </div>
    </div>
  );
}

export function EmptyStudentsState({ courseName, subjectName }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl py-16 px-8 flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-yellow-50 flex items-center justify-center text-3xl">
        🎒
      </div>
      <div>
        <p className="text-base font-semibold text-gray-700 mb-1">No hay alumnos en este curso</p>
        <p className="text-sm text-gray-400 max-w-xs">
          {courseName && subjectName
            ? `El curso ${courseName} no tiene alumnos asignados aún. Puedes invitarlos desde Gestión de Usuarios.`
            : "Este curso no tiene alumnos asignados aún."}
        </p>
      </div>
      <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 text-xs text-yellow-700 max-w-xs">
        💡 Para agregar alumnos ve a <strong>Gestión de usuarios → Invitar usuario</strong> y asígnales el curso correspondiente.
      </div>
    </div>
  );
}

export function EmptySearchState({ search }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl py-12 px-8 flex flex-col items-center text-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl">
        🔍
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-1">Sin resultados para "{search}"</p>
        <p className="text-xs text-gray-400">Intenta con otro nombre o email del alumno.</p>
      </div>
    </div>
  );
}

export function EmptyAssignmentsState({ isAdmin = false }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl py-16 px-8 flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl">
        📋
      </div>
      <div>
        <p className="text-base font-semibold text-gray-700 mb-1">
          {isAdmin ? "No hay asignaciones configuradas" : "No tienes asignaciones activas"}
        </p>
        <p className="text-sm text-gray-400 max-w-xs">
          {isAdmin
            ? "Aún no hay docentes con asignaturas asignadas en el año académico activo. Configura las asignaciones desde Ajustes."
            : "Aún no tienes cursos ni asignaturas asignadas para el año académico activo. Contacta a tu administrador."}
        </p>
      </div>
      {isAdmin && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-xs text-indigo-700 max-w-xs">
          💡 Ve a <strong>Ajustes → Asignaciones docentes</strong> para configurar qué profesor enseña qué asignatura.
        </div>
      )}
    </div>
  );
}

export function LoadingState({ message = "Cargando..." }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl py-16 flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}