-- Clarifications, revisions and lesson help share one daily per-user budget.
-- A short cooldown prevents double taps without blocking ordinary follow-up questions.
create or replace function public.consume_planner_quota() returns boolean
language plpgsql security definer set search_path = '' as $$
declare accepted uuid;
begin
  if auth.uid() is null then return false; end if;
  insert into public.planner_usage(user_id, day, requests, last_request)
  values (auth.uid(), (now() at time zone 'utc')::date, 1, now())
  on conflict (user_id, day) do update set requests = public.planner_usage.requests + 1, last_request = now()
  where public.planner_usage.requests < 60 and public.planner_usage.last_request < now() - interval '3 seconds'
  returning user_id into accepted;
  return accepted is not null;
end;
$$;
