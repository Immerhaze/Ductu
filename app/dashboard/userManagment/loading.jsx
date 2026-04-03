// app/dashboard/userManagment/loading.jsx
import UsersTable from "./components/UserManagementTable";

export default function Loading() {
  return (
    <div className="w-full flex flex-col p-6 pb-12 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-lg mb-5" />
        <div className="flex gap-3">
          <div className="h-9 w-32 bg-gray-200 animate-pulse rounded-lg" />
          <div className="h-9 w-32 bg-gray-200 animate-pulse rounded-lg" />
          <div className="h-9 w-32 bg-gray-200 animate-pulse rounded-lg" />
          <div className="h-9 w-48 bg-gray-200 animate-pulse rounded-lg" />
        </div>
      </div>
      <UsersTable users={[]} loading={true} />
      <div className="mt-8 h-48 w-full rounded-2xl bg-white border border-gray-200 animate-pulse" />
    </div>
  );
}