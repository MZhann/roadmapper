-- Run against the linked project; all temporary records are rolled back.
begin;
do $$
declare
 owner_id uuid := gen_random_uuid(); test_goal uuid := gen_random_uuid();
 first_id uuid; second_id uuid; third_id uuid; result jsonb; failed boolean;
 plan jsonb := '{"title":"Self-paced regression","summary":"Temporary verification","theme_id":"technology","days":30,"daily_minutes":5,"units":[{"title":"Begin","steps":[{"title":"One","minutes":10,"xp":20,"day":1,"content":[{"type":"task","text":"Try once."}]},{"title":"Two","minutes":10,"xp":20,"day":1,"content":[{"type":"task","text":"Try twice."}]},{"title":"Three","minutes":10,"xp":20,"day":30,"content":[{"type":"task","text":"Try again."}]}]}]}';
 test_revision integer;
begin
 insert into auth.users(id,aud,role,email,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
 values(owner_id,'authenticated','authenticated','milo-sql-'||owner_id||'@example.test','{}','{}',now(),now());
 insert into public.profiles(id,name,timezone) values(owner_id,'Temporary SQL test','UTC') on conflict(id) do nothing;
 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 perform public.milo_save_goal(test_goal,'Verify immediate sequential progress',plan,current_date);
 select s.id into first_id from public.steps s join public.units u on u.id=s.unit_id where u.goal_id=test_goal and s.idx=1;
 select s.id into second_id from public.steps s join public.units u on u.id=s.unit_id where u.goal_id=test_goal and s.idx=2;
 select s.id into third_id from public.steps s join public.units u on u.id=s.unit_id where u.goal_id=test_goal and s.idx=3;
 -- Existing goals can have future dates; those must also stop blocking progress.
 update public.steps set unlock_date=current_date+30 where id in(first_id,second_id,third_id);
 failed=false;
 begin perform public.milo_complete_step(second_id,''); exception when others then failed=true; end;
 if not failed then raise exception 'Out-of-order step was allowed'; end if;
 result=public.milo_complete_step(first_id,'Preserve this note');
 if (result->>'xp')::int<>20 then raise exception 'XP was not awarded'; end if;
 result=public.milo_complete_step(first_id,'Do not duplicate');
 if (result->>'xp')::int<>0 or (select count(*) from public.notes where step_id=first_id)<>1 then raise exception 'Completion is not idempotent'; end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 failed=false;
 begin perform public.milo_complete_step(second_id,''); exception when others then failed=true; end;
 if not failed then raise exception 'Another account could complete this step'; end if;
 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 perform public.milo_complete_step(second_id,'');
 select g.revision into test_revision from public.goals g where id=test_goal;
 failed=false;
 begin perform public.milo_adjust_goal(test_goal,plan,test_revision,'{}',current_date); exception when others then failed=true; end;
 if not failed then raise exception 'Stale completed-step snapshot was accepted'; end if;
 perform public.milo_adjust_goal(test_goal,plan,test_revision,(select array_agg(s.id order by s.id) from public.steps s where s.id in(first_id,second_id)),current_date);
 if not exists(select 1 from public.notes where step_id=first_id and text='Preserve this note') then raise exception 'Revision lost a completed note'; end if;
 for third_id in select s.id from public.steps s join public.units u on u.id=s.unit_id where u.goal_id=test_goal and s.status='pending' order by u.idx,s.idx loop
  perform public.milo_complete_step(third_id,'');
 end loop;
 if (select status from public.goals where id=test_goal)<>'completed' then raise exception 'Goal did not finish in one session'; end if;
end $$;
select 'PASS: no date or daily-budget gate; ordering, ownership, XP idempotency, revision guard and notes preserved' as result;
rollback;
