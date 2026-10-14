import { View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Mascot } from "@/components/Mascot";
import { Card, InlineError, StateView, layout } from "@/components/Primitives";
import { IconButton } from "@/components/Buttons";
import { OptionCard } from "@/components/OptionCard";
import { ProgressBar } from "@/components/ProgressBar";
import { useDraft } from "@/providers/DraftProvider";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radius, space } from "@/theme/tokens";
import { go } from "@/lib/navigation";
import { errorMessage } from "@/lib/supabase";
import { addDays, dateValue } from "@/domain/dateTime";
export default function RealityCheck() {
  const { draft, save } = useDraft();
  const reality = draft?.reality;
  const { colors } = useTheme();
  const choose = useMutation({
    mutationFn: async (recommended: boolean) => {
      if (!draft || !reality) return;
      await save({
        ...draft,
        days: recommended ? reality.recommended_days : reality.requested_days,
        targetDate: addDays(
          dateValue(new Date()),
          (recommended ? reality.recommended_days : reality.requested_days) - 1,
        ),
        acceptStretch: !recommended,
        plan: null,
        revision: draft.revision + 1,
      });
      go("/goal/new/generating");
    },
  });
  if (!reality)
    return (
      <Screen>
        <StateView
          title="Let’s check your goal first"
          message="A few details help Milo suggest a realistic pace."
          action="Answer questions"
          onAction={() => go("/goal/new/questions")}
        />
      </Screen>
    );
  return (
    <Screen
      footer={
        <Text variant="small" muted style={{ textAlign: "center" }}>
          Either way, we’ll build the best plan for the time you choose.
        </Text>
      }
    >
      <View
        style={[
          layout.row,
          { justifyContent: "space-between", marginLeft: -space.m },
        ]}
      >
        <IconButton
          name="back"
          label="Back to questions"
          onPress={() => go("/goal/new/questions")}
        />
        <Mascot size={56} mood="thinking" />
      </View>
      <View
        style={{
          alignSelf: "flex-end",
          maxWidth: "80%",
          marginTop: space.s,
          backgroundColor: colors.accent,
          borderRadius: radius.card,
          borderBottomRightRadius: space.sm,
          paddingVertical: space.md,
          paddingHorizontal: space.lg,
        }}
      >
        <Text style={{ color: colors.onAccent, fontFamily: fonts.bold }}>
          {draft!.prompt}
        </Text>
      </View>
      <Card
        style={{
          marginTop: space.xxl,
          borderRadius: radius.hero,
          padding: space.xxl,
          gap: space.ml,
        }}
      >
        <Text
          variant="eyebrow"
          style={{
            color: colors.streakText,
            backgroundColor: colors.streakBg,
            paddingVertical: space.micro,
            paddingHorizontal: space.m,
            alignSelf: "flex-start",
            borderRadius: radius.chip,
          }}
        >
          HONEST CHECK
        </Text>
        <Text style={{ fontSize: 20, lineHeight: 25, fontFamily: fonts.black }}>
          {reality.title}
        </Text>
        <Text variant="bodySmall" muted>
          {reality.explanation}
        </Text>
        <View style={{ gap: space.m, marginTop: space.xs }}>
          {[
            [reality.requested_days, "Focused", colors.warning],
            [reality.recommended_days, "More time", colors.accent],
          ].map(([days, label, color], index) => (
            <View key={index} style={[layout.row, { gap: space.m }]}>
              <Text variant="caption" style={{ width: 64 }}>
                {days} {days === 1 ? "day" : "days"}
              </Text>
              <View style={layout.flex}>
                <ProgressBar
                  value={
                    index
                      ? 1
                      : Math.min(
                          1,
                          reality.requested_days / reality.recommended_days,
                        )
                  }
                  height={10}
                  color={String(color)}
                />
              </View>
              <Text
                variant="small"
                style={{ width: 60, textAlign: "right", color: String(color) }}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
      </Card>
      <Text
        variant="card"
        style={{ marginTop: space.page, marginBottom: space.md }}
      >
        How would you like to go?
      </Text>
      <View style={{ gap: space.m, opacity: choose.isPending ? 0.55 : 1 }}>
        <OptionCard
          radio={false}
          selected
          title={`Make it ${reality.recommended_days} days`}
          description="Suggested target · Continue at your own pace"
          onPress={() => {
            if (!choose.isPending) choose.mutate(true);
          }}
        />
        <OptionCard
          radio={false}
          selected={false}
          title={`Keep ${reality.requested_days} ${reality.requested_days === 1 ? "day" : "days"} — focused start`}
          description={reality.achievable_scope}
          onPress={() => {
            if (!choose.isPending) choose.mutate(false);
          }}
        />
      </View>
      <InlineError message={choose.error ? errorMessage(choose.error) : null} />
    </Screen>
  );
}
