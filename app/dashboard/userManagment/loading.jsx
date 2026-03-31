import UsersTable from "./components/UserManagementTable";

export default function Loading() {
  return (
    <div className="h-screen w-full flex flex-col p-6 bg-[#F9FAFB]">
      <div className="mb-6 h-12 w-full rounded-xl bg-white border animate-pulse" />
      <UsersTable users={[]} loading={true} />
      <div className="mt-10 h-48 w-full rounded-xl bg-white border animate-pulse" />
    </div>
  );
}
