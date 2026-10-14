/** Calendar dates stay local: converting midnight to UTC can change the day. */
export function dateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) && dateValue(date) === value
    ? date
    : null;
}
export function addDays(value: string, days: number) {
  const date = parseDate(value);
  if (!date) throw new Error("Choose a valid date.");
  date.setDate(date.getDate() + days);
  return dateValue(date);
}
export function daysUntil(value: string, from = dateValue(new Date())) {
  if (!parseDate(value) || !parseDate(from))
    throw new Error("Choose a valid date.");
  return (
    Math.round(
      (Date.parse(`${value}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
        86400000,
    ) + 1
  );
}
export function timeValue(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
export function parseTime(value: string): Date | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const date = new Date();
  const [hour, minute] = value.split(":").map(Number);
  date.setHours(hour, minute, 0, 0);
  return date;
}
export function displayDateTime(value: string, mode: "date" | "time") {
  const date = mode === "date" ? parseDate(value) : parseTime(value);
  if (!date) return "";
  return mode === "date"
    ? date.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
}
