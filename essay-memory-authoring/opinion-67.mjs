const simple=[
  'As computers and tablets become a normal part of school, some schools have started to teach less handwriting or stop teaching it.',
  'I strongly think children should still learn to write with a pen because it helps them learn to read and write and is still useful in everyday life.',
  'First, handwriting gives children a better start in learning to read and write.',
  'When young children write letters by hand, they do more than draw shapes: they put sounds, hand movement, spelling, and meaning together.',
  'Writing by hand takes longer, and this can help children remember words better than typing on a screen.',
  'For example, a child who writes hard words like “beautiful” or “necessary” many times will more often see their letter patterns than a child who types them and lets the computer fix mistakes.',
  'So handwriting is like a small place where the mind can practise: it helps children pay attention, wait carefully, and get things right as they learn to use language.',
  'Second, handwriting lets children do things for themselves when a device cannot be used or is not suitable.',
  'Schools should prepare pupils not only for times when digital tools work well, but also for normal situations in real life.',
  'A pupil may need to take a paper test, write a short message, put names on a drawing, complete a form, or write when a device has no power left.',
  'If schools stop teaching handwriting, children may need screens even for very easy writing jobs.',
  'This would be a limited kind of progress because a useful older skill would disappear for no good reason.',
  'In short, children certainly should learn to write by hand.',
  'Typing is very important today, but it should give children an extra ability rather than take handwriting away.',
  'A pen may seem old beside a tablet, but it still helps children control their hands, focus, and do things without help.',
];
const vocabulary=[
  [['digital devices','computers and tablets','數碼裝置'],['established part of school life','normal part of school','學校生活一部分'],['have begun to reduce','have started to teach less','開始減少'],['remove','stop teaching','取消']],
  [['strongly believe','strongly think','堅信'],['be taught how to write with a pen','learn to write with a pen','學用筆書寫'],['supports early learning','helps them learn to read and write','支援早期學習'],['basic practical skill','useful in everyday life','基本實用技能']],
  [['The first reason','First','第一原因'],['stronger foundation for literacy','better start in learning to read and write','較穩固讀寫基礎']],
  [['young learners','young children','年幼學習者'],['form letters by hand','write letters by hand','用手形成字母'],['do not simply copy shapes','do more than draw shapes','不只複製形狀'],['connect sound, movement, spelling and meaning','put sounds, hand movement, spelling, and meaning together','連結音動作字形意思']],
  [['slower physical process','Writing by hand takes longer','較慢身體過程'],['make words feel more memorable','help children remember words better','較易記住字詞'],['pressing keys on a screen','typing on a screen','按屏幕鍵']],
  [['repeatedly writes difficult words','writes hard words','反覆寫難字'],['more likely to notice','will more often see','更可能留意'],['letter patterns','letter patterns','字母模式'],['relies on autocorrect','lets the computer fix mistakes','依賴自動更正']],
  [['In this sense','So','從這意義上'],['acts like a small workshop for the mind','is like a small place where the mind can practise','如大腦小工坊'],['trains attention, patience and accuracy','helps children pay attention, wait carefully, and get things right','訓練專注耐心準確'],['developing basic language skills','learn to use language','發展基本語言能力']],
  [['Another important reason','Second','另一重要原因'],['gives children independence','lets children do things for themselves','給兒童獨立能力'],['technology is unavailable or inappropriate','a device cannot be used or is not suitable','科技不可用或不合適']],
  [['prepare pupils','prepare pupils','準備學生'],['ideal digital environments','times when digital tools work well','理想數碼環境'],['ordinary real-life moments','normal situations in real life','普通現實場景']],
  [['student','pupil','學生'],['complete a paper exam','take a paper test','完成紙筆考試'],['write a quick note','write a short message','寫簡短便條'],['label a diagram','put names on a drawing','為圖標註'],['fill in a form','complete a form','填表'],['run out of battery','has no power left','電池耗盡']],
  [['abandoned completely','stop teaching handwriting','完全放棄'],['unnecessarily dependent on screens','need screens','不必要依賴螢幕'],['simplest written tasks','very easy writing jobs','簡單書寫工作']],
  [['narrow form of progress','limited kind of progress','狹窄進步'],['useful old skill','useful older skill','有用舊技能'],['lost without a good reason','disappear for no good reason','無充分理由而失去']],
  [['In conclusion','In short','總結'],['definitely','certainly','絕對'],['handwriting skills','write by hand','手寫能力']],
  [['Typing is essential','Typing is very important','打字必要'],['add to children’s abilities','give children an extra ability','增加兒童能力'],['rather than replace handwriting altogether','rather than take handwriting away','而非完全取代手寫']],
  [['old-fashioned','old','老派'],['control','control their hands','控制力'],['concentration','focus','專注'],['self-reliance','do things without help','自立']],
];
const chunkOverrides={2:['The first reason is that handwriting helps children','build a stronger foundation for literacy.'],12:['In conclusion, children should','definitely learn handwriting skills.']};
const simpleChunkOverrides={2:['First, handwriting gives children','a better start in learning to read and write.'],12:['In short, children certainly','should learn to write by hand.']};
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('As online classes become an established part of school life, some schools have begun to reduce, or even remove, library visits.','As 提出環境變化，再點出相應做法；or even 表示變化加深。','此句交代背景，並非已證明減少手寫是對的。',[1,2,7],F('As [新工具] become an established part of [場景], some [機構] have begun to reduce, or even remove, [舊活動]','引言準確交代科技帶來的教學變化。','題目關注一種新工具令原有教學被縮減時，先說清背景。',[['As ','link','隨着'],['digital devices','slot','新工具'],[' become an established part of ','link','已成為'],['school life','slot','場景'],[', some ','link','一些'],['schools','slot','機構'],[' have begun to reduce, or even remove, ','link','已減少甚至取消'],['handwriting lessons.','slot','舊活動']])),
  S('I strongly believe that children should still be taught how to read maps, because map reading supports independence and remains a basic practical skill.','because 後有學習效益及實用性兩個理由。','作者沒有反對電腦，立場是仍要教手寫。',[0,2,13],F('I strongly believe that [對象] should still be taught how to [傳統技能], because [技能] supports [學習] and remains a basic practical skill','直接表明保留某項技能，並預告兩段理由。','新工具流行後，要論證原有基本技能仍應教授時。',[['I strongly believe that ','link','堅信'],['children','slot','對象'],[' should still be taught how to ','link','仍應學會'],['write with a pen','slot','傳統技能'],[', because ','link','因為'],['handwriting','slot','技能'],[' supports ','link','支援'],['early learning','slot','學習'],[' and remains a basic practical skill.','link','且仍實用']])),
  S('The first reason is that reading aloud helps children build a stronger foundation for literacy.','第一段先提出基礎讀寫能力，再用動作與單字例子說明。','不只是對手寫的懷舊喜好。',[1,3,4],F('The first reason is that [學習活動] helps [對象] build a stronger foundation for [基礎能力]','提出學習發展的首個理由。','支持某一早期學習活動時，先說它鞏固哪種核心能力。',[['The first reason is that ','link','首個原因'],['handwriting','slot','學習活動'],[' helps ','link','幫助'],['children','slot','對象'],[' build a stronger foundation for ','link','建立更好基礎'],['literacy.','slot','基礎能力']])),
  S('When young learners build models by hand, they do not simply copy shapes; they connect planning, movement, observation and meaning at the same time.','not simply...; they... 說明動手活動同時連結多個認知過程。','不是只說練習越慢越好，而是解釋學習機制。',[2,4,5],F('When [學習者] [親手動作], they do not simply [表面行為]; they connect [多個學習面向] at the same time','拆解一項簡單動作背後的學習過程。','要證明動手練習不只是機械重複時，列出同時參與的能力。',[['When ','link','當'],['young learners','slot','學習者'],[' form letters by hand','slot','親手動作'],[', they do not simply ','link','不只是'],['copy shapes','slot','表面行為'],['; they connect ','link','而是連結'],['sound, movement, spelling and meaning','slot','多個學習面向'],[' at the same time.','link','同時']])),
  S('This slower physical process can make ideas feel more memorable than tapping answers on a screen.','than 作對照；較慢動作可能加深記憶。','can 是可能效益，沒有宣稱每個人都必然如此。',[2,3,5],F('This slower physical process can make [學習內容] feel more memorable than [快捷螢幕動作]','從動作機制推到較易記憶的效果。','比較動手與快速點擊兩種學習方式的記憶效果時。',[['This slower physical process can make ','link','這較慢動作可使'],['words','slot','學習內容'],[' feel more memorable than ','link','比...更易記'],['pressing keys on a screen.','slot','快捷螢幕動作']])),
  S('For example, a child who repeatedly draws difficult shapes is more likely to notice their patterns than a child who only clicks them and relies on automatic hints.','兩個孩子的對照把「留意模式」的差異具體化。','不是說自動更正必然有害，而是過度依賴可能跳過觀察。',[3,4,6],F('For example, a child who [反覆親手練習] is more likely to notice [模式] than a child who [只用快捷方式]','用可比較的兩個學童展示學習機制。','已提出動手練習較易注意細節，需要一個對照例子時。',[['For example, a child who ','link','舉第一位孩子'],['repeatedly writes difficult words such as “beautiful” or “necessary”','slot','反覆親手練習'],[' is more likely to notice ','link','較易留意'],['their letter patterns','slot','模式'],[' than a child who ','link','相對第二位'],['only types them and relies on autocorrect.','slot','只用快捷方式']])),
  S('In this sense, reading aloud acts like a small workshop for the mind: it trains attention, patience and accuracy while children are still developing basic language skills.','小工坊比喻總結一項練習持續訓練心智能力。','這不是新的實驗數據，而是前文機制的形象說法。',[3,4,5],F('In this sense, [活動] acts like a small workshop for the mind: it trains attention, patience and accuracy while [學習者] are still developing basic language skills','以比喻把動作、注意和基礎學習連起來。','已給出具體學習例子後，要用易記類比收束其認知作用時。',[['In this sense, ','link','從這意義'],['handwriting','slot','活動'],[' acts like a small workshop for the mind: it trains attention, patience and accuracy while ','link','訓練注意等'],['children','slot','學習者'],[' are still developing basic language skills.','link','在基礎階段']])),
  S('Another important reason is that map reading gives children independence in situations where technology is unavailable or inappropriate.','第二理由由學習效益轉到沒有科技時的獨立性。','不是重複首段的字母模式與記憶。',[2,6,8],F('Another important reason is that [技能] gives [對象] independence in situations where technology is unavailable or inappropriate','提出工具失效或不合適時的備用能力。','支持保留基礎技能時，要說明離開理想科技環境仍能做甚麼。',[['Another important reason is that ','link','另一重要原因'],['handwriting','slot','技能'],[' gives ','link','帶給'],['children','slot','對象'],[' independence in situations where technology is unavailable or inappropriate.','link','科技不適用仍獨立']])),
  S('Schools should prepare pupils not only for ideal digital environments, but also for ordinary real-life moments.','not only...but also... 把準備範圍由理想情況擴至現實。','不是要求放棄數碼技能，而是準備更多情境。',[7,9,10],F('[機構] should prepare [對象] not only for ideal digital environments, but also for ordinary real-life moments','界定學校教育不應只適用於設備完好的場景。','有人只按理想科技條件設計訓練時，要補上日常例外情境。',[['Schools','slot','機構'],[' should prepare ','link','應準備'],['pupils','slot','對象'],[' not only for ideal digital environments, but also for ordinary real-life moments.','link','不只理想數碼情況']])),
  S('A worker may need to complete a paper form, write a quick note, label a diagram, fill in a register or communicate when a device has run out of battery.','一連串普通任務展示保留手寫的實用性。','例子不是說科技每天都會壞，而是有不適用場景。',[7,8,10],F('A [人物] may need to [多項紙筆任務] or communicate when a device has run out of battery','把「獨立」轉為可想像的日常任務。','已提出備用技能的必要後，需要列實際會遇到的任務時。',[['A ','link','一位'],['student','slot','人物'],[' may need to ','link','可能需要'],['complete a paper exam, write a quick note, label a diagram, fill in a form','slot','多項紙筆任務'],[' or communicate when a device has run out of battery.','link','或裝置沒電時交流']])),
  S('If map reading is abandoned completely, children may become unnecessarily dependent on screens for even the simplest travel tasks.','If 條件句指出放棄基本技能可能造成不必要依賴。','不是說孩子目前已全部不能手寫；是未來風險。',[7,9,11],F('If [舊技能] is abandoned completely, [對象] may become unnecessarily dependent on [工具] for even [簡單任務]','從具體用途推到徹底取消的風險。','新工具能做某事，但擔心完全取消舊能力造成依賴時。',[['If ','link','如果'],['handwriting','slot','舊技能'],[' is abandoned completely, ','link','完全放棄'],['children','slot','對象'],[' may become unnecessarily dependent on ','link','可能過度依賴'],['screens','slot','工具'],[' for even ','link','甚至為了'],['the simplest written tasks.','slot','簡單任務']])),
  S('This would be a narrow form of progress, because a useful old skill would be lost without a good reason.','because 指出「進步狹隘」的具體判準：不必要失去有用技能。','沒有否定打字本身的必要性。',[8,10,13],F('This would be a narrow form of progress, because [有用舊能力] would be lost without a good reason','評價把取代等同進步的看法。','當新工具帶來便利卻無故抹去仍有用的能力時。',[['This would be a narrow form of progress, because ','link','這是狹隘進步，因'],['a useful old skill','slot','有用舊能力'],[' would be lost without a good reason.','link','無充分理由失去']])),
  S('In conclusion, children should definitely learn basic cooking skills.','結論直接回答孩子是否應學的問題。','不是轉為只討論裝置是否流行。',[1,11,13],F('In conclusion, [對象] should definitely learn [基本能力]','以明確 should 回答題目。','題目問某能力是否仍應教授時，末段要清楚表態。',[['In conclusion, ','link','總結'],['children','slot','對象'],[' should definitely learn ','link','絕對應學'],['handwriting skills.','slot','基本能力']])),
  S('Coding is essential in the modern world, but it should add to pupils’ abilities rather than replace mathematics altogether.','add to...rather than replace 提出新舊能力互補原則。','作者承認打字重要，並未要求禁用數碼裝置。',[0,1,14],F('[新技能] is essential in the modern world, but it should add to [對象] abilities rather than replace [舊技能] altogether','在結論中把新技能定位為補充。','支持保留舊技能時，要承認新技能重要並解釋兩者關係。',[['Typing','slot','新技能'],[' is essential in the modern world, but it should add to ','link','必要但應增加'],['children’s','slot','對象'],[' abilities rather than replace ','link','能力而非取代'],['handwriting','slot','舊技能'],[' altogether.','link','完全']])),
  S('A paper map may look old-fashioned beside a phone, but it still teaches control, concentration and self-reliance.','may look...but still... 對照外觀過時與實際價值。','外觀新舊不等於是否有教育及實用作用。',[1,12,13],F('A [傳統工具] may look old-fashioned beside [新工具], but it still teaches [多項能力]','以簡短對照結束，保留舊工具的可學價值。','被批評過時的工具仍能訓練具體能力時。',[['A ','link','一種'],['pen','slot','傳統工具'],[' may look old-fashioned beside ','link','或顯得過時，相對'],['a tablet','slot','新工具'],[', but it still teaches ','link','卻仍教會'],['control, concentration and self-reliance.','slot','多項能力']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者認為學校還應教授手寫嗎？',['應該；手寫有助早期讀寫，也能在無法用科技時獨立完成任務','不應該；打字已完全取代一切紙筆用途','沒有立場；只討論平板電腦的價格','不應該；孩子不能同時學打字與手寫'],'引言與結論都支持手寫；兩段理由是讀寫基礎及實用獨立性。'),
  {type:'multi',prompt:'選出兩段主體不同的理由',detail:'選兩項，再按「確認」。',options:['用手形成字母連結聲音、動作、拼寫和意思','裝置沒電或不合適時，仍需完成紙筆任務','每個孩子都必須拒絕使用任何鍵盤','所有手寫速度都一定快於打字'],correct:[0,1],why:'第一段說學習機制；第二段說不靠螢幕的實際能力。'},
];
const route=[sequence('排好全文四段',[
  ['引言 · 仍應教手寫','數碼裝置普及，但手寫仍支持早期學習並具實用價值。'],
  ['主體一 · 讀寫基礎','手寫連結多種感官與意思；練習字母模式並訓練專注。'],
  ['主體二 · 實用獨立','考試、便條、表格及沒電等場景仍要紙筆。'],
  ['結論 · 新舊互補','打字重要，但應增加能力，而不是取消手寫。'],
],'承認數碼趨勢 → 讀寫機制 → 真實生活備用能力 → 互補原則。')];
const evidence=[
  Q('用手形成字母時，孩子同時連結哪四方面？',['聲音、動作、拼寫和意思','螢幕、電池、網速和價格','體育、地理、音樂和歷史','紙張、墨水、桌椅和燈光'],'source: sound, movement, spelling and meaning。'),
  Q('寫 beautiful、necessary 的例子要說明甚麼？',['反覆親手寫較可能察覺字母模式','自動更正必然會寫錯每個單字','孩子應只記住這兩個單字','打字本身使所有拼字能力消失'],'重點是 notice their letter patterns。'),
  Q('小工作坊的比喻指手寫訓練甚麼？',['專注、耐心和準確','畫畫、跑步和游泳','電池容量與連線速度','電子裝置的外觀設計'],'source: attention, patience and accuracy。'),
  Q('第二段列出哪種沒電時的需要？',['仍要能與人書面溝通','所有考試立刻取消','平板會自動完成表格','學生不再需要任何字詞'],'source: communicate when a device has run out of battery。'),
  Q('作者如何看待打字？',['現代生活必要，但應增添而非取代手寫能力','完全沒有用，學校應立即禁用','只可在小學教授，往後都不需要','比手寫更舊，因此沒有實用價值'],'Typing is essential...add to...rather than replace。'),
];
const logic=[
  sequence('第一主體段：手寫如何支持讀寫？',[
    ['主張','手寫建立較穩固的讀寫基礎。'],
    ['機制','形成字母時連結聲音、動作、拼寫和意思。'],
    ['記憶','較慢的身體過程或比按鍵更易留下印象。'],
    ['例子','反覆寫難字，較易注意字母模式。'],
    ['總結','小工作坊比喻帶出專注、耐心和準確。'],
  ],'能力主張 → 手部與認知連結 → 字詞例子 → 心智訓練。'),
  sequence('第二主體段：為何仍要不用螢幕的能力？',[
    ['另一理由','科技不適用時，手寫讓孩子獨立。'],
    ['教育標準','準備理想數碼環境，也準備真實生活。'],
    ['普通任務','紙筆考試、便條、圖表標籤、表格與沒電。'],
    ['取消風險','連簡單書寫都不必要地依賴螢幕。'],
    ['評價','無故失去實用技能是狹隘進步。'],
  ],'備用能力 → 真實任務 → 依賴風險 → 新舊互補。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('學校有計算機，便有人提議取消所有心算與估算練習。','依本文邏輯，先要檢查甚麼？',['心算仍練數感，也可在無工具時使用','計算機能算，心算數感可留待使用時學','先比計算機外觀，再決定有否心算課','保留心算後，計算機使用可暫停教授'],['對照學習基礎與獨立實用性。','數感仍有獨立價值。','外觀不決定是否要練心算。','新舊技能可並行。'],[1,2,3,7,10,13],'foundation for literacy；independence without technology。'),
  T('孩子依賴自動更正，拼字時很少注意字母的排列。','哪種練習最能回應文中的問題？',['定期親手寫較難單字，觀察其字母模式','只調快自動更正，不看字母排列過程','打錯字可先略過，拼寫模式稍後再練','先讀更多文章，不必親手寫較難單字'],['原文例子用反覆書寫促進留意模式。','更快更正不幫學生觀察。','應從錯字認出模式。','閱讀不完全替代親寫。'],[3,4,5],'repeatedly writes...notice letter patterns。'),
  T('學生用平板畫圖，但考試時須在紙上為圖表標示名稱。','這個情境支持哪項論點？',['仍教學生在紙上完成圖表標示','考試用紙，可先把平板課全面改為紙本','會用平板，紙本標示可待考前集中練','圖表標示可用口述，手寫可不必教'],['label a diagram 是普通紙筆任務。','作者不反對平板學習。','非理想情況也要有能力。','考試仍要求紙本標示。'],[7,8,9],'ordinary real-life moments；label a diagram。'),
  T('一個課程把所有紙筆技能刪除，只因設備目前都能運作。','作者可能指出甚麼設計缺口？',['只按理想設備規劃，忽略沒電時刻','設備今天能用，沒電風險可之後處理','刪紙筆後，孩子可先依賴他人代寫','課程先看設備價格，不看實際學習任務'],['教育應準備一般真實情境。','課程需備非理想環境。','依賴他人不利獨立。','學習任務是判準。'],[7,8,9,10],'not only ideal digital environments。'),
  T('幼兒在模型課親手擺放形狀，而非只點螢幕上的答案。','如何遷移第一段的學習機制？',['親手擺放可連結觀察動作與意思','實物擺放有趣，但只按完成速度評估','螢幕圖形較整齊，可替代手部觀察','動手活動可保留，思考連結稍後再談'],['動作與認知連結是原文機制。','速度未衡量理解。','實物手部動作可連思考。','連結是此活動作用。'],[3,4,6],'do not simply copy shapes；connect...at same time。'),
  T('有人說寫字比打字慢，所以手寫不可能有學習好處。','作者會用哪項回應？',['手寫雖慢，或更有助記住字詞','打字較快，手寫的記憶作用可先略過','手寫有用，打字速度可不再練習','只比完成時間，不查字詞是否記得'],['原文以 can 謹慎指出可能記憶效益。','較慢可能有記憶價值。','作者並未否定打字。','時間不是唯一學習結果。'],[3,4,5],'slower physical process can make words more memorable。'),
  T('老師讓學生寫紙本便條，也讓他們學會在電腦輸入內容。','哪個原則最接近結論？',['新技能增加能力，並保留仍然有用的舊技能','可同時學兩種，但紙本只留在課外興趣','先教紙本，數碼技能可等畢業後再學','兩種皆可學，卻不評估何時使用各自'],['add to rather than replace。','紙本也有實際任務。','數碼技能同樣要學。','何時使用是互補要點。'],[1,11,12,13,14],'Typing...should add to abilities rather than replace。'),
  T('小孩遇到裝置沒電，仍要填寫活動報名表。','文章認為哪種能力能避免不必要依賴？',['能自行手寫基本資料，完成簡單紙本表格','先等裝置充電，紙本表格可延後填寫','用螢幕輸入熟練，紙張可交同伴處理','資料已在腦中，可先不完成報名表'],['這是源文的表格和沒電場景。','沒電時需要能完成任務。','自己寫是獨立性。','報名仍須實際完成。'],[7,9,10],'fill in a form；device run out of battery。'),
  T('學校宣稱「越新就是越進步」，因此取消仍常用的基本技能。','哪項評估較符合本文？',['先查舊技能是否有用，再決定去留','設備較新，舊技能作用可留待以後檢查','舊技能仍有用，便可暫停新技術教學','先按傳統名稱分類，不看實際用途'],['無故失去有用技能是狹隘進步。','要先看舊技能是否仍有用。','新技術也有價值。','標籤不能代替用途。'],[10,11,13,14],'a useful old skill lost without a good reason。'),
  T('學生親手寫難字，開始留意自己常漏掉某個字母。','這個觀察直接支持哪一部分？',['反覆親寫可注意字母模式與漏字','親寫能見字母，卻不必對漏字作修正','改紙張顏色，可幫學生減少拼字錯誤','自動更正有用，便可略過親手寫字'],['注意 letter patterns 是例子核心。','漏字要被察覺與修正。','紙色未解字母模式。','自動更正不取代觀察。'],[4,5,6],'notice their letter patterns。'),
  T('一項舊工具看起來過時，但仍訓練專注與自己完成任務。','哪項最符合文章收束方式？',['外觀雖舊，能練專注仍有學習價值','工具舊，可先只按外觀決定是否教授','它能練專注，便可先停用新設備','外觀與用途都重要，但不必測學習效果'],['may look old-fashioned...but still teaches。','外觀舊不代表無作用。','保留舊不等於停新。','實際學習成效要看。'],[13,14],'pen may look old-fashioned...but still teaches。'),
  T('要用一句話向家長說明為何保留手寫課。','哪項最忠實於全文？',['手寫助讀寫與獨立完成，打字可補充','手寫支援基本讀寫，數碼課可留待日後','只因紙筆較便宜，便把課程重點全轉過去','打字能補充，但不必教孩子獨立完成紙本'],['兩段理由與互補結論俱在。','新舊技能可並行。','成本不是全部理由。','獨立完成是手寫作用。'],[1,2,3,4,5,6,7,8,9,10,11,12,13,14],'early learning；practical skill；add rather than replace。'),
];
export default {key:'opinion:67',meta:{topic:'學校是否仍應教授手寫',summary:'作者強烈認為兒童仍應學手寫。手寫形成字母時會連結聲音、動作、拼寫與意思；反覆寫難字也能幫助留意字母模式，建立讀寫基礎。紙筆考試、便條、圖表、表格及裝置沒電等情境仍需手寫，讓孩子不致過度依賴螢幕。打字重要，應增加能力而非取代手寫。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
