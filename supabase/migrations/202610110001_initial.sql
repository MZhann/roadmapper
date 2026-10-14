-- Roadmap Your Dream: every row belongs to the signed-in user.
create table public.goals (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null,
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  constraint goal_document check (coalesce((
    jsonb_typeof(payload) = 'object'
    and payload->>'id' = id::text
    and length(payload->>'title') between 1 and 120
    and jsonb_typeof(payload->'tasks') = 'array'
    and jsonb_array_length(payload->'tasks') between 1 and 100
  ), false))
);
create index goals_user_updated_idx on public.goals(user_id, updated_at desc);
alter table public.goals enable row level security;
create policy "Users read their goals" on public.goals for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users insert their goals" on public.goals for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update their goals" on public.goals for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete their goals" on public.goals for delete to authenticated using ((select auth.uid()) = user_id);
create table public.notes (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  foreign key (goal_id, user_id) references public.goals(id, user_id) on delete cascade,
  constraint note_document check (coalesce((
    jsonb_typeof(payload) = 'object'
    and payload->>'id' = id::text
    and payload->>'goalId' = goal_id::text
    and length(btrim(payload->>'body')) between 1 and 5000
  ), false))
);
create index notes_user_updated_idx on public.notes(user_id, updated_at desc);
alter table public.notes enable row level security;
create policy "Users read their notes" on public.notes for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users insert their notes" on public.notes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update their notes" on public.notes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete their notes" on public.notes for delete to authenticated using ((select auth.uid()) = user_id);
create function public.validate_note_task() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.payload->>'taskId' is not null and not exists (
    select 1 from public.goals g, jsonb_array_elements(g.payload->'tasks') task
    where g.id = new.goal_id and g.user_id = new.user_id and task->>'id' = new.payload->>'taskId'
  ) then raise exception 'The note task does not belong to this goal'; end if;
  return new;
end;
$$;
create trigger notes_validate_task before insert or update on public.notes for each row execute function public.validate_note_task();
-- Atomic per-user quotas protect the paid model endpoint. No client may edit counters.
create table public.planner_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  requests integer not null default 1,
  last_request timestamptz not null default now(),
  primary key (user_id, day)
);
alter table public.planner_usage enable row level security;
revoke all on public.planner_usage from anon, authenticated;
create function public.consume_planner_quota() returns boolean
language plpgsql security definer set search_path = '' as $$
declare accepted uuid;
begin
  if auth.uid() is null then return false; end if;
  insert into public.planner_usage(user_id, day, requests, last_request)
  values (auth.uid(), (now() at time zone 'utc')::date, 1, now())
  on conflict (user_id, day) do update set requests = public.planner_usage.requests + 1, last_request = now()
  where public.planner_usage.requests < 20 and public.planner_usage.last_request < now() - interval '10 seconds'
  returning user_id into accepted;
  return accepted is not null;
end;
$$;
revoke all on function public.consume_planner_quota() from public, anon;
grant execute on function public.consume_planner_quota() to authenticated;
grant select, insert, update, delete on public.goals, public.notes to authenticated;
revoke all on public.goals, public.notes from anon;
