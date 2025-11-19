export function getApiBase(): string {
  const meta = import.meta as unknown as { env?: Record<string, unknown> };
  const fromEnv = meta?.env?.VITE_API_BASE as string | undefined;
  if (fromEnv && typeof fromEnv === "string" && fromEnv.trim() !== "") {
    return fromEnv.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
}

export function toAbsoluteImageUrl(input?: string | null): string {
  const src = (input || "").toString().trim();
  if (!src) return "";
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:")
  ) {
    return src;
  }
  const base = getApiBase();
  if (!base) return src;
  return src.startsWith("/") ? `${base}${src}` : `${base}/${src}`;
}
