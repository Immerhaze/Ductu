"use client";

import React, { useEffect, useState } from "react";
import CreatePostForm from "./CreatePostForm";
import PostItem from "./PostItem";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createPostAction, getFeedAction } from "./actions/posts";
import { useAppUser } from "@/app/auth/AppUserContext";

export default function FeedContainer() {
  const { me, isLoading: meLoading, error: meError } = useAppUser();

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
    return () => {
      mounted = false;
    };
  }, []);

  const handlePublish = async ({ content, targets, attachment }) => {
    const created = await createPostAction({ content, targets, attachment });
    setPosts((prev) => [created, ...prev]);
  };

  const displayName = me?.fullName || me?.email || "Usuario";

  return (
    <section className="flex-grow flex flex-col items-center overflow-y-auto p-4 bg-gray-50">
      <h1 className="text-4xl my-5 text-gray-800">
        {meLoading ? (
          "Cargando..."
        ) : meError ? (
          "Bienvenido"
        ) : (
          <>
            Bienvenido, <span className="text-blue-500">{displayName}</span>
          </>
        )}
      </h1>

      <div className="w-full max-w-5xl mb-8">
        <CreatePostForm onPublish={handlePublish} />
      </div>

      <div className="w-full max-w-5xl flex flex-col space-y-6">
        <TooltipProvider>
          {loading ? (
            <p className="text-gray-500">Cargando...</p>
          ) : posts.length > 0 ? (
            posts.map((post) => <PostItem key={post.id} post={post} />)
          ) : (
            <p className="text-gray-500 text-lg mt-10 text-center">
              No hay publicaciones para mostrar.
            </p>
          )}
        </TooltipProvider>
      </div>
    </section>
  );
}
