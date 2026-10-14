import { useRef, useState } from "react";
import { View } from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { IconButton, PrimaryButton, TextButton } from "@/components/Buttons";
import { ProgressBar } from "@/components/ProgressBar";
import { OptionCard } from "@/components/OptionCard";
import { DateTimeField } from "@/components/DateTimeField";
import {
  Card,
  Input,
  InlineError,
  StateView,
  layout,
} from "@/components/Primitives";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import { useDraft } from "@/providers/DraftProvider";
import {
  answerText,
  emptyAnswer,
  type Draft,
  type QuestionAnswer,
} from "@/domain/draft";
import { addDays, dateValue, daysUntil, parseDate } from "@/domain/dateTime";
import { assess, clarify } from "@/lib/planner";
import { errorMessage } from "@/lib/supabase";
import { go } from "@/lib/navigation";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, space } from "@/theme/tokens";

export default function Questions() {
  const { draft, save } = useDraft();
  const { colors } = useTheme();
  const latest = useRef(draft!);
  const [storageError, setStorageError] = useState("");
  const clarification = useQuery({
    queryKey: ["clarify", draft!.id],
    queryFn: () => clarify(draft!),
    initialData: draft!.clarification ?? undefined,
    staleTime: Infinity,
    retry: false,
  });
  // Old saved drafts may contain a daily-budget question. It is no longer needed.
  const questions = (clarification.data?.questions ?? []).filter(
    (q) => q.kind !== "minutes",
  );
  const index = Math.min(
    draft!.questionIndex,
    Math.max(0, questions.length - 1),
  );
  const question = questions[index];
  const today = dateValue(new Date());
  const legacy = question ? draft!.answers[question.id] : "";
  const restored = emptyAnswer();
  if (legacy && question) {
    if (question.kind === "date") {
      restored.date = parseDate(legacy)
        ? legacy
        : /^\d+$/.test(legacy) && Number(legacy) <= 366
          ? addDays(today, Math.max(0, Number(legacy) - 1))
          : "";
    } else if (question.options.some((o) => o.value === legacy))
      restored.selected = [legacy];
    else {
      restored.custom = legacy;
      restored.customOpen = true;
    }
  }
  const answer = (question && draft!.questionAnswers[question.id]) || restored;
  const selected = answerText(answer);
  const persist = async (updated: Draft) => {
    latest.current = updated;
    await save(updated);
    setStorageError("");
  };
  const change = (patch: Partial<QuestionAnswer>) => {
    if (!question || next.isPending) return;
    const value = {
      ...(latest.current.questionAnswers[question.id] ?? answer),
      ...patch,
    };
    const updated = {
      ...latest.current,
      clarification: clarification.data!,
      plan: null,
      reality: null,
      revision: latest.current.revision + 1,
      questionAnswers: {
        ...latest.current.questionAnswers,
        [question.id]: value,
      },
      answers: { ...latest.current.answers, [question.id]: answerText(value) },
      ...(question.kind === "date" ? { targetDate: value.date || null } : {}),
    };
    void persist(updated).catch((error) =>
      setStorageError(errorMessage(error)),
    );
  };
  const move = async (position: number, close = false) => {
    if (next.isPending) return;
    try {
      await persist({
        ...latest.current,
        clarification: clarification.data!,
        questionIndex: position,
      });
      if (close) go("/");
    } catch (error) {
      setStorageError(errorMessage(error));
    }
  };
  const next = useMutation({
    mutationFn: async (skip: boolean) => {
      let updated = {
        ...latest.current,
        clarification: clarification.data!,
        plan: null,
        reality: null,
      };
      if (question) {
        const value = latest.current.questionAnswers[question.id] ?? answer;
        updated.answers = {
          ...updated.answers,
          [question.id]: skip
            ? "Choose a sensible default for me."
            : answerText(value),
        };
        if (question.kind === "date") {
          const days = value.date && !skip ? daysUntil(value.date) : 30;
          if (days < 1 || days > 366)
            throw new Error("Choose a date within the next year.");
          updated = {
            ...updated,
            days,
            targetDate: skip ? null : value.date || null,
          };
        }
      }
      if (index < questions.length - 1) {
        await persist({ ...updated, questionIndex: index + 1 });
        return;
      }
      await persist(updated);
      const reality = await assess(updated);
      await persist({
        ...updated,
        reality,
        days: reality.requested_days,
        minutes: reality.daily_minutes,
      });
      go(
        reality.unrealistic
          ? "/goal/new/reality-check"
          : "/goal/new/generating",
      );
    },
  });
  if (clarification.isPending)
    return (
      <Screen>
        <StateView
          kind="loading"
          title="Getting to know your goal"
          message="Milo is finding the few details that will shape your plan."
        />
      </Screen>
    );
  if (clarification.isError)
    return (
      <Screen>
        <StateView
          kind="error"
          title="Couldn’t prepare your questions"
          message={errorMessage(clarification.error)}
          action="Try again"
          onAction={() => void clarification.refetch()}
        />
        <TextButton label="Back to your goal" onPress={() => go("/")} />
      </Screen>
    );
  return (
    <Screen
      footer={
        <>
          <InlineError
            message={
              storageError || (next.error ? errorMessage(next.error) : null)
            }
          />
          <PrimaryButton
            label={index < questions.length - 1 ? "Continue" : "Build my plan"}
            loading={next.isPending}
            disabled={!!question && !selected.trim()}
            onPress={() => next.mutate(false)}
          />
          {index > 0 && (
            <TextButton
              label="Back to previous question"
              muted
              onPress={() => void move(index - 1)}
            />
          )}
          <TextButton
            label="Not sure — you decide"
            muted
            onPress={() => {
              if (!next.isPending) next.mutate(true);
            }}
          />
        </>
      }
    >
      <View style={[layout.row, { marginLeft: -space.m }]}>
        <IconButton
          name="close"
          label="Save draft and close"
          onPress={() => void move(index, true)}
        />
        <View style={layout.flex}>
          <ProgressBar
            value={questions.length ? (index + 1) / questions.length : 1}
            height={10}
            label="Question progress"
          />
        </View>
        <Text variant="caption" muted>
          {questions.length ? `${index + 1} of ${questions.length}` : "Ready"}
        </Text>
      </View>
      <Card
        style={[
          layout.row,
          {
            marginTop: space.page,
            paddingHorizontal: space.md,
            paddingVertical: space.m,
            borderRadius: radius.control,
            gap: space.m,
          },
        ]}
      >
        <Icon name="path" size={18} color={colors.accent} />
        <Text variant="caption" muted style={layout.flex}>
          {clarification.data.title}
        </Text>
      </Card>
      <View
        style={[
          layout.row,
          { marginTop: space.section, alignItems: "flex-start", gap: space.m },
        ]}
      >
        <Logo wordmark={false} size={36} />
        <View style={layout.flex}>
          <Text variant="heading" style={{ marginBottom: space.sm }}>
            {question?.question ?? "Your goal is clear."}
          </Text>
          <Text variant="bodySmall" muted>
            {question?.why ??
              "We have enough detail to map your path. Review the plan before you start."}
          </Text>
        </View>
      </View>
      {question && (
        <View style={{ gap: space.m, marginTop: space.page }}>
          {question.kind === "date" ? (
            <>
              <DateTimeField
                mode="date"
                label="Target date (optional)"
                value={answer.date}
                minimumDate={today}
                maximumDate={addDays(today, 365)}
                disabled={next.isPending}
                onChange={(date) =>
                  change({ date, selected: [], custom: "", customOpen: false })
                }
              />
              <OptionCard
                title="No target date"
                description="I’ll learn at my own pace"
                selected={
                  !answer.date && answer.selected.includes("No deadline")
                }
                disabled={next.isPending}
                onPress={() =>
                  change({
                    date: "",
                    selected: answer.selected.length ? [] : ["No deadline"],
                    custom: "",
                    customOpen: false,
                  })
                }
              />
              <Text variant="small" muted>
                A target helps shape your plan. It never limits how many steps
                you can complete.
              </Text>
            </>
          ) : (
            <>
              {question.options.length > 0 && (
                <Text variant="small" muted>
                  Choose all that apply. Tap again to deselect.
                </Text>
              )}
              {question.options.map((option) => (
                <OptionCard
                  key={option.value}
                  multiple
                  title={option.label}
                  description={option.description}
                  selected={answer.selected.includes(option.value)}
                  disabled={next.isPending}
                  onPress={() =>
                    change({
                      selected: answer.selected.includes(option.value)
                        ? answer.selected.filter((v) => v !== option.value)
                        : [...answer.selected, option.value],
                    })
                  }
                />
              ))}
              {(answer.customOpen || !question.options.length) && (
                <Input
                  accessibilityLabel="Your answer"
                  placeholder="Your answer"
                  value={answer.custom}
                  onChangeText={(custom) =>
                    change({ custom, customOpen: true })
                  }
                  multiline
                  maxLength={1000}
                  editable={!next.isPending}
                />
              )}
              {question.options.length > 0 && (
                <TextButton
                  label={
                    answer.customOpen
                      ? "Hide my own answer"
                      : "Write my own answer"
                  }
                  muted
                  onPress={() => change({ customOpen: !answer.customOpen })}
                />
              )}
            </>
          )}
        </View>
      )}
    </Screen>
  );
}
