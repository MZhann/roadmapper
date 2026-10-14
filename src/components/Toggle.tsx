import { Pressable, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, size, space } from "@/theme/tokens";
import { haptic } from "@/lib/haptics";
export function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      aria-checked={value}
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => {
        haptic("selection");
        onChange(!value);
      }}
      style={{
        minHeight: size.touch,
        justifyContent: "center",
        minWidth: size.secondary,
      }}
    >
      <View
        style={{
          height: 32,
          width: 52,
          borderRadius: radius.button,
          backgroundColor: value ? colors.accent : colors.lockedNodeShadow,
          justifyContent: "center",
          padding: space.dot,
          alignItems: value ? "flex-end" : "flex-start",
        }}
      >
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: radius.round,
            backgroundColor: colors.white,
          }}
        />
      </View>
    </Pressable>
  );
}
