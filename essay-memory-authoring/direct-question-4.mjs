// Human-authored support for Direct Question 4; English remains in its canonical source bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-4-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:4'];
const original=source.sentences.map(row=>row.english);

const simple=[
  'In sales, people may think the best workers want money most, because they get more pay when they sell more.',
  'I do not agree. Money does not keep people working hard for long, and companies should hire salespeople for the kind of person they are and how well they work with customers, not just for their desire to earn money.',
  'Money may make someone call one more customer or make one more sale, but it does not usually keep them working hard for a long time on its own.',
  'If a salesperson works only for money, they try hard only when they can see a reward right away.',
  'When goals get harder, customers become careful, or people keep saying no, that reason to work hard can quickly disappear.',
  'More seriously, a worker who cares about money first may see customers only as a way to make a sale, not as people. This can harm trust and lasting business ties.',
  'People are more likely to keep working hard if they are proud of their work, can keep going after setbacks, and believe in what they sell.',
  'These qualities help people stay steady when easy rewards are no longer there.',
  'So when companies hire salespeople, they should look for several useful qualities.',
  'The first is good communication: a salesperson must listen closely, explain why a product helps, and change how they speak for different customers.',
  'Sales is not just speaking; it is understanding what people think and need.',
  'The second quality is the ability to keep going, because salespeople often hear “no”.',
  'Someone who stays calm after a failed sale is much more useful than someone who has energy only when sales go well.',
  'Last, honesty must be a basic requirement.',
  'Sales staff show customers what the company is like, and one false promise can harm its name for years.',
  'To sum up, money can help encourage people, but it should not be seen as the main reason they work hard.',
  'For sales jobs, companies should hire people who can persuade others, keep going after setbacks, act honestly, and truly gain customers’ trust.',
];
const vocabulary=[
  [['it is tempting to assume','people may think','很容易假設'],['chase money most aggressively','want money most','最積極追求金錢'],['commission rewards output directly','get more pay when they sell more','佣金直接獎勵銷售成果']],
  [['I disagree with this view','I do not agree','我不同意此觀點'],['sustained hard work','working hard for long','持續努力'],['recruitment should focus on character','hire salespeople for the kind of person they are','招聘應重視品格'],['customer-facing ability','how well they work with customers','面對客戶的能力'],['financial hunger alone','desire to earn money','只看賺錢慾望']],
  [['make an extra call','call one more customer','多打一通電話'],['close one more deal','make one more sale','多完成一筆交易'],['lasting dedication','working hard for a long time','持久投入'],['by itself','on its own','單靠它本身']],
  [['motivated only by income','works only for money','只受收入驅動'],['their effort depends on whether','they try hard only when','努力取決於是否'],['immediately visible','see a reward right away','能立即看見']],
  [['targets become harder','goals get harder','目標變得更難'],['customers become cautious','customers become careful','顧客變得謹慎'],['rejection piles up','people keep saying no','拒絕不斷累積'],['motivation can burn out quickly','reason to work hard can quickly disappear','動力很快耗盡']],
  [['More importantly','More seriously','更重要的是'],['money-first employee','worker who cares about money first','金錢至上的員工'],['treat clients as transactions rather than people','see customers only as a way to make a sale, not as people','把客戶當成交易而非人'],['damage trust','harm trust','損害信任'],['long-term business relationships','lasting business ties','長期商業關係']],
  [['Genuine hard work','keep working hard','真正持續努力'],['professional pride','proud of their work','專業自豪感'],['resilience','keep going after setbacks','抗壓與復原能力'],['a belief in the product being sold','believe in what they sell','相信所售產品']],
  [['These qualities','These qualities','這些特質'],['keep a person steady','help people stay steady','使人保持穩定'],['easy rewards disappear','easy rewards are no longer there','容易得到的回報消失']],
  [['recruiting sales staff','hire salespeople','招聘銷售員工'],['therefore','So','因此'],['consider several practical qualities','look for several useful qualities','考慮幾項實際特質']],
  [['communication skill','good communication','溝通能力'],['listen carefully','listen closely','細心聆聽'],['explain benefits clearly','explain why a product helps','清楚解釋產品好處'],['adjust their tone','change how they speak','調整語氣']],
  [['not merely talking','not just speaking','不只是說話'],['reading people','understanding what people think and need','理解別人的想法與需要']],
  [['The second factor','The second quality','第二項因素'],['resilience','ability to keep going','抗壓能力'],['rejection is part of the job','salespeople often hear “no”','被拒絕是工作一部分']],
  [['candidate','Someone','求職者'],['stay calm after losing a deal','stays calm after a failed sale','未成交後保持冷靜'],['far more valuable','much more useful','價值高得多'],['energetic only when everything goes well','has energy only when sales go well','只在順利時有幹勁']],
  [['Finally','Last','最後'],['integrity','honesty','誠信'],['treated as essential','a basic requirement','視為不可或缺']],
  [['represent the company’s face','show customers what the company is like','代表公司形象'],['dishonest promise','false promise','不誠實的承諾'],['poison a brand’s reputation for years','harm its name for years','長期損害品牌聲譽']],
  [['In conclusion','To sum up','總結來說'],['useful incentive','help encourage people','有用的激勵'],['main engine of hard work','main reason they work hard','努力工作的主要推動力']],
  [['sales positions','sales jobs','銷售職位'],['firms','companies','公司'],['persuasive','can persuade others','具說服力'],['resilient','keep going after setbacks','有抗壓能力'],['ethical','act honestly','有道德操守'],['building trust with customers','gain customers’ trust','與客戶建立信任']],
];
const chunkOverrides=[
  ['In sales, it is tempting to assume','that the best employees are those','who chase money most aggressively,','because commission rewards output directly.'],
  ['I disagree with this view:','money is not the true driving force behind sustained hard work,','and recruitment should focus on character and customer-facing ability','rather than financial hunger alone.'],
  ['Money may push people to make an extra call','or close one more deal,','but it rarely produces lasting dedication by itself.'],
  ['If a salesperson is motivated only by income,','their effort depends on whether','a reward is immediately visible.'],
  ['When targets become harder, customers become cautious,','or rejection piles up,','that motivation can burn out quickly.'],
  ['More importantly, a money-first employee','may treat clients as transactions rather than people,','which can damage trust','and weaken long-term business relationships.'],
  ['Genuine hard work is more likely to come from','professional pride, resilience,','and a belief in the product being sold.'],
  ['These qualities keep a person steady','when the easy rewards disappear.'],
  ['When recruiting sales staff,','companies should therefore consider several practical qualities.'],
  ['The first is communication skill:','a good salesperson must listen carefully,','explain benefits clearly,','and adjust their tone to different customers.'],
  ['Sales is not merely talking;','it is reading people.'],
  ['The second factor is resilience,','because rejection is part of the job.'],
  ['A candidate who can stay calm after losing a deal','is far more valuable than one','who is energetic only when everything goes well.'],
  ['Finally, integrity should be treated','as essential.'],
  ['Sales staff represent the company’s face,','and one dishonest promise can poison a brand’s reputation for years.'],
  ['In conclusion, money may be a useful incentive,','but it should not be seen','as the main engine of hard work.'],
  ['For sales positions, firms should recruit people','who are persuasive, resilient, ethical,','and genuinely capable of building trust with customers.'],
];
const simpleChunkOverrides=[
  ['In sales, people may think the best workers want money most,','because they get more pay when they sell more.'],
  ['I do not agree.','Money does not keep people working hard for long,','and companies should hire salespeople for the kind of person they are','and how well they work with customers,','not just for their desire to earn money.'],
  ['Money may make someone call one more customer','or make one more sale,','but it does not usually keep them working hard','for a long time on its own.'],
  ['If a salesperson works only for money,','they try hard only when','they can see a reward right away.'],
  ['When goals get harder, customers become careful,','or people keep saying no,','that reason to work hard can quickly disappear.'],
  ['More seriously, a worker who cares about money first','may see customers only as a way to make a sale,','not as people.','This can harm trust and lasting business ties.'],
  ['People are more likely to keep working hard','if they are proud of their work,','can keep going after setbacks,','and believe in what they sell.'],
  ['These qualities help people stay steady','when easy rewards are no longer there.'],
  ['So when companies hire salespeople,','they should look for several useful qualities.'],
  ['The first is good communication:','a salesperson must listen closely,','explain why a product helps,','and change how they speak for different customers.'],
  ['Sales is not just speaking;','it is understanding what people think and need.'],
  ['The second quality is the ability to keep going,','because salespeople often hear “no”.'],
  ['Someone who stays calm after a failed sale','is much more useful than someone','who has energy only when sales go well.'],
  ['Last, honesty must be','a basic requirement.'],
  ['Sales staff show customers what the company is like,','and one false promise can harm its name for years.'],
  ['To sum up, money can help encourage people,','but it should not be seen as','the main reason they work hard.'],
  ['For sales jobs, companies should hire people','who can persuade others,','keep going after setbacks, act honestly,','and truly gain customers’ trust.'],
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
  card('In sport, it is tempting to assume that the tallest players are the best, because height can help in some games.','用 it is tempting to assume ... because 說明一種看似有理的初步推測',[3,8,15],
    fixed(0,'In [領域], it is tempting to assume that [初步看法], because [令它看似合理的原因]','先限定議題，再交代一個容易相信的看法，以及它乍看合理的原因。','要引出接下來會檢驗或修正的常見推測時。',['In ', ', it is tempting to assume that ', ', because '],['討論領域','初步看法','令看法看似合理的原因'])),
  card('I disagree with this view: grades are not the only measure of learning, and schools should value curiosity rather than test scores alone.','用 disagree ... and ... rather than 先反對單一判準再提出較全面的判準',[3,12,15],
    fixed(1,'I disagree with this view: [反對的判斷], and [應重視的準則] rather than [被排除的單一準則]','先表明不同意，接着指出原判斷的不足，再說應採用甚麼較全面的準則。','要回應以單一因素判斷人或事的主張，並提出更合理的評估方向時。',['I disagree with this view: ', ', and ', ' rather than '],['反對的判斷','應重視的準則','被排除的單一準則'])),
  card('Praise may help a pupil finish one task, but it rarely creates lasting interest by itself.','用 may ... but it rarely ... by itself 對比短期作用與單靠它的長期限制',[4,6,13],
    fixed(2,'[因素] may [短期作用], but it rarely [長期成果] by itself.','承認一個因素可以帶來眼前作用，但指出單靠它通常不足以維持長期成果。','要避免把短期有效的刺激誤當成可單獨維持長期投入的原因時。',[' may ', ', but it rarely ', ' by itself.'],['可能有用的因素','短期作用','難以單獨維持的長期成果'])),
  card('If a child reads only for prizes, their effort depends on whether a reward is offered at once.','用 If 設定唯一動機，再用 depends on whether 指出努力受甚麼限制',[0,7,12],
    fixed(3,'If [只受一項誘因推動], [投入程度] depends on whether [即時條件].','先設定某人只因一項誘因而行動，再指出其努力是否持續取決於甚麼條件。','要說明只靠外在獎勵會使投入變得不穩定時。',['If ', ', ', ' depends on whether '],['只受一項誘因推動','投入程度','決定投入的條件'])),
  card('When deadlines grow harder and support falls, team spirit can fade quickly.','用 When 堆疊困難，再指出某種動力會減弱',[1,6,16],
    (()=>{const t=original[4],a=t.indexOf(', that motivation can ');return {formula:'When [困難增加], [原有動力] can [減弱結果]',meaning:'先列出幾種壓力，再說明它們如何使原本的動力迅速減退。',usage:'要說明某種動力為何在困難增加時不能穩定持續時。',parts:[part('When ','link','情況連接詞'),part(t.slice(5,a),'slot','困難增加的情況'),part(', ','link','主句分界'),part('that motivation','slot','原有動力'),part(' can ','link','可能性'),part(t.slice(a+', that motivation can '.length),'slot','減弱結果')]};})()),
  card('More importantly, a rushed teacher may treat pupils as scores rather than learners, which can damage trust.','用 treat ... as ... rather than ... which can 警告一種看待人的方式會造成甚麼後果',[3,9,13],
    fixed(5,'More importantly, [行動方] may treat [對象] as [工具或數字] rather than [完整的人], which can [不良後果]','先指出某人可能把人當成工具或數字，再說明這種看法的代價。','要批評一種為追求成果而忽略人本身的做法時。',['More importantly, ', ' may treat ', ' as ', ' rather than ', ', which can '],['行動方','被看待的對象','被錯誤當成的東西','應被視為的人','造成的不良後果'])),
  card('Genuine cooperation is more likely to come from shared goals and trust.','用 is more likely to come from 指出真正持久成果的較可信來源',[0,11,12],
    fixed(6,'[真正的成果] is more likely to come from [較持久的來源]','把成果連到一組比表面刺激更能持續的內在條件或能力。','已指出某種表面誘因的限制，接着要提出較穩定的成果來源時。',[' is more likely to come from '],['真正的成果','較持久的來源'])),
  card('These qualities keep volunteers steady when donations fall.','用 These qualities ... when 說明特質在順境消失時的持續作用',[0,6,13],
    fixed(7,'These qualities keep [人] steady when [容易的條件消失].','指出前文提到的特質，如何幫助人在回報或環境不再有利時仍保持穩定。','說完幾項重要特質，想解釋它們在困難時仍有甚麼作用時。',['These qualities keep ', ' steady when '],['受特質支持的人','有利條件消失的情況'])),
  card('When choosing teachers, schools should therefore consider several practical qualities.','用 When ... should therefore consider 把前文分析轉成招聘或選擇準則',[2,9,16],
    fixed(8,'When [挑選某角色], [機構] should therefore consider [相關特質].','先說正在挑選甚麼人，再用 therefore 表示後面的評估準則承接前文分析。','已分析一種單一判準的不足，接着要提出實際選人標準時。',['When ', ', ', ' should therefore consider '],['挑選的角色','負責選擇的機構','應考慮的特質'])),
  card('The first is patience: a good nurse must listen carefully, explain treatment clearly, and check what the patient understands.','用 The first is ... : ... must 列出第一項能力及其具體表現',[8,11,16],
    fixed(9,'The first is [首項能力]: [合適的人] must [具體表現].','先點名第一項選人準則，冒號後把抽象能力拆成可觀察的行動。','要把「需要某種能力」說清楚為求職者實際須做的事時。',['The first is ', ': ', ' must '],['首項能力','具備能力的人','可觀察的具體表現'])),
  card('Teaching is not merely talking; it is helping others understand.','用 not merely ... ; it is 對同一工作由表面活動轉向更深層的要求',[1,5,14],
    fixed(10,'[工作] is not merely [表面活動]; it is [更深層的能力或任務].','承認表面上看得到的一部分，但指出工作的真正要求更深。','要糾正把某項工作簡化成單一表面動作的理解時。',[' is not merely ', '; it is '],['被解釋的工作','表面活動','更深層的能力或任務'])),
  card('The second factor is patience, because progress often takes time.','用 The second factor is ... because 加入第二項準則並說明原因',[3,8,13],
    fixed(11,'The second factor is [第二項準則], because [工作現實].','明確加入第二個判準，並交代工作中哪個事實使它重要。','已解釋第一項選人準則，接着要提出並論證第二項時。',['The second factor is ', ', because '],['第二項準則','令它重要的工作現實'])),
  card('A volunteer who can stay calm during delays is far more valuable than one who is helpful only when events run smoothly.','用 who can ... far more valuable than one who 比較逆境中穩定與只在順境中積極的人',[2,6,10],
    fixed(12,'A [人] who can [逆境下的表現] is far more valuable than one who is [只在順境中的表現].','比較兩類候選人，強調能在困難中維持表現的那一方更有價值。','要把抽象的抗壓或穩定特質放進具體選人比較時。',[' who can ', ' is far more valuable than one who is '],['被比較的人','逆境下的表現','只在順境中的表現'])),
  card('Finally, safe storage should be treated as essential.','用 Finally ... should be treated as essential 把最後一項列為必要條件',[7,11,14],
    fixed(13,'Finally, [最後一項準則] should be treated as essential.','列出最後一項要求，並明確表明它不能只是加分項。','選人或設計標準已列數項，最後要強調一項不可缺少的條件時。',['Finally, ', ' should be treated as essential.'],['最後一項必要準則'])),
  card('Journalists represent their publication, and one false report can damage its reputation for years.','用 represent ... and one ... can 連接代表身分與單一失當行為的長期後果',[1,5,16],
    fixed(14,'[員工] represent [機構形象], and one [失當行為] can [長期損害].','先指出前線人員代表機構，再說一次失當就可能造成長期信任損失。','要解釋為何招聘時必須重視誠信、責任或可靠性時。',[' represent ', ', and one ', ' can '],['代表機構的人','被代表的機構形象','一次失當行為','長期損害'])),
  card('In conclusion, online courses may be a useful option, but they should not be seen as the only way to learn.','用 may be ... but should not be seen as 承認一項作用而拒絕把它當唯一主因',[3,5,13],
    fixed(15,'In conclusion, [因素] may be [有用的作用], but it should not be seen as [被誇大的定位].','結尾承認某因素有用，但明確限制它在整體解釋中的地位。','要在總結中保留一個因素的有限價值，同時拒絕把它說成全部答案時。',['In conclusion, ', ' may be ', ', but it should not be seen as '],['被評估的因素','有用的作用','被誇大的定位'])),
  card('For care roles, clinics should recruit people who are patient, reliable, ethical, and able to explain choices clearly.','用 For ... should recruit people who are 把職位需要轉成多項選人準則',[8,9,14],
    fixed(16,'For [職位], [機構] should recruit people who are [多項相配特質].','先限定職位，再列出能與該工作相配的個性、能力與操守。','文章結尾要直接回應某類職位應選甚麼人，並概括已論證的準則時。',['For ', ', ', ' should recruit people who are '],['職位','招聘機構','多項相配特質'])),
];
const wrongReasons=[
  ['If 設定唯一動機與即時回報，沒有引出一個看似合理但仍待檢驗的推測。','When ... therefore consider 提出選人準則，沒有說常見推測為何看似合理。','結論承認金錢有限作用，沒有先解釋一種初步假設的吸引力。'],
  ['If 交代動機與回報條件，沒有明確反對單一判準並提出替代準則。','far more valuable than 比較兩類人，沒有 I disagree 與 rather than 的論點回應。','結論限制一項因素的地位，沒有提出應按甚麼準則作選擇。'],
  ['When 說壓力增加會削弱動力，沒有先承認短期作用再否定單靠它的長期效果。','is more likely to come from 提出穩定來源，沒有 may ... but it rarely 的短長期對照。','Finally ... essential 把標準列為必要條件，沒有指出單一刺激的限制。'],
  ['it is tempting to assume ... because 引出推測，沒有 If 所設的唯一動機和回報條件。','These qualities 說特質如何持續支持人，沒有 depends on whether 的條件依賴。','far more valuable than 比較兩類人，沒有說某人的努力取決於甚麼。'],
  ['I disagree 反對一種判準，沒有描述壓力累積使動力減弱。','is more likely to come from 指出長期成果來源，沒有 When 困難增加後的動力消退。','should recruit people who are 歸納招聘準則，沒有困境與動力耗盡的因果。'],
  ['If ... depends on whether 指出投入依賴即時獎勵，沒有把人當工具的後果。','The first is ... must 列具體能力，沒有 treat ... as ... rather than 的看待方式。','Finally ... essential 強調必要條件，沒有 which can 帶出的信任損失。'],
  ['it is tempting to assume ... because 引出表面推測，沒有尋找更穩定的成果來源。','The second factor ... because 解釋一項選人準則，沒有真正成果的較可信來源。','far more valuable than 比較兩類候選人，沒有用 come from 說明成果由何而來。'],
  ['初步推測的理由並未說特質在容易回報消失後如何支持一個人。','is more likely to come from 說明成果來源，沒有 These qualities 承接前述特質。','Finally ... essential 列必要準則，沒有 when 有利條件消失的考驗。'],
  ['may ... but it rarely 比較短長期效果，沒有把分析轉成選人標準。','The first is ... must 詳解第一項能力，沒有先總說應考慮幾項特質。','For ... should recruit 在結尾歸納人選特質，沒有 When ... therefore 承接前文開段。'],
  ['When ... therefore consider 提出總體準則，沒有把首項能力拆成可觀察動作。','The second factor ... because 解釋第二項要求，沒有 The first is 的首項展開。','For ... should recruit 是結尾的準則總結，沒有冒號後的具體行動。'],
  ['I disagree ... rather than 排除某項判準，沒有對同一工作作較深層的重新理解。','treat ... as ... rather than 批評把人當工具，沒有「不只是表面活動，更是深層任務」的擴展。','represent ... and one ... can 說一次失當的後果，沒有修正對工作的簡化理解。'],
  ['If ... depends on whether 解釋努力的條件，沒有提出第二項選人因素。','When ... therefore consider 總說應考慮特質，沒有點明第二項及其原因。','Finally ... essential 指出最後必要條件，沒有因工作現實論證第二項因素。'],
  ['may ... but it rarely 談單一刺激的短期限制，沒有比較逆境與順境中的候選人。','is more likely to come from 說成果來源，沒有以兩類人的表現作相對評價。','not merely ... it is 重新理解工作，沒有 far more valuable than 的選人比較。'],
  ['These qualities 說特質在困難時的作用，沒有標出最後一項必要條件。','The second factor ... because 介紹第二項因素，沒有 Finally ... essential 的必要性判斷。','represent ... one ... can 說失當的後果，沒有直接把某準則列為必備。'],
  ['I disagree 提出立場與評估方向，沒有連接員工代表性和一次失當的後果。','treat clients as transactions 批評不當看待客戶，沒有代表機構與個別失當兩層。','For ... should recruit 概括選人特質，沒有說一個行為可如何傷害名聲。'],
  ['If ... depends on whether 設定動機條件，沒有結論中對有用因素的有限承認。','treat ... as ... rather than 批評把人當工具，沒有承認因素有用再限制定位。','Finally ... essential 提出必需條件，沒有 may be ... but 的讓步評估。'],
  ['When ... should therefore consider 由分析引出多項準則，沒有結尾直接說招聘甚麼樣的人。','The first is ... must 詳解首項能力，沒有概括所有需要的特質。','represent ... and one ... can 說失當損害，沒有列出整組選人要求。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});

const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目包含哪兩個需要分別回答的問題？',[
    '金錢是否推動持續努力，以及招聘銷售人員應考慮甚麼特質',
    '佣金應定在哪個金額，以及哪個國家的銷售市場最大',
    '員工應否完全取消薪酬，以及所有顧客是否喜歡同一產品',
    '企業如何製作廣告，以及銷售員應否轉行到其他行業',
  ],'第一問評估金錢是否是真正動力；第二問要求具體招聘準則，兩問都須回答。'),
  {type:'multi',prompt:'選出範文的兩條主線',detail:'選兩項，再按「確認」。',options:[
    '佣金或有短期作用，卻不足以單獨維持長期投入與客戶信任',
    '招聘要重視溝通、抗壓與誠信，並看能否建立客戶信任',
    '只要員工最想賺錢，公司便毋須考慮品格與客戶需要',
    '招聘時只比較過往收入，不必觀察員工處理拒絕的能力',
  ],correct:[0,1],why:'第一主體段說明金錢動力的限制；第二主體段提出可觀察的招聘標準。'},
];
const route=[sequence('按原文次序排好四段的任務',[
  ['引言與立場','介紹「最想賺錢的人最適合銷售」的推測，明確反對只看金錢。'],
  ['評估動力','承認佣金能推動短期行動，指出它不穩定，甚至可能傷害客戶信任。'],
  ['招聘準則','依次分析溝通、抗壓和誠信，說明每項能力在銷售工作的作用。'],
  ['總結回題','承認金錢可作激勵，但招聘應看能否說服、承受拒絕、守信並建立關係。'],
],'先反對單一金錢標準 → 說明短期誘因的限制 → 提出三項選人準則 → 回應兩問。')];
const evidence=[
  quiz('作者如何評價金錢對工作表現的作用？',[
    '佣金可推動額外行動，但單靠金錢通常難以維持長期投入',
    '只要佣金夠高，員工在任何情況下都會持續努力',
    '金錢完全不會影響工作者多打一通電話或多完成交易',
    '所有員工只要看不到獎金，就必然立即離開公司',
  ],'原文承認短期刺激，但不同意把它當成持久努力的唯一來源。'),
  quiz('只為收入而工作的銷售員，為何在困難增加時可能失去動力？',[
    '努力依賴即時可見的獎勵；目標難、客戶謹慎和拒絕會削弱它',
    '工作一遇到拒絕，產品本身便必然完全失去價值',
    '客戶只要變得謹慎，公司就無法再提供任何合法薪酬',
    '他們原本重視客戶信任，所以完全不在乎交易是否完成',
  ],'當回報不再容易看到時，只靠它維持的努力就容易耗盡。'),
  quiz('把客戶當成交易而非人，可能帶來甚麼後果？',[
    '員工忽視客戶需要，傷害信任與長期商業關係',
    '客戶必然在每次接觸後立即購買更多昂貴產品',
    '員工毋須了解任何產品，也能自然建立可靠關係',
    '公司可只靠一次促銷承諾永久維持品牌聲譽',
  ],'原文把金錢至上的看法連到信任及長期關係受損。'),
  quiz('原文如何把「溝通能力」變成可觀察的招聘準則？',[
    '聆聽客戶、清楚解釋產品好處，並按不同對象調整語氣',
    '只量度求職者說話速度，完全不讓他們聆聽客戶',
    '只看他們是否愛談收入，不考慮能否解釋產品',
    '要求每位客戶接受完全相同的說法，避免調整表達',
  ],'作者不是只寫「需要溝通」，而是列出聽、解釋和調整語氣三個行動。'),
  quiz('為甚麼抗壓能力在招聘銷售員時重要？',[
    '被拒絕是工作一部分，仍能冷靜的人比只在順境積極的人可靠',
    '成功的銷售員永遠不會被拒絕，所以抗壓能力用不上',
    '只要有人未能成交，就應假設他們永遠不適合工作',
    '抗壓能力代表不必準備產品知識，也不必尊重客戶',
  ],'原文用未能成交後仍保持冷靜的候選人，對照只在順利時有幹勁的人。'),
  quiz('作者為何把誠信列為不可缺少的條件？',[
    '前線員工代表公司，一次不誠實承諾可長期損害品牌聲譽',
    '銷售員不代表公司，所以承諾是否真實不會影響信任',
    '只要短期成交增加，任何失實承諾都會自動被客戶原諒',
    '誠信只與後勤員工有關，面對客戶的職位不需要考慮',
  ],'員工的說法會影響公司的形象；一次失信的後果可維持多年。'),
];
const logic=[
  sequence('第一主體段：由佣金的短期刺激推到長期關係的風險',[
    ['承認局部作用','金錢可能令人多打一通電話或多完成一單。'],
    ['指出條件依賴','如果只為收入努力，投入就取決於能否立即看見回報。'],
    ['困難增加','目標更難、顧客謹慎與拒絕累積，使這種動力容易耗盡。'],
    ['關係代價','只看金錢的人可能把客戶當交易，傷害信任與長期關係。'],
    ['提出較穩定來源','專業自豪感、抗壓及相信產品，讓人在容易回報消失後仍能投入。'],
  ],'先承認短期效果，再說明它為何不穩，最後提出能維持長期努力的特質。'),
  sequence('第二主體段：把抽象「好員工」拆成可招聘的三項準則',[
    ['溝通','細心聆聽、解釋好處，並按客戶調整語氣。'],
    ['理解客戶','銷售不只是說話，更要看懂對方的想法與需要。'],
    ['抗壓','被拒絕後仍保持冷靜，比只在順境積極更有價值。'],
    ['誠信','前線員工代表公司，一個失實承諾可長期損害品牌。'],
    ['總結選人方向','招聘具說服力、抗壓、操守並能建立信任的人。'],
  ],'三項標準都由工作實況支持：要聽懂人、面對拒絕並守住公司信任。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink,
});
const transferTasks=[
  transfer('補習中心只按學生考試分數給導師獎金。有些導師開始只教短期應試技巧。','哪個分析最能轉用範文對金錢誘因的評估？',[
    '獎金或能增加短期努力，但仍須看導師是否重視學生真正學懂',
    '只要分數即時上升，就能證明導師長期教學投入必然穩定',
    '取消所有教學觀察，單看獎金收入便足以評估導師能力',
    '要求導師只練考題，因為學生理解與師生信任都不重要',
  ],[
    '原文承認獎勵的短期效果，同時要求較持久的投入與對服務對象的責任。',
    '短期分數不能保證導師在困難時仍持續投入。',
    '收入是單一外部指標，不能取代教學能力與品格評估。',
    '忽略理解與信任，重演只追短期成果的問題。',
  ],[2,3,6],'範文承認佣金可能促使額外行動，但反對把它當持久努力的唯一來源；教育獎金也要放在較完整的教學標準中評估。'),
  transfer('慈善機構按籌得捐款額獎勵義工。部分義工開始把捐款者只當成數字。','哪項最能應用範文對長期關係的警告？',[
    '提醒義工聆聽捐款者需要，避免只追金額而損害日後信任',
    '要求義工每天只提高捐款數字，不用回答捐款者的疑問',
    '把一次捐款視為關係終點，完全不用考慮對方以後的感受',
    '假設籌款額愈高，任何失實承諾都不可能影響機構聲譽',
  ],[
    '把人當成完整對象而非交易，才能保護信任和長期關係。',
    '只盯金額會延續題目指出的工具化問題。',
    '原文重視長期關係，不能把一次成果當成全部。',
    '失實承諾仍可損害聲譽，與短期金額無法互相抵銷。',
  ],[5,14],'範文批評把客戶當交易，因為這會傷害信任與長期關係；慈善籌款同樣依賴持續信任。'),
  transfer('一支青少年運動隊想選隊長。有人主張只選最想贏獎金的球員。','哪個選人方向最符合範文對持久動力的看法？',[
    '同看責任感、逆境中的穩定表現與是否真正相信團隊目標',
    '只按球員談及獎金的次數排名，不觀察他們面對失利的表現',
    '假設高額獎金可保證隊長在受挫後永遠維持良好判斷',
    '拒絕考慮團隊信任，只看球員能否在順境時表現興奮',
  ],[
    '責任、韌性與共同目標較能支持沒有容易獎勵時的投入。',
    '談錢次數不能證明逆境下的領導能力。',
    '原文指出外在回報在困難增加時可能不足。',
    '只在順境積極的人，未必能帶隊渡過困難。',
  ],[2,6,7,12],'範文把長期努力連到專業自豪、抗壓和相信工作，而不是只看短期回報；選隊長也要看逆境表現。'),
  transfer('社區圖書館招聘前台義工。一名求職者說話流利，卻從不聽訪客問甚麼。','哪項評估最能用上範文對溝通的細分？',[
    '安排接待情境，觀察是否聆聽問題、清楚解釋並調整說法',
    '只計算每分鐘說了多少字，不必觀察對方是否得到幫助',
    '因為口才流利便直接錄用，不再測試與不同訪客的互動',
    '只問求職者想賺多少錢，並以此取代所有服務情境評估',
  ],[
    '原文把溝通落實為聆聽、解釋和調整語氣，情境觀察可檢查這三項。',
    '說話速度不代表能理解訪客或解釋清楚。',
    '流利只是表面，原文說溝通並非只有說話。',
    '收入動機不能顯示接待能力。',
  ],[9,10],'範文指出好的溝通需要聽、解釋和因人調整；「說話流利」不足以證明能服務訪客。'),
  transfer('電腦維修熱線經常收到焦急客戶的抱怨，主管正在挑選新的支援人員。','哪個準則最直接轉用範文對抗壓的比較？',[
    '觀察求職者遇到抱怨後能否冷靜處理，而非只看順利時的熱情',
    '只在沒有任何抱怨的情境面試，再假設每人都能應付壓力',
    '只選說話最大聲的人，不問他們遇到失敗時會如何回應',
    '把每次客戶抱怨都當作員工無能的證明，不檢查處理方式',
  ],[
    '逆境中的冷靜比順境熱情更能顯示能否長期勝任。',
    '只看順境無法測試原文重視的抗壓能力。',
    '音量不能代表冷靜、韌性或客戶處理能力。',
    '被抱怨本身不等於能力不足，處理反應才是關鍵。',
  ],[4,11,12],'範文說被拒絕是銷售工作的一部分，並比較受挫後冷靜的人與只在順利時積極的人；熱線工作也有相近壓力。'),
  transfer('一間維修公司承諾客戶明天必能取回設備，雖然員工知道零件尚未到貨。','哪項最能承接範文對誠信與聲譽的推理？',[
    '要求員工如實說明時間和不確定性，避免一次失信傷害長期聲譽',
    '先作出肯定承諾以得到訂單，日後再讓客戶自行承擔落差',
    '只計算明天新增的訂單量，不考慮承諾失實造成的信任損失',
    '假設任何客戶都不會記得承諾內容，所以不用檢查其真實性',
  ],[
    '前線承諾代表公司；如實交代可保護信任與長期名聲。',
    '明知無法保證仍作肯定承諾，正是原文警告的失信。',
    '短期訂單不等於能抵消長期聲譽損害。',
    '客戶是否記得不能作為作出失實承諾的理由。',
  ],[13,14],'範文把誠信列為必要條件，因為一次不誠實承諾可能多年損害公司名聲；維修承諾也是同一道理。'),
  transfer('一間社區餐廳招聘經理，候選人過往獎金很高，但多次忽略客人的具體需要。','哪項最能回應範文對單一招聘指標的批評？',[
    '除業績外，也評估聆聽、守信和處理客戶關係的實際能力',
    '只按過往獎金高低排序，不必接觸候選人服務過的客人',
    '假設獎金數字能直接證明對客人的尊重與誠信毫無問題',
    '取消所有情境面試，因為單看收入便足以預測長期表現',
  ],[
    '過往收入是局部資訊；面對客戶的能力與品格也須驗證。',
    '單靠獎金忽略題目已提出的服務問題。',
    '高收入不能自動證明聆聽和誠信。',
    '沒有情境評估便難以檢查長期客戶關係能力。',
  ],[1,5,9,16],'範文反對只按對金錢的渴望招聘，主張重視品格和面對客戶的能力；餐廳也不能只看獎金。'),
  transfer('一所學校挑選學生輔導員。有些申請者自信健談，卻在學生哭泣時不知如何聆聽。','哪項判準最能轉用「不只是說話」的句型邏輯？',[
    '把理解對方需要列為核心能力，並以真實對話情境觀察',
    '只計算申請者在面試中講話多久，不必讓他們聆聽學生',
    '只要求說服學生停止哭泣，完全不理會其感受和原因',
    '只按衣著判斷輔導能力，避免評估對話中的實際反應',
  ],[
    '表面上健談不足夠；工作更深層要求是讀懂並回應人。',
    '說得多不能證明會理解對方。',
    '立刻壓止情緒可能跳過了學生真正的需要。',
    '衣著與題目指出的聆聽能力無直接關係。',
  ],[9,10],'範文說銷售不只是說話，更要理解人；學生輔導同樣不能只用健談作為能力證明。'),
  transfer('一項公共交通計劃招聘前線服務員。服務員需要應付延誤、解釋路線，並處理乘客投訴。','哪套條件最完整承接範文的招聘框架？',[
    '評估解釋能力、受挫後的冷靜及是否如實回應乘客',
    '只比較求職者想要多少薪酬，不設任何乘客互動情境',
    '只選最能推銷車票的人，忽略延誤處理及投訴回應',
    '只考慮求職者的說話速度，不評估守信或受壓表現',
  ],[
    '說明路線、承受延誤壓力和誠實回應，分別對應溝通、抗壓與誠信。',
    '薪酬期望不能取代工作所需能力的評估。',
    '推銷能力只覆蓋局部工作，遺漏延誤與投訴。',
    '速度不能代表理解、韌性或誠信。',
  ],[9,11,13,16],'範文把招聘準則分成溝通、抗壓及誠信；交通前線也須從工作實況逐項驗證。'),
  transfer('公益組織提出高額獎金，想招募能長期服務社區的職員，但工作常有拒絕與緩慢成果。','哪種判斷最完整轉用範文兩段主體的結論？',[
    '獎金可作輔助，仍須選能聆聽、面對受挫並守信的人',
    '只要獎金夠高，便可不評估拒絕、服務能力或長期信任',
    '只看申請者在順利時的熱情，便假設他們會長期堅持',
    '只要求員工達到短期數字，不理會對社區作出的承諾',
  ],[
    '金錢可有用，但長期投入與服務關係還要靠溝通、韌性和誠信。',
    '把獎金當全部答案，違背原文對單一誘因的限制。',
    '順境熱情不能代替逆境中的穩定表現。',
    '只看數字會忽略持久服務及守信。',
  ],[2,6,12,14,15,16],'範文同時保留金錢的有限激勵作用，並把持久努力和招聘標準連到較深的能力與品格。'),
];
export default {key:'direct-question:4',meta:{topic:'金錢動機與銷售招聘',summary:'先評估佣金的短期作用與長期限制，再提出溝通、抗壓及誠信三項選人準則。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
