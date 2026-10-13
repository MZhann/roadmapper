import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
export function haptic(kind: 'light' | 'selection' | 'success' = 'light') {
  if (Platform.OS === 'web') return;
  const task = kind === 'selection' ? Haptics.selectionAsync() : kind === 'success' ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  void task.catch(() => {});
}
