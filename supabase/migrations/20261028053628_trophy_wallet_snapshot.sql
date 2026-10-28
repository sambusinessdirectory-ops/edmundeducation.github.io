CREATE OR REPLACE FUNCTION eddie_farm.snapshot(p_token uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_student uuid:=eddie_farm.student_id(p_token);
begin
 perform eddie_farm.visit_student(v_student);
 return jsonb_build_object('trophies',eddie_farm.trophy_summary(p_token),'id',v_student,'name',(select name from public.flashcard_students where id=v_student),'balance',(select balance from eddie_farm.wallets where student_id=v_student),
 'seeds',(select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,'price',s.price,'quantity',coalesce(i.quantity,0)) order by s.name),'[]'::jsonb) from eddie_farm.seeds s left join eddie_farm.inventory i on i.seed_id=s.id and i.student_id=v_student where s.enabled),
 'cosmetics',(select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'price',c.price,'owned',exists(select 1 from eddie_farm.cosmetic_ownership o where o.student_id=v_student and o.item_id=c.id)) order by c.name),'[]'::jsonb) from eddie_farm.cosmetic_catalog c where c.enabled),
 'plots',(select coalesce(jsonb_agg(jsonb_build_object('id',p.plot_id,'cropId',p.seed_id,'plantedAt',extract(epoch from p.planted_at)*1000)),'[]'::jsonb) from eddie_farm.plots p where p.student_id=v_student),
 'harvests',(select coalesce(jsonb_agg(jsonb_build_object('id',h.seed_id,'quantity',h.quantity)),'[]'::jsonb) from eddie_farm.harvests h where h.student_id=v_student));
end $function$
