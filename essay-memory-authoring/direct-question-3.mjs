// Human-authored support for Direct Question 3; canonical English remains in the source bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-3-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:3'];
const original=source.sentences.map(row=>row.english);

// One faithful, complete plain-English rewrite for each physical source sentence.
const simple=[
  'Many workplaces make staff wear the same clothes while they work.',
  'This may look like a simple clothing rule, but it helps a company in several ways and makes work easier for staff.',
  'For a company, the main benefit is that uniforms make its staff look alike, neat and ready for work when customers see them.',
  'When customers see staff wearing the same easy-to-spot clothes, the company looks well run, and customers may feel they can depend on and trust it.',
  'This matters especially in places such as hotels, airlines and restaurants, where a customer’s first view of staff can affect what they think of the whole company.',
  'A uniform also helps people tell who works there.',
  'Because of this, customers can find help faster, managers can watch what happens at work more easily, and strangers are less likely to enter staff-only places without anyone noticing.',
  'In places that handle food, care for patients or use machines, special work clothes can help keep people clean and safe because they are made for that job.',
  'Uniforms help workers too.',
  'First, workers do not need to choose clothes for work each day, and they need to spend less money on clothes that are in fashion or suitable for work.',
  'This is useful, especially for workers on low pay who might otherwise worry that others judge how they look.',
  'Next, uniforms can help staff feel more equal and more like a team.',
  'When everyone wears similar clothes, it is harder to see differences in money, taste or background, and workers may feel they belong to the same team.',
  'Also, good uniforms can feel comfortable and keep workers safe, so they can think about their jobs instead of their clothes.',
  'To sum up, uniforms help companies look better, help people recognise staff, and make it easier to manage the workplace.',
  'They also help staff save time and money, feel less judged by others, and feel part of a professional team.',
];

// Original term, exact phrase in the plain rewrite, concise contextual Traditional Chinese.
const vocabulary=[
  [['organisations','workplaces','機構／工作場所'],['employees','staff','員工'],['standard uniform','same clothes','統一制服'],['whenever they are on duty','while they work','每當值班時']],
  [['Although this may seem like','This may look like','儘管這看起來像'],['serve several important business purposes','helps a company in several ways','發揮幾項商業作用'],['daily working life','work','日常工作'],['employees','staff','員工']],
  [['the clearest advantage','the main benefit','最明顯的好處'],['consistent','look alike','一致的'],['professional public image','neat and ready for work when customers see them','專業的公眾形象']],
  [['recognisable','easy-to-spot','容易辨認的'],['organised','well run','有條理的'],['reliable','depend on','可靠的'],['trustworthy','trust it','值得信任的']],
  [['especially important','matters especially','尤其重要'],['service industries','places','服務行業'],['first impressions','first view','第一印象'],['shape','affect','影響']],
  [['employees','people','員工'],['easy to identify','tell who works there','容易識別']],
  [['As a result','Because of this','因此'],['ask for help more quickly','find help faster','更快尋求協助'],['supervise the workplace more efficiently','watch what happens at work more easily','更有效監督工作場所'],['outsiders','strangers','外來人士'],['restricted areas unnoticed','staff-only places without anyone noticing','未被察覺地進入限制區域']],
  [['jobs involving food, healthcare or machinery','places that handle food, care for patients or use machines','涉及食品、醫療或機械的工作'],['hygiene and safety','clean and safe','衛生與安全'],['clothing designed for that particular environment','made for that job','為特定工作環境設計的衣物']],
  [['clear benefits','help','明顯好處'],['staff','workers','員工'],['as well','too','也']],
  [['remove the daily pressure','do not need to','消除每日壓力'],['deciding what to wear','choose clothes for work','決定穿甚麼'],['reduce the need to spend money','need to spend less money','減少花錢需要'],['fashionable','in fashion','時尚的'],['work-appropriate','suitable for work','適合工作的']],
  [['practical advantage','useful','實際好處'],['lower-paid employees','workers on low pay','低薪員工'],['feel judged by their appearance','worry that others judge how they look','因外表而感到被評價']],
  [['Secondly','Next','其次'],['stronger sense of equality','feel more equal','更強的平等感'],['belonging','more like a team','歸屬感']],
  [['similar clothing','similar clothes','相似服裝'],['differences in wealth, taste or social background','differences in money, taste or background','財富、品味或背景差異'],['less visible','harder to see','較不明顯'],['part of the same team','belong to the same team','屬於同一團隊']],
  [['In addition','Also','此外'],['well-designed uniforms','good uniforms','設計良好的制服'],['protective','keep workers safe','具保護作用的'],['focus on their tasks','think about their jobs','專注工作'],['rather than on their clothing','instead of their clothes','而非衣著']],
  [['In conclusion','To sum up','總結來說'],['strengthening brand image','look better','強化品牌形象'],['improving identification','help people recognise staff','改善員工識別'],['supporting workplace control','make it easier to manage the workplace','協助管理工作場所']],
  [['benefit employees','help staff','對員工有益'],['saving time and money','save time and money','節省時間和金錢'],['reducing social pressure','feel less judged by others','減少社交壓力'],['encouraging a shared sense of professionalism','feel part of a professional team','建立共同的專業感']],
];

