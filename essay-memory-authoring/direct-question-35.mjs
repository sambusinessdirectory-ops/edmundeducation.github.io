// Fully authored support for Direct Question 35; source essay is unchanged.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-35-ielts-direct-question.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['direct-question:35'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'In societies where people buy many things, shopping is no longer just about getting what they need.',
  'Many people now buy things they can live without and buy new ones long before they need to, even while old ones still work.',
  'I will argue that adverts and pressure from other people are the main reasons, and that this change is bad.',
  'One big reason people buy things they do not need is that companies are very good at making people want them.',
  'Adverts hardly ever show goods as just useful things; instead, they link them to looking good, doing well, feeling sure of oneself or fitting in.',
  'So buyers may feel that having the newest phone, clothes or home machine makes them look better as people, instead of just doing a useful job.',
  'This pressure is stronger on social media, where people often see famous online people and friends showing things they have just bought.',
  'When buying things becomes a way to get others to like you, people are more likely to buy things they do not need.',
  'Another reason is that many goods are made to seem old-fashioned very soon.',
  'For example, technology companies bring out new versions each year, even if they are only a little better.',
  'Someone whose phone still works well may still want a new one because it looks more stylish or works a little faster.',
  'In this way, shopping becomes less about fixing real problems and more about wanting something new.',
  'This habit can soon repeat itself: people buy something, like it for a short time and then look for something newer.',
  "I don't believe this is good.",
  'For each person, buying things they do not need can waste money and lead to bad money habits, especially if they borrow money to shop.',
  'More seriously, it harms the environment because thrown-away goods often become rubbish from old phones or plastic, or are taken to a rubbish dump.',
  'Making new goods again and again also uses energy and materials from nature that people could use more carefully.',
  'To sum up, adverts, comparing ourselves with others and quickly changing product models make people want to buy things they do not need.',
  'But this behaviour is harmful because it wastes money and puts pressure on the environment that we could avoid.',
];
const vocabulary=[
  [['modern consumer societies','societies where people buy many things','現代消費社會'],['no longer limited to','no longer just about','不再局限'],['meeting basic needs','getting what they need','滿足基本需要']],
  [['purchase items','buy things','購買物品'],['could easily live without','can live without','沒有也能生活'],['replace','buy new ones','更換'],['perfectly functional products','old ones still work','仍可用的產品'],['long before necessary','long before they need to','遠早於必要']],
  [['mainly driven by advertising and social pressure','adverts and pressure from other people are the main reasons','廣告與社會壓力'],['negative development','change is bad','負面發展']],
  [['unnecessary goods','things they do not need','不必要商品'],['highly skilled','very good','擅長'],['creating desire','making people want them','製造欲望']],
  [['Advertisements','Adverts','廣告'],['rarely present','hardly ever show','很少呈現'],['ordinary objects','just useful things','普通物品'],['connect them with','link them to','與之連結'],['social belonging','fitting in','社會歸屬']],
  [['As a result','So','結果'],['consumers','buyers','消費者'],['newest phone, outfit, or household device','newest phone, clothes or home machine','新款手機服裝家電'],['improve their identity','makes them look better as people','提升身份形象'],['practical function','useful job','實用功能']],
  [['social media','social media','社交媒體'],['constantly exposed to','often see','經常接觸'],['influencers','famous online people','網紅'],['displaying new purchases','showing things they have just bought','展示新購物品']],
  [['consumption','buying things','消費'],['gain approval','get others to like you','取得認同'],['genuinely need','need','真正需要']],
  [['Another reason','Another reason','另一原因'],['products','goods','產品'],['designed to feel outdated','made to seem old-fashioned','設計成顯得過時'],['very quickly','very soon','很快']],
  [['for instance','For example','例如'],['release new models','bring out new versions','推出新型號'],['relatively minor','only a little better','改進有限']],
  [['still works well','still works well','仍運作良好'],['tempted to replace it','want a new one','想更換'],['more fashionable','more stylish','較時尚'],['slightly faster','a little faster','稍快']],
  [['solving real problems','fixing real problems','解決真問題'],['chasing novelty','wanting something new','追求新鮮']],
  [['turn into a cycle','repeat itself','形成循環'],['enjoy it briefly','like it for a short time','短暫享用'],['next upgrade','something newer','下一次升級']],
  [['I do not think',"I don't believe",'我不認為'],['a good thing','good','一件好事']],
  [['On a personal level','For each person','個人層面'],['unnecessary consumption','buying things they do not need','不必要消費'],['wasted money','waste money','浪費金錢'],['poor financial habits','bad money habits','不良理財習慣'],['buy on credit','borrow money to shop','借貸購物']],
  [['environmental damage','harms the environment','環境破壞'],['discarded goods','thrown-away goods','丟棄商品'],['electronic waste','rubbish from old phones','電子垃圾'],['plastic waste','plastic','塑膠垃圾'],['landfill','rubbish dump','堆填區']],
  [['Producing constant replacements','Making new goods again and again','不斷生產替代品'],['consumes energy','uses energy','耗用能源'],['natural resources','materials from nature','自然資源'],['more responsibly','more carefully','更負責任']],
  [['In conclusion','To sum up','總結'],['needless products','things they do not need','不必要產品'],['advertising','adverts','廣告'],['social comparison','comparing ourselves with others','社會比較'],['rapid product cycles','quickly changing product models','快速產品週期']],
  [['However','But','然而'],['harmful','harmful','有害'],['financial waste','wastes money','金錢浪費'],['avoidable pressure on the environment','pressure on the environment that we could avoid','可避免的環境壓力']],
];
const chunkOverrides=[
  ['In modern consumer societies,','shopping is no longer limited to meeting basic needs.'],
  ['Many people now purchase items they could easily live without','and replace perfectly functional products long before necessary.'],
  ['This essay will argue that this behaviour','is mainly driven by advertising and social pressure,','and that it is clearly a negative development.'],
  ['One major reason people buy unnecessary goods','is that companies have become highly skilled','at creating desire.'],
  ['Advertisements rarely present products as ordinary objects;','instead, they connect them with beauty, success,','confidence, or social belonging.'],
  ['As a result, consumers may start to feel','that owning the newest phone, outfit, or household device','will improve their identity','rather than simply serve a practical function.'],
  ['This pressure is even stronger on social media,','where people are constantly exposed to influencers','and friends displaying new purchases.'],
  ['When consumption becomes a way to gain approval,','people are more likely to buy things','they do not genuinely need.'],
  ['Another reason is that many products','are designed to feel outdated very quickly.'],
  ['Technology companies, for instance, release new models every year,','even when the improvements are relatively minor.'],
  ['A person whose phone still works well','may still feel tempted to replace it','because the newer version looks more fashionable or slightly faster.'],
  ['In this way, shopping becomes less about solving real problems','and more about chasing novelty.'],
  ['This habit can easily turn into a cycle:','people buy something, enjoy it briefly,','and then soon begin looking for the next upgrade.'],
  ['I do not think','this is a good thing.'],
  ['On a personal level, unnecessary consumption','can lead to wasted money and poor financial habits,','especially among people who buy on credit.'],
  ['More seriously, it creates environmental damage','because discarded goods often become electronic waste','or plastic waste, or are sent to landfill.'],
  ['Producing constant replacements also consumes energy','and natural resources','that could be used more responsibly.'],
  ['In conclusion, people often buy needless products','because advertising, social comparison, and rapid product cycles','make unnecessary purchases seem attractive.'],
  ['However, this behaviour is harmful','because it encourages financial waste','and places avoidable pressure on the environment.'],
];
const simpleChunkOverrides=[
  ['In societies where people buy many things,','shopping is no longer just about getting what they need.'],
  ['Many people now buy things they can live without','and buy new ones long before they need to,','even while old ones still work.'],
  ['I will argue that adverts and pressure from other people','are the main reasons,','and that this change is bad.'],
  ['One big reason people buy things they do not need','is that companies are very good','at making people want them.'],
  ['Adverts hardly ever show goods as just useful things;','instead, they link them to looking good,','doing well, feeling sure of oneself or fitting in.'],
  ['So buyers may feel that having the newest phone,','clothes or home machine makes them look better as people,','instead of just doing a useful job.'],
  ['This pressure is stronger on social media,','where people often see famous online people','and friends showing things they have just bought.'],
  ['When buying things becomes a way to get others to like you,','people are more likely to buy things they do not need.'],
  ['Another reason is that many goods','are made to seem old-fashioned very soon.'],
  ['For example, technology companies bring out new versions each year,','even if they are only a little better.'],
  ['Someone whose phone still works well','may still want a new one','because it looks more stylish or works a little faster.'],
  ['In this way, shopping becomes less about fixing real problems','and more about wanting something new.'],
  ['This habit can soon repeat itself:','people buy something, like it for a short time','and then look for something newer.'],
  ["I don't believe",'this is good.'],
  ['For each person, buying things they do not need','can waste money and lead to bad money habits,','especially if they borrow money to shop.'],
  ['More seriously, it harms the environment','because thrown-away goods often become rubbish from old phones','or plastic, or are taken to a rubbish dump.'],
  ['Making new goods again and again also uses energy','and materials from nature','that people could use more carefully.'],
  ['To sum up, adverts, comparing ourselves with others','and quickly changing product models','make people want to buy things they do not need.'],
  ['But this behaviour is harmful because it wastes money','and puts pressure on the environment','that we could avoid.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，但與原句所建立的關係不同。`};}
const structures=[
  card('In wealthy cities, eating is no longer limited to meeting basic needs.','以 no longer limited to 指出購物超越基本需要',[1,2,3],fixed(0,'In [現代消費社會], [購物] is no longer limited to [滿足基本需要].','開題指出購物如今有非必需目的。','題目談購買不需要的東西，先界定消費已超越生活必需時。',['In ', ', ', ' is no longer limited to '],['消費發生的社會','行為主體','已被超越的基本目的'])),
  card('Many students now buy gadgets they can live without and replace working ones too soon.','以 buy ... and replace 並列非必要購買與提早更換',[0,3,9],fixed(1,'[很多人] now purchase [非必需物] and replace [仍能用的產品] long before necessary.','把題目兩種行為具體化：買不必要物品和過早換可用產品。','引言要清楚描述問題行為，而不能只說人們愛購物時。',[' now purchase ', ' and replace ', ' long before necessary.'],['參與非必要消費的人','其實可不買的物品','仍可使用而被更換的產品'])),
  card('I will argue that this habit comes from adverts and peer pressure, and that it is harmful.','以 and that 分別預告原因判斷與價值判斷',[1,3,13],fixed(2,'This essay will argue that [非必要購物] is mainly driven by [廣告與社會壓力], and that it is [負面發展].','同時回答題目「為何」和「是否好事」，並預告兩類原因。','雙問題目引言中需表態，並分別交代成因與評價時。',['This essay will argue that ', ' is mainly driven by ', ', and that it is '],['被解釋的消費行為','主要成因','作者的整體評價'])),
  card('One major reason pupils buy unnecessary apps is that firms know how to create desire.','以 One major reason ... is that 提出廣告製造欲望',[2,4,8],fixed(3,'One major reason [人們買不必要商品] is that [企業擅長製造欲望].','第一主體段把非必要購買連到企業塑造想要的感覺。','開始解釋購買原因，要先把企業影響明確提出時。',['One major reason ', ' is that '],['需要解釋的購買行為','使人產生想要感的企業做法'])),
  card('Adverts rarely show shoes as ordinary objects; instead, they link them with status and belonging.','以 instead 對照商品本身與廣告賦予的身份意義',[3,5,6],fixed(4,'Advertisements rarely present [產品] as [普通物品]; instead, they connect them with [美貌成功自信歸屬].','廣告賣的不是物件用途，還有身份與社會認同。','已說企業製造欲望，要說清廣告怎樣給普通商品附加情感意義時。',['Advertisements rarely present ', ' as ', '; instead, they connect them with '],['被宣傳的產品','被淡化的實用身份','被附加的情感或社會意義'])),
  card('As a result, buyers may feel that new trainers improve their image rather than just protect their feet.','以 rather than 對照身份想像與實用功能',[4,6,7],fixed(5,'As a result, [消費者] may start to feel that [擁有新產品] will improve [身份形象] rather than simply serve [實用功能].','廣告附加意義後，買家把產品當作塑造自我的工具。','說完廣告如何連商品與成功，要解釋它如何改變買家想法時。',['As a result, ', ' may start to feel that ', ' will improve ', ' rather than simply serve '],['受廣告影響的買家','被想像有身份力量的購買','被期待改善的自我形象','原本的產品用途'])),
  card('This pressure is stronger online, where users repeatedly see friends showing new clothes.','以 where 指出社交平台如何放大展示壓力',[4,5,7],fixed(6,'This pressure is even stronger on [社交媒體], where [人們] are constantly exposed to [網紅及朋友的新購物展示].','社交媒體反覆呈現他人的消費，使比較壓力加強。','廣告效果已說明，還要展示網紅和朋友如何把壓力帶入日常時。',['This pressure is even stronger on ', ', where ', ' are constantly exposed to '],['壓力特別強的平台','不斷看到展示的人','被反覆看到的購物展示'])),
  card('When collecting shoes becomes a way to gain approval, people buy more pairs than they need.','以 When 條件句連認同需求到非必要購買',[5,6,8],fixed(7,'When [消費] becomes a way to gain [認同], [人們] are more likely to buy [不真正需要的東西].','購買成為求認同手段時，非必要購物更容易發生。','社交媒體展示已說明，要推到買家實際購物行為時。',['When ', ' becomes a way to gain ', ', ', ' are more likely to buy '],['被賦予社會作用的行為','想取得的認同','可能受影響的人','不必要的購買'])),
  card('Another reason is that many devices are designed to feel old soon.','以 Another reason 轉入人為製造過時感',[3,7,9],fixed(8,'Another reason is that [許多產品] are designed to feel [很快過時].','第二主體段由廣告社交轉到商品更新節奏。','前段已完成社會壓力成因，需提出不同機制的第二原因時。',['Another reason is that ', ' are designed to feel '],['被安排快速更新的產品','被製造的過時感'])),
  card('Phone companies, for example, release new models yearly, even when changes are small.','以 even when 指出新型號改進有限仍每年推出',[8,10,12],fixed(9,'[科技公司], for instance, release [新型號] every year, even when [改進有限].','年度發售不一定因舊產品不能用，可能只是小幅更新。','說完過時感，要用科技產品更新週期作具體例子時。',[', for instance, release ', ' every year, even when '],['定期發售的公司','每年推出的產品','無礙發售的微小改善'])),
  card('A person whose coat is still useful may replace it because a newer one looks fashionable.','以 whose ... still works well ... because 說明可用卻想換',[9,11,12],fixed(10,'A person whose [手機仍好用] may still feel tempted to replace it because [新版更時尚或稍快].','新版本外觀或小改進可誘發提早更換，即使舊機仍可用。','年度新型號例子之後，要說明個人為何明知舊機能用仍換機時。',['A person whose ', ' may still feel tempted to replace it because '],['仍能使用的舊產品','引發更換欲望的新版本特點'])),
  card('In this way, buying clothes becomes less about warmth and more about keeping up with fashion.','以 less about ... and more about 對照解決問題與追新',[10,12,13],fixed(11,'In this way, [購物] becomes less about [解決真正問題] and more about [追求新鮮].','把換機例子概括成消費目的由需要移向新奇。','具體換機例子已講完，要指出購物動機如何轉變時。',['In this way, ', ' becomes less about ', ' and more about '],['動機轉變的行為','變弱的實用目的','變強的新奇追求'])),
  card('This habit becomes a cycle: people buy shoes, enjoy them briefly and then seek another pair.','以 cycle: 後列購買、短暫滿足、再升級',[10,11,14],fixed(12,'This habit can easily turn into a cycle: [買東西], [短暫享用] and then [尋找下次升級].','追新不是一次行為，而可能形成重複購買循環。','已說追新動機，要顯示它如何重複並維持消費時。',['This habit can easily turn into a cycle: ', ', ', ', and then soon begin '],['循環第一步','短暫滿足','下一輪欲望'])),
  card('I do not think this is a good thing.','以 I do not think 明確轉入負面評價',[12,14,17],fixed(13,'I do not think [這種消費] is a good thing.','第三主體段直接回答第二問：作者認為這不是好事。','原因分析已完成，準備評估後果時先清楚表態。',['I do not think ', ' is a good thing.'],['被評價的消費行為'])),
  card('On a personal level, unnecessary subscriptions waste money, especially for people paying on credit.','以 On a personal level 聚焦金錢和信貸風險',[13,15,16],fixed(14,'On a personal level, [不必要消費] can lead to [浪費錢] and [差的理財習慣], especially among [借貸購物者].','個人層面先談財務浪費，特別提醒借貸者風險。','已判斷非必要購物有害，要指出個人首先承受的具體代價時。',['On a personal level, ', ' can lead to ', ' and ', ', especially among '],['造成損失的消費','立即金錢後果','較長期理財後果','風險較高的人'])),
  card('More seriously, it harms the environment because old devices become electronic waste.','以 More seriously 轉入更廣的環境代價',[14,16,17],fixed(15,'More seriously, [提早丟棄] creates [環境破壞] because [舊品成電子或塑膠垃圾，或送往堆填區].','把評價由個人金錢上升到棄置商品的環境損失。','個人財務後果已說明，要提出更廣、更長遠的環境影響時。',['More seriously, ', ' creates ', ' because '],['造成廢物的行為','更嚴重的公共損失','廢物去向'])),
  card('Making new phones repeatedly also uses energy and materials that could be saved.','以 also 補充不斷製造替代品的資源消耗',[14,15,18],fixed(16,'[不斷生產替代品] also consumes [能源] and [自然資源] that could be used [更負責任].','環境代價不只在棄置，也在反覆生產使用能源與原料。','已談垃圾去向，還需補足新商品製造階段的資源成本時。',[' also consumes ', ' and ', ' that could be used '],['持續製造的行為','被耗用的能源','被耗用的原料','原本可採取的使用方式'])),
  card('In conclusion, families buy unused gadgets because adverts, comparison and fast updates make them attractive.','以 because 總結廣告、比較與更新週期三原因',[2,8,18],fixed(17,'In conclusion, [人們買不需要產品] because [廣告、社會比較和快速更新] make [非必要購買] seem attractive.','結論第一句回答為何購買：外部宣傳、比較和產品週期使它顯得吸引。','末段須把兩段成因合在一句，清楚回答題目第一問時。',['In conclusion, ', ' because ', ' make ', ' seem attractive.'],['需解釋的購買行為','共同推動欲望的因素','因而變得吸引的行為'])),
  card('However, this pattern is harmful because it wastes money and puts pressure on the planet.','以 However ... because 回答負面判斷及雙重後果',[13,15,17],fixed(18,'However, [非必要消費] is harmful because it encourages [金錢浪費] and places [可避免的環境壓力] on the environment.','結論第二句回答是否好事，以個人財務和環境兩項代價支持否定。','原因已概括，還須重申評價並列明不好的兩種後果時。',['However, ', ' is harmful because it encourages ', ' and places ', ' on the environment.'],['被評價的消費','個人財務損失','加諸環境的負擔'])),
];
const wrongReasons=[
  ['非必要購買是例子，沒有先說購物已超越基本需要。','廣告成因是後文解釋，不是消費背景。','企業製造欲望是具體原因，沒有社會層面開題。'],
  ['購物不再只為需要是概括，沒有買與提早換兩種行為。','企業製造欲望是原因，不是題目行為的雙重描述。','年度新型號是後文例子，不是兩類購物行為。'],
  ['題目行為只是現象，沒有廣告社會壓力和負面判斷。','企業製造欲望是第一原因細節，未完整回答兩問。','負面立場在後文出現，沒有同時預告主要成因。'],
  ['引言雙問答案是總體預告，沒有先聚焦企業製造欲望。','廣告如何連成功是下一句機制，不是原因標題。','產品迅速過時是不同的第二原因。'],
  ['企業製造欲望是概括，沒有商品物件與身份意義對照。','消費者身份感是廣告作用的後果。','社媒展示是另一個放大壓力的場景。'],
  ['廣告內容是前一步輸入，沒有買家身份感與功能對比。','社媒展示是壓力來源，未說買家如何理解商品。','求認同後購買是更後面的行為結果。'],
  ['廣告身份想像是個人理解，未轉入社媒反覆展示。','買家認同需求是後續購買結果。','條件句是購買後果，不是平台壓力本身。'],
  ['身份想像只是廣告作用，未有 When 認同與購買的條件關係。','社媒展示說輸入，尚未推到非必要購買。','產品過時是另一條原因。'],
  ['企業廣告是第一條成因，不是 Another reason 轉到產品週期。','認同需求是社會壓力機制，不是設計過時感。','年度新型號是下一句例子，未先提出第二原因。'],
  ['過時感是總原因，沒有科技公司每年發新款的例子。','個人換機欲望是後續反應，非公司發售行為。','循環購物是最後概括，沒有小幅改進的讓步。'],
  ['年度新型號是公司行為，沒有舊機好用仍想換的心理。','追新概括是後一句，不是具體換機例子。','消費循環是更後續的重複後果。'],
  ['換機例子具體，沒有 less about ... more about 的動機總結。','購物循環是行為重複，未對照實用與新奇。','負面評價是下一段立場，不是購物目的轉移。'],
  ['換機例子只是一個決定，尚未展示循環重複。','追新概括是動機，不是買、短享、再尋下一款的次序。','財務浪費是後果評價，非消費循環。'],
  ['購物循環是行為描述，沒有直接回答好不好。','個人財務後果是其後證據。','結論成因是全篇收束，不是此處獨立立場。'],
  ['負面立場沒有指出金錢和信貸風險。','環境代價比個人層面更廣。','製造耗資源是環境補充，不是個人理財。'],
  ['金錢信貸是個人代價，尚未轉入丟棄商品的環境損失。','資源消耗是生產階段，不是廢物去向。','結論成因只回顧誘因，沒有環境代價。'],
  ['個人浪費是前一項損失，沒有新商品生產的能源原料。','棄置垃圾是廢物階段，非反覆製造階段。','結論負面判斷總結環境壓力，沒有細分生產資源。'],
  ['引言只預告廣告與社會壓力，沒有合併產品更新週期。','產品過時段是其中一項成因，不是末段三因收束。','末句有害評價回答第二問，非購物原因。'],
  ['直接說不好是前文立場，沒有金錢和環境雙重結果。','廢棄物只是環境細節，沒有收束兩項代價。','前句只概括購物原因，未判斷其是否有害。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先找欲望來源、循環和代價，再依範文排列。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目問的是哪兩件事？',[
    '人們為何買不需要的東西，以及這樣做是否好事',
    '哪些產品最昂貴，以及哪個廣告最受歡迎',
    '商店幾時關門，以及手機應用甚麼顏色',
    '是否要完全禁止購物，以及所有商品由誰生產',
  ],'範文先解釋非必要購物的成因，再評估財務和環境後果。'),
  {type:'multi',prompt:'選出範文提出的兩條主要購物誘因',detail:'選兩項，再按「確認」。',options:[
    '廣告與社媒把商品連到身份及他人認同',
    '產品快速換代使仍可用的舊款顯得過時',
    '所有新產品都因舊產品完全不能運作才推出',
    '人們總是只在物品真正壞掉後才會更換',
  ],correct:[0,1],why:'一條是社會與廣告壓力；另一條是人為加快的過時感。'},
];
const route=[sequence('依範文次序排列五段的工作',[
  ['引言指出問題與立場','人們買非必需物並提早換可用產品；作者認為不好。'],
  ['第一原因：身份和認同','廣告賦予商品社會意義，社媒展示放大比較。'],
  ['第二原因：快速過時','每年新型號使舊機仍可用也想換，形成追新循環。'],
  ['評估財務與環境','不必要消費浪費金錢，也增加廢物與資源消耗。'],
  ['結論回答兩問','三項誘因使購物吸引，但金錢和環境代價使它有害。'],
],'範文把「為何買」和「是否好」分開回答，再於結論合併。')];
const evidence=[
  quiz('廣告如何使普通商品令人想買？',[
    '把商品連到美貌、成功、自信和被接納的感覺',
    '只列實際功能，絕不暗示任何身份意義',
    '要求每位顧客先證明舊商品已經完全壞掉',
    '只談產品重量，不讓消費者看見任何形象',
  ],'廣告增加商品的象徵意義，而不只是描述功能。'),
  quiz('社交媒體為何加強這種壓力？',[
    '人們反覆看見網紅和朋友展示新買的東西',
    '社媒禁止任何人展示自己剛買的商品',
    '社媒讓所有人完全停止比較彼此的生活',
    '朋友的展示只能影響產品功能，不能影響認同',
  ],'反覆接觸他人購買展示，可把購物變成求認同。'),
  quiz('新手機例子要說明甚麼？',[
    '舊機仍好用，也可能因新版外觀或小幅提速而想換',
    '只有舊機完全壞掉，人才會考慮購買新機',
    '每年新版都必然帶來足以解決重大問題的改進',
    '手機外觀絕不會對任何人的換機念頭有影響',
  ],'例子把「可用」和「想要新版」並置。'),
  quiz('「買、短暫享用、再找升級」揭示甚麼？',[
    '追求新奇可形成重複購買的循環',
    '買一次東西之後永遠不會再想買新款',
    '所有商品必然在幾天後完全失去功能',
    '購物只為解決一次真正的生活困難',
  ],'追新動機會讓短暫滿足變成下一輪欲望。'),
  quiz('借貸購物者在個人層面的風險是甚麼？',[
    '非必要購買可能浪費錢並養成不良理財習慣',
    '一借錢買東西，便必然不再承受任何財務代價',
    '只要商品新潮，借貸便能自動增加收入',
    '所有非必要購物都不需要付款或還款',
  ],'作者特別指出信貸可加重財務壓力。'),
  quiz('環境代價有哪兩個不同階段？',[
    '丟棄舊品形成廢物，反覆生產又耗能源和原料',
    '只有售出商品才影響環境，製造和棄置都無關',
    '只要新產品更快，舊品便自然不會造成任何垃圾',
    '生產替代品能自動恢復用過的全部自然資源',
  ],'範文分別談丟棄與製造兩端的環境損失。'),
  quiz('結論怎樣完整回答題目？',[
    '概括廣告比較和換代原因，再指出財務與環境危害',
    '只說商品很好看，不解釋成因或任何後果',
    '只談環境問題，不回答人們為何想買',
    '只列廣告種類，不判斷這種習慣好不好',
  ],'兩問都要答；原因不等於作者贊成該行為。'),
];
const logic=[
  sequence('廣告與社會壓力如何變成購買',[
    ['企業製造欲望','把普通商品連到美貌成功與歸屬。'],
    ['身份想像','買家把新商品看作提升自我形象的工具。'],
    ['社媒反覆展示','網紅和朋友的新購物持續出現在眼前。'],
    ['求他人認同','消費成為獲讚許的方式。'],
    ['買不需要的東西','認同需求推動非必要購買。'],
  ],'不是產品突然變成生活必需，而是社會意義改變了買家的感受。'),
  sequence('產品換代與兩種代價',[
    ['年度新款','科技公司即使只稍作改進也推出新型號。'],
    ['舊品仍好用','外觀或一點速度差異仍誘發換機。'],
    ['追新循環','短暫享用之後，又尋找下一次升級。'],
    ['個人金錢損失','非必要消費尤其可能傷害借貸購物者。'],
    ['環境雙重損失','棄置變垃圾；再製造耗能源和自然資源。'],
  ],'作者評價不好，是因循環在個人和環境兩方面都造成成本。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('一間運動鞋公司把普通鞋款廣告寫成「穿上才算成功」。','哪項最能運用範文的廣告機制？',[
    '廣告把鞋與成功身份連起來，令實用需要退居其次',
    '鞋款因一句廣告，便真正變成人人生活必需品',
    '只要鞋能穿，廣告便完全不會影響購買想法',
    '消費者只讀鞋底資料，不會留意任何身份暗示',
  ],['範文說廣告把普通產品連到成功及身份。','身份想像不等於真需要。','廣告可影響感受。','題目明示身份話術。'],[3,4,5],'原文說廣告把商品與成功自信連結，使買家期待身份改善。'),
  transfer('學生天天看到同學在社交平台展示新手錶，怕不用新款就不被接納。','哪項最能轉用範文的社會壓力論證？',[
    '反覆展示加重求認同壓力，可能促成不必要購買',
    '只要手錶出現在社媒，舊錶便必然完全壞掉',
    '同學展示新物品不可能影響任何人的歸屬感',
    '手錶品牌只影響時間準確度，與社交壓力無關',
  ],['展示、比較、求認同與購買是原文因果鏈。','舊錶可仍好用。','展示可引發比較。','題目重點是社交認同。'],[6,7],'範文說社媒展示強化壓力，購物成為獲認同方式時更易買非必需品。'),
  transfer('平板電腦每年出新版，今年只快了一點；一位用家手上的舊機仍完全可用。','哪項最符合範文的換代分析？',[
    '新款的小幅改進與外觀，仍可能誘使用家過早換機',
    '只要每年出新版，舊機便必然同日失去功能',
    '平板只快一點，就證明換機必定是生活所需',
    '舊機仍能使用，便代表沒有人會感到新款吸引',
  ],['原文以仍可用手機和小改進說明想換不等於需要換。','發售不使舊機失效。','小改進不等於必需。','誘惑仍可能存在。'],[8,9,10],'範文說科技公司每年小幅更新，舊機仍可用者也可能想換。'),
  transfer('一間學校想教學生辨認「我需要」與「我想要最新款」的分別。','哪項最能運用範文的動機對照？',[
    '先問商品解決甚麼問題，再問是否只為追求新鮮感',
    '只要是新款，就一律當成必不可少的生活工具',
    '只看同學是否也買了，完全不問物品有何用途',
    '只談廣告色彩，不讓學生檢查自己的真正需要',
  ],['範文用 less about real problems, more about novelty 分辨兩種動機。','新款不等於必要。','他人購買是比較壓力。','需要可由實際功能檢驗。'],[5,10,11],'範文說購物可能從解決實際問題轉為追逐新鮮感。'),
  transfer('某人買新耳機，幾天後又開始尋找下一款，雖然原耳機仍很好用。','哪項最能套用範文的消費循環？',[
    '短暫滿足後想升級，需求沒有因買過一次而停止',
    '只要買過一副耳機，就永遠不會再想要新產品',
    '幾天後想換，便證明舊耳機必定已經完全損壞',
    '買、享用、再尋新款彼此沒有任何因果關係',
  ],['原文列買、短享、再找升級的重複次序。','與情境相反。','題目說耳機仍好用。','這正是循環。'],[11,12],'範文把追新描寫成買、短暫享用、再尋下次升級的循環。'),
  transfer('一位年輕人以借貸連續購買不需要的服飾，月底還款壓力增加。','哪項最符合範文的個人代價？',[
    '借貸買不需要的東西，可能浪費錢並養成壞習慣',
    '只要衣服漂亮，借貸便完全不需要在月底償還',
    '借貸購物必然比存錢更能減少財務負擔',
    '只要商店允許分期，消費便不可能造成浪費',
  ],['原文特別指出借貸購物者易受金錢浪費影響。','借款仍需還。','原文評為財務風險。','付款方式不消除不必要性。'],[13,14],'範文從個人層面說非必要消費浪費金錢，借貸者更需留意。'),
  transfer('某城市每年提早淘汰可用手機，垃圾站累積電子廢物。','哪項最能運用範文的環境論證？',[
    '少換可用手機，並把棄置與新機製造成本一併衡量',
    '只看新手機外觀，不理舊機丟棄後流向哪裏',
    '認為電子垃圾一出現，就會自動恢復成原料',
    '只計算購物樂趣，完全不問生產時耗用甚麼',
  ],['原文同時談棄置廢物及再生產的能源原料。','舊品去向是代價。','廢物不會自動消失。','生產也有環境成本。'],[15,16],'範文指出棄置商品形成電子垃圾，不斷製造替代品亦耗資源。'),
  transfer('一個家庭打算換掉仍能使用的家電，原因只是廣告稱新款比較時尚。','哪項判斷最貼近範文的兩問？',[
    '廣告可製造想要感，但提早更換仍可能浪費資源',
    '只要廣告說時尚，仍能使用的舊家電便立刻壞掉',
    '家電好不好用完全不重要，新的便必然更環保',
    '只要有購買理由，就代表此舉一定是好事',
  ],['成因解釋不等於肯定行為；浪費也是評價依據。','廣告不改變舊機功能。','新製造仍耗資源。','原因與好壞要分開。'],[2,4,5,16],'範文先解釋廣告誘因，再以資源損失判斷行為有害。'),
  transfer('老師要設計一項消費日記，讓學生反思是否為朋友點讚而買東西。','哪項提問最能驗證範文的社會認同機制？',[
    '你買這件物品是為了用途，還是為了得到別人認同',
    '這件商品的包裝最外層用了哪一種印刷油墨',
    '朋友在哪個網站按讚最多，但不問你買了甚麼',
    '你知道商品價格，卻完全不需考慮購買目的',
  ],['原文的關鍵是消費是否成為求認同的手段。','包裝不是認同動機。','按讚數要連到購買動機。','價格不解答需要與認同。'],[4,6,7],'範文說商品被連到身份，社媒展示使人為獲認同而買非必需品。'),
  transfer('議會討論鼓勵「每年換新機」的宣傳活動，卻聲稱完全沒有財務或環境代價。','哪項回應最完整？',[
    '同時估算借貸浪費、舊機廢物及新機製造耗用',
    '只談新機賣點，迴避家庭支出與電子垃圾',
    '只看廢物數量，不問生產需要能源和原料',
    '只看商店銷量，便斷言所有消費者都受益',
  ],['原文分別指出個人金錢、棄置與再生產三種代價。','漏兩項核心代價。','製造成本也重要。','銷量不證明無害。'],[14,15,16,18],'範文以財務浪費及環境壓力否定過度消費，亦列製造耗資源。'),
];
export default {key:'direct-question:35',meta:{topic:'非必要購物與過早更換產品',summary:'廣告、社交比較與快速換代推動追新；個人財務和環境資源均承受代價。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
