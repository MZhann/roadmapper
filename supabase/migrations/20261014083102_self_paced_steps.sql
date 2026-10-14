-- Self-paced steps: retain ordering, ownership, idempotency and revision guards.
-- Legacy date/budget columns remain compatible but no longer gate progression.
create or replace function public.milo_save_goal(p_id uuid,p_prompt text,p_plan jsonb,p_start date default current_date) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid(); v_unit jsonb; v_step jsonb; v_unit_id uuid; ui integer:=0; si integer; count_steps integer:=0; last_day integer:=0; d integer; budget integer;
begin
 if v_user is null then raise exception 'Sign in required'; end if;
 if exists(select 1 from public.goals where id=p_id and user_id=v_user) then return p_id; end if;
 perform public.milo_validate_plan(p_plan,p_start);
 if p_id is null or p_prompt is null then raise exception 'Invalid goal'; end if;
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
   last_day=d;
   insert into public.steps(unit_id,idx,title,minutes,xp,content,unlock_date) values(v_unit_id,si,v_step->>'title',(v_step->>'minutes')::int,(v_step->>'xp')::int,v_step->'content',p_start);
  end loop;
 end loop;
 return p_id;
end $$;
revoke all on function public.milo_save_goal(uuid,text,jsonb,date) from public,anon;
grant execute on function public.milo_save_goal(uuid,text,jsonb,date) to authenticated;

create or replace function public.milo_adjust_goal(p_goal uuid,p_plan jsonb,p_revision integer,p_completed uuid[],p_start date default current_date) returns uuid
language plpgsql security definer set search_path='' as $$
declare g public.goals; completed uuid[]; u jsonb; s jsonb; unit_id uuid; ui integer; si integer; d integer; last_day integer:=0; total integer:=0; budget integer;
begin
 select * into g from public.goals where id=p_goal and user_id=auth.uid() for update;
 if not found then raise exception 'Goal not found'; end if;
 if g.status<>'active' then raise exception 'Only active goals can be adjusted'; end if;
 select coalesce(array_agg(st.id order by st.id),'{}'::uuid[]) into completed from public.steps st join public.units un on un.id=st.unit_id where un.goal_id=p_goal and st.status='done';
 if g.revision is distinct from p_revision or completed is distinct from p_completed then raise exception 'Progress changed while this plan was being revised. Please generate a fresh adjustment.'; end if;
 perform public.milo_validate_plan(p_plan,p_start);
 if abs(p_start-current_date)>1 or (p_plan->>'days')::int not between 1 and 366 or jsonb_typeof(p_plan->'units')<>'array' or jsonb_array_length(p_plan->'units') not between 1 and 12 then raise exception 'Invalid revised plan'; end if;
 budget=(p_plan->>'daily_minutes')::int;
 delete from public.steps st using public.units un where st.unit_id=un.id and un.goal_id=p_goal and st.status='pending';
 delete from public.units un where un.goal_id=p_goal and not exists(select 1 from public.steps st where st.unit_id=un.id);
 select coalesce(max(idx),0) into ui from public.units where goal_id=p_goal;
 total=cardinality(completed);
 for u in select value from jsonb_array_elements(p_plan->'units') loop
  ui=ui+1;si=0;
  if jsonb_array_length(u->'steps') not between 1 and 30 then raise exception 'Invalid unit'; end if;
  insert into public.units(goal_id,idx,title) values(p_goal,ui,u->>'title') returning id into unit_id;
  for s in select value from jsonb_array_elements(u->'steps') loop
   si=si+1;total=total+1;d=(s->>'day')::int;
   if total>120 or d<greatest(1,last_day) or d>(p_plan->>'days')::int then raise exception 'Invalid revised schedule'; end if;
   last_day=d;
   insert into public.steps(unit_id,idx,title,minutes,xp,content,unlock_date) values(unit_id,si,s->>'title',(s->>'minutes')::int,(s->>'xp')::int,s->'content',p_start);
  end loop;
 end loop;
 update public.goals set summary=p_plan->>'summary',daily_minutes=budget,deadline=p_start+(p_plan->>'days')::int-1,revision=revision+1,updated_at=now() where id=p_goal;
 return p_goal;
end $$;
revoke all on function public.milo_adjust_goal(uuid,jsonb,integer,uuid[],date) from public,anon;
grant execute on function public.milo_adjust_goal(uuid,jsonb,integer,uuid[],date) to authenticated;

create or replace function public.milo_complete_step(p_step uuid,p_note text default '') returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_goal public.goals; v_step public.steps; v_unit public.units; v_awarded integer:=0;
begin
 select g.* into v_goal from public.goals g join public.units u on u.goal_id=g.id join public.steps s on s.unit_id=u.id where s.id=p_step and g.user_id=auth.uid() for update of g;
 if not found then raise exception 'Step not found'; end if;
 select * into v_step from public.steps where id=p_step;
 select * into v_unit from public.units where id=v_step.unit_id;
 if v_step.status='done' then return jsonb_build_object('xp',0,'already_completed',true); end if;
 if v_goal.status<>'active' or exists(select 1 from public.steps s join public.units u on u.id=s.unit_id where u.goal_id=v_goal.id and (u.idx<v_unit.idx or (u.idx=v_unit.idx and s.idx<v_step.idx)) and s.status<>'done') then raise exception 'This step is locked'; end if;
 update public.steps set status='done',completed_at=now() where id=p_step;
 v_awarded=v_step.xp;
 if length(trim(p_note))>0 then insert into public.notes(user_id,goal_id,step_id,text) values(auth.uid(),v_goal.id,p_step,trim(p_note)); end if;
 if not exists(select 1 from public.steps s join public.units u on u.id=s.unit_id where u.goal_id=v_goal.id and s.status<>'done') then update public.goals set status='completed',updated_at=now() where id=v_goal.id; end if;
 return jsonb_build_object('xp',v_awarded,'already_completed',false);
end $$;
revoke all on function public.milo_complete_step(uuid,text) from public,anon;
grant execute on function public.milo_complete_step(uuid,text) to authenticated;
