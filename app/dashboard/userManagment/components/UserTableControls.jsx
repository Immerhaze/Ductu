// app/dashboard/userManagment/components/UserTableControls.jsx
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function UserTableControls({
  searchTerm, onSearchChange,
  filterRol, onFilterRolChange,
  filterCourse, onFilterCourseChange,
  filterStatus, onFilterStatusChange,
  rolOptions, courseOptions, statusOptions,
  onRegisterUserClick, onListExcelClick,
}) {
  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="icon-[lucide--users-round] text-2xl text-blue-950" />
          <h2 className="text-2xl font-bold text-gray-900">Gestión usuarios</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onRegisterUserClick}
            className="bg-blue-950 hover:bg-blue-900 text-white flex items-center gap-2 text-sm"
          >
            <span className="icon-[lucide--user-plus] text-base" />
            Registrar usuario
          </Button>
          <Button
            variant="outline"
            onClick={onListExcelClick}
            className="flex items-center gap-2 text-sm border-gray-200 text-gray-600 hover:text-blue-950"
          >
            <span className="icon-[lucide--file-spreadsheet] text-base" />
            Listar con excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        {[
          { label: "Rol", value: filterRol, options: rolOptions, onChange: onFilterRolChange },
          { label: "Curso", value: filterCourse, options: courseOptions, onChange: onFilterCourseChange },
          { label: "Estado", value: filterStatus, options: statusOptions, onChange: onFilterStatusChange },
        ].map(({ label, value, options, onChange }) => (
          <DropdownMenu key={label}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 text-sm border-gray-200 text-gray-600 hover:text-blue-950 h-9">
                {label}: <span className="font-medium text-gray-900">{value}</span>
                <span className="icon-[lucide--chevron-down] text-sm" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {options.map(option => (
                <DropdownMenuItem key={option} onClick={() => onChange(option)}>
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}

        <div className="relative flex-1 max-w-xs">
          <span className="icon-[lucide--search] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <Input
            type="text"
            placeholder="Buscar..."
            className="pl-9 h-9 text-sm border-gray-200"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}