import { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { ProgressBar } from "@/components/ProgressBar";
import { Text } from "@/components/Text";
import { PrimaryButton } from "@/components/Buttons";
import { Card, Input, InlineError, layout } from "@/components/Primitives";
import { Icon } from "@/components/Icon";
import { Toggle } from "@/components/Toggle";
import { useAuth } from "@/providers/AuthProvider";
import { db, errorMessage } from "@/lib/supabase";
import { setDailyReminder } from "@/lib/reminders";
import { replace } from "@/lib/navigation";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radius, space } from "@/theme/tokens";
export default function Personalize() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const queries = useQueryClient();
  const [name, setName] = useState(
    (
      session?.user.user_metadata?.full_name ??
      session?.user.user_metadata?.name ??
      ""
    ).split(" ")[0],
  );
  const [minutes, setMinutes] = useState(15);
  const [reminder, setReminder] = useState(Platform.OS !== "web");
  const [notice, setNotice] = useState("");
  const save = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error("Sign in first to save your preferences.");
      const actualReminder =
        reminder && Platform.OS !== "web"
          ? await setDailyReminder("19:00")
          : false;
      const profile = {
        id: session.user.id,
        name: name.trim(),
        daily_minutes: minutes,
        reminder_time: actualReminder ? "19:00" : null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        onboarding_complete: true,
      };
      const { data, error } = await db()
        .from("profiles")
        .upsert(profile)
        .select()
        .single();
      if (error) throw error;
      queries.setQueryData(["profile", session.user.id], data);
      if (reminder && !actualReminder && Platform.OS !== "web")
        setNotice(
          "Notifications are off. You can enable them later in Settings.",
        );
    },
    onSuccess: () => replace("/"),
  });
  return (
    <Screen
      footer={
        <>
          <InlineError
            message={save.error ? errorMessage(save.error) : notice}
          />
          <PrimaryButton
            label="Continue"
            disabled={!name.trim()}
            loading={save.isPending}
            onPress={() => save.mutate()}
          />
        </>
      }
    >
      <ProgressBar value={0.8} height={8} />
      <Text
        variant="titleSmall"
        style={{ marginTop: space.block, marginBottom: space.s }}
      >
        A little about you
      </Text>
      <Text muted style={{ marginBottom: space.section }}>
        Used to pace every plan Milo makes for you.
      </Text>
      <Text
        variant="caption"
        style={{ fontFamily: fonts.extraBold, marginBottom: space.s }}
      >
        What should we call you?
      </Text>
      <Input
        accessibilityLabel="Your name"
        placeholder="Your name"
        autoComplete="given-name"
        value={name}
        onChangeText={setName}
        maxLength={60}
      />
      <Text
        variant="caption"
        style={{
          fontFamily: fonts.extraBold,
          marginTop: space.section,
          marginBottom: space.m,
        }}
      >
        Usual time per day
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.m }}>
        {(
          [
            [5, "Light"],
            [15, "Steady"],
            [30, "Serious"],
            [60, "Intense"],
          ] as const
        ).map(([value, label]) => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityLabel={`${value} minutes, ${label}`}
            accessibilityState={{ selected: minutes === value }}
            onPress={() => setMinutes(value)}
            style={{
              width: "48%",
              flexGrow: 1,
              minHeight: 76,
              justifyContent: "center",
              paddingHorizontal: space.lg,
              gap: space.xxs,
              borderRadius: radius.option,
              borderWidth: minutes === value ? 2 : 1.5,
              borderColor: minutes === value ? colors.accent : colors.line,
              backgroundColor:
                minutes === value ? colors.accentSoft : colors.surface,
              boxShadow: `0 3px 0 ${minutes === value ? colors.accent : colors.line}`,
            }}
          >
            <Text style={{ fontSize: 20, fontFamily: fonts.black }}>
              {value} min
            </Text>
            <Text variant="small" muted>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Card
        style={[
          layout.row,
          {
            marginTop: space.section,
            paddingVertical: space.ml,
            borderRadius: radius.option,
            gap: space.ml,
          },
        ]}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.small,
            backgroundColor: colors.accentSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="bell" size={20} color={colors.accent} />
        </View>
        <View style={layout.flex}>
          <Text variant="card">Daily reminder</Text>
          <Text variant="caption" muted>
            {Platform.OS === "web"
              ? "Available in the mobile app"
              : "Every day at 19:00"}
          </Text>
        </View>
        <Toggle
          label="Daily reminder"
          value={reminder}
          onChange={setReminder}
        />
      </Card>
    </Screen>
  );
}
