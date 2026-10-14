import { type PropsWithChildren } from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { useProfile } from "@/data/queries";
import { Screen } from "./Screen";
import { StateView } from "./Primitives";
import { db, errorMessage } from "@/lib/supabase";
export function AuthGate({
  children,
  onboarding = false,
}: PropsWithChildren<{ onboarding?: boolean }>) {
  const auth = useAuth();
  const profile = useProfile(auth.session?.user.id);
  if (auth.loading || (auth.session && profile.isPending))
    return (
      <Screen>
        <StateView kind="loading" title="Finding your path…" />
      </Screen>
    );
  if (auth.error)
    return (
      <Screen>
        <StateView
          kind="error"
          title="Couldn’t restore your session"
          message={auth.error}
          action="Sign in again"
          onAction={() => void db().auth.signOut({ scope: "local" })}
        />
      </Screen>
    );
  if (!auth.session) return <Redirect href="/(auth)/welcome" />;
  if (profile.isError)
    return (
      <Screen>
        <StateView
          kind="error"
          title="Couldn’t load your profile"
          message={errorMessage(profile.error)}
          action="Retry"
          onAction={() => void profile.refetch()}
        />
      </Screen>
    );
  if (!onboarding && !profile.data?.onboarding_complete)
    return <Redirect href="/(onboarding)/intro" />;
  return children;
}
