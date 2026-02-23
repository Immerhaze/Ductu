// app/403/page.jsx
export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border rounded-xl p-6">
        <h1 className="text-xl font-semibold">Acceso denegado</h1>
        <p className="mt-2 text-gray-600">
          No tienes permisos para ver esta sección.
        </p>
      </div>
    </div>
  );
}
