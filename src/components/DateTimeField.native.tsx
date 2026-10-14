import { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "@/theme/ThemeProvider";
import {
  dateValue,
  displayDateTime,
  parseDate,
  parseTime,
  timeValue,
} from "@/domain/dateTime";
import { radius, size, space } from "@/theme/tokens";
import { Text } from "./Text";
import { Icon } from "./Icon";
import { TextButton } from "./Buttons";
import type { DateTimeFieldProps } from "./DateTimeField.types";

export function DateTimeField({
  mode,
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  disabled,
}: DateTimeFieldProps) {
  const { colors, mode: theme } = useTheme();
  const [open, setOpen] = useState(false);
  const selected =
    (mode === "date" ? parseDate(value) : parseTime(value)) ?? new Date();
  const min = minimumDate ? (parseDate(minimumDate) ?? undefined) : undefined;
  const max = maximumDate ? (parseDate(maximumDate) ?? undefined) : undefined;
  const clamped =
    min && selected < min ? min : max && selected > max ? max : selected;
  const commit = (date: Date) =>
    onChange(mode === "date" ? dateValue(date) : timeValue(date));
  return (
    <View style={{ gap: space.s }}>
      <Text variant="caption">{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${displayDateTime(value, mode) || "Choose"}`}
        accessibilityState={{ expanded: open, disabled: !!disabled }}
        disabled={disabled}
        onPress={() => setOpen(!open)}
        style={{
          minHeight: size.input,
          padding: space.lg,
          borderRadius: radius.button,
          borderWidth: 1.5,
          borderColor: colors.line,
          backgroundColor: colors.surface,
          flexDirection: "row",
          alignItems: "center",
          gap: space.md,
          opacity: disabled ? 0.55 : 1,
        }}
      >
        <Icon
          name={mode === "date" ? "calendar" : "clock"}
          color={colors.accent}
        />
        <Text style={{ flex: 1 }}>
          {displayDateTime(value, mode) ||
            (mode === "date" ? "Choose a date" : "Choose a time")}
        </Text>
        <Icon name="down" size={18} />
      </Pressable>
      {open && !disabled && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.button,
            overflow: "hidden",
          }}
        >
          <DateTimePicker
            value={clamped}
            mode={mode}
            display={
              Platform.OS === "ios"
                ? mode === "date"
                  ? "inline"
                  : "spinner"
                : "default"
            }
            minimumDate={min}
            maximumDate={max}
            themeVariant={theme}
            accentColor={colors.accent}
            textColor={colors.ink}
            onChange={(event, date) => {
              if (Platform.OS !== "ios") setOpen(false);
              if (event.type === "set" && date) commit(date);
            }}
          />
          {Platform.OS === "ios" && (
            <TextButton
              label="Done"
              onPress={() => {
                commit(clamped);
                setOpen(false);
              }}
            />
          )}
        </View>
      )}
    </View>
  );
}
