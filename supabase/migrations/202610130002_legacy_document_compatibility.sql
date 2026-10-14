-- Keep validation for previous JSON documents while accepting normalized Milo rows.
do $$
declare expression text;
begin
 select pg_get_expr(conbin,conrelid) into expression from pg_constraint where conrelid='public.goals'::regclass and conname='goal_document';
 if expression is not null then
  alter table public.goals drop constraint goal_document;
  execute format('alter table public.goals add constraint goal_document check ((%s) or (payload = ''{}''::jsonb and length(title) between 1 and 140 and length(prompt) between 10 and 2000))',expression);
 end if;
 select pg_get_expr(conbin,conrelid) into expression from pg_constraint where conrelid='public.notes'::regclass and conname='note_document';
 if expression is not null then
  alter table public.notes drop constraint note_document;
  execute format('alter table public.notes add constraint note_document check ((%s) or (payload = ''{}''::jsonb and step_id is not null and (length(trim(text)) > 0 or photo_url is not null)))',expression);
 end if;
end $$;
