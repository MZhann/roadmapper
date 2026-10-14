import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, size, space } from "@/theme/tokens";
import { haptic } from "@/lib/haptics";
import { Text } from "./Text";
import { Icon } from "./Icon";
export function OptionCard({
  title,
  description,
  selected,
  onPress,
  radio = true,
  multiple = false,
  disabled = false,
  style,
}: {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  radio?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const border = selected ? colors.accent : colors.line;
  return (
    <View
      style={[
        {
          borderRadius: radius.option,
          backgroundColor: border,
          paddingBottom: space.dot,
        },
        style,
      ]}
    >
      <Pressable
        accessibilityRole={multiple ? "checkbox" : radio ? "radio" : "button"}
        aria-checked={radio || multiple ? selected : undefined}
        accessibilityState={{
          checked: radio || multiple ? selected : undefined,
          disabled,
        }}
        disabled={disabled}
        onPress={() => {
          haptic("selection");
          onPress();
        }}
        style={({ pressed }) => ({
          minHeight: size.touch,
          flexDirection: "row",
          gap: space.ml,
          paddingVertical: space.ml,
          paddingHorizontal: space.lg,
          borderRadius: radius.option,
          borderWidth: selected ? 2 : 1.5,
          borderColor: border,
          backgroundColor: selected ? colors.accentSoft : colors.surface,
          transform: [{ translateY: pressed ? 2 : 0 }],
        })}
      >
        {radio && (
          <View
            style={{
              width: size.radio,
              height: size.radio,
              borderRadius: multiple ? radius.xs : radius.round,
              borderWidth: multiple ? 2 : selected ? 7 : 2,
              borderColor: selected ? colors.accent : colors.pathDash,
              backgroundColor: selected
                ? multiple
                  ? colors.accent
                  : colors.white
                : colors.transparent,
              alignSelf: "center",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {multiple && selected && (
              <Icon name="check" size={16} color={colors.onAccent} />
            )}
          </View>
        )}
        <View style={{ flex: 1, gap: space.xxs }}>
          <Text variant={radio ? "card" : "unit"}>{title}</Text>
          {description && (
            <Text variant={radio ? "caption" : "small"} muted>
              {description}
            </Text>
          )}
        </View>
      </Pressable>
    </View>
  );
}
