// app/dashboard/userManagment/components/UserManagementTable.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const ROLE_LABEL = {
  ADMINISTRATIVE: "Admin",
  TEACHER: "Docente",
  STUDENT: "Estudiante",
};

const ROLE_BADGE = {
  ADMINISTRATIVE: "bg-purple-50 text-purple-700 border-purple-100",
  TEACHER:        "bg-blue-50 text-blue-700 border-blue-100",
  STUDENT:        "bg-green-50 text-green-700 border-green-100",
};

export default function UsersTable({ users = [], loading = false, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 7;

  useEffect(() => setCurrentPage(1), [users]);

  const totalPages  = Math.ceil(users.length / usersPerPage);
  const currentUsers = useMemo(() => users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage), [users, currentPage]);

  const handlePageChange = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

  const paginationNumbers = useMemo(() => {
    const pagesToShow = 5;
    const pages = [];
    if (totalPages > 0) pages.push(1);
    if (currentPage > pagesToShow / 2 + 1 && totalPages > pagesToShow) pages.push("...");
    const startPage = Math.max(2, currentPage - Math.floor(pagesToShow / 2) + 1);
    const endPage   = Math.min(totalPages - 1, currentPage + Math.floor(pagesToShow / 2) - 1);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (currentPage < totalPages - pagesToShow / 2 && totalPages > pagesToShow) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return [...new Set(pages)];
  }, [totalPages, currentPage]);

  const showEmpty = !loading && currentUsers.length === 0;

  return (
    <TooltipProvider>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-100">
              <TableHead className="w-12 text-xs font-semibold text-gray-400 uppercase tracking-widest">#</TableHead>
              <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Nombre</TableHead>
              <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Rol</TableHead>
              <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Cargo</TableHead>
              <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Curso(s)</TableHead>
              <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Estado</TableHead>
              <TableHead className="text-right text-xs font-semibold text-gray-400 uppercase tracking-widest">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: usersPerPage }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="border-b border-gray-50">
                  {[12, 40, 20, 24, 48, 20, 8].map((w, j) => (
                    <TableCell key={j}>
                      <div className={`h-4 w-${w} animate-pulse rounded-md bg-gray-100`} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : showEmpty ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <span className="icon-[lucide--users] text-3xl" />
                    <p className="text-sm">No se encontraron usuarios.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentUsers.map((user, index) => {
                const rowNumber = (currentPage - 1) * usersPerPage + index + 1;
                const userCourses = Array.isArray(user.curso) ? user.curso : [];
                const displayCourses = userCourses.slice(0, 2);
                const remaining = userCourses.length - displayCourses.length;
                const roleBadge = ROLE_BADGE[user.rol] ?? "bg-gray-50 text-gray-600 border-gray-100";
                const roleLabel = ROLE_LABEL[user.rol] ?? user.rol;

                return (
                  <TableRow key={`${user.id}-${user.name}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <TableCell className="text-xs text-gray-400 font-medium">{rowNumber}</TableCell>

                    <TableCell>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </TableCell>

                    <TableCell>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${roleBadge}`}>
                        {roleLabel}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm text-gray-600">{user.cargo || <span className="text-gray-300">—</span>}</TableCell>

                    <TableCell>
                      {userCourses.length > 0 ? (
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 text-sm text-gray-600 cursor-help">
                              {displayCourses.map((course, i) => (
                                <span key={`${course}-${i}`} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-md">
                                  {course}
                                </span>
                              ))}
                              {remaining > 0 && (
                                <span className="text-xs text-blue-600 font-medium">+{remaining}</span>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-900 text-white text-xs p-2 rounded-lg max-w-xs">
                            <p className="font-semibold mb-1">Cursos:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                              {userCourses.map((course, i) => <li key={`tooltip-${course}-${i}`}>{course}</li>)}
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        user.estado === "Activo" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                      }`}>
                        {user.estado}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                            <span className="icon-[lucide--more-horizontal] h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuLabel className="text-xs text-gray-400">Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onEdit?.(user)} className="text-sm cursor-pointer">
                            <span className="icon-[lucide--pencil] mr-2 text-sm" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete?.(user)} className="text-sm text-red-600 cursor-pointer focus:text-red-600">
                            <span className="icon-[lucide--trash-2] mr-2 text-sm" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {!loading && totalPages > 1 && (
          <div className="border-t border-gray-100 px-4 py-3">
            <Pagination>
              <PaginationContent>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`cursor-pointer ${currentPage > 1 ? "bg-blue-950 text-white hover:bg-blue-900" : "text-gray-300 pointer-events-none"}`}
                />
                {paginationNumbers.map((page, index) => (
                  <PaginationItem key={`${page}-${index}`}>
                    {page === "..." ? <PaginationEllipsis /> : (
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        className={`cursor-pointer ${page === currentPage ? "bg-blue-950 text-white hover:bg-blue-900" : ""}`}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`cursor-pointer ${currentPage < totalPages ? "bg-blue-950 text-white hover:bg-blue-900" : "text-gray-300 pointer-events-none"}`}
                />
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}