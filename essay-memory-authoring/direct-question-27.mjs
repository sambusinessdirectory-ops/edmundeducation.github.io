// Human-authored support for Direct Question 27; exact English and Chinese remain in the source bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-27-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:27'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'As people live longer, caring for people over ninety is becoming an urgent problem for society.',
  'Although families’ love matters, I think the government should be responsible for older people’s care, because older people now need planned health care, money and social help that many families cannot give.',
  'The first reason is that caring for older people today is too difficult to leave only to family members.',
  'A person over ninety may need daily nursing, help taking medicines, changes to their home, help with movement and rides to hospital.',
  'Most adult children already work, pay home loans and raise their own children, so asking them to give skilled care can harm both the older person’s health and the carer’s income.',
  'For example, if an older woman has a serious memory illness, her family’s kindness cannot take the place of trained carers, safe places and regular doctor checks.',
  'Services paid for by the government, on the other hand, can give reliable basic help through hospitals, local nurses, care homes with lower fees and pensions.',
  'Another reason is that care should be fair.',
  'If care mostly depends on families, older people without children, with relatives far away or with little money suffer for things they cannot control, while those in richer families can more often live their later years with respect and proper care.',
  'A government care system can set basic rules, check care homes, help pay for care at home and protect older people from being ignored or having money taken unfairly.',
  'For example, a man whose wife has died and whose children live abroad should still get basic help, a safe place to live and medical care.',
  'So caring for older people is not just a family’s private problem; society has a duty to help.',
  'People who have worked and helped society for many years should not be left alone when they become weak.',
  'To sum up, families should still spend time with and care about older relatives, but the government should take responsibility for their care.',
  'Family love can give warmth, but only public services can give regular, checked and fair care.',
];
const vocabulary=[
  [['life expectancy rises','people live longer','壽命上升'],['people in their nineties','people over ninety','九十多歲的人'],['pressing social issue','urgent problem for society','迫切社會議題']],
  [['family affection is valuable','families’ love matters','家庭親情可貴'],['responsibility for elderly care should rest with the government','government should be responsible for older people’s care','政府負照護責任'],['old age now requires','older people now need','如今高齡需要'],['organised medical, financial, and social support','planned health care, money and social help','有組織醫療財政社會支援'],['private households often cannot provide','many families cannot give','私人家庭難提供']],
  [['modern elderly care','caring for older people today','現代長者照護'],['far too complex','too difficult','太複雜'],['left to relatives','leave only to family members','交由親屬獨力承擔']],
  [['A person in their nineties','A person over ninety','九十多歲的人'],['medicine management','help taking medicines','藥物管理'],['home modifications','changes to their home','家居改裝'],['physiotherapy','help with movement','物理治療'],['transport to hospitals','rides to hospital','往返醫院交通']],
  [['juggling jobs, mortgages, and their own children','work, pay home loans and raise their own children','兼顧工作房貸子女'],['professional care','skilled care','專業照護'],['damage','harm','損害'],['carer’s livelihood','carer’s income','照顧者生計']],
  [['elderly woman develops dementia','older woman has a serious memory illness','長者患認知障礙症'],['goodwill from her family','family’s kindness','家人善意'],['cannot replace','cannot take the place of','不能取代'],['trained carers','trained carers','受訓照顧者'],['safe facilities','safe places','安全設施'],['regular medical supervision','regular doctor checks','定期醫療監督']],
  [['Government-funded services','Services paid for by the government','政府資助服務'],['by contrast','on the other hand','相比之下'],['reliable safety net','reliable basic help','可靠基本保障'],['community nurses','local nurses','社區護士'],['subsidised residential homes','care homes with lower fees','受資助安老院']],
  [['Another reason','Another reason','另一原因'],['fairness','care should be fair','公平']],
  [['depends mainly on family','mostly depends on families','主要依靠家庭'],['no children','without children','沒有子女'],['relatives live far away','relatives far away','親屬住得遠'],['poor households','with little money','貧困家庭'],['circumstances beyond their control','things they cannot control','無法控制的處境'],['wealthier families','richer families','較富裕家庭'],['age with dignity','live their later years with respect and proper care','有尊嚴地老去']],
  [['government system','government care system','政府制度'],['minimum standards','basic rules','最低標準'],['inspect care homes','check care homes','巡查安老院'],['home-care subsidies','help pay for care at home','家居照護津貼'],['neglect','being ignored','疏忽'],['financial exploitation','having money taken unfairly','財務剝削']],
  [['widower','man whose wife has died','鰥夫'],['children live overseas','children live abroad','子女在海外'],['basic support','basic help','基本支援'],['safe accommodation','safe place to live','安全住所'],['medical attention','medical care','醫療照顧']],
  [['In this sense','So','從這意義'],['not merely a private family matter','not just a family’s private problem','不只私人家庭事務'],['part of the social contract','society has a duty to help','社會共同責任']],
  [['contributed to society','helped society','為社會貢獻'],['throughout their working lives','for many years','整個工作生涯'],['should not be abandoned','should not be left alone','不應被遺棄'],['frailty arrives','they become weak','身體變弱']],
  [['In conclusion','To sum up','總結'],['remain emotionally involved','spend time with and care about older relatives','情感上繼續參與'],['responsibility for caring for elderly citizens','responsibility for their care','照護長者責任'],['should belong to the government','government should take responsibility','政府負責']],
  [['Family love','Family love','家庭的愛'],['provide warmth','give warmth','提供溫暖'],['public systems','public services','公共制度'],['consistent, regulated, and equitable care','regular, checked and fair care','持續受監管且公平照護']],
];
const chunkOverrides=[
  ['As life expectancy rises,','care for people in their nineties','is becoming a pressing social issue.'],
  ['Although family affection is valuable,','I believe the responsibility for elderly care','should rest with the government rather than with individual families,','because old age now requires organised medical, financial,','and social support that private households often cannot provide.'],
  ['The first reason is that modern elderly care','is far too complex to be left to relatives.'],
  ['A person in their nineties may need daily nursing,','medicine management, home modifications, physiotherapy,','and transport to hospitals.'],
  ['Most adult children are already juggling jobs, mortgages,','and their own children,','so expecting them to deliver professional care','can damage both the older person’s health','and the carer’s livelihood.'],
  ['For instance, if an elderly woman develops dementia,','goodwill from her family cannot replace trained carers,','safe facilities, and regular medical supervision.'],
  ['Government-funded services, by contrast,','can provide a reliable safety net through hospitals,','community nurses, subsidised residential homes, and pensions.'],
  ['Another reason','is fairness.'],
  ['If care depends mainly on family,','elderly people who have no children,','whose relatives live far away,','or who live in poor households','are punished for circumstances beyond their control,','while those from wealthier families','are more likely to age with dignity.'],
  ['A government system can set minimum standards,','inspect care homes, offer home-care subsidies,','and protect older people from neglect or financial exploitation.'],
  ['For example, a widower whose children live overseas','should still be able to receive basic support,','safe accommodation, and medical attention.'],
  ['In this sense, elderly care is not merely','a private family matter;','it is part of the social contract.'],
  ['People who have contributed to society','throughout their working lives should not be abandoned','when frailty arrives.'],
  ['In conclusion, families should remain emotionally involved,','but the responsibility for caring for elderly citizens','should belong to the government.'],
  ['Family love can provide warmth,','but only public systems can provide consistent,','regulated, and equitable care.'],
];
const simpleChunkOverrides=[
  ['As people live longer,','caring for people over ninety','is becoming an urgent problem for society.'],
  ['Although families’ love matters,','I think the government should be responsible','for older people’s care,','because older people now need planned health care, money','and social help that many families cannot give.'],
  ['The first reason is that','caring for older people today is too difficult','to leave only to family members.'],
  ['A person over ninety may need daily nursing,','help taking medicines, changes to their home,','help with movement and rides to hospital.'],
  ['Most adult children already work,','pay home loans and raise their own children,','so asking them to give skilled care','can harm both the older person’s health','and the carer’s income.'],
  ['For example, if an older woman has','a serious memory illness,','her family’s kindness cannot take the place of trained carers,','safe places and regular doctor checks.'],
  ['Services paid for by the government, on the other hand,','can give reliable basic help through hospitals,','local nurses, care homes with lower fees','and pensions.'],
  ['Another reason is that','care should be fair.'],
  ['If care mostly depends on families,','older people without children, with relatives far away','or with little money suffer for things they cannot control,','while those in richer families can more often','live their later years with respect and proper care.'],
  ['A government care system can set basic rules,','check care homes, help pay for care at home','and protect older people from being ignored','or having money taken unfairly.'],
  ['For example, a man whose wife has died','and whose children live abroad','should still get basic help,','a safe place to live and medical care.'],
  ['So caring for older people is not just','a family’s private problem;','society has a duty to help.'],
  ['People who have worked and helped society','for many years should not be left alone','when they become weak.'],
  ['To sum up, families should still spend time','with and care about older relatives,','but the government should take responsibility for their care.'],
  ['Family love can give warmth,','but only public services can give regular,','checked and fair care.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,functionName,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${functionName}，與原句的句型和語意關係相同。`,distractorReason:`這句${functionName}；它表達的是另一種關係。`};}
const structures=[
  card('As life expectancy rises, access to daily care is becoming an urgent community issue.','用 As ... rises 指出人口變化如何使照護問題更迫切',[1,2,7],
    fixed(0,'As [預期壽命] rises, [九十多歲長者照護] is becoming [迫切社會議題].','引言交代老年人口增加後，照護安排為何值得公共討論。','題目問長者由誰照顧，先說明問題日益重要的背景時。',['As ', ' rises, ', ' is becoming '],['上升的人口指標','需求增加的照護','因此出現的公共議題'])),
  card('Although family affection matters, I believe disability support should rest with public services rather than with individual households, because severe disability now requires specialist help that families often cannot provide.','用 Although ... rather than ... because 分清親情價值與主要責任',[0,6,13],
    fixed(1,'Although [家庭親情可貴], I believe [長者照護責任] should rest with [政府] rather than with [個別家庭], because [高齡照護] now requires [醫療、財政及社會支援] that [私人家庭] often cannot provide.','承認家人感情重要，同時把主要照護責任歸政府，理由是所需支援超出多數家庭能力。','要先承認另一方有價值，再選擇責任主體，並用 because 說明能力上的理由時。',['Although ', ', I believe ', ' should rest with ', ' rather than with ', ', because ', ' now requires ', ' that ', ' often cannot provide.'],['先承認的親情價值','須歸屬的責任','應負主要責任者','不應獨力承擔者','需要支援的高齡階段','需有組織提供的支援','能力有限的家庭'])),
  card('The first reason is that modern medical care is far too complex to be left to untrained relatives.','用 far too ... to be left to 提出家庭難獨力處理專業照護',[1,3,4],
    fixed(2,'The first reason is that [現代長者照護] is far too [複雜] to be left to [親屬].','第一主體段先界定專業照護的複雜程度與家庭能力落差。','要解釋政府為何須承擔主要責任，先提出照護超出一般家庭訓練時。',['The first reason is that ', ' is far too ', ' to be left to '],['需要處理的照護','超出一般能力的程度','不能獨力承擔者'])),
  card('A frail patient may need daily nursing, medicine checks, help moving around, safer bathrooms, and transport to hospital.','用 may need 並列高齡者可能需要的具體服務',[2,4,5],
    fixed(3,'[九十多歲長者] may need [日常護理], [藥物管理], [家居改裝], [物理治療], and [醫院交通].','逐項說明專業照護涉及醫療、住家及交通，而非單純陪伴。','提出照護太複雜後，需要列出能檢驗的實際需求時。',[' may need ', ', ', ', ', ', ', ', and '],['可能需要照護的人','持續護理','服藥安排','住家安全','身體功能支援','就醫交通'])),
  card('Most adult children are already juggling jobs and home loans, so expecting them to deliver professional care can damage both the parent’s health and the carer’s livelihood.','用 already ... so expecting ... can damage both ... and ... 寫雙方負擔',[2,3,6],
    fixed(4,'[成年子女] are already juggling [工作、按揭及孩子], so expecting them to deliver [專業照護] can damage both [長者健康] and [照顧者生計].','成年子女已有多重責任；若再要求專業照護，長者與照顧者都可能受損。','已列長者需求，要指出把全部工作交給家人可能帶來的雙重風險時。',[' are already juggling ', ', so expecting them to deliver ', ' can damage both ', ' and '],['已承擔家庭責任的人','現有工作及家庭壓力','被要求提供的服務','長者可能受損之處','照顧者可能受損之處'])),
  card('For instance, if a parent develops dementia, family kindness cannot replace trained nurses and regular doctor visits.','用 For instance, if ... cannot replace 說明善意不能代替專業照護',[3,4,6],
    fixed(5,'For instance, if [長者患認知障礙症], [家人善意] cannot replace [受訓照顧者、安全設施及定期醫療監督].','以認知障礙症為例，分清家人的感情支持與專業安全需求。','需要證明「家庭未必有能力」時，用一個專業要求明確的個案。',['For instance, if ', ', ', ' cannot replace '],['需專業照護的情況','不能獨力完成照護的善意','不可缺的專業支援'])),
  card('Publicly funded services, by contrast, can provide a safety net through hospitals, local nurses, care homes and pensions.','用 by contrast ... through 對照政府可提供的服務網絡',[2,4,5],
    fixed(6,'[政府資助服務], by contrast, can provide [可靠保障] through [醫院、社區護士、安老院及退休金].','由家庭能力限制轉到政府能整合的醫療、居住與收入支援。','已說家人不能取代專業服務，接着要交代公共制度如何填補缺口時。',[', by contrast, can provide ', ' through '],['政府資助服務','可靠保障','服務網絡'])),
  card('Another reason is equal access to care.','用 Another reason is 轉入公平性理由',[2,8,9],
    fixed(7,'Another reason is [公平].','第二主體段把焦點由照護複雜性轉向不同家庭背景的公平性。','第一個專業照護理由已說完，須提出另一個獨立理由時。',['Another reason is '],['第二項責任判斷理由'])),
  card('If medical care depends on family money, poorer patients are punished for circumstances they cannot control, while wealthier households are more likely to obtain timely treatment.','用 If ... while ... 對比家境不同導致的照護差距',[6,7,10],
    fixed(8,'If [照護主要依賴家庭], [沒有子女、親屬住遠或家境差的長者] are punished for [無法控制的處境], while [富裕家庭長者] are more likely to [有尊嚴地老去].','指出只靠家人會令長者的照護質素取決於子女、距離與財力。','已提出公平問題，要說清家庭背景如何造成不應有的差距時。',['If ', ', ', ' are punished for ', ', while ', ' are more likely to '],['導致不公平的照護安排','較缺支援的長者','無法自行選擇的家庭處境','較有資源的長者','比較出的晚年結果'])),
  card('A government system can set care rules, inspect homes, fund home visits, and protect seniors from abuse.','用 can set ... inspect ... offer ... and protect 列公共制度的四類保障',[6,8,10],
    fixed(9,'A government system can [設最低標準], [巡查安老院], [提供家居照護津貼], and [防止忽視與財務剝削].','政府責任具體包含規則、監察、補助及保護，而非只宣稱關心。','提出公平問題後，需要列制度能怎樣保障不同背景的長者時。',['A government system can ', ', ', ', ', ', and '],['照護品質底線','對院舍的監察','讓居家照護可負擔的支援','對長者的風險防護'])),
  card('For example, a widower whose children live abroad should still be able to receive safe housing and medical support.','用 For example ... whose ... should still 說明沒有子女在身邊者仍應受保障',[8,9,11],
    fixed(10,'For example, [子女住海外的鰥夫] should still be able to receive [基本支援、安全住所及醫療照顧].','用子女不在身邊的長者，檢驗公共保障是否公平。','已說政府可設最低保障，要舉出不應因家庭距離而失去照護的人時。',['For example, ', ' should still be able to receive '],['家庭支持有限的長者','仍應得到的基本服務'])),
  card('In this sense, care for people with disabilities is not merely a private matter; it is a shared social duty.','用 not merely ...; it is ... 把照護提升到公共責任',[7,8,12],
    fixed(11,'In this sense, [長者照護] is not merely [私人家庭事務]; it is [社會共同承諾].','前面公平例子顯示，照護不應完全受家庭條件決定。','已說制度須讓無子女或貧困長者受保障，要概括其公共責任時。',['In this sense, ', ' is not merely ', '; it is '],['要重新界定的照護','不足以涵蓋責任的私人層面','社會層面的義務'])),
  card('People who have supported their community for years should not be abandoned when they become frail.','用 People who ... should not ... when ... 說明長者不應因衰弱被遺棄',[8,10,11],
    fixed(12,'People who [長期為社會貢獻] should not be [遺棄] when [身體變弱].','用長者一生的社會貢獻作結，強化公共保障的道德依據。','公平理由已說清，還要指出社會對曾作貢獻者的持續責任時。',['People who ', ' should not be ', ' when '],['早年作出的貢獻','不應出現的對待','最需要照顧的時候'])),
  card('In conclusion, families should remain emotionally close, but formal care should belong to the government.','用 families should ... but ... government 釐清情感參與與制度責任',[1,11,14],
    fixed(13,'In conclusion, [家人] should remain [情感參與], but [長者照護責任] should belong to [政府].','結論不排斥家人關心；它明確把主要正式照護責任歸公共制度。','最後要回答家庭與政府誰應負責，同時保留家人親情作用時。',['In conclusion, ', ' should remain ', ', but ', ' should belong to '],['應繼續參與的家人','家人保留的角色','須清楚歸屬的照護責任','承擔制度責任者'])),
  card('Family love can provide warmth, but only public systems can provide reliable, checked and fair care.','用 Family love ... but only public systems ... 區分溫暖與可持續制度服務',[1,6,13],
    fixed(14,'[家庭的愛] can provide [溫暖], but only [公共制度] can provide [持續、受監管且公平照護].','最後用兩者各擅長的作用，說明為何政府負主要責任、家人仍有價值。','結論要以一句精確對照收束家人與政府不同角色時。',[' can provide ', ', but only ', ' can provide '],['能提供關愛者','家庭可提供的情感支持','能提供制度服務者','制度可提供的照護品質'])),
];
const wrongReasons=[
  ['引言立場判斷誰負責，沒有先說壽命上升使需求迫切。','照護複雜性是第一理由，不是人口變化的開場背景。','公平是第二理由，沒有指出長壽帶來的公共議題。'],
  ['長壽背景只引題，沒有 Although 親情和 rather than 責任歸屬。','政府服務列可提供甚麼，沒有引言清楚表態誰負主要責任。','結論重申角色，但沒有引言完整說明醫療財務社會支援的理由。'],
  ['引言有立場和多種支援，沒有 far too complex 的首項理由。','照護需求清單是後續細節，沒有先命名複雜性。','成年子女壓力是家庭難承擔的解釋，不是第一句理由總述。'],
  ['複雜性是總述，沒有列出護理、藥物、家居、物理及交通需求。','照顧者負擔說家庭能力，沒有長者所需服務清單。','認知障礙例子集中專業要求，沒有普遍服務需求清單。'],
  ['照護太複雜是總原因，沒有說成年子女負擔及雙方受損。','長者需求清單沒有把照顧者工作和按揭納入。','公共保障網是解法，沒有家庭獨力照護的雙重風險。'],
  ['長者需求清單是一般需要，沒有失智個案與善意不足的對照。','成年子女忙碌是背景，沒有 trained carers 不可取代的具體例子。','政府服務是制度回應，沒有 if 個案中家人善意的界限。'],
  ['複雜性總述沒有列公共服務如何填補家庭能力缺口。','成年子女負擔說家庭困境，沒有 by contrast 的制度支援。','認知障礙例子說專業需要，沒有醫院護士院舍退休金的網絡。'],
  ['第一理由是複雜性，沒有轉入另一個公平角度。','家庭背景差距是後續解釋，沒有先標示公平理由。','政府制度措施回應公平，沒有段首 Another reason 的轉段作用。'],
  ['公共保障網說制度能供甚麼，沒有 If 家庭依賴引起的財富差距。','公平段首只命名理由，沒有無子女及富裕長者的對照。','鰥夫個案是公平的例子，沒有完整條件與比較。'],
  ['公共保障網先列服務來源，沒有設標準、巡查、補助與防剝削的治理動作。','家庭背景差距是問題，沒有政府怎樣設規則保護長者。','海外子女例子顯示需求，沒有四類制度行動清單。'],
  ['家庭差距是一般分析，沒有子女在海外的特定個案。','制度行動是一般措施，沒有 should still 的公平測試。','社會契約概括公共責任，沒有這名鰥夫的具體需要。'],
  ['公平是段首理由，沒有 not merely 家庭事務的重新界定。','家境差距是具體不公，沒有把照護提升到社會承諾。','早年貢獻補充道德根據，沒有私人與公共角色對照。'],
  ['家境差距說目前不同人受保障不均，沒有長者貢獻與衰弱時不應被棄。','鰥夫例子說基本服務，不談一生社會貢獻。','社會契約是概括原則，沒有 People who... when... 的道德情境。'],
  ['引言已有立場，沒有結論對家人情感參與和政府責任的簡潔重申。','社會契約說照護屬公共責任，沒有明確保留家人的情感角色。','最後一句對照溫暖與制度品質，是此句後的原因收束。'],
  ['引言說支援能力和責任歸屬，沒有最後的 warmth 與公正照護對照。','服務安全網列公共供給，沒有家庭之愛的情感作用。','結論責任句分配角色，沒有說兩種角色各能提供甚麼。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要作者決定甚麼？',[
    '長者主要由家庭照顧，還是由政府承擔正式照護責任',
    '哪間安老院舍最便宜，以及哪種退休金最高',
    '只說家庭親情重要，不判斷誰提供實際照護',
    '只討論人們活到幾歲，不談照護責任歸屬',
  ],'作者要在家庭與政府之間作出責任判斷，並提出依據。'),
  {type:'multi',prompt:'選出範文支持政府承擔主要責任的兩個理由',detail:'選兩項，再按「確認」。',options:[
    '高齡照護需要專業醫療與服務，許多家庭難以獨力提供',
    '公共制度能減少照護因子女、住址或財力不同而失衡',
    '只要家人有愛，訓練、設施和醫療監督都可以省去',
    '沒有子女或家境較差的長者可完全不受任何保障',
  ],correct:[0,1],why:'第一段談專業複雜性；第二段談公平及最低保障。'},
];
const route=[sequence('依照範文次序排列四段的任務',[
  ['引言表態','長壽令照護更迫切；家人親情重要，但政府應負主要責任。'],
  ['理由一：照護複雜','護理、藥物與設施需要專業服務，成年子女難以獨力承擔。'],
  ['理由二：公平保障','缺子女或貧困者仍應受照護，政府可設標準、巡查及津貼。'],
  ['結論分清角色','家庭維持情感參與，公共制度提供持續、受監管而公平的照護。'],
],'先判斷責任，再用專業能力和公平性兩種理由支持它。')];
const evidence=[
  quiz('九十多歲長者可能需要哪些專業支援？',[
    '日常護理、藥物管理、家居改裝、物理治療及就醫交通',
    '只要有人陪伴，就不用任何藥物或就醫安排',
    '只需要退休金，家居安全與護理都不重要',
    '只靠家人善意，便能取代所有受訓照顧者',
  ],'需求清單證明照護不只是家人定期探望。'),
  quiz('為何不能要求成年子女獨力提供專業照護？',[
    '他們已兼顧工作、按揭和孩子，長者健康與其生計都可能受損',
    '所有成年子女都完全沒有工作，也不用照顧自己的孩子',
    '專業照護不用訓練，亦不會影響長者的安全',
    '只要家人同住，任何醫療需求便會自行消失',
  ],'作者指出同時可能傷害長者與照顧者。'),
  quiz('認知障礙症例子要證明甚麼？',[
    '家人善意不能代替受訓照顧者、安全設施和醫療監督',
    '認知障礙症只需要親情，完全不用醫療服務',
    '家人關心會阻止長者使用任何公共服務',
    '所有長者都患同一種病，因此只需同一做法',
  ],'善意重要，但不能直接完成專業的安全與醫療工作。'),
  quiz('政府資助服務可透過哪些途徑提供保障？',[
    '醫院、社區護士、受資助院舍與退休金形成服務網絡',
    '只掛一張關懷海報，不安排醫療與收入支援',
    '只靠鄰居偶爾探望，不設任何照護服務',
    '只把責任交回每個家庭，不幫助沒有子女的長者',
  ],'保障由多種服務組成，不是單一安老院或一筆錢。'),
  quiz('只依靠家庭，哪類長者可能受到不公平影響？',[
    '沒有子女、親屬住得遠或家境較差的長者',
    '只有已經得到完整照護的富裕長者',
    '只有經常參與社區活動的年輕居民',
    '只有已離開家鄉的受訓護理人員',
  ],'照護不應由長者無法控制的家庭條件決定。'),
  quiz('政府制度可以做哪幾件具體事？',[
    '設最低標準、巡查院舍、提供家居津貼並防止忽視與財務剝削',
    '只要求長者自行判斷院舍安全，完全不用巡查',
    '只給富裕家庭津貼，沒有子女者毋須保障',
    '只宣傳家人親情，不設規則或處理財務剝削',
  ],'公平要落在品質規則、監察、津貼及風險防護上。'),
  quiz('範文最後如何分配家人和政府的角色？',[
    '家人繼續關心長者，政府負責可持續且受監管的正式照護',
    '家人完全停止接觸長者，政府只負責表達親情',
    '所有家庭自行負擔專業服務，公共制度不用參與',
    '只要家人提供溫暖，照護公平與品質便不用考慮',
  ],'作者沒有排除家人，但把正式責任交給公共制度。'),
];
const logic=[
  sequence('專業能力：從長者需求到公共保障',[
    ['照護複雜','高齡者可同時需要護理、藥物、居家改裝和就醫交通。'],
    ['成年子女負擔','工作、按揭與育兒使專業照護難由親屬獨力完成。'],
    ['認知障礙例子','家人善意不能取代受訓照顧者與醫療監督。'],
    ['制度保障','政府可透過醫院、社區護士、院舍和退休金組成安全網。'],
  ],'不是否定親情，而是指出專業服務需要可靠制度。'),
  sequence('公平性：從家庭差距到社會責任',[
    ['家庭條件有別','無子女、親屬遠或貧困者較難靠私人資源受照護。'],
    ['公共制度工具','最低標準、院舍巡查、家居津貼和反剝削保障。'],
    ['鰥夫例子','即使子女住海外，長者仍應得到基本醫療與安全住所。'],
    ['公共責任','曾為社會作貢獻者，不應在衰弱時被遺棄。'],
  ],'公平並非每個家庭付同樣的錢，而是每名長者都有基本保障。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('一位長者患認知障礙症，女兒很關心她，卻沒有護理訓練。','哪項最能轉用範文的專業照護原則？',[
    '保留女兒關心，安排受訓照顧者與定期醫療監督',
    '只要女兒有愛，便可取消所有安全和醫療安排',
    '女兒沒有護理訓練，所以不應再探望長者',
    '只添置電視，便能完全代替專業人員和設施',
  ],[
    '範文分清親情與專業安全需求，兩者可同時存在。',
    '善意不能直接取代醫療訓練。',
    '原文仍重視家人情感參與。',
    '設備不是受訓照護和醫療監督。',
  ],[3,5,13,14],'範文說家人善意不能取代專業照護，同時家人仍應情感參與。'),
  transfer('成年子女需工作及供樓，父親每天仍須專業護理和往返醫院。','哪項最符合範文對照顧者負擔的分析？',[
    '公共服務承接護理，避免長者健康與子女生計受損',
    '要求子女立即放棄所有收入，獨自完成全部護理',
    '只靠偶爾電話慰問，便可處理每日就醫交通',
    '認定按揭與工作都不會影響子女照護能力',
  ],[
    '範文指出專業需求加上工作按揭，可同時傷及兩代。',
    '這把成本全押在子女身上。',
    '電話不能提供日常護理或交通。',
    '題目明說兩種壓力並存。',
  ],[3,4,6],'範文說成年子女兼顧工作與家庭，要求其提供專業照護可能傷及雙方。'),
  transfer('一名獨居長者沒有子女，鄰居認為他因此不應獲任何公費照護。','哪項最能回應這種判斷？',[
    '基本照護不應取決於有沒有子女，制度須設保障',
    '沒有子女是長者自己選擇，所有服務都應取消',
    '只讓家境富裕者獲得優質醫療和安全住所',
    '只靠鄰居善意，不用任何政府最低照護標準',
  ],[
    '範文公平論點反對長者因家庭處境而失去基本保障。',
    '題目沒有說這是可控制的選擇。',
    '這會放大財力造成的照護差距。',
    '善意不能替代制度最低標準。',
  ],[7,8,9,10],'範文說沒有子女的長者不應因家庭條件而受懲罰。'),
  transfer('兩間安老院舍收費相近，其中一間未經巡查，長者常被忽視。','哪項最貼近範文的政府措施？',[
    '訂最低照護標準、巡查院舍，並保護長者免受忽視',
    '只看收費相近，就假設兩間院舍照護品質完全相同',
    '把全部院舍巡查責任交給病弱長者獨自處理',
    '只增加宣傳海報，不檢查院舍內的實際照護情況',
  ],[
    '範文明列最低標準、院舍巡查與防止 neglect。',
    '價格相近不能證明品質相同。',
    '長者需要可執行的監管。',
    '宣傳不等同實際檢查。',
  ],[9],'範文說政府制度應設標準、巡查院舍並保護長者免受忽視。'),
  transfer('一位長者的親屬住海外，住家需要改裝，並且每月須去醫院。','哪項最能轉用範文的保障網概念？',[
    '結合家居改裝、就醫交通與護士，不只靠遠方親屬',
    '親屬住海外便代表長者不再需要醫療照顧',
    '只給一次禮物，不安排住家安全或就醫服務',
    '認為遠方親屬必能每天親身到場照護長者',
  ],[
    '範文把家居改裝、就醫交通及社區服務連成支援網。',
    '住址距離不會取消照護需要。',
    '一次禮物不能應付持續需求。',
    '海外距離使日常親身照顧更難。',
  ],[3,6,10],'範文列出住家改裝與就醫交通，亦說海外子女的父親仍應獲保障。'),
  transfer('社區照護計劃只處理醫院預約，卻不處理長者被詐騙或濫用金錢。','哪項最符合範文的完整公共責任？',[
    '醫療以外要防止忽視和財務剝削，並設基本標準',
    '只要能預約醫院，長者的金錢安全便不需管',
    '財務剝削只是私人問題，公共制度不應介入',
    '取消院舍巡查，把所有責任全交給個別家庭',
  ],[
    '範文把醫療服務與防止 financial exploitation 並列。',
    '能預約不等於免受剝削。',
    '原文明列政府防剝削責任。',
    '巡查也是制度的保障工具。',
  ],[6,9],'範文的政府制度同時提供醫療、最低標準與反財務剝削。'),
  transfer('學校有熱心家長義工，但一些學生需要受訓人員提供特殊學習支援。','哪項最能轉用範文的「善意與專業」區分？',[
    '保留家長關心，特殊需要仍須受訓人員持續支援',
    '家長有善意就必然具備所有特殊教育技能',
    '只要聘請專業人員，家長就毋須再關心孩子',
    '取消專業支援，讓學生自行處理所有困難',
  ],[
    '範文說家人情感參與有價值，卻不能取代專業技能。',
    '善意並不等於專門訓練。',
    '原文沒有排除家庭角色。',
    '有需求者仍需合適支援。',
  ],[1,2,5,13],'範文在認知障礙例子中明確區分家人善意與受訓照護。'),
  transfer('地方政府把全部長者照護成本交給家庭，各家收入差距很大。','哪項最符合範文的公平性論證？',[
    '建立公共底線，避免照護質素只由家庭財力決定',
    '家境越差，便越應減少長者可用的基本醫療照護',
    '只要家人有不同收入，政府就完全不用訂標準',
    '只援助已有充足私人護理資源的富裕家庭',
  ],[
    '範文反對照護品質被家庭財力決定，主張政府最低標準。',
    '這加劇而非減少不公平。',
    '收入差距正是需公共標準的理由。',
    '這忽略支援較少的長者。',
  ],[7,8,9],'範文以貧富家庭的晚年差距支持公共保障。'),
  transfer('一位曾工作數十年的長者身體變弱，卻因沒有近親而被拒絕照護。','哪項最能轉用範文的社會責任觀？',[
    '社會不應在他衰弱時遺棄他，照護不靠近親決定',
    '他沒有近親，所以過去的社會貢獻已全部失效',
    '只要長者停止工作，就不再需要安全住所',
    '是否照護只看家人住得多近，不問身體需要',
  ],[
    '範文主張曾作貢獻的人在衰弱時仍應受保障。',
    '家庭距離不會抹去社會責任。',
    '衰弱反而提高照護需要。',
    '照護判斷應看需要與制度底線。',
  ],[8,10,11,12],'範文說長者照護不只屬家庭事務，衰弱時不可遺棄曾作貢獻者。'),
  transfer('題目要求在家庭和政府之間決定誰負長者照護主要責任。','哪項結論最完整？',[
    '家庭保留情感參與，政府提供持續、受監管且公平照護',
    '只說家人很有愛，不判斷正式照護應由誰承擔',
    '只列醫院和院舍數量，不說家人與政府各自的角色',
    '只要求子女負擔全部專業費用，不看公平問題',
  ],[
    '範文最後兩句明確區分家人的溫暖與公共制度品質。',
    '題目要求責任歸屬。',
    '只列服務沒有說清角色。',
    '這與原文公平論證相反。',
  ],[13,14],'範文結論保留家人情感角色，卻將正式照護責任歸政府。'),
];
const revised=[
 {options:['保留女兒關心，安排受訓照顧者與定期醫療監督','由女兒處理日常護理，醫院只在病情惡化時介入','安排定期醫療檢查，但減少女兒探望以便管理','先改裝住家並購買設備，暫緩安排受訓照護'],explanations:['親情與受訓照護可並存，並須持續監督。','認知障礙症的日常安全需求不能只靠沒有訓練的女兒。','專業服務不需要排除女兒的情感參與。','環境與設備有用，仍不能取代受訓者的日常照護。']},
 {options:['公共服務承接護理，避免長者健康與子女生計受損','給子女一次護理講座，再由他獨力承擔日常工作','替父親安排交通，但其餘專業護理都由子女提供','補貼子女部分薪金，卻不安排父親所需護理'],explanations:['專業服務可回應健康需要，也減輕家庭工作與房貸壓力。','一次講座不足以承擔每日專業護理。','交通只解決一部分需求，不能代替日常照護。','收入支援有用，但題目中的護理需要仍未處理。']},
 {options:['基本照護不應取決於有沒有子女，制度須設保障','先由鄰居輪流幫忙，待病情加重才評估公共服務','給有子女長者優先資格，獨居者只列候補名單','按居住年期分配照護，不考慮獨居者的實際需要'],explanations:['基本保障須按需要提供，不能由家庭結構決定。','鄰里協助可補充支援，不能代替穩定的制度保障。','把家庭結構作為優先條件會使獨居長者處境更差。','居住年期未能反映此人的照護需要。']},
 {options:['訂最低照護標準、巡查院舍，並保護長者免受忽視','先比較收費，再讓院舍自行決定是否公開照護紀錄','只在收到嚴重投訴時檢查，平日由院舍自行評估','要求家屬增加探訪，卻不檢查院舍照護程序'],explanations:['最低標準與定期巡查可發現並處理忽視。','相近收費無法證明照護品質，需要獨立標準。','只靠嚴重投訴，可能錯過尚未能投訴的長者。','探訪有益，但不能取代監管院舍的公共責任。']},
 {options:['結合家居改裝、就醫交通與護士，不只靠遠方親屬','先安排醫院交通，但暫不處理家居安全與日常護理','請海外親屬定期通話，藉此取代本地照護安排','安排護士每月探訪，卻不評估外出就醫的障礙'],explanations:['幾項服務連成持續的支援網，回應不同需要。','就醫交通有用，但家居安全與護理仍未解決。','遠方聯絡有情感價值，不能提供當地日常支援。','護士探訪不足以解決住家與醫院之間的交通需求。']},
 {options:['醫療以外要防止忽視和財務剝削，並設基本標準','強化醫院預約系統，財務問題只由家人自行處理','增派接送車輛，但暫不建立剝削的通報機制','只向長者發防騙單張，沒有後續調查或保護安排'],explanations:['完整責任涵蓋醫療、最低標準和防止剝削。','預約服務有用，卻未處理題目中的財務風險。','接送改善就醫，但不能識別或處理財務剝削。','資訊可提醒風險，仍需可執行的通報與保護。']},
 {options:['保留家長關心，特殊需要仍須受訓人員持續支援','先由家長義工教學，遇到困難才考慮專業評估','由受訓人員包辦學習，家長只負責接送學生','安排家長與教師面談，暫緩特殊支援的實際提供'],explanations:['家庭關心可保留，而特殊需要須有專業技能支援。','沒有評估與訓練的義工未必能回應特殊需要。','專業服務不需要排除家長在學習中的角色。','面談有助溝通，不能替代所需的持續支援。']},
 {options:['建立公共底線，避免照護質素只由家庭財力決定','向低收入家庭提供資訊，但不設可負擔照護服務','讓各家庭自行購買護理，政府只核對服務價目','先增加私人院舍名額，暫不處理低收入者的負擔'],explanations:['公共底線使基本照護不因家庭收入而出現差距。','資訊有用，但無法讓缺乏資源的家庭取得服務。','價目透明仍無法確保不同收入家庭負擔得起。','私人名額增加，不代表低收入長者可獲基本照護。']},
 {options:['社會不應在他衰弱時遺棄他，照護不靠近親決定','先尋找遠房親戚，再決定他是否有資格獲照護','按過去薪金高低分配服務，不先評估目前健康需要','只提供短期慰問，待他找到近親後再安排護理'],explanations:['照護應回應衰弱時的需要，不能由近親有無決定。','尋找親戚可有助聯絡，但不應延誤所需照護。','薪金紀錄未必反映當前健康與安全需要。','慰問不能取代已明確需要的正式照護安排。']},
 {options:['家庭保留情感參與，政府提供持續、受監管且公平照護','家庭負責護理與費用，政府只在家屬申請時提供資料','政府安排醫療和院舍，家庭應退出長者日常生活','讓家庭與院舍自行商議標準，政府只負責宣傳'],explanations:['結論清楚分配家庭情感與政府正式照護責任。','資料不能代替受監管且公平的持續服務。','正式服務與家人的情感參與可以並存。','沒有公共標準，照護品質可能取決於家庭資源。']}
];
revised.forEach((r,i)=>{transferTasks[i].options=r.options;transferTasks[i].explanations=r.explanations});
export default {key:'direct-question:27',meta:{topic:'長者照護的家庭與政府責任',summary:'親情重要，但高齡照護複雜且須公平；政府應承擔正式制度責任。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
