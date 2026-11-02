// Reviewed Cause/Solution 9: an environment that makes weight gain more likely.
import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-9-ielts-cause-solution.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['cause-solution:9'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'More people now have serious health problems because they weigh too much.',
  'We should not see this only as people failing to control themselves; the way we live today makes it easy to sit too much and eat unhealthy food.',
  'The best answer is to make healthy daily habits easier in daily life.',
  'More people weigh too much mainly because daily life has too little exercise and too much easy-to-buy food with many calories.',
  'In many cities, people sit for hours at school, work and on journeys, so they burn much less energy.',
  'Also, unhealthy ready-made food and sweet drinks are cheap, easy to find and advertised a lot.',
  'When people move less and unhealthy food is everywhere, they may put on weight without noticing.',
  'For example, a student may sit in class, ride home in a car and play online games; food is easy to get, but there is little exercise.',
  'To fix this, governments, schools and people who give jobs need to change the parts of daily life that affect what people do.',
  'Governments could reduce food ads aimed at children, make food labels clearer and help people buy fresh food at a lower price.',
  'Schools should give regular exercise lessons and healthier food, while employers could give people time to move and safe places to walk or cycle.',
  'These changes help because people do not have to depend only on trying hard to control themselves.',
  'If healthy food costs a fair amount and exercise is part of each day, people can more easily keep a healthy weight.',
  'To sum up, more people are overweight mainly because they sit too much and can easily get unhealthy food.',
  'We can reduce the problem by making good food and regular movement normal, easy and affordable.',
];
const vocabulary=[
  [['An increasing number of','More','越來越多'],['face serious health risks','have serious health problems','面臨嚴重健康風險'],['overweight','weigh too much','超重']],
  [['best understood','see','最適合理解為'],['personal discipline','control themselves','個人自律'],['modern environment','the way we live today','現代生活環境'],['inactivity','sit too much','缺乏活動'],['unhealthy eating','eat unhealthy food','不健康飲食']],
  [['most effective solution','best answer','最有效的解方'],['healthier routines','healthy daily habits','較健康的日常習慣'],['ordinary life','daily life','日常生活']],
  [['growth in overweight people','more people weigh too much','超重人數增加'],['daily routines','daily life','日常模式'],['too little movement','too little exercise','活動太少'],['calorie-dense food','food with many calories','高熱量密度食物']],
  [['long hours','hours','長時間'],['during travel','on journeys','旅途中'],['use far less energy','burn much less energy','消耗較少能量']],
  [['At the same time','Also','與此同時'],['processed snacks','unhealthy ready-made food','加工零食'],['widely available','easy to find','容易買到'],['heavily promoted','advertised a lot','大量推廣']],
  [['these two forces','people move less and unhealthy food is everywhere','這兩種力量'],['weight gain','put on weight','體重增加'],['almost automatic','without noticing','幾乎自動發生']],
  [['spends the day in class','sit in class','整天上課'],['travels home by car','ride home in a car','坐車回家'],['physical activity is rare','there is little exercise','很少活動']],
  [['solve this problem','fix this','解決問題'],['employers','people who give jobs','僱主'],['conditions that shape everyday behaviour','parts of daily life that affect what people do','影響日常行為的條件']],
  [['limit junk-food advertising','reduce food ads','限制垃圾食品廣告'],['nutrition labels','food labels','營養標籤'],['more affordable','at a lower price','更負擔得起']],
  [['regular physical education','regular exercise lessons','定期體育課'],['workplaces','employers','工作場所'],['active breaks','time to move','活動休息'],['safe facilities','safe places','安全設施']],
  [['measures','changes','措施'],['do not depend only on','do not have to depend only on','不只依賴'],['willpower','trying hard to control themselves','意志力']],
  [['reasonably priced','costs a fair amount','價格合理'],['built into the day','part of each day','融入日常'],['maintain a healthy weight','keep a healthy weight','維持健康體重']],
  [['In conclusion','To sum up','總結'],['rise in overweight people','more people are overweight','超重人數上升'],['sedentary lifestyles','sit too much','久坐生活'],['easy access to','can easily get','容易取得']],
  [['reduced','reduce the problem','減少問題'],['creating environments','making','營造環境'],['eating well','good food','健康飲食'],['moving regularly','regular movement','定期活動'],['practical','easy','可行']],
];
export {original,simple,vocabulary};

