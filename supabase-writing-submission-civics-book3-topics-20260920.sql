-- Civics Book 3: 55 bilingual Writing Submission topics with stable homework deep links.
begin;

do $$
declare
  v_admin_id uuid;
begin
  select a.id
  into v_admin_id
  from public.writing_submission_admin_accounts a
  where a.name = 'Sam Admin Writing Grammar Check'
    and a.is_active
  order by a.created_at
  limit 1;

  if v_admin_id is null then
    raise exception 'Active Writing Submission administrator not found';
  end if;

  insert into public.writing_submission_manual_topics (
    id,
    title,
    prompt,
    flashcard_url,
    created_by,
    created_at,
    updated_at
  )
  select
    ('b3000000-0000-5000-8000-' || pg_catalog.lpad(topic.number::text, 12, '0'))::uuid,
    topic.code || '. ' || topic.english || '｜' || topic.chinese,
    topic.english || E'\n\n中文：' || topic.chinese,
    'https://edmundeducation.com/flashcards.html?deck=government%2Fconcept-vocabulary%2Fbook-3%2F' || topic.deck_slug,
    v_admin_id,
    '2026-09-20 07:00:00+00'::timestamptz + ((56 - topic.number) || ' seconds')::interval,
    '2026-09-20 07:00:00+00'::timestamptz + ((56 - topic.number) || ' seconds')::interval
  from (
    values
      (1, 'A1', 'Should government departments be given clearer performance targets?', '政府部門是否應訂立更清晰的績效目標？', 'a-core-policy-group-discussion'),
      (2, 'A2', 'How can the Government improve accountability when a major policy fails?', '當重大政策成效未如理想時，政府可以如何加強問責？', 'a-core-policy-group-discussion'),
      (3, 'A3', 'Should more government services make use of artificial intelligence to improve efficiency?', '政府是否應在更多公共服務中使用人工智能以提升效率？', 'a-core-policy-group-discussion'),
      (4, 'A4', 'How can the Government improve coordination between different departments?', '政府可以如何改善不同部門之間的協調？', 'a-core-policy-group-discussion'),
      (5, 'A5', 'Should policy success be measured mainly by numerical targets or by public satisfaction?', '衡量政策成效時，應較重視量化指標還是市民滿意程度？', 'a-core-policy-group-discussion'),
      (6, 'B1', 'Should MiC technology be used more widely to speed up public housing construction?', '政府是否應更廣泛採用組裝合成建築法，以加快公營房屋建設？', 'b-housing-living-conditions'),
      (7, 'B2', 'Should higher-income public housing tenants be required to move into subsidised home ownership?', '入息較高的公屋住戶是否應被鼓勵或要求轉向資助自置居所？', 'b-housing-living-conditions'),
      (8, 'B3', 'How can the Government prevent the abuse of public housing resources?', '政府可以如何防止濫用公屋資源？', 'b-housing-living-conditions'),
      (9, 'B4', 'Should more subsidised flats be reserved for young families and families with newborn babies?', '是否應預留更多資助出售房屋予年輕家庭及有初生嬰兒的家庭？', 'b-housing-living-conditions'),
      (10, 'B5', 'How can Hong Kong shorten the development lead time for new housing projects?', '香港可以如何縮短新房屋項目的發展周期？', 'b-housing-living-conditions'),
      (11, 'C1', 'Should every Hong Kong resident be encouraged to have a regular family doctor?', '是否應鼓勵每名香港市民都有固定的家庭醫生？', 'c-healthcare-mental-health'),
      (12, 'C2', 'How can eHealth improve the coordination of healthcare services?', '醫健通可以如何改善不同醫療服務之間的協調？', 'c-healthcare-mental-health'),
      (13, 'C3', 'Should the Government purchase more healthcare services from the private sector?', '政府是否應向私營醫療界採購更多醫療服務？', 'c-healthcare-mental-health'),
      (14, 'C4', 'How can primary healthcare reduce pressure on public hospitals?', '基層醫療可以如何減輕公立醫院的壓力？', 'c-healthcare-mental-health'),
      (15, 'C5', 'Should more mental health services be provided through community-based centres instead of hospitals?', '是否應透過社區中心而非醫院提供更多精神健康服務？', 'c-healthcare-mental-health'),
      (16, 'D1', 'Should Hong Kong place greater emphasis on ageing in place rather than residential care?', '香港是否應更加重視居家安老，而非院舍照顧？', 'd-elderly-people-carers'),
      (17, 'D2', 'Is the “money-following-the-user” approach a good way to provide elderly services?', '「錢跟人走」是否是提供安老服務的合適模式？', 'd-elderly-people-carers'),
      (18, 'D3', 'How can gerontechnology improve the quality of life of elderly people?', '樂齡科技可以如何改善長者的生活質素？', 'd-elderly-people-carers'),
      (19, 'D4', 'Should Hong Kong expand elderly-care services in Guangdong for Hong Kong residents?', '香港是否應進一步擴展廣東的跨境安老服務？', 'd-elderly-people-carers'),
      (20, 'D5', 'How can the Government encourage businesses to develop the silver economy?', '政府可以如何鼓勵企業發展銀髮經濟？', 'd-elderly-people-carers'),
      (21, 'E1', 'Should neighbourhood childcare services be expanded to support working parents?', '是否應擴展鄰里幼兒照顧服務，以支援在職父母？', 'e-families-children-working-parents'),
      (22, 'E2', 'Should after-school childcare become available in more schools?', '是否應在更多學校提供課後託管服務？', 'e-families-children-working-parents'),
      (23, 'E3', 'How can the Government identify and support children with developmental difficulties earlier?', '政府可以如何更早識別及支援有發展困難的兒童？', 'e-families-children-working-parents'),
      (24, 'E4', 'Should Hong Kong require more professionals to report suspected child abuse?', '香港是否應要求更多專業人士舉報懷疑虐兒個案？', 'e-families-children-working-parents'),
      (25, 'E5', 'How can family-friendly employment practices become more common in Hong Kong workplaces?', '香港可以如何令家庭友善僱傭措施在工作場所更加普及？', 'e-families-children-working-parents'),
      (26, 'F1', 'Should the Government tighten the local recruitment requirement before employers can import workers?', '在僱主輸入勞工前，政府是否應收緊本地招聘要求？', 'f-jobs-wages-employment'),
      (27, 'F2', 'How can the Re-employment Allowance Scheme encourage more middle-aged people to return to work?', '再就業津貼計劃可以如何鼓勵更多中年人士重投職場？', 'f-jobs-wages-employment'),
      (28, 'F3', 'Should Hong Kong provide more incentives for employers to hire elderly and middle-aged workers?', '香港是否應提供更多誘因，鼓勵僱主聘請中高齡人士？', 'f-jobs-wages-employment'),
      (29, 'F4', 'How can vocational training better address manpower shortages in specific industries?', '職業培訓可以如何更有效應對個別行業的人手短缺？', 'f-jobs-wages-employment'),
      (30, 'F5', 'Should Hong Kong rely more on imported labour or improve the skills of local workers?', '香港應較依賴輸入勞工，還是提升本地工人的技能？', 'f-jobs-wages-employment'),
      (31, 'G1', 'Should AI literacy become a core part of the school curriculum?', '人工智能素養是否應成為學校核心課程的一部分？', 'g-education-young-people'),
      (32, 'G2', 'How can Hong Kong reduce the digital gap between students from different family backgrounds?', '香港可以如何收窄不同家庭背景學生之間的數碼差距？', 'g-education-young-people'),
      (33, 'G3', 'Should vocational and professional education be given the same status as traditional academic education?', '職業專才教育是否應與傳統學術教育享有同等地位？', 'g-education-young-people'),
      (34, 'G4', 'How can schools use AI without encouraging students to become over-dependent on it?', '學校可以如何使用人工智能，同時避免學生過度依賴它？', 'g-education-young-people'),
      (35, 'G5', 'Should schools place greater emphasis on competency and practical ability rather than examination results?', '學校是否應較重視能力及實際技能，而非考試成績？', 'g-education-young-people'),
      (36, 'H1', 'How can the “15-minute neighbourhood” concept improve daily life in Hong Kong?', '「15分鐘社區」概念可以如何改善香港市民的日常生活？', 'h-transport-getting-around'),
      (37, 'H2', 'Should Hong Kong expand smart demand-responsive public transport?', '香港是否應擴展智慧需求導向公共交通？', 'h-transport-getting-around'),
      (38, 'H3', 'Should autonomous vehicles be introduced more widely before the technology becomes fully mature?', '在技術尚未完全成熟前，香港是否應更廣泛引入自動駕駛車輛？', 'h-transport-getting-around'),
      (39, 'H4', 'How can smart transport technology improve the efficiency of Hong Kong’s road network?', '智慧交通科技可以如何提升香港道路網絡的效率？', 'h-transport-getting-around'),
      (40, 'H5', 'Should public transport concessions be based more on financial need than age?', '公共交通票價優惠是否應較着重經濟需要，而非年齡？', 'h-transport-getting-around'),
      (41, 'I1', 'Is targeted poverty alleviation more effective than providing universal welfare benefits?', '精準扶貧是否比全民福利更有效？', 'i-welfare-poverty-helping-people-in-need'),
      (42, 'I2', 'How can Community Living Rooms improve the lives of families living in inadequate housing?', '社區客廳可以如何改善居於不適切住房家庭的生活？', 'i-welfare-poverty-helping-people-in-need'),
      (43, 'I3', 'Should more welfare services be provided directly in local communities?', '是否應在社區內直接提供更多福利服務？', 'i-welfare-poverty-helping-people-in-need'),
      (44, 'I4', 'How can the Government help young people from low-income families improve their social mobility?', '政府可以如何協助低收入家庭的青年提升社會流動性？', 'i-welfare-poverty-helping-people-in-need'),
      (45, 'I5', 'Should carers of elderly people and persons with disabilities receive more direct financial support?', '長者及殘疾人士的照顧者是否應獲得更多直接經濟支援？', 'i-welfare-poverty-helping-people-in-need'),
      (46, 'J1', 'Should Hong Kong follow the “user pays” principle for more public services?', '香港是否應在更多公共服務中採用「用者自付」原則？', 'j-cost-of-living-peoples-financial-burden'),
      (47, 'J2', 'How can the Government reduce expenditure without lowering the quality of public services?', '政府可以如何在不降低公共服務質素的情況下削減開支？', 'j-cost-of-living-peoples-financial-burden'),
      (48, 'J3', 'Should the Government issue more bonds to finance major infrastructure projects?', '政府是否應發行更多債券，以資助大型基建項目？', 'j-cost-of-living-peoples-financial-burden'),
      (49, 'J4', 'How can Hong Kong broaden its revenue base while maintaining a simple and low tax system?', '香港可以如何在維持簡單低稅制的同時擴闊收入來源？', 'j-cost-of-living-peoples-financial-burden'),
      (50, 'J5', 'Should maintaining fiscal reserves take priority over providing short-term relief to households?', '維持財政儲備是否應比向家庭提供短期紓困措施更優先？', 'j-cost-of-living-peoples-financial-burden'),
      (51, 'K1', 'Should the Government take stronger enforcement action against owners who ignore mandatory building inspections?', '對於沒有遵從強制驗樓要求的業主，政府是否應採取更嚴厲的執法行動？', 'k-public-safety-emergency-preparedness-building-safety'),
      (52, 'K2', 'How can the Mandatory Building Inspection Scheme improve safety in ageing buildings?', '強制驗樓計劃可以如何改善老舊樓宇的安全？', 'k-public-safety-emergency-preparedness-building-safety'),
      (53, 'K3', 'Should public money be used to subsidise repairs in privately owned old buildings?', '是否應使用公帑資助私人舊樓的維修工程？', 'k-public-safety-emergency-preparedness-building-safety'),
      (54, 'K4', 'How can the Government reduce the risk of bid-rigging in building renovation projects?', '政府可以如何降低樓宇維修工程出現圍標的風險？', 'k-public-safety-emergency-preparedness-building-safety'),
      (55, 'K5', 'Should fire-safety improvement works be compulsory even when owners face financial difficulties?', '即使業主面對經濟困難，消防安全改善工程是否仍應強制進行？', 'k-public-safety-emergency-preparedness-building-safety')
  ) as topic(number, code, english, chinese, deck_slug)
  on conflict (id) do update
  set
    title = excluded.title,
    prompt = excluded.prompt,
    flashcard_url = excluded.flashcard_url,
    updated_at = excluded.updated_at;
end
$$;

notify pgrst, 'reload schema';
commit;
