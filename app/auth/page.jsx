// app/auth/page.jsx
import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import AuthClient from "./components/AuthClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AuthPage({ searchParams }) {
  // Si ya está logueado, NO lo dejes en auth (evita loops)
  const user = await stackServerApp.getUser({ or: "return-null" });
  if (user) redirect("/post-auth");

  const sp = await searchParams;
  const raw = Array.isArray(sp?.login) ? sp.login[0] : sp?.login;
  const isLoginDefault = String(raw ?? "true") === "true";

  return <AuthClient isLoginDefault={isLoginDefault} />;
}
