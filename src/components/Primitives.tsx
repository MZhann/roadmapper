import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewProps,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radius, size, space, type } from "@/theme/tokens";
import { Text } from "./Text";
import { Icon, type IconName } from "./Icon";
import { Mascot } from "./Mascot";
import { SecondaryButton } from "./Buttons";
export const layout = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: space.md },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.s,
  },
  stack: { gap: space.lg },
  flex: { flex: 1 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: space.s },
});
export function Card({ style, ...props }: ViewProps) {
  const { colors } = useTheme();
  return (
    <View
      {...props}
      style={[
        {
          padding: space.lg,
          borderWidth: 1,
          borderColor: colors.line,
          borderRadius: radius.card,
          backgroundColor: colors.surface,
        },
        style,
      ]}
    />
  );
}
export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        paddingVertical: space.s,
        paddingHorizontal: space.ml,
        minHeight: onPress ? size.touch : undefined,
        justifyContent: "center",
        borderRadius: radius.round,
        borderWidth: 1.5,
        borderColor: selected ? colors.accent : colors.line,
        backgroundColor: selected ? colors.accentSoft : colors.surface,
      }}
    >
      <Text
        variant="small"
        style={{
          fontFamily: fonts.extraBold,
          color: selected ? colors.accent : colors.inkSecondary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function StatTile({
  value,
  label,
  color,
}: {
  value: string | number;
  label: string;
  color?: string;
}) {
  const { colors } = useTheme();
  return (
    <Card
      style={{
        flex: 1,
        minWidth: 0,
        padding: space.ml,
        borderRadius: radius.option,
      }}
    >
      <Text variant="heading" style={{ color: color ?? colors.ink }}>
        {value}
      </Text>
      <Text variant="small" muted>
        {label}
      </Text>
    </Card>
  );
}
export function Pill({
  value,
  kind = "streak",
}: {
  value: string | number;
  kind?: "streak" | "xp";
}) {
  const { colors } = useTheme();
  const color = kind === "streak" ? colors.streakText : colors.accent;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space.micro,
        paddingVertical: 7,
        paddingHorizontal: space.m,
        borderRadius: radius.small,
        backgroundColor:
          kind === "streak" ? colors.streakBg : colors.accentSoft,
      }}
    >
      <Icon
        name={kind === "streak" ? "flame" : "xp"}
        size={16}
        color={kind === "streak" ? colors.streakIcon : colors.accent}
      />
      <Text variant="bodySmall" style={{ color, fontFamily: fonts.black }}>
        {value}
      </Text>
    </View>
  );
}
export function Input({ style, multiline, ...props }: TextInputProps) {
  const { colors } = useTheme();
  return (
    <TextInput
      {...props}
      multiline={multiline}
      placeholderTextColor={colors.muted}
      selectionColor={colors.accent}
      style={[
        type.body,
        {
          color: colors.ink,
          minHeight: size.input,
          borderRadius: radius.button,
          borderWidth: 1.5,
          borderColor: colors.line,
          backgroundColor: colors.surface,
          paddingHorizontal: space.lg,
          paddingVertical: space.md,
          textAlignVertical: multiline ? "top" : "center",
        },
        style,
      ]}
    />
  );
}
export function StateView({
  kind = "empty",
  title,
  message,
  action,
  onAction,
}: {
  kind?: "loading" | "empty" | "error";
  title: string;
  message?: string;
  action?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        flex: 1,
        padding: space.page,
        gap: space.lg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {kind === "loading" ? (
        <ActivityIndicator color={colors.accent} size="large" />
      ) : (
        <Mascot mood={kind === "error" ? "sad" : "thinking"} />
      )}
      <Text variant="heading" style={{ textAlign: "center" }}>
        {title}
      </Text>
      {message && (
        <Text muted style={{ textAlign: "center" }}>
          {message}
        </Text>
      )}
      {action && onAction && (
        <SecondaryButton label={action} onPress={onAction} />
      )}
    </View>
  );
}
export function InlineError({ message }: { message?: string | null }) {
  const { colors } = useTheme();
  return message ? (
    <View
      accessibilityRole="alert"
      style={{
        padding: space.md,
        borderRadius: radius.control,
        backgroundColor: colors.streakBg,
      }}
    >
      <Text variant="caption" style={{ color: colors.streakText }}>
        {message}
      </Text>
    </View>
  ) : null;
}
export function MotifBox({ children }: ViewProps) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: size.secondary,
        height: size.secondary,
        borderRadius: radius.button,
        backgroundColor: colors.accentSoft,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </View>
  );
}
export function RowIcon({ name, label }: { name: IconName; label: string }) {
  return (
    <View style={layout.row}>
      <Icon name={name} />
      <Text>{label}</Text>
    </View>
  );
}
