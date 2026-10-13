import { getAuthToken } from "../auth";

export function apiBase(): string {
  const w = window as unknown as { __API_BASE__?: string };
  return (w.__API_BASE__ ?? "").replace(/\/+$/, "");
}

export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const isAbsolute = /^https?:\/\//.test(path);
  const rel = path.startsWith("/") ? path : "/" + path;
  const url = isAbsolute ? path : apiBase() + rel;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(getAuthToken() ? { Authorization: "Bearer " + getAuthToken() } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error("HTTP " + res.status + " " + res.statusText);
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}
