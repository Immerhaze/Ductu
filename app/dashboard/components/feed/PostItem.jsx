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

export default function PostItem({ post }) {
  const authorName  = post?.author?.fullName || "Usuario";
  const authorRole  = ROLE_LABEL[post?.author?.role] || String(post?.author?.role || "—");
  const timestamp   = post?.createdAt;
  const authorAvatar = post?.authorAvatar || "https://github.com/shadcn.png";

  const visibleGroups = useMemo(() => {
    const targets = Array.isArray(post?.targets) ? post.targets : [];
    if (targets.length === 0) return ["Todos"];
    return targets.map(targetToLabel);
  }, [post]);

  const displayGroups      = visibleGroups.slice(0, 2);
  const remainingGroupsCount = visibleGroups.length - displayGroups.length;

  const attachment = post?.attachment ? {
    url: post.attachment.url,
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

        {/* Visibilidad */}
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
          {attachment.type?.startsWith('image/') ? (
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <Image src={attachment.url} alt={attachment.name} width={600} height={400} sizes="(max-width: 768px) 100vw, 600px" className="w-full h-auto object-contain max-h-[360px]" />
              <p className="text-xs text-gray-400 px-3 py-2">{attachment.name}</p>
            </div>
          ) : attachment.type === 'application/pdf' ? (
            <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors">
              <span className="icon-[material-icon-theme--pdf] text-3xl text-red-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">{attachment.name}</p>
                <p className="text-xs text-gray-400">Documento PDF</p>
              </div>
            </a>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
              <span className="icon-[tabler--file] text-2xl text-gray-400 shrink-0" />
              <p className="text-sm font-medium text-gray-700">{attachment.name}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}