const chunkOverrides=[
  ['Many organisations require employees','to wear a standard uniform','whenever they are on duty.'],
  ['Although this may seem like a simple rule about clothing,','it can serve several important business purposes','and can also make daily working life easier for employees.'],
  ['For companies, the clearest advantage is that','uniforms create a consistent and professional public image.'],
  ['When customers see staff dressed in the same recognisable way,','the business appears more organised, reliable and trustworthy.'],
  ['This is especially important in service industries','such as hotels, airlines and restaurants,','where first impressions can shape','the customer’s view of the whole company.'],
  ['A uniform also makes','employees easy to identify.'],
  ['As a result, customers can ask for help more quickly,','managers can supervise the workplace more efficiently,','and outsiders are less likely to enter restricted areas unnoticed.'],
  ['In jobs involving food, healthcare or machinery,','a uniform can also support hygiene and safety','because workers are dressed in clothing','designed for that particular environment.'],
  ['There are clear benefits','for staff as well.'],
  ['First, uniforms remove the daily pressure of deciding what to wear','and reduce the need to spend money','on fashionable or work-appropriate clothes.'],
  ['This is a practical advantage,','particularly for lower-paid employees','who might otherwise feel judged by their appearance.'],
  ['Secondly, uniforms can create a stronger sense','of equality and belonging.'],
  ['When everyone wears similar clothing,','differences in wealth, taste or social background become less visible,','and staff may feel that they are part of the same team.'],
  ['In addition, well-designed uniforms can be comfortable and protective,','allowing employees to focus on their tasks','rather than on their clothing.'],
  ['In conclusion, uniforms benefit companies','by strengthening brand image,','improving identification and supporting workplace control.'],
  ['They can also benefit employees','by saving time and money,','reducing social pressure','and encouraging a shared sense of professionalism.'],
];
const simpleChunkOverrides=[
  ['Many workplaces make staff wear the same clothes','while they work.'],
  ['This may look like a simple clothing rule,','but it helps a company in several ways','and makes work easier for staff.'],
  ['For a company, the main benefit is that','uniforms make its staff look alike, neat and ready for work','when customers see them.'],
  ['When customers see staff wearing the same easy-to-spot clothes,','the company looks well run,','and customers may feel they can depend on and trust it.'],
  ['This matters especially in places','such as hotels, airlines and restaurants,','where a customer’s first view of staff','can affect what they think of the whole company.'],
  ['A uniform also helps people','tell who works there.'],
  ['Because of this, customers can find help faster,','managers can watch what happens at work more easily,','and strangers are less likely to enter staff-only places','without anyone noticing.'],
  ['In places that handle food, care for patients or use machines,','special work clothes can help keep people clean and safe','because they are made for that job.'],
  ['Uniforms help','workers too.'],
  ['First, workers do not need to choose clothes for work each day,','and they need to spend less money on clothes','that are in fashion or suitable for work.'],
  ['This is useful, especially for workers on low pay','who might otherwise worry that others judge how they look.'],
  ['Next, uniforms can help staff feel more equal','and more like a team.'],
  ['When everyone wears similar clothes,','it is harder to see differences in money, taste or background,','and workers may feel they belong to the same team.'],
  ['Also, good uniforms can feel comfortable','and keep workers safe,','so they can think about their jobs','instead of their clothes.'],
  ['To sum up, uniforms help companies look better,','help people recognise staff,','and make it easier to manage the workplace.'],
  ['They also help staff save time and money,','feel less judged by others,','and feel part of a professional team.'],
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
  card('Many schools require pupils to carry an ID card whenever they enter the campus.','用 require ... to ... whenever 說明規定的對象、行動與適用時段',[3,8,12],
    fixed(0,'[規定方] require [對象] to [指定行動] whenever [適用情況]','指出誰須在甚麼時候做甚麼；whenever 表示每次符合條件都適用。','要交代一項持續適用的規定，以及它在哪些場合生效時。',['require ',' to ',' whenever '],['規定方','受規定對象','指定行動','適用情況'])),
  card('Although a new bus route looks costly, it may save residents time and bring more customers to local shops.','用 Although 對照表面印象與另外可見的好處',[4,7,10],
    fixed(1,'Although [表面印象], [較完整的評估]','先承認一個表面印象，再指出它未涵蓋的實際好處。','想承認一種初步看法，再補充容易被忽略的作用時。',['Although ', ', '],['表面印象','較完整的評估'])),
  card('For schools, the clearest advantage is that pupils can get help before small problems grow.','用 For ... the clearest advantage is that 把主要好處指向特定受益方',[8,11,15],
    fixed(2,'For [受益方], the clearest advantage is that [主要好處]','先指出從誰的角度評估，再說明對該方最直接的好處。','題目問某項做法對特定群體有何好處，想先提出最重要的一項時。',['For ', ', the clearest advantage is that '],['受益方','主要好處'])),
  card('When patients find clear signs at the entrance, the clinic seems easier to use.','用 When 交代觀察情況，再說明由此形成的印象',[0,7,10],
    fixed(3,'When [看見的情況], [由此形成的印象]','先說明人們看到或遇到甚麼，再說明這種接觸如何影響評價。','要解釋某種可見安排如何改變他人對一個地方或組織的看法時。',['When ', ', '],['看見的情況','由此形成的印象'])),
  card('This is especially important in busy clinics, where patients need to know whom they can ask.','用 especially important in ... where 限定論點特別重要的場合並說明原因',[2,7,10],
    fixed(4,'This is especially important in [場合], where [當中的關鍵情況]','先指出論點特別適用的場所，再用 where 說明該場所為何需要它。','某項好處並非在所有地方同樣重要，想指出它特別重要的情境時。',['This is especially important in ', ', where '],['特別重要的場合','該場合的關鍵情況'])),
  card('A coloured map also makes emergency exits easy to identify.','用 makes ... easy to identify 說明一項安排如何方便識別',[2,8,13],
    fixed(5,'[標記或安排] also makes [對象] easy to identify.','前面的安排使後面的對象更容易被人辨認。','要說明標記、顏色或外觀安排如何改善辨認效率時。',[' also makes ', ' easy to identify.'],['標記或安排','被識別的對象'])),
  card('As a result, pupils can find books faster, teachers can track loans more easily, and lost books become less common.','用 As a result 引出同一安排帶來的三項結果',[1,9,14],
    fixed(6,'As a result, [結果一], [結果二], and [結果三]','承接前述做法，並列出它對不同人或方面造成的多項結果。','已交代一項做法，想清楚列出幾項互不重複的後果時。',['As a result, ', ', ', ', and '],['第一項結果','第二項結果','第三項結果'])),
  card('In crowded classrooms, a seating plan can support calm lessons because pupils know where to sit.','用 In 指定環境，再用 because 解釋做法在該環境為何有用',[1,4,13],
    (()=>{const t=original[7],a=t.indexOf(', a uniform'),b=t.indexOf(' because ');return {formula:'In [特定環境], [措施的作用] because [環境中的原因]',meaning:'先限定某種工作或活動環境，指出措施在當中的作用，再解釋作用從何而來。',usage:'要說明某項措施在特定環境有用，並把作用連回該環境的實際需要時。',parts:[part('In ','link','環境引入'),part(t.slice(3,a),'slot','特定環境'),part(', ','link','主句分界'),part(t.slice(a+2,b),'slot','措施的作用'),part(' because ','link','原因連接詞'),part(t.slice(b+9),'slot','環境中的原因')]};})()),
  card('There are clear benefits for parents as well.','用 There are clear benefits for ... as well 轉向另一群受益者',[2,5,15],
    fixed(8,'There are clear benefits for [另一群受益者] as well.','承接前一方的好處，再明確轉到另一群同樣受惠的人。','已寫完一個群體的好處，下一段要轉向另一個群體時。',['There are clear benefits for ', ' as well.'],['另一群受益者'])),
  card('First, digital tickets remove the need to queue and reduce the time spent at the counter.','用 remove ... and reduce ... 並列兩項直接減輕的負擔',[5,6,14],
    fixed(9,'First, [措施] remove [一項壓力] and reduce [另一項負擔]','先提出措施，再並列它消除和減少的兩種不同負擔。','要列出一項安排如何同時減少時間、金錢或心理壓力時。',['First, ', ' remove ', ' and reduce '],['措施','被消除的壓力','被減少的負擔'])),
  card('This is a practical advantage, particularly for rural families who might otherwise travel for hours to reach a clinic.','用 particularly for ... who might otherwise 指出特別受惠群體及其原本困難',[4,7,12],
    fixed(10,'This is a practical advantage, particularly for [群體] who might otherwise [原本面對的困難].','先指出好處很實際，再說明哪類人尤其受惠，因為他們原本會遇到甚麼問題。','一項措施對某群人的幫助特別大，想說清楚他們原本的難處時。',['This is a practical advantage, particularly for ', ' who might otherwise '],['特別受惠群體','原本面對的困難'])),
  card('Secondly, shared gardens can create a stronger sense of friendship and belonging.','用 Secondly ... can create a stronger sense of 引出第二項社會或心理好處',[2,8,15],
    fixed(11,'Secondly, [措施] can create a stronger sense of [共同感受].','標明第二項好處，指出安排如何加強人與人之間的共同感受。','第一項好處已說明，接着要加入平等、信任或歸屬等心理好處時。',['Secondly, ', ' can create a stronger sense of '],['措施','被加強的共同感受'])),
  card('When neighbours share a garden, differences in income become less visible, and they may feel part of one community.','用 When 設定共同情況，並並列差異減弱與歸屬感兩項結果',[1,5,10],
    fixed(12,'When [共同情況], [差異變得較不顯眼], and [群體感受].','共同經驗先令原有差異不那麼顯眼，也可能令參與者更有歸屬感。','要解釋同一安排如何同時減弱群體差異並增加共同感時。',['When ', ', ', ', and '],['共同情況','差異變得較不顯眼','群體感受'])),
  card('In addition, clear signs can be large and bright, allowing visitors to find rooms rather than ask for directions.','用 allowing ... rather than 說明良好設計讓人專注於較有用的行動',[5,7,9],
    fixed(13,'In addition, [設計] can be [特點甲] and [特點乙], allowing [對象] to [較有用的行動] rather than [被減少的分心].','先描述設計的兩項特點，再指出它如何讓人做更合適的事，而不用把心力放在次要問題上。','要說明一項設計如何改善使用者的實際行動與注意力分配時。',['In addition, ', ' can be ', ' and ', ', allowing ', ' to ', ' rather than '],['設計','第一項特點','第二項特點','受益對象','較有用的行動','被減少的分心'])),
  card('In conclusion, shared gardens benefit neighbours by providing food, creating meeting places and improving local streets.','用 In conclusion ... benefit ... by 概括對第一群人的多項好處',[2,6,15],
    fixed(14,'In conclusion, [措施] benefit [第一群體] by [方法一], [方法二] and [方法三].','結尾回應第一群體的利益，並用 by 概括帶來好處的三種途徑。','文章末段要對一個受益方歸納前文已論證的幾項利益時。',['In conclusion, ', ' benefit ', ' by ', ', ', ' and '],['措施','第一群受益者','第一項途徑','第二項途徑','第三項途徑'])),
  card('Shared buses can also benefit older residents by saving travel time, lowering costs and making clinics easier to reach.','用 can also benefit ... by 補上另一群體的多項好處',[6,8,14],
    fixed(15,'[同一措施] can also benefit [另一群體] by [方法一], [方法二] and [方法三].','在前一受益方之外，指出同一措施如何透過幾種途徑幫助另一群人。','要在結尾完整回應題目對第二群受益者的提問時。',[' can also benefit ', ' by ', ', ', ' and '],['同一措施','另一群受益者','第一項途徑','第二項途徑','第三項途徑'])),
];

