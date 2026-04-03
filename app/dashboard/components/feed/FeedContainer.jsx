// app/dashboard/components/feed/FeedContainer.jsx
"use client";

import React, { useEffect, useState } from "react";
import CreatePostForm from "./CreatePostForm";
import PostItem from "./PostItem";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createPostAction, getFeedAction } from "@/lib/server/actions/posts";
import { useAppUser } from "@/components/providers/AppUserContext";

export default function FeedContainer() {
  const { me, isLoading: meLoading } = useAppUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getFeedAction({ take: 30 });
        if (mounted) setPosts(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handlePublish = async ({ content, targets, attachment }) => {
    const created = await createPostAction({ content, targets, attachment });
    setPosts((prev) => [created, ...prev]);
  };

  return (
    <section className="flex-1 flex flex-col items-center overflow-y-auto px-6 py-8 bg-gray-50">
      <div className="w-full max-w-3xl">

        {/* Header del feed */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Novedades</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Publicaciones y avisos recientes de tu institución.
          </p>
        </div>

        {/* Form de publicación — solo teachers y admins */}
        {!meLoading && me?.role !== "STUDENT" && (
          <div className="mb-6">
            <CreatePostForm onPublish={handlePublish} currentUser={me} />
          </div>
        )}

        {/* Posts */}
        <div className="flex flex-col gap-4">
          <TooltipProvider>
            {loading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div className="space-y-1.5">
                        <div className="h-3 w-32 bg-gray-200 rounded" />
                        <div className="h-2.5 w-20 bg-gray-100 rounded" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-gray-100 rounded" />
                      <div className="h-3 w-3/4 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => <PostItem key={post.id} post={post} />)
            ) : (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm font-semibold text-gray-700">Sin publicaciones</p>
                <p className="text-xs text-gray-400 mt-1">
                  Las novedades de tu institución aparecerán aquí.
                </p>
              </div>
            )}
          </TooltipProvider>
        </div>
      </div>
    </section>
  );
}