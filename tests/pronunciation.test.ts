import test from "node:test";
import assert from "node:assert/strict";
import { speechLanguage, speechVoice } from "../src/domain/pronunciation";
test("normalizes common AI language names and Japanese aliases", () => {
  for (const language of ["Japanese", "日本語", "jp", "ja", "ja_JP", "ja-JP"])
    assert.equal(speechLanguage(language, "こんにちは"), "ja-JP");
  assert.equal(speechLanguage("", "こんにちは"), "ja-JP");
  assert.equal(speechLanguage("Spanish", "hola"), "es-ES");
  assert.throws(
    () => speechLanguage("unknown", "hello"),
    /valid pronunciation language/,
  );
});
test("selects the requested language instead of falling back to an English voice", () => {
  const voices = [
    { language: "en-US", identifier: "english", quality: "Enhanced" },
    { language: "ja-JP", identifier: "japanese", quality: "Default" },
  ];
  assert.equal(speechVoice(voices, "ja-JP")?.identifier, "japanese");
  assert.equal(speechVoice(voices, "ko-KR"), undefined);
});