function frame(i,links,labels,meaning,usage,example,tag,job){
  const value=original[i],parts=[];let cursor=0,slot=0;
  for(const link of links){const at=value.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed wording ${i+1}: ${link}`);
    if(at>cursor)parts.push({text:value.slice(cursor,at),kind:'slot',label:labels[slot++]});
    parts.push({text:link,kind:'link',label:'句型固定部分'});cursor=at+link.length;}
  if(cursor<value.length)parts.push({text:value.slice(cursor),kind:'slot',label:labels[slot++]});
  if(slot!==labels.length)throw Error(`Unmatched slot labels ${i+1}`);
  return {frame:{formula:parts.map(p=>p.kind==='link'?p.text:`[${p.label}]`).join(''),meaning,usage,parts},example,tag,job};
}
const specs=[
  frame(0,[' because '],['越來越多人面對的健康風險','超重這項原因'],'because 把健康風險與超重這項原因接起來。','指出一項風險後，需要交代導致它的直接原因時。','More children feel tired because they sleep too little.','because','把問題連到直接原因'),
  frame(1,[' not as ',' but as '],['如何理解問題的開端','應排除的單一個人解釋','更有解釋力的環境因素'],'not as...but as 先排除只怪個人的說法，再轉向促成行為的環境。','一種現象常被簡化為個人失誤，需指出更完整的外部條件時。','Traffic should be understood not as a driver problem but as a result of poor road planning.','not as...but as','排除簡化說法並提出替代解釋'),
  frame(2,[' therefore, ','is to '],['最有效的解方','讓健康習慣更容易實行的方向'],'therefore 承接環境成因；is to 說出相應的解方方向。','前句已交代問題，接着要提出對應的核心改變時。','The best response, therefore, is to make safe routes easier to use.','therefore...is to','由成因推到解方'),
  frame(3,[' is that '],['超重人數增加的主要原因','活動少而高熱量食物多的具體內容'],'is that 後用完整子句直接回答「主要原因是甚麼」。','主體段開始回答原因題，需要清楚提出可逐步解釋的主因時。','The main reason for the delay is that buses come too rarely.','is that','明確陳述主要成因'),
  frame(4,[', so '],['久坐造成能量使用較少的背景','身體能量消耗減少的結果'],'so 把長時間坐著與能量消耗較少連成因果。','描述一項行為後，需指出它可能帶來的可觀察後果時。','Many pupils walk less, so they use less energy each day.','so','把行為接到直接結果'),
  frame(5,['At the same time, '],['同時存在的廉價食品與宣傳環境'],'At the same time 補上與活動不足並行的飲食因素。','已說明一項原因，還要加入另一項同時存在的原因時。','At the same time, cheap snacks are sold outside many schools.','At the same time','加入並行成因'),
  frame(6,['When ', ', '],['兩項不利條件同時出現','體重增加可能變得難以察覺的結果'],'When 設定兩項因素相遇的條件，後面指出它們合在一起的結果。','兩項因素已分別交代，需要說明它們如何一起加重結果時。','When travel is long and meals are rushed, unhealthy habits can become normal.','When...','展示兩項條件的聯合作用'),
  frame(7,['For example, ',' may '],['學生一天的活動與飲食情境','逐漸形成少運動生活方式的可能結果'],'For example 把抽象成因放進一名學生的一天；may 保留可能性。','概括機制後，需要以具體而不誇大的日常例子展示時。','For example, a pupil who takes a bus everywhere may get very little exercise.','For example...may','用個案展示機制'),
  frame(8,['To solve this problem, ',' need to '],['政府、學校與僱主','改變日常行為條件的共同行動'],'To solve this problem 表明由成因轉到解方；need to 指向多方可採取的行動。','問題涉及多個場域或行動者，需在解法段指出共同改變方向時。','To solve this problem, schools and shops need to make healthy food easier to choose.','To solve...need to','由問題切換到多方解方'),
  frame(9,[' could ',' require ',' and make '],['政府','限制面向兒童的廣告','要求更清晰的標籤','令新鮮食物較易負擔'],'could...require...and make 並列三項政府措施，對應宣傳、資訊與價格。','同一行動者可採取幾項互補措施，需要逐項清楚列出時。','Councils could improve paths, require safer crossings and make cycling easier.','could...require...and make','列出同一行動者的互補措施'),
  frame(10,[', while '],['學校應提供的體育與膳食措施','工作場所可提供的活動條件'],'while 把學校措施與工作場所措施放在同一句，清楚分工。','不同機構各有不同工具，需要在同一句分配各方責任時。','Schools can offer healthy lunches, while employers can provide safe bike storage.','while','對照兩類機構的分工'),
  frame(11,[' because '],['環境措施有用的判斷','不只靠個人意志力的理由'],'because 說明措施的價值在於減少對個人意志力的單獨依賴。','已列出措施，需要說明它們為何比只勸個人自律更有幫助時。','These changes help because they make the safer choice easier.','because','解釋方案有效的機制'),
  frame(12,['If ', ', ',' without '],['食物價格合理且運動融入日常的條件','較易維持健康體重的可能結果','毋須對抗日常模式的額外好處'],'If 定出改變後的環境；without 補充不用與日常生活對抗的好處。','要說明條件改善後，某種理想行為如何變得更容易維持時。','If the bus is frequent, people can travel reliably without needing a car.','If...without','預測改善條件後的實際效果'),
  frame(13,[' mainly caused by ',' combined with '],['超重人數上升','久坐生活','不健康食物容易取得'],'mainly caused by 保留主要成因的分寸；combined with 說兩個因素合力。','結尾要把兩項互相加強的原因壓縮成一個完整判斷時。','The problem is mainly caused by long travel times combined with few safe paths.','mainly caused by...combined with','歸納聯合成因'),
  frame(14,[' by creating environments in which '],['可減少的問題','飲食與活動成為可行選擇的環境'],'by creating environments in which 把解方寫成讓好選擇更容易的條件。','總結解方時，要概括如何改善條件，而非只要求個人努力時。','The gap can be reduced by creating environments in which every child can practise.','by creating environments in which','以環境設計概括解方'),
];
const structures=specs.map((target,i)=>{const distractors=[(i+1)%specs.length,(i+5)%specs.length,(i+10)%specs.length];return {...target,distractors,wrongReasons:distractors.map(j=>`這句用「${specs[j].tag}」${specs[j].job}；沒有用「${target.tag}」${target.job}。`),answerReason:`示例用「${target.tag}」${target.job}。`,patternType:'reviewed'};});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的論證次序選出意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('作者把超重人數增加主要歸因於甚麼？',['活動少與高熱量食品容易取得的日常環境','每個人都必然缺乏任何自律能力','所有學校完全取消體育課','健康食品在每個地方都完全免費'],'引言排除只怪個人自律，把焦點移到日常環境。'),
  quiz('解方為何要改變日常條件？',['讓健康飲食與活動成為較容易實行的選擇','只要求每個人用意志力克服所有障礙','只把食品廣告換一種字體','讓學生在學校坐得更久'],'解方對應環境成因，減少健康選擇的實際難度。'),
];
const route=[sequence('由兩項環境成因走到多方解方',[
  ['引言：重新界定問題','超重風險增加，不能只用個人自律不足解釋。'],
  ['主體一：展示兩項成因','久坐令能量消耗減少；廉價高熱量食物又容易買到。'],
  ['主體二：按場所提出措施','政府處理廣告、標籤和價格；學校與僱主改善飲食和活動條件。'],
  ['結尾：成因與解方對應','歸納久坐及食品環境，主張讓好習慣變得可行。'],
],'每項措施都回應前文提出的實際障礙。')];
const evidence=[
  quiz('城市生活如何增加超重風險？',['學校、工作和交通期間坐得久，能量消耗較少','城市居民完全不需要飲食','坐得越久一定消耗越多能量','城市的食物一律比鄉村健康'],'範文用學校、工作和交通三個場景說明活動不足。'),
  quiz('食品環境在範文中有哪三個特點？',['便宜、容易取得，而且大力推廣','昂貴、難以取得，而且從不宣傳','完全由學生自己種植和製作','只有運動員才可以接觸食品'],'快餐、含糖飲品和加工零食同時具備這三個條件。'),
  quiz('學生坐車回家、玩網上遊戲的例子有甚麼作用？',['展示少活動與方便進食如何在一天內累積','證明每位玩遊戲的學生都已患病','主張禁止所有交通工具','說明學生比成年人一定吃得更多'],'例子只展示可能形成的日常模式，沒有宣稱每位學生都如此。'),
  quiz('政府的三項措施分別處理甚麼障礙？',['廣告影響、食品資訊和新鮮食物價格','道路寬度、上課時間和考試名次','教師薪酬、校服款式和網絡速度','只處理遊戲時間，完全不看食品'],'限制廣告、清晰標籤和可負擔價格對應不同食品環境障礙。'),
  quiz('學校和工作場所如何各自增加活動機會？',['學校提供體育課；工作場所提供活動休息和步行或單車設施','學校取消體育課；工作場所禁止任何休息','兩者只更換海報，不提供實際活動條件','兩者都只把責任交給食品公司'],'範文按兩種機構的日常場景分配措施。'),
  quiz('作者為何認為這些措施有用？',['它們令較健康的選擇不只依賴個人意志力','它們保證人人立刻有相同體重','它們把任何體能活動視為有害','它們令所有食品都不再需要價格標籤'],'文章主張改變條件，使選擇在日常生活中更容易維持。'),
];
const logic=[
  sequence('主體一：兩種因素如何合力',[
    ['久坐場景增加','上學、工作和交通都可使人長時間坐著。'],
    ['能量消耗下降','活動少令身體用掉的能量較少。'],
    ['高熱量食品容易取得','便宜、方便和宣傳加強進食的吸引力。'],
    ['日常模式逐漸形成','兩種條件一起存在，便更容易持續增重。'],
  ],'不要把食物因素或活動因素寫成唯一原因；範文說明兩者合力。'),
  sequence('主體二：措施對應哪項障礙',[
    ['政府處理食品選擇環境','限制面向兒童的廣告、要求標籤、改善新鮮食物價格。'],
    ['學校處理學生的一天','提供定期體育課和較健康膳食。'],
    ['工作場所處理成人日常','安排活動休息與安全的步行或單車設施。'],
    ['說明共同作用','健康選擇更容易，不必只靠意志力。'],
  ],'解方的行動者、工具和要移除的障礙要配得上。'),
];
const transfer=(context,question,options,why,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,why,sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('某城市學生每天坐車上學，放學後活動場地又很少。','哪項分析最能轉用範文的環境觀點？',['先檢查交通與活動場所如何限制運動機會，再設計可行替代方案','直接宣稱學生天生懶惰，毋須了解交通安排','只在海報上寫「多運動」，不增加可用空間','因為坐車方便，便禁止所有學生步行'],'範文從日常條件解釋活動不足，而非只怪個人。',[1,4,8],'原文把久坐視為日常環境中的行為，解方要改變條件。'),
  transfer('社區一面有廉價含糖飲品，一面缺少可負擔的新鮮食物。','哪項措施最貼近範文？',['讓新鮮食品較負擔得起，同時提供清晰營養資訊','只責怪買飲品的人，完全不看價格與選擇','將營養標籤改成無法閱讀的小字','只增加含糖飲品廣告，不處理替代食物'],'價格與資訊是範文明確提出的可改變條件。',[5,9],'原文並列食品供應與政府可採取的價格、標籤措施。'),
  transfer('一間公司希望員工多活動，但午餐休息太短，附近亦沒有安全步道。','哪項方案最有根據？',['調整休息時間並改善安全步行設施，讓活動可融入工作日','只要求員工在工作時站起來，卻不留任何活動時間','把所有午餐時間取消，讓員工更忙','認為員工一定不願運動，因此不嘗試任何設施'],'工作場所要改變時間與設施，而非只發口號。',[8,10,12],'原文提出工作場所的活動休息和安全步行或單車設施。'),
  transfer('學校已加一節體育課，但午膳仍長期只有高糖食品。','按照範文邏輯，還缺少甚麼？',['同步改善膳食，因為活動與飲食是兩項並行因素','停止所有體育課，因為飲食才是唯一原因','只更改運動服顏色，不改食品','宣稱一節體育課保證每位學生體重相同'],'範文把少活動與不健康食品放在同一條成因鏈。',[3,5,10],'原文讓學校同時提供體育教育和較健康膳食。'),
  transfer('政府考慮限制針對兒童的高糖零食廣告。','用範文的推理，應如何解釋這項措施？',['減少促使兒童選擇不健康食品的外在影響','證明所有兒童必然無法理解任何廣告','宣稱廣告是體重增加的唯一原因','認為只要廣告減少，運動設施就沒有作用'],'廣告是多項環境因素之一，政府可直接處理。',[5,9],'原文提到食品被大量推廣及限制針對兒童的廣告。'),
  transfer('有人主張肥胖問題只能靠個人意志力，學校和僱主不必採取行動。','哪個回應最符合範文？',['日常環境影響選擇，學校與僱主可讓健康習慣更容易實行','意志力沒有任何作用，所以個人不需要作選擇','只要有意志力，價格與活動場所便完全不重要','應取消所有營養資訊，避免人們自行判斷'],'範文沒有否定個人選擇，但指出不能單靠意志力。',[1,8,10,11],'原文明確說措施有用，因為不只依賴意志力。'),
  transfer('某區設立公共單車，但大部分通勤路線仍沒有安全連接。','哪項判斷最貼近文章的「可行」原則？',['補上安全路線，讓單車真正能進入日常通勤','只要有單車，即使道路危險也一定有人使用','因為路線不連接，就取消所有步行設施','只在網站增加宣傳圖片，不檢查實際路線'],'解方必須改變實際條件，才能成為日常選擇。',[10,12,14],'原文要求安全設施和能融入日常的活動。'),
  transfer('寫另一篇關於學生睡眠不足的文章，原因是夜間作業多和手機提醒頻繁。','哪種寫法最能轉用範文的成因結構？',['分別解釋兩項日常條件，再說它們如何合力縮短睡眠','只聲稱學生全都懶惰，完全不看作業與提醒','把作業數量當成手機提醒的唯一結果','不描述任何原因，直接列出三種解方'],'範文先列久坐和食品兩種因素，再展示合力結果。',[3,5,6],'原文用 When these two forces work together 收合兩項成因。'),
  transfer('某社區有健康食品，但價格遠高於普通家庭可負擔水平。','哪項後續措施最能接上範文的解方？',['降低健康食品的實際購買門檻，讓居民能持續選用','只向居民展示食物照片，不處理價格','說食品已在店裏，所以所有家庭必然買得起','把健康食品移到更遠的商店'],'買得到與買得起是不同條件，範文都要求照顧。',[9,12,14],'原文同時主張新鮮食物較負擔得起及價格合理。'),
  transfer('一篇成因與解方文章的結尾已提到久坐生活，但完全沒有回答食品環境。','哪項修訂最忠於範文？',['把久坐與不健康食品容易取得一併歸納，再概括環境措施','只重複「多運動」三次，刪除食品因素','增加與題目無關的考試成績統計','宣稱超重人數其實完全沒有增加'],'結尾應回應文中兩項主因及使健康選擇可行的解方。',[13,14],'原文以 combined with 收束兩項成因，再以 by creating environments 概括解方。'),
];
const wrongReasons=[
  ['這直接以性格下結論，沒有檢查上學交通和活動場所。','海報不會補上學生缺少的活動空間。','範文主張提供安全步行條件，沒有要求禁止步行。'],
  ['價格與可選食品正是範文要處理的環境條件。','標籤不清會削弱而非改善食品資訊。','增加含糖飲品廣告會強化原有障礙。'],
  ['沒有活動時間，便難以把步行放進工作日。','取消午餐時間會進一步壓縮活動機會。','範文提出可行設施，不把未嘗試的方案判為無效。'],
  ['範文把運動與膳食列為互補措施。','衣服顏色沒有改變食品選擇。','一節課不能保證每個人的體重結果相同。'],
  ['範文沒有說所有兒童都無法理解廣告。','廣告只是食品環境的其中一項因素。','政府處理食品廣告，不代表活動設施沒有作用。'],
  ['範文並未否認個人仍會作選擇。','價格和活動場地會影響選擇是否可持續。','清晰的營養資訊正是政府措施之一。'],
  ['單車存在不代表危險道路已可用於通勤。','取消步行設施會減少可行的活動選項。','宣傳圖片不能替代安全、連貫的路線。'],
  ['只怪學生，略過已知的作業和提醒兩項條件。','這誤把並行因素寫成單一因果。','題目要求原因與解方，不能跳過成因。'],
  ['照片無法消除家庭面對的價格障礙。','在店裏出售不等於家庭買得起。','移遠商店會增加實際取得的難度。'],
  ['只談活動，漏掉範文反覆分析的食品環境。','考試成績與文中成因解方無關。','這推翻題目及引言所確認的人數上升。'],
];
transferTasks.forEach((item,i)=>{item.explanations=[item.why,...wrongReasons[i]];});
export default {key:'cause-solution:9',meta:{topic:'超重人數增加的環境成因與解方',summary:'久坐生活與方便廉價的高熱量食品合力增加風險；政府、學校和僱主應讓健康選擇更容易。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
