import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { size, space } from "@/theme/tokens";
import { Text } from "./Text";
import { Icon } from "./Icon";
export type Tab = "path" | "journal" | "profile";
export function TabBar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tablist"
      style={{
        minHeight: Math.max(size.tabBar, 54 + insets.bottom),
        paddingBottom: insets.bottom,
        paddingTop: space.m,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderColor: colors.line,
        flexDirection: "row",
        justifyContent: "space-around",
      }}
    >
      {(["path", "journal", "profile"] as const).map((tab) => (
        <Pressable
          key={tab}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === tab }}
          onPress={() => onChange(tab)}
          style={{
            minWidth: 64,
            minHeight: size.touch,
            alignItems: "center",
            gap: space.dot,
          }}
        >
          <Icon
            name={tab}
            color={active === tab ? colors.accent : colors.muted}
          />
          <Text
            variant="tab"
            style={{ color: active === tab ? colors.accent : colors.muted }}
          >
            {tab === "path"
              ? "Path"
              : tab === "journal"
                ? "Journal"
                : "Profile"}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
