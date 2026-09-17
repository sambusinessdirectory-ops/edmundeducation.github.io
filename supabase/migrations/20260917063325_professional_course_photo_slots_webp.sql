-- Preserve the existing photo as the right slot, including its revision.
alter table professional_media.course_photos add column slot text not null default 'right' check(slot in ('left','right'));
alter table professional_media.course_photos drop constraint course_photos_pkey;
alter table professional_media.course_photos add primary key(course_id,slot);
alter table professional_media.course_photos drop constraint small_jpeg;
alter table professional_media.course_photos add constraint small_photo check(image is null or (length(image)<=500000 and image ~ '^data:image/(jpeg|webp);base64,'));
create function professional_media.course_photo_slot(p_token uuid,p_course uuid default null,p_action text default 'get',p_image text default null,p_revision bigint default null,p_slot text default 'right')
returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);row professional_media.course_photos;can_edit boolean;image_bytes bytea;
begin
 if a.id is null then raise exception 'Please sign in again.' using errcode='42501';end if;
 if p_slot is null or p_slot not in ('left','right') then raise exception 'Invalid photo slot.' using errcode='22023';end if;
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
  select * into row from professional_media.course_photos where course_id=p_course and slot=p_slot;
  if p_revision is null or p_revision<>coalesce(row.revision,0) then raise exception 'The photo changed. Refresh and try again.' using errcode='P0001';end if;
  if p_action='save' then
   if p_image is null or length(p_image)>500000 or p_image !~ '^data:image/(jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$' then raise exception 'Please choose a JPEG or WebP photo under 375 KB after compression.' using errcode='22023';end if;
   image_bytes:=decode(substring(p_image from 24),'base64');
   if p_image like 'data:image/webp;%' then
    if octet_length(image_bytes)<20 or substring(image_bytes from 1 for 4)<>convert_to('RIFF','UTF8') or substring(image_bytes from 9 for 4)<>convert_to('WEBP','UTF8') or substring(image_bytes from 13 for 4) not in (convert_to('VP8 ','UTF8'),convert_to('VP8L','UTF8'),convert_to('VP8X','UTF8')) then raise exception 'Invalid WebP photo.' using errcode='22023';end if;
   elsif octet_length(image_bytes)<4 or substring(image_bytes from 1 for 3)<>decode('ffd8ff','hex') or substring(image_bytes from octet_length(image_bytes)-1 for 2)<>decode('ffd9','hex') then raise exception 'Invalid JPEG photo.' using errcode='22023';end if;
  end if;
  insert into professional_media.course_photos(course_id,slot,image,updated_by) values(p_course,p_slot,case when p_action='save' then p_image else null end,a.id)
  on conflict(course_id,slot) do update set image=excluded.image,revision=professional_media.course_photos.revision+1,updated_at=now(),updated_by=a.id;
 end if;
 select * into row from professional_media.course_photos where course_id=p_course and slot=p_slot;
 return jsonb_build_object('course_id',p_course,'can_edit',can_edit,'revision',coalesce(row.revision,0),'updated_at',row.updated_at,'changed',p_revision is distinct from coalesce(row.revision,0),'image',case when p_action<>'get' or p_revision is distinct from coalesce(row.revision,0) then row.image else null end);
end $$;

revoke all on function professional_media.course_photo_slot(uuid,uuid,text,text,bigint,text) from public,anon,authenticated;
grant execute on function professional_media.course_photo_slot(uuid,uuid,text,text,bigint,text) to anon,authenticated;
create or replace function professional_media.course_photo(p_token uuid,p_course uuid default null,p_action text default 'get',p_image text default null,p_revision bigint default null)
returns jsonb language sql security definer set search_path='' as $$select professional_media.course_photo_slot(p_token,p_course,p_action,p_image,p_revision,'right');$$;
create function public.special_flash_course_photo_slot(p_token uuid,p_course uuid default null,p_action text default 'get',p_image text default null,p_revision bigint default null,p_slot text default 'right')
returns jsonb language sql security invoker set search_path='' as $$select professional_media.course_photo_slot(p_token,p_course,p_action,p_image,p_revision,p_slot);$$;
revoke all on function public.special_flash_course_photo_slot(uuid,uuid,text,text,bigint,text) from public,anon,authenticated;
grant execute on function public.special_flash_course_photo_slot(uuid,uuid,text,text,bigint,text) to anon,authenticated;
notify pgrst,'reload schema';
