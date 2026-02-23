'use client';

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function InvitationsTable({ invitations, loading, onRefresh, onRevoke }) {
  return (
    <div className="bg-white overflow-x-auto border-2 p-4 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-blue-950">Invitaciones pendientes</h2>
        <Button variant="ghost" onClick={onRefresh} disabled={loading}>
          {loading ? "Actualizando..." : "Actualizar"}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Creada</TableHead>
            <TableHead>Expira</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {invitations?.length ? (
            invitations.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium">{inv.email}</TableCell>
                <TableCell>{inv.role}</TableCell>
                <TableCell>{inv.positionTitle ?? "-"}</TableCell>
                <TableCell>{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(inv.expiresAt).toLocaleDateString()}</TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="icon-[lucide--more-horizontal] h-4 w-4"></span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem className="text-red-600" onClick={() => onRevoke(inv.id)}>
                        Revocar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-20 text-center text-gray-500">
                {loading ? "Cargando invitaciones..." : "No hay invitaciones pendientes."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
