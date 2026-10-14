import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "./supabase";
import { setDailyReminder } from "./reminders";
export async function clearLocalAccount(userId: string) {
  const keys = await AsyncStorage.getAllKeys();
  const owned = keys.filter(
    (key) =>
      key === `milo.draft.${userId}` ||
      key.startsWith(`milo.lesson.${userId}.`),
  );
  if (owned.length) await AsyncStorage.multiRemove(owned);
  await setDailyReminder(null);
}
export async function signOut(userId: string) {
  // A failed reminder cancellation must not prevent ending the session.
  try {
    await clearLocalAccount(userId);
  } finally {
    const { error } = await db().auth.signOut();
    if (error) throw error;
  }
}
export async function deleteAccount(userId: string) {
  const { data, error } = await db().functions.invoke("milo-account", {
    body: { confirmation: "DELETE" },
  });
  if (error || !data?.deleted)
    throw new Error(
      data?.error ??
        "Could not delete the account. Your data has not been confirmed deleted; please retry.",
    );
  try {
    await clearLocalAccount(userId);
  } finally {
    await db().auth.signOut({ scope: "local" });
  }
}
