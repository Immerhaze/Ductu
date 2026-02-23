"use client";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function useUsers({ initialUsers = [] } = {}) {
  const swr = useSWR("/api/admin/users", fetcher, {
    fallbackData: initialUsers,
    revalidateOnFocus: false,
  });

  return {
    users: swr.data || [],
    isLoading: !swr.error && !swr.data,
    error: swr.error,
    mutateUsers: swr.mutate,
  };
}
