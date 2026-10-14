import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import { Card, InlineError, StateView, layout } from "@/components/Primitives";
import { CompletionBadge } from "@/components/CompletionBadge";
import { Icon } from "@/components/Icon";
import { useGoal, useGoals } from "@/data/queries";
import { useAuth } from "@/providers/AuthProvider";
import { progressOf, statsOf } from "@/domain/progress";
import { goalPath, stepPath, replace, go } from "@/lib/navigation";
import { addStoryPhoto } from "@/lib/photos";
import { errorMessage } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radius, space } from "@/theme/tokens";
export default function StepComplete() {
  const { id, stepId, xp } = useLocalSearchParams<{
    id: string;
    stepId: string;
    xp?: string;
  }>();
  const query = useGoal(id);
  const goals = useGoals();
  const { session } = useAuth();
  const { colors } = useTheme();
  const queries = useQueryClient();
  const photo = useMutation({
    mutationFn: async () => {
      const added = await addStoryPhoto(session!.user.id, id, stepId);
      if (added) {
        await queries.invalidateQueries({ queryKey: ["notes"] });
        go("/journal");
      }
    },
  });
  if (query.isPending)
    return (
      <Screen>
        <StateView kind="loading" title="Gathering your progress…" />
      </Screen>
    );
  if (query.isError)
    return (
      <Screen>
        <StateView
          kind="error"
          title="Couldn’t load your progress"
          message={errorMessage(query.error)}
          action="Retry"
          onAction={() => void query.refetch()}
        />
      </Screen>
    );
  const goal = query.data;
  const progress = goal ? progressOf(goal) : null;
  const step = progress?.steps.find((s) => s.id === stepId);
  if (!step || step.status !== "done")
    return (
      <Screen>
        <StateView
          title="Your next step is waiting"
          message="Complete a lesson to see your progress here."
          action="Back to your path"
          onAction={() => replace(goalPath(id))}
        />
      </Screen>
    );
  const stats = statsOf(goals.data ?? [goal!]);
  const earned = xp === "0" ? 0 : step.xp;
  return (
    <Screen
      style={{ alignItems: "center", paddingTop: 120 }}
      footer={
        <>
          <InlineError
            message={photo.error ? errorMessage(photo.error) : null}
          />
          <PrimaryButton
            label={
              progress?.current ? "Continue learning" : "Back to your path"
            }
            onPress={() =>
              replace(
                progress?.current
                  ? stepPath(id, progress.current.id)
                  : goalPath(id),
              )
            }
          />
          <SecondaryButton
            icon="camera"
            label="Add a photo to your story"
            loading={photo.isPending}
            onPress={() => photo.mutate()}
          />
        </>
      }
    >
      <CompletionBadge />
      <Text
        variant="title"
        style={{
          marginTop: space.footer,
          marginBottom: space.sm,
          textAlign: "center",
        }}
      >
        Step {progress!.steps.indexOf(step) + 1} done
      </Text>
      <Text muted style={{ textAlign: "center" }}>
        {step.title}.{"\n"}That’s real progress.
      </Text>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          gap: space.m,
          marginTop: space.block,
        }}
      >
        {[
          [`+${earned}`, "XP earned", colors.accent],
          [stats.streak, "day streak", colors.streakText],
          [`${Math.round(progress!.ratio * 100)}%`, "of goal", colors.ink],
        ].map(([value, label, color]) => (
          <Card
            key={label}
            style={{
              flex: 1,
              paddingVertical: space.ml,
              paddingHorizontal: space.m,
              borderRadius: radius.option,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontFamily: fonts.black,
                color: String(color),
              }}
            >
              {value}
            </Text>
            <Text variant="tiny" muted>
              {label}
            </Text>
          </Card>
        ))}
      </View>
      {progress!.next ? (
        <Card
          style={[
            layout.row,
            {
              width: "100%",
              marginTop: space.lg,
              paddingVertical: space.ml,
              borderRadius: radius.option,
            },
          ]}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: radius.round,
              backgroundColor: colors.accentSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="star" size={18} color={colors.accent} />
          </View>
          <View style={layout.flex}>
            <Text variant="tiny" muted>
              Ready now · Keep going whenever you like
            </Text>
            <Text variant="bodySmall" style={{ fontFamily: fonts.extraBold }}>
              {progress!.next.title}
            </Text>
          </View>
        </Card>
      ) : (
        <Card style={{ width: "100%", marginTop: space.lg }}>
          <Text variant="card">Goal complete. Look how far you’ve come.</Text>
        </Card>
      )}
    </Screen>
  );
}
