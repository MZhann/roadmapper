import { useState } from "react";
import { Pressable, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useDraft } from "@/providers/DraftProvider";
import { Text } from "./Text";
import { Input, InlineError, layout } from "./Primitives";
import { PrimaryButton, TextButton } from "./Buttons";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radius, space } from "@/theme/tokens";
import { go } from "@/lib/navigation";
import { errorMessage } from "@/lib/supabase";
const ideas = [
  ["Sport", "Learn to juggle three balls"],
  ["Money", "Earn $1,000 freelancing this month"],
  ["Learn", "Know every flag in the world"],
  ["Tech", "Build my first Python script"],
] as const;
export function HomeEmpty({
  name,
  minutes = 15,
}: {
  name: string;
  minutes?: number;
}) {
  const { colors } = useTheme();
  const draft = useDraft();
  const [prompt, setPrompt] = useState("");
  const create = useMutation({
    mutationFn: async () => {
      await draft.start(prompt, minutes);
      go("/goal/new/questions");
    },
  });
  const hour = new Date().getHours();
  return (
    <>
      <Text variant="bodySmall" muted>
        Good {hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"},{" "}
        {name}
      </Text>
      <Text
        variant="title"
        style={{ marginTop: space.sm, marginBottom: space.page }}
      >
        What do you want to achieve?
      </Text>
      <View
        style={{
          borderRadius: radius.input,
          padding: space.lg,
          borderWidth: 2,
          borderColor: colors.accent,
          backgroundColor: colors.surface,
          gap: space.md,
          boxShadow: `0 4px 0 ${colors.accentSoft}`,
        }}
      >
        <Input
          accessibilityLabel="Describe your goal"
          multiline
          value={prompt}
          onChangeText={setPrompt}
          maxLength={2000}
          placeholder="I'm going to visit Japan next month. I want to speak Japanese well enough to ask and answer simple questions."
          style={{
            borderWidth: 0,
            backgroundColor: colors.transparent,
            padding: 0,
            paddingHorizontal: 0,
            paddingVertical: 0,
            fontSize: 18,
            lineHeight: 26,
            minHeight: 112,
          }}
        />
        <View style={{ alignSelf: "flex-end" }}>
          <PrimaryButton
            label="Map my path"
            compact
            icon="arrow"
            loading={create.isPending}
            disabled={prompt.trim().length < 10 || draft.loading}
            onPress={() => create.mutate()}
          />
        </View>
      </View>
      <InlineError
        message={create.error ? errorMessage(create.error) : draft.error}
      />
      {draft.draft && (
        <TextButton
          label="Continue your saved draft"
          onPress={() =>
            go(draft.draft?.plan ? "/goal/new/review" : "/goal/new/questions")
          }
        />
      )}
      <Text
        variant="eyebrow"
        muted
        style={{ marginTop: space.section, marginBottom: space.md }}
      >
        OR TRY ONE OF THESE
      </Text>
      <View style={{ gap: space.m }}>
        {ideas.map(([tag, text], i) => (
          <Pressable
            accessibilityRole="button"
            key={tag}
            onPress={() => setPrompt(text)}
            style={[
              layout.row,
              {
                paddingVertical: space.md,
                paddingHorizontal: space.ml,
                borderWidth: 1.5,
                borderColor: colors.line,
                borderRadius: radius.button,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <View
              style={{
                paddingVertical: space.micro,
                paddingHorizontal: space.s,
                borderRadius: radius.chip,
                backgroundColor:
                  i === 0
                    ? colors.sportBg
                    : i === 1
                      ? colors.streakBg
                      : i === 2
                        ? colors.accentSoft
                        : colors.techBg,
              }}
            >
              <Text
                variant="tab"
                style={{
                  fontFamily: fonts.black,
                  textTransform: "uppercase",
                  color:
                    i === 0
                      ? colors.sportText
                      : i === 1
                        ? colors.streakText
                        : i === 2
                          ? colors.accentDeep
                          : colors.inkSecondary,
                }}
              >
                {tag}
              </Text>
            </View>
            <Text
              variant="bodySmall"
              style={{ flex: 1, fontFamily: fonts.bold }}
            >
              {text}
            </Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}
