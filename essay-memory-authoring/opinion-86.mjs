import fs from 'node:fs';
const E=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['opinion:86'].map(x=>x.english);
const simple=[
'Children need to move often to stay healthy, but I strongly disagree that only parents should make this happen or that schools should stop teaching sport.',
'Schools should keep sport lessons because they give all children a fair chance to exercise and help children grow in other ways too.',
'First, if only parents were responsible for exercise, children would have very different chances.',
'Some parents have time, money, and knowledge to take children to parks, sports groups, or swimming classes, but many parents do not.',
'Other parents may work for many hours, live in places that are not safe, or not know how much children need to move.',
'If schools stop teaching sport, children who already have fewer chances outside school will lose the most.',
'But sport lessons that all children must attend give each child a regular chance to move, whatever their family is like.',
'For example, a child whose family has little money may not join a private football school, but PE at school can still teach running, working together, and basic health.',
'So schools provide a backup, not a replacement for parents.',
'Also, sport lessons do not waste school time; they can help children use study time better.',
'Children are not machines that can sit at desks all day and learn without a break.',
'Moving helps children pay attention, feel less stressed, and learn rules, working together, and how to keep trying after difficulty.',
'These skills matter as much as test scores because schools should prepare children for life, not only for tests.',
'For example, a basketball class can teach students to follow rules, accept losing, and work with others for one goal.',
'These useful skills are harder to learn from books alone.',
'In short, I strongly disagree that schools should stop teaching sport.',
'Parents do help shape children’s habits, but schools must also help all students exercise often and develop in many ways.',
];
const vocabulary=[
[['Regular physical activity','Children need to move often','定期體能活動'],['essential to children’s health','stay healthy','對健康重要'],['completely disagree','strongly disagree','完全不同意'],['parental duty','only parents','父母責任'],['removed from the school timetable','schools should stop teaching sport','從課表移除']],
[['continue to provide sports lessons','keep sport lessons','繼續體育課'],['equal access to exercise','fair chance to exercise','平等運動機會'],['wider development','grow in other ways too','全面發展']],
[['leaving physical exercise entirely to parents','only parents were responsible for exercise','完全交予父母'],['serious inequalities','very different chances','嚴重不平等']],
[['time, money and knowledge','time, money, and knowledge','時間金錢知識'],['sports clubs','sports groups','體育俱樂部'],['swimming lessons','swimming classes','游泳課']],
[['work long hours','work for many hours','工作長時間'],['unsafe neighbourhoods','places that are not safe','不安全社區'],['underestimate how much movement children need','not know how much children need to move','低估活動需要']],
[['abandon physical education','stop teaching sport','放棄體育教育'],['fewer opportunities','fewer chances','較少機會'],['first to lose out','lose the most','最先受損']],
[['By contrast','But','相比之下'],['compulsory sports lessons','sport lessons that all children must attend','必修體育課'],['every child','each child','每個孩子'],['regardless of family background','whatever their family is like','不論家庭背景']],
[['low-income household','family has little money','低收入家庭'],['private football academy','private football school','私人足球學院'],['school PE','PE at school','學校體育課'],['basic fitness','basic health','基本體能']],
[['In this sense','So','從此意義'],['safety net','backup','安全網'],['not a substitute for parents','not a replacement for parents','非父母替代']],
[['Moreover','Also','此外'],['not a waste of valuable school time','do not waste school time','非浪費學校時間'],['academic time more effective','use study time better','學習時間更有效']],
[['not machines','not machines','不是機器'],['absorb information','learn','吸收資訊'],['without rest','without a break','沒有休息']],
[['Physical activity','Moving','體能活動'],['improves concentration','helps children pay attention','提升專注'],['reduces stress','feel less stressed','減輕壓力'],['discipline, cooperation and resilience','rules, working together, and how to keep trying after difficulty','紀律合作抗逆']],
[['These qualities','These skills','這些素質'],['exam results','test scores','考試成績'],['prepare young people for life','prepare children for life','為人生準備'],['not only for tests','not only for tests','不只為考試']],
[['For instance','For example','例如'],['basketball lesson','basketball class','籃球課'],['pupils','students','學生'],['handle defeat','accept losing','面對失敗'],['shared goal','one goal','共同目標']],
[['practical lessons','useful skills','實用課題'],['cannot be learned as easily from textbooks','harder to learn from books alone','難從課本學到']],
[['In conclusion','In short','總結'],['completely disagree','strongly disagree','完全不同意'],['remove sports from the curriculum','stop teaching sport','課程移除體育']],
[['certainly influence','do help shape','固然影響'],['vital responsibility','must also help','重要責任'],['guarantee regular exercise for all pupils','help all students exercise often','確保全體定期運動'],['educate the whole child','develop in many ways','全面教育']],
];
const chunkOverrides={8:['In this sense, schools act as a safety net,','not a substitute for parents.'],10:['Children are not machines','that can sit at desks all day and absorb information without rest.'],14:['These are practical lessons','that cannot be learned as easily from textbooks.']};
const simpleChunkOverrides={8:['So schools provide a backup,','not a replacement for parents.'],10:['Children are not machines','that can sit at desks all day and learn without a break.'],14:['These useful skills are harder','to learn from books alone.']};
function makeStructure(i,slots,replacements,meaning,usage,distractors){const text=E[i],parts=[];let p=0;slots.forEach((slot,j)=>{const q=text.indexOf(slot,p);if(q<0)throw Error(`slot ${i} ${slot}`);if(q>p)parts.push([text.slice(p,q),'link','固定連接']);parts.push([slot,'slot',`可換內容 ${j+1}`]);p=q+slot.length;});if(p<text.length)parts.push([text.slice(p),'link','固定連接']);let example=parts.map(x=>x[1]==='link'?x[0]:replacements.shift()).join('');return{example,answerReason:meaning,distractorReason:'分辨平等機會、共同責任及學習效益。',distractors,frame:{formula:parts.map(x=>x[1]==='link'?x[0]:`[${x[2]}]`).join(''),meaning,usage,parts}};}
const structures=[
makeStructure(0,['Regular physical activity','children’s health','a parental duty','the school timetable'],['Daily reading','children’s learning','a family duty','the school timetable'],'先承認活動重要，再反對完全交家長或從校內移除。','題目要求把某活動全交家庭時，直接表明反對兩項後果。',[1,2,8]),
makeStructure(1,['sports lessons','equal access to exercise','children’s wider development'],['music lessons','equal access to creative practice','children’s wider development'],'預告保留課程的公平及全面發展兩理由。','支持某課程時，同時說明普及機會與更廣能力。',[0,2,9]),
makeStructure(2,['physical exercise','parents','serious inequalities'],['digital learning','families','serious inequalities'],'由家庭資源差異推到機會不平等。','反對只靠家庭提供必要學習或健康機會時。',[3,5,6]),
makeStructure(3,['Some parents','time, money and knowledge','parks, sports clubs or swimming lessons'],['Some families','time, money and knowledge','libraries, music groups or art classes'],'先承認部分家庭有資源，再指出並非人人如此。','談家庭差異時，不把所有父母寫成同一情況。',[2,4,5]),
makeStructure(4,['Others','work long hours, live in unsafe neighbourhoods or simply underestimate how much movement children need'],['Other families','work long hours, lack nearby services or simply underestimate how much music practice children need'],'列出時間、環境與認知三類障礙。','已說家庭資源不均，進一步列具體限制時。',[2,3,5]),
makeStructure(5,['schools','physical education','the children','fewer opportunities outside school'],['schools','music education','the pupils','fewer opportunities outside school'],'取消普及課程時，原已缺機會者首先受損。','評估刪除公共服務時，先看誰最依賴它。',[2,3,6]),
makeStructure(6,['compulsory sports lessons','every child','family background'],['required dance lessons','every pupil','family background'],'用普及課程回答家庭資源差異。','已證明家庭機會不均，要說明學校可提供共同基線時。',[2,5,7]),
makeStructure(7,['a child from a low-income household','a private football academy','school PE','running, teamwork and basic fitness'],['a pupil from a low-income household','a private music academy','school music','rhythm, teamwork and basic listening skills'],'用低收入例子顯示公共課程的補位作用。','說平等機會後，以付費替代與免費校內機會對照時。',[5,6,8]),
makeStructure(8,['schools','a safety net','parents'],['public libraries','a safety net','families'],'界定學校補位而非取代家庭。','主張公共機構協助時，避免說原有照顧者無責任。',[6,7,16]),
makeStructure(9,['sports lessons','valuable school time','academic time'],['library periods','valuable school time','academic time'],'反駁「浪費時間」，提出活動可改善其餘學習。','題目說非考試課程佔時間，須說明互補效益時。',[10,11,12]),
makeStructure(10,['Children','machines','desks','information'],['Young learners','machines','desks','facts'],'用非機器比喻反駁無休息地學習。','有人假設學習時間越長便越有效時。',[9,11,12]),
makeStructure(11,['Physical activity','concentration','stress','discipline, cooperation and resilience'],['Creative play','attention','tension','patience, cooperation and resilience'],'列身心與品格多方面效益。','說某活動有教育價值，需具體列出能力而不只說有益時。',[9,10,12]),
makeStructure(12,['These qualities','exam results','education','young people','life','tests'],['Those skills','test scores','schooling','children','life','tests'],'把學校目標由考試延伸到人生。','比較非考試技能與分數的重要性時。',[9,11,13]),
makeStructure(13,['a basketball lesson','pupils','follow rules, handle defeat and work with others towards a shared goal'],['a school theatre project','students','follow rules, handle setbacks and work with others towards a shared goal'],'例子具體呈現規則、挫折與共同目標。','已列能力，需用課堂情境示範如何學到時。',[11,12,14]),
makeStructure(14,['These','textbooks'],['Those','textbooks'],'指出實踐中的能力較難只靠課本獲得。','以具體實踐例子後，強調實做與閱讀的差別時。',[11,13,15]),
makeStructure(15,['schools','sports'],['schools','creative arts'],'結論直接反對從課程移除活動。','討論是否刪除課程時，結尾必須直接回答。',[0,14,16]),
makeStructure(16,['Parents','children’s habits','schools','regular exercise for all pupils','the whole child'],['Families','reading habits','schools','regular reading for all pupils','the whole child'],'結論保留家庭作用，同時確認學校普及責任。','兩種角色可共同承擔時，須清楚界定各自作用。',[1,8,15]),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'按原文順序逐一點選。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[Q('作者支持把體育課從學校課程移除嗎？',['完全反對；學校保障普及機會並支持全面發展','完全同意；只有父母須負責孩子運動','沒有立場；只列幾種球類','認為學校體育可完全取代父母作用'],'作者反對只交父母，也反對移除體育課。'),{type:'multi',prompt:'選出兩段主體的不同理由',detail:'選兩項，再按「確認」。',options:['家庭資源不均，校內體育提供每個孩子共同機會','運動可改善專注並教紀律、合作和抗逆力','運動保證所有學生立即在考試得滿分','所有父母都有同等時間與付費資源'],correct:[0,1],why:'一段是平等機會，一段是學習及人生技能。'}];
const route=[sequence('排好全文四段',[['引言 · 共同責任','兒童需要活動，學校體育不應只交家長或刪除。'],['主體一 · 平等機會','家庭條件不同；必修體育作普及安全網。'],['主體二 · 全面教育','運動支持專注與紀律合作，令學習時間更有效。'],['結論 · 家校並行','家長有影響，學校仍須保障運動和全面發展。']],'家庭差異 → 校內基線 → 學習和生活能力 → 家校並行。')];
const evidence=[Q('部分父母為何難以提供校外運動？',['工時長、社區不安全或低估活動需求','因所有公園都只在學校內','因孩子上體育課便不可在家運動','因運動只在私人學院才合法'],'原文列時間、環境、認知障礙。'),Q('低收入家庭例子怎樣支持校內體育？',['未能付費參加私人學院，仍可在學校學基礎活動','只要家境不富裕就必定不能跑步','所有私人足球課程都不准收費','學校體育只容許高收入學生參加'],'校內PE作共同機會。'),Q('運動可能提升哪些能力？',['專注、減壓、紀律、合作及抗逆力','只增加課本頁數與考卷數量','只影響運動服的顏色','只教學生背下比賽年份'],'原文列身心與品格效益。'),Q('籃球課例子教學生甚麼？',['守規則、面對失敗及朝共同目標合作','只要得分就不用尊重規則','只有課本可以教任何人際技能','只要跑得快便必然考得好'],'原文具體列三項。')];
const logic=[sequence('主體一：校內體育如何保障公平？',[['家庭差異','有些家庭有時間金錢，有些因工時環境受限。'],['移除後果','原本校外機會少的孩子先受損。'],['公共基線','必修體育給每個孩子定期活動。'],['低收入例子','不能上私人體育課，仍能在校接觸基本體能。'],['角色界線','學校是安全網，不是父母替代。']],'家庭資源不均 → 校內共同機會 → 家校分工。'),sequence('主體二：體育為何不浪費學習時間？',[['反轉主張','體育可令學術時間更有效。'],['非機器比喻','孩子不能整天坐着無休吸收資訊。'],['能力清單','專注、減壓、紀律、合作及抗逆力。'],['教育目標','不只為考試，也為人生。'],['籃球例子','守規則、承受失敗、共同達成目標。']],'休息和運動 → 更能學習 → 可遷移的人生技能。')];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
T('某學校想取消音樂課，讓家庭自行安排付費課程。','可遷移哪項公平論點？',['家庭資源不同，校內課可保障共同接觸機會','所有家庭必然有同等金錢與時間安排','只要有校外課，學校課便必然完全無用','只有能負擔私人課程者才應接觸音樂'],['學校提供基線。','資源不等。','仍有用。','應平等。'],[2,3,4,5,6,7],'equal access regardless of family background'),
T('家長工時長，孩子無法常去私人運動中心。','體育課在此扮演甚麼角色？',['提供固定活動機會，補足家庭資源限制','完全取代家長對孩子生活習慣的影響','保證孩子從此不需任何校外活動','只為能付費的孩子提供專業訓練'],['safety net not substitute。','家長仍有作用。','非完全取代。','應普及。'],[3,4,5,6,8],'schools act as safety net'),
T('學生整天坐着上課，下午難以專心。','文章如何看待運動時間？',['運動或助專注，並令其後學習更有效','少上一分鐘書桌課就必定降低所有成績','只要運動過，就毋須再學任何學科知識','專注只由考試題數決定，與休息無關'],['PE supports academic time。','無必然。','仍需學科。','休息有作用。'],[9,10,11],'sports make academic time more effective'),
T('某生無法加入私人足球學院，但學校安排免費體育課。','最直接的好處是甚麼？',['仍可學跑步、合作和基本體能，機會較公平','不必讀任何其他科目，便可直接升學','學校體育必然讓每個學生變成職業球員','只有私人學院才能教孩子團體合作'],['原文低收入例子。','仍有學科。','非職業保證。','校內可教。'],[6,7],'school PE introduces running, teamwork and fitness'),
T('孩子在籃球課學會守規則、接受落敗並與人共事。','這回應哪項批評？',['體育有可遷移人生技能，並非浪費校內時間','籃球只能教得分，不可能教任何品格','只要學會守規則，就保證每次考試滿分','這些能力只能從課本上的文字定義學會'],['life skills beyond tests。','例子相反。','非保證。','可由實做學。'],[11,12,13,14],'rules, defeat, shared goal'),
T('有人說父母也可帶孩子運動，所以學校毋須體育課。','作者會作哪項區分？',['家長能影響習慣，學校仍須保障人人有機會','家長能帶孩子，便證明每個家庭條件相同','學校一有體育課，父母就不再有任何責任','只要學校有課，孩子便永遠不需休息'],['共同責任。','家庭不等。','父母仍影響。','仍需休息。'],[3,4,6,8,16],'parents influence; schools guarantee'),
T('某學校認為休息與運動都會佔用考試準備時間。','文章的反轉推論是甚麼？',['適量活動可改善專注，讓學習時間更有效','只要多坐書桌，所有孩子都不再疲倦','不運動便能自動學會紀律與合作','體育只會教體能，完全不影響情緒'],['非機器與專注機制。','需要休息。','運動教習慣。','可減壓。'],[9,10,11,12],'not waste time; academic time more effective'),
T('公立圖書館提供所有學生可用的閱讀資源。','這與校內體育哪點相似？',['公共設施能彌補家庭資源差異，提供基線','家庭差異一存在，公共服務便完全無效','有圖書館就代表家長毋須與孩子閱讀','只有家庭富裕者才可使用公共圖書館'],['普及機會類比。','正是緩解。','家長仍有作用。','應人人可用。'],[2,5,6,8],'common access regardless of background'),
T('學生只在課本讀過合作定義，從未在活動中處理輸贏。','籃球例子補上甚麼？',['透過實作練守規則、面對失敗與共同目標','只要背熟定義，便不可能與同學爭執','課本知識全無價值，所以必須全部刪去','體育活動不能讓學生學到任何實用技能'],['practical lessons。','背誦不足。','未否定課本。','有技能。'],[13,14],'practical lessons not learned as easily from textbooks'),
T('某家庭無安全遊樂場，孩子只能在校內參加定期體育。','若刪掉體育，誰先受損？',['校外運動機會少的孩子最先失去保障','所有擁有私人運動設施的家庭最先受損','只會影響學校運動器材的標籤設計','絕不會影響任何學生的活動機會'],['依賴公共基線者。','已有其他機會。','非標籤。','會失機會。'],[4,5,6,7],'children with fewer outside opportunities lose first'),
T('教育政策只看考試分數，忽略耐性與共同責任。','文章會指出甚麼？',['教育還須為人生準備，非只為測驗準備','考試分數一重要，人生技能便全部無用','耐性與責任只能在家庭中習得','只要運動就不用再進行任何考試'],['whole child。','兩者均重要。','學校可教。','考試仍可有。'],[11,12,13,16],'prepare for life, not only tests'),
T('要概括作者對學校體育與父母責任的立場。','哪項最完整？',['反對刪體育；家校並行保障普及與全面發展','贊成刪除體育；家長獨力承擔所有學生運動','反對家長介入；只有學校可以影響孩子習慣','沒有立場；只描述私人足球課程費用'],['立場及家校分工。','相反。','父母有作用。','立場明確。'],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],'equal access; wider development; parents influence'),
];
const plausibleAlternatives=[
  [['家庭資源不同，音樂課可先交由社區機構','校內課保障機會，私人課則可取代基礎課','家庭可安排課程，學校只須提供報名資訊'],['社區資源同樣未必人人能使用。','選修私人課不能取代共同接觸機會。','資訊不能消除時間與費用障礙。']],
  [['提供活動機會，家長便可不再關心運動','家庭難安排運動，校內課可改成課外報名','體育課能增加活動，仍只宜給運動人才'],['學校補足機會，不是取代家庭作用。','課外報名仍可能受家庭資源限制。','普及體育不是只服務少數運動員。']],
  [['運動可令學生放鬆，但應少排入課表','運動能提升體能，學習專注另由考試決定','坐着太久會疲倦，因此只需增加書桌練習'],['文章指出適量活動可反過來幫助學習。','運動與專注可有關聯，不只提升體能。','更多久坐未必改善下午的專注。']],
  [['仍可參加活動，專業合作訓練須靠私人學院','體育課提供公平機會，基本體能則由家長教','免費校內課有用，卻只適合已有球技者'],['校內體育也能練基本合作。','學校可共同提供運動與體能基礎。','公平機會不應限於已有技能者。']],
  [['體育可教守規則，但抗逆能力仍較難練','籃球能教得分，合作則主要留給課本','學會接受落敗有益，與校內教育目標無關'],['面對落敗正可練抗逆與耐性。','團隊運動也能提供實際合作機會。','這些能力屬於全面教育的一部分。']],
  [['家長能影響習慣，校內體育可變為自選課','家庭可帶孩子運動，學校只須照顧體能較弱者','學校能保障機會，因此父母責任可略去'],['自選課未必保障所有學生接觸。','校內體育應給每位孩子共同基線。','學校與父母作用可以並行。']],
  [['適量活動有益，考前仍應取消日常運動','多坐書桌可增加時間，疲倦則由家庭處理','運動能減壓，專注提升主要看題目難度'],['文章強調活動可讓學習時間更有效。','更多時間不一定等於更有效學習。','情境談久坐與休息對專注的影響。']],
  [['公共設施提供基線，家庭便不需參與','圖書館能擴大使用，資源差異仍不必考慮','公共服務宜優先服務已有私人資源者'],['公共基線不會取代家庭支持。','設立公共設施正為緩和資源不均。','這會加劇而非彌補機會差異。']],
  [['透過實作練守規則，課本便可暫時省去','處理輸贏有益，合作仍只須背誦定義','籃球能練共同目標，失敗經驗則宜避免'],['實作補充課本，無須否定文字學習。','合作要在互動中練習。','面對失敗也是例子中的學習。']],
  [['校外機會少的孩子受損，家庭可再自行補足','每位孩子受影響相同，因校內課本來一致','家庭有運動資源者較受損，因選擇較多'],['缺安全場地者未必能自行補回。','失去共同基線對資源較少者影響較大。','選擇較多者仍有其他運動途徑。']],
  [['教育也為人生準備，體育只需留作課外活動','考試重要，耐性與責任可待畢業後再學','人生技能重要，學科課程便可相應減少'],['文章主張保留校內體育作全面教育。','人生能力不宜等到離校才培養。','作者沒有要求以人生技能取代學科。']],
  [['反對刪體育；父母角色可由學校接手','支持家校並行；體育課可改為家庭自選','反對刪體育；校內課主要培訓運動人才'],['學校是安全網，不是父母替代。','自選課難保障普及接觸。','校內體育須服務所有孩子。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:86',meta:{topic:'體育課應否只交由父母負責',summary:'作者完全反對把兒童運動只視為父母責任或從學校移除體育課。家庭時間、金錢、安全環境和知識不均，必修體育給每個孩子共同機會，學校是安全網而非父母替代。體育亦可改善專注、減壓，教授紀律、合作與抗逆；學校要為人生及考試共同準備。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
