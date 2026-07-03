import { clearAdminToken, getAdminToken, setAdminToken } from "@/lib/admin-token";
import { useCallback, useEffect, useState } from "react";

export function useAdminToken() {
  const [token, setTokenState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setTokenState(getAdminToken());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
  }, [refresh]);

  const save = useCallback(
    (value: string) => {
      setAdminToken(value);
      refresh();
    },
    [refresh],
  );

  const clear = useCallback(() => {
    clearAdminToken();
    setTokenState(null);
  }, []);

  return { token, ready, save, clear, refresh };
}