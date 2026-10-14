import { useState } from "react";
import { Pressable, View } from "react-native";
import type { Plan } from "@/domain/schema";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, space } from "@/theme/tokens";
import { Text } from "./Text";
import { Icon } from "./Icon";
import { layout } from "./Primitives";
export function PlanUnits({ plan }: { plan: Plan }) {
  const [open, setOpen] = useState<number | null>(0);
  const { colors } = useTheme();
  return (
    <View style={{ gap: space.m }}>
      {plan.units.map((unit, index) => (
        <View
          key={index}
          style={{
            borderWidth: 1,
            borderColor: colors.line,
            borderRadius: radius.option,
            backgroundColor: colors.surface,
            overflow: "hidden",
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: open === index }}
            onPress={() => setOpen(open === index ? null : index)}
            style={[
              layout.row,
              { paddingVertical: space.ml, paddingHorizontal: space.lg },
            ]}
          >
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: radius.tag,
                backgroundColor: colors.inset,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="caption">{index + 1}</Text>
            </View>
            <View style={layout.flex}>
              <Text variant="card">{unit.title}</Text>
              <Text variant="small" muted>
                {unit.steps.length} steps · days {unit.steps[0].day}–
                {unit.steps.at(-1)!.day}
              </Text>
            </View>
            <Icon
              name={open === index ? "up" : "down"}
              size={18}
              color={colors.muted}
            />
          </Pressable>
          {open === index && (
            <View
              style={{
                paddingLeft: 58,
                paddingRight: space.lg,
                paddingBottom: space.ml,
                gap: space.s,
              }}
            >
              {unit.steps.map((step, i) => (
                <View key={i} style={{ flexDirection: "row", gap: space.s }}>
                  <Text variant="caption" muted>
                    D{step.day}
                  </Text>
                  <Text variant="caption" style={layout.flex}>
                    {step.title}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}
