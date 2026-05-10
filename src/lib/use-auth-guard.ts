import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSession } from "./use-session";

export function useAuthGuard() {
  const nav = useNavigate();
  const session = useSession();
  useEffect(() => {
    if (!session.loading && !session.user) {
      nav({ to: "/login" });
    }
  }, [session.loading, session.user, nav]);
  return session;
}
