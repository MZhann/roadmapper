import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { exchangeAuthCode } from "@/lib/auth";
import { errorMessage } from "@/lib/supabase";
import { replace } from "@/lib/navigation";
import { StateView } from "@/components/Primitives";
export default function AuthCallback() {
  const { code, error_description } = useLocalSearchParams<{
    code?: string;
    error_description?: string;
  }>();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    async function complete() {
      try {
        if (error_description) throw new Error(error_description);
        if (!code)
          throw new Error(
            "This link is incomplete or has expired. Request a new sign-in link.",
          );
        await exchangeAuthCode(code);
        if (active) replace("/");
      } catch (e) {
        if (active) setError(errorMessage(e));
      }
    }
    void complete();
    return () => {
      active = false;
    };
  }, [code, error_description]);
  return error ? (
    <StateView
      kind="error"
      title="Let's get a fresh link"
      message={error}
      action="Back to sign in"
      onAction={() => replace("/sign-in")}
    />
  ) : (
    <StateView
      kind="loading"
      title="Saving your place"
      message="Finishing your secure sign-in…"
    />
  );
}
