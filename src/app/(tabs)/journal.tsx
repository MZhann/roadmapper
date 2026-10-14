import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { StoriaCard } from "@/components/StoriaCard";
import { StoryPhoto } from "@/components/StoryPhoto";
import { Sheet } from "@/components/Sheet";
import { Input, InlineError, StateView, layout } from "@/components/Primitives";
import {
  PrimaryButton,
  SecondaryButton,
  TextButton,
} from "@/components/Buttons";
import { useGoals, useNotes } from "@/data/queries";
import type { Note } from "@/domain/schema";
import { localDate, stepsOf } from "@/domain/progress";
import { db, errorMessage } from "@/lib/supabase";
import { storyBucket } from "@/lib/photos";
import { go, stepPath } from "@/lib/navigation";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radius, size, space } from "@/theme/tokens";
export default function Journal() {
  const notes = useNotes();
  const goals = useGoals();
  const queries = useQueryClient();
  const { colors } = useTheme();
  const [filter, setFilter] = useState<string | null>(null);
  const [editing, setEditing] = useState<Note | null>(null);
  const [text, setText] = useState("");
  const [confirm, setConfirm] = useState(false);
  const edit = useMutation({
    mutationFn: async (remove: boolean) => {
      if (!editing) return;
      const result = remove
        ? await db().from("notes").delete().eq("id", editing.id)
        : await db()
            .from("notes")
            .update({ text: text.trim() })
            .eq("id", editing.id);
      if (result.error) throw result.error;
      if (remove && editing.photo_url) {
        const photo = await db()
          .storage.from(storyBucket)
          .remove([editing.photo_url]);
        if (photo.error)
          throw new Error(
            "The note was deleted, but its private photo could not be removed. Please retry deletion.",
          );
      }
      await queries.invalidateQueries({ queryKey: ["notes"] });
      setEditing(null);
      setConfirm(false);
    },
  });
  if (notes.isPending)
    return (
      <Screen>
        <StateView kind="loading" title="Opening your journal…" />
      </Screen>
    );
  if (notes.isError)
    return (
      <Screen>
        <StateView
          kind="error"
          title="Couldn’t open your journal"
          message={errorMessage(notes.error)}
          action="Retry"
          onAction={() => void notes.refetch()}
        />
      </Screen>
    );
  const visible = notes.data.filter(
    (note) => !filter || note.steps?.units?.goal_id === filter,
  );
  const filters = Array.from(
    new Map(
      notes.data
        .filter((n) => n.steps?.units)
        .map((n) => [n.steps.units.goal_id, n.steps.units.goals.title]),
    ).entries(),
  );
  return (
    <>
      <Screen style={{ paddingHorizontal: space.xxl }}>
        <Text variant="titleSmall">Journal</Text>
        <Text
          variant="bodySmall"
          muted
          style={{ marginTop: space.xs, marginBottom: space.lg }}
        >
          Notes from every step — the raw material of your story.
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ gap: space.s }}
        >
          {[[null, "All goals"], ...filters].map(([id, title]) => (
            <Pressable
              key={id ?? "all"}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === id }}
              onPress={() => setFilter(id)}
              style={{
                minHeight: size.touch,
                justifyContent: "center",
                paddingHorizontal: space.ml,
                paddingVertical: space.s,
                borderRadius: radius.round,
                borderWidth: filter === id ? 0 : 1.5,
                borderColor: colors.line,
                backgroundColor: filter === id ? colors.ink : colors.surface,
              }}
            >
              <Text
                variant="caption"
                style={{
                  color:
                    filter === id ? colors.background : colors.inkSecondary,
                }}
              >
                {title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={{ marginTop: space.lg }}>
          <StoriaCard />
        </View>
        {!visible.length ? (
          <StateView
            title="Your story starts with a step"
            message="Save a thought or a photo after a lesson. Your notes will appear here."
            action="Find your next step"
            onAction={() => go("/")}
          />
        ) : (
          <View style={{ marginTop: space.xl }}>
            {visible.map((note) => {
              const goal = goals.data?.find(
                (g) => g.id === note.steps?.units?.goal_id,
              );
              const index = goal
                ? stepsOf(goal).findIndex((s) => s.id === note.step_id) + 1
                : note.steps?.idx;
              const date =
                localDate(new Date(note.created_at)) === localDate()
                  ? "Today"
                  : new Date(note.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    });
              return (
                <View
                  key={note.id}
                  style={{ flexDirection: "row", gap: space.ml }}
                >
                  <View style={{ width: 14, alignItems: "center" }}>
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        marginTop: space.xs,
                        borderRadius: radius.round,
                        backgroundColor: colors.accent,
                      }}
                    />
                    <View
                      style={{
                        flex: 1,
                        width: 2,
                        marginVertical: space.xs,
                        backgroundColor: colors.line,
                      }}
                    />
                  </View>
                  <View style={{ flex: 1, paddingBottom: space.xl }}>
                    <Text variant="tiny" muted>
                      {date} · {index ? `Step ${index}` : "Your note"}
                      {!filter && note.steps?.units?.goals?.title
                        ? ` · ${note.steps.units.goals.title}`
                        : ""}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Edit journal note"
                      onPress={() => {
                        setEditing(note);
                        setText(note.text);
                        setConfirm(false);
                        edit.reset();
                      }}
                      style={{
                        marginTop: space.sm,
                        paddingVertical: space.md,
                        paddingHorizontal: space.ml,
                        borderRadius: radius.button,
                        borderWidth: 1,
                        borderColor: colors.line,
                        backgroundColor: colors.surface,
                      }}
                    >
                      {!!note.text && (
                        <Text variant="bodySmall">{note.text}</Text>
                      )}
                      {note.photo_url && (
                        <View style={{ marginTop: note.text ? space.s : 0 }}>
                          <StoryPhoto path={note.photo_url} />
                        </View>
                      )}
                      {!note.text && !note.photo_url && (
                        <Text muted>Empty note</Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
        <TextButton
          label={notes.isFetching ? "Refreshing…" : "Refresh journal"}
          muted
          onPress={() => void notes.refetch()}
        />
      </Screen>
      <Sheet
        visible={!!editing}
        title="Your note"
        onClose={() => {
          if (!edit.isPending) setEditing(null);
        }}
        footer={
          <>
            <InlineError
              message={edit.error ? errorMessage(edit.error) : null}
            />
            {confirm ? (
              <>
                <Text variant="caption">
                  Delete this note and its photo permanently?
                </Text>
                <PrimaryButton
                  label="Delete permanently"
                  loading={edit.isPending}
                  onPress={() => edit.mutate(true)}
                />
                <SecondaryButton
                  label="Keep note"
                  disabled={edit.isPending}
                  onPress={() => setConfirm(false)}
                />
              </>
            ) : (
              <>
                <PrimaryButton
                  label="Save note"
                  disabled={!text.trim() && !editing?.photo_url}
                  loading={edit.isPending}
                  onPress={() => edit.mutate(false)}
                />
                <TextButton
                  label="Delete note"
                  muted
                  onPress={() => setConfirm(true)}
                />
              </>
            )}
          </>
        }
      >
        <Input
          accessibilityLabel="Edit your note"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={10000}
          style={{ minHeight: 180 }}
        />
        {editing?.photo_url && (
          <View style={{ marginTop: space.lg }}>
            <StoryPhoto path={editing.photo_url} />
          </View>
        )}
        {editing?.steps && (
          <View style={[layout.row, { marginTop: space.lg }]}>
            <TextButton
              label="Review this lesson"
              onPress={() => {
                const note = editing;
                setEditing(null);
                go(stepPath(note.steps.units.goal_id, note.step_id));
              }}
            />
          </View>
        )}
        <Text
          variant="small"
          muted
          style={{ fontFamily: fonts.semibold, marginTop: space.md }}
        >
          Your notes and photos are private to your account.
        </Text>
      </Sheet>
    </>
  );
}
