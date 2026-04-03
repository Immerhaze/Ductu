// app/dashboard/userManagment/userManagementClient.jsx
"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";

import UserTableControls from "./components/UserTableControls";
import UsersTable from "./components/UserManagementTable";
import InvitationsTable from "./components/InvitationsTable";
import InviteUserModal from "./components/RegisterUserForm";
import ImportUsersModal from "./components/ImportUsersModal";
import EditUserModal from "./components/EditUserModal";
import { revokeInvitation } from "@/lib/server/actions/invitations";

async function fetcher(url) {
  const res = await fetch(url, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } });
  if (!res.ok) {
    let msg = `Request failed: ${res.status}`;
    try { const data = await res.json(); msg = data?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export default function UserManagementClient({ initialUsers = [] }) {
  const { data: users = initialUsers, isLoading: usersLoading, error: usersError, mutate: mutateUsers } = useSWR("/api/admin/users", fetcher, {
    fallbackData: initialUsers, revalidateOnFocus: true, dedupingInterval: 15_000,
  });

  const { data: invitations = [], isLoading: loadingInvitations, error: invitationsError, mutate: mutateInvitations } = useSWR("/api/admin/invitations", fetcher, {
    revalidateOnFocus: true, dedupingInterval: 10_000,
  });

  const [searchTerm, setSearchTerm]     = useState("");
  const [filterRol, setFilterRol]       = useState("Todos");
  const [filterCourse, setFilterCourse] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");

  const [showInviteModal, setShowInviteModal]   = useState(false);
  const [showImportModal, setShowImportModal]   = useState(false);
  const [editingUser, setEditingUser]           = useState(null);
  const [isEditOpen, setIsEditOpen]             = useState(false);

  const handleRefreshInvitations = async () => { try { await mutateInvitations(); } catch (e) { alert(e?.message || "Error"); } };

  const handleRevokeInvitation = async (invitationId) => {
    if (!confirm("¿Revocar esta invitación?")) return;
    try { await revokeInvitation(invitationId); await mutateInvitations(); }
    catch (e) { alert(e?.message || "No se pudo revocar"); }
  };

  const handleInvited = async () => { await mutateInvitations(); };

  const rolOptions    = useMemo(() => ["Todos", ...new Set((users || []).map((u) => u.rol))], [users]);
  const courseOptions = useMemo(() => { const all = (users || []).flatMap((u) => u.curso || []); return ["Todos", ...new Set(all)]; }, [users]);
  const statusOptions = useMemo(() => ["Todos", ...new Set((users || []).map((u) => u.estado))], [users]);

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return (users || []).filter((user) => {
      const matchesSearch  = user.name?.toLowerCase().includes(q) || String(user.id).includes(searchTerm);
      const matchesRol     = filterRol === "Todos" || user.rol === filterRol;
      const matchesCourse  = filterCourse === "Todos" || (user.curso && user.curso.includes(filterCourse));
      const matchesStatus  = filterStatus === "Todos" || user.estado === filterStatus;
      return matchesSearch && matchesRol && matchesCourse && matchesStatus;
    });
  }, [users, searchTerm, filterRol, filterCourse, filterStatus]);

  const anyError = usersError || invitationsError;

  async function deleteUserApi(userId) {
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) { let msg = `No se pudo eliminar (${res.status})`; try { const d = await res.json(); msg = d?.message || msg; } catch {} throw new Error(msg); }
    return res.json();
  }

  const handleDeleteUser = async (user) => {
    if (!confirm(`¿Eliminar a ${user.name}? Esto borra DB + Stack Auth.`)) return;
    try {
      await mutateUsers((current) => (current || []).filter((u) => u.id !== user.id), { revalidate: false });
      await deleteUserApi(user.id);
      await mutateUsers(undefined, { revalidate: true });
    } catch (e) {
      await mutateUsers(undefined, { revalidate: true });
      alert(e?.message || "Error eliminando usuario");
    }
  };

  return (
    <div className="w-full flex flex-col p-6 pb-12 bg-gray-50 min-h-screen">

      {anyError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {anyError?.message || "Ocurrió un error cargando datos."}
        </div>
      )}

      <UserTableControls
        searchTerm={searchTerm}      onSearchChange={setSearchTerm}
        filterRol={filterRol}        onFilterRolChange={setFilterRol}
        filterCourse={filterCourse}  onFilterCourseChange={setFilterCourse}
        filterStatus={filterStatus}  onFilterStatusChange={setFilterStatus}
        rolOptions={rolOptions}      courseOptions={courseOptions}  statusOptions={statusOptions}
        onRegisterUserClick={() => setShowInviteModal(true)}
        onListExcelClick={() => setShowImportModal(true)}
      />

      <UsersTable
        users={filteredUsers}
        loading={usersLoading}
        onEdit={(u) => { setEditingUser(u); setIsEditOpen(true); }}
        onDelete={handleDeleteUser}
      />

      <div className="mt-8">
        <InvitationsTable
          invitations={invitations}
          loading={loadingInvitations}
          onRefresh={handleRefreshInvitations}
          onRevoke={handleRevokeInvitation}
        />
      </div>

      {/* Modales — solo una instancia de cada uno */}
      <InviteUserModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvited={handleInvited}
      />

      <ImportUsersModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={async () => { await mutateInvitations(); }}
      />

      <EditUserModal
        open={isEditOpen}
        onClose={() => { setIsEditOpen(false); setEditingUser(null); }}
        user={editingUser}
        onSaved={async () => {
          await mutateUsers(undefined, { revalidate: true });
          setIsEditOpen(false);
          setEditingUser(null);
        }}
      />
    </div>
  );
}