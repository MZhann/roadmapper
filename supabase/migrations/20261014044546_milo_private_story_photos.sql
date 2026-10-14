insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('milo-stories','milo-stories',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
create policy milo_photos_read on storage.objects for select to authenticated using(bucket_id='milo-stories' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy milo_photos_insert on storage.objects for insert to authenticated with check(bucket_id='milo-stories' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy milo_photos_delete on storage.objects for delete to authenticated using(bucket_id='milo-stories' and (storage.foldername(name))[1]=(select auth.uid())::text);
alter table public.notes add constraint photo_owner_path check(photo_url is null or starts_with(photo_url,user_id::text||'/'));
