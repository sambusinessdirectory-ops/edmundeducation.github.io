// Human-reviewed, source-specific support for Direct Question 31.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-31-ielts-direct-question.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['direct-question:31'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'It is now more common for offices and school buildings to have large areas that people share instead of many separate rooms.',
  'This change mainly happens because these spaces can be used in more ways and help people meet and talk.',
  'I think this is a good change because, if planned well, shared spaces can help organisations work together, change plans and use space well.',
  'The first reason for choosing this design is that it is useful.',
  'Modern offices and schools do not often use a room for just one thing all day.',
  'People can quickly change a shared area for team work, meetings, talks or working alone, but many small rooms are much harder to change.',
  'For example, one big school space can let several classes do a science project together while teachers move easily between groups.',
  'The same idea works in an office: teams can come together, split up and come together again when their projects change.',
  'This uses less space and stops buildings from having many rooms that are hardly used.',
  'I also think this design is good because shared buildings help people talk to one another.',
  'In many older offices, workers may be alone behind closed doors, so they take longer to solve problems and feel less like a team.',
  'In the same way, pupils who only learn in closed classrooms may have fewer chances to work with pupils in other groups.',
  'Shared spaces let people meet more easily: they can ask short questions, watch how others work and share ideas without needing a formal meeting every time.',
  'This does more than make a building look new; it changes how people work and study each day.',
  'There may be noise and things that take people’s attention away, but quiet areas, walls that can be moved and fair rules can reduce these problems.',
  'The main idea is still a good one.',
  'All in all, shared spaces are common because they let people use buildings in more ways, and I think they are good because they help people work together and use space well.',
];
const vocabulary=[
  [['increasingly common','more common','越來越常見'],['workplaces and educational buildings','offices and school buildings','工作及教育建築'],['large shared areas','large areas that people share','大型共享空間'],['rather than separate rooms','instead of many separate rooms','而非獨立房間']],
  [['trend','change','趨勢'],['driven by','happens because','成因'],['greater flexibility','used in more ways','更靈活使用'],['closer interaction','meet and talk','更密切互動']],
  [['regard it as a positive development','think this is a good change','視為正面發展'],['when planned properly','if planned well','妥善規劃時'],['institutions','organisations','機構'],['cooperative, adaptable and efficient','work together, change plans and use space well','合作、適應及效率']],
  [['design choice','choosing this design','設計選擇'],['practical','useful','實用']],
  [['rarely','do not often','很少'],['one fixed purpose','just one thing','單一固定用途'],['throughout the day','all day','整天']],
  [['open area','shared area','開放式區域'],['rearranged quickly','quickly change','迅速重排'],['group projects','team work','小組項目'],['staff meetings','meetings','員工會議'],['presentations','talks','簡報'],['independent work','working alone','獨立工作'],['whereas','but','然而'],['much harder to adapt','much harder to change','更難調整']],
  [['large learning space','one big school space','大型學習空間'],['allow several classes','let several classes','容許幾班'],['science project','science project','科學項目'],['teachers moving freely','teachers move easily','教師自由走動']],
  [['same logic applies','same idea works','同一道理適用'],['form, separate and reform','come together, split up and come together again','組成、分開、重組'],['as projects change','when their projects change','隨項目變化']],
  [['saves space','uses less space','節省空間'],['prevents buildings','stops buildings','防止建築'],['maze of underused rooms','many rooms that are hardly used','使用不足房間的迷宮']],
  [['see this as positive','think this design is good','視為正面'],['open-plan buildings','shared buildings','開放式建築'],['encourage communication','help people talk to one another','促進溝通']],
  [['traditional offices','older offices','傳統辦公室'],['employees','workers','員工'],['isolated behind closed doors','alone behind closed doors','被關門隔離'],['slows down problem-solving','take longer to solve problems','拖慢解決問題'],['weakens team spirit','feel less like a team','削弱團隊精神']],
  [['Similarly','In the same way','同樣地'],['sealed classrooms','closed classrooms','封閉課室'],['collaborate','work with','合作'],['classmates from other groups','pupils in other groups','其他小組同學']],
  [['natural contact','meet more easily','自然接觸'],['observe','watch','觀察'],['turning every conversation into a formal meeting','needing a formal meeting every time','每次交流都變會議']],
  [['does not simply','does more than','不只是'],['look modern','look new','外觀現代'],['rhythm of daily work and study','how people work and study each day','日常工作學習節奏']],
  [['distraction','things that take people’s attention away','分心'],['quiet zones','quiet areas','安靜區'],['movable partitions','walls that can be moved','可移動隔板'],['sensible rules','fair rules','合理規則'],['reduced','reduce','減少']],
  [['core idea','main idea','核心理念'],['remains sound','still a good one','仍然合理']],
  [['Overall','All in all','總括'],['open-plan design','shared spaces','開放式設計'],['flexible','use buildings in more ways','靈活'],['positive development','good','正面發展'],['collaboration','work together','合作'],['better use of space','use space well','善用空間']],
];
const chunkOverrides=[
  ['It is increasingly common for workplaces and educational buildings','to be designed around large shared areas','rather than separate rooms.'],
  ['This trend is mainly driven','by the need for greater flexibility and closer interaction.'],
  ['I regard it as a positive development','because, when planned properly, open spaces can make institutions','more cooperative, adaptable and efficient.'],
  ['The first reason behind this design choice','is practical.'],
  ['Modern offices and schools rarely use rooms','for one fixed purpose throughout the day.'],
  ['An open area can be rearranged quickly','for group projects, staff meetings, presentations or independent work,','whereas a building divided into many small rooms','is much harder to adapt.'],
  ['In a school, for example,','one large learning space can allow several classes','to work on a science project together,','with teachers moving freely between groups.'],
  ['In an office, the same logic applies:','teams can form, separate and reform','as projects change.'],
  ['This saves space and prevents buildings','from becoming a maze of underused rooms.'],
  ['I also see this as positive','because open-plan buildings encourage communication.'],
  ['In many traditional offices,','employees can become isolated behind closed doors,','which slows down problem-solving and weakens team spirit.'],
  ['Similarly, in schools,','students who learn only in sealed classrooms','may have fewer chances to collaborate','with classmates from other groups.'],
  ['Open spaces create more natural contact:','people can ask quick questions, observe how others work','and share ideas','without turning every conversation into a formal meeting.'],
  ['This does not simply make a building look modern;','it changes the rhythm of daily work and study.'],
  ['Some noise and distraction are possible,','but these can be reduced through quiet zones,','movable partitions and sensible rules.'],
  ['The core idea','remains sound.'],
  ['Overall, open-plan design is popular','because it makes buildings more flexible,','and I believe it is a positive development','because it encourages collaboration','and makes better use of space.'],
];
const simpleChunkOverrides=[
  ['It is now more common for offices and school buildings','to have large areas that people share','instead of many separate rooms.'],
  ['This change mainly happens because these spaces','can be used in more ways','and help people meet and talk.'],
  ['I think this is a good change','because, if planned well, shared spaces','can help organisations work together, change plans','and use space well.'],
  ['The first reason for choosing this design','is that it is useful.'],
  ['Modern offices and schools do not often use a room','for just one thing all day.'],
  ['People can quickly change a shared area','for team work, meetings, talks or working alone,','but many small rooms are much harder to change.'],
  ['For example, one big school space','can let several classes do a science project together','while teachers move easily between groups.'],
  ['The same idea works in an office:','teams can come together, split up and come together again','when their projects change.'],
  ['This uses less space and stops buildings','from having many rooms that are hardly used.'],
  ['I also think this design is good','because shared buildings help people talk to one another.'],
  ['In many older offices, workers may be alone','behind closed doors,','so they take longer to solve problems','and feel less like a team.'],
  ['In the same way, pupils who only learn','in closed classrooms may have fewer chances','to work with pupils in other groups.'],
  ['Shared spaces let people meet more easily:','they can ask short questions, watch how others work','and share ideas','without needing a formal meeting every time.'],
  ['This does more than make a building look new;','it changes how people work and study each day.'],
  ['There may be noise and things','that take people’s attention away,','but quiet areas, walls that can be moved','and fair rules can reduce these problems.'],
  ['The main idea','is still a good one.'],
  ['All in all, shared spaces are common','because they let people use buildings in more ways,','and I think they are good','because they help people work together','and use space well.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，語法關係與原句相同。`,distractorReason:`這句${focus}，但內容關係不同。`};}
const structures=[
  card('It is increasingly common for clinics to be designed around one shared waiting area rather than separate rooms.','以 It is ... for ... to ... rather than ... 對照兩種設計',[1,3,4],fixed(0,'It is increasingly common for [工作教育建築] to be designed around [共享空間] rather than [獨立房間].','指出開放式空間正取代逐間分隔的建築布局。','介紹一種日漸常見的設計，並明確說出它取代甚麼時。',['It is increasingly common for ',' to be designed around ',' rather than '],['正改變設計的建築','設計所圍繞的共享空間','被取代的布局'])),
  card('This trend is mainly driven by the need for cheaper energy and easier repairs.','以 is mainly driven by the need for 交代兩項主要成因',[0,3,9],fixed(1,'This trend is mainly driven by the need for [靈活性] and [互動].','回答題目「為何興起」，原因是空間使用彈性和人際互動。','題目直接問某設計為何流行，需要在引言概括兩項驅動因素時。',['This trend is mainly driven by the need for ',' and '],['第一項設計需求','第二項設計需求'])),
  card('I regard it as a positive development because, when managed well, shared clinics can make patient care more efficient.','以 because, when ... 指出正面評價成立的規劃條件',[1,4,9],fixed(2,'I regard it as a positive development because, when [規劃得當], [開放空間] can make [機構] more [合作、適應及高效].','先表態，再限定只有妥善規劃時才可取得好處。','題目問正面或負面，想提出有條件的正面判斷時。',['I regard it as a positive development because, when ', ', ', ' can make ', ' more '],['好處成立的條件','起作用的空間','受益的機構','可改善的能力'])),
  card('The first reason behind this change is practical.','以 The first reason behind ... is ... 開啟第一個成因',[1,7,9],fixed(3,'The first reason behind [這種設計] is [實際用途].','第一主體段先談可調整用途的實際需要。','從引言轉入第一項成因，要先給讀者一個明確焦點時。',['The first reason behind ',' is '],['需解釋的設計選擇','第一項成因的性質'])),
  card('Public libraries rarely use rooms for one fixed purpose throughout the week.','以 rarely ... for one fixed purpose 說明固定用途已不合需求',[3,5,8],fixed(4,'[現代辦公室和學校] rarely use rooms for [單一固定用途] throughout [整天].','先指出傳統固定房間與現今活動變化不相配。','準備解釋可變空間的必要性，先說房間用途不再固定時。',[' rarely use rooms for ',' throughout '],['需要多用途的建築','並非一直維持的用途','考察用途的時間'])),
  card('A library hall can be rearranged quickly for talks or reading, whereas a building of small fixed rooms is much harder to adapt.','以 whereas 對照可重排開放區與小房間的適應力',[4,6,8],fixed(5,'[開放區] can be rearranged quickly for [多種活動], whereas [被小房間分割的建築] is much harder to adapt.','用同一項需求比較兩種布局的調整難度。','已說活動用途常變，要直接比較開放空間與固定小房間時。',[' can be rearranged quickly for ', ', whereas ', ' is much harder to adapt.'],['可調整的空間','不同用途','較難調整的布局'])),
  card('In a hospital, for example, one shared training room can allow nurses to learn together, with experts moving between groups.','以 In ... for example ... with ... 呈現群組共用空間的例子',[5,7,8],fixed(6,'In [學校], for example, [大型學習空間] can allow [幾班學生] to [一起做科學項目], with [教師在組間走動].','以學校情境展示空間彈性如何變成跨班合作。','抽象比較已說完，要給出可看見學生與教師如何活動的例子時。',['In ', ', for example, ', ' can allow ', ' to ', ', with '],['例子場景','共用場地','共同參與者','共同活動','教師的配合行動'])),
  card('In a clinic, the same logic applies: teams can gather, separate and regroup as patient needs change.','以 the same logic applies 把學校例子移到另一場景',[6,8,9],fixed(7,'In [辦公室], the same logic applies: [團隊] can [組成、分開、重組] as [項目改變].','將上一句學校共用空間的機制延伸到辦公室。','第一個場景例子已清楚，接着顯示同一道理可用於另一場景時。',['In ', ', the same logic applies: ', ' can ', ' as '],['第二個場景','會重組的人員','可調整的合作方式','變動的工作需求'])),
  card('This saves money and prevents the centre from becoming a maze of empty rooms.','以 This ... and prevents ... 總結可變空間的兩項實際好處',[5,7,10],fixed(8,'This [節省空間] and prevents [建築] from becoming [使用不足房間的迷宮].','由前兩個例子收束成節省空間與避免閒置房間。','辦公室與學校的使用例子已說完，要指出共同的資源效益時。',['This ', ' and prevents ', ' from becoming '],['可變布局的節省效果','受益的建築','避免的閒置狀態'])),
  card('I also see shared kitchens as positive because they encourage neighbours to talk.','以 I also see ... as positive because 轉入第二項好處',[3,8,10],fixed(9,'I also see [開放式建築] as positive because [它促進溝通].','第二主體段從實用性轉到人與人之間的交流。','第一項實用理由已完結，要明確提出另一個評價角度時。',['I also see ', ' as positive because '],['受評價的設計','第二項正面作用'])),
  card('In many older clinics, staff can become isolated behind closed doors, which delays decisions and reduces trust.','以 which 連接隔離情況與兩項負面後果',[9,11,12],fixed(10,'In [傳統辦公室], [員工] can become [隔離], which [拖慢解難] and [削弱團隊精神].','指出關門分隔如何同時損害解難速度和團隊合作。','要解釋開放布局促進溝通，先展示封閉辦公室造成的具體障礙時。',['In ', ', ', ' can become ', ', which ', ' and '],['封閉的場景','受影響的人','隔離情況','第一個工作後果','第二個團隊後果'])),
  card('Similarly, in a hospital, staff who stay in separate rooms may have fewer chances to learn from other teams.','以 Similarly ... may have fewer chances to 平行轉入學校',[10,12,13],fixed(11,'Similarly, in [學校], [只在封閉課室學習的學生] may have fewer chances to [與其他小組合作].','把辦公室的隔離問題平行套到學校合作機會。','已談辦公室關門的後果，還要指出學校封閉課室有類似問題時。',['Similarly, in ', ', ', ' may have fewer chances to '],['第二個場景','受封閉環境限制的人','因此減少的合作機會'])),
  card('Shared kitchens create more natural contact: neighbours can ask questions and exchange tips without arranging a formal meeting.','以冒號列出自然交流的具體行動',[10,11,13],fixed(12,'[開放空間] create [自然接觸]: [人們] can [提問、觀察與分享] without [每次都開正式會議].','把促進溝通具體化為隨手問、觀察與分享。','說完封閉課室的限制，要展示開放空間如何減少交流門檻時。',[' create ', ': ', ' can ', ' without '],['促進交流的空間','交流性質','參與交流的人','具體互動','不再需要的正式程序'])),
  card('This does not simply improve a school’s appearance; it changes how pupils learn each day.','以 not simply ...; it ... 對照外觀與日常實際作用',[9,12,14],fixed(13,'This does not simply [讓建築顯得現代]; it [改變日常工作學習節奏].','強調好處不是設計外觀，而是實際互動方式改變。','擔心讀者只把開放布局當外觀潮流，要點出日常行為變化時。',['This does not simply ', '; it '],['較表面的外觀效果','真正重要的日常改變'])),
  card('Some privacy problems are possible, but these can be reduced through small rooms, partitions and clear booking rules.','以 but these can be reduced through 承認並處理缺點',[12,13,15],fixed(14,'Some [噪音和干擾] are possible, but these can be reduced through [安靜區], [可移動隔板] and [合理規則].','承認開放布局可能帶來干擾，同時提出三種可行緩解方式。','正面論證後需正視噪音與分心，並說明如何降低它們時。',['Some ', ' are possible, but these can be reduced through ', ', ', ' and '],['可出現的缺點','第一種緩解措施','第二種措施','第三種措施'])),
  card('The central plan remains sensible.','以 The ... remains ... 在處理反對意見後重申判斷',[13,14,16],fixed(15,'The [開放布局的核心理念] remains [合理].','處理噪音問題後，簡短保留對整體理念的正面判斷。','已提出具體補救措施，想用短句確認主要立場仍成立時。',['The ', ' remains '],['經過權衡的核心理念','權衡後仍成立的判斷'])),
  card('Overall, a shared clinic is popular because rooms can change purpose, and I believe it is a positive development because they help teams and save space.','以兩個 because 分別總結流行原因和正面判斷',[1,2,15],fixed(16,'Overall, [開放式設計] is popular because [建築更靈活], and I believe it is a positive development because [鼓勵合作] and [善用空間].','結論分別回答題目兩問：為何流行，以及為何作者判為正面。','雙問題目收尾時，須同時重申成因與價值判斷，不漏任何一問。',['Overall, ', ' is popular because ', ', and I believe it is a positive development because ', ' and '],['被討論的布局','流行的實際原因','支持正面判斷的互動原因','支持正面判斷的空間原因'])),
];
const wrongReasons=[
  ['成因摘要沒有對照共享區與分隔房間。','第一理由只談實用性，不是正在興起的布局對照。','固定房間使用變化不是整體設計趨勢的比較。'],
  ['布局對照說變化是甚麼，未解釋兩項驅動需求。','實用性是後文細述，沒有概括互動需求。','第二段說交流好處，沒有回答趨勢的兩項主要成因。'],
  ['成因句沒有先作正面評價及規劃條件。','房間用途是證據，沒有完整評價。','交流好處是其中一項，沒有妥善規劃的限定。'],
  ['成因摘要列兩項需求，未開啟實用性第一理由。','鄉校布局比較是後續解釋，不是理由標題。','第二段轉談溝通，與第一項實用原因不同。'],
  ['理由標題沒有指出房間用途不再固定。','可重排空間是後續解法，不是需求背景。','節省空間是結果，不是固定用途不足。'],
  ['固定用途背景尚未比較兩種布局。','學校例子只展示其中一種運用。','節省房間是結論，沒有 whereas 的可調整性對比。'],
  ['布局比較是一般原理，沒有學校跨班科學活動。','辦公室延伸不是第一個具體學校例子。','節省空間總結沒有教師在小組間移動。'],
  ['學校例子是第一場景，沒有把同一機制搬到辦公室。','空間效益是結論，沒有團隊重組過程。','溝通是另一理由，不是項目變化下的團隊重組。'],
  ['可調整空間是機制，沒有總結閒置房間的減少。','辦公室團隊重組是例子，沒有節省空間結果。','封閉門後隔離屬交流問題，不是閒置房間。'],
  ['實用性是第一成因，沒有轉入溝通好處。','節省空間是前段結果，沒有第二正面理由。','封閉辦公室是溝通理由的後續反面證據。'],
  ['第二好處標題沒有關門隔離和後續雙重損害。','學校平行問題不是先提出的辦公室場景。','自然接觸是解法，不是封閉辦公室的障礙。'],
  ['辦公室封閉是上一個場景，不是 Similarly 轉到學校。','自然接觸說開放空間的機會，並非封閉課室的限制。','外觀與日常變化不是學校跨組合作機會。'],
  ['關門隔離指出障礙，沒有隨手交流的具體行動。','封閉課室說機會減少，沒有開放區的提問觀察。','外觀對比是總結，沒有冒號後的行動清單。'],
  ['溝通主張仍是好處標題，未對照外觀與實際節奏。','自然接觸列行動，但未提升到日常節奏的判斷。','噪音對策處理缺點，不是外觀與日常效果的對照。'],
  ['自然接觸是好處，沒有承認噪音或給出三項措施。','外觀對比沒有處理分心問題。','核心理念短句是權衡後的判斷，沒有具體措施。'],
  ['外觀對比仍在解釋好處，尚未處理異議。','噪音對策是前一步，不是其後的立場重申。','全文結論要回答兩問，比這個簡短判斷更廣。'],
  ['成因摘要只回答為何興起，尚未總結作者評價。','引言立場不是經過兩段證據及異議後的收束。','核心理念短句沒有同時回答題目兩問。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先看每一步如何承接前一步，再依範文論證次序排卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求同時回答哪兩件事？',[
    '為何辦公室和學校採用開放式布局，以及這是否正面發展',
    '哪種辦公桌最便宜，以及學校應買多少張桌子',
    '學校只應建哪一科課室，以及如何減少建築高度',
    '不同國家怎樣裝修房子，以及哪種牆色最受歡迎',
  ],'題目問開放式設計的成因與作者對其正負面的判斷。'),
  {type:'multi',prompt:'選出作者支持開放式空間的兩條主理由',detail:'選兩項，再按「確認」。',options:[
    '空間可隨活動快速重排，避免房間長期使用不足',
    '日常接觸增多，提問、觀察和分享變得容易',
    '所有房間應一直鎖住，免得不同組別相遇',
    '只要看起來現代，便不需考慮工作和學習',
  ],correct:[0,1],why:'文章分別論證實用彈性和自然溝通；外觀不是主要好處。'},
];
const route=[sequence('依照文章次序排列四段的工作',[
  ['引言答兩問','說明布局趨勢、兩項成因，並提出有條件的正面評價。'],
  ['第一段談實用性','比較可重排共享區和固定小房間，以學校、辦公室例子收束。'],
  ['第二段談溝通','指出關門隔離的限制，再說開放空間如何讓交流自然發生。'],
  ['結論承認及回應','承認噪音分心，提出安靜區和規則，再重申原因與立場。'],
],'先答成因，再用空間彈性與溝通支持正面評價，最後處理限制。')];
const evidence=[
  quiz('固定小房間的主要問題是甚麼？',[
    '每日活動用途變化，但許多小房間較難重新安排',
    '所有學校房間每天只會做完全一樣的活動',
    '開放空間無法容納小組活動或個人工作',
    '教學和會議都只能在沒有門的走廊舉行',
  ],'原文把多用途需求與固定小房間難調整作比較。'),
  quiz('科學項目的例子如何支持開放空間？',[
    '幾個班可一起工作，教師也可在各小組間走動',
    '各班需被永久分隔，教師不能接近其他小組',
    '學生只能看簡報，不能共同完成任何項目',
    '只有一位學生能使用整個大型學習空間',
  ],'學校例子顯示同一共享空間可支援跨班活動。'),
  quiz('辦公室的平行例子補充了甚麼？',[
    '項目一變，團隊可組成、分開，再重新組合',
    '所有團隊永遠只能坐在同一間固定辦公室',
    '項目變化時，所有人都必須停止合作',
    '團隊只有在學校科學課才有可能重新組合',
  ],'同樣的布局彈性也可回應辦公項目變化。'),
  quiz('封閉的傳統辦公室可能帶來哪兩種後果？',[
    '解決問題變慢，而且員工的團隊感變弱',
    '解決問題必定加快，而且團隊感必定更強',
    '所有人都自然交流，完全不需刻意見面',
    '只會影響建築外觀，完全不會影響合作',
  ],'關門隔離使即時交流更難，連到解難和團隊精神。'),
  quiz('開放空間的自然接觸具體包括甚麼？',[
    '隨手提問、觀察同伴工作，以及分享想法',
    '每次短問都先安排正式大型會議',
    '避免看到別人的工作，也不分享任何主意',
    '只更換外牆材料，毋須改變每日交流',
  ],'原文用三個日常行動說明交流門檻下降。'),
  quiz('作者如何回應噪音和分心的疑慮？',[
    '設安靜區、可移動隔板，並訂合理規則',
    '否認任何開放空間都可能出現噪音',
    '禁止所有人工作，便能完全消除分心',
    '只換現代外觀，不處理空間使用方式',
  ],'作者承認問題，並列出三種實際減低干擾的方法。'),
  quiz('結論為何要分別說兩次 because？',[
    '一次交代開放布局流行的原因，另一次支持正面評價',
    '兩次都只重複房間外觀，完全不回答題目',
    '一次談家具價格，另一次談外牆顏色',
    '因為文章沒有說明任何成因或作者立場',
  ],'題目有兩問，結論也須分別回應成因與判斷。'),
];
const logic=[
  sequence('空間彈性的因果鏈',[
    ['用途不再固定','學校和辦公室的活動會在一天內改變。'],
    ['開放區可重排','同一場地可接待項目、會議、簡報或獨立工作。'],
    ['學校跨班使用','幾班學生一起做科學項目，教師在組間走動。'],
    ['辦公團隊重組','項目變動時，員工可分組、拆組、再組。'],
    ['減少閒置','建築不必留下大量使用不足的小房間。'],
  ],'「活動變」先帶出「空間需變」，兩個場景再證明其資源效果。'),
  sequence('溝通好處及限制的處理',[
    ['關門隔離','傳統辦公室不利即時解難與團隊感。'],
    ['學校也受限','封閉課室減少跨組合作的機會。'],
    ['自然接觸','共享區讓提問、觀察和分享較易發生。'],
    ['處理副作用','安靜區、可移動隔板和規則可減低干擾。'],
    ['保留正面判斷','在妥善規劃下，核心理念仍然合理。'],
  ],'作者不是忽略噪音，而是給出可操作的規劃回應。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('一間社區中心每天先辦長者課，再開家長會，晚間又讓青年排練。','哪項最能轉用範文的靈活布局理由？',[
    '用可重排的共享區，讓同一場地按活動改變用途',
    '把每間房永久指定用途，即使整天無人使用',
    '只看大樓外觀是否新潮，不問活動如何切換',
    '要求各活動同時擠在小房，不容移動任何設施',
  ],['範文指出活動用途變動，開放區較易迅速重排。','固定房間易閒置。','外觀不是論證核心。','重點是讓空間適應活動。'],[4,5,8],'範文說學校和辦公室不會整天只用一間房做固定一事，開放區可重排。'),
  transfer('一所學校想讓三個班共同做科學展，老師要在小組間巡視。','哪種安排最貼近範文的學校例子？',[
    '安排共享學習區，讓各班合作並方便教師走動',
    '永久關上班房門，禁止不同班級互相接觸',
    '只換課室牆色，完全不考慮跨班活動安排',
    '只讓一班進入場地，其他班始終不能參與',
  ],['原文的學校例子正是跨班科學項目與教師流動。','這會阻礙例子所需合作。','牆色不解決活動組織。','原文讓幾班一起使用。'],[6],'原文說大型學習空間讓幾班同做科學項目，教師可自由穿梭小組。'),
  transfer('新創公司每季換一項任務，工作小組經常組成、解散再重組。','哪項空間安排最能運用文章的辦公室邏輯？',[
    '讓工作區可調整，配合團隊隨項目重新組合',
    '把每隊永遠鎖在一間房，即使項目已結束',
    '只因辦公桌數量夠，就不再考慮工作流程',
    '要求團隊固定不變，讓辦公室先決定項目',
  ],['範文用團隊重組顯示開放布局如何配合項目變動。','固定房間與變動項目不相配。','桌數不等於合作彈性。','原文是空間配合項目。'],[5,7,8],'原文把辦公室與學校並列：項目改變時團隊可組成、分開、再組合。'),
  transfer('一棟培訓中心有許多固定小房，但大半時間空置；同時大型活動沒有足夠場地。','哪項最能轉用範文的空間效率推論？',[
    '重排部分空間，避免留下許多長期閒置房間',
    '再建更多固定小房，即使它們仍然經常空置',
    '只問建築是否好看，完全不理實際使用率',
    '取消所有大型活動，以遷就已閒置的小房',
  ],['可變用途有助節省空間，避免未善用房間的迷宮。','這會加重同一問題。','使用率正是題目資料。','活動需求應影響布局。'],[4,5,8],'原文總結開放布局能節省空間，防止大量小房間使用不足。'),
  transfer('一間診所的護士和醫生分散在關門房間，簡單問題也要等下次正式會議才處理。','哪項最能轉用範文的溝通論證？',[
    '設合適共享區，讓同事可即時提問並交換想法',
    '繼續隔絕同事，讓所有短問都等到正式會議',
    '只換走廊燈飾，保留原有交流障礙不處理',
    '禁止跨隊討論，認定合作只會拖慢解難',
  ],['原文指出自然接觸可免把每次交流變正式會議。','這正是原文想改善的障礙。','燈飾不能改善交流。','隔絕可拖慢解難。'],[10,12],'範文說關門隔離拖慢解難，共享空間則讓隨手提問和分享較自然。'),
  transfer('圖書館各小組一直分室工作，服務員幾乎看不到其他組怎樣幫讀者。','哪項最能套用文章的觀察與學習機制？',[
    '讓小組適度共享空間，彼此觀察做法並交流',
    '要求各組完全封閉，避免看到其他人的方法',
    '只添新書架，不考慮員工如何跨組別學習',
    '把日常簡短交流一律改成冗長正式會議',
  ],['自然接觸讓人觀察別人做法，並分享想法。','這令觀察機會更少。','書架與協作問題無直接關係。','原文想降低交流門檻。'],[11,12],'原文說開放空間讓人提問、觀察他人工作和分享想法。'),
  transfer('開放辦公室方便交流，但附近有人打電話，某些人需要安靜完成報告。','哪項回應最忠於範文的平衡方式？',[
    '保留共享區，再設安靜區、隔板及清晰使用規則',
    '否認噪音存在，要求所有人一直在同一區工作',
    '撤走所有共享區，卻不分析任何合作方面好處',
    '只叫員工戴耳機，不建立任何空間或行為安排',
  ],['作者承認干擾並提出安靜區、隔板和規則。','原文沒有否認問題。','完全撤走忽略已有好處。','單一個人措施不足以回應布局。'],[2,14,15],'範文的正面判斷以妥善規劃為條件，噪音可由安靜區等措施減低。'),
  transfer('某學校打算宣傳新大樓只因「看起來很現代」，卻未說學生的學習有何不同。','哪項能補上範文重視的實際效果？',[
    '說明共享區如何增加跨班合作與日常交流',
    '只展示外牆圖片，完全不談學生如何活動',
    '把所有課室關上門，仍宣稱互動一定增加',
    '只比較不同桌椅價格，不問學習方式有無改變',
  ],['原文強調真正改變的是日常工作學習節奏。','外觀不是主要效果。','關門會減少合作機會。','價格與此問的學習效果無關。'],[6,11,13],'範文說設計不只是讓建築顯得現代，而是改變每日工作和學習。'),
  transfer('市議會同時問：為何公立服務中心改用共享空間？這算好事嗎？','哪種答法能像範文一樣回答兩問？',[
    '先談多用途需求，再評估合作好處及噪音對策',
    '只讚大樓外觀漂亮，完全不說流行的原因',
    '只列活動名稱，卻不判斷共享空間是否有益',
    '只說會有噪音，未分析任何可減低的辦法',
  ],['範文先交代成因，再權衡好處與可減低的缺點。','漏答為何使用。','漏答正負評價。','缺少完整權衡。'],[1,2,14,16],'題目兩問分別是成因與評價；原文結論用兩個 because 分別回應。'),
  transfer('一個社區中心有些活動要熱鬧合作，有些需要獨立沉思。','哪項最符合作者有條件的正面看法？',[
    '以可調整共享區配合安靜角落，使兩類活動並存',
    '只設單一喧鬧大廳，完全不照顧安靜活動',
    '只設永久封閉小房，讓所有小組不能相遇',
    '只追求現代外觀，不問空間能否配合活動',
  ],['作者支持妥善規劃的開放布局，也提出安靜區減少干擾。','忽略噪音與分心。','失去交流與彈性。','外觀不是作者標準。'],[2,5,14,16],'範文既談可重排共享區，也要求安靜區與規則處理干擾。'),
];
const revised=[
 {options:['用可重排的共享區，讓同一場地按活動改變用途','各活動使用固定房間，空置時再借給其他小組','為最大活動設專用大廳，其他時段暫時關閉','以移動屏風分隔空間，但限定每區只辦一種活動'],explanations:['可重排的空間回應一天中多種活動需求。','固定房間的借用可行，但仍較難快速適應用途變化。','專用大廳可能長時間閒置，未充分利用空間。','能移動的設施若只容一種用途，彈性仍未發揮。']},
 {options:['安排共享學習區，讓各班合作並方便教師走動','讓各班留在原課室，以視像會議完成跨班討論','集中各班材料在走廊，教師仍分別留在課室','只在展覽當天開放共享場地，平時不供合作'],explanations:['共享區配合跨班合作，也方便老師在小組間巡視。','視像會議可補充溝通，卻不符合現場共同展覽需要。','材料集中不等於學生和老師能一起工作。','只在展示日開放，未支援準備階段的跨班合作。']},
 {options:['讓工作區可調整，配合團隊隨項目重新組合','讓各組保留固定座位，再用線上群組討論新項目','每季更換部門名稱，但保留原本的工作區分隔','安排一次團隊會議，工作空間仍按舊小組劃分'],explanations:['可調整布局讓空間跟隨不斷重組的團隊。','線上討論有用，卻未回應現場重組的空間需求。','只更名不能讓團隊實際重新組合。','單次會議不足以支援每季變動的日常協作。']},
 {options:['重排部分空間，避免留下許多長期閒置房間','先建一間新大廳，再維持原有小房的空置狀況','把大型活動分成多場，但不評估閒置房間用途','讓空置小房作儲物室，再另租場地辦大型活動'],explanations:['重排使閒置空間可支援真正需要的活動。','新建大廳增加成本，卻沒有處理現有空置。','拆分活動可暫時應對，但未善用固定小房。','改作儲物與另租場地可能錯失現有空間效率。']},
 {options:['設合適共享區，讓同事可即時提問並交換想法','增加每週正式會議，維持日常分室工作方式','只把醫護放在相鄰房間，仍以會議處理短問','設一個留言平台，暫不改善員工當面交流'],explanations:['自然接觸讓短問能即時處理，不必等正式會議。','加會議未能解決每日簡短問題的等待。','相鄰房間若仍需預約會議，交流障礙未除。','留言有用，但不等同即時的面對面討論。']},
 {options:['讓小組適度共享空間，彼此觀察做法並交流','安排各組每月匯報，平日繼續完全分開工作','只整理工作手冊，讓員工按文字自行學習技巧','讓各組共用物資，但保持原本互不見面的安排'],explanations:['適度共享能增加自然觀察與交流的機會。','每月匯報可補充，但不能替代日常觀察。','手冊有用，卻較難展示同事如何實際服務讀者。','共用物資未必能促進對彼此做法的理解。']},
 {options:['保留共享區，再設安靜區、隔板及清晰使用規則','保留原有大廳，只請報告作者選擇不同工時','在每張桌放隔板，但電話仍可在任何區接聽','關閉共享區改用小房，暫不評估合作需要'],explanations:['分區、隔板與規則同時保留交流並降低干擾。','錯開工時可能有幫助，卻未改善日常噪音來源。','隔板有用，但仍需電話使用與安靜區規則。','關閉共享區會失去已證實的合作好處。']},
 {options:['說明共享區如何增加跨班合作與日常交流','先展示新外牆，再讓學生自行探索共享區用途','只列新建築的座位數，不說班級如何一起工作','請校方介紹設計概念，學生的學習安排維持原狀'],explanations:['作者重視空間如何改變實際學習與交流。','外觀展示無法說明學生的日常學習效果。','座位數不足以顯示跨班合作是否改善。','設計概念須連到學生實際使用方式。']},
 {options:['先談多用途需求，再評估合作好處及噪音對策','先談工作互動，再把採用原因留待結論一句','先列多用途活動，再只評論大樓外觀是否好看','只分析噪音缺點，假定共享空間因此不值得用'],explanations:['同時交代採用原因及有條件的正面評價。','互動可作好處，但仍需清楚回答流行原因。','外觀不是對布局成效的完整評價。','只看噪音忽略彈性與合作，也未提出對策。']},
 {options:['以可調整共享區配合安靜角落，使兩類活動並存','以大型共享區辦活動，需要沉思者自行找其他地方','按活動分時使用大廳，但不設任何固定安靜區域','只設安靜小房，熱鬧合作活動另向外租場地'],explanations:['彈性共享區與安靜角落回應兩類活動。','把安靜需求推給使用者，未妥善規劃噪音。','分時可減少衝突，卻無法支援同時發生的需求。','只用小房會失去共享區的合作與空間彈性。']}
];
revised.forEach((r,i)=>{transferTasks[i].options=r.options;transferTasks[i].explanations=r.explanations});
export default {key:'direct-question:31',meta:{topic:'辦公室與學校的開放式布局',summary:'開放式設計因靈活與互動而興起；妥善規劃可促進合作，噪音可用分區及規則減低。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
