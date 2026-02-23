"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";

import UserTableControls from "./components/UserTableControls";
import UsersTable from "./components/UserManagmentTable";
import InvitationsTable from "./components/InvitationsTable";

import InviteUserModal from "./components/RegisterUserForm";
import ImportUsersModal from "./components/ImportUsersModal";
import EditUserModal from "./components/EditUserModal";

import { revokeInvitation } from "../invitations/actions";

/**
 * Fetcher estándar para SWR
 */
async function fetcher(url) {
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    // intenta leer mensaje de error
    let msg = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      msg = data?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  return res.json();
}



export default function UserManagementClient({ initialUsers = [] }) {
  // =========================
  // 1) USERS (cache + SSR fallback)
  // =========================
  const {
    data: users = initialUsers,
    isLoading: usersLoading,
    error: usersError,
    mutate: mutateUsers,
  } = useSWR("/api/admin/users", fetcher, {
    fallbackData: initialUsers,
    revalidateOnFocus: true,
    dedupingInterval: 15_000,
  });

  // =========================
  // 2) INVITATIONS (cache)
  // =========================
  const {
    data: invitations = [],
    isLoading: loadingInvitations,
    error: invitationsError,
    mutate: mutateInvitations,
  } = useSWR("/api/admin/invitations", fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 10_000,
  });

  // =========================
  // UI state (filtros y modales)
  // =========================
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRol, setFilterRol] = useState("Todos");
  const [filterCourse, setFilterCourse] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // =========================
  // Actions
  // =========================
  const handleRefreshInvitations = async () => {
    try {
      await mutateInvitations();
    } catch (e) {
      console.error(e);
      alert(e?.message || "No se pudieron cargar las invitaciones");
    }
  };

  const handleRevokeInvitation = async (invitationId) => {
    const ok = confirm("¿Revocar esta invitación?");
    if (!ok) return;

    try {
      await revokeInvitation(invitationId);
      // refresca cache de invitaciones
      await mutateInvitations();
    } catch (e) {
      alert(e?.message || "No se pudo revocar la invitación");
    }
  };

  // Si tu InviteUserModal crea invitación, cuando cierre/confirm, refrescamos:
  const handleInvited = async () => {
    await mutateInvitations();
    // opcional: si invitar también puede afectar "users" (por ejemplo si creas usuarios directos)
    // await mutateUsers();
  };

  // =========================
  // Options de filtros
  // =========================
  const rolOptions = useMemo(
    () => ["Todos", ...new Set((users || []).map((u) => u.rol))],
    [users]
  );

  const courseOptions = useMemo(() => {
    const allCourses = (users || []).flatMap((u) => u.curso || []);
    return ["Todos", ...new Set(allCourses)];
  }, [users]);

  const statusOptions = useMemo(
    () => ["Todos", ...new Set((users || []).map((u) => u.estado))],
    [users]
  );

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return (users || []).filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(q) ||
        String(user.id).includes(searchTerm);

      const matchesRol = filterRol === "Todos" || user.rol === filterRol;
      const matchesCourse =
        filterCourse === "Todos" ||
        (user.curso && user.curso.includes(filterCourse));
      const matchesStatus =
        filterStatus === "Todos" || user.estado === filterStatus;

      return matchesSearch && matchesRol && matchesCourse && matchesStatus;
    });
  }, [users, searchTerm, filterRol, filterCourse, filterStatus]);

  // =========================
  // Error surfacing (mínimo)
  // =========================
  const anyError = usersError || invitationsError;
  if (anyError) {
    // No rompas toda la UI: solo muestra una alerta visual arriba
    // (lo dejo simple; si quieres lo hacemos con Shadcn alert)
    console.error(anyError);
  }


  async function deleteUserApi(userId) {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    let msg = `No se pudo eliminar (${res.status})`;
    try {
      const data = await res.json();
      msg = data?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  return res.json();
}

const handleDeleteUser = async (user) => {
  const ok = confirm(`¿Eliminar a ${user.name}? Esto borra DB + Stack Auth.`);
  if (!ok) return;

  try {
    // opcional UX: optimista primero
    await mutateUsers((current) => (current || []).filter((u) => u.id !== user.id), {
      revalidate: false,
    });

    await deleteUserApi(user.id);

    // revalida de verdad desde el backend
    await mutateUsers(undefined, { revalidate: true });
  } catch (e) {
    // rollback: revalida para recuperar estado real si falló
    await mutateUsers(undefined, { revalidate: true });
    alert(e?.message || "Error eliminando usuario");
  }
};


  return (
    <div className="h-screen w-full flex flex-col p-6 bg-[#F9FAFB]">
      {anyError ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {anyError?.message || "Ocurrió un error cargando datos."}
        </div>
      ) : null}

      <UserTableControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterRol={filterRol}
        onFilterRolChange={setFilterRol}
        filterCourse={filterCourse}
        onFilterCourseChange={setFilterCourse}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        rolOptions={rolOptions}
        courseOptions={courseOptions}
        statusOptions={statusOptions}
        onRegisterUserClick={() => setShowRegisterModal(true)}
        onListExcelClick={() => setIsImportModalOpen(true)}
      />
      <ImportUsersModal
       open={isImportModalOpen}
       onClose={() => setIsImportModalOpen(false)}
       onImported={async () => {
       await mutateInvitations();
       }}
       />

      {/* Users: ahora sí muestra loading real */}
      <UsersTable users={filteredUsers} loading={usersLoading} onEdit={(u) => { setEditingUser(u); setIsEditOpen(true); }} onDelete={handleDeleteUser}/> 
<EditUserModal
  open={isEditOpen}
  onClose={() => { setIsEditOpen(false); setEditingUser(null); }}
  user={editingUser}
  onSaved={async () => {
    // refresca tabla (source of truth: API)
    await mutateUsers(undefined, { revalidate: true });
    setIsEditOpen(false);
    setEditingUser(null);
  }}
/>



      <div className="mt-10">
        <InvitationsTable
          invitations={invitations}
          loading={loadingInvitations}
          onRefresh={handleRefreshInvitations}
          onRevoke={handleRevokeInvitation}
        />
      </div>

      <InviteUserModal
        open={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onInvited={handleInvited}
      />

      <ImportUsersModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={async (fileName) => {
          alert(`Imported users from ${fileName}`);
          // si tu import efectivamente crea usuarios:
          await mutateUsers();
        }}
      />
    </div>
  );
}
