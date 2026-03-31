"use client";
import React, { createContext, useContext } from "react";
import { useMe } from "@/lib/me";

const AppUserContext = createContext(null);

export function AppUserProvider({ children }) {
  const { me, isLoading, error, mutateMe } = useMe();

  return (
    <AppUserContext.Provider value={{ me, isLoading, error, mutateMe }}>
      {children}
    </AppUserContext.Provider>
  );
}

export function useAppUser() {
  const ctx = useContext(AppUserContext);
  if (!ctx) throw new Error("useAppUser must be used within AppUserProvider");
  return ctx;
}
