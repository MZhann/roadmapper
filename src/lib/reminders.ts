import { Platform } from "react-native";
export async function setDailyReminder(time: string | null): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const notifications = await import("expo-notifications");
  if (!time) {
    await notifications.cancelScheduledNotificationAsync("milo-daily");
    return true;
  }
  if (Platform.OS === "android")
    await notifications.setNotificationChannelAsync("practice", {
      name: "Daily practice",
      importance: notifications.AndroidImportance.DEFAULT,
    });
  let permission = await notifications.getPermissionsAsync();
  if (!permission.granted)
    permission = await notifications.requestPermissionsAsync();
  if (!permission.granted) return false;
  const [hour, minute] = time.split(":").map(Number);
  await notifications.scheduleNotificationAsync({
    identifier: "milo-daily",
    content: {
      title: "Your next small step",
      body: "A little progress today. Your path is waiting.",
      data: { url: "/" },
    },
    trigger: {
      type: notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: "practice",
    },
  });
  return true;
}
