"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export default function UsersTable({ users = [], loading = false, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 7;

  useEffect(() => setCurrentPage(1), [users]);

  const totalPages = Math.ceil(users.length / usersPerPage);

  const currentUsers = useMemo(() => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    return users.slice(indexOfFirstUser, indexOfLastUser);
  }, [users, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const paginationNumbers = useMemo(() => {
    const pagesToShow = 5;
    const pages = [];
    if (totalPages > 0) pages.push(1);
    if (currentPage > pagesToShow / 2 + 1 && totalPages > pagesToShow)
      pages.push("...");

    const startPage = Math.max(
      2,
      currentPage - Math.floor(pagesToShow / 2) + 1
    );
    const endPage = Math.min(
      totalPages - 1,
      currentPage + Math.floor(pagesToShow / 2) - 1
    );

    for (let i = startPage; i <= endPage; i++) pages.push(i);

    if (currentPage < totalPages - pagesToShow / 2 && totalPages > pagesToShow)
      pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return [...new Set(pages)];
  }, [totalPages, currentPage]);

  const showEmpty = !loading && currentUsers.length === 0;

  return (
    <TooltipProvider>
      <div className="bg-white overflow-x-auto border-2 p-4 rounded-xl shadow-md">
        {loading && (
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
            Cargando usuarios...
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">#</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Curso(s)</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: usersPerPage }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell>
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="ml-auto h-8 w-8 animate-pulse rounded bg-gray-200" />
                  </TableCell>
                </TableRow>
              ))
            ) : showEmpty ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            ) : (
              currentUsers.map((user,index) => {
                const rowNumber = (currentPage - 1) * usersPerPage + index + 1;
                const userCourses = Array.isArray(user.curso) ? user.curso : [];
                const displayCourses = userCourses.slice(0, 2);
                const remainingCoursesCount = userCourses.length - displayCourses.length;

                return (
                  <TableRow key={`${user.id}-${user.name}`}>
                    <TableCell className="font-medium">{rowNumber}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.rol}</TableCell>
                    <TableCell>{user.cargo}</TableCell>

                    <TableCell>
                      {userCourses.length > 0 ? (
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <div className="flex flex-row items-center space-x-1 text-gray-600 cursor-help">
                              <ul className="flex flex-row flex-wrap gap-x-1 text-sm font-medium">
                                {displayCourses.map((course, index) => (
                                  <li key={`${course}-${index}`}>
                                    {course}
                                    {index < displayCourses.length - 1 ? "," : ""}
                                  </li>
                                ))}
                                {remainingCoursesCount > 0 ? (
                                  <li className="text-blue-600">
                                    {`, +${remainingCoursesCount} más`}
                                  </li>
                                ) : null}
                              </ul>
                            </div>
                          </TooltipTrigger>

                          <TooltipContent className="bg-gray-800 text-white text-sm p-2 rounded-md shadow-lg max-w-xs">
                            <p className="font-semibold mb-1">Cursos:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                              {userCourses.map((course, index) => (
                                <li key={`tooltip-${course}-${index}`}>{course}</li>
                              ))}
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.estado === "Activo"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.estado}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="icon-[lucide--more-horizontal] h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onEdit?.(user)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                          className="text-red-600" 
                          onClick={() => onDelete?.(user)}> 
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

        {/* Hide pagination while loading (optional, but cleaner) */}
        {!loading && totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                isActive={currentPage > 1}
                className={`${
                  currentPage > 1 ? "bg-blue-950 text-white" : "text-gray-400"
                } cursor-pointer`}
              />
              {paginationNumbers.map((page, index) => (
                <PaginationItem key={`${page}-${index}`}>
                  {page === "..." ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === currentPage}
                      className={`${
                        page === currentPage ? "bg-blue-950 text-white" : ""
                      } cursor-pointer`}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                isActive={currentPage < totalPages}
                className={`${
                  currentPage < totalPages ? "bg-blue-950 text-white" : "text-gray-400"
                } cursor-pointer`}
              />
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </TooltipProvider>
  );
}
