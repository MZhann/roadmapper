import { type PropsWithChildren, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { size, space } from "@/theme/tokens";
export function Screen({
  children,
  footer,
  style,
  footerStyle,
  padded = true,
  top = true,
  wide = false,
}: PropsWithChildren<{
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
  footerStyle?: StyleProp<ViewStyle>;
  padded?: boolean;
  top?: boolean;
  wide?: boolean;
}>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View
        style={{
          flex: 1,
          width: "100%",
          maxWidth: wide ? undefined : size.mobileMax,
          alignSelf: "center",
        }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={[
            {
              flexGrow: 1,
              paddingTop: top
                ? Platform.OS === "web"
                  ? space.webTop
                  : insets.top + space.md
                : 0,
              paddingHorizontal: padded ? space.page : 0,
              paddingBottom: space.lg,
              backgroundColor: colors.background,
            },
            style,
          ]}
        >
          {children}
        </ScrollView>
        {footer && (
          <View
            style={[
              {
                paddingHorizontal: space.page,
                paddingTop: space.ml,
                paddingBottom: Math.max(insets.bottom, space.footer),
                gap: space.m,
                backgroundColor: colors.background,
              },
              footerStyle,
            ]}
          >
            {footer}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
