-- Correct the final Hong Kong tourism synonym index (0–129).
create or replace function public.dse_argument_save_state(p_student_token uuid,p_module_id text,p_item_id text,p_checked boolean,p_bookmarked boolean)
returns void language plpgsql volatile security definer set search_path = '' as $$
declare v_key text;v_max_syn integer;
begin
  select x.max_syn into v_max_syn from (values ('2024-digital-museums',143),('2024-feeding-communities',155),('2024-food-delivery-workers',111),('2024-tourism-management',111),('2025-1-2-photo-taking-visitors',63),('2025-a-hot-social-media-site-among-teens-linkedin',102),('2025-hong-kong-s-growing-second-hand-luxury-clothes-culture',113),('2025-how-an-app-is-reshaping-hong-kong-tourism',129),('2025-learning-to-drive-in-hong-kong',100),('2025-once-in-a-lifetime-adventures',184),('2025-personal-shopping-ai-and-the-future-of-retail',105),('2025-subtitles-campus-tv',119),('2025-the-art-of-self-care',119),('2025-why-was-super-mario-a-plumber',119),('undated-comfort-food',97),('undated-homeschooling',92),('undated-multi-functional-caf-s-in-hong-kong',118),('undated-scouts-create-a-better-world',104),('undated-talent-based-reality-tv-shows',181)) as x(module_id,max_syn) where x.module_id=p_module_id;
  if v_max_syn is null or p_checked is null or p_bookmarked is null then raise exception 'Invalid DSE item' using errcode='22023'; end if;
  if p_item_id is null or p_item_id !~ '^(arg:(A[123]|B[1-8])-[A-Z0-9]+|gloss:(A[123]|B[1-8])-[A-Z0-9]+:[0-4]|structure:([1-9]|1[0-9]|20)|syn:([0-9]|[1-9][0-9]|1[0-9][0-9]))$' then raise exception 'Invalid DSE item' using errcode='22023'; end if;
  if p_item_id like 'syn:%' and substring(p_item_id from 5)::integer>v_max_syn then raise exception 'Invalid DSE item' using errcode='22023'; end if;
  v_key:=public.news_discussion_account_key(p_student_token,null::uuid);
  insert into public.dse_argument_item_state(account_key,module_id,item_id,checked,bookmarked)
  values(v_key,p_module_id,p_item_id,p_checked,p_bookmarked)
  on conflict(account_key,module_id,item_id) do update set checked=excluded.checked,bookmarked=excluded.bookmarked,updated_at=now();
end;$$;
