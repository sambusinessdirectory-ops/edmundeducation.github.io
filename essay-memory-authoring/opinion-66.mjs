const simple=[
  'Some experts think that, one day, people may choose to use the same language everywhere.',
  'I think this would be bad because language does more than help people talk: it also keeps culture, who we are, and shared memories alive.',
  'First, cultures could be lost.',
  'Each language shows a special way to understand life, including family, jokes, local customs, and ideas about right and wrong.',
  'If people slowly stop using their first languages and choose only one world language, many ideas will not simply move across; they will be lost when translated.',
  'For example, old songs, sayings, and stories often use sounds, playful words, and events from the past that another language cannot copy completely.',
  'When families, schools, and communities stop using a language, it is like a library that has been locked: the books remain, but people can no longer go in and make them part of their lives.',
  'Second, using only one world language could make unfair differences worse instead of ending them.',
  'The chosen language would probably come from a powerful group that already controls politics, money, or technology.',
  'People who already speak it would have a quick head start at school, at work, and in world organisations, while everyone else would need years to catch up.',
  'The language would become a barrier to opportunities: what people could do would depend less on skill and more on whether they learned it early.',
  'So one shared language might seem fair, while quietly helping people who were already better off.',
  'In short, the world would not gain if everyone used only one world language.',
  'It would lose variety, meaning, and a sense of humanity.',
  'That is why I see this possible change as a bad one.',
];
const vocabulary=[
  [['researchers','experts','研究人員'],['in the future','one day','在未來'],['humanity','people','人類'],['voluntarily settle on one shared global language','choose to use the same language everywhere','自願選用共同全球語言']],
  [['negative development','bad','負面發展'],['not merely a tool for communication','does more than help people talk','不只是溝通工具'],['carries culture','keeps culture','承載文化'],['identity','who we are','身份認同'],['social memory','shared memories','社會記憶']],
  [['The first problem','First','第一個問題'],['cultural loss','cultures could be lost','文化流失']],
  [['Every language','Each language','每種語言'],['particular way of seeing the world','special way to understand life','獨特世界觀'],['humour','jokes','幽默'],['local traditions','local customs','本地傳統'],['moral values','ideas about right and wrong','道德價值']],
  [['gradually abandon their mother tongues','slowly stop using their first languages','逐漸放棄母語'],['in favour of a single global language','choose only one world language','轉用單一全球語言'],['would not simply move into','will not simply move across','不會直接轉移'],['disappear in translation','be lost when translated','在翻譯中消失']],
  [['traditional songs','old songs','傳統歌曲'],['proverbs','sayings','諺語'],['wordplay','playful words','文字遊戲'],['historical references','events from the past','歷史典故'],['fully recreated','copy completely','完全重現']],
  [['Once a language stops being used','When families, schools, and communities stop using a language','一旦語言停用'],['doors locked','been locked','門被鎖上'],['books may still exist','books remain','書仍存在'],['ordinary people can no longer enter and live inside them','people can no longer go in and make them part of their lives','人難以再活在其中']],
  [['Another serious concern','Second','另一嚴重問題'],['single global language','one world language','單一全球語言'],['deepen inequality','make unfair differences worse','加深不平等'],['rather than remove it','instead of ending them','而非消除']],
  [['global standard','chosen language','全球標準'],['almost certainly','probably','幾乎肯定'],['existing political, economic or technological power','already controls politics, money, or technology','既有政經科技權力']],
  [['already speak it','already speak it','本已說這語言'],['immediate advantage','quick head start','即時優勢'],['international institutions','world organisations','國際機構'],['spend years catching up','need years to catch up','花多年追趕']],
  [['gatekeeping system','barrier to opportunities','把關制度'],['opportunities depend less on talent','what people could do would depend less on skill','機會較少取決於才能'],['early access to the dominant language','whether they learned it early','及早接觸主導語言']],
  [['In this sense','So','從這角度'],['linguistic uniformity','one shared language','語言一致'],['look fair on the surface','seem fair','表面公平'],['reward the already privileged','helping people who were already better off','獎賞既得優勢者']],
  [['In conclusion','In short','總結'],['would not become richer','would not gain','不會更豐富'],['one global language','one world language','一種全球語言']],
  [['flatter','lose variety','單薄'],['poorer','meaning','貧乏'],['less human','a sense of humanity','少人性厚度']],
  [['For this reason','That is why','基於這原因'],['predicted change','possible change','預測轉變'],['negative development','bad one','負面發展']],
];
const chunkOverrides={2:['The first problem is','cultural loss.'],13:['It would become flatter,','poorer and less human.'],14:['For this reason,','I see this predicted change as a negative development.']};
const simpleChunkOverrides={2:['First, cultures','could be lost.'],13:['It would lose variety,','meaning, and a sense of humanity.'],14:['That is why','I see this possible change as a bad one.']};
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Some teachers believe that, in the future, schools may voluntarily settle on one shared teaching platform.','may 指可能發生，未把預測當成確定事實。','此句只交代假設背景，作者下一句才評價。',[1,2,7],F('Some [提出預測者] believe that, in the future, [群體] may [可能選擇]','先準確交代被討論的未來預測。','題目建基於尚未發生的預測，要避免把可能性寫成事實時。',[['Some ','link','有些'],['researchers','slot','提出預測者'],[' believe that, in the future, ','link','認為未來'],['humanity','slot','群體'],[' may ','link','可能'],['voluntarily settle on one shared global language.','slot','可能選擇']])),
  S('I believe this would be a negative development because education is not merely a tool for finding work; it also carries culture, identity and social memory.','not merely...; it also... 說明事物有實用與深層兩種價值。','原因是失去文化與記憶，不是說交流本身有害。',[0,3,7],F('I believe this would be a negative development because [事物] is not merely [工具用途]; it also carries [深層價值]','表明負面立場，並指出只看工具效率會遺漏的價值。','評價統一或取代方案時，要指出被取代事物超出實用功能的價值。',[['I believe this would be a negative development because ','link','立場與原因'],['language','slot','事物'],[' is not merely ','link','不只是'],['a tool for communication','slot','工具用途'],['; it also carries ','link','還承載'],['culture, identity and social memory.','slot','深層價值']])),
  S('The first problem is loss of local knowledge.','直接點出第一項代價，供後文逐層解釋。','不是全文結論；接下來還有第二種不平等代價。',[1,3,7],F('The first problem is [第一項主要代價]','為第一主體段設定可證明的問題。','一項發展有多種壞處，要先清楚命名第一種時。',[['The first problem is ','link','第一問題是'],['cultural loss.','slot','主要代價']])),
  S('Every community contains a particular way of solving problems, from shared rules and humour to local traditions and moral values.','from...to... 列出文化內涵的範圍，使抽象損失具體化。','例子說明獨特內容，並非宣稱某文化比另一文化優越。',[2,4,5],F('Every [文化載體] contains a particular way of [理解或行動], from [例一] to [例二]','用有範圍的實例解釋文化載體保存甚麼。','說某種文化載體會流失時，須先展示其中有哪些具體內容。',[['Every ','link','每一'],['language','slot','文化載體'],[' contains a particular way of ','link','包含一種方式'],['seeing the world','slot','理解或行動'],[', from ','link','從'],['family relationships and humour','slot','例一'],[' to ','link','到'],['local traditions and moral values.','slot','例二']])),
  S('If families gradually abandon local recipes in favour of identical fast food, these memories would not simply move into a new container; many would disappear in the change.','If 假設替代；分號後否定「內容會原封不動轉移」。','文章關注內容流失，不是反對所有新語言的學習。',[3,5,6],F('If [群體] gradually abandon [舊載體] in favour of [統一替代], [意義] would not simply move into [新載體]; many would disappear [過程]','指出替代舊載體時，內容可能跟着消失。','有人假設改用新形式便能完整保存舊內容，需要反駁時。',[['If ','link','如果'],['people','slot','群體'],[' gradually abandon ','link','逐漸放棄'],['their mother tongues','slot','舊載體'],[' in favour of ','link','轉而使用'],['a single global language','slot','統一替代'],[', ','link','則'],['these meanings','slot','意義'],[' would not simply move into ','link','不會直接搬入'],['a new linguistic container','slot','新載體'],['; many would disappear in ','link','許多會消失於'],['translation.','slot','過程']])),
  S('For example, old dances often depend on rhythm, movement and historical references that cannot be fully recreated in a video.','具體例子展示為何轉換形式後會損失細節。','不是聲稱舊作品必然完全消失；是無法完整重現。',[3,4,6],F('For example, [文化作品] often depend on [獨有元素] that cannot be fully recreated in [替代形式]','用具體作品證明有些內容難以搬到新形式。','已說明文化流失後，要拿出依賴原本形式的可理解例子時。',[['For example, ','link','舉例'],['traditional songs, proverbs and stories','slot','文化作品'],[' often depend on ','link','往往依賴'],['sounds, wordplay and historical references','slot','獨有元素'],[' that cannot be fully recreated in ','link','無法完全重現於'],['another language.','slot','替代形式']])),
  S('Once a local dialect stops being used in homes, schools and public life, it becomes like an old library with the doors locked: the books may still exist, but ordinary people can no longer enter and live inside them.','鎖上圖書館的比喻區分「資料仍在」與「日常可使用」。','不是說書本會物理消失，而是人與內容斷開。',[4,5,7],F('Once [文化資源] stops being used in [日常場域], it becomes like an old library with the doors locked: the books may still exist, but ordinary people can no longer enter and live inside them','以比喻說明保存記錄不等於活生生的使用。','有人用「資料仍保存」反駁文化流失時，指出使用渠道已斷開。',[['Once ','link','一旦'],['a language','slot','文化資源'],[' stops being used in ','link','不再用於'],['homes, schools and public life','slot','日常場域'],[', it becomes like an old library with the doors locked: the books may still exist, but ordinary people can no longer enter and live inside them.','link','記錄仍在卻無法進入']])),
  S('Another serious concern is that a single school exam would deepen inequality rather than remove it.','rather than 把宣稱目標與可能真實結果對照。','此段不是再談歌曲損失，而是談權力與機會。',[2,6,8],F('Another serious concern is that [統一制度] would deepen [不公平] rather than remove it','轉向第二個代價：看似公平的統一可能擴大不平等。','一項統一方案被說成能促進公平時，要質疑其實際分配效果。',[['Another serious concern is that ','link','另一問題是'],['a single global language','slot','統一制度'],[' would deepen ','link','會加深'],['inequality','slot','不公平'],[' rather than remove it.','link','而非消除']])),
  S('The platform chosen as the global standard would almost certainly belong to, or be controlled by, a group with existing political, economic or technological power.','指出訂定標準者可能已掌權，建立後文優勢分配的因果。','不能直接假設全球標準是中立自然產生。',[7,9,10],F('The [被選標準] chosen as the global standard would almost certainly belong to, or be controlled by, [既有權力者]','追問誰能決定標準，而非只看表面一致。','單一標準被說成中立時，要檢查制定標準者本身的權力。',[['The ','link','這'],['language','slot','被選標準'],[' chosen as the global standard would almost certainly belong to, or be controlled by, ','link','很可能受制於'],['a group with existing political, economic or technological power.','slot','既有權力者']])),
  S('Those who already know the new exam would enjoy an immediate advantage in education, business and international institutions, while others would have to spend years catching up.','while 對照先有優勢者與遲起步者的成本。','不是說所有人學習能力不同，而是起跑線不同。',[7,8,10],F('Those who already [掌握標準] would enjoy an immediate advantage in [多種機會], while others would have to spend years catching up','展示同一新標準如何令群體起點不一。','要分析統一規則的公平性時，具體比較先懂與後學者的成本。',[['Those who already ','link','本已'],['speak it','slot','掌握標準'],[' would enjoy an immediate advantage in ','link','立即獲優勢於'],['education, business and international institutions','slot','多種機會'],[', while others would have to spend years catching up.','link','別人須多年追趕']])),
  S('This would turn education into a gatekeeping system, where opportunities depend less on talent and more on early access to expensive preparation.','less...more... 說明機會由能力轉向先接觸標準。','不是反對能力本身，而是反對不公平的門檻。',[8,9,11],F('This would turn [領域] into a gatekeeping system, where opportunities depend less on [應有標準] and more on [先有資源]','說出統一標準背後的篩選機制。','已展示起點差異後，要說明它如何改變誰能得到機會時。',[['This would turn ','link','會把'],['communication','slot','領域'],[' into a gatekeeping system, where opportunities depend less on ','link','變成把關，較少靠'],['talent','slot','應有標準'],[' and more on ','link','更多靠'],['early access to the dominant language.','slot','先有資源']])),
  S('In this sense, a single digital system would look fair on the surface but would quietly reward the already privileged.','look fair...but...reward 把表面一致與分配結果區分。','不是說所有形式上的共同標準都必然公平。',[8,9,10],F('In this sense, [表面一致] would look fair on the surface but would quietly reward the already privileged','將前面的權力分析收束成公平判斷。','一項措施表面人人適用，但先有資源者獲更多好處時。',[['In this sense, ','link','從這角度'],['linguistic uniformity','slot','表面一致'],[' would look fair on the surface but would quietly reward the already privileged.','link','看似公平卻獎賞既得者']])),
  S('In conclusion, the city would not become richer if every district offered only one kind of culture.','if...only one... 收束對單一化的總體判斷。','此處的 richer 指文化多樣與社會厚度，不是單指收入。',[1,7,13],F('In conclusion, [整體] would not become richer if [人人只用一種形式]','以整體損失概括兩段理由。','已說明文化和公平代價後，結論要回到「正面還是負面」時。',[['In conclusion, ','link','總結'],['the world','slot','整體'],[' would not become richer if ','link','不會更豐富，若'],['everyone spoke only one global language.','slot','人人只用一種形式']])),
  S('It would become quieter, narrower and less welcoming.','三個平行形容詞濃縮前文文化與社會損失。','不是新的證據；詳細機制已在兩段主體。',[11,12,14],F('It would become [損失一], [損失二] and [損失三]','以節奏清楚的三項後果強化結論。','前文已提供理由，結尾需要簡短概括整體變化時。',[['It would become ','link','會變得'],['flatter','slot','損失一'],[', ','link','及'],['poorer','slot','損失二'],[' and ','link','與'],['less human.','slot','損失三']])),
  S('For this reason, I see this predicted change as a harmful development.','For this reason 明確把前面兩種代價連回評價。','不是單純重複預測，而是作出正負判斷。',[0,1,12],F('For this reason, I see this predicted change as a [正負評價] development','最後直接回答題目要求的發展評價。','題目問發展正面或負面時，結尾須以清晰立場收束。',[['For this reason, I see this predicted change as a ','link','因此評價為'],['negative','slot','正負評價'],[' development.','link','發展']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者如何評價人類自願選用單一全球語言？',['負面；文化會流失，既有權力者還可能擴大優勢','正面；只因所有翻譯工作會消失','中立；沒有評估任何可能後果','正面；所有人會立即有相同起點'],'作者明言 negative development；兩段理由分別是文化損失及不平等。'),
  {type:'multi',prompt:'選出兩段主體各自的核心問題',detail:'選兩項，再按「確認」。',options:['母語退出日常生活後，歌曲、諺語和記憶難以完整傳承','全球標準通常有權力來源，先會說的人可立即獲益','所有語言都具有完全相同的歷史與雙關語','單一語言保證消除教育和商業上的差距'],correct:[0,1],why:'首段談文化載體；次段追問標準制定權與起點不一。'},
];
const route=[sequence('排好全文四段',[
  ['引言 · 負面立場','預測人類或自願選用共同語言；作者指出語言還承載文化與身份。'],
  ['主體一 · 文化流失','母語不用後，歌曲、諺語、故事的獨有內容難以完整轉移。'],
  ['主體二 · 擴大不平等','既有強者可能決定標準；先會說的人即時佔優。'],
  ['結論 · 世界變得單薄','單一化削弱文化與公平，故屬負面發展。'],
],'預測 → 文化載體流失 → 權力與門檻 → 負面判斷。')];
const evidence=[
  Q('語言除了溝通還承載甚麼？',['文化、身份認同與社會記憶','只有字典頁數與語速','只有手機和翻譯程式','只有政治制度與貨幣'],'引言明列 culture, identity and social memory。'),
  Q('歌曲、諺語及故事依賴哪三種難轉移元素？',['聲音、文字遊戲與歷史典故','電池、網速與螢幕大小','天氣、租金與機票價格','課室、座位與試卷頁數'],'原文列 sounds, wordplay and historical references。'),
  Q('鎖上門的舊圖書館比喻表達甚麼？',['記錄或仍存在，普通人卻難再日常使用其中內容','所有書本會在同一天物理消失','圖書館只需要更換入口顏色','人只要會讀書便完全不受語言影響'],'books may still exist, but ordinary people can no longer enter。'),
  Q('全球標準語言可能由哪種群體掌握？',['本已有政治、經濟或科技權力的群體','任何完全沒有影響力的隨機個人','只由每一位兒童獨立決定','一個與權力毫無關係的空白制度'],'原文明確指出 existing political, economic or technological power。'),
  Q('誰會在新標準下立即取得優勢？',['本來已會說所選語言的人','所有人無論起點都同時熟練','只會唱傳統歌曲的人','完全沒有接受教育的人'],'already speak it would enjoy an immediate advantage。'),
  Q('作者認為機會會較少取決於甚麼，更多取決於甚麼？',['較少看才能，更多看是否及早接觸主導語言','較少看資源，更多看個人的才華','較少看語言，更多看天氣溫度','較少看教育，更多看旅行次數'],'less on talent and more on early access。'),
];
const logic=[
  sequence('第一主體段：文化為何可能流失？',[
    ['問題','單一化帶來文化流失。'],
    ['內容','每種語言載有家庭、幽默、傳統與價值觀。'],
    ['替代風險','棄用母語不等於所有意義會搬進新語言。'],
    ['具體證據','歌曲、諺語和故事依賴聲音、雙關與歷史。'],
    ['比喻','記錄仍在，日常入口卻像圖書館被鎖上。'],
  ],'獨有內容 → 母語退出 → 難以翻譯 → 保存不等於使用。'),
  sequence('第二主體段：統一為何可能加深不平等？',[
    ['另一問題','共同標準未必消除差距。'],
    ['權力來源','標準很可能受既有強者控制。'],
    ['起點差異','先會說者立即佔優，別人多年追趕。'],
    ['機制','機會越來越取決於先接觸主導語言。'],
    ['總結','表面公平，實際獎賞既得優勢者。'],
  ],'誰定標準 → 誰先掌握 → 誰得到機會 → 表面與實際公平不同。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('一所學校只准所有學生使用同一套家中付費的學習軟件。','本文的公平分析會先追問甚麼？',['誰早已能用這套軟件，誰要花時間與金錢追趕','同一軟件的圖示顏色是否與校服完全相同','只要規則一樣，所有家庭起點便必定相同','學校統一工具後，每位學生才華都會消失'],['同一規則可因先有資源而產生不同效果。','未觸及機會。','忽略起點。','沒有這種因果。'],[7,8,9,10,11],'uniformity can reward the already privileged。'),
  T('博物館將地方口述歷史錄成文字，長者卻不再向孩子講述。','鎖上圖書館的比喻如何套用？',['紀錄仍在，但日常傳講的入口正逐漸關閉','文字一經保存，就等於長者每天仍親口講述','不再口述證明錄音與文字記錄都完全無用','只要有檔案，孩子便必然能體會原來語氣'],['保存資料與活用傳承不同。','混淆記錄與使用。','原文不否定保存。','忽略活的語境。'],[5,6],'books may still exist, but people can no longer enter。'),
  T('一家公司選用某部門本已熟悉的軟件，規定所有部門立即轉用。','哪個風險符合第二段？',['原來熟悉軟件的部門可能立刻佔有制度優勢','所有部門已有相同經驗，所以轉用沒有成本','新規則一旦公布，員工技能便不再重要','統一軟件會自動消除公司內所有不平等'],['先掌握標準者有即時優勢。','忽略起點。','誇大。','與原文警告相反。'],[8,9,10],'already speak it...immediate advantage。'),
  T('有人說把傳統歌謠翻成另一語言，就能保留原作全部效果。','作者會用哪項細節反駁？',['聲音、雙關與歷史典故未必能在新語言重現','只要譯文押韻，原作所有意義便保持不變','傳統歌曲從來沒有聲音或地方歷史內容','所有翻譯都完全無法傳達任何基本意思'],['原文指出不能 fully recreated。','押韻不足以保證。','與來源相反。','過度否定翻譯。'],[4,5],'sounds, wordplay and historical references。'),
  T('政府統一所有地方節日名稱，稱這只是換一個說法。','本文會要求檢查哪個層面？',['原名稱承載的記憶、習俗與身份有否隨之流失','新名稱的字體是否比原來稍微大一點','只要字數相同，節日的文化便必定完整','節日改名後，所有人一定會立即停止慶祝'],['替代形式未必保留原來文化意義。','只看外觀。','字數不等於內容。','過度斷言。'],[1,3,4],'language carries culture, identity and social memory。'),
  T('某國推出全國統一考試，富裕家庭早已使用對應教材。','哪項結論最能遷移本文論證？',['規則看似相同，已有教材者可能仍更容易得益','規則既相同，家庭資源就必然完全沒有差別','富裕家庭有教材，便可證明所有學生都不必學習','統一考試只能考語言，完全不能用於其他科目'],['表面一致不保證分配公平。','忽略早期資源。','結論過度。','與情境無關。'],[8,9,10,11],'look fair on the surface but reward privileged。'),
  T('小鎮停用本地方言，改以全國通用語辦學與發布通知。','哪項同時承認好處與風險？',['通用語或方便交流，但方言的故事仍可能難以傳承','通用語一經使用，地方故事便會必然自動保存','地方故事值得保留，故所有全國交流都須停止','只要通知更易懂，家庭中原有語言就完全無關'],['本文反對把效率當唯一尺度。','沒有自動保存。','過度排斥交流。','忽略日常使用。'],[1,3,4,5,6],'not merely a tool for communication。'),
  T('一個平台讓所有創作者使用同一格式，原來熟悉格式的人先獲曝光。','哪項是「把關制度」的核心？',['機會更受先前接觸格式的程度影響，而非只看作品','格式統一後，每位創作者作品品質便完全相同','先獲曝光者必然比其他創作者更有創作才能','平台只要說規則一致，就不必再問資源差距'],['gatekeeping 將機會連到早期接觸。','品質仍不同。','先有優勢非才能證據。','須看實際效果。'],[9,10],'opportunities depend less on talent and more on early access。'),
  T('地方學校保留母語課，同時教授一種國際通用語。','依本文重點，為何保留母語課有意義？',['能讓學生使用並承接本地故事、幽默與文化記憶','只要學國際語，母語內容就會自動全部轉移','母語課存在，就必須永久禁止任何其他語言','保留母語課證明翻譯技術完全沒有任何用途'],['保持活的文化使用入口。','意義不一定全轉移。','原文沒有排斥多語。','不涉工具全無用。'],[1,3,4,5,6],'cultural loss；library with doors locked。'),
  T('某機構說新標準會讓所有人平等，因此毋須分析誰制定標準。','第二段指出哪個缺口？',['還須追查制定者權力，以及不同群體原有起點','只要有共同標準，制定者身份便必然毫無影響','沒有共同標準時，所有人便必然擁有相同權力','任何標準都一定完全由最弱勢群體單獨決定'],['權力來源與先有能力影響公平。','排除關鍵變數。','沒有這種保證。','與原文推測相反。'],[7,8,9,11],'controlled by a group with existing power。'),
  T('評估一項統一政策時，除了問是否方便，還要問哪些結果？','哪項是本文要求一併檢查的後果？',['文化內容能否留存，以及機會是否分配得更公平','標語是否好看，以及宣傳片是否夠長夠熱鬧','每個人的名字是否相同，以及手機是否同款','政策是否只有一頁，以及會場座位是否夠多'],['兩段主體分別檢驗文化和機會。','只看外觀。','沒有關係。','沒有關係。'],[1,2,3,4,7,8,9,10,11],'cultural loss；deepens inequality。'),
  T('要把全文立場寫成一句不誇大的結論。','哪項最符合原文？',['單一語言或損文化並加劇不平等，因此屬負面發展','單一全球語保證令所有人立即擁有同樣機會','只要有共同語言，傳統歌曲便會完整保留原味','所有語言一旦共存，跨國交流就完全不可能'],['would 作審慎評價；兩項主要代價並列。','與原文相反。','無保證。','原文沒說多語阻止交流。'],[1,2,4,5,6,7,8,9,10,11,12,13,14],'negative development: cultural loss and inequality。'),
];
const plausibleAlternatives=[
  [['先比較軟件費用，再把使用能力當成同一水平','規則既一致，先用過軟件的經驗可略過不查','先觀察學生才華，不問家庭能否負擔軟件'],['費用重要，但還要查已有的使用能力。','相同規則可能放大原有資源差距。','才華不能代替取得工具的機會。']],
  [['只看文字是否完整保存，不查孩子會否日常接觸','長者停止講述後，先把保存方式視為主要問題','先增加文字檔案數量，不比較口述與閱讀效果'],['資料保存與活的傳承是不同問題。','題目已說文字記錄存在，問題是使用入口。','數量不能說明孩子是否承接語氣與文化。']],
  [['先以新規則是否清晰，評估各部門轉用成效','以既有部門為標準，少查其他部門的學習成本','只比較轉用後產量，不看熟悉格式的先發優勢'],['規則清楚不等於各部門起點相同。','這正把先掌握標準者的位置當作普遍起點。','產量差異可能受到此前接觸的影響。']],
  [['只比較譯文押韻，少查原作的聲音與雙關','先保存歌詞大意，便把歷史典故列為次要','翻譯保留內容後，暫不查地方表演語境'],['押韻不能保證其他語言效果也保留。','典故是範文明確指出的文化層次。','表演語境也影響原作的文化效果。']],
  [['先看名稱讀起來是否方便，不查原有文化記憶','新舊名稱字數相近，便把習俗差異列次要','只記改名後參與人數，少問身份意義有否改變'],['方便不足以檢驗文化代價。','字數不能代表原有的習俗與記憶。','人數不等於文化身份完整保留。']],
  [['統一考試後，先用同一分數比較而不問教材來源','富裕家庭有教材，便把教師教學差異放次要','只查試題難度，不看準備資源如何實際分配'],['同一分數可能反映不同準備起點。','教材優勢不應遮住其他支援差別。','難度不能獨立證明制度公平。']],
  [['優先提高通用語效率，方言故事留待課後自發保存','以通用語增加交流，便把家庭語言使用列次要','只看通知易懂與否，不查方言課是否仍存在'],['效率有利，但日常傳承不能只靠自發。','家庭使用也是文化延續的入口。','行政便利不能代表地方故事被保存。']],
  [['把曝光差異主要歸因作品質素，不查舊格式經驗','先評估格式是否一致，再推定曝光機會較公平','只比較曝光數字，不看誰先熟悉平台的格式'],['先有格式經驗可影響機會。','程序一致不能保證實際效果一致。','曝光結果需要連回先前資源。']],
  [['先增國際語時數，地方故事由翻譯材料承接','保留母語課名額，但減少日常母語使用機會','只看學生能否翻譯，少問能否聽懂地方幽默'],['翻譯不能全然保留文化語氣。','課堂存在仍需有活的使用空間。','文化理解不只是字面轉換。']],
  [['先檢查標準是否清楚，不追問誰早已掌握它','以全體同用規則為據，暫不比較群體權力','只看新制度的效率，不查制定者與使用者差異'],['清楚標準仍可能由既有強勢者制定。','相同程序不等於相同起點。','權力和資源正是第二段要分析的變數。']],
  [['先評估共同語言的速度，文化傳承另案再談','只看文化資料保存量，不查不同群體的機會','只查考試與職場機會，不問地方語言仍否使用'],['速度只是其中一項效益，題目要求兩項代價。','保存資料未處理機會分配。','機會公平也不能取代文化延續。']],
  [['共同語或提升交流，先以效率作唯一政策尺度','保留傳統歌曲的譯本，便不另查原語的使用','只談語言數量變化，不討論文化與機會後果'],['範文同時評估文化和公平代價。','譯本不足以自動保留原語的活用。','語言數量本身不能解釋為何是負面發展。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:66',meta:{topic:'自願選用單一全球語言的利弊',summary:'作者認為單一全球語言是負面發展。語言還承載文化、身份與記憶；母語退出家庭及公共生活時，歌曲、諺語和故事的獨有內容難以完整轉移。另一問題是標準可能由既有強者掌握，先會說的人即時佔優，表面平等卻擴大機會差距。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
