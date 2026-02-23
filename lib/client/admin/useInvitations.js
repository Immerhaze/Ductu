"use client";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function useInvitations() {
  const swr = useSWR("/api/admin/invitations", fetcher, {
    revalidateOnFocus: false,
  });

  return {
    invitations: swr.data || [],
    isLoading: !swr.error && !swr.data,
    error: swr.error,
    mutateInvitations: swr.mutate,
  };
}
