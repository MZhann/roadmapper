const plan = {
  title: "Speak Japanese in Japan",
  summary:
    "A practical path from first sounds to everyday conversations, built for your trip.",
  theme_id: "languages_learning",
  days: 30,
  daily_minutes: 20,
  units: [
    {
      title: "First words & sounds",
      steps: [
        {
          title: "Say your first words",
          minutes: 5,
          xp: 20,
          day: 1,
          content: [
            { type: "text", text: "A small start: greet someone politely." },
            { type: "task", text: "Say hello three times." },
          ],
        },
        {
          title: "Introduce yourself",
          minutes: 5,
          xp: 20,
          day: 1,
          content: [
            { type: "text", text: "Use watashi wa followed by your name." },
            { type: "task", text: "Introduce yourself aloud." },
          ],
        },
        {
          title: "Say hello, thank you, sorry",
          minutes: 10,
          xp: 20,
          day: 1,
          content: [
            {
              type: "text",
              text: "Three phrases cover a surprising amount of your first day in Japan. Say each one out loud.",
            },
            {
              type: "phrase",
              text: "こんにちは",
              romanization: "Konnichiwa",
              translation: "Hello / Good afternoon",
              language: "ja-JP",
            },
            {
              type: "phrase",
              text: "ありがとうございます",
              romanization: "Arigatō gozaimasu",
              translation: "Thank you (polite)",
              language: "ja-JP",
            },
            {
              type: "phrase",
              text: "すみません",
              romanization: "Sumimasen",
              translation: "Excuse me / Sorry",
              language: "ja-JP",
            },
            {
              type: "tip",
              text: "Sumimasen is your superpower. Use it to get attention, squeeze past someone, or say sorry.",
            },
            {
              type: "task",
              text: "Say each phrase three times. Then close your eyes and say all three from memory.",
            },
          ],
        },
        {
          title: "Your first conversation",
          minutes: 15,
          xp: 20,
          day: 2,
          content: [
            {
              type: "quiz",
              question: "How do you get someone’s attention politely?",
              options: ["Sumimasen", "Konnichiwa"],
              answer: 0,
              explanation: "Sumimasen means excuse me.",
            },
          ],
        },
      ],
    },
    {
      title: "Food, drinks & shops",
      steps: [
        {
          title: "Order your first meal",
          minutes: 15,
          xp: 25,
          day: 3,
          content: [
            {
              type: "text",
              text: "Point to an item and say kore o kudasai: this one, please.",
            },
            {
              type: "checklist",
              items: ["Ask for an item", "Thank the server"],
            },
          ],
        },
      ],
    },
  ],
};
const clarification = {
  title: "Speak simple Japanese before my Japan trip",
  theme_id: plan.theme_id,
  questions: [
    {
      id: "experience",
      kind: "choice",
      question: "How much Japanese do you know?",
      why: "So we skip what you already know — or start from zero.",
      options: [
        {
          label: "Nothing yet",
          description: "Start from the very first sound",
          value: "none",
        },
        {
          label: "A few words",
          description: "Hello, thank you, sorry",
          value: "words",
        },
        {
          label: "I can read kana",
          description: "Hiragana and katakana",
          value: "kana",
        },
        {
          label: "Basic sentences",
          description: "Around JLPT N5",
          value: "basic",
        },
      ],
    },
  ],
};
const reality = {
  unrealistic: true,
  title: "One day is tight if you've never coded.",
  explanation:
    "In a day you can write a first working script. To code comfortably on your own, about a month at 30 min a day is more realistic.",
  requested_days: 1,
  recommended_days: 30,
  daily_minutes: 30,
  achievable_scope: "Your first working script",
};
const draft = {
  id: "22222222-2222-4222-8222-222222222222",
  prompt:
    "I'm going to visit Japan next month. I want to speak Japanese well enough to ask and answer simple questions.",
  minutes: 20,
  days: 30,
  answers: { experience: "none" },
  clarification,
  reality,
  plan,
  acceptStretch: false,
  revision: 0,
};
const goalId = "33333333-3333-4333-8333-333333333333";
const goal = {
  id: goalId,
  user_id: "11111111-1111-4111-8111-111111111111",
  title: plan.title,
  prompt: draft.prompt,
  summary: plan.summary,
  theme_id: plan.theme_id,
  daily_minutes: 20,
  deadline: "2026-11-12",
  status: "active",
  created_at: "2026-10-01T00:00:00Z",
  units: plan.units.map((u, ui) => ({
    id: `unit-${ui}`,
    goal_id: goalId,
    idx: ui + 1,
    title: u.title,
    steps: u.steps.map((s, i) => ({
      ...s,
      id: `step-${ui}-${i}`,
      unit_id: `unit-${ui}`,
      idx: i + 1,
      status: ui === 0 && i < 2 ? "done" : "pending",
      unlock_date: i < 3 ? "2026-10-01" : "2026-11-01",
      completed_at: ui === 0 && i < 2 ? new Date().toISOString() : null,
    })),
  })),
};
const notes = [
  "Ordered ramen at home in Japanese. “Okaikei” keeps slipping — wrote it on a sticky note.",
  "Numbers finally stick when I count my steps on walks.",
  "Learned the difference between “sumimasen” and “gomen”.",
].map((text, i) => ({
  id: `note-${i}`,
  step_id: `step-0-${2 - i}`,
  user_id: goal.user_id,
  text,
  photo_url: null,
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
  steps: {
    title: goal.units[0].steps[2 - i].title,
    idx: 3 - i,
    units: { goal_id: goal.id, goals: { title: goal.title } },
  },
}));
module.exports = { draft, plan, clarification, reality, goal, notes };
