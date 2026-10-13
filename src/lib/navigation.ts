import { router, type Href } from 'expo-router';
export const go = (path: string) => router.push(path as Href);
export const replace = (path: string) => router.replace(path as Href);
export const back = (fallback = '/') => router.canGoBack() ? router.back() : replace(fallback);
export const goalPath = (id: string) => `/goal/${encodeURIComponent(id)}`;
export const stepPath = (goalId: string, stepId: string) => `${goalPath(goalId)}/step/${encodeURIComponent(stepId)}`;
