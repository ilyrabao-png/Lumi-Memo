/**
 * Resolves the FastAPI base URL for browser and server.
 * When the UI is opened via a LAN hostname but env still points to loopback,
 * browser fetch to 127.0.0.1 would hit the wrong machine — rewrite to same host:8000.
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "") ?? "";
  const fallback = "http://127.0.0.1:8000";

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    const isLoopbackHost = hostname === "localhost" || hostname === "127.0.0.1";
    if (!isLoopbackHost && fromEnv && /127\.0\.0\.1|localhost/.test(fromEnv)) {
      return `${protocol}//${hostname}:8000`;
    }
  }

  return fromEnv || fallback;
}
