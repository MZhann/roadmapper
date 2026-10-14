/** Design fixtures are used only by explicitly requested development previews. */
import type { Goal, ThemeId } from "@/domain/schema";
export function previewGoal(theme: ThemeId = "languages_learning"): Goal {
  const sports = theme === "sports_movement";
  const titles = sports
    ? [
        "Two-ball exchange",
        "Rhythm drill",
        "First 3-ball flash",
        "Five catches in a row",
        "Ten catches in a row",
        "Film a 30-second run",
      ]
    : [
        "Counting yen",
        "Asking “how much?”",
        "Ordering at a restaurant",
        "Allergies & preferences",
        "Convenience store run",
        "Unit check: café role-play",
      ];
  return {
    id: "preview",
    user_id: "preview",
    title: sports ? "Juggle three balls" : "Japanese for your trip",
    prompt: "Design preview",
    summary: "Small daily steps toward your goal.",
    theme_id: theme,
    deadline: "2026-11-12",
    daily_minutes: 20,
    status: "active",
    created_at: "2026-09-01T00:00:00Z",
    units: [
      {
        id: "preview-unit",
        goal_id: "preview",
        idx: 1,
        title: sports ? "Three-ball cascade" : "Food & shopping",
        steps: titles.map((title, idx) => ({
          id: `preview-${idx}`,
          unit_id: "preview-unit",
          idx,
          title,
          minutes: 20,
          xp: 20,
          content: [
            {
              type: "text",
              text: "Practice one small skill, then reflect on what you learned.",
            },
            {
              type: "task",
              text: "Spend 15 minutes on focused practice. Try it three times and notice what improves.",
            },
          ],
          status: idx < 2 ? "done" : "pending",
          unlock_date: null,
          completed_at: idx < 2 ? "2026-10-12T12:00:00Z" : null,
        })),
      },
    ],
  };
}
