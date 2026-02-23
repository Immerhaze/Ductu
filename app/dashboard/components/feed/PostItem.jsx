'use client';

import React, { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from 'next/image';

// Helper to format the timestamp
const formatPostTimestamp = (dateLike) => {
  const date = new Date(dateLike);
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  return new Intl.DateTimeFormat('es-CL', options).format(date).replace(',', ' -');
};

// Map roles to Spanish labels (for display)
const ROLE_LABEL = {
  ADMINISTRATIVE: "Administración",
  TEACHER: "Profesor",
  STUDENT: "Estudiante",
};

// (TEMP) map targets to labels.
// - ALL: "Todos"
// - ROLE: role label
// - COURSE: you can replace `courseId` with course name once you include it in query
const targetToLabel = (t) => {
  if (!t) return "—";
  if (t.type === "ALL") return "Todos";
  if (t.type === "ROLE") return ROLE_LABEL[t.role] ?? String(t.role ?? "Rol");
  if (t.type === "COURSE") return "Curso"; // later: replace with course name
  return "—";
};

export default function PostItem({ post }) {
  // Normalize fields from DB shape -> UI shape
  const authorName = post?.author?.fullName || "Usuario";
  const authorRole = ROLE_LABEL[post?.author?.role] || String(post?.author?.role || "—");
  const timestamp = post?.createdAt;

  // If you later store avatar in AppUser, use post.author.avatarUrl here.
  const authorAvatar = post?.authorAvatar || "https://github.com/shadcn.png";

  const visibleGroups = useMemo(() => {
    const targets = Array.isArray(post?.targets) ? post.targets : [];
    if (targets.length === 0) return ["Todos"];
    return targets.map(targetToLabel);
  }, [post]);

  const displayGroups = visibleGroups.slice(0, 2);
  const remainingGroupsCount = visibleGroups.length - displayGroups.length;

  // Normalize attachment: DB uses mimeType, UI expects type
  const attachment = post?.attachment
    ? {
        url: post.attachment.url,
        name: post.attachment.name,
        type: post.attachment.mimeType, // <-- normalize here
      }
    : null;

  return (
    <div className="w-full max-w-5xl h-auto bg-white flex flex-col rounded-xl border-2 p-4 shadow-sm my-4">

      <div className="w-full min-h-16 max-h-24 flex flex-row items-center justify-between gap-4 pb-4 border-b border-gray-200 mb-4">
        <div className="flex flex-row items-center gap-4 flex-grow">
          <Avatar className="w-14 h-14 border-2 border-blue-500">
            <AvatarImage src={authorAvatar} />
            <AvatarFallback>{authorName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800">
              {authorName} / <span className="text-blue-500 font-semibold">{authorRole}</span>
            </h2>
            <h6 className="text-sm text-gray-500 mt-0.5">
              {timestamp ? formatPostTimestamp(timestamp) : ""}
            </h6>
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-row items-center space-x-1 text-gray-600 cursor-help">
                <span className="icon-[icomoon-free--eye] text-lg"></span>
                <ul className="flex flex-row flex-wrap gap-x-1 text-sm font-medium">
                  {displayGroups.map((group, index) => (
                    <li key={group + index}>{group}{index < displayGroups.length - 1 ? ',' : ''}</li>
                  ))}
                  {remainingGroupsCount > 0 && (
                    <li>{` +${remainingGroupsCount} más`}</li>
                  )}
                </ul>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white text-sm p-2 rounded-md shadow-lg max-w-xs">
              <p className="font-semibold mb-1">Visible para:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {visibleGroups.map((group, index) => (
                  <li key={`tooltip-${group}-${index}`}>{group}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <section className="mb-4">
        <p className="text-lg text-gray-800 break-words whitespace-pre-wrap">
          {post?.content}
        </p>
      </section>

      {attachment && (
        <section className="mt-2">
          {attachment.type?.startsWith('image/') ? (
            <div className="relative w-full rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={attachment.url}
                alt={attachment.name}
                width={600}
                height={400}
                sizes="(max-width: 768px) 100vw, 600px"
                className="w-full h-auto object-contain max-h-[400px]"
              />
              <p className="text-sm text-gray-600 mt-2 px-2 pb-2">{attachment.name}</p>
            </div>
          ) : (
            attachment.type === 'application/pdf' ||
            attachment.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            attachment.type === 'application/vnd.ms-excel'
          ) ? (
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer border border-gray-200"
            >
              {attachment.type === 'application/pdf' && (
                <span className="icon-[material-icon-theme--pdf] text-5xl text-red-500"></span>
              )}
              {(attachment.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                attachment.type === 'application/vnd.ms-excel') && (
                <span className="icon-[mdi--microsoft-excel] text-5xl text-green-600"></span>
              )}
              <div>
                <h4 className="font-semibold text-base text-gray-800">{attachment.name}</h4>
                <p className="text-sm text-gray-500">
                  {attachment.type === 'application/pdf' ? 'Documento PDF' : 'Archivo Excel'}
                </p>
              </div>
            </a>
          ) : (
            <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg border border-gray-200">
              <span className="icon-[tabler--file] text-2xl text-gray-500"></span>
              <h4 className="font-semibold text-base text-gray-800">{attachment.name}</h4>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