// Each incorrect choice receives a target-specific explanation, not a generic rejection.
const wrongReasons=[
  ['When 連接觀察與印象，沒有規定對象每次在某情況下必須做甚麼。','There are clear benefits 只是轉向另一群受益者，沒有 require ... to 的規定。','When 交代共同情況及結果，沒有指出由誰執行的持續規定。'],
  ['where 說明某地方特別需要措施，沒有先承認表面印象再作完整評估。','In 限定環境、because 交代原因，沒有 Although 的讓步對照。','particularly for 指出特別受惠群體，沒有修正初步印象。'],
  ['There are clear benefits 只引出另一群受益者，沒有選出對該方最重要的好處。','Secondly 表明第二項共同感受，沒有從指定受益方角度選主好處。','結尾用 by 概括另一群體的多項好處，並非開段提出最明顯一項。'],
  ['require ... whenever 訂明規定和適用時段，沒有說觀察如何影響印象。','In ... because 解釋措施的用途，沒有觀察者看見安排後的評價。','particularly for 點出特別受惠者和原本難處，沒有說看見安排後會形成甚麼印象。'],
  ['For ... clearest advantage 指出受益方主要好處，沒有 where 限定特別重要的場所。','In ... because 限定環境並解釋措施，沒有用 where 描述該場所的關鍵情況。','particularly for 指出一群特別受惠的人，並非某場合尤其重要。'],
  ['For ... clearest advantage 評估好處大小，沒有說一項安排讓誰容易被認出。','There are clear benefits 轉向第二群體，沒有 easy to identify 的識別作用。','allowing ... rather than 說明設計轉移注意力，沒有改善辨認效率。'],
  ['Although 承認表面印象再補充好處，沒有承接前文列出三個結果。','First ... remove ... reduce 列出兩種減負作用，沒有 As a result 的三項後果。','結尾用 by 回顧好處途徑，並非即時承接上一句的結果。'],
  ['Although 的重點是表面印象與較完整看法的對照，沒有環境加原因。','where 描述場所特有的情況，沒有 because 明說措施有效的原因。','allowing ... rather than 解釋設計引導行動，沒有 In 的環境與 because 因果。'],
  ['For companies 從指定群體角度挑主要好處，沒有轉向另一群受益者。','easy to identify 說辨認作用，沒有 as well 標示第二受益方。','can also benefit 用 by 列好處途徑，不是獨立句子引出新一段。'],
  ['easy to identify 只有識別作用，沒有並列消除一項壓力和減少另一負擔。','As a result 從前文引出幾項後果，不是 First 開始列出直接減負做法。','結尾用 by 概括多種好處，沒有 remove 與 reduce 的兩種減負動作。'],
  ['where 解釋某場所何以特別重要，沒有指出某群人原本會遇到的難處。','In ... because 交代環境和原因，沒有 particularly for 的特別受惠群體。','When 解釋差異與歸屬感，沒有 who might otherwise 的原本困難。'],
  ['For ... clearest advantage 對某方挑最主要好處，沒有標示第二項共同感受。','There are clear benefits for ... as well 轉向另一受益方，沒有指出更強的感受。','can also benefit ... by 在結尾列多項途徑，沒有 Secondly 引出新的心理好處。'],
  ['Although 連接表面看法與完整評估，沒有共同情況下兩項並列結果。','easy to identify 只說辨認是否容易，沒有差異減弱和歸屬感兩層後果。','particularly for 點出特別受惠者及原本難處，沒有共享情境的兩項結果。'],
  ['easy to identify 指向識別效率，沒有良好設計讓人專注於另一行動。','In ... because 解釋措施在環境中有用，沒有 allowing ... rather than 的行動對照。','First ... remove ... reduce 直接減少負擔，沒有先描述設計特點再說注意力轉移。'],
  ['For ... clearest advantage 只選一項主要利益，沒有在結尾用 by 歸納三種途徑。','As a result 承接前文的多項後果，沒有 In conclusion 收束第一受益方。','can also benefit 是第二受益方的補充句，沒有 In conclusion 首先歸納第一群人。'],
  ['As a result 列前述措施的後果，沒有在結尾補充另一群受益者。','There are clear benefits for ... as well 是轉段句，沒有 by 後的三項途徑。','In conclusion 先概括第一群體利益，沒有 also 補充第二群體。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});

const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求範文分別回答甚麼？',[
    '制服對公司有甚麼好處，以及制服對員工有甚麼好處',
    '公司應否取消所有制服，以及政府應否補貼服裝費用',
    '不同國家哪種制服最好看，以及顧客最喜歡哪個顏色',
    '制服是否可代替員工訓練，以及如何計算公司利潤',
  ],'題目有兩個直接問題；範文各用一段主體回答「公司」與「員工」的好處。'),
  {type:'multi',prompt:'選出範文兩段主體的正確分工',detail:'選兩項，再按「確認」。',options:[
    '公司：一致專業的形象、容易識別員工，以及工作場所管理',
    '員工：減少買衣服的時間與金錢壓力，並增加平等與歸屬感',
    '公司：只靠制服取代服務質素、訓練和安全規定',
    '員工：必須購買昂貴時尚服裝，才能得到同事接納',
  ],correct:[0,1],why:'第一主體段處理公司形象、辨認和安全；第二主體段處理員工成本、社交壓力和歸屬感。'},
];
const route=[sequence('依原文次序排好四段各自的任務',[
  ['背景與總論','交代工作制服看似只是衣著規定，實際上對公司與員工都有用。'],
  ['公司方面','一致形象改善印象；員工容易辨認，方便求助、管理和安全。'],
  ['員工方面','減少挑衣與購衣負擔；弱化外觀差異，增加平等與歸屬感。'],
  ['結論回扣','分別歸納公司在形象及管理上的利益、員工在金錢與感受上的利益。'],
],'引言提出兩方受益 → 第一段回答公司 → 第二段回答員工 → 結尾分別回扣兩個問題。')];
const evidence=[
  quiz('制服如何影響顧客對公司的第一印象？',[
    '員工穿得一致、容易辨認，企業便顯得更有條理和可靠',
    '顧客只會評價制服顏色，而不會留意員工是否容易辨認',
    '員工服裝愈不相同，顧客愈容易相信企業有一致標準',
    '制服本身能保證每位員工的服務都不會出現任何錯誤',
  ],'原文的機制是可見的一致穿著影響顧客對整間公司的判斷，並非保證服務毫無錯誤。'),
  quiz('員工容易被辨認，原文列出哪幾方面的實際結果？',[
    '顧客更快求助、經理更易管理，也較能察覺外人進入限制區',
    '顧客須自行猜測誰是員工、經理毋須管理，外人可自由出入',
    '公司只會省下買衣服的費用，辨認員工不會影響任何工作',
    '員工自動得到加薪，顧客完全不用再到服務台尋求協助',
  ],'辨認帶來三類後果：顧客服務、管理效率和限制區域的安全。'),
  quiz('在食品、醫療或機械工作中，為何要重視制服的設計？',[
    '工作服可因應特定環境而設計，幫助維持衛生與安全',
    '所有工作環境需要完全相同的衣物，不必考慮工作風險',
    '制服只能塑造形象，對衛生及安全不可能有任何作用',
    '只要衣服顏色統一，便可取代所有衛生規定及安全程序',
  ],'原文的條件是衣物為該工作環境設計，並沒有說統一外觀可代替安全程序。'),
  quiz('制服如何幫助薪酬較低的員工？',[
    '減少每天選衣與購置合適服裝的壓力，也減少外表比較',
    '要求他們花更多錢買時尚衣物，才不會被其他人評價',
    '讓他們不用完成工作，只靠相同服裝取得較高薪酬',
    '保留每天選擇工作服的壓力，並增加外表上的競爭',
  ],'原文把時間與金錢負擔連到可能因外表而被評價的感受。'),
  quiz('相似的衣著怎樣可能增加員工的歸屬感？',[
    '財富、品味和背景差異較不顯眼，員工較易感到同屬一隊',
    '服裝會消除所有人的真實差異，令同事不再需要互相尊重',
    '員工只能與收入相同的人合作，團隊便自然變得更平等',
    '制服令個別員工更容易展示奢侈品牌，從而得到接納',
  ],'原文說差異「較不顯眼」並可能增加團隊感；不是把真實差異消除。'),
  quiz('原文對「設計良好的制服」另有甚麼要求？',[
    '衣服也應舒適並有保護作用，讓員工專注工作而非衣著',
    '只需外觀一致，衣服是否舒適或安全並不影響員工',
    '制服應增加穿著負擔，令員工每天更留意自己的衣著',
    '工作服只需要令顧客滿意，完全不用配合工作環境',
  ],'第二主體段補充舒適與保護性，說明制服的好處需要良好設計。'),
];
const logic=[
  sequence('公司方面：由外觀一致推到服務與安全上的好處',[
    ['公共形象','顧客看到容易辨認且一致的員工服裝，企業顯得更有條理和可信。'],
    ['場合說明','酒店、航空及餐飲等服務業尤其重視第一印象。'],
    ['方便辨認','制服讓顧客能找人求助，也令經理更容易管理。'],
    ['限制區域','外人較難在無人察覺下進入不應進入的地方。'],
    ['按工作設計','食品、醫療及機械工作所需的服裝也可幫助維持衛生與安全。'],
  ],'先由形象與顧客印象出發，再連到辨認、管理和具體工作環境的安全。'),
  sequence('員工方面：由日常負擔推到平等、歸屬與專注',[
    ['節省選衣時間','制服減少每天決定穿甚麼的壓力。'],
    ['減少金錢負擔','員工毋須一直購買時尚或適合工作的衣服，低薪員工尤其受惠。'],
    ['弱化外表比較','相似服裝令財富、品味和背景差異較不顯眼。'],
    ['增加團隊感','員工可能更感到平等，並認為自己屬於同一團隊。'],
    ['重視實際設計','舒適而具保護性的制服，讓員工把注意力放回工作。'],
  ],'先交代省時省錢，再說社交與心理感受，最後補上舒適、安全和專注。'),
];

