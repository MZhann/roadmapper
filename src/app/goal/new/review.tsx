import { useState } from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { IconButton, PrimaryButton } from "@/components/Buttons";
import {
  Card,
  Chip,
  Input,
  InlineError,
  StateView,
  layout,
} from "@/components/Primitives";
import { MotifIcon } from "@/components/MotifIcon";
import { SendButton } from "@/components/SendButton";
import { PlanUnits } from "@/components/PlanUnits";
import { useDraft } from "@/providers/DraftProvider";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radius, size, space } from "@/theme/tokens";
import { DesktopCreate } from "@/components/DesktopCreate";
import { motifs } from "@/theme/motifs";
import { plan as revisePlan } from "@/lib/planner";
import { db, errorMessage } from "@/lib/supabase";
import { go, replace, goalPath } from "@/lib/navigation";
import { localDate } from "@/domain/progress";
export default function PlanReview() {
  const { width } = useWindowDimensions();
  const { draft, save } = useDraft();
  const plan = draft?.plan;
  const { colors } = useTheme();
  const queries = useQueryClient();
  const [adjustment, setAdjustment] = useState("");
  const revise = useMutation({
    mutationFn: async () => {
      const updated = await revisePlan(draft!, adjustment);
      await save({
        ...draft!,
        plan: updated,
        revision: draft!.revision + 1,
        history: [
          ...draft!.history,
          { request: adjustment, response: updated.summary },
        ].slice(-10),
      });
      setAdjustment("");
    },
  });
  const start = useMutation({
    mutationFn: async () => {
      const { data, error } = await db().rpc("milo_save_goal", {
        p_id: draft!.id,
        p_prompt: draft!.prompt,
        p_plan: plan,
        p_start: localDate(),
      });
      if (error) throw error;
      await queries.invalidateQueries({ queryKey: ["goals"] });
      await save(null);
      replace(goalPath(data));
    },
  });
  if (!plan)
    return (
      <Screen>
        <StateView
          title="Your plan is not ready yet"
          message="Build a plan from your answers, then review it here."
          action="Build my plan"
          onAction={() => go("/goal/new/generating")}
        />
      </Screen>
    );
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + plan.days - 1);
  const busy = revise.isPending || start.isPending;
  if (width >= size.desktop)
    return (
      <DesktopCreate
        draft={draft!}
        adjustment={adjustment}
        onChange={setAdjustment}
        onRevise={() => revise.mutate()}
        onStart={() => start.mutate()}
        revising={revise.isPending}
        saving={start.isPending}
        error={
          revise.error || start.error
            ? errorMessage(revise.error ?? start.error)
            : undefined
        }
      />
    );
  const footer = (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: space.s }}
      >
        {(plan.theme_id === "languages_learning"
          ? ["More food phrases", "Skip writing", "Easier start"]
          : ["More practice", "Easier start", "Add a final challenge"]
        ).map((label) => (
          <Chip
            key={label}
            label={label}
            onPress={() => {
              if (!busy) setAdjustment(label);
            }}
          />
        ))}
      </ScrollView>
      <View
        style={[
          layout.row,
          {
            gap: space.s,
            borderRadius: radius.control,
            backgroundColor: colors.inset,
            paddingRight: space.sm,
          },
        ]}
      >
        <Input
          accessibilityLabel="Ask for a change"
          placeholder="Ask for a change, e.g. “drop unit 4”"
          value={adjustment}
          onChangeText={setAdjustment}
          editable={!busy}
          maxLength={1000}
          style={{
            flex: 1,
            backgroundColor: colors.transparent,
            borderWidth: 0,
            fontSize: 15,
            paddingHorizontal: space.ml,
          }}
        />
        <SendButton
          disabled={!adjustment.trim() || busy}
          loading={revise.isPending}
          onPress={() => revise.mutate()}
        />
      </View>
      {revise.isPending && (
        <Text variant="small" muted accessibilityLiveRegion="polite">
          Reworking your plan. Your current draft is safe.
        </Text>
      )}
      <InlineError
        message={
          revise.error || start.error
            ? errorMessage(revise.error ?? start.error)
            : null
        }
      />
      <PrimaryButton
        label="Start this goal"
        loading={start.isPending}
        disabled={revise.isPending}
        onPress={() => start.mutate()}
      />
    </>
  );
  return (
    <Screen
      style={{ paddingHorizontal: space.xxl }}
      footerStyle={{
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderColor: colors.line,
        paddingHorizontal: space.xxl,
        gap: space.md,
      }}
      footer={footer}
    >
      <View style={layout.between}>
        <View style={{ marginLeft: -space.m }}>
          <IconButton
            name="back"
            label="Back to questions"
            onPress={() => go("/goal/new/questions")}
          />
        </View>
        <Text
          variant="eyebrow"
          style={{
            color: colors.accent,
            backgroundColor: colors.accentSoft,
            paddingVertical: space.sm,
            paddingHorizontal: space.m,
            borderRadius: radius.chip,
          }}
        >
          DRAFT PLAN
        </Text>
      </View>
      <View style={[layout.row, { gap: space.ml, marginTop: space.s }]}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: radius.card,
            backgroundColor: colors.accentSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MotifIcon theme={plan.theme_id} size={34} />
        </View>
        <View style={layout.flex}>
          <Text variant="heading">{plan.title}</Text>
          <Text variant="caption" muted style={{ marginTop: space.xs }}>
            {motifs[plan.theme_id].label}
          </Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          gap: space.s,
          marginTop: space.xl,
          marginBottom: space.xl,
        }}
      >
        {[
          [plan.units.flatMap((u) => u.steps).length, "steps"],
          [`${plan.daily_minutes} min`, "per day"],
          [
            deadline.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            }),
            "finish by",
          ],
        ].map(([value, label]) => (
          <Card
            key={label}
            style={{
              flex: 1,
              paddingVertical: space.m,
              paddingHorizontal: space.md,
              borderRadius: radius.control,
            }}
          >
            <Text style={{ fontSize: 18, fontFamily: fonts.black }}>
              {value}
            </Text>
            <Text variant="tiny" muted>
              {label}
            </Text>
          </Card>
        ))}
      </View>
      <PlanUnits plan={plan} />
      <Text variant="bodySmall" muted style={{ marginTop: space.lg }}>
        {plan.summary}
      </Text>
    </Screen>
  );
}
