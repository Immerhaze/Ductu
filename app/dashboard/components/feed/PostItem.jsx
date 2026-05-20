// app/dashboard/components/feed/PostItem.jsx
'use client';

import React, { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from 'next/image';

const formatPostTimestamp = (dateLike) => {
  const date = new Date(dateLike);
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(date).replace(',', ' ·');
};

const ROLE_LABEL = {
  ADMINISTRATIVE: "Administración",
  TEACHER: "Profesor",
  STUDENT: "Estudiante",
};

const targetToLabel = (t) => {
  if (!t) return "—";
  if (t.type === "ALL") return "Todos";
  if (t.type === "ROLE") return ROLE_LABEL[t.role] ?? String(t.role ?? "Rol");
  if (t.type === "COURSE") return t.course?.name ?? "Curso";
  return "—";
};

const FILE_CONFIG = {
  "application/pdf": {
    label: "Documento PDF",
    icon: "icon-[material-icon-theme--pdf]",
    color: "bg-red-50 border-red-100 hover:bg-red-100",
    iconColor: "text-red-500",
  },
  "application/msword": {
    label: "Documento Word",
    icon: "icon-[mdi--microsoft-word]",
    color: "bg-blue-50 border-blue-100 hover:bg-blue-100",
    iconColor: "text-blue-600",
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    label: "Documento Word",
    icon: "icon-[mdi--microsoft-word]",
    color: "bg-blue-50 border-blue-100 hover:bg-blue-100",
    iconColor: "text-blue-600",
  },
  "application/vnd.ms-excel": {
    label: "Hoja de cálculo Excel",
    icon: "icon-[mdi--microsoft-excel]",
    color: "bg-green-50 border-green-100 hover:bg-green-100",
    iconColor: "text-green-600",
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    label: "Hoja de cálculo Excel",
    icon: "icon-[mdi--microsoft-excel]",
    color: "bg-green-50 border-green-100 hover:bg-green-100",
    iconColor: "text-green-600",
  },
  "application/vnd.ms-powerpoint": {
    label: "Presentación PowerPoint",
    icon: "icon-[mdi--microsoft-powerpoint]",
    color: "bg-orange-50 border-orange-100 hover:bg-orange-100",
    iconColor: "text-orange-500",
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    label: "Presentación PowerPoint",
    icon: "icon-[mdi--microsoft-powerpoint]",
    color: "bg-orange-50 border-orange-100 hover:bg-orange-100",
    iconColor: "text-orange-500",
  },
};

function downloadUrl(url, name) {
  return `/api/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`;
}

function FileAttachment({ attachment }) {
  const config = FILE_CONFIG[attachment.type];
  const dlUrl  = downloadUrl(attachment.url, attachment.name);

  if (attachment.type?.startsWith("image/")) {
    return (
      <div className="rounded-xl overflow-hidden border border-gray-100">
        <Image
          src={attachment.url}
          alt={attachment.name}
          width={600}
          height={400}
          sizes="(max-width: 768px) 100vw, 600px"
          className="w-full h-auto object-contain max-h-[360px]"
        />
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
          <p className="text-xs text-gray-500 truncate">{attachment.name}</p>

          <a  href={dlUrl}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium ml-3 shrink-0 flex items-center gap-1"
          >
            <span className="icon-[lucide--download] text-sm" />
            Descargar
          </a>
        </div>
      </div>
    );
  }

  if (config) {
    return (

      <a  href={dlUrl}
        className={`flex items-center gap-3 p-4 border rounded-xl transition-colors cursor-pointer ${config.color}`}
      >
        <span className={`${config.icon} text-3xl shrink-0 ${config.iconColor}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{attachment.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{config.label}</p>
        </div>
        <span className="icon-[lucide--download] text-gray-400 text-base shrink-0" />
      </a>
    );
  }

  return (
    <a  href={dlUrl}
      className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
    >
      <span className="icon-[tabler--file] text-2xl text-gray-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">{attachment.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">Archivo adjunto</p>
      </div>
      <span className="icon-[lucide--download] text-gray-400 text-base shrink-0" />
    </a>
  );
}

export default function PostItem({ post }) {
  const authorName   = post?.author?.fullName || "Usuario";
  const authorRole   = ROLE_LABEL[post?.author?.role] || String(post?.author?.role || "—");
  const timestamp    = post?.createdAt;
  const authorAvatar = post?.authorAvatar || "https://github.com/shadcn.png";

  const visibleGroups = useMemo(() => {
    const targets = Array.isArray(post?.targets) ? post.targets : [];
    if (targets.length === 0) return ["Todos"];
    return targets.map(targetToLabel);
  }, [post]);

  const displayGroups        = visibleGroups.slice(0, 2);
  const remainingGroupsCount = visibleGroups.length - displayGroups.length;

  const attachment = post?.attachment ? {
    url:  post.attachment.url,
    name: post.attachment.name,
    type: post.attachment.mimeType,
  } : null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-blue-100 shrink-0">
            <AvatarImage src={authorAvatar} />
            <AvatarFallback>{authorName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {authorName} <span className="text-blue-500 font-medium">· {authorRole}</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {timestamp ? formatPostTimestamp(timestamp) : ""}
            </p>
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 cursor-help shrink-0">
                <span className="icon-[icomoon-free--eye] text-sm" />
                <span>
                  {displayGroups.join(", ")}
                  {remainingGroupsCount > 0 && ` +${remainingGroupsCount}`}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 text-white text-xs p-2 rounded-lg max-w-xs">
              <p className="font-semibold mb-1">Visible para:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {visibleGroups.map((group, i) => (
                  <li key={`${group}-${i}`}>{group}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Contenido */}
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
        {post?.content}
      </p>

      {/* Adjunto */}
      {attachment && (
        <div className="mt-4">
          <FileAttachment attachment={attachment} />
        </div>
      )}
    </div>
  );
}