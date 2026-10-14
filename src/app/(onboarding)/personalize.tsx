import { useState } from "react";
import { Platform, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { ProgressBar } from "@/components/ProgressBar";
import { Text } from "@/components/Text";
import { PrimaryButton } from "@/components/Buttons";
import { Card, Input, InlineError, layout } from "@/components/Primitives";
import { Icon } from "@/components/Icon";
import { DateTimeField } from "@/components/DateTimeField";
import { displayDateTime } from "@/domain/dateTime";
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
  const [time, setTime] = useState("19:00");
  const [reminder, setReminder] = useState(false);
  const [notice, setNotice] = useState("");
  const save = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error("Sign in first to save your preferences.");
      const actualReminder =
        reminder && Platform.OS !== "web"
          ? await setDailyReminder(time)
          : false;
      const profile = {
        id: session.user.id,
        name: name.trim(),
        reminder_time: actualReminder ? time : null,
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
            label="Create my first path"
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
        Just your name and an optional reminder. You choose your own pace.
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
              : `Every day at ${displayDateTime(time, "time")}`}
          </Text>
        </View>
        <Toggle
          label="Daily reminder"
          value={reminder}
          onChange={setReminder}
        />
      </Card>
      {reminder && (
        <View style={{ marginTop: space.lg }}>
          <DateTimeField
            mode="time"
            label="Reminder time"
            value={time}
            onChange={setTime}
            disabled={save.isPending}
          />
        </View>
      )}
    </Screen>
  );
}
