// app/dashboard/DashboardShell.jsx
"use client";

import SideBar from "@/components/sidebar";
import { AppUserProvider, useAppUser } from "@/components/providers/AppUserContext";

function ShellInner({ children }) {
  const { me, isLoading } = useAppUser();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-950 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="shrink-0 border-r border-gray-100 h-screen transition-all duration-300">
        <SideBar userRole={me?.role} />
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-50">
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