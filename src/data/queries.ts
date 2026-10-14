import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import type { Goal, Note, Profile } from '@/domain/schema';
export async function fetchGoals(): Promise<Goal[]> { const { data, error } = await db().from('goals').select('*, units(*, steps(*))').neq('status', 'archived').order('created_at', { ascending: false }); if (error) throw error; return data as Goal[]; }
export async function fetchGoal(id: string): Promise<Goal | null> { const { data, error } = await db().from('goals').select('*, units(*, steps(*))').eq('id', id).maybeSingle(); if (error) throw error; return data as Goal | null; }
export function useGoals(enabled = true) { return useQuery({ queryKey: ['goals'], queryFn: fetchGoals, enabled }); }
export function useGoal(id: string, enabled = true) { return useQuery({ queryKey: ['goal', id], queryFn: () => fetchGoal(id), enabled: enabled && !!id }); }
export function useProfile(userId?: string) { return useQuery({ queryKey: ['profile', userId], queryFn: async () => { const { data, error } = await db().from('profiles').select('*').eq('id', userId!).maybeSingle(); if (error) throw error; return data as Profile | null; }, enabled: !!userId }); }
export function useNotes(enabled=true) { return useQuery({ queryKey: ['notes'], enabled, queryFn: async () => { const { data, error } = await db().from('notes').select('*, steps(title, idx, units(goal_id, goals(title)))').order('created_at', { ascending: false }); if (error) throw error; return data as unknown as Note[]; } }); }
