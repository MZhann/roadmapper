import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { IconButton, PrimaryButton } from "@/components/Buttons";
import { ProgressBar } from "@/components/ProgressBar";
import { Input, InlineError, StateView, layout } from "@/components/Primitives";
import { LessonBlocks, requirementsMet } from "@/components/LessonBlocks";
import { HelpPanel } from "@/components/HelpPanel";
import { useGoal } from "@/data/queries";
import { useAuth } from "@/providers/AuthProvider";
import { useLessonDraft } from "@/hooks/useLessonDraft";
import { progressOf, stepState } from "@/domain/progress";
import { db, errorMessage } from "@/lib/supabase";
import { goalPath, replace } from "@/lib/navigation";
import { haptic } from "@/lib/haptics";
import { useTheme } from "@/theme/ThemeProvider";
import { space } from "@/theme/tokens";
export default function Lesson() {
  const { id, stepId } = useLocalSearchParams<{ id: string; stepId: string }>();
  const query = useGoal(id);
  const { session } = useAuth();
  const draft = useLessonDraft(session?.user.id ?? "", stepId);
  const [showHelp, setShowHelp] = useState(false);
  const { colors } = useTheme();
  const queries = useQueryClient();
  const complete = useMutation({
    mutationFn: async () => {
      const { data, error } = await db().rpc("milo_complete_step", {
        p_step: stepId,
        p_note: draft.value.note,
      });
      if (error) throw error;
      await Promise.all([
        queries.invalidateQueries({ queryKey: ["goal", id] }),
        queries.invalidateQueries({ queryKey: ["goals"] }),
        queries.invalidateQueries({ queryKey: ["notes"] }),
      ]);
      await draft.clear();
      haptic("success");
      replace(`/goal/${id}/step/${stepId}/done?xp=${data.xp}`);
    },
  });
  if (query.isPending || draft.loading)
    return (
      <Screen>
        <StateView kind="loading" title="Opening your lesson…" />
      </Screen>
    );
  if (query.isError)
    return (
      <Screen>
        <StateView
          kind="error"
          title="Couldn’t load this lesson"
          message={errorMessage(query.error)}
          action="Retry"
          onAction={() => void query.refetch()}
        />
      </Screen>
    );
  const goal = query.data;
  const progress = goal ? progressOf(goal) : null;
  const step = progress?.steps.find((s) => s.id === stepId);
  const unit = goal?.units.find((u) => u.id === step?.unit_id);
  if (!goal || !step || !unit)
    return (
      <Screen>
        <StateView
          title="This lesson isn’t here"
          action="Back to your path"
          onAction={() => replace(goalPath(id))}
        />
      </Screen>
    );
  if (stepState(step, progress!.steps) === "locked")
    return (
      <Screen>
        <StateView
          title="One step at a time"
          message={`Finish earlier steps first. This lesson is scheduled for ${step.unlock_date ?? "later"}.`}
          action="Back to your path"
          onAction={() => replace(goalPath(id))}
        />
      </Screen>
    );
  const done = step.status === "done";
  const ready = requirementsMet(step.content, draft.value);
  const number = progress!.steps.indexOf(step) + 1;
  const footer = (
    <>
      <InlineError
        message={complete.error ? errorMessage(complete.error) : draft.error}
      />
      {!ready && !done && (
        <Text variant="small" muted>
          Finish the practice checks to complete this step.
        </Text>
      )}
      <View style={[layout.row, { alignItems: "center", gap: space.m }]}>
        <IconButton
          name="help"
          label="Ask AI about this step"
          border
          onPress={() => setShowHelp(!showHelp)}
        />
        <PrimaryButton
          style={layout.flex}
          label={done ? "Back to your path" : "I did it — complete step"}
          disabled={!done && !ready}
          loading={complete.isPending}
          onPress={() => (done ? replace(goalPath(id)) : complete.mutate())}
        />
      </View>
    </>
  );
  return (
    <Screen
      style={{ paddingHorizontal: space.xxl }}
      footerStyle={{
        paddingHorizontal: space.xxl,
        borderTopWidth: 1,
        borderColor: colors.line,
      }}
      footer={footer}
    >
      <View
        style={[layout.row, { marginLeft: -space.m, marginBottom: space.xl }]}
      >
        <IconButton
          name="close"
          label="Close step"
          onPress={() => replace(goalPath(id))}
        />
        <View style={layout.flex}>
          <ProgressBar
            value={done ? 1 : ready ? 0.75 : 0.25}
            segments={4}
            height={8}
            label="Lesson practice progress"
          />
        </View>
        <Text variant="small" muted>
          ~{step.minutes} min
        </Text>
      </View>
      {showHelp ? (
        <HelpPanel stepId={stepId} onClose={() => setShowHelp(false)} />
      ) : (
        <>
          <Text variant="eyebrow" style={{ color: colors.accent }}>
            STEP {number} · {unit.title.toUpperCase()}
          </Text>
          <Text
            variant="lesson"
            style={{ marginTop: space.xs, marginBottom: space.lg }}
          >
            {step.title}
          </Text>
          <LessonBlocks
            blocks={step.content}
            value={draft.value}
            onChange={(next) => void draft.update(next)}
            readOnly={done}
          />
          {!done && (
            <View style={{ gap: space.sm, marginTop: space.lg }}>
              <Text variant="caption">
                Note for your story{" "}
                <Text variant="caption" muted>
                  · optional
                </Text>
              </Text>
              <Input
                accessibilityLabel="Note for your story"
                multiline
                placeholder="What clicked? What was hard?"
                value={draft.value.note}
                onChangeText={(note) =>
                  void draft.update({ ...draft.value, note })
                }
                maxLength={10000}
                style={{ minHeight: 84 }}
              />
            </View>
          )}
        </>
      )}
    </Screen>
  );
}
