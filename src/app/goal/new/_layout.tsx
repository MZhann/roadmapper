import { Slot } from "expo-router";
import { AuthGate } from "@/components/AuthGate";
import { DraftGate } from "@/components/DraftGate";
export default function NewGoalLayout() {
  return (
    <AuthGate>
      <DraftGate>
        <Slot />
      </DraftGate>
    </AuthGate>
  );
}
