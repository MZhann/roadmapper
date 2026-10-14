create function public.milo_adjust_goal(p_goal uuid,p_plan jsonb,p_revision integer,p_completed uuid[],p_start date default current_date) returns uuid
language plpgsql security definer set search_path='' as $$
declare g public.goals; completed uuid[]; u jsonb; s jsonb; unit_id uuid; ui integer; si integer; d integer; last_day integer:=0; day_minutes integer:=0; total integer:=0; budget integer; today_minutes integer;
begin
 select * into g from public.goals where id=p_goal and user_id=auth.uid() for update;
 if not found then raise exception 'Goal not found'; end if;
 if g.status<>'active' then raise exception 'Only active goals can be adjusted'; end if;
 select coalesce(array_agg(st.id order by st.id),'{}'::uuid[]) into completed from public.steps st join public.units un on un.id=st.unit_id where un.goal_id=p_goal and st.status='done';
 if g.revision<>p_revision or completed<>p_completed then raise exception 'Progress changed while this plan was being revised. Please generate a fresh adjustment.'; end if;
 if abs(p_start-current_date)>1 or (p_plan->>'days')::int not between 1 and 366 or jsonb_typeof(p_plan->'units')<>'array' or jsonb_array_length(p_plan->'units') not between 1 and 12 then raise exception 'Invalid revised plan'; end if;
 budget=(p_plan->>'daily_minutes')::int;
 select coalesce(sum(st.minutes),0) into today_minutes from public.steps st join public.units un on un.id=st.unit_id join public.profiles pr on pr.id=g.user_id where un.goal_id=p_goal and st.status='done' and (st.completed_at at time zone pr.timezone)::date=p_start;
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
   if d<>last_day then day_minutes=case when d=1 then today_minutes else 0 end;end if;
   day_minutes=day_minutes+(s->>'minutes')::int;last_day=d;
   if day_minutes>budget then raise exception 'Daily time budget exceeded'; end if;
   insert into public.steps(unit_id,idx,title,minutes,xp,content,unlock_date) values(unit_id,si,s->>'title',(s->>'minutes')::int,(s->>'xp')::int,s->'content',p_start+d-1);
  end loop;
 end loop;
 update public.goals set summary=p_plan->>'summary',daily_minutes=budget,deadline=p_start+(p_plan->>'days')::int-1,revision=revision+1,updated_at=now() where id=p_goal;
 return p_goal;
end $$;
revoke all on function public.milo_adjust_goal(uuid,jsonb,integer,uuid[],date) from public,anon;
grant execute on function public.milo_adjust_goal(uuid,jsonb,integer,uuid[],date) to authenticated;
