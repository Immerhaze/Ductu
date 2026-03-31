// components/sidebar.jsx
'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { useUser } from "@stackframe/stack";

export default function SideBar({ userRole }) {
  const pathname = usePathname();

  function SignOutButton() {
    const user = useUser();
    return (
      <Button onClick={() => user.signOut()} variant="ghost" className="cursor-pointer flex flex-col justify-center items-center group hover:bg-red-600">
        <span className="icon-[material-symbols--logout] group-hover:text-white text-red-600 text-2xl"></span>
      </Button>
    );
  }

  const optionsMap = {
    ADMINISTRATIVE: [
      { icon: "icon-[lineicons--home]",               path: "/dashboard",                 label: "Inicio" },
      { icon: "icon-[mynaui--users-group-solid]",     path: "/dashboard/userManagment",   label: "Usuarios" },
      { icon: "icon-[carbon--certificate]",           path: "/dashboard/grades",          label: "Calificaciones" },
      { icon: "icon-[fluent--data-pie-32-regular]",   path: "/dashboard/data",            label: "Datos" },
      { icon: "icon-[material-symbols--schedule]",    path: "/dashboard/schedule",        label: "Horarios" },
      { icon: "icon-[feather--settings]",             path: "/dashboard/settings",        label: "Ajustes" },
    ],
    TEACHER: [
      { icon: "icon-[lineicons--home]",               path: "/dashboard",                 label: "Inicio" },
      { icon: "icon-[carbon--certificate]",           path: "/dashboard/grades",          label: "Calificaciones" },
      { icon: "icon-[fluent--data-pie-32-regular]",   path: "/dashboard/data",            label: "Datos" },
      { icon: "icon-[material-symbols--schedule]",    path: "/dashboard/schedule",        label: "Horarios" },
      { icon: "icon-[feather--settings]",             path: "/dashboard/settings",        label: "Ajustes" },
    ],
    STUDENT: [
      { icon: "icon-[lineicons--home]",               path: "/dashboard",                 label: "Inicio" },
      { icon: "icon-[carbon--certificate]",           path: "/dashboard/my-profile",      label: "Mi perfil" },
      { icon: "icon-[material-symbols--schedule]",    path: "/dashboard/schedule",        label: "Horarios" },
      { icon: "icon-[feather--settings]",             path: "/dashboard/settings",        label: "Ajustes" },
    ],
  };

  const safeRole = typeof userRole === "string" ? userRole : "";
  const currentOptions = optionsMap[safeRole] || [];

  const isActive = (itemPath) => {
    if (itemPath === '/dashboard') return pathname === '/dashboard';
    return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
  };

  return (
    <div className="bg-white text-blue-950 h-full flex flex-col">
      <div className="h-1/4 w-full flex justify-center items-center">
        <h1 className="text-2xl font-semibold tracking-wide">DUCTU</h1>
      </div>

      <nav className="h-2/4 w-full my-2">
        <ul className="h-full flex flex-col justify-around">
          {currentOptions.length > 0 ? (
            currentOptions.map((item) => (
              <li
                key={item.path}
                className={`${isActive(item.path) ? "bg-blue-950 text-white" : "text-gray-500"} cursor-pointer h-full flex items-center hover:bg-blue-900 group transition-all duration-300`}
              >
                <Link href={item.path} className="flex flex-col items-center w-full group-hover:text-white">
                  <span className={`${item.icon} text-3xl`}></span>
                  <span className="text-xs text-center">{item.label}</span>
                </Link>
              </li>
            ))
          ) : (
            <li className="text-gray-400 p-2">No hay opciones disponibles.</li>
          )}
        </ul>
      </nav>

      <div className="h-1/4 flex flex-col justify-around items-center">
        <Avatar className="w-1/2 h-auto border-2 border-blue-500">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <SignOutButton />
        <p className="text-sm text-muted-foreground">{userRole}</p>
      </div>
    </div>
  );
}