const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink,
});
const transferTasks=[
  transfer('社區診所的接待員各穿不同服裝。病人第一次到診所時，難以看出誰可提供協助。','哪項最能轉用範文對公司形象的論證？',[
    '讓接待員穿一致且易辨認的衣服，使病人較快建立有條理的印象',
    '要求接待員各選鮮豔的衣服，讓病人自行猜測誰可以提供協助',
    '只在網站加入更多宣傳文字，但不改變病人進門時所見的安排',
    '把病人初次求助的困難歸咎於病人，不檢查員工是否容易辨認',
  ],[
    '一致而易辨認的外觀直接改善病人初次接觸時對機構的印象。',
    '更鮮豔但不一致的衣服未必令病人分清接待員身分。',
    '網站宣傳不能解決病人到場後看不到接待員的問題。',
    '責怪病人沒有回應原文所談的可見形象與辨認障礙。',
  ],[2,3,4],'範文以顧客看見一致且容易辨認的員工為起點，解釋企業為何顯得有條理和可靠；診所的第一印象也由現場安排形成。'),
  transfer('市立圖書館的訪客經常找不到值班館員，只好排隊向保安詢問借書問題。','哪個做法最直接應用「容易識別員工」的機制？',[
    '讓值班館員佩戴清楚標誌，使訪客能直接找到可提供借書協助的人',
    '只增設借書宣傳海報，卻讓館員與其他訪客繼續完全無法區分',
    '要求保安處理所有借書問題，不再讓受訓館員回應訪客的需要',
    '把排隊時間記錄在報表，卻不處理館員難以辨認的現場問題',
  ],[
    '清楚標誌直接改善辨認，訪客可更快向合適的人求助。',
    '海報不能讓訪客辨出現場哪位是值班館員。',
    '把專業問題交給保安沒有利用可辨認館員的服務能力。',
    '事後記錄排隊時間不能消除當下的辨認障礙。',
  ],[5,6],'範文先說制服令員工容易識別，再推到顧客能更快尋求協助；圖書館同樣要讓訪客一眼找對人。'),
  transfer('一間食品工場考慮讓員工穿普通便服進入製作區，理由是便服比較方便購買。','哪項最符合範文對特定工作環境的判斷？',[
    '按食品製作要求選合適工作服，兼顧清潔與員工的實際安全',
    '只選最便宜的普通便服，忽略製作區對衛生及安全的要求',
    '只把所有衣服染成同一顏色，不考慮布料是否適合製作區',
    '完全取消服裝安排，假設食品工作與其他工作毫無差異',
  ],[
    '原文強調服裝要為特定工作環境設計，衛生和安全才有依據。',
    '價格較低不能取代食品環境的衛生要求。',
    '同色只涉及外觀，不能證明衣物適合製作工作。',
    '食品工作有特定風險，不能當成無差別的普通工作。',
  ],[7,13],'範文用食品、醫療和機械工作說明：工作服的設計須配合環境，才能有助衛生和安全。'),
  transfer('大型體育館有許多工作人員，也有訪客可走入的後勤通道。訪客常分不清哪些人可協助。','哪個方案最完整承接範文的辨認結果鏈？',[
    '以明顯標誌辨認工作人員，方便求助與管理，也加強後勤通道把關',
    '只把後勤通道名稱改短，仍讓訪客與員工在外觀上無法分辨',
    '僅要求訪客多問幾個人，卻不協助管理者辨認現場工作人員',
    '取消通道管理，假設訪客更快找到人便不再需要限制區域',
  ],[
    '做法同時涵蓋訪客求助、現場管理及限制區域，對應原文三項結果。',
    '改短名稱未解決員工辨認或通道把關。',
    '把辨認成本交給訪客，也遺漏管理者的效率。',
    '服務便利與限制區管理是並行好處，不能以一項取消另一項。',
  ],[5,6],'範文從「容易識別」推到顧客、經理和限制區域三方後果；體育館的方案也應完整處理三方面。'),
  transfer('文化中心聘請收入不高的兼職導賞員，但要求他們每天自備不同的正式服裝。','哪項最能套用範文對低薪員工的分析？',[
    '提供合適工作服，減少每日選衣和購衣負擔，也降低外表被評價的壓力',
    '要求導賞員自行買更多正式服裝，並把外表比較當成團隊訓練',
    '只告訴導賞員不用擔心，卻繼續要求他們每天更換自購衣物',
    '讓每人自行選最昂貴的服裝，假設收入高低不會影響購衣負擔',
  ],[
    '合適工作服同時減少時間、金錢與外表評價壓力，切合原文。',
    '加重購衣要求正好擴大原文指出的低薪員工負擔。',
    '口頭安慰若不改變服裝要求，不能減少實際成本。',
    '昂貴衣服對低薪員工更可能造成壓力。',
  ],[9,10],'範文指出統一服裝減少每天選衣及購買合適衣物的需要；這對容易因外表被評價的低薪員工尤其實際。'),
  transfer('一支社區義工隊成員背景不同，活動時有人擔心衣著會顯示收入差異。','哪個選擇最符合範文對平等與歸屬感的推理？',[
    '提供舒適的共同上衣，減少衣著差異的可見程度並建立團隊感',
    '要求每人展示自己最昂貴的衣服，讓成員按收入分組合作',
    '只宣布所有人背景已完全相同，不處理活動時的衣著比較',
    '禁止成員談論背景，但保留以衣著判斷誰較有能力的習慣',
  ],[
    '共同上衣可令可見差異較少，進而支持同屬一隊的感受。',
    '展示昂貴衣物會突出差異，與原文機制相反。',
    '原文只說差異較不顯眼，並沒有說真實背景消失。',
    '禁止談論並不能消除以衣著作比較的行為。',
  ],[11,12],'範文說相似服裝令財富、品味和背景差異較不明顯，員工因而可能更有同一團隊的感受。'),
  transfer('照護中心的新工作服外觀一致，卻很厚重，護理員說穿著時難以處理日常工作。','哪項修正最符合範文的完整標準？',[
    '保留清楚識別的功能，同時改用舒適而具保護性的合適衣物',
    '只加強制服的顏色一致性，忽略護理員提出的活動困難',
    '要求護理員多花時間整理厚重衣服，假設專注工作不重要',
    '完全不顧工作環境與防護需要，只選最時尚的便服款式',
  ],[
    '原文認可辨認好處，也要求設計能保護員工並讓他們專注工作。',
    '更一致的外觀不能解決厚重衣物妨礙工作。',
    '令員工更分心，與原文的專注機制相反。',
    '只顧時尚無法回應照護工作的實際防護需要。',
  ],[5,7,13],'範文同時說制服方便辨認、可按環境支持安全，也說設計良好的制服應舒適，讓員工專注任務。'),
  transfer('社區學校的活動工作人員衣著不一，家長首次來訪時找人困難；工作人員亦常擔心穿得不夠體面。','哪套方案同時照顧機構與工作人員？',[
    '提供易辨認且舒適的共同工作服，方便家長求助並減少選衣壓力',
    '只增加指示牌數量，保留工作人員每天自行購衣和找衣的負擔',
    '只要求工作人員買更正式的服裝，卻不讓家長更容易辨認他們',
    '取消所有現場協助，假設工作人員外觀與家長體驗完全無關',
  ],[
    '做法同時改善訪客辨認和員工日常衣著負擔，涵蓋兩個題問。',
    '指示牌或有幫助，但未處理工作人員的選衣與購衣壓力。',
    '更正式的自購服裝可能加重負擔，也未必方便辨認。',
    '取消協助沒有回應現場求助或員工壓力。',
  ],[2,5,9,14,15],'範文先列公司方面的識別與形象好處，再列員工方面的省時省錢好處；這個方案需同時顧及兩方。'),
  transfer('一間製造公司打算只選最搶眼的制服，但有員工反映衣料容易勾住機器部件。','哪項判斷最能轉用範文對制服好處的條件？',[
    '先處理機械工作所需防護與衣物舒適度，再考慮清楚識別的外觀',
    '只加強顏色對比，假設搶眼外觀必然能處理機械操作風險',
    '讓員工自行承擔衣料風險，因為制服唯一作用是宣傳公司',
    '完全取消衣物設計標準，讓每人只按個人喜好選時尚便服',
  ],[
    '機械工作服需配合環境且具保護性；識別好處不能替代安全設計。',
    '顏色搶眼不會消除衣料勾住機器的具體風險。',
    '範文同時討論員工安全，並非只談公司形象。',
    '沒有設計標準仍會留下題目指出的風險。',
  ],[7,13],'範文特別提到機械工作和保護性；制服的實際好處取決於是否為工作環境妥善設計。'),
  transfer('一個城市節慶想為前線人員設計新服裝，主辦方希望同時改善訪客體驗及人員感受。','哪個評估最完整呼應範文的兩組結論？',[
    '檢查訪客能否辨認人員，也檢查服裝是否省時省錢並增加團隊感',
    '只量度節慶宣傳照片好不好看，不理會人員穿著的實際感受',
    '只問人員喜不喜歡顏色，不檢查訪客求助是否因此變得容易',
    '以衣服成本作唯一標準，完全不看管理、壓力或歸屬感',
  ],[
    '公司面向與員工面向都要評估，才完整回答原題的兩個直接問題。',
    '宣傳外觀只觸及機構形象，遺漏工作人員的利益。',
    '人員喜好只是局部資訊，遺漏訪客辨認與服務。',
    '單看成本無法評估形象、辨認、社交壓力和團隊感。',
  ],[14,15],'原文結論分別總結公司在形象、辨認及管理上的利益，以及員工在時間、金錢和歸屬上的利益。'),
];

export default {key:'direct-question:3',meta:{topic:'工作制服對公司與員工的好處',summary:'先說制服如何改善企業形象、辨認及安全，再說它如何減少員工負擔、增加平等與歸屬感。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
