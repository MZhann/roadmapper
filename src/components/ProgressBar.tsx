import { View } from "react-native";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "@/theme/ThemeProvider";
import { motion, radius, space } from "@/theme/tokens";
import { Text } from "./Text";
export const clampProgress = (value: number) =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
function Fill({
  value,
  height,
  color,
}: {
  value: number;
  height: number;
  color: string;
}) {
  const reduced = useReducedMotion();
  const width = useSharedValue(value);
  useEffect(() => {
    width.set(
      reduced ? value : withTiming(value, { duration: motion.transition }),
    );
  }, [value, reduced, width]);
  const animated = useAnimatedStyle(() => ({
    width: `${width.get() * 100}%` as `${number}%`,
  }));
  return (
    <Animated.View
      style={[
        { height, borderRadius: radius.xs, backgroundColor: color },
        animated,
      ]}
    />
  );
}
export function ProgressBar({
  value,
  height = 10,
  segments,
  label = "Progress",
  color,
}: {
  value: number;
  height?: number;
  segments?: number;
  label?: string;
  color?: string;
}) {
  const { colors } = useTheme();
  const progress = clampProgress(value);
  return (
    <View
      accessibilityRole="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      style={{ flexDirection: "row", gap: space.xs }}
    >
      {segments ? (
        Array.from({ length: segments }, (_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height,
              borderRadius: radius.xs,
              overflow: "hidden",
              backgroundColor: colors.line,
            }}
          >
            <Fill
              value={clampProgress(progress * segments - i)}
              height={height}
              color={color ?? colors.accent}
            />
          </View>
        ))
      ) : (
        <View
          style={{
            height,
            flex: 1,
            overflow: "hidden",
            borderRadius: radius.xs,
            backgroundColor: colors.line,
          }}
        >
          <Fill
            value={progress}
            height={height}
            color={color ?? colors.accent}
          />
        </View>
      )}
    </View>
  );
}
export function ProgressRing({ value }: { value: number }) {
  const { colors } = useTheme();
  const progress = clampProgress(value);
  const circumference = 2 * Math.PI * 22;
  return (
    <View
      style={{
        width: 52,
        height: 52,
        alignItems: "center",
        justifyContent: "center",
      }}
      accessibilityLabel={`${Math.round(progress * 100)} percent complete`}
    >
      <Svg width={52} height={52} style={{ position: "absolute" }}>
        <Circle
          cx={26}
          cy={26}
          r={22}
          fill="none"
          stroke={colors.lockedNode}
          strokeWidth={5}
        />
        <Circle
          cx={26}
          cy={26}
          r={22}
          fill="none"
          stroke={colors.accent}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${circumference * progress} ${circumference}`}
          transform="rotate(-90 26 26)"
        />
      </Svg>
      <Text variant="small">{Math.round(progress * 100)}%</Text>
    </View>
  );
}
