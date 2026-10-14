import { useEffect } from "react";
import { View } from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { MappingArt } from "@/components/MappingArt";
import { Mascot } from "@/components/Mascot";
import { StateView, layout } from "@/components/Primitives";
import { Icon } from "@/components/Icon";
import { TextButton } from "@/components/Buttons";
import { useDraft } from "@/providers/DraftProvider";
import { plan } from "@/lib/planner";
import { go, replace } from "@/lib/navigation";
import { errorMessage } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, space } from "@/theme/tokens";
export default function Generating() {
  const { draft, save } = useDraft();
  const { colors } = useTheme();
  const generated = useQuery({
    queryKey: ["generate", draft!.id, draft!.revision],
    queryFn: () => plan(draft!),
    initialData: draft!.plan ?? undefined,
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000,
    retry: false,
  });
  const persist = useMutation({
    mutationFn: async () => {
      await save({ ...draft!, plan: generated.data! });
      replace("/goal/new/review");
    },
  });
  const { mutate } = persist;
  useEffect(() => {
    if (generated.data) mutate();
  }, [generated.data, mutate]);
  if (generated.isError || persist.isError)
    return (
      <Screen>
        <StateView
          kind="error"
          title="Your draft is safe"
          message={errorMessage(generated.error ?? persist.error)}
          action="Try again"
          onAction={() => {
            if (generated.isError) void generated.refetch();
            else persist.mutate();
          }}
        />
        <TextButton
          label="Back to my answers"
          onPress={() => go("/goal/new/questions")}
        />
      </Screen>
    );
  return (
    <Screen
      style={{
        alignItems: "center",
        paddingHorizontal: space.block,
        paddingTop: 120,
      }}
    >
      <View>
        <MappingArt />
        <View style={{ position: "absolute", right: 0, bottom: 0 }}>
          <Mascot size={64} mood="thinking" />
        </View>
      </View>
      <Text
        variant="lesson"
        style={{
          textAlign: "center",
          marginTop: space.hero,
          marginBottom: space.s,
        }}
      >
        Mapping your path
      </Text>
      <Text muted style={{ textAlign: "center" }}>
        This can take a minute or two. You can review and change everything
        next.
      </Text>
      <View
        accessibilityLiveRegion="polite"
        style={{ width: "100%", gap: space.ml, marginTop: space.hero }}
      >
        {[
          "Understood your goal",
          `Sized to ${draft!.days} days × ${draft!.minutes} min`,
          "Splitting into units and steps",
          "Writing your lessons",
        ].map((label, i) => (
          <View key={label} style={layout.row}>
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: radius.round,
                backgroundColor: i < 2 ? colors.accent : colors.transparent,
                borderWidth: i < 2 ? 0 : 2,
                borderColor: i === 2 ? colors.accent : colors.lockedNodeShadow,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {i < 2 && <Icon name="check" size={14} color={colors.onAccent} />}
            </View>
            <Text
              style={{
                flex: 1,
                color:
                  i === 3
                    ? colors.lockedIcon
                    : i === 2
                      ? colors.accent
                      : colors.ink,
              }}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>
      <TextButton
        label="Save draft and return home"
        muted
        onPress={() => go("/")}
      />
    </Screen>
  );
}
