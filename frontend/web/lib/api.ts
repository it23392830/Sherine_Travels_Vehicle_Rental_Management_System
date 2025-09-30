export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("sherine_auth_token");
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit & { method?: HttpMethod } = {}
): Promise<T> {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL as string) || "/api";
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}), 
  };

  const token = getAuthToken();
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, { ...options, headers });
    const isJson = res.headers.get("content-type")?.includes("application/json");
    const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

    if (!res.ok) {
      const message = (body && (body.message || body.error)) || body || res.statusText || "Request failed";
      const error = new Error(typeof message === "string" ? message : JSON.stringify(message));
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      error.status = res.status;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      error.url = url;
      throw error;
    }

    return (body as T) ?? (undefined as unknown as T);
  } catch (err: any) {
    // Log detailed network error for debugging
    // eslint-disable-next-line no-console
    console.error("apiFetch raw error:", err)
    // eslint-disable-next-line no-console
    console.error("apiFetch error:", {
      path,
      message: err?.message,
      stack: err?.stack,
      status: err?.status,
      url: err?.url,
      online: typeof navigator !== "undefined" ? navigator.onLine : undefined,
    });
    throw err;
  }
}

export const fetcher = (url: string) => apiFetch(url);


