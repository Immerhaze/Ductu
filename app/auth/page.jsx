// app/auth/page.jsx
import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import AuthClient from "./components/AuthClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// app/auth/page.jsx
export default async function AuthPage({ searchParams }) {
  const user = await stackServerApp.getUser({ or: "return-null" });
  if (user) redirect("/api/auth/post-auth");

  const sp = await searchParams;
  const mode = Array.isArray(sp?.mode) ? sp.mode[0] : sp?.mode;

  // "login" → isLoginDefault: true | "register" → false | default: true
  const isLoginDefault = mode !== "register";

  return <AuthClient isLoginDefault={isLoginDefault} />;
}