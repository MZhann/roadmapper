-- Additive migration: retains the earlier JSON payload tables and their data.
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade,
  payload jsonb not null default '{}'::jsonb, revision integer not null default 1,
  updated_at timestamptz not null default now(), unique(id,user_id)
);
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade,
  goal_id uuid not null, payload jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now(),
  foreign key(goal_id,user_id) references public.goals(id,user_id) on delete cascade
);
alter table public.goals alter column id set default gen_random_uuid();
alter table public.goals alter column payload set default '{}'::jsonb;
alter table public.goals add column if not exists title text not null default 'Your goal';
alter table public.goals add column if not exists prompt text not null default '';
alter table public.goals add column if not exists summary text not null default '';
alter table public.goals add column if not exists theme_id text not null default 'general_adventure' check(theme_id in ('languages_learning','sports_movement','money_business','art_creativity','technology','life_wellbeing','general_adventure'));
alter table public.goals add column if not exists daily_minutes integer not null default 15 check(daily_minutes between 5 and 180);
alter table public.goals add column if not exists deadline date not null default current_date;
alter table public.goals add column if not exists status text not null default 'active' check(status in ('active','completed','archived'));
alter table public.goals add column if not exists created_at timestamptz not null default now();
create table public.profiles (
  id uuid primary key references auth.users on delete cascade, name text not null check(length(name) between 1 and 60),
  daily_minutes integer not null default 15 check(daily_minutes between 5 and 180),
  reminder_time time, timezone text not null default 'UTC', onboarding_complete boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.units (
  id uuid primary key default gen_random_uuid(), goal_id uuid not null references public.goals on delete cascade,
  idx integer not null check(idx>0), title text not null check(length(title) between 1 and 100), unique(goal_id,idx)
);
create table public.steps (
  id uuid primary key default gen_random_uuid(), unit_id uuid not null references public.units on delete cascade,
  idx integer not null check(idx>0), title text not null check(length(title) between 1 and 140),
  minutes integer not null check(minutes between 1 and 180), xp integer not null check(xp between 5 and 100),
  content jsonb not null check(jsonb_typeof(content)='array' and jsonb_array_length(content) between 1 and 16),
  status text not null default 'pending' check(status in ('pending','done')), unlock_date date not null,
  completed_at timestamptz, unique(unit_id,idx), check((status='done')=(completed_at is not null))
);
alter table public.notes alter column id set default gen_random_uuid();
alter table public.notes alter column payload set default '{}'::jsonb;
alter table public.notes add column if not exists step_id uuid references public.steps on delete cascade;
alter table public.notes add column if not exists text text not null default '' check(length(text)<=10000);
alter table public.notes add column if not exists photo_url text;
alter table public.notes add column if not exists created_at timestamptz not null default now();
create index if not exists goals_owner_created on public.goals(user_id,created_at desc);
create index notes_owner_created on public.notes(user_id,created_at desc);
create index notes_step on public.notes(step_id);
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.units enable row level security;
alter table public.steps enable row level security;
alter table public.notes enable row level security;
create policy profiles_owner on public.profiles for all to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy milo_goals_read on public.goals for select to authenticated using(user_id=(select auth.uid()));
create policy milo_goals_delete on public.goals for delete to authenticated using(user_id=(select auth.uid()));
create policy units_owner_read on public.units for select to authenticated using(exists(select 1 from public.goals g where g.id=goal_id and g.user_id=(select auth.uid())));
create policy steps_owner_read on public.steps for select to authenticated using(exists(select 1 from public.units u join public.goals g on g.id=u.goal_id where u.id=unit_id and g.user_id=(select auth.uid())));
create policy milo_notes_owner on public.notes for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()) and exists(select 1 from public.steps s join public.units u on u.id=s.unit_id where s.id=step_id and u.goal_id=notes.goal_id));
-- A constraint trigger applies to older policies too: a note cannot name someone else's step.
create function public.milo_check_note() returns trigger language plpgsql set search_path='' as $$
begin
  if new.step_id is not null and not exists(select 1 from public.steps s join public.units u on u.id=s.unit_id join public.goals g on g.id=u.goal_id where s.id=new.step_id and g.id=new.goal_id and g.user_id=new.user_id) then raise exception 'Note step does not belong to this goal'; end if;
  new.updated_at=now(); return new;
end $$;
create trigger milo_note_owner before insert or update on public.notes for each row execute function public.milo_check_note();
grant select,insert,update,delete on public.profiles,public.notes to authenticated;
grant select,delete on public.goals to authenticated;
grant select on public.units,public.steps to authenticated;

