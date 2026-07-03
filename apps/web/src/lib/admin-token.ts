const STORAGE_KEY = "minishop-admin-token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function setAdminToken(token: string): void {
  if (typeof window === "undefined") return;
  const nextToken = token.trim();
  if (!nextToken) {
    clearAdminToken();
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, nextToken);
}

export function clearAdminToken(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
