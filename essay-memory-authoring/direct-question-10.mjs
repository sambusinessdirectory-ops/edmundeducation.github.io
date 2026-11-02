// Human-authored support for Direct Question 10; the lesson bundle remains the canonical essay.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-10-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:10'];
const original=source.sentences.map(row=>row.english);

const simple=[
  'Crimes linked to alcohol are a serious problem because alcohol can make people less able to control themselves, more likely to get angry, and more likely to turn a small argument into violence.',
  'But I do not think banning all alcohol would work well to reduce crime.',
  'It would deal with what we can see, not with the way people act that causes crime.',
  'The biggest problem with a ban is that it would be hard to make people obey it and could lead to new crimes.',
  'If people still want alcohol, they may buy it from sellers who break the law, and a secret market may quickly appear.',
  'Groups that break the law could then sell drinks that are not safe, take advantage of people who need help, and avoid all rules.',
  'Then the police would spend time looking for ordinary drinkers and secret sellers instead of dealing with people who use violence.',
  'So banning alcohol may only hide the problem instead of ending it.',
  'A better answer is to control the situations where harm is most likely.',
  'Governments should limit alcohol sales late at night, set tough punishments for drunk driving and violence linked to alcohol, and make bars stop serving people who are clearly drunk.',
  'These actions deal with the times when drinking is most likely to lead to crime.',
  'For example, if a nightclub may lose its right to operate for serving drunk people, workers will have a good reason to step in before an argument becomes a fight.',
  'Stopping trouble at this point is much more practical than banning alcohol everywhere.',
  'Another useful step is to help and teach people who often use alcohol in harmful ways.',
  'Some people who commit crimes need more than punishment; they need a trained person to talk to, help with their alcohol problem, and a better understanding of the harm they cause.',
  'If schools and communities teach young people how alcohol changes their thinking and self-control, young people may make better choices and commit fewer crimes later.',
  'To sum up, banning alcohol is not a good way to reduce crime.',
  'Stronger rules, more action to make people obey them, and proper help for people with alcohol problems would reduce these crimes in ways that are more likely to work and last longer.',
];
const vocabulary=[
  [['Alcohol-related crime','Crimes linked to alcohol','與酒精相關的犯罪'],['weaken self-control','make people less able to control themselves','削弱自制力'],['intensify aggression','more likely to get angry','加劇攻擊性'],['minor disputes','a small argument','小爭執']],
  [['However','But','然而'],['a total ban on alcohol','banning all alcohol','全面禁酒'],['effective way to reduce crime','work well to reduce crime','有效減少犯罪的方法']],
  [['attack the surface of the problem','deal with what we can see','處理問題表面'],['rather than','not with','而不是'],['behaviour that leads to crime','way people act that causes crime','導致犯罪的行為']],
  [['main weakness of prohibition','biggest problem with a ban','禁酒的主要弱點'],['difficult to enforce','hard to make people obey it','難以執行'],['create new criminal activity','lead to new crimes','引發新犯罪']],
  [['demand for alcohol remains high','people still want alcohol','酒精需求仍高'],['illegal suppliers','sellers who break the law','非法供應者'],['black market','secret market','黑市'],['quickly develop','quickly appear','迅速形成']],
  [['Criminal groups','Groups that break the law','犯罪集團'],['unsafe products','drinks that are not safe','不安全的產品'],['exploit vulnerable customers','take advantage of people who need help','剝削弱勢顧客'],['avoid regulation altogether','avoid all rules','完全逃避監管']],
  [['In this situation','Then','在這種情況下'],['waste time chasing','spend time looking for','浪費時間追查'],['underground sellers','secret sellers','地下賣家'],['violent offenders','people who use violence','暴力罪犯']],
  [['Therefore','So','因此'],['move the problem into the shadows','hide the problem','把問題推入地下'],['rather than remove it','instead of ending it','而非消除問題']],
  [['more effective solution','better answer','更有效的解法'],['targeted control','control the situations where harm is most likely','針對性管制']],
  [['restrict late-night alcohol sales','limit alcohol sales late at night','限制深夜售酒'],['impose heavy penalties','set tough punishments','施加嚴厲懲罰'],['drunk driving','drunk driving','醉酒駕駛'],['require bars to refuse service','make bars stop serving','要求酒吧拒絕服務'],['clearly intoxicated customers','people who are clearly drunk','明顯醉酒的顧客']],
  [['These measures','These actions','這些措施'],['focus on the moments','deal with the times','集中處理高風險時刻'],['trigger crime','lead to crime','引發犯罪']],
  [['For example','For example','例如'],['lose its licence','lose its right to operate','失去牌照'],['staff','workers','員工'],['strong reason to intervene','good reason to step in','充分理由介入'],['before an argument turns into a fight','before an argument becomes a fight','在爭執變成打鬥前']],
  [['Prevention at this stage','Stopping trouble at this point','在這階段預防'],['far more practical than','much more practical than','遠比……實際'],['blanket ban','banning alcohol everywhere','一刀切禁令']],
  [['Another useful measure','Another useful step','另一項有用措施'],['treatment and education','help and teach','治療和教育'],['repeatedly misuse alcohol','often use alcohol in harmful ways','反覆濫用酒精']],
  [['offenders','people who commit crimes','犯罪者'],['do not simply need punishment','need more than punishment','不只需要懲罰'],['counselling','a trained person to talk to','輔導'],['addiction support','help with their alcohol problem','戒癮支援'],['clearer understanding','better understanding','更清楚的理解']],
  [['how alcohol affects judgment and self-control','how alcohol changes their thinking and self-control','酒精如何影響判斷與自制'],['future crime can be reduced at its roots','young people may make better choices and commit fewer crimes later','從根源減少日後犯罪']],
  [['In conclusion','To sum up','總結來說'],['banning alcohol','banning alcohol','禁酒'],['not an effective anti-crime policy','not a good way to reduce crime','不是有效反犯罪政策']],
  [['Stricter regulation','Stronger rules','更嚴格規管'],['stronger enforcement','more action to make people obey them','更有力執法'],['proper support for alcohol misuse','proper help for people with alcohol problems','對酒精濫用的適當支援'],['more realistically and sustainably','in ways that are more likely to work and last longer','更現實及持續']],
];
const chunkOverrides=[
  ['Alcohol-related crime is a serious social problem','because alcohol can weaken self-control,','intensify aggression and turn minor disputes into violence.'],
  ['However, I do not think','a total ban on alcohol','would be an effective way to reduce crime.'],
  ['It would attack the surface of the problem','rather than the behaviour that leads to crime.'],
  ['The main weakness of prohibition is','that it would be difficult to enforce','and could create new criminal activity.'],
  ['If demand for alcohol remains high,','people are likely to look for illegal suppliers,','and a black market can quickly develop.'],
  ['Criminal groups could then sell unsafe products,','exploit vulnerable customers','and avoid regulation altogether.'],
  ['In this situation, the police would waste time','chasing ordinary drinkers and underground sellers','instead of focusing on violent offenders.'],
  ['Therefore, banning alcohol may simply','move the problem into the shadows','rather than remove it.'],
  ['A more effective solution','is targeted control.'],
  ['Governments should restrict late-night alcohol sales,','impose heavy penalties for drunk driving','and alcohol-related violence,','and require bars to refuse service','to clearly intoxicated customers.'],
  ['These measures focus on the moments','when drinking is most likely to trigger crime.'],
  ['For example, if a nightclub knows','it may lose its licence for serving drunk customers,','staff will have a strong reason to intervene','before an argument turns into a fight.'],
  ['Prevention at this stage is far more practical','than a blanket ban.'],
  ['Another useful measure is treatment and education','for people who repeatedly misuse alcohol.'],
  ['Some offenders do not simply need punishment;','they need counselling, addiction support','and a clearer understanding of the harm they cause.'],
  ['If schools and communities teach young people','how alcohol affects judgment and self-control,','future crime can be reduced at its roots.'],
  ['In conclusion, banning alcohol','is not an effective anti-crime policy.'],
  ['Stricter regulation, stronger enforcement','and proper support for alcohol misuse','would reduce alcohol-related crime','more realistically and sustainably.'],
];
const simpleChunkOverrides=[
  ['Crimes linked to alcohol are a serious problem','because alcohol can make people less able to control themselves,','more likely to get angry,','and more likely to turn a small argument into violence.'],
  ['But I do not think banning all alcohol','would work well to reduce crime.'],
  ['It would deal with what we can see,','not with the way people act that causes crime.'],
  ['The biggest problem with a ban is','that it would be hard to make people obey it','and could lead to new crimes.'],
  ['If people still want alcohol,','they may buy it from sellers who break the law,','and a secret market may quickly appear.'],
  ['Groups that break the law could then','sell drinks that are not safe,','take advantage of people who need help,','and avoid all rules.'],
  ['Then the police would spend time looking for','ordinary drinkers and secret sellers','instead of dealing with people who use violence.'],
  ['So banning alcohol may only hide the problem','instead of ending it.'],
  ['A better answer is to control the situations','where harm is most likely.'],
  ['Governments should limit alcohol sales late at night,','set tough punishments for drunk driving','and violence linked to alcohol,','and make bars stop serving people','who are clearly drunk.'],
  ['These actions deal with the times','when drinking is most likely to lead to crime.'],
  ['For example, if a nightclub may lose','its right to operate for serving drunk people,','workers will have a good reason to step in','before an argument becomes a fight.'],
  ['Stopping trouble at this point is much more practical','than banning alcohol everywhere.'],
  ['Another useful step is to help and teach people','who often use alcohol in harmful ways.'],
  ['Some people who commit crimes need more than punishment;','they need a trained person to talk to,','help with their alcohol problem,','and a better understanding of the harm they cause.'],
  ['If schools and communities teach young people','how alcohol changes their thinking and self-control,','young people may make better choices','and commit fewer crimes later.'],
  ['To sum up, banning alcohol','is not a good way to reduce crime.'],
  ['Stronger rules, more action to make people obey them,','and proper help for people with alcohol problems','would reduce these crimes in ways','that are more likely to work and last longer.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){
  const text=original[i],parts=[];
  let cursor=0,slot=0;
  for(const link of links){
    const at=text.indexOf(link,cursor);
    if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);
    if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));
    parts.push(part(link,'link','句型固定部分'));
    cursor=at+link.length;
  }
  if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));
  return {formula,meaning,usage,parts};
}
function card(example,functionName,distractors,frame){
  return {example,distractors,frame,patternType:'reviewed',
    answerReason:`這句${functionName}，與原句的句型和語意關係相同。`,
    distractorReason:`這句${functionName}；它表達的是另一種關係。`};
}
const structures=[
  card('Late buses are a serious problem because workers miss shifts, lose pay and feel stressed.','用 because 由問題引出多項實際後果',[3,9,16],
    fixed(0,'[問題] is [嚴重程度] because [原因或後果一], [二] and [三].','先界定社會問題，再列酒精如何削弱控制、加劇攻擊並推高衝突風險。','引言要說明問題為何嚴重，而非只宣稱它重要時。',[' is a serious social problem because ', ', ', ' and '],['被提出的社會問題','第一項作用','第二項作用','第三項作用'])),
  card('However, I do not think closing every shop would be an effective way to cut waste.','用 I do not think ... would be an effective way 直接評估全面措施',[0,8,16],
    fixed(1,'However, I do not think [全面措施] would be [有效解法].','直接回答全面禁酒是否有效，為之後的反對理由定下立場。','題目問某政策是否有效，須在引言明確表態時。',['However, I do not think ', ' would be '],['被評估的全面措施','被否定的政策效用'])),
  card('That rule would hide the signs of bullying rather than deal with the behaviour behind it.','用 rather than 對比表面處理與真正需要處理的行為',[1,4,7],
    fixed(2,'It would [處理表面] rather than [處理真正導致問題的行為].','解釋全面禁令為何沒有針對犯罪行為本身。','已表明不支持政策，接着要指出政策與根本目標錯位時。',['It would ', ' rather than '],['只碰到表面的措施','實際造成問題的行為'])),
  card('The main weakness of a citywide curfew is that it would be hard to enforce and could create more secret meetings.','用 The main weakness ... is that ... and 連結執行困難與新副作用',[2,5,12],
    fixed(3,'The main weakness of [政策] is that [執行難點] and [可能副作用].','總述禁酒的兩項弱點：難執行，並可能催生新的非法活動。','開始反對某政策的主體段，要先概括最重要的兩個理由時。',['The main weakness of ', ' is that ', ' and '],['受評估的政策','執行上的困難','可能引發的新問題'])),
  card('If demand for cheap rides remains high, people may use unlicensed drivers, and a hidden market can grow.','用 If ... and 串出需求、非法供應與市場形成',[3,6,11],
    fixed(4,'If [需求仍高], [人們轉向非法供應], and [地下市場出現].','用需求沒有消失來解釋禁令如何刺激非法供應和黑市。','要推演禁止供應之後需求仍在，會怎樣產生替代交易時。',['If ', ', ', ', and '],['禁令下仍存在的需求','消費者的替代行為','更大的市場後果'])),
  card('Unlicensed firms could then overcharge customers, use unsafe cars and avoid safety checks altogether.','用 could then 並列新市場可能造成的多項傷害',[4,7,10],
    fixed(5,'[非法經營者] could then [傷害一], [傷害二] and [逃避監管].','承接黑市形成，列出犯罪集團可能造成的具體損害。','已說非法供應出現，接着要指出它對顧客和監管的影響時。',[' could then ', ', ', ' and '],['非法供應者','對安全的損害','對弱勢顧客的剝削','逃避規管'])),
  card('In this situation, inspectors would spend time chasing small sellers instead of checking unsafe factories.','用 In this situation ... instead of 說明執法資源被轉移',[5,8,13],
    fixed(6,'In this situation, [執法者] would [耗費資源於次要對象] instead of [集中於主要傷害].','指出全面禁令可能令警方追查一般飲酒者，分散處理暴力罪犯的力量。','要評估政策如何改變有限的執法時間和優先次序時。',['In this situation, ', ' would ', ' instead of '],['處於該情況的執法者','被轉去處理的次要工作','因此受影響的主要工作'])),
  card('Therefore, banning street sales may simply push trade underground rather than end it.','用 Therefore ... may simply ... rather than 收束禁令的反效果',[2,4,12],
    fixed(7,'Therefore, [全面禁令] may simply [把問題藏起來] rather than [真正消除問題].','由黑市與警方資源的分析推論：禁酒可能使問題地下化。','一段反對禁令的因果論證末尾，需要總結政策為何無法達標時。',['Therefore, ', ' may simply ', ' rather than '],['被評估的禁令','可能出現的表面變化','未能達成的目標'])),
  card('A more effective solution is targeted safety inspections.','用 A more effective solution is 簡短提出替代政策方向',[1,7,13],
    fixed(8,'A more effective solution is [有針對性的做法].','由否定全面禁令轉向具體針對高風險時段的管制。','主體段開始要先提出替代方案，再展開措施時。',['A more effective solution is '],['更精準的解法'])),
  card('Councils should limit late-night noise, fine repeated offenders, and require venues to close unsafe exits.','用 should 並列政府可執行的三項管制行動',[8,11,14],
    fixed(9,'[政府] should [限制高風險情況], [加重違規代價], and [要求場所負責].','把針對性管制拆成售酒時段、酒駕與暴力罰則，以及酒吧拒絕服務。','要把抽象政策寫成多個可執行規則時。',[' should ', ', ', ', and '],['負責制定規則的機關','限制高風險時段','針對違規的罰則','場所須履行的責任'])),
  card('These checks focus on the times when factory accidents are most likely to happen.','用 focus on the moments when 說明為何措施對準高風險時刻',[3,8,15],
    fixed(10,'These measures focus on the moments when [風險最容易發生].','解釋限制深夜售酒等措施的共同原理：在犯罪最可能被觸發時介入。','已列出多種措施，接着要說明它們為何屬於同一種針對性策略時。',['These measures focus on the moments when '],['需要及時處理的高風險時刻'])),
  card('For example, if a venue may lose its licence for unsafe service, staff will step in before an argument becomes a fight.','用 For example, if ... will ... before 展示誘因如何帶來及早介入',[4,9,12],
    fixed(11,'For example, if [場所面對牌照後果], [員工] will [及早介入] before [衝突升級].','以夜店牌照作例子，說明具體責任如何促使員工在打鬥前介入。','要把「管制有效」變成可見的場所決策和時間次序時。',['For example, if ', ', ', ' will ', ' before '],['牌照後果的條件','在場的員工','提前採取的行動','需要防止的升級'])),
  card('Stopping a dispute before it grows is far more practical than closing every meeting place.','用 far more practical than 比較及早預防與全面禁令',[7,10,14],
    fixed(12,'[在高風險時刻預防] is far more practical than [全面禁令].','由夜店例子作比較，指出及早介入比全面禁酒更可執行。','具體例子已展示可行的預防時，要回扣與全面禁令的比較時。',[' is far more practical than '],['在問題升級前介入','作為比較對象的全面禁令'])),
  card('Another useful measure is training for workers who repeatedly face unsafe conditions.','用 Another useful measure is 另加一項不同機制的方案',[8,11,16],
    fixed(13,'Another useful measure is [對反覆受影響者的支援].','在規管之後，另提出對反覆濫用酒精者的治療和教育。','已有執法措施，還要補上處理個人長期問題的方案時。',['Another useful measure is '],['補充的治療或教育方案'])),
  card('Some pupils do not simply need detention; they need a mentor, help at home and a clear account of the harm done.','用 do not simply need ...; they need 對照懲罰與較完整的支援',[9,13,15],
    fixed(14,'Some [涉事者] do not simply need [懲罰]; they need [輔導、戒癮與理解傷害].','說明反覆濫用者除罰則外，還需要處理依賴和認知的支援。','要防止方案只剩處罰，並列出個人層面的實際需要時。',['Some ', ' do not simply need ', '; they need '],['需要更多支援的涉事者','不足夠的單一回應','較完整的支援內容'])),
  card('If schools teach pupils how sleep affects attention, future mistakes can be reduced at their roots.','用 If ... how ... can be reduced at its roots 寫教育如何做長期預防',[10,13,17],
    fixed(15,'If [教育者] teach [年輕人] how [因素影響判斷], [日後風險] can be reduced at its roots.','從青少年學會理解酒精影響判斷和自制力，推到未來犯罪的根源預防。','要說明教育不是即時懲罰，而是降低未來風險時。',['If ', ' teach ', ' how ', ', ', ' can be reduced at its roots.'],['提供教育的機構','學習對象','需要認識的影響','日後希望減少的風險'])),
  card('In conclusion, closing every park is not an effective safety policy.','用 In conclusion ... is not 重申對全面措施的否定判斷',[1,8,17],
    fixed(16,'In conclusion, [全面禁令] is not [有效政策].','結論直接回答題目：禁酒不是有效的反犯罪政策。','結論要清楚重申第一個題問的立場時。',['In conclusion, ', ' is not '],['被評估的全面禁令','被否定的政策成效'])),
  card('Clearer rules, reliable checks and proper help for repeat offenders would reduce harm more realistically and sustainably.','用並列三類方案與 would ... more realistically and sustainably 作完整收束',[9,13,16],
    fixed(17,'[更嚴格規管、執法與支援] would reduce [傷害] more realistically and sustainably.','把針對性規管、執法與支援合起來，回答哪些方案更可持續。','結論須把多項替代措施與減少犯罪的目標連成一句時。',[' would reduce ', ' more realistically and sustainably.'],['三類替代措施','需要減少的問題'])),
];
const wrongReasons=[
  ['主張禁令無效是政策立場，沒有 because 說酒精何以與犯罪相關。','列具體管制措施，沒有解釋酒精如何令爭執升級。','結論否定禁酒，沒有交代引言中問題的實際嚴重性。'],
  ['because 說問題為何嚴重，沒有評估全面禁令是否有效。','A more effective solution 轉向替代方案，沒有直接否定禁酒。','結論重申立場，沒有引言中 would be an effective way 的政策評估。'],
  ['I do not think 直接否定政策，沒有「表面對根本行為」的比較。','If 說黑市形成的條件，沒有區分問題表象與導致犯罪的行為。','rather than remove it 總結問題地下化，沒有解釋政策最初打錯目標。'],
  ['rather than 比較表面與真正行為，沒有並列執行困難及新犯罪。','黑市條件句詳述其中一項後果，沒有概括政策兩大弱點。','far more practical 比較兩種方案，沒有先指出禁酒實施上的缺陷。'],
  ['主要弱點的總述，沒有用「需求仍在」推演非法買賣。','犯罪集團的危害已是黑市後果，沒有先交代市場怎樣出現。','夜店牌照例子說預防誘因，沒有處理禁令後的替代供應。'],
  ['If 說消費者與黑市形成，尚未說犯罪集團如何傷害顧客。','警方時間被轉移是執法後果，沒有列不安全產品、剝削和逃避監管。','措施對準高風險時刻是解法，沒有黑市經營者的三種危害。'],
  ['犯罪集團的並列危害沒有交代警方執法時間怎樣錯配。','A more effective solution 只提出替代方向，沒有 instead of 的資源取捨。','另一項治療方案關注涉事者，沒有警方面對的執法優先次序。'],
  ['表面與根本行為的比較是在開場診斷，沒有收束黑市副作用。','If 推演黑市形成，沒有 Therefore 對禁令是否解決問題下結論。','預防比全面禁令實際是在方案段比較，沒有地下化這項反效果。'],
  ['直接否定禁令有效，沒有先提出新的針對性方案。','Therefore 總結禁令反效果，沒有開啟替代解法。','Another useful measure 補治療教育，沒有先提出針對性管制的總方向。'],
  ['A more effective solution 只命名策略，沒有具體列三項可執行規則。','夜店牌照例子深入一項誘因，沒有完整的政府措施清單。','do not simply need 比較懲罰與支援，沒有售酒、酒駕和酒吧責任。'],
  ['政策弱點概括禁令難執行，沒有說新措施何以瞄準特定時刻。','A more effective solution 是方案名稱，沒有解釋各措施的共同原理。','If 教育降低未來風險，沒有處理飲酒當下引發犯罪的時刻。'],
  ['If 需求高推演黑市，沒有場所牌照誘因或員工提前介入。','政府措施清單沒有 if...will...before 的現場決策因果。','預防比較說較實際，沒有具體夜店如何在打鬥前採取行動。'],
  ['Therefore 說禁令可令問題地下化，沒有比較具體預防的實際性。','高風險時刻說措施對準哪裏，沒有與全面禁令作 far more practical 比較。','另一項措施轉到治療教育，沒有回扣夜店預防與禁令的比較。'],
  ['A more effective solution 開始針對性管制，沒有另加治療教育。','夜店牌照例子說現場介入，沒有反覆濫用者的長期支援。','結論直接否定全面禁令，沒有提出第二種解法機制。'],
  ['政府三項規則是公共管制，沒有指出個人除懲罰外需要甚麼。','Another useful measure 只命名治療教育，沒有 semicolon 對比和具體支援。','If 教育是未來預防，沒有說當前犯事者還需要輔導與戒癮。'],
  ['高風險時刻的措施關注即時犯罪觸發點，沒有教育的長期根源作用。','Another useful measure 提出治療教育，沒有 if 條件推到未來犯罪減少。','結論的方案整合沒有教青少年酒精如何影響判斷的機制。'],
  ['引言 I do not think 表明立場，沒有結論標記和精簡重申。','A more effective solution 開啟另一政策，沒有否定全面禁酒。','結尾第二句總結替代措施，沒有直接回答禁酒是否有效。'],
  ['具體政府規則只列管制行動，沒有結尾整合三類方案。','Another useful measure 只補治療教育，沒有與規管執法合起來。','結論第一句否定禁酒，尚未回答哪些替代措施較可行。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求分別回答甚麼？',[
    '全面禁酒是否有效減少犯罪，以及還有甚麼可行方案',
    '所有酒吧何時開門，以及哪種飲品最受顧客歡迎',
    '各國酒稅應訂多高，以及夜店員工薪酬應是多少',
    '警方如何處理所有罪行，以及學校應教哪門課程',
  ],'第一問要評估全面禁酒的效果；第二問要提出其他減少酒精相關犯罪的方法。'),
  {type:'multi',prompt:'選出範文兩段主體的主要論證',detail:'選兩項，再按「確認」。',options:[
    '全面禁酒難執行，需求仍在會形成黑市並分散警方資源',
    '限制高風險時刻、加強場所責任，另以治療和教育減少根源',
    '警方應把主要時間用來追查每一名普通飲酒者',
    '只要提高酒吧價格，便可以取消所有教育和支援',
  ],correct:[0,1],why:'文章先推演禁令的副作用，再提出針對性管制與長期支援。'},
];
const route=[sequence('依照範文次序排好四段的任務',[
  ['引言判斷','酒精會加劇衝突，但全面禁酒只處理表面，不能有效減少犯罪。'],
  ['禁令弱點','需求推動非法供應和黑市，犯罪集團危害顧客，警方資源被轉移。'],
  ['替代做法','限制高風險售酒時段、加強罰則與場所責任，配合治療和教育。'],
  ['結論收束','再次否定禁酒，並以規管、執法和適當支援作較可持續的解法。'],
],'先評估全面禁令 → 推演黑市與執法副作用 → 提出短期管制及長期支援 → 回答兩問。')];
const evidence=[
  quiz('作者為何說全面禁酒難以奏效？',[
    '酒精需求可能仍高，禁令因而催生非法供應和黑市',
    '禁令會令所有人立即停止飲酒，故警方再無工作',
    '禁令會自動令酒吧和犯罪集團轉成教育機構',
    '作者認為酒精從來不會影響自制力或攻擊性',
  ],'需求若沒有消失，交易可轉到非法市場，令禁令難執行。'),
  quiz('黑市可能對顧客造成哪些風險？',[
    '犯罪集團售賣不安全產品、剝削脆弱顧客並逃避監管',
    '顧客一定能買到受監督、可追責的合格產品',
    '酒吧會更容易辨認醉酒顧客並提早停止供應',
    '警方只需保護正式酒吧，毋須關注地下交易',
  ],'文章的 could then 從黑市形成推到三項具體危害。'),
  quiz('全面禁酒可能怎樣改變警方工作的重心？',[
    '警方追查一般飲酒者和地下賣家，反而少了時間處理暴力罪犯',
    '警方能同時完全不用理會地下供應和暴力罪犯',
    '警方只須教導酒吧員工，便不再需要調查任何罪案',
    '警方可把所有人手轉到學校，且不會影響執法工作',
  ],'instead of 在原句中指出有限執法資源的取捨。'),
  quiz('為甚麼限制深夜售酒屬「針對性管制」？',[
    '它瞄準飲酒最可能引發犯罪的時刻，而非禁止所有飲酒',
    '它只根據飲品包裝顏色作限制，與犯罪風險無關',
    '它要求每個人完全停止飲酒，也取消所有場所責任',
    '它只處罰已經犯事的人，沒有任何事前干預',
  ],'原文把售酒時段、醉酒服務及暴力罰則連到高風險時刻。'),
  quiz('夜店牌照例子如何展示預防機制？',[
    '若服務醉酒顧客可能失牌，員工便有理由在打鬥前介入',
    '員工只有在打鬥發生後，才可能知道顧客已醉酒',
    '夜店失牌與服務顧客無關，因此員工毋須改變行動',
    '全面禁酒後夜店必然存在，卻完全不用遵守牌照規則',
  ],'牌照後果改變員工誘因，把介入時間移到衝突升級之前。'),
  quiz('作者為何還提出輔導與戒癮支援？',[
    '部分涉事者需要處理反覆濫用酒精及認識自己造成的傷害',
    '輔導能讓所有酒駕和暴力行為毋須承擔任何後果',
    '戒癮支援只為酒吧節省成本，與人的行為完全無關',
    '教育應取代所有管制，讓場所毋須對醉酒顧客負責',
  ],'「不只是懲罰」表示支援補足罰則，並非免除責任。'),
  quiz('學校和社區教育的目標是甚麼？',[
    '讓年輕人理解酒精如何影響判斷與自制，減少日後風險',
    '只讓年輕人記熟各種酒名，不討論飲酒後的行為',
    '等到人們反覆犯事後，才第一次介紹酒精的影響',
    '全面禁止所有課外活動，假設這樣就能處理根源',
  ],'教育着眼未來，從判斷力和自制力的根源預防。'),
];
const logic=[
  sequence('第一主體段：禁令如何把問題轉入地下',[
    ['提出兩項弱點','全面禁酒難執行，而且可能產生新的犯罪活動。'],
    ['需求仍存在','人們可能轉向非法供應者，黑市因此出現。'],
    ['黑市危害','犯罪集團售賣不安全產品，剝削顧客並避開監管。'],
    ['警方資源錯配','追查飲酒者與地下賣家，會分散處理暴力罪犯的時間。'],
    ['段落結論','禁令或只把問題藏起來，沒有真正消除它。'],
  ],'每一步都承接前一步的政策後果，不能只把「黑市」當成一個孤立口號。'),
  sequence('第二主體段：針對性管制與長期支援',[
    ['提出策略','改用針對性管制，而不是一刀切禁止。'],
    ['具體規則','限制深夜售酒、加重酒駕與暴力罰則，要求酒吧拒絕服務醉酒顧客。'],
    ['現場誘因','夜店可能失牌，員工便有理由在爭執變成打鬥前介入。'],
    ['支援反覆濫用者','提供輔導、戒癮支援及理解傷害的教育。'],
    ['教育下一代','讓年輕人理解酒精對判斷與自制的影響，減少未來犯罪。'],
  ],'即時高風險時刻由規管與場所責任處理，長期濫用與未來風險由支援教育處理。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink,
});
const transferTasks=[
  transfer('城市打算全面禁止電動單車，因為有人在夜間危險駕駛。','哪項最符合範文對全面禁令的評估方式？',[
    '先查需求是否轉入非法租借，再查危險駕駛是否減少',
    '只要發布禁令，就假設所有危險駕駛會立即消失',
    '只追查每名騎車者，不再處理真正危險的駕駛',
    '因為有人夜間違規，就假設所有租借都同樣有害',
  ],[
    '範文看禁令能否執行，並推演仍有需求時的非法替代和目標錯配。',
    '發布禁令並不等於需求或危險行為消失。',
    '這重現了範文對警方資源被轉移的擔憂。',
    '全面推論沒有把高風險行為與一般使用分開。',
  ],[2,3,4,6],'範文反對只處理表面：需求仍在可催生黑市，警方也可能忙於追查一般飲酒者。'),
  transfer('市政府全面禁止街頭食品，居民仍想買便宜午餐，無牌攤檔開始出現。','接下來哪項推論最貼合範文的黑市因果鏈？',[
    '需求未消失會養活地下交易，食品安全和監管可能更差',
    '只要攤檔轉到暗處，食物就一定比持牌商店更安全',
    '全面禁令會同時消除顧客需求與所有無牌供應者',
    '食物交易一旦非法，監管機構便毋須關注顧客風險',
  ],[
    '範文由需求仍在推到非法供應，再指出產品安全與監管風險。',
    '地下交易通常更難檢查，這與範文機制相反。',
    '題目已說需求和無牌供應繼續存在。',
    '範文正把顧客安全列為黑市可能造成的問題。',
  ],[4,5,7],'範文把酒精需求、非法供應、不安全產品和逃避監管連成完整因果鏈。'),
  transfer('校方想禁止所有學生在操場活動，原因是午飯時有少數人打架。','哪項最能轉用範文的執法資源論證？',[
    '管理時間應集中高風險衝突，避免追逐所有正常活動學生',
    '管理時間只應用來處理正常活動，毋須理會真正打架者',
    '只要禁止操場活動，所有爭執便不會轉到其他地方',
    '校方應取消所有規則，讓打架與正常活動完全相同',
  ],[
    '原文以 instead of 說明追查一般飲酒者會擠走處理暴力罪犯的時間。',
    '這把管理優先次序倒轉了。',
    '全面禁止可能只是令問題移位，不能保證消失。',
    '範文主張針對性規則，並非取消所有規則。',
  ],[6,7,8],'範文擔心警方被迫追查一般飲酒者和地下賣家，而非集中處理暴力犯事者。'),
  transfer('大型活動有少數人離場時推撞。主辦方考慮在最擠迫時段增加人手與出口引導。','哪項最能解釋這方案何以「有針對性」？',[
    '把人手放在推撞最可能發生的時段，並在升級前介入',
    '在最安靜的時段增加人手，避開已知的擠迫風險',
    '取消所有活動，假設人們不會改到其他地方聚集',
    '只在有人受傷後記錄推撞，事前毋須改變安排',
  ],[
    '原文的 targeted control 把措施放在飲酒最可能觸發犯罪的時刻。',
    '這錯配已知高風險時段。',
    '全面取消未展示比精準預防更可行。',
    '題目中的方案強調事前介入。',
  ],[8,10,12],'範文說限制深夜售酒等措施對準犯罪最可能被觸發的時刻。'),
  transfer('餐廳若向明顯醉酒顧客繼續供酒，可能失去牌照。員工在口角開始時便停止供應。','哪項最能說明牌照規則的作用？',[
    '場所承擔後果，員工因此有理由在口角變打鬥前介入',
    '場所承擔後果，員工因此應等到打鬥後才開始行動',
    '牌照規則與員工決定無關，只能改變餐廳裝修方式',
    '員工停止供應後，便不必再關注已醉酒顧客的安全',
  ],[
    '原文夜店例子把失牌風險連到員工在衝突升級前的選擇。',
    '等打鬥後才行動失去預防的時間價值。',
    '牌照是實際誘因，不是裝修規格。',
    '停止供應是減少風險的一步，仍須處理現場安全。',
  ],[9,11,12],'範文的夜店知道服務醉酒顧客可能失牌，員工便有強理由在爭執變打鬥前介入。'),
  transfer('有人反覆醉酒打架，法庭已安排罰款，但社工發現他有嚴重酒精依賴。','哪項最符合範文對懲罰與支援的關係？',[
    '保留應有責任，同時提供輔導、戒癮協助和傷害教育',
    '只增加罰款，不檢查反覆依賴和行為後果的關係',
    '只安排輔導，就自動免除對暴力行為的所有責任',
    '只禁止這人出入餐廳，便視為已處理其長期依賴',
  ],[
    '範文說涉事者「不只是」需要懲罰，也需要處理依賴及理解傷害。',
    '單靠罰款沒有處理反覆濫用的根源。',
    '原文沒有把支援寫成免責。',
    '場地限制與長期治療需求不同。',
  ],[13,14,17],'範文在管制之外補上治療、教育、輔導和戒癮支援，沒有說可取消責任。'),
  transfer('學校想減少未來酒後衝突，安排課程說明酒精怎樣改變判斷與自制。','這課程如何承接範文的長期預防？',[
    '讓學生及早理解行為機制，從根源減少日後衝突風險',
    '只教授各種飲品名稱，不討論判斷力或行為後果',
    '等學生已反覆打架，才第一次解釋酒精的影響',
    '假設一次課程能保證所有人以後絕不會飲酒',
  ],[
    '原文以 If ... teach ... how 推到未來犯罪從根源減少。',
    '記名稱不能達到原文的判斷與自制教育目標。',
    '等問題固化會削弱教育的預防作用。',
    '原文說降低風險，並未保證零飲酒或零犯罪。',
  ],[14,15],'範文主張學校和社區教青少年酒精對判斷及自制的影響，以減少未來犯罪。'),
  transfer('城市討論網上賭博。全面禁令恐令交易轉到地下；較可行的是限制高風險時段並提供成癮支援。','哪項最像範文的雙層解法？',[
    '用規則控制高風險情況，另用支援處理反覆依賴',
    '只封鎖網站，不考慮交易是否轉到無監管平台',
    '只提供支援，不管理任何高風險的即時交易',
    '只提高刑罰，不檢查反覆依賴與現場誘因',
  ],[
    '範文同時處理觸發犯罪的時刻和反覆濫用的長期原因。',
    '這會重現全面禁令令問題地下化的風險。',
    '只支援而不管制，漏掉原文的即時高風險時刻。',
    '只處罰而不支援，漏掉反覆依賴的處理。',
  ],[7,8,10,13,14],'範文以針對性管制處理高風險時刻，並以治療教育處理反覆濫用。'),
  transfer('警方要同時處理非法售酒與酒後傷人，但人手有限。','哪種安排最符合範文對執法優先次序的要求？',[
    '優先處理暴力傷害和高風險供應，避免追逐一般飲酒者',
    '把全部人手放在一般飲酒者身上，暫停處理暴力傷害',
    '完全不處理地下供應，假設不安全產品不會傷害人',
    '只要人手有限，便應取消所有酒後暴力相關規則',
  ],[
    '文章批評禁令會把警力從暴力罪犯轉向普通飲酒者與地下賣家。',
    '這正是原文認為應避免的資源錯配。',
    '黑市不安全產品亦是文中明確指出的風險。',
    '有限人手需要優先次序，不等於取消規則。',
  ],[5,6,9],'範文擔心警方追查一般飲酒者，失去集中處理暴力罪犯的時間；規管要對準高風險。'),
  transfer('市議會撰寫減少酒精相關犯罪的結論，已指出全面禁酒難執行。','哪一句最完整回應題目兩問？',[
    '否定全面禁酒，並配合精準規管、有效執法與戒癮支援',
    '只說禁酒難執行，不提出任何可取代的具體措施',
    '只列酒精危害，不判斷全面禁酒能否真正減少犯罪',
    '只重述警方繁忙，不交代如何預防或支援涉事者',
  ],[
    '範文結論先回答禁酒無效，再把三類替代措施連到減罪目標。',
    '第二題仍須提出其他解法。',
    '第一題要求清楚評估禁令效果。',
    '警方資源問題只是反對禁令的一項理由，非完整答案。',
  ],[1,16,17],'範文結尾否定禁酒，並把更嚴格規管、更有力執法和濫用支援連成較可持續的方案。'),
];
export default {
  key:'direct-question:10',
  meta:{topic:'酒精相關犯罪與禁酒政策',summary:'全面禁酒難執行且可能催生黑市；針對性管制、執法、治療及教育更可行。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks,
};
