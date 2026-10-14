import { ActivityIndicator, Pressable } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, size } from "@/theme/tokens";
import { Icon } from "./Icon";
export function SendButton({
  onPress,
  disabled,
  loading,
  label = "Send change request",
}: {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{
        disabled: !!disabled || !!loading,
        busy: !!loading,
      }}
      disabled={disabled || loading}
      onPress={onPress}
      style={{
        width: size.touch,
        height: size.touch,
        borderRadius: radius.small,
        backgroundColor: colors.ink,
        opacity: disabled ? 0.55 : 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {loading ? (
        <ActivityIndicator color={colors.background} />
      ) : (
        <Icon name="up" size={18} color={colors.background} />
      )}
    </Pressable>
  );
}
