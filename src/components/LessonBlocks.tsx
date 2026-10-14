import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Image } from "expo-image";
import { usePronunciation } from "@/hooks/usePronunciation";
import type { ContentBlock } from "@/domain/schema";
import type { LessonDraft } from "@/hooks/useLessonDraft";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radius, size, space } from "@/theme/tokens";
import { Text } from "./Text";
import { Card, InlineError, layout } from "./Primitives";
import { Icon } from "./Icon";
import { OptionCard } from "./OptionCard";
export function requirementsMet(blocks: ContentBlock[], value: LessonDraft) {
  return blocks.every((block, i) =>
    block.type === "task"
      ? value.checks[`${i}`]
      : block.type === "checklist"
        ? block.items.every((_, j) => value.checks[`${i}.${j}`])
        : block.type === "quiz"
          ? value.answers[`${i}`] === block.answer
          : true,
  );
}
function LessonImage({ url, alt }: { url: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <Card>
      <Icon name="image" />
      <Text muted>{alt}</Text>
      <Text variant="small" muted>
        Image unavailable. The lesson text is still available.
      </Text>
    </Card>
  ) : (
    <Image
      source={{ uri: url }}
      accessibilityLabel={alt}
      contentFit="contain"
      style={{ width: "100%", height: 180, borderRadius: radius.card }}
      onError={() => setFailed(true)}
    />
  );
}
export function LessonBlocks({
  blocks,
  value,
  onChange,
  readOnly = false,
}: {
  blocks: ContentBlock[];
  value: LessonDraft;
  onChange: (draft: LessonDraft) => void;
  readOnly?: boolean;
}) {
  const { colors } = useTheme();
  const speech = usePronunciation();
  const check = (key: string, label: string) => (
    <Pressable
      key={key}
      accessibilityRole="checkbox"
      aria-checked={readOnly || !!value.checks[key]}
      accessibilityState={{ checked: readOnly || !!value.checks[key] }}
      onPress={() => {
        if (!readOnly)
          onChange({
            ...value,
            checks: { ...value.checks, [key]: !value.checks[key] },
          });
      }}
      style={[layout.row, { minHeight: size.touch, alignItems: "flex-start" }]}
    >
      <View
        style={{
          width: 22,
          height: 22,
          marginTop: space.xxs,
          borderRadius: radius.xs,
          borderWidth: 2,
          borderColor: colors.accent,
          backgroundColor:
            readOnly || value.checks[key] ? colors.accent : colors.transparent,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {(readOnly || value.checks[key]) && (
          <Icon name="check" size={16} color={colors.onAccent} />
        )}
      </View>
      <Text variant="bodySmall" style={layout.flex}>
        {label}
      </Text>
    </Pressable>
  );
  return (
    <View style={{ gap: space.lg }}>
      {blocks.map((block, i) => {
        if (block.type === "text")
          return (
            <Text key={i} style={{ color: colors.inkSecondary }} selectable>
              {block.text}
            </Text>
          );
        if (block.type === "image")
          return <LessonImage key={i} url={block.url} alt={block.alt} />;
        if (block.type === "phrase")
          return (
            <Card
              key={i}
              style={[
                layout.row,
                {
                  paddingVertical: space.md,
                  paddingHorizontal: space.ml,
                  borderRadius: radius.button,
                },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${speech.playing === i || speech.loading === i ? "Stop" : "Play"} pronunciation: ${block.romanization || block.text}`}
                aria-busy={speech.loading === i}
                onPress={() => void speech.speak(block, i)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: radius.small,
                  backgroundColor: colors.accentSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {speech.loading === i ? (
                  <ActivityIndicator color={colors.accent} />
                ) : (
                  <Icon
                    name={speech.playing === i ? "stop" : "sound"}
                    size={20}
                    color={colors.accent}
                  />
                )}
              </Pressable>
              <View style={layout.flex}>
                <Text
                  style={{
                    fontFamily: /^(ja|jp|japanese|日本語)/i.test(block.language)
                      ? fonts.japanese
                      : fonts.bold,
                    fontSize: 17,
                  }}
                >
                  {block.text}
                </Text>
                <Text variant="caption" muted>
                  {block.romanization} — {block.translation}
                </Text>
                {speech.playing === i && (
                  <Text
                    variant="tiny"
                    style={{ color: colors.accent }}
                    accessibilityLiveRegion="polite"
                  >
                    Playing pronunciation
                  </Text>
                )}
              </View>
            </Card>
          );
        if (block.type === "tip")
          return (
            <View
              key={i}
              style={[
                layout.row,
                {
                  alignItems: "flex-start",
                  gap: space.m,
                  padding: space.ml,
                  borderRadius: radius.button,
                  backgroundColor: colors.streakBg,
                },
              ]}
            >
              <Icon name="tip" size={20} color={colors.streakIcon} />
              <Text
                variant="caption"
                style={{
                  flex: 1,
                  color: colors.tipText,
                  fontFamily: fonts.semibold,
                }}
              >
                {block.text}
              </Text>
            </View>
          );
        if (block.type === "task")
          return (
            <Card key={i} style={{ gap: space.m }}>
              <Text variant="card">Practice task</Text>
              {check(String(i), block.text)}
            </Card>
          );
        if (block.type === "checklist")
          return (
            <Card key={i} style={{ gap: space.m }}>
              <Text variant="card">Try it yourself</Text>
              {block.items.map((item, j) => check(`${i}.${j}`, item))}
            </Card>
          );
        const answer = readOnly ? block.answer : value.answers[String(i)];
        return (
          <Card key={i} style={{ gap: space.m }}>
            <Text variant="card">{block.question}</Text>
            {block.options.map((option, j) => (
              <OptionCard
                key={j}
                title={option}
                selected={answer === j}
                onPress={() => {
                  if (!readOnly)
                    onChange({
                      ...value,
                      answers: { ...value.answers, [i]: j },
                    });
                }}
              />
            ))}
            {answer !== undefined && (
              <Text
                variant="caption"
                style={{
                  color:
                    answer === block.answer ? colors.accent : colors.streakText,
                }}
                accessibilityLiveRegion="polite"
              >
                {answer === block.answer ? "That’s right. " : "Try once more. "}
                {block.explanation}
              </Text>
            )}
          </Card>
        );
      })}
      <InlineError message={speech.error} />
    </View>
  );
}
