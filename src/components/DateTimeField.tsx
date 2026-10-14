import { View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radius, size, space, type } from "@/theme/tokens";
import { Text } from "./Text";
import type { DateTimeFieldProps } from "./DateTimeField.types";

/** Browser-native calendar/time controls. Native builds resolve .native.tsx. */
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
  return (
    <View style={{ gap: space.s }}>
      <Text variant="caption">{label}</Text>
      <input
        aria-label={label}
        type={mode}
        value={value}
        min={minimumDate}
        max={maximumDate}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        style={{
          boxSizing: "border-box",
          width: "100%",
          minWidth: 0,
          minHeight: size.input,
          borderRadius: radius.button,
          border: `1.5px solid ${colors.line}`,
          background: colors.surface,
          color: colors.ink,
          colorScheme: theme,
          fontFamily: fonts.semibold,
          fontSize: type.body.fontSize,
          padding: `${space.md}px ${space.lg}px`,
          opacity: disabled ? 0.55 : 1,
        }}
      />
    </View>
  );
}
