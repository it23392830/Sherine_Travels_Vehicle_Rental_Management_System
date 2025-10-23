export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("sherine_auth_token");
}

import { API_BASE } from "./auth";

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit & { method?: HttpMethod } = {}
): Promise<T> {
  const baseUrl = API_BASE + '/api';
  let url: string;
  if (path.startsWith("http")) {
    url = path;
  } else {
    // Normalize the provided path:
    // - strip any protocol/host if mistakenly included
    // - remove a leading '/api' to avoid '/api/api'
    // - ensure it begins with a single '/'
    let cleaned = path.replace(/^https?:\/\/[^/]+/i, "");
    cleaned = cleaned.startsWith("/api/") ? cleaned.slice(4) : cleaned; // drop leading '/api'
    cleaned = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
    url = `${baseUrl}${cleaned}`;
  }

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

export function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL as string) || (process.env.NEXT_PUBLIC_API_URL as string) || "http://localhost:5152/api";
}


