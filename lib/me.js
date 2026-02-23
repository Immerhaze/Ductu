import useSWR from "swr";

async function fetcher(url) {
  const res = await fetch(url, { credentials: "include" });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data?.code || "ME_FETCH_FAILED");
    err.code = data?.code || "ME_FETCH_FAILED";
    throw err;
  }

  return data;
}

/**
 * Cache key: "/api/me"
 * - Se pide una sola vez y se cachea
 * - SWR lo comparte entre componentes
 */
export function useMe() {
  const swr = useSWR("/api/me", fetcher, {
    revalidateOnFocus: false,  // evita refetch por cambiar de pestaña
    dedupingInterval: 30_000,  // 30s: si 2 componentes piden, no duplica request
  });

  return {
    me: swr.data,
    isLoading: !swr.error && !swr.data,
    error: swr.error,
    mutateMe: swr.mutate,
  };
}
