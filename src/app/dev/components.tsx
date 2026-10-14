import { useState } from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";
import { radius, space } from "@/theme/tokens";
import { Text } from "@/components/Text";
import { Logo } from "@/components/Logo";
import { Mascot } from "@/components/Mascot";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import { OptionCard } from "@/components/OptionCard";
import { DateTimeField } from "@/components/DateTimeField";
import { ProgressBar, ProgressRing } from "@/components/ProgressBar";
import { TabBar, type Tab } from "@/components/TabBar";
import {
  Card,
  Chip,
  Input,
  layout,
  Pill,
  StatTile,
  StateView,
} from "@/components/Primitives";
function Gallery() {
  const { colors, mode } = useTheme();
  const [selection, setSelection] = useState(0);
  const [tab, setTab] = useState<Tab>("path");
  const [clicks, setClicks] = useState(0);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [choices, setChoices] = useState<number[]>([]);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: space.page,
        gap: space.lg,
      }}
    >
      <Logo wordmark />
      <Text variant="title">
        {mode === "light" ? "Light" : "Dark"} components
      </Text>
      <Text muted>Quiet Ambition · interactive component canvas</Text>
      <View style={layout.row}>
        {(["happy", "thinking", "sad", "cheer"] as const).map((mood) => (
          <View key={mood} style={{ flex: 1, alignItems: "center" }}>
            <Mascot mood={mood} size={64} />
            <Text variant="tiny">{mood}</Text>
          </View>
        ))}
      </View>
      <PrimaryButton
        label={`Primary button${clicks ? ` · ${clicks}` : ""}`}
        onPress={() => setClicks(clicks + 1)}
      />
      <PrimaryButton label="Disabled button" disabled onPress={() => {}} />
      <PrimaryButton label="Loading" loading onPress={() => {}} />
      <SecondaryButton label="Secondary button" onPress={() => setClicks(0)} />
      {[0, 1].map((i) => (
        <OptionCard
          key={i}
          title={i ? "Another option" : "Steady progress"}
          description="Learn at your own pace"
          selected={selection === i}
          onPress={() => setSelection(i)}
        />
      ))}
      {[0, 1].map((i) => (
        <OptionCard
          key={`multi-${i}`}
          multiple
          title={i ? "Travel" : "Conversation"}
          selected={choices.includes(i)}
          onPress={() =>
            setChoices(
              choices.includes(i)
                ? choices.filter((choice) => choice !== i)
                : [...choices, i],
            )
          }
        />
      ))}
      <DateTimeField
        mode="date"
        label="Target date"
        value={date}
        onChange={setDate}
      />
      <DateTimeField
        mode="time"
        label="Reminder time"
        value={time}
        onChange={setTime}
      />
      <Text variant="eyebrow">PROGRESS</Text>
      <ProgressBar value={(clicks % 5) / 4} />
      <ProgressBar value={0.5} segments={4} height={8} />
      <View style={layout.row}>
        <ProgressRing value={0.7} />
        <Pill value={12} />
        <Pill value={840} kind="xp" />
      </View>
      <View style={layout.row}>
        <StatTile value={24} label="steps" />
        <StatTile value="20 min" label="per day" />
      </View>
      <View style={layout.wrap}>
        <Chip label="Selected" selected />
        <Chip label="A quiet start" />
      </View>
      <Input
        accessibilityLabel="Example input"
        placeholder="Describe your goal"
      />
      <Card>
        <Text variant="heading">One clear path.</Text>
        <Text muted>
          Nunito, generous space, and one accent for every category.
        </Text>
      </Card>
      <View style={{ borderRadius: radius.card, overflow: "hidden" }}>
        <TabBar active={tab} onChange={setTab} />
      </View>
      <StateView
        kind="empty"
        title="Your path starts here"
        message="Empty state"
      />
      <StateView
        kind="error"
        title="Let's try again"
        message="Error state"
        action="Retry"
        onAction={() => setClicks(0)}
      />
      <StateView kind="loading" title="Finding your next step" />
    </View>
  );
}
export default function Components() {
  const { width } = useWindowDimensions();
  return (
    <ScrollView
      contentContainerStyle={{
        flexDirection: width >= 800 ? "row" : "column",
        paddingTop: space.page,
      }}
    >
      <ThemeProvider forced="light">
        <Gallery />
      </ThemeProvider>
      <ThemeProvider forced="dark">
        <Gallery />
      </ThemeProvider>
    </ScrollView>
  );
}
