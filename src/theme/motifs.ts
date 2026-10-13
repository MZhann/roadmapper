import type { ThemeId } from '@/domain/schema';
export const motifs: Record<ThemeId, { label: string; path: string }> = {
  languages_learning: { label: 'Languages & Learning', path: 'M4 5h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM18 9h2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v3l-3-3h-3' },
  sports_movement: { label: 'Sports & Movement', path: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 7l4 3-1.5 4.5h-5L8 10zM12 7V3M16 10l4.5-1.5M14.5 14.5l2.5 4M9.5 14.5L7 18.5M8 10L3.5 8.5' },
  money_business: { label: 'Money & Business', path: 'M3 7a7 3 0 1 0 14 0a7 3 0 1 0-14 0M3 7v5c0 1.66 3.13 3 7 3M17 7v3M9 15a6 2.6 0 1 0 12 0a6 2.6 0 1 0-12 0M9 15v3.5c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6V15' },
  art_creativity: { label: 'Art & Creativity', path: 'M12 3a9 9 0 1 0 0 18c1.4 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8zM7.5 11.5h0M10 7.5h0M15 7.5h0' },
  technology: { label: 'Technology', path: 'M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16' },
  life_wellbeing: { label: 'Life & Wellbeing', path: 'M5 19c0-8 5-14 15-15-1 10-7 15-15 15zM5 19l8-8' },
  general_adventure: { label: 'General Adventure', path: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM15.5 8.5l-2 5-5 2 2-5z' },
};
