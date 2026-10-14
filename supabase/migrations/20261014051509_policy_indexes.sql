-- Consolidate equivalent policies left by the earlier payload-based prototype.
drop policy if exists "Users read their goals" on public.goals;
drop policy if exists "Users delete their goals" on public.goals;
drop policy if exists "Users read their notes" on public.notes;
drop policy if exists "Users insert their notes" on public.notes;
drop policy if exists "Users update their notes" on public.notes;
drop policy if exists "Users delete their notes" on public.notes;
alter policy milo_notes_owner on public.notes with check (
 user_id=(select auth.uid()) and (
  step_id is null or exists(select 1 from public.steps s join public.units u on u.id=s.unit_id where s.id=step_id and u.goal_id=notes.goal_id)
 )
);
create index if not exists notes_goal_owner on public.notes(goal_id,user_id);
