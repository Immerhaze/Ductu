// components/NotificationBell.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const TYPE_CONFIG = {
  NEW_POST:   { icon: "📢", label: "Publicación" },
  NEW_GRADE:  { icon: "📝", label: "Nota" },
  NEW_EVENT:  { icon: "📅", label: "Evento" },
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "ahora";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function NotificationBell({ collapsed = false }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [open, setOpen]                   = useState(false);
  const [loading, setLoading]             = useState(false);
  const panelRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Poll cada 30 segundos
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications/read", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleClickNotification = async (notification) => {
    if (!notification.isRead) {
      await fetch(`/api/notifications/${notification.id}/read`, { method: "POST" });
      setNotifications((prev) => prev.map((n) => n.id === notification.id ? { ...n, isRead: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setOpen(false);
    if (notification.link) router.push(notification.link);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Botón campanita */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative flex flex-col items-center w-full transition-colors rounded-xl px-3 py-2.5 ${
          open ? "bg-blue-950 text-white" : "text-gray-500 hover:bg-blue-50 hover:text-blue-950"
        }`}
        title="Notificaciones"
      >
        <div className="relative">
          <span className="icon-[material-symbols--notifications-outline] text-2xl" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
        {!collapsed && <span className="text-xs mt-0.5">Avisos</span>}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute left-full bottom-0 ml-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">Notificaciones</p>
              {unreadCount > 0 && (
                <span className="text-xs font-medium bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Marcar todas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-sm text-gray-500">Sin notificaciones</p>
              </div>
            ) : notifications.map((n) => {
              const config = TYPE_CONFIG[n.type] ?? { icon: "🔔", label: "Aviso" };
              return (
                <button
                  key={n.id}
                  onClick={() => handleClickNotification(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors text-left ${
                    !n.isRead ? "bg-blue-50/50" : ""
                  }`}
                >
                  <span className="text-lg shrink-0 mt-0.5">{config.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-semibold truncate ${!n.isRead ? "text-gray-900" : "text-gray-600"}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(n.createdAt)}</span>
                    </div>
                    {n.body && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                    <span className="text-[10px] font-medium text-blue-500 mt-1 inline-block">{config.label}</span>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}