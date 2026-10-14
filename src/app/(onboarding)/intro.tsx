import { useState } from "react";
import { View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, space } from "@/theme/tokens";
import { Screen } from "@/components/Screen";
import { PrimaryButton, TextButton } from "@/components/Buttons";
import { Card, Chip, layout, Pill } from "@/components/Primitives";
import { Text } from "@/components/Text";
import { Icon } from "@/components/Icon";
import { WelcomeArt } from "@/components/WelcomeArt";
import { replace } from "@/lib/navigation";
const slides = [
  [
    "Welcome to Milo",
    "A quick introduction, then your first goal. Answer a few simple questions and we’ll turn it into a clear path.",
  ],
  [
    "Answer a few questions",
    "Tell us where you’re starting and what you want to achieve. You can go back and change any answer.",
  ],
  [
    "Move at your own pace",
    "Finish a step and the next one is ready. Keep going as long as you like, and save notes along the way.",
  ],
];
export default function Intro() {
  const [index, setIndex] = useState(0);
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  return (
    <Screen
      footer={
        <>
          <PrimaryButton
            label={index === 2 ? "Let's begin" : "Continue"}
            onPress={() =>
              index === 2 ? replace("/personalize") : setIndex(index + 1)
            }
          />
          {index > 0 && (
            <TextButton
              label="Back"
              muted
              onPress={() => setIndex(index - 1)}
            />
          )}
        </>
      }
    >
      <View style={layout.between}>
        <View
          style={{ flexDirection: "row", gap: space.sm }}
          accessibilityLabel={`Introduction ${index + 1} of 3`}
        >
          {slides.map((_, i) => (
            <Animated.View
              layout={reduced ? undefined : LinearTransition.duration(200)}
              key={i}
              style={{
                height: 8,
                width: i === index ? 24 : 8,
                borderRadius: radius.xs,
                backgroundColor:
                  i === index ? colors.accent : colors.lockedNodeShadow,
              }}
            />
          ))}
        </View>
        <TextButton
          label="Skip"
          muted
          onPress={() => replace("/personalize")}
        />
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          paddingVertical: space.section,
        }}
      >
        {index === 0 ? (
          <Card
            style={{
              padding: space.xxl,
              borderRadius: radius.hero,
              gap: space.md,
            }}
          >
            <Text variant="eyebrow" muted>
              YOUR GOAL
            </Text>
            <Text style={{ fontSize: 20, lineHeight: 28 }}>
              I&apos;m visiting Japan next month and want to ask and answer
              simple questions in Japanese.
            </Text>
            <View style={{ alignItems: "flex-end" }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: colors.accent,
                  borderRadius: radius.control,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="arrow" size={20} color={colors.onAccent} />
              </View>
            </View>
          </Card>
        ) : index === 1 ? (
          <View style={{ gap: space.m }}>
            <Card
              style={{ maxWidth: "82%", borderBottomLeftRadius: radius.xs }}
            >
              <Text>What&apos;s your Japanese level right now?</Text>
            </Card>
            <View style={layout.wrap}>
              <Chip label="Total beginner" selected />
              <Chip label="Know kana" />
              <Chip label="N5+" />
            </View>
            <Card
              style={{
                maxWidth: "82%",
                borderBottomLeftRadius: radius.xs,
                marginTop: space.s,
              }}
            >
              <Text>What would you like to use Japanese for?</Text>
            </Card>
          </View>
        ) : (
          <View>
            <WelcomeArt compact />
            <View style={{ position: "absolute", right: 0, top: 108 }}>
              <Pill value="7-day streak" />
            </View>
          </View>
        )}
        <Text
          variant="title"
          style={{ marginTop: space.hero, marginBottom: space.m }}
        >
          {slides[index][0]}
        </Text>
        <Text variant="bodyLarge" muted>
          {slides[index][1]}
        </Text>
      </View>
    </Screen>
  );
}
