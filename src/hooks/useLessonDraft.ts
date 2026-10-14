import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";
const schema = z.object({
  note: z.string().max(10000),
  checks: z.record(z.string(), z.boolean()),
  answers: z.record(z.string(), z.number().int()),
});
export type LessonDraft = z.infer<typeof schema>;
const empty: LessonDraft = { note: "", checks: {}, answers: {} };
export function useLessonDraft(userId: string, stepId: string) {
  const key = `milo.lesson.${userId}.${stepId}`;
  const [record, setRecord] = useState<{ key: string; value: LessonDraft }>();
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    void AsyncStorage.getItem(key)
      .then((raw) => {
        const result = raw ? schema.safeParse(JSON.parse(raw)) : null;
        if (alive)
          setRecord({ key, value: result?.success ? result.data : empty });
      })
      .catch(() => {
        if (alive) {
          setError(
            "Couldn’t restore your local notes. Please check your device storage.",
          );
          setRecord({ key, value: empty });
        }
      });
    return () => {
      alive = false;
    };
  }, [key]);
  const value = record?.key === key ? record.value : empty;
  const update = async (next: LessonDraft) => {
    setRecord({ key, value: next });
    try {
      await AsyncStorage.setItem(key, JSON.stringify(next));
      setError("");
    } catch {
      setError(
        "Your edits are on this screen but could not be saved locally. Keep it open until you finish.",
      );
    }
  };
  const clear = () => AsyncStorage.removeItem(key);
  return { value, update, clear, loading: record?.key !== key, error };
}
