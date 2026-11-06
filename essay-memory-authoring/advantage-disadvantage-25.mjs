// Five-year driving retests: safer habits and current rules versus capacity and fairness.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:25'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'In many countries, after people get permission to drive, they can keep driving for many years without another official check.',
 'Because of this, some people say drivers should take the driving test again every five years.',
 'This rule could have clear good points, but it could also make things hard to organise.',
 'One clear good point is that testing again could make roads safer by checking whether drivers can still drive well enough.',
 'As years pass, people often pick up bad habits, such as not looking in mirrors carefully, telling others they will turn too late or paying too little attention where roads meet.',
 'A required new test would make them fix these habits before they caused crashes.',
 'Also, this rule would help officials check that drivers still know the road rules used now.',
 'Road rules change. People who took their test many years ago may not know newer rules about speed, using phones or keeping people on bikes safe.',
 'So a check every few years could help protect people and remind drivers of current rules.',
 'But the bad points are also important.',
 'First, making all drivers take a test again every five years would put a lot of work on test centres and the people who give tests.',
 'In crowded places, so many people have driving licences that the waiting time could become too long to manage, upsetting people and using more public resources.',
 'Second, this rule could be unfair to good drivers who have driven safely for many years.',
 'A person who has driven carefully for twenty years might still fail on the day because they feel nervous, not because they cannot drive well.',
 'Then the rule would punish nervousness rather than make the roads safer.',
 'To sum up, a new driving test every five years could help drivers follow rules and drive better, but it could also put heavy pressure on test centres and cause unfair results for some people.',
];
const vocabulary=[
 v(['obtain a driving licence','get permission to drive','取得駕駛執照'],['continue driving for years','keep driving for many years','多年繼續駕駛'],['formally reassessed','another official check','正式重新評估']),
 v(['motorists','drivers','駕駛者'],['required','should','被要求'],['retake their driving test','take the driving test again','重考駕駛試']),
 v(['policy','rule','政策'],['clear benefits','clear good points','明顯好處'],['practical difficulties','hard to organise','實際困難']),
 v(['obvious advantage','clear good point','明顯優點'],['repeated testing','testing again','重複測試'],['road safety','roads safer','道路安全'],['acceptable standard','drive well enough','合格水平']),
 v(['Over time','As years pass','隨時間'],['develop bad habits','pick up bad habits','養成壞習慣'],['failing to check mirrors properly','not looking in mirrors carefully','沒有正確查看倒後鏡'],['signalling too late','telling others they will turn too late','太遲打方向燈'],['careless at junctions','paying too little attention where roads meet','路口粗心']),
 v(['compulsory retest','required new test','強制重考'],['force them to correct','make them fix','迫使糾正'],['accidents','crashes','交通意外']),
 v(['In addition','Also','此外'],['authorities','officials','當局'],['remain familiar with','still know','仍熟悉'],['current traffic laws','road rules used now','現行交通法規']),
 v(['Road rules do not stand still','Road rules change','交通規則會變'],['decades ago','many years ago','數十年前'],['unaware','may not know','可能不知道'],['speed limits','speed','車速限制'],['mobile phone use','using phones','使用手機'],['cyclist protection','keeping people on bikes safe','保護單車者']),
 v(['periodic assessment','check every few years','定期評估'],['safety net','help protect people','安全保障'],['refresher','remind drivers of current rules','重溫規則']),
 v(['However','But','然而'],['drawbacks','bad points','缺點'],['equally significant','also important','同樣重大']),
 v(['retake the test','take a test again','重考'],['heavy burden','a lot of work','沉重負擔'],['testing centres','test centres','考試中心'],['examiners','people who give tests','考官']),
 v(['densely populated areas','crowded places','人口稠密地區'],['licence holders','people have driving licences','持牌者'],['waiting times','waiting time','等候時間'],['unmanageable','too long to manage','難以控制'],['government resources','public resources','政府資源']),
 v(['unfairly affect','be unfair to','不公平影響'],['competent drivers','good drivers','有能力駕駛者'],['long records of safe driving','driven safely for many years','長期安全駕駛紀錄']),
 v(['driven responsibly','driven carefully','負責任駕駛'],['may still fail','might still fail','仍可能不合格'],['nerves on the day','feel nervous','當天緊張'],['genuine incompetence','cannot drive well','真正欠缺能力']),
 v(['In that case','Then','在那情況下'],['punish anxiety','punish nervousness','懲罰緊張'],['instead of improving safety','rather than make the roads safer','而非改善安全']),
 v(['In summary','To sum up','總結'],['driving standards','drive better','駕駛水平'],['update drivers’ knowledge','help drivers follow rules','更新知識'],['administrative pressure','heavy pressure on test centres','行政壓力'],['unfair outcomes','unfair results','不公平結果']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'In many countries, once workers earn a licence, they can keep using it for years without being formally reassessed.',d:[1,3,9],relation:'once 條件後說多年不用重新評估的現狀',formula:'In many countries, once [取得資格], people can [長期行動] without being formally reassessed',meaning:'不少地方取得駕照後可多年駕駛而不用重評。',links:['In many countries, once ', ', they can ', ' without being formally reassessed.'],labels:['取得資格','其後長期行動']},
 {example:'Some therefore argue that workers should be required to renew their safety training every five years.',d:[0,9,15],relation:'therefore 承接現狀提出定期重考政策',formula:'Some therefore argue that [群體] should be required to [定期重做的事] every five years',meaning:'有人主張駕駛者每五年重考。',links:['Some therefore argue that ', ' should be required to ', ' every five years.'],labels:['被要求者','定期任務']},
 {example:'This policy would bring certain clear benefits, although it would also create extra work for administrators.',d:[1,9,15],relation:'although 在引言預告好處與實際困難',formula:'This policy would bring certain clear benefits, although it would also create [實際困難]',meaning:'定期重考或有好處，也有行政與公平問題。',links:['This policy would bring certain clear benefits, although it would also create '],labels:['實際困難']},
 {example:'One obvious advantage is that repeated testing could improve workplace safety by ensuring that staff still meet an acceptable standard.',d:[2,9,10],relation:'by ensuring 解釋重測如何改善安全',formula:'One obvious advantage is that repeated testing could improve [安全面向] by ensuring that [受測者] still meet an acceptable standard',meaning:'定期考核可確認駕駛者仍達到安全水平。',links:['One obvious advantage is that repeated testing could improve ', ' by ensuring that ', ' still meet an acceptable standard.'],labels:['要改善的安全','受測者']},
 {example:'Over time, people often develop bad habits such as missing checks, reporting too late or becoming careless under pressure.',d:[3,9,10],relation:'such as 列出長期養成的具體壞習慣',formula:'Over time, people often develop bad habits such as [數項具體行為]',meaning:'駕駛者可能逐漸不查鏡、遲打燈、在路口粗心。',links:['Over time, people often develop bad habits such as '],labels:['具體壞習慣']},
 {example:'A compulsory retest would force them to correct these habits before they caused serious errors.',d:[3,9,10],relation:'before 指在意外前糾正不良習慣',formula:'A compulsory retest would force [受測者] to correct these habits before they caused [後果]',meaning:'重考或迫使駕駛者在事故前改正習慣。',links:['A compulsory retest would force ', ' to correct these habits before they caused '],labels:['受測者','要預防的後果']},
 {example:'In addition, such a system would help authorities ensure that operators remain familiar with current safety laws.',d:[3,9,10],relation:'In addition 增加跟上新法規的第二項好處',formula:'In addition, such a system would help authorities ensure that [群體] remain familiar with [現行規則]',meaning:'制度亦可檢查駕駛者是否仍熟悉新交通法。',links:['In addition, such a system would help authorities ensure that ', ' remain familiar with '],labels:['被檢查者','應熟悉規則']},
 {example:'Road rules do not stand still, and many operators who passed their test decades ago may be unaware of newer regulations on safety equipment.',d:[3,9,10],relation:'and 由規則變化推到舊資格者可能不知新規',formula:'Road rules do not stand still, and many [舊資格者] may be unaware of newer regulations on [新議題]',meaning:'早年考取駕照者或不知道新車速、手機與單車保護規則。',links:['Road rules do not stand still, and many ', ' may be unaware of newer regulations on '],labels:['舊資格者','新增規則']},
 {example:'A periodic assessment could therefore act as both a safety net and a refresher for long-time operators.',d:[3,9,10],relation:'both...and... 總結安全保障與知識重溫雙重功能',formula:'A periodic assessment could therefore act as both a [功能一] and a [功能二]',meaning:'定期考核可兼具安全保障與重溫規則作用。',links:['A periodic assessment could therefore act as both a ', ' and a '],labels:['第一功能','第二功能']},
 {example:'However, the practical drawbacks are equally significant.',d:[3,6,12],relation:'However 轉到同樣重要的缺點',formula:'However, the [缺點種類] drawbacks are equally significant',meaning:'作者認為行政與公平缺點也重大。',links:['However, the ', ' are equally significant.'],labels:['缺點']},
 {example:'First, making every operator retake the test every five years would place a heavy burden on training centres and instructors.',d:[3,9,12],relation:'強制全民重考對考場考官造成大規模工作量',formula:'First, making every [人群] retake the test every five years would place a heavy burden on [執行機構]',meaning:'大量駕駛者重考會加重考試中心與考官負擔。',links:['First, making every ', ' retake the test every five years would place a heavy burden on '],labels:['須重考者','執行者']},
 {example:'In densely populated areas, the number of applicants is so large that waiting times could become unmanageable, which would frustrate families and stretch public resources.',d:[3,9,12],relation:'so...that...which 串連人多、輪候及公共資源後果',formula:'In densely populated areas, the number of [申請者] is so large that [輪候問題], which would [後續影響]',meaning:'持牌人眾多可令輪候失控、惹公眾不滿並耗政府資源。',links:['In densely populated areas, the number of ', ' is so large that ', ', which would '],labels:['申請者','輪候問題','後續影響']},
 {example:'Second, this policy could unfairly affect experienced workers with long records of safe performance.',d:[3,9,11],relation:'Second 轉到勝任者也可能受不公平影響',formula:'Second, this policy could unfairly affect [合格群體] with long records of [良好表現]',meaning:'長期安全駕駛的能力者仍可能受重考政策不公平對待。',links:['Second, this policy could unfairly affect ', ' with long records of '],labels:['合格群體','長期表現']},
 {example:'Someone who has performed responsibly for twenty years may still fail because of nerves on the day rather than genuine incompetence.',d:[3,9,12],relation:'because...rather than 對比分數失敗與真正能力',formula:'Someone who has [良好紀錄] may still fail because of [偶發因素] rather than [真正能力不足]',meaning:'多年安全駕駛者可能因當天緊張而非真正不會駕駛而不合格。',links:['Someone who has ', ' may still fail because of ', ' rather than '],labels:['良好紀錄','偶發因素','能力問題']},
 {example:'In that case, the system would punish anxiety instead of improving learning.',d:[3,9,12],relation:'instead of 指制度懲罰緊張而未達安全目標',formula:'In that case, the system would punish [非目標對象] instead of improving [原定目標]',meaning:'若因緊張淘汰勝任者，制度未必真正改善安全。',links:['In that case, the system would punish ', ' instead of improving '],labels:['被錯誤懲罰的因素','原定目標']},
 {example:'In summary, requiring staff to retake a safety test every five years could raise standards and update their knowledge, but it could also create serious administrative pressure and unfair outcomes.',d:[3,9,12],relation:'結論用 but 概括兩項好處與兩項缺點',formula:'In summary, requiring [人群] to retake [測試] could raise [標準] and update [知識], but it could also create [行政與公平問題]',meaning:'重考可能提升標準及更新法規知識，也可能加重行政及帶來不公。',links:['In summary, requiring ', ' to retake ', ' could raise ', ' and update ', ', but it could also create '],labels:['人群','測試','標準','知識','代價']},
];
const usageGuides=[
 '當你要交代某資格取得後，可以多年不重新接受檢查的現狀時。',
 '當你要用 therefore 承接前述現狀，提出定期重新評估的主張時。',
 '當你要在引言用 although 同時預告政策好處與實施難處時。',
 '當你要用 by ensuring 說明定期測試如何可能提升安全時。',
 '當你要用 such as 列出抽象壞習慣的具體表現時。',
 '當你要用 before 說明改正應先於較嚴重後果發生時。',
 '當你要用 In addition 加入與安全習慣不同的規則更新好處時。',
 '當你要說明規則持續改變，舊有資格者因而可能不知新要求時。',
 '當你要用 both...and... 概括前述做法的兩項不同功能時。',
 '當你要用 However 從好處轉向同樣需要認真分析的缺點時。',
 '當你要指出普遍強制措施對執行機構帶來的工作量時。',
 '當你要用 so...that...which 串連人數、輪候與公共資源後果時。',
 '當你要用 Second 轉入與行政成本不同的公平問題時。',
 '當你要用 because...rather than 分辨一次失敗是偶發因素還是實際能力不足時。',
 '當你要用 instead of 指出制度執行方式可能偏離原定目標時。',
 '當你要在結論用 but 平衡重述政策的兩項收益與兩項代價時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先分清安全和規則更新，再分析考試容量與個人公平。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('本文討論哪一項政策？',['駕駛者每五年重新考一次駕駛試。','每名駕駛者每日重新買一輛車。','所有道路都只容許單車使用。','考官每五年停止工作。'],'核心是 compulsory retest every five years。'),
 {type:'multi',prompt:'範文指出定期重考哪兩項可能好處？',detail:'選兩項，再按「確認」。',options:['檢查並糾正逐漸養成的不安全習慣','幫助駕駛者重溫更新的交通法規','保證所有人一次考試都必然合格','完全免去考試中心的工作量'],correct:[0,1],why:'安全習慣與法規更新是兩條不同好處。'},
];
const route=[sequence('按原文還原定期重考利弊',[
 ['背景與政策','取得駕照後往往多年不重評；有人建議每五年重考。'],
 ['安全習慣','考核可促使人糾正不查鏡、遲打燈等壞習慣。'],
 ['更新規則','舊駕照持有人或不知新車速、手機及單車保護規則。'],
 ['行政負擔','大量持牌人重考可能造成排期失控及公共資源壓力。'],
 ['公平風險','安全紀錄良好者仍可能因當天緊張而不合格；結論保持兩面。'],
 ],'安全效果與規則更新不同；考試容量與錯誤淘汰也不同。')];
