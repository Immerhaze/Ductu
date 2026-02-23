// lib/userTableDto.js
export function toUsersTableDto(dbUsers) {
  return dbUsers.map((u) => ({
    id: u.id, // o u.id interno, o u.authUserId, como decidas mostrar
    name: u.fullName ?? u.name ?? "-",
    rol: u.role ?? "-",            // ej: "ADMIN" | "TEACHER" | "STUDENT"
    cargo: u.position ?? u.jobTitle ?? "-", // ej: "Rector", "Docente", etc.
    curso: Array.isArray(u.courses)
      ? u.courses.map((c) => c.name) // si es relación
      : Array.isArray(u.courseNames)
        ? u.courseNames
        : [],
    estado: u.status === "ACTIVE" ? "Activo" : "Inactivo",
  }));
}
