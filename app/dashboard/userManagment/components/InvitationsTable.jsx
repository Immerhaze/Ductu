// app/dashboard/userManagment/components/InvitationsTable.jsx
'use client';

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const ROLE_LABEL = { ADMINISTRATIVE: "Admin", TEACHER: "Docente", STUDENT: "Estudiante" };
const ROLE_BADGE = {
  ADMINISTRATIVE: "bg-purple-50 text-purple-700",
  TEACHER:        "bg-blue-50 text-blue-700",
  STUDENT:        "bg-green-50 text-green-700",
};

export default function InvitationsTable({ invitations, loading, onRefresh, onRevoke }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Invitaciones pendientes</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {invitations?.length ?? 0} invitación{invitations?.length !== 1 ? "es" : ""} activa{invitations?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={onRefresh}
          disabled={loading}
          className="text-xs text-gray-500 hover:text-blue-950 h-8"
        >
          <span className="icon-[lucide--refresh-cw] mr-1.5 text-sm" />
          {loading ? "Actualizando..." : "Actualizar"}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-b border-gray-100">
            {["Email", "Rol", "Cargo", "Creada", "Expira", "Acciones"].map((h) => (
              <TableHead key={h} className={`text-xs font-semibold text-gray-400 uppercase tracking-widest ${h === "Acciones" ? "text-right" : ""}`}>
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i} className="border-b border-gray-50">
                {[40, 16, 24, 16, 16, 8].map((w, j) => (
                  <TableCell key={j}>
                    <div className={`h-4 w-${w} animate-pulse rounded-md bg-gray-100`} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : invitations?.length ? (
            invitations.map((inv) => (
              <TableRow key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <TableCell className="text-sm font-medium text-gray-800">{inv.email}</TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_BADGE[inv.role] ?? "bg-gray-50 text-gray-600"}`}>
                    {ROLE_LABEL[inv.role] ?? inv.role}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-500">{inv.positionTitle ?? <span className="text-gray-300">—</span>}</TableCell>
                <TableCell className="text-xs text-gray-400">{new Date(inv.createdAt).toLocaleDateString("es-CL")}</TableCell>
                <TableCell className="text-xs text-gray-400">{new Date(inv.expiresAt).toLocaleDateString("es-CL")}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                        <span className="icon-[lucide--more-horizontal] h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuLabel className="text-xs text-gray-400">Acciones</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onRevoke(inv.id)} className="text-sm text-red-600 cursor-pointer focus:text-red-600">
                        <span className="icon-[lucide--x-circle] mr-2 text-sm" />
                        Revocar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-20 text-center">
                <p className="text-sm text-gray-400">No hay invitaciones pendientes.</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}