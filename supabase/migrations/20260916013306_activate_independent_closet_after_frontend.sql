-- Apply only AFTER the independent wardrobe frontend is live.
-- Older pages can restore, but cannot overwrite independent looks with a shared snapshot.
create or replace function avatar_closet.sync(p_token uuid,p_equipped jsonb default null,p_outfits jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare student uuid; result jsonb;
begin
 if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='42501'; end if;
 student:=public.flashcard_session_student_id(p_token);
 if student is null then raise exception 'Please log in again' using errcode='42501'; end if;
 if p_equipped is not null or p_outfits is not null then raise exception 'The wardrobe has been updated. Please refresh this page before saving.'; end if;
 select avatar_closet.independent_wardrobe(w.equipped,w.outfits) into result from avatar_closet.wardrobes w where w.student_id=student;
 return coalesce(result,jsonb_build_object('equipped','{}'::jsonb,'outfits','[]'::jsonb));
end $$;
