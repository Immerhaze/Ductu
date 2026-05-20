import { notFound } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import ProductAdminClient from "./components/ProductAdminClient";

export const metadata = { title: "DUCTU Admin" };

export default async function ProductAdminPage() {
  // Redirects to sign-in if not authenticated
  const user = await stackServerApp.getUser({ or: "redirect" });

  const adminEmail = process.env.PRODUCT_ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = user.primaryEmail?.trim().toLowerCase();

  if (!adminEmail || !userEmail || userEmail !== adminEmail) {
    notFound();
  }

  return <ProductAdminClient />;
}
