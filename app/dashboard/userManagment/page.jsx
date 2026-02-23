import "server-only";
import UserManagementClient from "./userManagementClient";
import { getUsersForTable } from "./actions/getUsers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UserManagmentPage() {
  const initialUsers = await getUsersForTable();
  return <UserManagementClient initialUsers={initialUsers} />;
}
