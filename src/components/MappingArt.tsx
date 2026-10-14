import { useEffect } from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon } from "./Icon";
import { radius } from "@/theme/tokens";
const AnimatedPath = Animated.createAnimatedComponent(Path);
export function MappingArt() {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const offset = useSharedValue(0);
  useEffect(() => {
    if (reduced) offset.set(0);
    else {
      offset.set(520);
      offset.set(withRepeat(withTiming(0, { duration: 2400 }), -1, true));
    }
    return () => cancelAnimation(offset);
  }, [offset, reduced]);
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: offset.get(),
  }));
  const path = "M50 190 C 50 130, 170 150, 170 100 S 70 70, 110 24";
  return (
    <View style={{ width: 220, height: 220 }}>
      <Svg width={220} height={220} viewBox="0 0 220 220" aria-hidden>
        <Path
          d={path}
          stroke={colors.line}
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
        />
        <AnimatedPath
          d={path}
          stroke={colors.accent}
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
          strokeDasharray="520"
          animatedProps={animatedProps}
        />
      </Svg>
      <View
        style={{
          position: "absolute",
          left: 92,
          top: 4,
          width: 36,
          height: 36,
          borderRadius: radius.round,
          backgroundColor: colors.surface,
          borderWidth: 3,
          borderColor: colors.accent,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="flag" size={16} color={colors.accent} />
      </View>
    </View>
  );
}
