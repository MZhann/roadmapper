import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, space } from "@/theme/tokens";
import { Icon } from "./Icon";
import { Text } from "./Text";
import { Mascot } from "./Mascot";
export function WelcomeArt({ compact = false }: { compact?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={{ width: 342, height: compact ? 240 : 380, alignSelf: "center" }}
      aria-hidden
    >
      <Svg
        width={342}
        height={compact ? 240 : 380}
        viewBox={compact ? "0 0 342 240" : "0 0 342 380"}
        style={{ position: "absolute" }}
      >
        <Path
          d={
            compact
              ? "M110 30 C 240 50, 250 110, 170 130 S 90 200, 200 220"
              : "M90 40 C 250 60, 260 130, 200 170 S 70 250, 150 330"
          }
          stroke={colors.lockedNodeShadow}
          strokeWidth={3}
          strokeDasharray="2 10"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      {(compact
        ? [
            { x: 84, y: 4, size: 52 },
            { x: 140, y: 100, size: 62 },
            { x: 176, y: 190, size: 52 },
          ]
        : [
            { x: 62, y: 14, size: 56 },
            { x: 172, y: 138, size: 68 },
            { x: 122, y: 302, size: 56 },
          ]
      ).map((node, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: node.x,
            top: node.y,
            width: node.size,
            height: node.size,
            borderRadius: radius.round,
            backgroundColor:
              i === 0 ? colors.accentDeep : colors.lockedNodeShadow,
            transform: [{ translateY: 5 }],
          }}
        >
          <View
            style={{
              width: node.size,
              height: node.size,
              borderRadius: radius.round,
              backgroundColor:
                i === 0
                  ? colors.accent
                  : i === 1
                    ? colors.surface
                    : colors.lockedNode,
              borderColor: colors.accent,
              borderWidth: i === 1 ? 3 : 0,
              transform: [{ translateY: -5 }],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name={i === 0 ? "check" : i === 1 ? "star" : "mountain"}
              color={
                i === 0
                  ? colors.white
                  : i === 1
                    ? colors.accent
                    : colors.lockedIcon
              }
              size={i === 1 ? 26 : 24}
            />
          </View>
        </View>
      ))}
      {!compact && (
        <>
          <View
            style={{
              position: "absolute",
              left: 196,
              top: 34,
              borderWidth: 1,
              borderColor: colors.line,
              borderRadius: radius.small,
              paddingVertical: space.s,
              paddingHorizontal: space.md,
              backgroundColor: colors.surface,
            }}
          >
            <Text variant="small" muted>
              Day 1 · done
            </Text>
          </View>
          <View style={{ position: "absolute", right: 24, top: 280 }}>
            <Mascot size={64} />
          </View>
        </>
      )}
    </View>
  );
}
