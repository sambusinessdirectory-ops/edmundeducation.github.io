const E=[
'Historical dramas occupy an interesting place between education and entertainment.',
'Some people argue that any film drawn from real events must reproduce the past with total precision.',
'I disagree with this view because absolute accuracy is unrealistic in cinema and would often weaken the historical understanding that such films can create.',
'First, complete accuracy is almost impossible once history is turned into a two-hour narrative.',
'Historical events usually involve missing records, conflicting accounts, and countless minor details that no screenwriter can verify or include.',
'If a director had to show every conversation, journey and background figure exactly as it happened, the film would become painfully slow and almost impossible to follow.',
'For example, a film about a revolution may need to combine several minor politicians into one character or compress months of negotiation into a few scenes.',
'These changes do not betray history when they help viewers grasp its main forces without getting lost in its dust.',
'Second, films are valuable because they make the past emotionally accessible.',
'Many people first become interested in history through a gripping story, not through an archive or a textbook.',
'Dramatic dialogue, selective scenes and carefully shaped characters can make distant events feel human, especially for younger audiences who might otherwise see history as a dry list of dates.',
'A film that captures fear, courage and moral conflict may leave a stronger educational impression than one that merely records every factual detail.',
'Therefore, the standard should be historical responsibility rather than perfect reproduction: filmmakers should not reverse causes, whitewash crimes or invent outcomes, but they should be free to simplify the path by which the story is told.',
'In conclusion, I do not agree that historical films ought to be completely accurate.',
'Total accuracy is neither achievable nor desirable in a cinematic form.',
'What matters more is that such films preserve the essential truth of events while using the language of cinema to make history vivid and meaningful.',
];
const simple=[
'Films about history sit between teaching and entertainment.',
'Some people say every film based on true events must show the past exactly as it was.',
'I disagree because films cannot be perfectly accurate, and trying to be so may make it harder for people to understand history.',
'First, it is almost impossible to show every detail of history in a two-hour story.',
'Accounts of the past often have gaps and disagreements, plus too many small details for a writer to check or show.',
'If a director showed every talk, trip, and person exactly as they were, the film would be very slow and hard to follow.',
'For example, a film about a revolution may put several small political figures into one person or show months of talks in a few scenes.',
'Such changes do not misrepresent history if they help viewers understand its main causes without being lost in small details.',
'Second, films matter because they help people feel close to the past.',
'Many people become interested in history through an exciting story, not through old documents or a schoolbook.',
'Well-written talks, chosen scenes, and developed characters can make old events feel real to people, especially young viewers who might see history as only dates.',
'A film showing fear, bravery, and hard moral choices may teach people more deeply than a film listing every fact.',
'So film makers should respect historical truth, not copy every detail: they must not change causes, excuse crimes, or make up results, but may make the story simpler.',
'In short, I disagree that historical films must be perfectly accurate.',
'Perfect accuracy is not possible or helpful in a film.',
'It matters more that films keep the main truth of events and use film-making to make history clear and interesting.',
];
const vocabulary=[
[['Historical dramas','Films about history','歷史劇情片'],['occupy an interesting place','sit','處於一個位置'],['education','teaching','教育'],['entertainment','entertainment','娛樂']],
[['argue','say','認為'],['drawn from real events','based on true events','取材自真實事件'],['reproduce the past','show the past','重現過去'],['total precision','exactly as it was','完全精確']],
[['absolute accuracy','perfectly accurate','絕對準確'],['unrealistic in cinema','films cannot be perfectly accurate','在電影中不現實'],['weaken the historical understanding','make it harder for people to understand history','削弱歷史理解']],
[['complete accuracy','every detail','完全準確'],['almost impossible','almost impossible','幾乎不可能'],['two-hour narrative','two-hour story','兩小時敘事']],
[['missing records','gaps','缺失記錄'],['conflicting accounts','disagreements','互相矛盾說法'],['countless minor details','too many small details','無數細節'],['verify or include','check or show','核實或包含']],
[['background figure','person','背景人物'],['exactly as it happened','exactly as they were','完全按真實情況'],['painfully slow','very slow','極其沉悶'],['impossible to follow','hard to follow','難以理解']],
[['a revolution','a revolution','革命'],['combine several minor politicians into one character','put several small political figures into one person','合併次要人物'],['compress months of negotiation into a few scenes','show months of talks in a few scenes','濃縮談判']],
[['These changes','Such changes','這些改動'],['betray history','misrepresent history','背叛歷史'],['grasp its main forces','understand its main causes','掌握主要力量'],['lost in its dust','lost in small details','迷失於瑣碎細節']],
[['valuable','matter','有價值'],['the past emotionally accessible','people feel close to the past','情感上接近過去']],
[['become interested in history','become interested in history','對歷史產生興趣'],['gripping story','exciting story','扣人心弦故事'],['an archive','old documents','檔案'],['a textbook','a schoolbook','教科書']],
[['Dramatic dialogue','Well-written talks','富戲劇性對話'],['selective scenes','chosen scenes','選取場景'],['carefully shaped characters','developed characters','精心塑造人物'],['distant events feel human','old events feel real to people','遙遠事件更有人情味'],['dry list of dates','only dates','枯燥日期表']],
[['captures fear, courage and moral conflict','showing fear, bravery, and hard moral choices','呈現恐懼勇氣與道德衝突'],['stronger educational impression','teach people more deeply','更深教育印象'],['merely records every factual detail','listing every fact','只記錄細節']],
[['historical responsibility','respect historical truth','歷史責任'],['perfect reproduction','copy every detail','完美重現'],['reverse causes','change causes','顛倒因果'],['whitewash crimes','excuse crimes','美化罪行'],['invent outcomes','make up results','虛構結果'],['simplify the path by which the story is told','make the story simpler','簡化敘事方式']],
[['In conclusion','In short','總結'],['do not agree','disagree','不同意'],['ought to be completely accurate','must be perfectly accurate','應完全準確']],
[['Total accuracy','Perfect accuracy','完全準確'],['neither achievable nor desirable','not possible or helpful','既無法實現亦未必可取'],['cinematic form','a film','電影形式']],
[['What matters more','It matters more','更重要'],['preserve the essential truth of events','keep the main truth of events','保留事件核心真實'],['the language of cinema','film-making','電影語言'],['vivid and meaningful','clear and interesting','生動有意義']],
];
const chunkOverrides={0:['Historical dramas occupy an interesting place','between education and entertainment.'],8:['Second, films are valuable','because they make the past emotionally accessible.'],14:['Total accuracy is neither achievable','nor desirable in a cinematic form.']};
const simpleChunkOverrides={0:['Films about history sit','between teaching and entertainment.'],8:['Second, films matter','because they help people feel close to the past.'],14:['Perfect accuracy is not possible','or helpful in a film.']};
function makeStructure(i,slots,values,meaning,usage,distractors){
  const text=E[i],parts=[];let p=0;
  slots.forEach((slot,j)=>{const q=text.indexOf(slot,p);if(q<0)throw Error(`slot ${i} ${slot}`);if(q>p)parts.push([text.slice(p,q),'link','固定連接']);parts.push([slot,'slot',`可替換內容 ${j+1}`]);p=q+slot.length;});
  if(p<text.length)parts.push([text.slice(p),'link','固定連接']);
  if(!parts.some(x=>x[1]==='link'))throw Error(`no link ${i}`);
  let example=parts.map(x=>x[1]==='link'?x[0]:values.shift()).join('');
  return {example,answerReason:meaning,distractorReason:'比較語意連接與論證功能，不能只憑同一主題字眼判斷。',distractors,frame:{formula:parts.map(x=>x[1]==='link'?x[0]:`[${x[2]}]`).join(''),meaning,usage,parts}};
}
const structures=[
makeStructure(0,['Historical dramas','education and entertainment'],['Documentary podcasts','research and public storytelling'],'以「介乎兩種功能」建立題目定位。','引言需要先交代某媒介同時具有兩種功能時。',[1,2,3]),
makeStructure(1,['any film drawn from real events','reproduce the past with total precision'],['every documentary based on a real case','report every event without any omission'],'準確轉述題目的一方要求。','提出他人的絕對要求，再準備評估其可行性時。',[0,2,3]),
makeStructure(2,['absolute accuracy','cinema','the historical understanding that such films can create'],['perfect detail','short lessons','the broad understanding that those lessons can build'],'明示反對並並列不可行與損教育兩個理由。','反對過高標準時，指出執行困難與反效果。',[1,3,12]),
makeStructure(3,['complete accuracy','history','a two-hour narrative'],['every factual detail','a complex legal case','a ten-minute presentation'],'先用媒介篇幅限制說明完全準確難做到。','主張全面呈現不可行時，先交代載體的時間限制。',[2,4,5]),
makeStructure(4,['Historical events','missing records, conflicting accounts, and countless minor details','no screenwriter'],['Complex court cases','gaps in evidence, opposing accounts, and many small facts','no reporter'],'列資訊不足、互相矛盾與細節過多三種障礙。','解釋資料本身為何不足以支持全面重現時。',[3,5,6]),
makeStructure(5,['a director','every conversation, journey and background figure','the film','painfully slow and almost impossible to follow'],['a teacher','every side issue and minor exception','the lesson','too long and difficult to follow'],'用假設極端要求顯示對理解的損害。','反駁逐項涵蓋要求時，推演其時間與理解成本。',[3,4,7]),
makeStructure(6,['a film about a revolution','several minor politicians into one character','months of negotiation into a few scenes'],['a documentary about a trial','several minor witnesses into one account','weeks of hearings into two scenes'],'以合併角色和壓縮時間展示可接受的敘事簡化。','抽象地說「需要簡化」後，舉兩項具體編排選擇時。',[4,5,7]),
makeStructure(7,['These changes','history','viewers grasp its main forces','its dust'],['Those edits','the case','readers grasp its main issues','minor side details'],'以「保留主因」作簡化是否合理的判準。','已舉編排改動，需說明其是否歪曲核心意思時。',[5,6,12]),
makeStructure(8,['films','the past emotionally accessible'],['personal stories','distant events easier to feel'],'第二個理由轉向情感可及性。','分析一種媒介的價值，轉談情感上的理解時。',[9,10,11]),
makeStructure(9,['history','a gripping story','an archive or a textbook'],['science','a striking experiment','a long research report'],'以易接觸的入口對照正式資料。','要說明吸引人的敘事如何引發初步興趣時。',[8,10,11]),
makeStructure(10,['Dramatic dialogue, selective scenes and carefully shaped characters','distant events','younger audiences','history as a dry list of dates'],['Clear voices, focused examples and familiar people','complex issues','first-time learners','policy as a long list of figures'],'列三種呈現手法及特別受惠的觀眾。','說明敘事手法如何降低陌生議題的距離感時。',[8,9,11]),
makeStructure(11,['A film that captures fear, courage and moral conflict','one that merely records every factual detail'],['A lesson that captures difficult human choices','one that merely lists every technical term'],'對比情感呈現與純列事實的教學效果。','比較兩種表達方式對學習留下的印象時。',[8,10,12]),
makeStructure(12,['historical responsibility','perfect reproduction','filmmakers','reverse causes, whitewash crimes or invent outcomes','simplify the path by which the story is told'],['scientific responsibility','word-for-word reporting','science communicators','reverse findings, hide errors or invent results','simplify the order in which evidence is explained'],'劃清可簡化的敘事與不可改寫的核心事實。','在兩個極端之間定規範，須列出不可逾越的界線時。',[2,7,11]),
makeStructure(13,['historical films','completely accurate'],['science programmes','perfectly detailed'],'結論重申對絕對準確要求的反對。','結論直接回答「應否完全做到」的同意題時。',[2,14,15]),
makeStructure(14,['Total accuracy','a cinematic form'],['Perfect detail','a short public talk'],'用 neither...nor... 同時否定可行性與價值。','兩個獨立理由分別指向可行與值得時。',[3,13,15]),
makeStructure(15,['such films','the essential truth of events','the language of cinema','history vivid and meaningful'],['such lessons','the main facts of a case','the tools of storytelling','the case clear and relevant'],'以核心真實加有效呈現作最後標準。','結論需提出實用替代標準，兼顧準確與理解時。',[7,12,14]),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[Q('作者是否要求歷史電影逐項完全準確？',['不同意；應守住核心事實，但可簡化敘事','同意；所有對話都要逐字重現','沒有立場；只談電影票價','同意；任何省略都等於美化罪行'],'作者反對無法實現的絕對準確，支持歷史責任。'),{type:'multi',prompt:'找出作者兩段主體理由',detail:'選兩項，再按「確認」。',options:['兩小時電影無法核實並收納每個歷史細節','敘事手法可讓觀眾在情感上接近歷史','電影只能教觀眾記住所有日期','只要故事精彩便可任意改寫事實'],correct:[0,1],why:'一段談可行性；另一段談教育效果及底線。'}];
const route=[sequence('排好四段論證', [['引言 · 定位與立場','歷史電影兼有教育與娛樂；作者反對完全準確要求。'],['主體一 · 實際限制','資料缺漏與時間限制使電影需合併角色、壓縮事件。'],['主體二 · 教育價值','敘事令人感到過去鮮活；守住因果、罪行及結果底線。'],['結論 · 替代標準','保留核心真實，以電影語言使歷史有意義。']],'反對逐項重現 → 允許有責任的簡化。')];
const evidence=[Q('何種歷史資料問題讓「每一細節準確」難做到？',['記錄缺漏、說法衝突及細節過多','只有歷史人物不願被拍攝','所有檔案都永遠完整一致','每件事件都只涉及一個人'],'原文列三項資料障礙。'),Q('革命電影的例子如何簡化？',['合併次要人物並壓縮數月談判','顛倒革命原因並虛構結果','把所有人物刪除只留字幕','拒絕拍攝任何歷史內容'],'原文列兩個敘事改動，並未認可改寫核心事實。'),Q('甚麼可讓遙遠事件顯得有人情味？',['戲劇對話、選取場景及塑造人物','只有每一日期和檔案號碼','完全不使用人物與情節','把事件因果全部倒轉'],'原文列三種電影手法。'),Q('作者劃出的不可逾越底線是甚麼？',['不可顛倒因果、美化罪行或虛構結果','不可合併任何次要人物','不可使用戲劇對話','不可讓年輕觀眾感動'],'歷史責任保留核心真實。')];
const logic=[sequence('主體一：為何不能逐項重現？',[['媒介限制','兩小時敘事無法完整收納歷史。'],['資料限制','記錄缺失、說法矛盾、細節過多。'],['極端推演','逐項呈現會使電影沉悶難懂。'],['革命例子','合併次要人物、壓縮談判。'],['判準','讓觀眾明白主要力量，不能迷失細節。']],'有限資料與時間 → 有責任地簡化 → 理解主因。'),sequence('主體二：娛樂與教育如何並存？',[['情感入口','故事可先激發對歷史的興趣。'],['電影手法','對話、場景與人物使過去更貼近。'],['教育比較','恐懼、勇氣與道德衝突可留下深印象。'],['歷史責任','不改因果、罪行與結果；可簡化講述路徑。']],'故事帶入 → 情感理解 → 核心事實底線。')];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
T('科學紀錄片只有一小時，卻須解釋多年研究。','如何使用第一段的取捨原則？',['省次要步驟，但須保留主要發現及因果','可改主要結果，只要影片節奏夠快','必須逐一展示所有實驗室對話','應只講研究者心情，不講任何證據'],['時間有限仍守核心。','不准改結果。','逐項重現不可行。','不能棄事實。'],[3,4,5,7,12],'preserve main forces without changing outcomes'),
T('法庭節目把三名次要證人的說法合成一段旁白。','何時最接近文章容許的簡化？',['沒有改動案件關鍵因果，並幫觀眾理解','改寫罪行與判決，卻令情節更緊湊','捏造不存在的證人，並掩蓋矛盾','刪去所有反方證據，只留下主角說法'],['保留核心而壓縮。','改罪行結果越線。','捏造事實越線。','選擇性歪曲越線。'],[6,7,12],'combine minor figures while preserving essential truth'),
T('歷史節目逐秒重播每段旅程，學生卻看不出事件主因。','這指出甚麼問題？',['細節過量可妨礙觀眾掌握歷史主線','細節越多便必然更能理解事件','學生只要看日期就能知全部因果','歷史節目不能使用任何真實材料'],['過量細節損理解。','非必然。','日期不足。','仍需真實。'],[3,5,7],'grasp main forces without getting lost in dust'),
T('一部戰爭電影把侵略者寫成救援者。','文章的歷史責任如何判斷？',['美化罪行並顛倒因果，已越過底線','只要有吸引力，改寫罪行亦可接受','屬於壓縮時間，故無須核對事實','能讓年輕人感動，便不必守真實'],['whitewash/reverse 越線。','吸引力不足。','不是壓縮。','感動不免責。'],[12,15],'do not reverse causes or whitewash crimes'),
T('一位教師以具體人物故事引入艱深政策，學生因此願意閱讀資料。','這遷移了哪個論點？',['引人入勝的敘事可成為學習的入口','故事若好聽，資料核對便毫無必要','教學必須先列所有技術條文才有效','感情投入會令學生必定誤讀資料'],['故事可引發興趣。','仍須守核心。','非唯一入口。','不必然誤讀。'],[8,9,10],'first interested through a gripping story'),
T('劇情片用兩場戲概括半年的真實談判。','哪項判斷最切合原文？',['可接受的壓縮取決於有否保留關鍵過程','凡少於半年戲份便一律算虛構歷史','只要縮短片長，就可任意改變結局','電影必須逐日呈現全部談判內容'],['壓縮可行而要守真。','非一律錯。','不能改結果。','逐項重現不切實際。'],[6,7,12],'compress months into a few scenes'),
T('某影片列出每個準確日期，卻無法讓觀眾理解人們的處境。','第二段會提醒甚麼？',['真實細節之外，也要呈現人的感受與抉擇','只要日期準確，教育效果便必然最好','影片應捨棄所有可查證的歷史資料','情緒愈強烈，就愈可改寫事件結果'],['情感理解有教育價值。','不保證。','資料仍重要。','不可改結果。'],[8,9,10,11,12],'emotionally accessible; stronger educational impression'),
T('製片人遇到互相矛盾的回憶錄，還有大量缺失的文件。','哪一點首先使絕對準確難達成？',['史料有缺口和衝突，無法核實每一細節','所有回憶錄總會逐字記錄同一事件','文件缺失可靠任意捏造填補空白','只要片長夠長，史料就會自動完整'],['資料本身有限。','與情境相反。','捏造越界。','片長不能補資料。'],[3,4],'missing records and conflicting accounts'),
T('一段紀錄片透過角色的恐懼與勇氣解釋災難。','作者會如何評估教育效果？',['或比純列細節更能留下深刻學習印象','只要令人感動，便可以虛構事故原因','角色感受一出現，紀錄片就毫無真實','教育影片絕不可呈現任何道德衝突'],['may leave stronger impression。','仍須守因果。','不等於虛構。','衝突可助理解。'],[10,11,12],'fear, courage and moral conflict'),
T('有人要求電影像檔案庫般保存每段對話。','文章如何區分兩種媒介？',['電影有時間與敘事限制，須選取重要部分','電影和檔案庫都必須逐秒呈現全部細節','電影可自由顛倒因果來換取節奏','檔案庫只能靠演員對話保存歷史'],['兩小時載體要取捨。','形式不同。','不能改因果。','檔案不只對話。'],[3,4,5,9],'two-hour narrative; archive or textbook'),
T('一部影片省去某次會議，卻保留事件的原因、罪行和結果。','哪個標準適合審查？',['看省略是否保留核心真相並幫人理解','看所有會議是否逐分鐘照原樣重拍','看影片能否完全不使用任何敘事手法','看每名配角有否與原型穿同款衣服'],['核心真相與理解。','過高標準。','手法有用。','衣服非核心。'],[7,12,15],'essential truth rather than perfect reproduction'),
T('要概括全文對歷史電影的要求。','哪項最完整？',['不必完全重現細節，但須守住事件核心真實','只要情節感人，任何事實都可以被改寫','完全照搬每段對話，才可能教觀眾歷史','故事必須避開所有人物情緒與道德選擇'],['反對絕對準確，支持歷史責任。','越線。','不可行。','失去教育力。'],[2,3,7,8,11,12,13,14,15],'historical responsibility; essential truth'),
];
const plausibleAlternatives=[
  [['省次要步驟，主要發現可改成較易懂的版本','只保留研究結論，省去研究原因與證據','保留完整時間線，主要發現可留給觀眾猜'],['簡化呈現不能更改研究發現。','沒有原因與證據難理解核心真相。','時間線完整仍不能替代主要發現。']],
  [['合併證詞可行，案件關鍵矛盾亦可略去','合併證詞後，應改判決以配合節奏','只保留主角說法，讓觀眾更易理解'],['關鍵矛盾可能影響案件因果。','壓縮次要部分不授權改寫結果。','刪去另一方證據會扭曲真相。']],
  [['細節過量可妨礙理解，但日期宜逐一列出','細節完整較重要，主因可待觀眾自行推測','學生難理解主因，顯示故事應增加旁白'],['逐項列日期仍可能淹沒主線。','本文重視抓住事件的主要因果。','問題不只缺少旁白，而是取捨失衡。']],
  [['改寫侵略者動機，若感人仍可作歷史電影','顛倒角色可接受，前提是日期保持準確','美化侵略者有偏差，但可用片長限制解釋'],['感人敘事不能為顛倒罪行辯護。','準確日期無法挽救核心因果錯誤。','篇幅限制不是扭曲道德責任的理由。']],
  [['人物故事可吸引學習，資料閱讀則較次要','引人入勝的故事足夠，政策資料可留待考試','人物故事有趣，因此政策內容應大幅改寫'],['故事是入口，仍須回到資料與事實。','文章沒有把敘事當作完整替代。','有趣不能成為篡改政策事實的理由。']],
  [['壓縮時間可行，談判關鍵衝突也可略去','兩場戲足以引人入勝，結局便較不重要','若節奏清楚，談判過程可由角色補寫'],['關鍵過程不可因篇幅而被抹去。','結局屬事件核心，不能隨意處理。','以虛構過程填補可能改變因果。']],
  [['真實日期之外，可先增加畫面刺激感','情緒能留下印象，準確資料則可減少核實','要呈現人的感受，事件結果也可重編'],['文章重視理解人性，而非單純刺激。','情感敘事不能免除基本核查。','呈現情緒不授權改寫結果。']],
  [['史料有衝突，便可挑最戲劇化的版本','文件缺失可補寫細節，無須說明推測','回憶錄互相矛盾，片長便成唯一問題'],['衝突史料仍須審慎判讀。','缺口不能成為任意虛構的理由。','資料不一致本身已造成準確性困難。']],
  [['人物情緒可加深印象，事實原因可退居次要','角色恐懼有助理解，事故結果則可省略','情感敘事能教歷史，因此毋須核對證據'],['情緒不能代替對核心因果的忠實呈現。','結果也是災難歷史的重要部分。','教育效果須以核心真實為底線。']],
  [['電影篇幅有限，可省略關鍵原因以保節奏','電影須精選細節，檔案庫則只能寫旁白','電影與檔案庫不同，故可自由改動結果'],['選取重要部分不能省掉核心因果。','檔案庫並非只能用某種敘事形式。','媒介限制不授權改寫歷史結果。']],
  [['看省略能否令情節緊湊，核心原因可稍改','看觀眾是否投入，省略的會議則無關緊要','看畫面是否逼真，再決定因果是否準確'],['節奏不能凌駕於核心因果真實。','某會議是否關鍵，須按事件作用判斷。','畫面逼真不等於歷史因果準確。']],
  [['可改部分細節與原因，但應保留人物情緒','應重現對話原貌，核心因果可稍作調整','可用故事吸引人，查證則交給觀眾完成'],['原因屬核心真實，不可任意改。','逐字對話不比核心因果更重要。','製片者仍需負責任地守住事實。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:76',meta:{topic:'歷史電影應否完全準確',summary:'作者不同意歷史電影須逐項完全準確。史料缺失、說法衝突及電影篇幅使全面重現不可行；合併次要人物與壓縮時間可幫觀眾抓住主因。情感化敘事亦可激發興趣與理解，但不可顛倒因果、美化罪行或虛構結果。標準是保留核心真實，同時善用電影語言。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
