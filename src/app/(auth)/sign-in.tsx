import { useEffect, useState } from "react";
import { Linking, View } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { signIn, sendEmailCode, verifyEmailCode } from "@/lib/auth";
import { errorMessage } from "@/lib/supabase";
import { back, replace } from "@/lib/navigation";
import { useTheme } from "@/theme/ThemeProvider";
import { space, type } from "@/theme/tokens";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { IconButton, PrimaryButton, TextButton } from "@/components/Buttons";
import { ProviderButton } from "@/components/ProviderButton";
import { InlineError, Input, layout } from "@/components/Primitives";

export default function SignIn() {
  const { colors } = useTheme();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const remaining = Math.max(0, Math.ceil((resendAt - now) / 1000));
  useEffect(() => {
    if (session) replace("/");
  }, [session]);
  useEffect(() => {
    if (!remaining) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [remaining]);
  const run = async (kind: "apple" | "google" | "email" | "verify") => {
    if (busy || (kind === "email" && Date.now() < resendAt)) return;
    setError(null);
    if (
      (kind === "email" || kind === "verify") &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      setError("Enter a valid email address.");
      return;
    }
    if (kind === "verify" && !/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setBusy(kind);
    try {
      if (kind === "email") {
        await sendEmailCode(email);
        setEmail(email.trim().toLowerCase());
        setCode("");
        setSent(true);
        setNow(Date.now());
        setResendAt(Date.now() + 60_000);
      } else if (kind === "verify") await verifyEmailCode(email, code);
      else await signIn(kind);
    } catch (e) {
      if (!(
        e &&
        typeof e === "object" &&
        "code" in e &&
        e.code === "ERR_REQUEST_CANCELED"
      )) {
        setError(
          kind === "verify" &&
            e &&
            typeof e === "object" &&
            "code" in e &&
            e.code === "otp_expired"
            ? "That code is incorrect or expired. Try again, or request a new code."
            : errorMessage(e),
        );
      }
    } finally {
      setBusy(null);
    }
  };
  const legal = async (kind: "terms" | "privacy") => {
    const url =
      kind === "terms"
        ? process.env.EXPO_PUBLIC_TERMS_URL
        : process.env.EXPO_PUBLIC_PRIVACY_URL;
    if (!url) {
      setError(
        `The ${kind === "terms" ? "Terms" : "Privacy Policy"} will be published before launch.`,
      );
      return;
    }
    try {
      await Linking.openURL(url);
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  return (
    <Screen
      footer={
        <Text variant="tiny" muted style={{ textAlign: "center" }}>
          By continuing you agree to the{" "}
          <Text
            variant="tiny"
            accessibilityRole="link"
            onPress={() => void legal("terms")}
            style={{ color: colors.accent }}
          >
            Terms
          </Text>{" "}
          and{" "}
          <Text
            variant="tiny"
            accessibilityRole="link"
            onPress={() => void legal("privacy")}
            style={{ color: colors.accent }}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      }
    >
      <View style={{ marginLeft: -space.m }}>
        <IconButton
          name="back"
          label={sent ? "Change email" : "Back"}
          onPress={() => {
            if (busy) return;
            if (sent) {
              setSent(false);
              setCode("");
              setError(null);
            } else back("/welcome");
          }}
        />
      </View>
      <Text
        variant="title"
        style={{ marginTop: space.page, marginBottom: space.s }}
      >
        {sent ? "Check your email" : "Save your progress"}
      </Text>
      <Text muted>
        {sent
          ? `Enter the 6-digit code we sent to ${email}.`
          : "Enter your email and we'll send a sign-in code. No password needed."}
      </Text>
      <View style={{ gap: space.md, marginTop: space.section }}>
        {sent ? (
          <>
            <Text variant="caption">Sign-in code</Text>
            <Input
              key="code"
              accessibilityLabel="Sign-in code"
              autoFocus
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              keyboardType="number-pad"
              inputMode="numeric"
              returnKeyType="done"
              autoCorrect={false}
              value={code}
              editable={!busy}
              maxLength={12}
              placeholder="000000"
              style={{
                ...type.titleSmall,
                textAlign: "center",
                letterSpacing: space.sm,
              }}
              onChangeText={(value) => {
                setCode(value.replace(/\D/g, "").slice(0, 6));
                setError(null);
              }}
              onSubmitEditing={() => void run("verify")}
            />
            <PrimaryButton
              label="Verify and continue"
              loading={busy === "verify"}
              disabled={!!busy || code.length !== 6}
              onPress={() => void run("verify")}
            />
            <Text variant="small" muted style={{ textAlign: "center" }}>
              You can paste the code or use your keyboard&apos;s autofill.
            </Text>
            <TextButton
              label={remaining ? `Resend code in ${remaining}s` : "Resend code"}
              muted
              onPress={() => {
                if (!remaining) void run("email");
              }}
            />
            <TextButton
              label="Use a different email"
              onPress={() => {
                if (!busy) {
                  setSent(false);
                  setCode("");
                  setError(null);
                }
              }}
            />
          </>
        ) : (
          <>
            <Text variant="caption">Email</Text>
            <Input
              key="email"
              accessibilityLabel="Email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              editable={!busy}
              onChangeText={setEmail}
              placeholder="you@example.com"
              onSubmitEditing={() => void run("email")}
            />
            <PrimaryButton
              label={remaining ? `Send code in ${remaining}s` : "Send code"}
              loading={busy === "email"}
              disabled={!!busy || remaining > 0}
              onPress={() => void run("email")}
            />
          </>
        )}
        <InlineError message={error} />
      </View>
      {!sent && (
        <>
          <View style={[layout.row, { marginVertical: space.section }]}>
            <View
              style={{ flex: 1, height: 1, backgroundColor: colors.line }}
            />
            <Text variant="caption" muted>
              or
            </Text>
            <View
              style={{ flex: 1, height: 1, backgroundColor: colors.line }}
            />
          </View>
          <View style={{ gap: space.md }}>
            <ProviderButton
              provider="apple"
              loading={busy === "apple"}
              disabled={!!busy}
              onPress={() => void run("apple")}
            />
            <ProviderButton
              provider="google"
              loading={busy === "google"}
              disabled={!!busy}
              onPress={() => void run("google")}
            />
          </View>
        </>
      )}
    </Screen>
  );
}
