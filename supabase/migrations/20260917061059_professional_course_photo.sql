-- Professional English uses its existing opaque session token, not Supabase Auth
-- users. Validate that token and course membership for every read and write.
create schema if not exists professional_media;
revoke all on schema professional_media from public,anon,authenticated;
grant usage on schema professional_media to anon,authenticated;
create table professional_media.course_photos (
 course_id uuid primary key references public.special_flash_courses(id) on delete cascade,
 image text,
 revision bigint not null default 1,
 updated_at timestamptz not null default now(),
 updated_by uuid not null references public.special_flash_accounts(id),
 constraint small_jpeg check(image is null or (length(image)<=500000 and image like 'data:image/jpeg;base64,%'))
);
alter table professional_media.course_photos enable row level security;
revoke all on professional_media.course_photos from public,anon,authenticated;
create function professional_media.course_photo(p_token uuid,p_course uuid default null,p_action text default 'get',p_image text default null,p_revision bigint default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);row professional_media.course_photos;can_edit boolean;image_bytes bytea;
begin
 if a.id is null then raise exception 'Please sign in again.' using errcode='42501';end if;
 if p_action is null or p_action not in ('get','save','remove') then raise exception 'Invalid photo action.' using errcode='22023';end if;
 if p_course is null then
  if p_action<>'get' then raise exception 'Choose a course.' using errcode='22023';end if;
  return jsonb_build_object('courses',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'title',c.title,'can_edit',a.role='admin' or lower(a.username)='test3gr') order by c.title) from public.special_flash_courses c where c.active and (a.role='admin' or exists(select 1 from public.special_flash_enrollments e where e.course_id=c.id and e.account_id=a.id))),'[]'::jsonb));
 end if;
 if not exists(select 1 from public.special_flash_courses c where c.id=p_course and c.active and (a.role='admin' or exists(select 1 from public.special_flash_enrollments e where e.course_id=c.id and e.account_id=a.id))) then raise exception 'Course is not available.' using errcode='42501';end if;
 can_edit:=a.role='admin' or lower(a.username)='test3gr';
 if p_action<>'get' then
  if not can_edit then raise exception 'Only the course photo editor can change this photo.' using errcode='42501';end if;
  -- Lock the course so two first uploads cannot overwrite each other.
  perform 1 from public.special_flash_courses where id=p_course for update;
  select * into row from professional_media.course_photos where course_id=p_course;
  if p_revision is null or p_revision<>coalesce(row.revision,0) then raise exception 'The photo changed. Refresh and try again.' using errcode='P0001';end if;
  if p_action='save' then
   if p_image is null or length(p_image)>500000 or p_image !~ '^data:image/jpeg;base64,[A-Za-z0-9+/]+={0,2}$' then raise exception 'Please choose a JPEG photo under 375 KB after compression.' using errcode='22023';end if;
   image_bytes:=decode(substring(p_image from 24),'base64');
   if octet_length(image_bytes)<4 or substring(image_bytes from 1 for 3)<>decode('ffd8ff','hex') or substring(image_bytes from octet_length(image_bytes)-1 for 2)<>decode('ffd9','hex') then raise exception 'Invalid JPEG photo.' using errcode='22023';end if;
  end if;
  insert into professional_media.course_photos(course_id,image,updated_by) values(p_course,case when p_action='save' then p_image else null end,a.id)
  on conflict(course_id) do update set image=excluded.image,revision=professional_media.course_photos.revision+1,updated_at=now(),updated_by=a.id;
 end if;
 select * into row from professional_media.course_photos where course_id=p_course;
 return jsonb_build_object('course_id',p_course,'can_edit',can_edit,'revision',coalesce(row.revision,0),'updated_at',row.updated_at,'changed',p_revision is distinct from coalesce(row.revision,0),'image',case when p_action<>'get' or p_revision is distinct from coalesce(row.revision,0) then row.image else null end);
end $$;
revoke all on function professional_media.course_photo(uuid,uuid,text,text,bigint) from public,anon,authenticated;
grant execute on function professional_media.course_photo(uuid,uuid,text,text,bigint) to anon,authenticated;
create function public.special_flash_course_photo(p_token uuid,p_course uuid default null,p_action text default 'get',p_image text default null,p_revision bigint default null)
returns jsonb language sql security invoker set search_path='' as $$
 select professional_media.course_photo(p_token,p_course,p_action,p_image,p_revision);
$$;
revoke all on function public.special_flash_course_photo(uuid,uuid,text,text,bigint) from public,anon,authenticated;
grant execute on function public.special_flash_course_photo(uuid,uuid,text,text,bigint) to anon,authenticated;
notify pgrst,'reload schema';
