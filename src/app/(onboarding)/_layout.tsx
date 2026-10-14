import { Slot } from "expo-router";
import { AuthGate } from "@/components/AuthGate";
export default function OnboardingLayout() {
  return (
    <AuthGate onboarding>
      <Slot />
    </AuthGate>
  );
}
