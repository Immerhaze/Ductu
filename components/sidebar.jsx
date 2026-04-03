// components/sidebar.jsx
'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { useUser } from "@stackframe/stack";

export default function SideBar({ userRole }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  function SignOutButton() {
    const user = useUser();
    return (
      <Button
        onClick={() => user.signOut()}
        variant="ghost"
        className="cursor-pointer flex flex-col justify-center items-center group hover:bg-red-600 w-full"
      >
        <span className="icon-[material-symbols--logout] group-hover:text-white text-red-600 text-2xl" />
        {!collapsed && <span className="text-xs text-red-400 group-hover:text-white mt-1">Salir</span>}
      </Button>
    );
  }

  const optionsMap = {
    ADMINISTRATIVE: [
      { icon: "icon-[lineicons--home]",             path: "/dashboard",               label: "Inicio" },
      { icon: "icon-[mynaui--users-group-solid]",   path: "/dashboard/userManagment", label: "Usuarios" },
      { icon: "icon-[carbon--certificate]",         path: "/dashboard/grades",        label: "Calificaciones" },
      { icon: "icon-[fluent--data-pie-32-regular]", path: "/dashboard/data",          label: "Datos" },
      { icon: "icon-[ri--calendar-schedule-line]",  path: "/dashboard/schedule",      label: "Horarios" },
      { icon: "icon-[feather--settings]",           path: "/dashboard/settings",      label: "Ajustes" },
    ],
    TEACHER: [
      { icon: "icon-[lineicons--home]",             path: "/dashboard",               label: "Inicio" },
      { icon: "icon-[carbon--certificate]",         path: "/dashboard/grades",        label: "Calificaciones" },
      { icon: "icon-[fluent--data-pie-32-regular]", path: "/dashboard/data",          label: "Datos" },
      { icon: "icon-[ri--calendar-schedule-line]",  path: "/dashboard/schedule",      label: "Horarios" },
      { icon: "icon-[feather--settings]",           path: "/dashboard/settings",      label: "Ajustes" },
    ],
    STUDENT: [
      { icon: "icon-[lineicons--home]",             path: "/dashboard",               label: "Inicio" },
      { icon: "icon-[carbon--certificate]",         path: "/dashboard/my-profile",    label: "Mi perfil" },
      { icon: "icon-[ri--calendar-schedule-line]",  path: "/dashboard/schedule",      label: "Horarios" },
      { icon: "icon-[feather--settings]",           path: "/dashboard/settings",      label: "Ajustes" },
    ],
  };

  const safeRole = typeof userRole === "string" ? userRole : "";
  const currentOptions = optionsMap[safeRole] || [];

  const isActive = (itemPath) => {
    if (itemPath === '/dashboard') return pathname === '/dashboard';
    return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
  };

  return (
    <div
      className={`
        bg-white text-blue-950 h-full flex flex-col border-r border-gray-100 shadow-sm
        transition-all duration-300
        ${collapsed ? "w-16" : "w-full"}
      `}
    >
      {/* Logo + toggle */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-gray-100 min-h-[64px]">
        {!collapsed && (
          <h1 className="text-lg font-bold tracking-widest text-blue-950 truncate">DUCTU</h1>
        )}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-950 transition-colors shrink-0"
          title={collapsed ? "Expandir" : "Colapsar"}
        >
          <span className={`${collapsed ? "icon-[lucide--chevron-right]" : "icon-[lucide--chevron-left]"} text-lg`} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <ul className="flex flex-col gap-1 px-2">
          {currentOptions.map((item) => {
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  title={collapsed ? item.label : undefined}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${active
                      ? "bg-blue-950 text-white shadow-sm"
                      : "text-gray-500 hover:bg-blue-50 hover:text-blue-950"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `}
                >
                  <span className={`${item.icon} text-xl shrink-0`} />
                  {!collapsed && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 py-3 px-2 flex flex-col items-center gap-2">
        <Avatar className={`border-2 border-blue-500 transition-all duration-300 ${collapsed ? "w-8 h-8" : "w-10 h-10"}`}>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        {!collapsed && (
          <p className="text-xs text-gray-400 font-medium truncate max-w-full px-1">
            {safeRole === "ADMINISTRATIVE" ? "Admin" : safeRole === "TEACHER" ? "Docente" : safeRole === "STUDENT" ? "Estudiante" : safeRole}
          </p>
        )}

        <SignOutButton />
      </div>
    </div>
  );
}