import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";
import { db } from "@/lib/supabase";
import { storyBucket } from "@/lib/photos";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, space } from "@/theme/tokens";
import { Text } from "./Text";
import { TextButton } from "./Buttons";
export function StoryPhoto({ path }: { path: string }) {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  const photo = useQuery({
    queryKey: ["photo", path],
    queryFn: async () => {
      const { data, error } = await db()
        .storage.from(storyBucket)
        .createSignedUrl(path, 3600);
      if (error) throw error;
      return data.signedUrl;
    },
    staleTime: 45 * 60 * 1000,
  });
  if (photo.isPending || photo.isError || failed)
    return (
      <View
        style={{
          minHeight: 84,
          padding: space.md,
          borderRadius: radius.control,
          backgroundColor: colors.lockedNode,
          alignItems: "center",
        }}
      >
        <Text variant="small" muted>
          {photo.isPending ? "Loading photo…" : "Photo unavailable"}
        </Text>
        {!photo.isPending && (
          <TextButton
            label="Reload photo"
            onPress={() => {
              setFailed(false);
              void photo.refetch();
            }}
          />
        )}
      </View>
    );
  return (
    <Image
      source={{ uri: photo.data }}
      accessibilityLabel="Photo saved with this step"
      style={{ height: 180, width: "100%", borderRadius: radius.control }}
      contentFit="cover"
      onError={() => setFailed(true)}
    />
  );
}
