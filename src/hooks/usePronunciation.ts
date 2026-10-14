import { useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import * as Speech from "expo-speech";
import { setAudioModeAsync, setIsAudioActiveAsync } from "expo-audio";
import { speechLanguage, speechVoice } from "@/domain/pronunciation";
import type { ContentBlock } from "@/domain/schema";
let playbackOwner: symbol | null = null;

export function usePronunciation() {
  const request = useRef(0);
  const active = useRef<number | null>(null);
  const owner = useRef<symbol | null>(null);
  const watchdog = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const stop = () => {
      request.current++;
      active.current = null;
      if (watchdog.current) clearTimeout(watchdog.current);
      if (playbackOwner === owner.current) {
        playbackOwner = null;
        void Speech.stop().catch(() => {});
        if (Platform.OS !== "web")
          void setIsAudioActiveAsync(false).catch(() => {});
      }
    };
    const listener = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        stop();
        setPlaying(null);
        setLoading(null);
      }
    });
    return () => {
      listener.remove();
      stop();
    };
  }, []);
  const speak = async (
    block: Extract<ContentBlock, { type: "phrase" }>,
    index: number,
  ) => {
    const stopping = active.current === index;
    const id = ++request.current;
    const token = Symbol("pronunciation");
    owner.current = token;
    playbackOwner = token;
    if (watchdog.current) clearTimeout(watchdog.current);
    active.current = stopping ? null : index;
    setPlaying(null);
    setLoading(stopping ? null : index);
    setError("");
    const finish = (message = "") => {
      if (request.current !== id) return;
      request.current++;
      if (watchdog.current) clearTimeout(watchdog.current);
      active.current = null;
      setPlaying(null);
      setLoading(null);
      setError(message);
      if (playbackOwner === token) {
        playbackOwner = null;
        if (message) void Speech.stop().catch(() => {});
        if (Platform.OS !== "web")
          void setIsAudioActiveAsync(false).catch(() => {});
      }
    };
    try {
      await Speech.stop();
      if (request.current !== id) return;
      if (stopping) {
        finish();
        return;
      }
      const language = speechLanguage(block.language, block.text);
      if (Platform.OS !== "web") {
        // iOS Speech otherwise uses an ambient session muted by the silent switch.
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
          shouldPlayInBackground: false,
          interruptionMode: "duckOthers",
        });
        if (request.current !== id) {
          if (!playbackOwner) void setIsAudioActiveAsync(false).catch(() => {});
          return;
        }
        await setIsAudioActiveAsync(true);
        if (request.current !== id) {
          if (!playbackOwner) void setIsAudioActiveAsync(false).catch(() => {});
          return;
        }
      }
      let voiceTimer: ReturnType<typeof setTimeout> | undefined;
      const voices = await Promise.race([
        Speech.getAvailableVoicesAsync(),
        new Promise<Speech.Voice[]>((resolve) => {
          voiceTimer = setTimeout(() => resolve([]), 3000);
        }),
      ]).finally(() => {
        if (voiceTimer) clearTimeout(voiceTimer);
      });
      if (request.current !== id) return;
      const voice = speechVoice(voices, language);
      if (voices.length && !voice)
        throw new Error(
          `Add a ${language} speech voice in your device settings, then try again.`,
        );
      watchdog.current = setTimeout(
        () =>
          finish(
            "Pronunciation didn’t start. Check your device’s speech voices, then try again.",
          ),
        8000,
      );
      Speech.speak(block.text, {
        language,
        voice: voice?.identifier,
        rate: 0.85,
        volume: 1,
        useApplicationAudioSession: true,
        onStart: () => {
          if (request.current === id) {
            if (watchdog.current) clearTimeout(watchdog.current);
            setLoading(null);
            setPlaying(index);
          }
        },
        onDone: () => finish(),
        onStopped: () => finish(),
        onError: () =>
          finish(
            "Couldn’t play pronunciation. Check media volume and your device’s speech voices, then try again.",
          ),
      });
    } catch (failure) {
      finish(
        failure instanceof Error
          ? failure.message
          : "Pronunciation is unavailable. Please try again.",
      );
    }
  };
  return { speak, playing, loading, error };
}
