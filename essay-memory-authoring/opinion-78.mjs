import fs from 'node:fs';
const E=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['opinion:78'].map(x=>x.english);
const simple=[
'As phones, streaming services, and short web articles grow, some people say books matter less for learning and relaxing.',
'I strongly disagree with this idea.',
'Even though people now read in different ways, paper books and e-books are still very useful for trustworthy facts and enjoyable free time.',
'First, books are still important because they explain information deeply and in a clear order.',
'Many online posts are short, broken into small pieces, and written to be read quickly, but books usually explain a point carefully and show how facts fit together.',
'This matters because separate facts rarely give real understanding; readers understand more when they learn a subject from the basics to its wider effects.',
'For example, someone learning about money, history, or health may use short videos for quick advice, but a good book can explain why that advice works.',
'So books do more than give answers; they help people make good decisions.',
'Books are also still useful for enjoyment.',
'In fact, reading slowly is one reason books are valuable.',
'A novel lets readers slowly enter a story, picture people for themselves, and feel emotions without constant ads, phone messages, or computer suggestions.',
'This kind of fun is quieter than a film or game, but it can be just as strong.',
'For example, many people travelling to work read mysteries, love stories, or life stories on trains because reading gives them quiet time in their own minds, not because they have no other digital choices.',
'So books give people an experience that newer media often cannot provide in the same way.',
'In short, I disagree that books matter less now.',
'Technology has changed how people get facts and fun, but books have not lost their basic value.',
'Books still matter because they support deep thought, attention, and imagination, and people need these qualities more, not less.',
];
const vocabulary=[
[['With the rise of','As','隨著興起'],['streaming platforms','streaming services','串流平台'],['less central','matter less','較不重要'],['learn and relax','learning and relaxing','學習放鬆']],
[['completely disagree','strongly disagree','完全不同意'],['this view','this idea','這觀點']],
[['Although','Even though','雖然'],['the form of reading has changed','people now read in different ways','閱讀形式已變'],['printed or digital','paper books and e-books','紙本或電子'],['reliable knowledge','trustworthy facts','可靠知識'],['meaningful enjoyment','enjoyable free time','有意義娛樂']],
[['essential role','important','重要角色'],['deep and structured information','information deeply and in a clear order','深入有系統資訊']],
[['brief, fragmented','short, broken into small pieces','簡短零散'],['written for speed','written to be read quickly','為求快速'],['develop an argument carefully','explain a point carefully','仔細展開論點'],['place facts in context','show how facts fit together','把事實置於背景']],
[['real understanding','real understanding','真正理解'],['isolated pieces of information','separate facts','孤立資訊'],['foundations','basics','基礎'],['wider implications','wider effects','廣泛影響']],
[['personal finance','money','個人理財'],['quick tips','quick advice','快速提示'],['well-written book','good book','寫得好的書'],['principles behind those tips','why that advice works','提示背後原則']],
[['In this sense','So','從此意義'],['do not merely give answers','do more than give answers','不只給答案'],['build judgement','help people make good decisions','培養判斷力']],
[['far from obsolete','still useful','遠未過時'],['a form of entertainment','enjoyment','娛樂形式']],
[['In fact','In fact','事實上'],['slower pace','reading slowly','較慢節奏'],['precisely what makes them valuable','one reason books are valuable','正是其價值']],
[['A novel','A novel','小說'],['enter a world gradually','slowly enter a story','逐漸進入世界'],['imagine characters in their own way','picture people for themselves','自行想像人物'],['constant noise','constant','持續干擾'],['notifications and algorithms','phone messages, or computer suggestions','通知及演算法']],
[['quieter','quieter','較安靜'],['just as powerful','just as strong','同樣有力量']],
[['commuters','people travelling to work','通勤者'],['crime stories, romances or autobiographies','mysteries, love stories, or life stories','犯罪愛情故事或自傳'],['digital alternatives','other digital choices','數碼選擇'],['private mental space','quiet time in their own minds','私人精神空間']],
[['therefore','So','因此'],['modern media','newer media','現代媒體'],['struggles to replace','cannot provide in the same way','難以取代']],
[['In conclusion','In short','總結'],['do not agree','disagree','不同意'],['losing importance','matter less now','失去重要性']],
[['access information and entertainment','get facts and fun','獲取資訊娛樂'],['has not reduced','have not lost','未削弱'],['fundamental value','basic value','根本價值']],
[['encourage depth, concentration and imagination','support deep thought, attention, and imagination','鼓勵深度專注想像'],['more necessary, not less','need these qualities more, not less','更加必要']],
];
const chunkOverrides={1:['I completely disagree','with this view.'],7:['In this sense, books do not merely give answers;','they build judgement.'],8:['Books are also far from obsolete','as a form of entertainment.'],9:['In fact, their slower pace','is precisely what makes them valuable.'],14:['In conclusion, I do not agree','that books are losing importance.']};
const simpleChunkOverrides={1:['I strongly disagree','with this idea.'],7:['So books do more than give answers;','they help people make good decisions.'],8:['Books are also still useful','for enjoyment.'],9:['In fact, reading slowly','is one reason books are valuable.'],14:['In short, I disagree','that books matter less now.']};
function makeStructure(i,slots,replacements,meaning,usage,distractors){const text=E[i],parts=[];let p=0;slots.forEach((slot,j)=>{const q=text.indexOf(slot,p);if(q<0)throw Error(`slot ${i} ${slot}`);if(q>p)parts.push([text.slice(p,q),'link','固定連接']);parts.push([slot,'slot',`可換內容 ${j+1}`]);p=q+slot.length;});if(p<text.length)parts.push([text.slice(p),'link','固定連接']);let example=parts.map(x=>x[1]==='link'?x[0]:replacements.shift()).join('');return{example,answerReason:meaning,distractorReason:'核對讓步、比較與因果的實際作用。',distractors,frame:{formula:parts.map(x=>x[1]==='link'?x[0]:`[${x[2]}]`).join(''),meaning,usage,parts}};}
const structures=[
makeStructure(0,['smartphones, streaming platforms and short online articles','books','learn and relax'],['social feeds, podcasts and mobile apps','newspapers','find news and unwind'],'先交代新媒介，再引入舊媒介式微的主張。','討論新技術是否令既有媒介失去價值時。',[1,2,3]),
makeStructure(1,['this view'],['that claim'],'用短句明確表態，下一句補理由。','對同意程度有清楚立場，需要先直接回答題目時。',[0,2,14]),
makeStructure(2,['the form of reading','books','printed or digital','reliable knowledge and meaningful enjoyment'],['the way people listen','podcasts','live or recorded','careful explanation and enjoyable stories'],'承認形式變動，反駁核心價值流失。','對方把使用形式改變等同價值消失時。',[0,1,15]),
makeStructure(3,['books','deep and structured information'],['long-form courses','careful and connected explanations'],'首段理由點明資訊深度與結構。','解釋某媒介為何比碎片內容更適合深入學習時。',[4,5,7]),
makeStructure(4,['many online posts','brief, fragmented and written for speed','books','develop an argument carefully and place facts in context'],['many short clips','brief, fragmented and made for quick viewing','long lessons','build an explanation carefully and connect facts to causes'],'用兩類媒介的資訊組織作比較。','要證明深度優勢，先比較呈現方式時。',[3,5,6]),
makeStructure(5,['real understanding','isolated pieces of information','readers','a subject','its foundations','its wider implications'],['sound judgement','scattered claims','learners','a problem','its basic facts','its practical effects'],'說明由基礎到影響的連貫學習如何形成理解。','從資料形式轉到它對理解能力的作用時。',[3,4,7]),
makeStructure(6,['personal finance, history or health','short videos','quick tips','a well-written book','the principles behind those tips'],['climate change, nutrition or law','brief posts','quick facts','a careful guide','the reasons behind those facts'],'承認短媒介有用，再指出長篇解釋原理。','比較即時提示與深入原理時，避免否定前者所有價值。',[4,5,7]),
makeStructure(7,['books','answers','judgement'],['careful lessons','facts','independent thinking'],'以「不只給答案」收束深度學習成果。','段末把資訊獲得提升到判斷能力時。',[3,5,6]),
makeStructure(8,['Books','entertainment'],['Radio dramas','enjoyment'],'轉入第二理由，直接回應娛樂價值。','前段談資訊功能，下一段要轉談休閒功能時。',[9,10,11]),
makeStructure(9,['their slower pace','them'],['their quiet format','them'],'把被視為缺點的慢節奏轉為優點。','對方嫌媒介較慢，需解釋慢帶來的獨特價值時。',[8,10,11]),
makeStructure(10,['A novel','a world','characters','advertisements, notifications and algorithms'],['A long audio story','a setting','the speakers','pop-ups, alerts and automated feeds'],'列出沉浸閱讀的三種體驗與干擾較少的條件。','要具體描述一種安靜媒介的沉浸感時。',[8,9,12]),
makeStructure(11,['This kind of entertainment','a film or a game'],['This kind of learning','a fast video or a quiz'],'承認體驗較安靜，但否定因此較弱。','比較不同媒介時，避免把安靜等同缺乏力量。',[8,10,12]),
makeStructure(12,['commuters','crime stories, romances or autobiographies','trains','digital alternatives','reading gives them a private mental space'],['students','poems, essays or biographies','buses','video alternatives','quiet reading gives them room to think'],'例子區分主動選擇與缺乏數碼替代品。','用真實生活例子說明人們為何自願選擇較慢媒介時。',[9,10,11]),
makeStructure(13,['Books','an experience','modern media'],['Quiet libraries','a space for reflection','fast online services'],'段末推論獨特體驗較難由新媒介取代。','已示例體驗後，要總結不可替代之處時。',[10,11,12]),
makeStructure(14,['books','losing importance'],['libraries','becoming irrelevant'],'結論直接否定式微主張。','全文分兩個功能反駁某事物失去重要性時。',[1,15,16]),
makeStructure(15,['Technology','the way people access information and entertainment','the fundamental value of books'],['Digital tools','the way people study and communicate','the fundamental value of thoughtful learning'],'區分取得方式改變與核心價值降低。','對方由新技術普及推斷舊事物沒價值時。',[2,14,16]),
makeStructure(16,['depth, concentration and imagination','qualities'],['reflection, patience and curiosity','skills'],'以日益需要的能力反證書本仍重要。','結尾要把媒介價值連到未來更需要的能力時。',[3,7,15]),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依原文推進次序，逐一點選。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[Q('作者認為書本正失去重要性嗎？',['完全不同意；形式改變，知識與娛樂價值仍在','完全同意；紙本書一少就代表書本消失','沒有立場；只比較不同手機售價','完全同意；電子書不算書本'],'作者包括紙本及電子書，論證兩種價值。'),{type:'multi',prompt:'選出兩段主體的不同理由',detail:'選兩項，再按「確認」。',options:['書本提供連貫、深入並有背景的知識','閱讀提供安靜、沉浸及想像的娛樂','短片只能造成錯誤資訊','通勤者完全沒有數碼娛樂'],correct:[0,1],why:'主體一談結構知識；主體二談閱讀體驗。'}];
const route=[sequence('排好全文四段',[['引言 · 形式與價值','承認數碼媒介增長，反對書本價值下降。'],['主體一 · 深度知識','比較碎片帖文與書本；書本培養理解和判斷。'],['主體二 · 沉浸娛樂','慢節奏、想像與私人精神空間具獨特吸引力。'],['結論 · 核心能力','科技改變取得方式，深度、專注和想像更必要。']],'形式改變 → 資訊價值 → 娛樂價值 → 核心價值。')];
const evidence=[Q('短片可提供甚麼，書本可進一步提供甚麼？',['短片給快捷提示；書本解釋提示背後原理','短片解釋全部原理；書本只給標題','兩者都只能提供電影評價','兩者都不能讓人學習'],'作者承認短片的 quick tips，指出書的 principles。'),Q('「不只是給答案」後接哪項更深的成果？',['培養判斷力','降低所有書價','改變所有廣告','取代每份檔案'],'they build judgement。'),Q('小說讓讀者免受甚麼持續干擾？',['廣告、通知及演算法','角色、情緒及想像','段落、標點及詞語','車廂、書包及車票'],'原文列三種數碼干擾。'),Q('通勤者為何仍閱讀？',['閱讀給予私人精神空間','他們沒有任何數碼選擇','火車完全沒有窗戶','故事只能在車上閱讀'],'not because they lack alternatives。')];
const logic=[sequence('主體一：書本如何培養判斷？',[['對照媒介','短帖文常碎片化，書本連貫展開論點。'],['學習機制','由基礎到廣泛影響，形成真正理解。'],['具體例子','短片給提示，書本解釋提示背後原理。'],['段落成果','不只得到答案，還能培養判斷力。']],'組織資訊 → 深入理解 → 解釋原理 → 判斷力。'),sequence('主體二：慢閱讀為何仍有吸引力？',[['轉折','慢節奏本身可成為價值。'],['小說體驗','逐步進入世界，自行想像，少受數碼干擾。'],['比較','比電影或遊戲安靜，仍可同樣有力量。'],['生活例子','通勤者主動選讀，取得私人精神空間。'],['段落成果','這種體驗難由新媒介完全取代。']],'慢不是失效 → 沉浸與想像 → 主動選擇 → 獨特價值。')];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
T('短片用一分鐘教投資技巧，學生仍想知道這些技巧的依據。','哪項資源最能補足缺口？',['有系統地解釋原理與背景的長篇書籍','再看只重複同一句口號的十段短片','只記技巧名稱而不核對背後原因','只讀廣告標題便作出投資決定'],['對應 principles behind tips。','未補原理。','缺理解。','更碎片化。'],[3,4,5,6],'books explain principles behind quick tips'),
T('某人只看零散新聞標題，難以理解事件的來龍去脈。','主體一會指出甚麼？',['孤立資訊不足；需連貫地理解背景與影響','新聞標題越短，理解便必然越深入','只要看過一則標題，便能判斷所有資料','所有線上內容都必定錯誤而不可閱讀'],['由基礎到影響。','非必然。','資訊不足。','作者未全盤否定。'],[4,5],'real understanding beyond isolated pieces'),
T('人們從紙本轉向電子書，仍持續閱讀完整著作。','哪項最符合作者立場？',['閱讀載體改變，不代表書本核心價值流失','紙本數量一少，所有閱讀便立即停止','電子書只能播放影片，不能傳遞文字','只要使用螢幕，就不可能有深度理解'],['printed or digital 都算。','與情境相反。','電子書可讀。','非必然。'],[1,2,15],'printed or digital; form has changed'),
T('一位讀者想遠離手機通知，慢慢進入小說人物的世界。','這是哪種娛樂價值？',['安靜、可自行想像而少受數碼干擾','只看極短片段便立刻掌握全部情節','小說會自動封鎖所有手機與網絡訊號','閱讀必須和電影一樣快速才有力量'],['immersive and quieter。','與慢閱讀相反。','非技術封鎖。','安靜亦有力。'],[9,10,11],'gradually imagine without constant noise'),
T('通勤者有手機遊戲，仍選擇在車上讀一章小說。','文章怎樣解讀這個選擇？',['主動尋找私人精神空間，非缺乏其他娛樂','因所有手機遊戲都不能在車上使用','證明讀者從此不再使用任何數碼工具','顯示小說只能由上班族在火車上讀'],['原文 not because lack alternatives。','並非如此。','可並存。','例子非限制。'],[12,13],'not because lack digital alternatives; private space'),
T('有人說學習節奏慢，所以長篇課程必定落伍。','可遷移哪項反駁？',['較慢節奏可能讓人深入思考而有獨特價值','只要課程夠慢，內容便必然完全正確','快速教材永遠無法提供任何有用提示','學習效果只取決於課程影片的播放時長'],['慢可支持深度。','不保證正確。','短媒介有用。','不只時長。'],[5,6,9],'slower pace precisely what makes them valuable'),
T('某報告仔細交代資料來源，再說明每項事實的背景。','它與書本的哪項優勢相似？',['連貫展開論證，讓事實置於恰當背景','只列孤立數字，不解釋彼此關係','讓讀者完全不必思考事件的原因','將全部事實壓成一則無背景標題'],['develop argument and context。','相反。','仍需思考。','相反。'],[4,5],'develop an argument and place facts in context'),
T('新平台令圖書館借書方式改變，但讀者仍可完整閱讀。','這支持結論的哪個區分？',['取得方式變了，閱讀的基本價值未必減少','借書方式改變，表示所有書籍立即失效','有新平台出現，便不可能再有紙本閱讀','圖書館只要數碼化，想像力便一定消失'],['方式 ≠ 基本價值。','無此必然。','可並存。','無此因果。'],[2,15,16],'technology changes access, not fundamental value'),
T('學生既看短教學片，也閱讀完整的科普書。','作者可能如何評估兩者？',['短片可給快捷提示，書本可補上深入原理','短片一有用，書本便不能再提供任何知識','書本一有深度，所有短片就必定毫無價值','兩種媒介必須只選一種，不能一起使用'],['作者明確承認短片用途。','非互斥。','不全盤否定。','可互補。'],[6],'short videos useful for tips; book explains principles'),
T('有人認為小說比遊戲安靜，因此一定沒有娛樂力量。','主體二如何回應？',['安靜不等於無力，想像與情緒同樣能吸引人','只有畫面和音效才能帶來任何情緒','所有小說的節奏都必須比手機遊戲快','只要安靜，作品就完全不能描寫人物'],['quieter yet powerful。','小說可帶情緒。','無速度要求。','人物是重點。'],[10,11],'quieter than film/game, just as powerful'),
T('資訊爆炸令學生更難專心分析，卻更容易找到零散答案。','結論會強調哪種能力？',['深度、專注與想像，在今日反而更需要','只要得到答案，便永遠不需要判斷力','演算法越多，所有長篇閱讀就越無用','資訊越多，個人理解就必定自動變深'],['原文 qualities more necessary。','不只答案。','閱讀仍有用。','資訊不保理解。'],[5,7,16],'depth, concentration and imagination'),
T('要總結作者對「書本日漸不重要」的判斷。','哪項最準確？',['完全反對；書本仍供深入知識與沉浸娛樂','完全同意；電子書不算書本而應排除','部分同意；書本只可保存舊時代資料','沒有意見；文章僅介紹幾個通勤故事'],['立場及兩項理由俱全。','紙本電子都算。','不只保存。','立場明確。'],[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],'reliable knowledge and meaningful enjoyment'),
];
const plausibleAlternatives=[
  [['整理更多投資技巧名稱的短篇清單','用圖表比較哪段短片較受歡迎','只提供交易步驟而不談其理據'],['技巧清單仍未解釋其原理與背景。','受歡迎程度不能補足知識依據。','步驟示範不等於有系統地理解原因。']],
  [['標題提供線索，背景可由讀者自行補足','多看標題便足夠，無須比較事件影響','孤立資訊不足，先記住結論便能理解'],['若缺少連貫背景，理解仍可能片面。','數量增加不必然帶來脈絡。','只記結論未能說明原因與後果。']],
  [['閱讀載體改變，深入理解需等紙本回歸','電子書便利，但不適合讀完整著作','核心價值留在紙本，數碼只負責傳播'],['文章認為電子書也可承載完整閱讀。','情境已顯示電子書可讀完整作品。','載體不同不代表閱讀價值只在紙本。']],
  [['安靜閱讀有益，想像則主要來自影片','遠離通知有幫助，小說節奏仍宜加快','小說人物可吸引人，但需要手機互動'],['讀者可在閱讀時自行想像人物世界。','慢節奏也是小說沉浸價值的一部分。','情境正尋求少受數碼干擾的體驗。']],
  [['閱讀有私人空間，通勤時卻較難享受','讀小說主要為了獲得工作所需資訊','選擇閱讀顯示手機遊戲較缺內容深度'],['通勤者正是本文的閱讀例子。','小說帶來情感與想像，不只工具資訊。','文章不需貶低遊戲來說明閱讀價值。']],
  [['較慢節奏可能有價值，仍只適合初學者','快速教材能提示重點，深入理解則可略去','課程速度較慢，因此內容自然較準確'],['深度思考不只屬於初學者。','快捷提示不能代替原理與背景。','速度本身不能保證內容準確。']],
  [['連貫列出數字，背景可由讀者自行推測','交代來源能建立可信度，論證則可省略','把事實放在背景中，但不必說明彼此關係'],['缺少說明仍難掌握數字的意義。','書本優勢不只查證，也在連貫解釋。','彼此關係是連貫論證的重點。']],
  [['取得方式變了，完整閱讀便較少發生','數碼借書方便，書本深度則由平台決定','借閱方法改變，書本可改成短篇摘要'],['情境顯示仍能完整閱讀。','平台不是書本深度的唯一來源。','結論主張閱讀價值可延續，不必縮成摘要。']],
  [['短片可給快捷提示，書本宜只重複例子','書本可深入解釋，短片便沒有學習用途','兩者可並用，但原理可留待之後再談'],['書本的補充價值在解釋原理。','文章也承認短片能提供快捷提示。','深入理解仍須處理原理與背景。']],
  [['安靜閱讀有吸引力，但情緒作用仍較弱','小說能激發想像，因此不需要人物情感','遊戲有畫面音效，閱讀可主要提供知識'],['安靜與情緒力量並非對立。','閱讀的情感投入也是本文重點。','作者同時談書本的娛樂價值。']],
  [['快速答案更易找到，深入判斷便較次要','專注有助分析，但想像宜留給娛樂','資訊增多，學習重點只在記住更多答案'],['資訊多更需要判斷與深入理解。','文章並列深度、專注與想像。','零散答案不能取代連貫思考。']],
  [['部分反對；書本主要保留娛樂價值','大致反對；只有紙本能提供深入知識','部分同意；書本價值須由科技決定'],['遺漏書本的知識與判斷力作用。','電子書也可承載完整深入閱讀。','科技改變載體，未決定核心價值消失。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:78',meta:{topic:'書本是否失去資訊和娛樂價值',summary:'作者完全不同意書本正失去重要性。紙本或電子書都能連貫展開論點，讓讀者由基礎理解更廣泛影響，培養判斷力；短片提供快捷提示，書本可解釋其原理。書本較慢的節奏與較少干擾，亦帶來想像、情感與私人精神空間。科技改變閱讀方式，沒有減少書本培養深度、專注及想像的價值。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
