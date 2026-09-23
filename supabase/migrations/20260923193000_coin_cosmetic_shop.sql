begin;
set local lock_timeout='5s';
create table eddie_farm.cosmetic_catalog(id text primary key check(length(id) between 1 and 100),name text not null,price integer not null check(price between 1 and 100000),enabled boolean not null default true);
insert into eddie_farm.cosmetic_catalog(id,name,price) values
 ('white-fedora','White fedora',15),('cream-cable-knit','Cream cable-knit crewneck',25),('charcoal-turtleneck','Charcoal gray turtleneck',25),('blue-swordsman-jacket','Blue swordsman jacket',35),('brown-leather-bomber','Brown leather bomber jacket',35),('sunburst-hoodie','Charcoal sunburst hoodie',30),('black-blazer-hoodie','Black blazer over hoodie',35),('olive-plain-tee','Olive plain crew-neck T-shirt',20),('cream-sherpa-jacket','Cream sherpa jacket',35),('pink-rain-jacket','Pink-piped rain jacket',35);
create table eddie_farm.cosmetic_ownership(student_id uuid not null references public.flashcard_students(id) on delete cascade,item_id text not null references eddie_farm.cosmetic_catalog(id),purchased_at timestamptz not null default now(),primary key(student_id,item_id));
create table eddie_farm.cosmetic_receipts(student_id uuid not null references public.flashcard_students(id) on delete cascade,request_id uuid not null,item_id text not null references eddie_farm.cosmetic_catalog(id),created_at timestamptz not null default now(),primary key(student_id,request_id));
revoke all on eddie_farm.cosmetic_catalog,eddie_farm.cosmetic_ownership,eddie_farm.cosmetic_receipts from public,anon,authenticated,service_role;
insert into eddie_farm.cosmetic_ownership(student_id,item_id)
select w.student_id,e.value from avatar_closet.wardrobes w cross join lateral (select value from jsonb_each_text(w.equipped) union select equipment.value from jsonb_array_elements(w.outfits) outfits(item) cross join lateral jsonb_each_text(outfits.item->'equipped') equipment) e join eddie_farm.cosmetic_catalog c on c.id=e.value on conflict do nothing;
create or replace function eddie_farm.snapshot(p_token uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare v_student uuid:=eddie_farm.student_id(p_token);
begin
 perform eddie_farm.visit_student(v_student);
 return jsonb_build_object('id',v_student,'name',(select name from public.flashcard_students where id=v_student),'balance',(select balance from eddie_farm.wallets where student_id=v_student),
 'seeds',(select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,'price',s.price,'quantity',coalesce(i.quantity,0)) order by s.name),'[]'::jsonb) from eddie_farm.seeds s left join eddie_farm.inventory i on i.seed_id=s.id and i.student_id=v_student where s.enabled),
 'cosmetics',(select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'price',c.price,'owned',exists(select 1 from eddie_farm.cosmetic_ownership o where o.student_id=v_student and o.item_id=c.id)) order by c.name),'[]'::jsonb) from eddie_farm.cosmetic_catalog c where c.enabled),
 'plots',(select coalesce(jsonb_agg(jsonb_build_object('id',p.plot_id,'cropId',p.seed_id,'plantedAt',extract(epoch from p.planted_at)*1000)),'[]'::jsonb) from eddie_farm.plots p where p.student_id=v_student),
 'harvests',(select coalesce(jsonb_agg(jsonb_build_object('id',h.seed_id,'quantity',h.quantity)),'[]'::jsonb) from eddie_farm.harvests h where h.student_id=v_student));
end $$;
create function eddie_farm.cosmetic_purchase(p_token uuid,p_item text,p_request uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare sid uuid:=eddie_farm.student_id(p_token); price integer; prior eddie_farm.cosmetic_receipts%rowtype;
begin
 if p_request is null then raise exception 'A purchase reference is required.'; end if;
 perform eddie_farm.lock_wallet(sid);
 select * into prior from eddie_farm.cosmetic_receipts where student_id=sid and request_id=p_request;
 if found then if prior.item_id<>p_item then raise exception 'Purchase reference already used.';end if;return eddie_farm.snapshot(p_token);end if;
 select c.price into price from eddie_farm.cosmetic_catalog c where c.id=p_item and c.enabled;
 if not found then raise exception 'This cosmetic is unavailable.';end if;
 if exists(select 1 from eddie_farm.cosmetic_ownership where student_id=sid and item_id=p_item) then return eddie_farm.snapshot(p_token);end if;
 update eddie_farm.wallets set balance=balance-price where student_id=sid and balance>=price;
 if not found then raise exception 'Not enough coins.' using errcode='P0001';end if;
 insert into eddie_farm.cosmetic_ownership(student_id,item_id) values(sid,p_item);
 insert into eddie_farm.cosmetic_receipts(student_id,request_id,item_id) values(sid,p_request,p_item);
 insert into eddie_farm.ledger(student_id,kind,system_key,points) values(sid,'cosmetic_purchase','cosmetic:'||p_item,-price);
 return eddie_farm.snapshot(p_token);
end $$;
create function public.eddie_farm_cosmetic(p_token uuid,p_item text,p_request uuid) returns jsonb language sql security invoker set search_path='' as $$ select eddie_farm.cosmetic_purchase(p_token,p_item,p_request) $$;
create function public.eddie_farm_owned_cosmetics(p_token uuid) returns text[] language sql security definer set search_path='' as $$ select coalesce(array_agg(item_id order by item_id),'{}'::text[]) from eddie_farm.cosmetic_ownership where student_id=eddie_farm.student_id(p_token) $$;
revoke all on function eddie_farm.cosmetic_purchase(uuid,text,uuid),public.eddie_farm_cosmetic(uuid,text,uuid),public.eddie_farm_owned_cosmetics(uuid) from public,anon;
grant execute on function eddie_farm.cosmetic_purchase(uuid,text,uuid),public.eddie_farm_cosmetic(uuid,text,uuid),public.eddie_farm_owned_cosmetics(uuid) to authenticated;
notify pgrst,'reload schema';
commit;
