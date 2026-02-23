"use client";

import SideBar from "@/components/sidebar";
import { AppUserProvider, useAppUser } from "../auth/AppUserContext";

function ShellInner({ children }) {
  const { me, isLoading } = useAppUser();

  // Loading global del dashboard (simple y seguro)
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Cargando...
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <aside className="w-1/12 border-2 rounded-tr-lg rounded-br-lg shadow-md h-screen">
        <SideBar userRole={me?.role} />
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default function DashboardShell({ children }) {
  return (
    <AppUserProvider>
      <ShellInner>{children}</ShellInner>
    </AppUserProvider>
  );
}
