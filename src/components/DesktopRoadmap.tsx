import { ScrollView, View } from "react-native";
import type { Goal } from "@/domain/schema";
import { progressOf, statsOf } from "@/domain/progress";
import { useNotes } from "@/data/queries";
import { useTheme } from "@/theme/ThemeProvider";
import { motifs } from "@/theme/motifs";
import { radius, space } from "@/theme/tokens";
import { go, stepPath } from "@/lib/navigation";
import { DesktopSidebar } from "./DesktopSidebar";
import { Text } from "./Text";
import { Card, MotifBox, Pill, layout } from "./Primitives";
import { MotifIcon } from "./MotifIcon";
import { ProgressBar } from "./ProgressBar";
import { RoadmapPath } from "./RoadmapPath";
import { PrimaryButton, TextButton } from "./Buttons";
import { AdjustPlan } from "./AdjustPlan";
export function DesktopRoadmap({
  goal,
  goals,
  preview = false,
}: {
  goal: Goal;
  goals: Goal[];
  preview?: boolean;
}) {
  const { colors } = useTheme();
  const progress = progressOf(goal);
  const stats = statsOf(goals);
  const notes = useNotes(!preview);
  const note = notes.data?.find((n) => n.steps?.units?.goal_id === goal.id);
  const currentUnit =
    goal.units.find((u) => u.steps.some((s) => s.id === progress.next?.id)) ??
    goal.units.at(-1)!;
  const units = [
    currentUnit,
    ...[...goal.units]
      .sort((a, b) => a.idx - b.idx)
      .filter((u) => u.id !== currentUnit.id),
  ];
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        backgroundColor: colors.background,
      }}
    >
      <DesktopSidebar goals={goals} selected={goal.id} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingVertical: space.block,
          paddingHorizontal: space.huge,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: space.block,
            alignItems: "flex-start",
          }}
        >
          <View
            style={{
              flexGrow: 999,
              flexBasis: 460,
              minWidth: 0,
              gap: space.xxl,
            }}
          >
            <View style={[layout.row, { gap: space.lg, flexWrap: "wrap" }]}>
              <MotifBox>
                <MotifIcon theme={goal.theme_id} />
              </MotifBox>
              <View style={{ flex: 1, minWidth: 200 }}>
                <Text variant="small" muted>
                  {motifs[goal.theme_id].label} · finish by{" "}
                  {new Date(`${goal.deadline}T12:00:00`).toLocaleDateString(
                    undefined,
                    { month: "short", day: "numeric" },
                  )}
                </Text>
                <Text variant="title" style={{ marginTop: space.xxs }}>
                  {goal.title}
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: space.s }}>
                <Pill
                  value={`${stats.streak} ${stats.streak === 1 ? "day" : "days"}`}
                />
                <Pill kind="xp" value={`${stats.xp} XP`} />
              </View>
            </View>
            {units.map((unit) => (
              <View key={unit.id}>
                <Card
                  style={[
                    layout.row,
                    {
                      paddingVertical: space.xxl,
                      paddingHorizontal: space.page,
                      borderRadius: radius.hero,
                    },
                  ]}
                >
                  <View style={layout.flex}>
                    <Text variant="eyebrow" style={{ color: colors.accent }}>
                      UNIT {unit.idx} · {unit.title.toUpperCase()}
                    </Text>
                    <View style={{ marginTop: space.m }}>
                      <ProgressBar value={progress.ratio} />
                    </View>
                  </View>
                  <Text variant="caption" muted>
                    {progress.done} of {progress.total} steps
                  </Text>
                </Card>
                <View
                  style={{
                    width: "100%",
                    maxWidth: 520,
                    alignSelf: "center",
                    marginTop: space.xxl,
                  }}
                >
                  <RoadmapPath
                    desktop
                    steps={[...unit.steps].sort((a, b) => a.idx - b.idx)}
                    allSteps={progress.steps}
                    theme={goal.theme_id}
                    onStart={(step) => go(stepPath(goal.id, step.id))}
                  />
                </View>
              </View>
            ))}
          </View>
          <View
            style={{
              flexGrow: 1,
              flexBasis: 300,
              maxWidth: 380,
              gap: space.lg,
            }}
          >
            <Card
              style={{
                padding: space.xxl,
                borderRadius: radius.hero,
                borderWidth: 1.5,
                borderColor: colors.accent,
                gap: space.md,
                boxShadow: `0 5px 0 ${colors.accentSoft}`,
              }}
            >
              <Text variant="eyebrow" style={{ color: colors.accent }}>
                {progress.current
                  ? `UP NEXT · STEP ${progress.done + 1}`
                  : progress.next
                    ? "YOUR NEXT STEP"
                    : "GOAL COMPLETE"}
              </Text>
              <Text variant="subheading">
                {progress.next?.title ?? "You walked the whole path"}
              </Text>
              <Text variant="bodySmall">
                {progress.current?.content.find((b) => b.type === "text")
                  ?.text ??
                  (progress.next
                    ? `Available ${progress.next.unlock_date}`
                    : "Take a moment to look back at your progress.")}
              </Text>
              {progress.current && (
                <>
                  <Text variant="small" muted>
                    {progress.current.minutes} min · +{progress.current.xp} XP
                  </Text>
                  <PrimaryButton
                    label="Start step"
                    onPress={() => go(stepPath(goal.id, progress.current!.id))}
                  />
                </>
              )}
            </Card>
            <Card
              style={{
                padding: space.xxl,
                borderRadius: radius.hero,
                gap: space.m,
              }}
            >
              <Text variant="card">Latest note</Text>
              <Text variant="bodySmall">
                {notes.isPending && !preview
                  ? "Loading notes…"
                  : notes.isError
                    ? "Your latest note could not load."
                    : note?.text ||
                      "Save a thought after your next step. It will appear here."}
              </Text>
              {note && (
                <Text variant="small" muted>
                  {new Date(note.created_at).toLocaleDateString()}
                </Text>
              )}
              <TextButton label="Open journal" onPress={() => go("/journal")} />
            </Card>
            {goal.status === "active" && (
              <AdjustPlan goalId={goal.id} disabled={preview} />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
