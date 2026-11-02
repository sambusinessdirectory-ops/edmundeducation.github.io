// Full source-specific memorisation support for Discuss Both Views 20.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-20-ielts-discuss-both-views.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['discuss-both-views:20'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'Dirty air in big cities is often connected with people using their own cars a lot.',
  'Some people say a worldwide day without cars would help reduce dirty air, but others say wider changes would work better.',
  'I think a day without cars can make more people notice the problem, but better air for a long time needs stronger rules about how people travel that stay in place.',
  'People who support a worldwide day without cars say it can quickly and clearly cut road traffic and dirty gases.',
  'If many millions of drivers around the world did not use their cars for one day, city streets would be quieter, cleaner and less full of traffic.',
  'This may also make people think about how they travel every day.',
  'For example, a worker who usually drives a short way to work may find that taking a bus or train, riding a bike or walking is easier than they thought.',
  'In this way, a day without cars can help people notice a problem and see that cleaner city life is possible.',
  'But I think other answers work much better because dirty air is a problem every day, not just for one day.',
  'A day that stands for change may cut dirty gases for a short time, but roads are usually busy again the next morning.',
  'Instead, governments should pay for buses and trains people can count on, build safe bike paths and set stronger rules about how much dirty gas cars may release.',
  'Over time, these rules change how people travel because they make cleaner ways of travelling easy to use, low in cost and pleasant.',
  'For example, if buses and trains cost little, come on time and are comfortable, many people going to work will choose them rather than drive.',
  'Unlike a day without cars, these changes deal with the main reason the problem keeps happening.',
  'To sum up, a worldwide day without cars does some good because it can make people notice the issue and cut dirty air for a short time.',
  'Even so, I strongly think long-term changes to travel work much better for cleaner air because they change how people move every day, not just once a year.',
];
const vocabulary=[
  [['Air pollution','Dirty air','空氣污染'],['major cities','big cities','大城市'],['linked to','connected with','相關'],['heavy use of private vehicles','people using their own cars a lot','大量私家車']],
  [['international car-free day','worldwide day without cars','國際無車日'],['reduce this problem','reduce dirty air','減少污染'],['broader measures','wider changes','更廣措施'],['more effective','work better','更有效']],
  [['In my view','I think','在我看來'],['raise public awareness','make more people notice the problem','提高公眾意識'],['lasting improvements','better air for a long time','持久改善'],['transport policies','rules about how people travel','交通政策'],['permanent','stay in place','長期推行']],
  [['Supporters','People who support','支持者'],['international car-free day','worldwide day without cars','國際無車日'],['immediate, visible reduction','quickly and clearly cut','即時明顯減少'],['traffic','road traffic','車流'],['emissions','dirty gases','排放']],
  [['millions of drivers','many millions of drivers','數百萬司機'],['left their cars at home','did not use their cars','把車留在家'],['one day','one day','一天'],['less congested','less full of traffic','較不擁擠']],
  [['encourage people to reflect','make people think','鼓勵反思'],['daily travel habits','how they travel every day','日常出行習慣']],
  [['For example','For example','例如'],['office worker','worker','辦公室職員'],['normally drives','usually drives','平時開車'],['public transport','bus or train','公共交通'],['cycling','riding a bike','騎單車'],['not as inconvenient as they had assumed','easier than they thought','沒想像中不便']],
  [['In this sense','In this way','從這意義'],['act as a useful wake-up call','help people notice a problem','提醒改變'],['cleaner urban life','cleaner city life','更清潔城市生活'],['possible','possible','可能']],
  [['However','But','然而'],['other solutions','other answers','其他方法'],['far more effective','work much better','有效得多'],['daily problem','problem every day','每日問題'],['one-day problem','just for one day','一日問題']],
  [['symbolic event','day that stands for change','象徵活動'],['briefly reduce emissions','cut dirty gases for a short time','暫減排放'],['traffic usually returns to normal','roads are usually busy again','車流回復']],
  [['Governments should instead invest','Instead, governments should pay','政府改投資'],['reliable public transport','buses and trains people can count on','可靠公共交通'],['safe cycling lanes','safe bike paths','安全單車徑'],['stricter emission standards','stronger rules about how much dirty gas cars may release','更嚴排放標準']],
  [['over time','Over time','隨時間'],['change people’s behaviour','change how people travel','改變行為'],['cleaner choices','cleaner ways of travelling','清潔選擇'],['practical','easy to use','可行'],['affordable','low in cost','負擔得起'],['attractive','pleasant','吸引']],
  [['For instance','For example','例如'],['cheap','cost little','便宜'],['punctual','come on time','準時'],['comfortable','comfortable','舒適'],['commuters','people going to work','通勤者'],['instead of driving','rather than drive','而非開車']],
  [['Unlike a car-free day','Unlike a day without cars','與無車日不同'],['these measures','these changes','這些措施'],['attack the root of the problem','deal with the main reason the problem keeps happening','處理根源']],
  [['In conclusion','To sum up','總結'],['has some value','does some good','有一定價值'],['raise awareness','make people notice the issue','提高意識'],['temporarily reduce pollution','cut dirty air for a short time','暫減污染']],
  [['Nevertheless','Even so','然而'],['firmly believe','strongly think','堅信'],['long-term transport reform','long-term changes to travel','長期交通改革'],['air quality','cleaner air','空氣質素'],['every day rather than only once a year','every day, not just once a year','每日而非一年一次']],
];
const chunkOverrides=[
  ['Air pollution in major cities is often linked','to the heavy use of private vehicles.'],
  ['While some people believe that an international car-free day','would be a useful way to reduce this problem,','others argue that broader measures would be more effective.'],
  ['In my view, although a car-free day can raise public awareness,','lasting improvements require stronger and more permanent transport policies.'],
  ['Supporters of an international car-free day argue','that it can produce an immediate, visible reduction','in traffic and emissions.'],
  ['If millions of drivers around the world','left their cars at home for one day,','city streets would become quieter, cleaner, and less congested.'],
  ['This could also encourage people','to reflect on their daily travel habits.'],
  ['For example, an office worker who normally drives','a short distance to work might realise','that public transport, cycling, or walking','is not as inconvenient as they had assumed.'],
  ['In this sense, a car-free day can act','as a useful wake-up call, showing the public','that cleaner urban life is possible.'],
  ['However, I believe other solutions are far more effective','because air pollution is a daily problem,','not a one-day problem.'],
  ['A symbolic event may briefly reduce emissions,','but traffic usually returns to normal the next morning.'],
  ['Governments should instead invest in reliable public transport,','create safe cycling lanes, and introduce','stricter emission standards for vehicles.'],
  ['These policies change people’s behaviour over time','because they make cleaner choices practical,','affordable, and attractive.'],
  ['For instance, if buses and trains are cheap,','punctual, and comfortable, many commuters will naturally choose them','instead of driving.'],
  ['Unlike a car-free day, these measures','attack the root of the problem.'],
  ['In conclusion, an international car-free day has some value','because it can raise awareness','and temporarily reduce pollution.'],
  ['Nevertheless, I firmly believe that long-term transport reform','is a much more effective way to improve air quality,','as it changes how people travel every day','rather than only once a year.'],
];
const simpleChunkOverrides=[
  ['Dirty air in big cities is often connected','with people using their own cars a lot.'],
  ['Some people say a worldwide day without cars','would help reduce dirty air, but others say','wider changes would work better.'],
  ['I think a day without cars can make more people notice the problem,','but better air for a long time needs stronger rules','about how people travel that stay in place.'],
  ['People who support a worldwide day without cars','say it can quickly and clearly cut road traffic','and dirty gases.'],
  ['If many millions of drivers around the world','did not use their cars for one day,','city streets would be quieter, cleaner','and less full of traffic.'],
  ['This may also make people think','about how they travel every day.'],
  ['For example, a worker who usually drives a short way to work','may find that taking a bus or train,','riding a bike or walking is easier than they thought.'],
  ['In this way, a day without cars can help people','notice a problem and see that cleaner city life is possible.'],
  ['But I think other answers work much better','because dirty air is a problem every day,','not just for one day.'],
  ['A day that stands for change may cut dirty gases','for a short time, but roads are usually busy again','the next morning.'],
  ['Instead, governments should pay for buses and trains','people can count on, build safe bike paths','and set stronger rules about how much dirty gas cars may release.'],
  ['Over time, these rules change how people travel','because they make cleaner ways of travelling','easy to use, low in cost and pleasant.'],
  ['For example, if buses and trains cost little,','come on time and are comfortable,','many people going to work will choose them','rather than drive.'],
  ['Unlike a day without cars, these changes deal with','the main reason the problem keeps happening.'],
  ['To sum up, a worldwide day without cars does some good','because it can make people notice the issue','and cut dirty air for a short time.'],
  ['Even so, I strongly think long-term changes to travel','work much better for cleaner air because they change','how people move every day, not just once a year.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
  card('Poor health in cities is often linked to heavy use of private cars.','以 is linked to 連接空氣污染與私家車使用',[1,2,8],fixed(0,'[城市空氣污染] is often linked to [大量私家車使用].','開篇先交代要減少的污染與主要交通來源。','要界定一個問題常與哪種具體行為相關時。',[' is often linked to '],['需要處理的問題','與它相關的活動'])),
  card('While some people believe that one public event will help, others argue that wider rules would work better.','以 While some ... others ... 並列無車日與廣泛措施',[0,3,8],fixed(1,'While some people believe that [國際無車日有助減污], others argue that [更廣措施較有效].','題目兩種方案被公平列出：一次性活動與廣泛政策。','要在引言並列對同一問題的兩種解法及效果判斷時。',['While some people believe that ', ', others argue that '],['第一方支持的解法','另一方支持的解法'])),
  card('In my view, although a safety day can raise awareness, lasting improvements require permanent road rules.','以 although ... lasting ... require ... 讓步宣傳但選長期政策',[1,7,14],fixed(2,'In my view, although [無車日可提高意識], lasting improvements require [有力且長期的交通政策].','作者承認宣傳作用，仍以持久改善為主要判準。','某短期活動有提醒作用，但要指出持久結果仍需制度措施時。',['In my view, although ', ', lasting improvements require '],['短期措施的有限好處','真正持久所需的政策'])),
  card('Supporters of a public clean-up day argue that it can produce a visible reduction in litter.','以 immediate, visible reduction 說活動當日的直接效果',[1,4,5],fixed(3,'Supporters of [國際無車日] argue that it can produce [即時明顯減少] in [交通量及排放].','支持方強調活動當天可見的交通與排放下降。','要公平呈現某短期措施的立即、可觀察效益時。',['Supporters of ', ' argue that it can produce ', ' in '],['被支持的活動','它承諾的即時幅度','被改善的指標'])),
  card('If thousands of shoppers stayed home for a day, the streets would become quieter and less crowded.','以 If ... would ... 推想當日少開車的街道變化',[3,5,6],fixed(4,'If [數百萬司機一天不開車], [城市街道] would become [較靜、較清潔、較少塞車].','用假設情況展示活動一天的可見成果。','要用假設情境說明若很多人同日改變行為，公共空間會怎樣時。',['If ', ', ', ' would become '],['大量人改變行為的條件','受影響的空間','可能產生的變化'])),
  card('A trial day could also encourage residents to reflect on their daily energy habits.','以 encourage ... reflect on ... 說活動可促使反思',[4,6,7],fixed(5,'[活動] could also encourage [人們] to reflect on [日常出行習慣].','無車日不只當天減污，也可令參與者重新審視習慣。','某體驗除即時效果外，還可能使參與者檢視平日做法時。',[' could also encourage ', ' to reflect on '],['帶來反思的活動','反思的人','被重新審視的習慣'])),
  card('For example, a worker who normally drives might realise that cycling is not as inconvenient as they had assumed.','以 might realise ... not as inconvenient as ... 展示觀念改變',[5,7,12],fixed(6,'For example, [平時短途開車的職員] might realise that [巴士單車步行] is not as inconvenient as they had assumed.','親身試另一交通方式可能修正原先的想像。','要舉例說一次實際體驗如何推翻對替代選項的不便預設時。',['For example, ', ' might realise that ', ' is not as inconvenient as they had assumed.'],['有既定習慣的人','曾被低估的替代做法'])),
  card('In this sense, a trial day can act as a wake-up call, showing people that change is possible.','以 wake-up call 概括活動的提醒作用',[3,6,8],fixed(7,'In this sense, [無車日] can act as [提醒改變的契機], showing [公眾] that [清潔城市生活] is possible.','支持方最強處是讓公眾看見另一種城市生活可行。','已舉體驗例子，要概括短期活動如何提醒人們改變有可能時。',['In this sense, ', ' can act as ', ', showing ', ' that ', ' is possible.'],['提供體驗的活動','喚起注意的作用','被提醒的人','因此看見可能性的事'])),
  card('However, I believe regular services are far more effective because traffic is a daily problem, not a one-day problem.','以 daily ... not one-day ... 界定問題的時間尺度',[2,7,9],fixed(8,'However, [其他解法] are far more effective because [污染] is a daily problem, not a one-day problem.','污染天天發生，因此不能主要靠每年一次的活動。','要以問題持續發生的頻率，檢驗短期措施是否足夠時。',['However, I believe ', ' are far more effective because ', ' is a daily problem, not a one-day problem.'],['被認為較有效的方案','每天持續的問題'])),
  card('A symbolic campaign may briefly reduce street litter, but rubbish usually returns to normal the next day.','以 may briefly ... but ... returns ... 說象徵活動效果短暫',[3,8,10],fixed(9,'[象徵活動] may briefly reduce [排放], but [交通] usually returns to normal [翌晨].','活動當天減排後，車流翌日常回復。','要分清一次性活動的短暫成果與翌日回復的常態時。',[' may briefly reduce ', ', but ', ' usually returns to normal '],['短期活動','當下減少的指標','之後回復的行為','回復的時間'])),
  card('Governments should instead invest in clean buses, create safe bike paths, and introduce stronger vehicle rules.','以 invest ... create ... introduce ... 列長期交通政策',[9,11,12],fixed(10,'Governments should instead invest in [可靠公共交通], create [安全單車徑], and introduce [較嚴排放標準].','替代方案從公共交通、騎行環境與排放標準著手。','已指出活動效果短，要列出政府可長期維持的具體制度措施時。',['Governments should instead invest in ', ', create ', ', and introduce '],['持續服務的交通投資','替代出行的安全設施','直接減排的規則'])),
  card('Better transport policies change travel habits over time because they make cleaner choices practical, affordable, and attractive.','以 because make choices practical affordable attractive 說政策改習慣',[10,12,13],fixed(11,'[長期政策] change [出行行為] over time because they make [清潔選擇] practical, affordable, and attractive.','政策有效因為它把每日較清潔的選擇變得值得採用。','已列政策，要解釋它如何改變日常選擇而非只提出口號時。',[' change ', ' over time because they make ', ' practical, affordable, and attractive.'],['持續執行的措施','被逐漸改變的行為','因而更可行的選項'])),
  card('For instance, if trains are cheap and punctual, many workers will naturally choose them instead of driving.','以 if ... choose ... instead of ... 具體化公共交通替代開車',[10,11,13],fixed(12,'For instance, if [巴士火車便宜準時舒適], [通勤者] will naturally choose [公共交通] instead of [開車].','公共交通的價格服務品質使日常轉乘有吸引力。','要舉條件例子說替代方案具備哪些品質時，人們才會改選它時。',['For instance, if ', ', ', ' will naturally choose ', ' instead of '],['替代選項的有利條件','作日常決定的人','因此被選的新方式','原本的做法'])),
  card('Unlike a one-day campaign, steady services attack the root of the problem.','以 Unlike ... root of problem 比較宣傳與根源措施',[8,10,12],fixed(13,'Unlike [無車日], [長期措施] attack [問題根源].','永久措施改變每天的選擇，才觸及持續污染源。','已比較兩類方法，要明確指出哪一類更能處理日常發生的根本原因時。',['Unlike ', ', ', ' attack '],['只短暫作用的方案','針對原因的措施','被處理的根源'])),
  card('In conclusion, a clean-up day has some value because it can remind residents and briefly reduce waste.','以 has some value because ... 公平保留短期活動用途',[2,8,15],fixed(14,'In conclusion, [國際無車日] has some value because it can [提高意識] and [暫減污染].','結論先公平保留活動的宣傳與暫時減排作用。','要在結尾承認較少支持的措施仍有兩項有限好處時。',['In conclusion, ', ' has some value because it can ', ' and '],['有限有用的活動','第一個短期好處','第二個短期好處'])),
  card('Nevertheless, I firmly believe that a year-round bike network is a much more effective way to improve air quality, as it changes daily travel rather than one-day behaviour.','以 as ... every day rather than once a year 重申長期改革優先',[2,13,14],fixed(15,'Nevertheless, I firmly believe that [長期交通改革] is a much more effective way to improve [空氣質素], as it changes [每日出行] rather than [一年一次].','最終按每日影響而非一年一次的表現選長期政策。','已承認活動有限價值，仍要以改變日常行為的頻率決定較佳方案時。',['Nevertheless, I firmly believe that ', ' is a much more effective way to improve ', ', as it changes ', ' rather than '],['較應選的長期改革','要改善的結果','需要每日改變的行為','不足夠的低頻改變'])),
];
const wrongReasons=[
  ['這句列無車日與廣泛政策兩方，原句先交代污染與私家車關聯。','這句引言選長期政策，未先提出污染來源。','這句已進入作者反對一次活動的理由，非背景設定。'],
  ['這句只說私家車與空氣污染相關，未列兩種解決方案。','這句是無車日支持者的主體理由，未並列另一方。','這句已選長期政策，未公平報告雙方。'],
  ['這句平衡列出兩派，未以 although 讓步宣傳後選持久政策。','這句概括無車日可帶即時減排，未評估長期效果。','這句結論保留無車日好處，未在引言選長期政策。'],
  ['這句只列兩派觀點，未具體說無車日當天可見減排。','這句是假設司機同日停開後街道變化，未先概括。','這句說活動可促使反思，與即時減少交通排放不同。'],
  ['這句概括支持方的即時好處，未以 If 假設數百萬司機停開。','這句說參與者反思習慣，未描寫街道當天變化。','這句是職員試替代交通的個案，原句先作群體假設。'],
  ['這句只說街道安靜清潔，未說活動可能促使反思。','這句具體寫職員發現其他方式不太不便，未先概括。','這句以 wake-up call 總結提醒作用，原句先提出反思。'],
  ['這句只說活動鼓勵反思，未舉短途開車者的發現。','這句把活動概括為提醒，未呈現替代交通的親身體驗。','這句已說巴士火車夠好時通勤者會改選，是政策例子。'],
  ['這句概括當日減排，未說活動可提醒公眾另一種生活。','這句職員發現替代交通可行，未抽成 wake-up call。','這句已轉入每日污染問題，與支持方總結不同。'],
  ['這句在引言已選持久政策，未以每日問題解釋原因。','這句仍肯定無車日的提醒作用，未轉到它的時間界線。','這句說交通翌日回復，原句先指出每日問題與一日方案不相稱。'],
  ['這句比較每日問題與一日方案，未描述翌晨車流回復。','這句提出政府長期措施，未先說象徵活動的效果為何短。','這句說政策長期改變行為，未舉活動只暫時減排。'],
  ['這句警告車流翌日回復，未列可替代的公共交通單車徑排放標準。','這句解釋長期政策如何使選擇更可行，未先列政策內容。','這句是廉價準時巴士火車的個案，未列政府三項措施。'],
  ['這句列政府應做甚麼，未說為何那些措施能長期改變行為。','這句是通勤者改選巴士火車的例子，未抽出可行可負擔機制。','這句概括根源措施，未分析政策如何影響每日選擇。'],
  ['這句列公共交通等政策，未以 if 舉服務夠好時人會轉乘。','這句概括政策使清潔選擇吸引，未以車費準時舒適作例。','這句把長期措施概括為治本，未提供通勤者個案。'],
  ['這句只說每日污染需要更有效方法，未比較根源與象徵活動。','這句列政府長期政策，未抽成 root of problem 的比較。','這句是具體乘搭巴士火車例子，未概括治本。'],
  ['這句在引言讓步無車日有提醒作用，未在結論重申兩項有限價值。','這句說每日污染不能靠一天，未公平承認宣傳與暫減。','這句結論後句選長期改革，原句先承認無車日價值。'],
  ['這句在引言選持久政策，未在結論以每一天對一年一次作比較。','這句已說長期措施治本，未最後重申空氣質素成效。','這句公平保留無車日好處，未提出作者最終的較佳方案。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先分清無車日的即時提醒效果，再判斷甚麼措施能改變每日出行。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要比較哪兩類減少空氣污染的方法？',[
    '國際無車日，與較廣泛的長期交通措施',
    '只比較兩種汽車外殼顏色是否好看',
    '只比較城市和郊區哪裏有更多商店',
    '只比較辦公室職員一天走路的步數',
  ],'兩方爭論一次性無車活動和持續交通政策哪個更有效。'),
  {type:'multi',prompt:'選出作者對兩種方法的完整判斷',detail:'選兩項，再按「確認」。',options:[
    '無車日可短暫減少排放，並提醒人改變習慣',
    '長期交通政策更能改變每天的選擇，應優先',
    '無車日一次便能永久解決所有城市空氣污染',
    '巴士火車再可靠，通勤者也永遠不會轉乘',
  ],correct:[0,1],why:'作者承認無車日有限好處，仍選能每日發揮作用的制度改革。'},
];
const route=[sequence('依文章次序排列無車日與長期政策論證',[
  ['引言定標準','私家車與污染有關，持久改善需長期政策。'],
  ['無車日好處','當天車流減少，參與者發現替代交通可行。'],
  ['長期方案','公共交通、單車徑和排放標準改變每日選擇。'],
  ['結論比較時間尺度','無車日只暫時有用，改革每天發揮作用。'],
],'文章的決定性標準是能否改變每天持續發生的污染來源。')];
const evidence=[
  quiz('無車日當天可能帶來甚麼可見效果？',[
    '街道較安靜清潔，交通與排放暫時下降',
    '所有車輛從此永遠不再出現在任何街道',
    '所有通勤者自動搬到工作地點旁邊居住',
    '城市污染完全消失而不再需要任何政策',
  ],'支持方強調一次活動當天的直接效果。'),
  quiz('短途駕車的職員可能因無車日發現甚麼？',[
    '公共交通、單車或步行可能沒想像中不便',
    '走路和單車一定比所有工作距離更快捷',
    '只要試過一天，往後任何交通都不用安排',
    '無車日唯一作用是讓他永久不用再上班',
  ],'親身試替代方式可修正原先的假設。'),
  quiz('作者為何認為無車日不足以單獨治污？',[
    '污染每天都會發生，車流翌日通常回復正常',
    '因為無車日連當天車流也絕不可能減少',
    '因為所有人只在一年一次的活動當天開車',
    '因為公眾對交通方式完全不可能產生反思',
  ],'時間尺度是論證核心：日常問題需要日常解法。'),
  quiz('政府應推行哪些長期措施？',[
    '可靠公共交通、安全單車徑與更嚴車輛排放標準',
    '只舉辦每年一次的活動，平日不改善任何服務',
    '只增加車道數量，完全不考慮交通排放',
    '只要求居民口頭支持清潔空氣，毋須調整制度',
  ],'三項政策分別改善替代交通與直接控制排放。'),
  quiz('可靠公共交通如何改變通勤者的選擇？',[
    '車費低、準時舒適時，人更可能每天選巴士火車',
    '票價愈高又愈常誤點，人人便愈願意轉乘',
    '只要城市有火車，所有人即使無站也能搭乘',
    '巴士火車的外觀足以取代價格和服務品質',
  ],'政策要令較清潔方案可行、負擔得起且吸引。'),
  quiz('為何長期政策比無車日更能處理根源？',[
    '它持續改善每日交通選擇，而非只改變一天',
    '它唯一作用是讓城市一年只安排一天無車',
    '它保證所有居民從此完全不用任何交通工具',
    '它只提高意識，完全不改變出行條件',
  ],'治本在於改變反覆發生的日常行為。'),
  quiz('結論如何公平評價無車日？',[
    '承認提醒和暫減污染，但仍選長期交通改革',
    '宣稱無車日毫無任何宣傳與減排作用',
    '認定只靠一天活動便可永久改善空氣',
    '完全不比較每日污染與一年一次的差別',
  ],'作者沒有否定活動的有限用途，但按持久性決定優先方案。'),
];
const logic=[
  sequence('無車日為何有一定價值',[
    ['即時變化','大量司機同日停開，街道較靜、較清潔。'],
    ['習慣反思','參與者重新想想平日是否必須開車。'],
    ['個案例子','短途開車職員可能發現巴士單車步行可行。'],
    ['宣傳作用','活動提醒公眾清潔城市生活有可能。'],
  ],'支持方有當日與提醒兩種有限好處。'),
  sequence('長期交通政策為何較有效',[
    ['問題頻率','空氣污染每天發生，翌日車流常回復。'],
    ['制度措施','改善公共交通、建單車徑、訂排放標準。'],
    ['行為機制','讓清潔選擇可行、便宜且吸引。'],
    ['具體例子','巴士火車準時舒適，通勤者才會日常轉乘。'],
    ['治本結論','改革改變每天出行，不只一年一次。'],
  ],'政策直接處理人每天如何移動的條件。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('城市辦一天無車活動，居民發現步行到附近商店比原想容易，但次日車流又回到原狀。','哪項最合範文的雙面評估？',[
    '活動可提醒人改習慣，持久減污仍需日常方案',
    '只要有人步行一天，全市車流便從此永久消失',
    '車流翌日回復，證明活動當天完全沒有任何作用',
    '只要活動有提醒作用，平日交通服務便不用改善',
  ],['保留提醒價值，也看到效果短暫。','過度保證。','過度否定有限好處。','忽略日常問題。'],[5,6,7,8,9],'無車日可提醒人，但車流翌日回復；持久改善需政策。'),
  transfer('某區巴士班次少又常誤點，居民即使想少開車，也難每天改乘巴士。','依範文，政府最應改善甚麼？',[
    '增加可靠班次與準時度，讓日常替代選擇真正可行',
    '只把巴士外觀改色，毋須改善班次與服務時間',
    '只要求居民無車日拍照，不處理每天的交通障礙',
    '宣稱改乘巴士不可能，從此停止任何交通投資',
  ],['政策有效須改善可用性和吸引力。','外觀不解決可靠度。','一次活動不解決日常障礙。','放棄可行措施。'],[10,11,12],'可靠公共交通令清潔出行可行、負擔得起且吸引。'),
  transfer('學校舉辦「一天不丟垃圾」活動，當天校園很乾淨，但翌日垃圾再增。','哪項最能轉用範文的時間尺度？',[
    '一天活動可提高意識，仍需長期制度改變每日行為',
    '只要活動當天乾淨，往後所有垃圾便自然消失',
    '垃圾翌日增加，證明活動當天毫無清潔效果',
    '只要有人願意參加，便完全不需再設置垃圾桶',
  ],['日常問題需持續方案，短期活動有有限宣傳作用。','錯把一天當永久。','否認即時效果。','忽略日常條件。'],[7,8,9,10,11,15],'象徵活動可暫減污染，但治本政策改變每天的選擇。'),
  transfer('政府設安全單車徑，讓部分上班族每天可安心騎車，而不再只能駕車。','這最貼近哪項治本機制？',[
    '改善日常出行條件，讓較清潔的選擇可行',
    '只在一年一度活動中容許居民騎一次單車',
    '單車徑只有宣傳價值，完全不影響每天選擇',
    '上班族只會因車道顏色而不問安全便改騎車',
  ],['安全設施使替代方式可持續採用。','錯限於一天。','忽略實際條件。','安全才是題境關鍵。'],[10,11,12,13],'安全單車徑令每日清潔交通更可行。'),
  transfer('有居民說無車日完全沒用，因它不能永久消除所有空氣污染。','哪項回應最符合作者的讓步？',[
    '它未必治本，仍可短暫減排並提醒人反思出行',
    '它既有宣傳作用，就必能一日永久解決污染',
    '它若不能永久治污，當天就絕不可能減排',
    '它只是活動，所以任何人都不會注意交通習慣',
  ],['有限價值不能等同全面治本，也不等於零效果。','過度誇大。','過度否定當日效果。','否定反思作用。'],[3,4,5,7,14],'無車日可提高意識並暫時減污，但非持久主方案。'),
  transfer('一個城市每年舉辦停車一天的活動，但污染主要來自每天大量私家車出行。','哪項最貼近作者反對只靠活動的理由？',[
    '污染每天重現，一天停車無法持續改變交通習慣',
    '一年只有一天有人開車，所以活動足以完全治污',
    '私家車出行與污染完全無關，因此不需任何政策',
    '只要活動名稱夠響亮，平日車流便會自然消失',
  ],['持續來源需要持續改善，而不是只看活動日。','顛倒頻率。','違背開篇關聯。','口號不改行為。'],[0,8,9,15],'空氣污染是每日問題，無車日後交通通常回復。'),
  transfer('市府希望通勤者改乘火車，正比較「免費一日」與「每天平價準時舒適」。','哪項較符合範文的長期政策？',[
    '每天平價準時舒適，較可能讓通勤者持續轉乘',
    '只要免費一天，之後再貴誤點也必會持續轉乘',
    '只要印更多宣傳海報，車費與準時度便無關緊要',
    '讓火車每天停駛，反而最能吸引居民放棄駕車',
  ],['可持續的價格與品質影響日常行為。','忽略後續條件。','口號不替代服務。','停駛不可行。'],[10,11,12],'巴士火車便宜準時舒適時，通勤者更可能選它們。'),
  transfer('市府提高車輛排放標準，讓平日上路的車都必須少排污染物。','這與無車日相比有甚麼不同？',[
    '標準持續管制每日排放，而非只讓一天車流下降',
    '標準只在一年一度無車日生效，平日一概不適用',
    '標準完全不會影響車輛排放，只影響車身顏色',
    '排放標準一旦提出，公共交通便必須全部取消',
  ],['排放標準直接處理日常持續污染來源。','錯誤限制時效。','忽略規則目標。','無關的結論。'],[8,9,10,13],'較嚴排放標準與其他長期措施處理日常污染根源。'),
  transfer('一位員工無車日試騎單車上班，發現路線短，但路口沒有安全設施。','哪項後續措施最能把反思變成長期改變？',[
    '建安全單車徑，讓員工每天都有較安心的路線',
    '只要求員工每年同一天騎車，不改善危險路口',
    '只告訴員工路程不長，卻不理每天的道路安全',
    '關閉所有單車設施，讓居民只能回去自己開車',
  ],['短期體驗需配合安全基礎設施才能改日常行為。','保留日常障礙。','安全問題未處理。','反向削弱替代交通。'],[6,7,10,11],'活動提醒替代方式可行，安全單車徑使它可每日採用。'),
  transfer('一份政策結論要同時承認無車日好處，並指出更有效的減污方法。','哪句最符合範文？',[
    '無車日可提醒公眾，長期改革更能改善每日空氣',
    '無車日已永久解決污染，所以不必再改善任何交通',
    '無車日毫無作用，連當天的排放也絕不會變少',
    '只要人們一年改乘一天巴士，平日污染便不重要',
  ],['先承認有限價值，再用每日效果判長期改革較佳。','過度誇大活動。','過度否定活動。','忽略日常污染。'],[2,14,15],'結論承認無車日提醒和暫減作用，仍選長期改革。'),
];
export default {key:'discuss-both-views:20',meta:{topic:'國際無車日與長期交通政策何者較能減污',summary:'無車日可暫時減排並提醒公眾，但持久改善需可靠公共交通、安全單車徑和較嚴排放標準。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
