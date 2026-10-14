const aliases: Record<string, string> = {
  japanese: "ja-JP",
  jp: "ja-JP",
  ja: "ja-JP",
  日本語: "ja-JP",
  english: "en-US",
  korean: "ko-KR",
  chinese: "zh-CN",
  mandarin: "zh-CN",
  spanish: "es-ES",
  french: "fr-FR",
  german: "de-DE",
  italian: "it-IT",
  russian: "ru-RU",
  kazakh: "kk-KZ",
  arabic: "ar-SA",
  portuguese: "pt-PT",
};
export function speechLanguage(language: string, text: string) {
  const normalized = language.trim().replace(/_/g, "-");
  const alias = aliases[normalized.toLowerCase()];
  if (alias) return alias;
  if (/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(normalized)) return normalized;
  if (/[\u3040-\u30ff]/.test(text)) return "ja-JP";
  throw new Error(
    "This phrase needs a valid pronunciation language. Please adjust the lesson.",
  );
}
export function speechVoice<
  T extends { language: string; identifier: string; quality: string },
>(voices: T[], language: string) {
  const base = language.toLowerCase().split("-")[0];
  return [...voices]
    .filter((v) => v.language.toLowerCase().split(/[-_]/)[0] === base)
    .sort(
      (a, b) =>
        Number(b.language.toLowerCase() === language.toLowerCase()) -
          Number(a.language.toLowerCase() === language.toLowerCase()) ||
        Number(b.quality === "Enhanced") - Number(a.quality === "Enhanced"),
    )[0];
}
