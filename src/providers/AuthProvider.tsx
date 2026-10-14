import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { AppState, Platform } from "react-native";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { errorMessage, supabase } from "@/lib/supabase";
type AuthState = {
  session: Session | null;
  loading: boolean;
  error: string | null;
};
const Context = createContext<AuthState>({
  session: null,
  loading: true,
  error: null,
});
export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({
    session: null,
    loading: true,
    error: null,
  });
  const queries = useQueryClient();
  const userId = useRef<string | null>(null);
  useEffect(() => {
    if (!supabase) {
      queueMicrotask(() =>
        setState({ session: null, loading: false, error: null }),
      );
      return;
    }
    let alive = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive) return;
      const nextUserId = session?.user.id ?? null;
      // Supabase can emit SIGNED_IN again on tab focus. Keep active plans cached
      // unless the account identity changed or explicitly signed out.
      if (userId.current !== nextUserId || event === "SIGNED_OUT")
        queries.clear();
      userId.current = nextUserId;
      setState({ session, loading: false, error: null });
    });
    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (alive)
          setState({
            session: data.session,
            loading: false,
            error: error ? errorMessage(error) : null,
          });
      })
      .catch((error) => {
        if (alive)
          setState({
            session: null,
            loading: false,
            error: errorMessage(error),
          });
      });
    const listener = AppState.addEventListener("change", (next) => {
      if (Platform.OS !== "web") {
        if (next === "active") supabase!.auth.startAutoRefresh();
        else supabase!.auth.stopAutoRefresh();
      }
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
      listener.remove();
    };
  }, [queries]);
  return <Context.Provider value={state}>{children}</Context.Provider>;
}
export const useAuth = () => useContext(Context);
