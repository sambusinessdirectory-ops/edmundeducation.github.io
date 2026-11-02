const simple=[
  'People in many places now watch films from other countries, and some worry that these films make local traditions less strong.',
  'I strongly disagree with this idea.',
  'Instead of harming local culture, foreign films can help people learn about the world and can even make local artists care more about who they are.',
  'First, watching foreign films does not automatically make people give up their own ways of life.',
  'Culture is not like a glass decoration that breaks when it meets something new; it is a way of life that can take in new ideas while keeping what makes it different.',
  'When people see films from other countries, they may learn about different languages, family beliefs, problems in society, and daily lives.',
  'Seeing the differences may help people notice what is special about their own society.',
  'For example, a young viewer of films from Japan or Korea may see differences in politeness, jokes, or family life, but still love local festivals, food, and traditions.',
  'Often, seeing the difference makes people clearer about their own culture, not less sure of it.',
  'Second, foreign films can help local film makers get better.',
  'If people only watch films made at home, local film makers may become too satisfied and keep using the same ideas.',
  'But when they must compete with films from other countries, they may tell better stories, make better-quality films, and show local culture in a more interesting way.',
  'For example, a director may carefully choose local ways of speaking, events from the past, or traditional music to make the film sound and feel different.',
  'So foreign films can bring new ideas rather than put local culture in danger.',
  'In short, I strongly disagree that foreign films harm local culture.',
  'They help people see more of the world and can encourage local film makers to keep their culture safe and show it in a stronger way.',
];
const vocabulary=[
  [['watched widely','watch','廣泛觀看'],['many parts of the world','many places','世界許多地方'],['fear','worry','擔心'],['weaken local traditions','make local traditions less strong','削弱本地傳統']],
  [['completely disagree','strongly disagree','完全不同意'],['this view','this idea','這觀點']],
  [['Rather than damaging','Instead of harming','非破壞'],['broaden people’s understanding of the world','help people learn about the world','拓寬世界理解'],['encourage local artists','make local artists','鼓勵本地藝術家'],['value their own cultural identity more deeply','care more about who they are','更重視文化身份']],
  [['exposure to foreign films','watching foreign films','接觸外國電影'],['does not automatically','does not automatically','不自動'],['abandon their own customs','give up their own ways of life','放棄本地習俗']],
  [['fragile glass ornament','glass decoration','脆弱玻璃裝飾'],['the moment it touches something new','when it meets something new','一遇新事物'],['living system','way of life','有生命力系統'],['absorb outside influences','take in new ideas','吸收外來影響'],['keeping its own character','keeping what makes it different','保留自身特色']],
  [['films from other countries','films from other countries','其他國家電影'],['family values','family beliefs','家庭價值'],['social problems','problems in society','社會問題'],['ways of life','daily lives','生活方式']],
  [['This comparison','Seeing the differences','這種比較'],['more aware','notice','更意識到'],['what is special about their own society','what is special about their own society','自己社會獨特之處']],
  [['For example','For example','例如'],['young person','young viewer','年輕人'],['manners','politeness','禮儀'],['humour','jokes','幽默'],['family relationships','family life','家庭關係'],['stop valuing','still love','停止重視']],
  [['In many cases','Often','很多情況'],['contrast','seeing the difference','對比'],['cultural identity clearer','clearer about their own culture','文化身份更清晰'],['not weaker','not less sure of it','不是更弱']],
  [['Another important point','Second','另一觀點'],['foreign films','foreign films','外國電影'],['push local film industries to improve','help local film makers get better','推動本地電影業進步']],
  [['audiences','people','觀眾'],['domestic productions','films made at home','本地作品'],['comfortable','too satisfied','安於現狀'],['repetitive','keep using the same ideas','重複']],
  [['However','But','然而'],['compete with international films','compete with films from other countries','與國際電影競爭'],['tell better stories','tell better stories','講更好故事'],['improve production quality','make better-quality films','改善製作品質'],['present local culture in a more attractive way','show local culture in a more interesting way','更吸引呈現本地文化']],
  [['For instance','For example','例如'],['local dialects','local ways of speaking','本地方言'],['historical settings','events from the past','歷史背景'],['traditional music','traditional music','傳統音樂'],['distinct voice','sound and feel different','鮮明聲音']],
  [['In this sense','So','從這意義'],['act as a spark','bring new ideas','如火花'],['rather than a threat','rather than put local culture in danger','而非威脅']],
  [['In conclusion','In short','總結'],['completely disagree','strongly disagree','完全不同意'],['negative impact on local culture','harm local culture','負面文化影響']],
  [['widen people’s perspectives','help people see more of the world','拓闊視野'],['motivate local creators','encourage local film makers','激勵本地創作者'],['protect and present their culture more powerfully','keep their culture safe and show it in a stronger way','更有力保護呈現文化']],
];
const chunkOverrides={1:['I completely disagree','with this view.'],8:['In many cases, contrast makes cultural identity clearer,','not weaker.'],13:['In this sense, foreign films can act as a spark','rather than a threat.']};
const simpleChunkOverrides={1:['I strongly disagree','with this idea.'],8:['Often, seeing the difference makes people clearer about their own culture,','not less sure of it.'],13:['So foreign films can bring new ideas','rather than put local culture in danger.']};
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Foreign dishes are now eaten widely in many parts of the world, and some people fear that they weaken local traditions.','承認外來內容流行並引出他人擔憂。','只是交代問題，作者隨後反對。',[1,2,3],F('[外來內容] are now [廣泛接觸] in many parts of the world, and some people fear that they weaken local traditions','引言把外來文化流行與損害疑慮放在一起。','題目問外來內容是否削弱本地文化時，先交代兩方背景。',[['Foreign films','slot','外來內容'],[' are now ','link','如今'],['watched widely','slot','廣泛接觸'],[' in many parts of the world, and some people fear that they weaken local traditions.','link','有人擔心損本地']])),
  S('I completely disagree with this view.','短句先明示立場，下一句才展開正面替代解釋。','此處不是含糊部分同意。',[0,2,14],F('I completely disagree with [對方觀點]','先明確回答同意程度。','題目問是否同意而作者立場清楚時，可先短句表態。',[['I completely disagree with ','link','完全不同意'],['this view.','slot','對方觀點']])),
  S('Rather than damaging local music, foreign performances can broaden people’s understanding of the world and even encourage local artists to value their own cultural identity more deeply.','Rather than... can... 否定傷害並提出世界理解及本地認同。','作者不是只說「不會傷害」，而是主張可帶來積極作用。',[1,3,9],F('Rather than damaging [本地文化], [外來內容] can broaden [世界視野] and even encourage [本地創作者] to value [自身身份] more deeply','由反對轉到兩項積極效益。','對方指外來內容有害，作者要提出它如何反而有益時。',[['Rather than damaging ','link','非破壞'],['local culture','slot','本地文化'],[', ','link','反而'],['foreign films','slot','外來內容'],[' can broaden ','link','可拓闊'],['people’s understanding of the world','slot','世界視野'],[' and even encourage ','link','甚至鼓勵'],['local artists','slot','本地創作者'],[' to value ','link','重視'],['their own cultural identity','slot','自身身份'],[' more deeply.','link','更深入']])),
  S('The first reason is that exposure to international music does not automatically make people abandon their own customs.','does not automatically 反駁接觸必然導致放棄。','作者沒有否認文化會受影響，只是否認必然削弱。',[2,4,5],F('The first reason is that exposure to [外來內容] does not automatically make people abandon their own customs','區分接觸外來內容與失去原有習俗。','有人把文化接觸寫成必然同化時。',[['The first reason is that exposure to ','link','第一理由：接觸'],['foreign films','slot','外來內容'],[' does not automatically make people abandon their own customs.','link','不自動使人棄習俗']])),
  S('Culture is not a fragile glass ornament that breaks the moment it touches something new; it is a living system that can absorb outside influences while still keeping its own character.','玻璃與生命系統兩個比喻對照脆弱論與適應力。','不是說本地文化完全不變；可吸收而保留特色。',[3,5,6],F('[文化] is not a fragile glass ornament that breaks the moment it touches something new; it is a living system that can absorb outside influences while still keeping its own character','以雙比喻駁斥接觸必然破壞。','要反駁「接觸外來影響便必然失去原貌」的推論，並指出吸收與保留可以並存時。',[['Culture','slot','文化'],[' is not a fragile glass ornament that breaks the moment it touches something new; it is a living system that can absorb outside influences while still keeping its own character.','link','非易碎品而是活系統']])),
  S('When people watch plays from other countries, they may learn about different languages, family values, social problems, and ways of life.','When...may... 用四方面說明外來作品能帶來的知識。','may 是可能學到，不是所有人每次都學到。',[3,4,6],F('When people watch [外來作品], they may learn about [四類資訊]','說明外來作品可提供甚麼視角。','要把「拓闊世界理解」具體化時，列出作品展示的生活面向。',[['When people watch ','link','當人觀看'],['films from other countries','slot','外來作品'],[', they may learn about ','link','或學到'],['different languages, family values, social problems, and ways of life.','slot','四類資訊']])),
  S('This comparison can actually make students more aware of what is special about their own society.','比較外來與自身，可能令本地特色更清楚。','不是說看外國電影會自動改變國籍或身份。',[4,5,7],F('This comparison can actually make [人] more aware of what is special about their own society','將認識他者轉為理解自身。','已列外來文化內容，要說明比較如何反照本地特點時。',[['This comparison can actually make ','link','這比較可令'],['them','slot','人'],[' more aware of what is special about their own society.','link','更知本地獨特']])),
  S('For example, a young person who watches Indian or French films may notice differences in manners, humour, or family relationships, but this does not mean they will stop valuing local festivals, food, or traditions.','具體例子展示察覺差異與保留本地重視可同時成立。','不是說日本或韓國電影必然讓每個人更愛本地文化。',[5,6,8],F('For example, a young person who watches [外來作品] may notice differences in [文化面向], but this does not mean they will stop valuing [本地文化]','用生活例子反駁接觸外來即放棄本地。','已解釋對照可能加深認同，需要一個不二選一的例子時。',[['For example, a young person who watches ','link','例如年輕人看'],['Japanese or Korean films','slot','外來作品'],[' may notice differences in ','link','或察覺差異於'],['manners, humour, or family relationships','slot','文化面向'],[', but this does not mean they will stop valuing ','link','不等於不重視'],['local festivals, food, or traditions.','slot','本地文化']])),
  S('In many cases, contrast makes personal identity clearer, not weaker.','not weaker 收束對照如何加深認同的論點。','in many cases 保留範圍，不保證每個觀眾如此。',[5,7,9],F('In many cases, contrast makes [身份] clearer, not weaker','將例子總結成對比有助辨認自身。','已說明兩種文化並存，要一句話指出對照可能帶來的結果時。',[['In many cases, contrast makes ','link','多數情況對比令'],['cultural identity','slot','身份'],[' clearer, not weaker.','link','更清晰非削弱']])),
  S('Another important point is that foreign food can push local restaurants to improve.','第二段從觀眾認同轉到本地創作競爭。','不是重複文化不易碎比喻。',[2,8,10],F('Another important point is that [外來作品] can push [本地行業] to improve','引出外來競爭刺激本地品質。','已談觀眾收穫後，要談本地創作者受何正面影響時。',[['Another important point is that ','link','另一重點'],['foreign films','slot','外來作品'],[' can push ','link','可推動'],['local film industries','slot','本地行業'],[' to improve.','link','進步']])),
  S('If audiences are exposed only to one local style, local filmmakers may become comfortable and repetitive.','If 設缺少外來對照，可能安於現狀。','may 指風險，不是說本地創作者必然懶惰。',[9,11,12],F('If audiences are exposed only to [本地內容], [本地創作者] may become comfortable and repetitive','說明競爭或多樣性不足的可能代價。','主張外來作品能激勵進步時，要先展示封閉市場風險。',[['If audiences are exposed only to ','link','若觀眾只接觸'],['domestic productions','slot','本地內容'],[', ','link','則'],['local filmmakers','slot','本地創作者'],[' may become comfortable and repetitive.','link','或安逸重複']])),
  S('However, when they compete with international artists, they are often forced to tell better stories, improve production quality, and present local culture in a more attractive way.','競爭後列三種可改善的具體創作面向。','不是說外國作品取代本地作品，而是促其提升。',[9,10,12],F('However, when [本地創作者] compete with [外來對手], they are often forced to [三種改進]','由缺少競爭轉到競爭帶來的改進。','已指出安逸風險，需展示外來競爭如何具體提升作品時。',[['However, when ','link','但當'],['they','slot','本地創作者'],[' compete with ','link','競爭於'],['international films','slot','外來對手'],[', they are often forced to ','link','或被推動去'],['tell better stories, improve production quality, and present local culture in a more attractive way.','slot','三種改進']])),
  S('For instance, a director may choose to use local history, familiar streets, or traditional music more carefully in order to give the film a distinct voice.','具體創作選擇展示外來競爭可促使更用心呈現本地元素。','不是要求所有電影都必須用三種元素。',[9,11,13],F('For instance, a director may choose to use [本地元素] more carefully in order to give the film a distinct voice','將抽象品質提升落到導演的具體選擇。','已說會更好地呈現本地文化，需要展示如何使用本地元素時。',[['For instance, a director may choose to use ','link','例如導演可用'],['local dialects, historical settings, or traditional music','slot','本地元素'],[' more carefully in order to give the film a distinct voice.','link','更細心而形成特色']])),
  S('In this sense, foreign music can act as a spark rather than a threat.','火花比喻總結外來內容可刺激而非削弱本地創作。','不是說任何外來作品都必定產生同等效果。',[8,11,12],F('In this sense, [外來刺激] can act as a spark rather than a threat','以簡短比喻收束競爭的積極解讀。','前面已列改善與創作例子，要一句話反轉「外來＝威脅」時。',[['In this sense, ','link','從此角度'],['foreign films','slot','外來刺激'],[' can act as a spark rather than a threat.','link','可如火花非威脅']])),
  S('In conclusion, I completely disagree that foreign dishes have a negative impact on local culture.','結論直接回題目正負判斷。','保留完全反對，不能改寫成只有少量保留。',[1,2,15],F('In conclusion, I completely disagree that [外來內容] have a negative impact on local culture','明示對負面影響說法的反對。','全文用觀眾與創作者兩方面反駁危害說法後。',[['In conclusion, I completely disagree that ','link','總結完全不同意'],['foreign films','slot','外來內容'],[' have a negative impact on local culture.','link','損害本地文化']])),
  S('They widen people’s perspectives and can motivate local writers to protect and present their culture more powerfully.','並列觀眾視野與創作者動機，綜合兩段。','不是聲稱本地傳統不需保護，而是可更有力呈現。',[2,9,14],F('They widen people’s perspectives and can motivate [本地創作者] to protect and present their culture more powerfully','用一句話整合兩項正面效益。','結論需要同時回顧觀眾與本地藝術工作者的收穫時。',[['They widen people’s perspectives and can motivate ','link','拓視野並激勵'],['local creators','slot','本地創作者'],[' to protect and present their culture more powerfully.','link','更有力呈現文化']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者是否認為外國電影會損害本地文化？',['完全不同意；它可開闊視野並刺激本地創作者更用心呈現文化','完全同意；接觸外國電影就必定棄本地習俗','沒有立場；只討論電影票價','完全同意；本地電影業無法有任何進步'],'作者完全反對；兩段分別談觀眾對照與本地產業改進。'),
  {type:'multi',prompt:'選出兩段主體不同的理由',detail:'選兩項，再按「確認」。',options:['看外國作品可使觀眾更清楚自己文化的特色','外來競爭可促使本地電影提升故事與製作品質','任何外國作品必定令所有本地傳統消失','本地創作者完全不用觀察其他作品'],correct:[0,1],why:'主體一談對照與文化認同；主體二談競爭與創作提升。'},
];
const route=[sequence('排好全文四段',[
  ['引言 · 反對損害說','外國電影普及，作者提出世界理解與本地認同的正面效果。'],
  ['主體一 · 對照認同','文化能吸收外來影響；比較差異使本地特色更清楚。'],
  ['主體二 · 創作刺激','外來競爭促本地故事、品質與文化元素更用心。'],
  ['結論 · 火花非威脅','外來電影擴視野，也激勵本地創作者保護與呈現文化。'],
],'接觸外來 → 更認識自己 → 本地創作改善 → 正面結論。')];
const evidence=[
  Q('文化被比作甚麼，而非易碎的玻璃裝飾？',['能吸收外來影響並保留特色的活系統','一旦碰新物即必碎的玻璃','完全不能變化的石塊','只由食物組成的商品'],'living system that can absorb influences。'),
  Q('外國電影可讓觀眾了解哪些面向？',['語言、家庭價值、社會問題與生活方式','只有電影票價與片長','只有戲院座位與幕布','只有導演姓名與海報尺寸'],'原文列四項生活文化內容。'),
  Q('日韓電影例子怎樣回應「外來文化削弱本地」？',['可察覺差異，仍然重視本地節日、食物和傳統','看一次就必定停止所有本地慶祝','只看外來電影才可能理解本地文化','本地節日與家庭關係完全沒有關係'],'不同文化可並存；does not mean stop valuing。'),
  Q('只有本地作品時，作者擔心本地片商可能怎樣？',['安於現狀並反覆使用相似做法','立即學會世界所有製作技術','一定失去所有觀眾','不再有任何地方文化元素'],'may become comfortable and repetitive。'),
  Q('國際競爭可促進本地作品哪三方面？',['故事、製作品質及本地文化呈現','票價、座椅及零食份量','上映日期、售票員與劇院外牆','字幕大小、入口數量與海報紙張'],'source lists tell better stories, improve quality, present culture。'),
  Q('導演例子可使用哪些本地元素？',['方言、歷史背景與傳統音樂','只用外國地名與全新貨幣','只改變演員的鞋碼','只縮短電影字幕'],'local dialects, historical settings, traditional music。'),
];
const logic=[
  sequence('主體一：比較如何令本地認同更清楚？',[
    ['第一理由','接觸外國電影不會自動令人放棄本地習俗。'],
    ['文化比喻','不是易碎玻璃，而是可吸收影響的活系統。'],
    ['接觸內容','觀眾看到語言、家庭、社會問題與生活。'],
    ['反照自身','差異可讓本地特色更清楚。'],
    ['日韓例子','察覺他國禮儀，不代表不再愛本地節慶。'],
    ['段落結論','對比或使身份更清晰，不是更弱。'],
  ],'文化可適應 → 外來視角 → 對照自身 → 保留本地重視。'),
  sequence('主體二：外來競爭如何促進本地創作？',[
    ['另一理由','外國電影可推本地片商進步。'],
    ['封閉風險','只看本地作品或令創作者安逸重複。'],
    ['競爭改進','更好故事、製作與本地文化呈現。'],
    ['導演例子','細心用方言、歷史與傳統音樂形成特色。'],
    ['比喻結論','外來電影可作火花，而非威脅。'],
  ],'封閉可能重複 → 競爭促改善 → 本地元素更鮮明。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('學生接觸外國節日後，仍熱愛自己家鄉的慶祝方式。','哪項推論最貼近首段？',['認識差異不等於放棄本地，反可看清自身特色','只要學外國節日，本地節日必定立即消失','愛家鄉節日證明學生完全沒學到任何新事','外國節日與本地節日不能被同一人了解'],['對照可加深認同。','非自動同化。','仍學到差異。','可兼有理解。'],[3,5,6,7,8],'contrast makes cultural identity clearer。'),
  T('有人把文化比作碰到外來事物就會碎的玻璃。','文章會用甚麼更適合的比喻？',['能吸收外來元素又保留特色的活系統','只會碎裂而永遠不能修補的裝飾品','只能容納一種顏色的透明玻璃杯','完全無法接觸任何新事物的封閉箱'],['原文 living system 對照 fragile ornament。','正是被反駁比喻。','仍顯脆弱。','不符可吸收。'],[3,4],'not fragile glass; living system。'),
  T('一位本地導演看完外國電影，決定更細心用本地方言拍片。','這支持哪條因果？',['外來作品可刺激本地創作，而非必然抹去特色','外國電影一出現，方言便無法再用於電影','導演看外國作品後只能模仿其全部內容','使用本地方言證明導演從未受外來啟發'],['spark 可推動 distinct voice。','與情境相反。','不必全盤模仿。','情境有啟發。'],[9,11,12,13],'foreign films act as a spark。'),
  T('某城市只允許本地電影上映，片商多年沿用同一套故事。','第二段會指出哪種可能風險？',['缺少外來對照或競爭，創作者可能安逸重複','只有本地作品，必然令每部片都更有創意','多年同一故事，表示觀眾一定更滿意','禁止外國電影能保證所有本地傳統保存'],['封閉市場可能降低改進壓力。','無創意保證。','未必滿意。','無保存保證。'],[9,10,11],'domestic only may become repetitive。'),
  T('觀眾看外國片，開始留意自己社會對家庭關係的不同看法。','這是哪一種學習？',['藉他者作對照，更清楚認識本地特點','完全放棄自己的家庭與生活方式','只學會電影的售票與放映時間','證明本地與外國文化完全沒有差異'],['This comparison makes own society clearer。','不是自動放棄。','內容關乎價值。','差異正被察覺。'],[5,6,7,8],'comparison makes more aware of own society。'),
  T('本地餐廳遇上國際餐飲競爭，開始改善菜式並重新呈現本地食材。','怎樣遷移第二段邏輯？',['外來競爭可促品質進步，也可突顯本地特色','國際餐廳存在，本地食材便必須全部停用','本地餐廳若改善菜式，便不再屬於本地','只要有外國對手，任何餐廳都會立即倒閉'],['競爭可引出更好的本地呈現。','與情境相反。','本地特色仍在。','無必然倒閉。'],[9,10,11,12,13],'competition improves quality and local presentation。'),
  T('有人說看外國藝術就必然不再珍惜本地藝術。','首段哪個詞直接反駁「必然」？',['不會自動；接觸與放棄之間沒有必然等號','必定；看見一次就需要放棄原有文化','永遠；所有藝術家都不可能受到啟發','立即；新作品一到本地就替代一切'],['does not automatically 是限定。','與原文相反。','未談啟發。','過度推論。'],[3,7],'does not automatically make people abandon。'),
  T('兩種文化碰面後，本地藝術家更有意識地選用自己的歷史素材。','這如何配合結論？',['外來接觸或激勵創作者保護並呈現自身文化','創作者使用本地歷史，便代表外來作品無影響','歷史素材一經採用，觀眾就不能再看外國片','只要有外來接觸，本地文化就必定完全消失'],['motivate local creators to protect/present。','可由對照啟發。','不需禁止。','與情境相反。'],[2,11,12,13,15],'motivate local creators to protect and present。'),
  T('一部作品包含異國生活方式，觀眾既理解它又更珍惜本地節日。','哪項最符合文章對觀眾的看法？',['拓闊世界理解與重視本地文化可以同時發生','理解異國方式，就必須停止本地節日慶祝','珍惜本地節日，便不能欣賞任何外國電影','觀眾接觸不同文化，必定只會失去身份'],['引言與首段支持雙重效益。','錯誤互斥。','無需互斥。','與結論相反。'],[2,5,6,7,8],'broaden understanding and value identity。'),
  T('片商面對外來作品後，把故事寫得更好，亦更細心使用傳統音樂。','這是哪兩項具體改進？',['敘事品質提升，同時更用心呈現本地元素','只改善廣告海報，完全不改變作品內容','把所有本地音樂刪除，只用外國歌曲','更好故事會令傳統音樂完全沒有作用'],['兩個改善都在第二段。','沒有改內容。','與例子相反。','可共同存在。'],[11,12],'tell better stories；traditional music。'),
  T('有人把「外來競爭」只看成威脅，未考慮本地創作反應。','文章的火花比喻補充甚麼？',['外來刺激也可能點燃改進與獨特表達','任何火花都必然令所有文化被燒毀','外來作品只會競爭，不可能影響本地藝術','創作者只要看外國片，就立即失去本地身份'],['spark 表可能啟發。','不是字面火。','第二段說可改進。','無此必然。'],[9,10,11,12,13],'spark rather than threat。'),
  T('要概括全文而保留作者的完全反對立場。','哪項最準確？',['外國電影可擴視野並促本地創作，不必削弱文化','外國電影一普及，本地習俗便必定全部消失','本地電影只要沒有外國競爭，就必定最好','欣賞外國片代表觀眾一定不再重視家鄉'],['兩段正面理由與立場俱全。','與原文相反。','不保證。','首段反駁。'],[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],'broaden perspectives；motivate local creators。'),
];
const plausibleAlternatives=[
  [['認識外國節日有助比較，本地慶祝應逐步簡化','愛家鄉節日顯示外國文化接觸尚未發揮作用','兩種節日可比較，但學生須先選定其中一種'],['比較不要求削弱本地慶祝。','接觸外國文化也可能深化本地認識。','理解不同文化不需要只選其一。']],
  [['能吸收外來元素，但須放棄原有特點的容器','保留原有特色，因此避免外來接觸的花園','外來事物一加入便停止變化的拼圖'],['活系統可吸收影響，同時保留特色。','文章認為文化可在接觸中保持活力。','文化不是接觸後即固定的物件。']],
  [['外來作品可刺激創作，但方言應逐步淡出','外來作品提供題材，本地素材則僅作點綴','方言拍片有助傳統保存，與外來啟發無關'],['例子正顯示外來刺激可促本地特色。','本地素材不是可有可無的裝飾。','導演的反應是在觀看外國片之後出現。']],
  [['缺少外來對照，觀眾便較難買到新作品','沒有競爭，片商仍會因熟悉市場而改進','創作者或重複故事，主要問題是票價上升'],['本文聚焦創意與製作，不是供應量。','缺少外來刺激可能令創作停滯。','故事重複是創作問題，非票價問題。']],
  [['藉他者作對照，便會偏好外國家庭做法','認識本地特點後，外國文化便不值得理解','比較電影內容，主要為判斷哪邊票房較高'],['看見差異不必轉向偏好外國做法。','文章主張視野與本地認識並存。','情境談文化觀察，不是商業票房。']],
  [['外來競爭可促品質，但本地食材應減少使用','國際餐廳加入後，本地菜只須維持原樣','改善菜式可吸引客人，食材來源則不重要'],['改善與突出本地素材可以同時發生。','競爭可促使本地服務改進。','本地特色是轉型的一部分。']],
  [['不會自動；接觸後是否珍惜仍取決於比較','有時會；接觸異國文化通常會令本地變淡','較少會；本地文化須先避開外國作品'],['把沒有必然關係誤改成須達成的條件。','原文不認為接觸通常會削弱本地文化。','作者主張能透過接觸認識自身特點。']],
  [['外來接觸可激勵創作，歷史素材則應退居次要','使用本地歷史說明創作者已不受外國影響','外來接觸可開拓視野，但保護文化只能靠隔離'],['結論同時重視外來刺激與本地表達。','情境正是受到外來作品後的反應。','隔離與文章強調的文化交流相反。']],
  [['理解異國生活較重要，本地節日只是過渡','珍惜本地節日可以，但異國故事宜少接觸','觀眾可理解兩者，但只能選一種文化生活'],['文章不把本地文化降為過渡。','接觸異國可深化而非削弱本地認識。','文化理解不需排他選擇。']],
  [['敘事品質提升，傳統音樂可逐步改用新曲','傳統音樂更突出，故事品質則維持原狀','改善故事後，方言和歷史才是唯一重點'],['情境明確同時改善故事與傳統音樂。','忽略了敘事品質的改進。','原文沒有把本地元素限於單一組合。']],
  [['外來刺激可引發改進，本地特色則較難保留','外來競爭可帶來市場壓力，創作回應不重要','火花主要表示外國片比本地片更有價值'],['文章認為改進與獨特表達能並行。','比喻重點正是創作者的反應。','作者沒有建立作品國籍的高低排序。']],
  [['外國片可擴視野，但本地創作宜避免競爭','外國片促本地創作，觀眾則較難保持認同','外國片與本地片可共存，文化差異宜淡化'],['文章亦把外來競爭視為創作刺激。','觀眾可藉比較更認識本地文化。','文章重視保留並呈現文化特色。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:75',meta:{topic:'外國電影會否損害本地文化',summary:'作者完全不同意外國電影會損害本地文化。文化不是一碰外來事物就碎的玻璃，而能吸收影響並保留特色；觀眾看外國片可比較禮儀、家庭和生活，反而更認識本地文化。外來競爭亦可促本地片商改善故事與製作，更用心使用方言、歷史和傳統音樂。外國片可成創作火花。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
