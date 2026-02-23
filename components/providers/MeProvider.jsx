"use client";

import React, { createContext, useContext } from "react";

const MeContext = createContext(null);

export function MeProvider({ me, children }) {
  return <MeContext.Provider value={me}>{children}</MeContext.Provider>;
}

export function useMe() {
  const me = useContext(MeContext);
  if (!me) throw new Error("useMe() debe usarse dentro de <MeProvider>");
  return me;
}