const evidence=[
 quiz('哪幾種壞習慣是範文的具體例子？',['沒有正確看倒後鏡、遲打方向燈及在路口粗心。','只比較不同車輛的顏色。','只記住道路名稱的字體。','每次開車都故意違反所有法律。'],'原文列出可觀察的駕駛行為。'),
 quiz('為何多年以前考牌的人需要更新知識？',['車速、手機及單車保護等交通規則可能改變。','駕照持有人必然完全忘記所有規則。','交通規則從來不會更新。','只因道路標誌的顏色很好看。'],'原文說 may be unaware，不是全部人都不知道。'),
 quiz('大規模重考對行政安排的主要風險是甚麼？',['考試中心及考官工作量大，輪候或變得難以管理。','考試中心會自動變得完全空閒。','只會影響汽車座椅尺寸。','政府資源必然完全不用增加。'],'人多、輪候與資源壓力是同一行政鏈。'),
 quiz('為何一名安全駕駛二十年的人仍可能不合格？',['可能因考試當天緊張，並非真正欠缺駕駛能力。','長期安全紀錄證明每次考試都必然合格。','只要緊張就代表必然造成交通意外。','重考與考試表現完全無關。'],'例子區分 nerves 與 genuine incompetence。'),
 quiz('這篇範文最後是否斷言政策一定要實行？',['沒有；結論同時概括好處、行政壓力和不公平結果。','有；結論說所有人必須立刻重考。','有；結論說政策完全沒有缺點。','沒有；但結論否認所有安全好處。'],'原文是雙面總結，沒有新增絕對政策命令。'),
];
const logic=[
 sequence('兩條可能的道路安全好處',[
 ['駕駛習慣','時間久了可能出現不查鏡、遲打燈等行為。'],
 ['定期檢查','重考或促使人及早改正，避免意外。'],
 ['法規更新','舊資格者可能不知道新交通規則。'],
 ['安全網','定期考核可兼具安全把關及知識重溫。'],
 ],'一條線檢查實際行為，另一條線更新規則知識。'),
 sequence('行政容量與公平代價',[
 ['全民定期重考','每五年都會有大量考生。'],
 ['容量壓力','考場考官不足或使輪候失控。'],
 ['單日表現','安全駕駛者可能只因當天緊張而失敗。'],
 ['制度結果','若把緊張誤當能力不足，政策可能偏離安全目標。'],
 ],'考試可提升安全，仍需檢查能否公平有效地實施。'),
];
const transfers=[
 transfer('一名司機多年未重考，習慣在轉彎前太遲打燈。','哪句準確轉用安全習慣論證？',["定期考核或可及早發現轉彎打燈習慣，讓司機在事故前改正", "只要司機多年沒有事故，轉彎打燈太遲便無須再檢查", "考核可指出問題，但應等到實際事故發生後才要求改正", "打燈習慣屬個人偏好，與其他道路使用者安全沒有關係"],["把定期評估連到及早辨認與修正壞習慣。", "無事故不代表所有習慣安全。", "延後改正會錯失預防作用。", "忽略提示其他道路使用者的安全功能。"],[3,4,5],'原文 retest force correction before accidents。'),
 transfer('一位駕駛者在二十年前考牌，最近有新的單車保護規則。','哪句對應範文第二項好處？',["定期評估可提醒舊牌照持有人學習其後更新的交通規則", "司機曾經合格，便不必再了解二十年來新增的規例", "新規例只需要新手學習，與持舊牌照者的行為無關", "重考可測轉彎技巧，卻不能包括任何更新後的法規"],["第二項好處是保持規則知識與時俱進。", "牌照曾合格不涵蓋之後變化。", "新規則也適用相關舊牌照駕駛者。", "錯誤排除法規知識。"],[6,7,8],'原文 periodic assessment as safety net and refresher。'),
 transfer('城市有一百萬名持牌人，重考中心只能安排少量考試。','哪句指出實施風險？',["全部持牌人定期重考，考場輪候與考官資源可能承壓", "只要重考有安全目標，考場人數限制便可完全忽略", "考試人數上升時，行政人手需求必然同步自然減少", "公共資源或需投入，但所有持牌人可在同一天完成重考"],["大規模政策會遇上容量與資源限制。", "良好目的不會自動增加考場。", "人數上升可能加重行政負擔。", "忽略安排一百萬人的容量。"],[10,11],'原文持牌人眾多可造成輪候和資源壓力。'),
 transfer('一名駕駛者二十年沒有事故，卻因考試緊張而失敗。','哪句符合範文的公平疑問？',["單次失敗可能反映當天焦慮，未必代表長期駕駛能力不足", "二十年沒有事故，便足以保證每次實際駕駛都完全安全", "駕駛者測試時緊張，便可直接判定日常駕駛也不合格", "只要重考能提升安全，就毋須檢查測試是否判得公平"],["區分考試當天表現與長期實際能力。", "無事故紀錄也不能保證絕無風險。", "焦慮不等同日常能力不足。", "安全目標仍須配合公平測量。"],[12,13,14],'原文 nerves on the day rather than genuine incompetence。'),
 transfer('學校計劃讓所有教師每五年重新考核急救技能。','哪句真正跨題使用本文框架？',["檢查急救技能與新指引，也衡量考核資源及單次誤判風險", "教師急救重考有安全收益，因此毋須估算考場和人手", "急救新指引需要更新，但教師一旦緊張便應永久停職", "只要每五年重考，所有教師就不需在期間持續練習"],["轉移更新技能與執行、公平三個分析面向。", "安全收益不取消行政成本。", "把焦慮造成的失誤處置過度。", "定期考核不取代平時練習。"],[3,6,10,13],'原文雙好處與雙缺點可跨題檢查。'),
 transfer('有人把「定期考核」寫成只有一項好處：看司機是否仍會駕車。','哪句補上另一項原文好處？',["考核亦可讓持牌者重溫考牌後新增或修改的交通法規", "考核只能測司機的操控技巧，不應包含任何現行規則", "只要司機仍能開車，新增的單車保護規則便毋須學習", "持牌年期較長便代表司機自然熟悉所有其後新規"],["補上更新規則知識的獨立好處。", "錯誤排除法規內容。", "技能仍須配合現行規則。", "年期不保證已學新規。"],[6,7,8],'原文 current laws + periodic refresher。'),
 transfer('政策制定者擬讓所有駕駛者同一個月重考。','哪句正確處理行政容量？',["先估算考場、考官與排期時間，避免重考規模超出容量", "全市同月重考雖人數多，考場仍可沿用平日的小班安排", "只要政策正式宣布，考官人數和場地便會自然足夠", "考試中心可縮短排期，但不需要估計實際持牌人總數"],["按需求估算容量後才決定排期。", "平日容量未必可應付集中需求。", "宣布不等於資源到位。", "仍須知道總需求。"],[10,11],'原文 heavy burden on centres/examiners 和 waiting times。'),
 transfer('一項測試的目標是提高安全，但容易讓勝任者因焦慮失敗。','哪句指出制度設計問題？',["若焦慮令勝任者失敗，便須查測試是否真能量度安全能力", "考生只要感到緊張，便足以判定他平日駕駛也危險", "測試若可找出危險行為，就不用再看它是否誤判他人", "勝任司機偶爾失敗，便證明道路安全目標不再重要"],["安全測量要同時留意錯誤排除勝任者。", "情緒不直接等於日常能力。", "有效制度亦須控制誤判。", "公平風險不否定安全目標。"],[13,14],'原文 punish anxiety instead of improving safety。'),
 transfer('作文討論定期駕駛重考，已列好處，卻未寫缺點。','哪句能補足最貼近原文的兩條風險？',["大量重考或加重輪候與資源負擔，勝任者亦可能被誤判", "重考可以更新知識，故考場容量和單次測試公平性皆無關", "只要考試人數夠多，排期和行政成本便會自然減少", "考核有安全目的，所以勝任者因焦慮失敗也不用處理"],["補出行政負擔與公平誤判兩條不同風險。", "好處不能取消兩項代價。", "需求增加通常不使成本自然降低。", "仍須設計公平測量。"],[10,11,12,13],'原文考場負擔和不公平結果兩項缺點。'),
 transfer('結論需同時保持定期考核的利與弊。','哪句符合範文的結尾？',["考核可更新知識與安全習慣，也可能帶來成本和不公平", "考核有安全收益，便代表所有行政資源壓力可以忽略", "考場與考官或會承壓，所以定期考核不可能有任何好處", "結論只需列出新規則，毋須比較安全、公平與執行成本"],["同時保留安全收益、行政成本與公平問題。", "只看好處而漏掉成本。", "只看成本而否定好處。", "沒有完整權衡。"],[15],'原文結論同時概括 standards/knowledge 與 pressure/unfairness。'),
];
const revised=[
 {wrong:['多年無事故，打燈太遲的習慣應屬較小安全問題','考核能指出問題，但改正可留到下次牌照更新','打燈時間是個人習慣，其他人可自行調整反應'],why:['無事故紀錄不代表習慣沒有風險。','及早改正正是定期考核的安全目的。','其他道路使用者也會受打燈時機影響。']},
 {wrong:['司機既曾合格，後來新增規例可由新聞自行了解','新規例主要給新手學習，舊牌照持有人較少受影響','重考著重駕駛技巧，更新法規可交予日常經驗'],why:['定期評估可確保舊牌照者重溫新規。','交通規則更新也適用於舊牌照者。','日常經驗不一定涵蓋所有新法規。']},
 {wrong:['重考有安全目標，考場限制可先由排期逐步解決','考試人數上升，行政需求主要只在首年增加','公共資源需投入，但大批持牌人可集中同月測試'],why:['須先評估排期及考場容量。','定期重考會持續帶來行政需要。','集中測試可能令容量不足。']},
 {wrong:['二十年無事故，單次考試失敗應較少影響判斷','測試時緊張，便可推知日常駕駛能力也會較差','重考提升安全，單次判斷公平性可列為次要'],why:['無事故也不足以直接判定是否合格。','測試焦慮未必反映平日能力。','制度仍須避免誤判勝任者。']},
 {wrong:['教師急救重考有安全收益，考核人手可沿用原編制','急救指引更新後，教師緊張失敗可視為技能不足','每五年重考一次，期間練習可交由教師自行決定'],why:['大規模考核仍需估算行政資源。','單次焦慮可能造成誤判。','定期考核不取代持續練習。']},
 {wrong:['考核應著重操控技巧，現行規則可在路上逐步熟悉','司機能開車後，新的單車保護規則作用便較小','持牌年期較長，便可推知對新規例也較熟悉'],why:['原文第二個好處正是更新法規。','舊牌照者仍須遵守新規則。','年資不能證明掌握後來修訂的法規。']},
 {wrong:['同月重考人數雖多，平日考場安排可按比例擴大','政策宣布後，考官可先靠加班應付新增人數','考試中心可縮短排期，持牌人總數可稍後核對'],why:['需要先估算實際場地和人手容量。','加班不是足夠考官的可靠替代。','排期規劃需要持牌人數資料。']},
 {wrong:['考生測試時緊張，平日駕駛能力也可能同樣不穩','測試找出危險行為，誤判問題可交由覆核處理','勝任者偶爾失敗，安全目標便應轉向其他政策'],why:['測試焦慮不能直接代表日常能力。','覆核有用，測試設計仍須減少誤判。','誤判提示改進測試，不取消安全目標。']},
 {wrong:['重考更新知識，考場容量可列為執行細節處理','考試人數多時，排期與成本可由規模攤薄','考核有安全目的，焦慮誤判可交由司機自行克服'],why:['容量是範文指出的主要缺點。','規模增加也可能加重輪候及成本。','制度需回應勝任者遭誤判的風險。']},
 {wrong:['安全收益清楚，行政資源壓力可留待實施再看','考場考官承壓，考核的知識更新收益便較有限','結論列出新規則即可，公平與成本可放進正文'],why:['結論仍要承認執行成本。','行政代價不否定考核的安全收益。','結論應收束利弊和權衡。']},
];
revised.forEach((r,i)=>{transfers[i].options=[transfers[i].options[0],...r.wrong];transfers[i].explanations=[transfers[i].explanations[0],...r.why]});
transfers[0].options[0]='定期考核或及早發現打燈太遲，讓司機在事故前改正';
transfers[1].options[0]='定期評估可提醒舊牌照者學習後來更新的交通規則';
transfers[2].options[0]='定期重考大量持牌人，考場與考官資源可能承壓';
transfers[3].options[0]='單次失敗或反映當天焦慮，未必代表平日能力不足';
transfers[4].options[0]='查急救技能與新指引，也衡量資源與單次誤判風險';
transfers[5].options[0]='考核可讓持牌者重溫考牌後新增的交通法規';
transfers[6].options[0]='先估算考場、考官和排期，避免重考超出容量';
transfers[7].options[0]='焦慮使勝任者失敗時，須查測試能否量度安全能力';
transfers[8].options[0]='重考增輪候與資源負擔，勝任者亦可能被誤判';
transfers[9].options[0]='考核可更新知識與習慣，也可能增加成本與誤判';
export default {key:'advantage-disadvantage:25',meta:{topic:'五年駕駛重考的安全與公平',summary:'範文分析定期重考如何糾正壞習慣並更新交通規則，也指出考場考官容量不足及勝任駕駛者可能因緊張被誤判；結論保持兩面。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