create function public.milo_save_goal(p_id uuid,p_prompt text,p_plan jsonb,p_start date default current_date) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid(); v_unit jsonb; v_step jsonb; v_unit_id uuid; ui integer:=0; si integer; count_steps integer:=0; last_day integer:=0; day_minutes integer:=0; d integer; budget integer;
begin
 if v_user is null then raise exception 'Sign in required'; end if;
 if exists(select 1 from public.goals where id=p_id and user_id=v_user) then return p_id; end if;
 if length(p_prompt) not between 10 and 2000 or jsonb_typeof(p_plan->'units')<>'array' or jsonb_array_length(p_plan->'units') not between 1 and 12 then raise exception 'Invalid plan'; end if;
 if abs(p_start-current_date)>1 or (p_plan->>'days')::int not between 1 and 366 or length(p_plan->>'title') not between 1 and 140 then raise exception 'Invalid schedule'; end if;
 budget=(p_plan->>'daily_minutes')::int;
 insert into public.goals(id,user_id,title,prompt,summary,theme_id,daily_minutes,deadline) values(p_id,v_user,p_plan->>'title',p_prompt,p_plan->>'summary',p_plan->>'theme_id',budget,p_start+(p_plan->>'days')::int-1);
 for v_unit in select value from jsonb_array_elements(p_plan->'units') loop
  ui=ui+1; si=0;
  if jsonb_array_length(v_unit->'steps') not between 1 and 30 then raise exception 'Invalid unit'; end if;
  insert into public.units(goal_id,idx,title) values(p_id,ui,v_unit->>'title') returning id into v_unit_id;
  for v_step in select value from jsonb_array_elements(v_unit->'steps') loop
   si=si+1; count_steps=count_steps+1; d=(v_step->>'day')::int;
   if count_steps>120 or d<greatest(1,last_day) or d>(p_plan->>'days')::int then raise exception 'Invalid step schedule'; end if;
   if d<>last_day then day_minutes=0; end if;
   day_minutes=day_minutes+(v_step->>'minutes')::int; last_day=d;
   if day_minutes>budget then raise exception 'Daily time budget exceeded'; end if;
   insert into public.steps(unit_id,idx,title,minutes,xp,content,unlock_date) values(v_unit_id,si,v_step->>'title',(v_step->>'minutes')::int,(v_step->>'xp')::int,v_step->'content',p_start+d-1);
  end loop;
 end loop;
 return p_id;
end $$;
revoke all on function public.milo_save_goal(uuid,text,jsonb,date) from public,anon;
grant execute on function public.milo_save_goal(uuid,text,jsonb,date) to authenticated;

create function public.milo_complete_step(p_step uuid,p_note text default '') returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_goal public.goals; v_step public.steps; v_unit public.units; v_today date; v_zone text; v_awarded integer:=0;
begin
 select g.* into v_goal from public.goals g join public.units u on u.goal_id=g.id join public.steps s on s.unit_id=u.id where s.id=p_step and g.user_id=auth.uid() for update of g;
 if not found then raise exception 'Step not found'; end if;
 select * into v_step from public.steps where id=p_step;
 select * into v_unit from public.units where id=v_step.unit_id;
 select timezone into v_zone from public.profiles where id=auth.uid();
 v_today=(now() at time zone coalesce(v_zone,'UTC'))::date;
 if v_step.status='done' then return jsonb_build_object('xp',0,'already_completed',true); end if;
 if v_goal.status<>'active' or v_step.unlock_date>v_today or exists(select 1 from public.steps s join public.units u on u.id=s.unit_id where u.goal_id=v_goal.id and (u.idx<v_unit.idx or (u.idx=v_unit.idx and s.idx<v_step.idx)) and s.status<>'done') then raise exception 'This step is locked'; end if;
 update public.steps set status='done',completed_at=now() where id=p_step;
 v_awarded=v_step.xp;
 if length(trim(p_note))>0 then insert into public.notes(user_id,goal_id,step_id,text) values(auth.uid(),v_goal.id,p_step,trim(p_note)); end if;
 if not exists(select 1 from public.steps s join public.units u on u.id=s.unit_id where u.goal_id=v_goal.id and s.status<>'done') then update public.goals set status='completed',updated_at=now() where id=v_goal.id; end if;
 return jsonb_build_object('xp',v_awarded,'already_completed',false);
end $$;
revoke all on function public.milo_complete_step(uuid,text) from public,anon;
grant execute on function public.milo_complete_step(uuid,text) to authenticated;

create table public.milo_ai_usage(user_id uuid references auth.users on delete cascade, day date not null default current_date, requests integer not null default 0, primary key(user_id,day));
alter table public.milo_ai_usage enable row level security;
create function public.milo_consume_quota() returns boolean language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 if auth.uid() is null then return false; end if;
 insert into public.milo_ai_usage(user_id,day,requests) values(auth.uid(),current_date,1) on conflict(user_id,day) do update set requests=public.milo_ai_usage.requests+1 where public.milo_ai_usage.requests<40 returning requests into n;
 return n is not null;
end $$;
revoke all on function public.milo_consume_quota() from public,anon;
grant execute on function public.milo_consume_quota() to authenticated;
