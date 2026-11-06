const simple=[
  'In the past few years, online film services have changed how people watch films and TV shows.',
  'Because people can choose from many films and shows at home, some think cinemas will one day disappear.',
  'I strongly disagree: cinemas give people a shared experience of sights and sounds that online viewing cannot fully copy, and film companies still need them to help sell films.',
  'The best reason cinemas will stay is that seeing a film on a big screen feels very different from seeing it on a phone, computer, or TV.',
  'A cinema does more than let people watch a story; it brings sound, a big picture, and the feeling of the room together.',
  'When it gets dark and everyone becomes quiet, even a normal film can stay in people’s minds longer.',
  'At home, however, phone messages, noise in the house, or the wish to stop the film often break the experience.',
  'For example, action, fantasy, and scary films often feel much stronger in a cinema, where viewers can see and hear the effects in the way the makers planned.',
  'This special feeling gives cinemas a job that websites cannot easily do in the same way.',
  'Second, cinemas are still useful to film makers and viewers as places where people come together for culture.',
  'Big film companies still put films in cinemas first to get people excited, get news coverage, and make the film feel like a special event.',
  'A film that does well in cinemas often gains a good name before it goes onto online film services.',
  'Also, many people see a cinema visit as something to do together, not just something that fills time.',
  'Families, partners, and friends often visit to celebrate birthdays, spend weekends, or see a special new film.',
  'If cinemas closed, society would lose one of the few places for entertainment where people who do not know each other can enjoy a story together.',
  'In short, online film services make watching at home easier, but they will not make every cinema close.',
  'Cinemas will remain because they offer a feeling of being inside the story, shared company, and cultural value that a private screen cannot give in the same way.',
];
const vocabulary=[
  [['In recent years','In the past few years','近年'],['online streaming platforms','online film services','網上串流平台'],['changed the way','changed how','改變方式'],['films and series','films and TV shows','電影劇集']],
  [['viewers','people','觀眾'],['huge range of content','many films and shows','大量內容'],['eventually disappear','one day disappear','最終消失']],
  [['completely disagree','strongly disagree','完全不同意'],['social and sensory experience','shared experience of sights and sounds','社交感官體驗'],['cannot fully replace','cannot fully copy','不能完全取代'],['commercially important','need them to help sell films','商業重要']],
  [['strongest reason','best reason','最有力原因'],['will survive','will stay','繼續存在'],['large screen','big screen','大銀幕'],['fundamentally different','very different','本質不同'],['laptop','computer','手提電腦']],
  [['not just a place where people consume a story','does more than let people watch a story','不只是看故事的地方'],['scale','a big picture','畫面規模'],['atmosphere','feeling of the room','氣氛'],['work together','together','共同發揮']],
  [['lights go down','it gets dark','燈光暗'],['audience becomes silent','everyone becomes quiet','觀眾安靜'],['ordinary film','normal film','普通電影'],['more memorable','stay in people’s minds longer','更難忘']],
  [['By contrast','At home, however','相比之下'],['home viewing','At home','在家觀影'],['interrupted','break the experience','被打斷'],['household noise','noise in the house','家中噪音'],['temptation to pause','wish to stop the film','想暫停']],
  [['For example','For example','例如'],['horror films','scary films','恐怖片'],['far more powerful','much stronger','更震撼'],['visual effects and sound design','see and hear the effects','視效音效'],['as intended','in the way the makers planned','按原意設計']],
  [['unique atmosphere','special feeling','獨特氣氛'],['gives cinemas a role','gives cinemas a job','賦予電影院角色'],['cannot simply copy','cannot easily do in the same way','不能輕易複製']],
  [['Another reason','Second','另一原因'],['filmmakers','film makers','製作人'],['audiences','viewers','觀眾'],['public cultural spaces','places where people come together for culture','公共文化空間']],
  [['Major studios','Big film companies','大型片商'],['theatrical releases','put films in cinemas first','院線上映'],['create excitement','get people excited','製造期待'],['media attention','news coverage','媒體關注'],['sense of occasion','feel like a special event','盛事感']],
  [['successful in cinemas','does well in cinemas','影院成功'],['gains prestige','gains a good name','獲聲望'],['moves to streaming services','goes onto online film services','轉到串流']],
  [['Moreover','Also','此外'],['treat going to the cinema as a shared activity','see a cinema visit as something to do together','視看電影為共同活動'],['not merely a way to pass time','not just something that fills time','不只是消磨時間']],
  [['couples','partners','情侶'],['mark birthdays','celebrate birthdays','慶生日'],['special releases','a special new film','特別上映']],
  [['If cinemas disappeared','If cinemas closed','若影院消失'],['society would lose','society would lose','社會失去'],['strangers','people who do not know each other','陌生人'],['enjoy the same story together','enjoy a story together','共賞故事']],
  [['In conclusion','In short','總結'],['although','but','儘管'],['made home entertainment more convenient','make watching at home easier','家庭娛樂更方便'],['not cause cinemas to close completely','not make every cinema close','不致全部關閉']],
  [['continue to exist','remain','繼續存在'],['immersion','feeling of being inside the story','沉浸感'],['community','shared company','群體感'],['private screens cannot match','private screen cannot give in the same way','私人屏幕難比']],
];
const chunkOverrides={8:['This unique atmosphere gives cinemas a role','that online platforms cannot simply copy.'],13:['Families, couples and friends often go there','to mark birthdays, weekends or special releases.'],16:['Cinemas will continue to exist because they provide immersion, community and cultural value','that private screens cannot match.']};
const simpleChunkOverrides={8:['This special feeling gives cinemas a job','that websites cannot easily do in the same way.'],13:['Families, partners, and friends often visit','to celebrate birthdays, spend weekends, or see a special new film.'],16:['Cinemas will remain because they offer a feeling of being inside the story, shared company, and cultural value','that a private screen cannot give in the same way.']};
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('In recent years, school video platforms have changed the way pupils watch films and series.','先承認新服務確實改變使用習慣。','改變方式不等於舊場所必然關閉。',[1,2,3],F('In recent years, [新服務] have changed the way [人] watch films and series','引言交代科技帶來的真實轉變。','要先承認一項新服務確實改變了人們的行為方式，再討論其後果時。',[['In recent years, ','link','近年'],['online streaming platforms','slot','新服務'],[' have changed the way ','link','改變...方式'],['people','slot','人'],[' watch films and series.','link','觀看內容']])),
  S('Because readers can now enjoy a huge range of books at home, some argue that libraries will eventually disappear.','Because 說出對方推斷消失的原因。','這是某些人的看法，不是作者的結論。',[0,2,9],F('Because [人] can now enjoy a huge range of [內容] at home, some argue that [舊場所] will eventually disappear','準確重述待反駁的便利推論。','有人認為家中可取得大量內容，因此實體場所必消失時。',[['Because ','link','因為'],['viewers','slot','人'],[' can now enjoy a huge range of ','link','如今在家可享大量'],['content','slot','內容'],[' at home, some argue that ','link','有人因此認為'],['cinemas','slot','舊場所'],[' will eventually disappear.','link','終會消失']])),
  S('I completely disagree with this view because libraries offer a social and sensory experience that reading apps cannot fully replace, and they remain commercially important for publishers.','because 後預告體驗與產業兩條理由。','作者並非否認家中串流方便。',[1,3,9],F('I completely disagree with this view because [舊場所] offer a social and sensory experience that [新服務] cannot fully replace, and they remain commercially important for [產業]','明示反對與兩個保留理由。','實體場所既有獨特體驗又具產業功能時。',[['I completely disagree with this view because ','link','完全不同意，因'],['cinemas','slot','舊場所'],[' offer a social and sensory experience that ','link','提供社交感官體驗，'],['streaming','slot','新服務'],[' cannot fully replace, and they remain commercially important for ','link','且仍有商業價值於'],['the film industry.','slot','產業']])),
  S('The strongest reason libraries will survive is that studying in a shared quiet room is fundamentally different from studying on a phone, laptop or television.','is fundamentally different 用同一活動比較兩種場景。','不只是畫面大小，後文再說聲音與氣氛。',[1,2,4],F('The strongest reason [實體場所] will survive is that [其中活動] is fundamentally different from [家中替代方式]','以體驗差異提出首個存續理由。','新舊方式做相似活動，但場所帶來的感受不同時。',[['The strongest reason ','link','最強理由'],['cinemas','slot','實體場所'],[' will survive is that ','link','會存續，因'],['watching a film on a large screen','slot','其中活動'],[' is fundamentally different from ','link','本質不同於'],['watching it on a phone, laptop or television.','slot','家中替代方式']])),
  S('A library is not just a place where people consume a story; it is a place where sound, scale and atmosphere work together.','not just...; it is... 把內容取得與場景體驗分開。','不是說串流不能播放同一故事，而是整體感受不同。',[3,5,6],F('A [場所] is not just a place where people consume a story; it is a place where sound, scale and atmosphere work together','說明實體空間提供的不只內容本身。','兩個渠道有相同內容時，要指出場所另外加入哪些感官因素。',[['A ','link','一個'],['cinema','slot','場所'],[' is not just a place where people consume a story; it is a place where sound, scale and atmosphere work together.','link','不只看故事，亦有聲畫氣氛']])),
  S('When the lights go down and the audience becomes silent, even a familiar story can feel more memorable.','When 營造情境；even 說平凡內容也可更難忘。','作者沒有聲稱每部電影在戲院都必然優秀。',[4,6,7],F('When [環境轉變], even [普通內容] can feel more memorable','用具體的觀影時刻呈現氣氛作用。','抽象說場所體驗不同後，要描繪觀眾實際感受的轉變時。',[['When ','link','當'],['the lights go down and the audience becomes silent','slot','環境轉變'],[', even ','link','甚至'],['an ordinary film','slot','普通內容'],[' can feel more memorable.','link','可更難忘']])),
  S('By contrast, studying at home is often interrupted by messages, household noise or the temptation to pause.','By contrast 對照家中可能有的干擾。','不是說每個家庭每次都有全部干擾，often 保留頻率。',[4,5,7],F('By contrast, [家中活動] is often interrupted by [三種干擾]','把實體場所的沉浸感與家中分心比較。','已說明專注氣氛，再指出另一環境常見中斷來源時。',[['By contrast, ','link','相比之下'],['home viewing','slot','家中活動'],[' is often interrupted by ','link','常被打斷於'],['messages, household noise or the temptation to pause.','slot','三種干擾']])),
  S('For example, concert films and nature documentaries are usually far more powerful in a hall, where the visual effects and sound design can be experienced as intended.','具體類型與聲畫設計說明場地感官差異。','不是說所有類型電影都只能在影院觀看。',[3,5,8],F('For example, [內容類型] are usually far more powerful in [場所], where the visual effects and sound design can be experienced as intended','用適合大場地的作品支持感官理由。','主張場所感受難複製時，要舉聲畫設計最能顯示差異的例子。',[['For example, ','link','例如'],['action films, fantasy films and horror films','slot','內容類型'],[' are usually far more powerful in ','link','通常更震撼於'],['a theatre','slot','場所'],[', where the visual effects and sound design can be experienced as intended.','link','按創作者設計體驗']])),
  S('This unique atmosphere gives live theatre a role that online platforms cannot simply copy.','由上面的聲畫例子抽出不可簡單複製的場所角色。','不是說串流全無價值，而是差異仍在。',[5,7,9],F('This unique atmosphere gives [場所] a role that [線上服務] cannot simply copy','首段用獨特氣氛回扣存續理由。','已有具體環境與作品例子，需用一句總結其差異時。',[['This unique atmosphere gives ','link','獨特氣氛賦予'],['cinemas','slot','場所'],[' a role that ','link','一種角色'],['online platforms','slot','線上服務'],[' cannot simply copy.','link','無法簡單複製']])),
  S('Another reason is that public libraries remain valuable to both writers and readers as public cultural spaces.','第二段由個人觀影體驗轉向文化空間及產業價值。','不是重複大銀幕與家中噪音。',[2,8,10],F('Another reason is that [場所] remain valuable to both [創作者] and [受眾] as public cultural spaces','轉向實體場所對創作者和大眾的雙重作用。','已談使用者感受，還需說明文化或商業網絡如何受益時。',[['Another reason is that ','link','另一原因'],['cinemas','slot','場所'],[' remain valuable to both ','link','仍有價值於'],['filmmakers','slot','創作者'],[' and ','link','與'],['audiences','slot','受眾'],[' as public cultural spaces.','link','作公共文化空間']])),
  S('Major publishers still use book launches to create excitement, media attention and a sense of occasion.','說明公開發行如何製造期待與盛事感。','不是只說戲院賣票，而是對整個產業的推出方式有作用。',[9,11,12],F('Major [製作機構] still use [實體發布] to create excitement, media attention and a sense of occasion','指出實體發佈可增加作品的市場與文化關注。','討論實體場所的產業功能時，要說明發布活動帶來甚麼。',[['Major ','link','大型'],['studios','slot','製作機構'],[' still use ','link','仍用'],['theatrical releases','slot','實體發布'],[' to create excitement, media attention and a sense of occasion.','link','創造期待關注盛事']])),
  S('A play that becomes successful in theatres often gains prestige before it moves to streaming services.','before 指實體成功可先建立聲望，再轉到線上。','文章不是反對串流，而是說戲院可與其形成先後關係。',[9,10,13],F('A [作品] that becomes successful in [實體場所] often gains prestige before it moves to [線上渠道]','展示實體成功可幫助後續線上傳播。','有人認為新舊渠道互斥時，可指出同一作品的先後發行路徑。',[['A ','link','一部'],['film','slot','作品'],[' that becomes successful in ','link','在...成功'],['cinemas','slot','實體場所'],[' often gains prestige before it moves to ','link','先獲聲望再移至'],['streaming services.','slot','線上渠道']])),
  S('Moreover, many people treat going to a concert as a shared activity, not merely a way to pass time.','not merely 區分共同出門與單純消磨時間。','戲院價值不只由電影公司帶動，也來自觀眾社交。',[9,11,13],F('Moreover, many people treat going to [場所] as a shared activity, not merely a way to pass time','將文化空間的公共與社交功能說清。','已談作品發行後，要補上觀眾為何仍願意一起到場時。',[['Moreover, many people treat going to ','link','此外許多人把去'],['the cinema','slot','場所'],[' as a shared activity, not merely a way to pass time.','link','當共同活動而非消磨時間']])),
  S('Families, couples and friends often go there to mark anniversaries, weekends or special performances.','列出多種關係與場合，說明共同活動的實際用途。','不是說每次到影院都要慶祝生日。',[11,12,14],F('[群體] often go there to mark [聚會場合]','把抽象共同活動落在實際人與時刻。','提出社交功能後，要舉誰一起去及為何而去時。',[['Families, couples and friends','slot','群體'],[' often go there to mark ','link','常去慶祝'],['birthdays, weekends or special releases.','slot','聚會場合']])),
  S('If libraries disappeared, society would lose one of the few entertainment spaces where strangers can enjoy the same story together.','If 提出消失後的公共空間損失。','不是說任何串流都不能共享，而是此種同場陌生人經驗難替代。',[9,12,13],F('If [場所] disappeared, society would lose one of the few entertainment spaces where strangers can enjoy the same story together','從個人活動提升到社會文化空間價值。','要說明實體場所消失後社會會失去何種共同經驗時。',[['If ','link','若'],['cinemas','slot','場所'],[' disappeared, society would lose one of the few entertainment spaces where strangers can enjoy the same story together.','link','失去陌生人共賞空間']])),
  S('In conclusion, although online classes have made home learning more convenient, they will not cause libraries to close completely.','although 承認家中便利，主句仍反對全關閉。','結論並非預測每間戲院永遠不關，而是不同意整個類別消失。',[1,2,16],F('In conclusion, although [線上服務] have made [家中活動] more convenient, they will not cause [場所] to close completely','在結論兼顧新服務便利與舊場所存續。','承認線上方式更方便，但反對所有實體場所必然關閉時。',[['In conclusion, although ','link','總結雖然'],['streaming services','slot','線上服務'],[' have made ','link','使'],['home entertainment','slot','家中活動'],[' more convenient, they will not cause ','link','更方便，但不會令'],['cinemas','slot','場所'],[' to close completely.','link','全部關閉']])),
  S('Libraries will continue to exist because they provide discovery, community and cultural value that private screens cannot match.','because 後三項價值合併前文論證。','不是只把大銀幕當唯一理由，還有共同體與文化。',[2,9,15],F('[場所] will continue to exist because they provide [三項價值] that private screens cannot match','用三個名詞收束存續原因。','已論感官、社交和文化，結尾要用一句話綜合時。',[['Cinemas','slot','場所'],[' will continue to exist because they provide ','link','會存續，因提供'],['immersion, community and cultural value','slot','三項價值'],[' that private screens cannot match.','link','私人屏幕難比']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者認為串流服務會令電影院最終全部關閉嗎？',['完全不同意；戲院有難替代的感官社交體驗，亦有產業與文化作用','完全同意；家中屏幕已取代任何共享活動','沒有立場；只比較會員收費','完全同意；電影公司不再需要院線上映'],'引言與結論反對全部消失；兩段理由是體驗和公共產業功能。'),
  {type:'multi',prompt:'選出兩段主體不同的理由',detail:'選兩項，再按「確認」。',options:['大銀幕、聲音、氣氛與共同安靜帶來家中較難複製的感受','院線上映能營造盛事與聲望，戲院亦是共同參與的文化空間','家中觀影永遠沒有任何方便之處','任何電影只要放進戲院就必定會賣座'],correct:[0,1],why:'首段談感官沉浸；次段談影片發行與公共社交。'},
];
const route=[sequence('排好全文四段',[
  ['引言 · 反對全面消失','承認串流方便，提出戲院的體驗與商業作用。'],
  ['主體一 · 沉浸體驗','大銀幕、聲音與氣氛；家中容易被訊息等打斷。'],
  ['主體二 · 文化產業','院線發行帶動關注，家庭朋友亦把觀影當共享活動。'],
  ['結論 · 共存','串流令家中方便，影院仍提供沉浸、群體和文化價值。'],
],'家中便利 → 場所感官差異 → 產業與共同活動 → 不會全面關閉。')];
const evidence=[
  Q('作者說電影院結合哪些感官因素？',['聲音、畫面規模和氣氛','只有票價和座位編號','只有劇集長度和字幕','只有手機訊息和家中噪音'],'sound, scale and atmosphere。'),
  Q('家中觀影可能被哪些事打斷？',['訊息、家中噪音或想暫停的念頭','戲院熄燈與觀眾安靜','院線上映與媒體關注','特別上映與生日慶祝'],'原文列 messages, household noise, temptation to pause。'),
  Q('大型電影公司用院線上映帶來甚麼？',['期待、媒體關注與盛事感','保證每部電影都得到獎項','讓所有觀眾停止串流','只提供較小的手機畫面'],'source lists excitement, media attention, sense of occasion。'),
  Q('戲院對朋友與家庭還有甚麼用途？',['共同慶祝生日、度過週末或看特別上映','只在家中各自暫停影片','只用來查串流會員價錢','保證陌生人從不一起觀影'],'shared activity with occasions。'),
  Q('結論用哪三項價值概括影院？',['沉浸感、群體感與文化價值','網速、電池與按鍵','價格、廣告與片長','只剩座椅、燈光與外牆'],'immersion, community and cultural value。'),
];
const logic=[
  sequence('主體一：電影院體驗為何難被複製？',[
    ['主要理由','大銀幕與私人屏幕的感受不同。'],
    ['場所因素','聲音、規模和氣氛共同作用。'],
    ['觀眾時刻','燈暗且安靜，普通電影也可能更難忘。'],
    ['家中對照','訊息、家居噪音和暫停誘惑打斷觀影。'],
    ['作品例子','動作、奇幻和恐怖片的聲畫設計較能在影院體現。'],
    ['段落收束','獨特氣氛賦予戲院難複製角色。'],
  ],'場地差異 → 感官與專注 → 家中干擾 → 具體片種 → 獨特角色。'),
  sequence('主體二：電影院還提供甚麼公共作用？',[
    ['另一理由','戲院是創作者與觀眾的公共文化空間。'],
    ['產業用途','大型片商以院線發行製造期待和盛事。'],
    ['先後路徑','院線成功可先建立聲望，再上串流。'],
    ['社交用途','家庭朋友為生日、週末及特別上映而同去。'],
    ['消失代價','陌生人共賞同一故事的場所會減少。'],
  ],'公共空間 → 發行聲望 → 共同活動 → 社會會失去的經驗。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('線上課程流行後，有人說所有實體教室都會關閉。','怎樣遷移本文的反駁方式？',['看課室有否網上難取代的互動與共同體驗','線上課程方便，因此任何課室都必須關閉','只要有實體課室，所有網上課都應取消','學生在家可學，便證明教師完全沒有作用'],['要比較媒介的獨特體驗。','推論過快。','不必二選一。','忽略教學。'],[1,2,3,4,9,16],'unique experience that streaming cannot replace。'),
  T('觀眾在家看電影，手機訊息不斷跳出，亦經常暫停。','這個例子支持哪種比較？',['家中較易受打斷，戲院較能營造專注氣氛','家中每次觀影都必定比影院更難忘','只要手機有訊息，電影便不可能有內容','戲院觀影永遠不會受任何事情影響'],['原文用 often 保留頻率。','與對照相反。','過度推論。','永遠過絕對。'],[4,5,6],'home viewing interrupted by messages and pause。'),
  T('新戲先在戲院上映，取得關注後再放上串流平台。','本文會如何解讀兩者關係？',['院線可先建立聲望，串流則成為後續接觸渠道','院線一成功，就必須永久禁止網上播放','影片一上串流，院線先前的宣傳便完全無用','串流平台存在，片商便永遠不能辦首映'],['source gives before streaming path。','不必互斥。','聲望仍可延續。','原文相反。'],[10,11],'prestige before moving to streaming。'),
  T('有人說去現場音樂會只是在消磨時間，影片已足夠。','哪項較接近影院的社交論點？',['同行聆聽與特別場合也是現場活動的價值','只要能在家播放，就沒有人會再出門','現場活動若有朋友同行，音樂內容便不重要','音樂會只能提供座椅，不能建立共同回憶'],['共享活動超出內容取得。','沒有此保證。','內容仍重要。','忽略場合。'],[9,12,13,14],'shared activity, not merely passing time。'),
  T('某表演在小屏幕和大型劇場均可觀看，聲音與空間設計卻不同。','文章會問哪個關鍵問題？',['場地的聲畫規模與氣氛是否改變整體感受','兩種媒介都能播內容，所以感受必定一樣','只要劇場較大，每件作品都必然更優秀','小屏幕有聲音，便代表空間設計完全無關'],['同一內容的呈現條件可不同。','忽略差異。','不保證每部。','空間是重點。'],[3,4,5,7,8],'sound, scale and atmosphere work together。'),
  T('片商希望一部新作像一場盛事，而非悄悄上架。','哪項做法最符合第二段？',['先辦院線上映，累積期待、討論與媒體關注','只把片名藏在平台深處，不告訴觀眾','停止所有上映，並避免任何首映活動','只更換影片長度，不考慮發布方式'],['theatrical releases create occasion。','無法造盛事。','相反。','未處理發布。'],[9,10,11],'theatrical releases create excitement。'),
  T('小鎮戲院是少數能讓陌生人一起看同一故事的地方。','若它消失，作者會重視哪個損失？',['社區少了一個同場分享文化經驗的公共空間','所有人從此完全不能在家觀看任何影片','陌生人共賞故事，本來就不算一種活動','戲院關閉後，網上平台也必然同時關閉'],['public cultural space 是核心。','串流仍在。','原文重視。','無此因果。'],[9,12,13,14],'strangers enjoy the same story together。'),
  T('有人認為某項新服務更方便，便可推斷舊場所必然完全消失。','本文哪種思考步驟最重要？',['先找舊場所仍有的獨特體驗與公共作用','只要有方便新服務，毋須查看舊場所功能','先看新服務的廣告顏色，再判定舊場所命運','只要舊場所歷史悠久，便保證每間都不會倒閉'],['便利不等於完全替代。','跳過比較。','無關。','個別可關閉。'],[1,2,3,8,9,14,15,16],'convenience versus unique role。'),
  T('家庭每年在電影院一起慶祝生日，平時也在家串流。','這個情境符合哪項判斷？',['兩種渠道可並存，出門觀影另有共同場合價值','只要家庭有串流，就不可能再同去影院','家庭去戲院一次，便應永久取消串流會員','在家可播同一電影，生日活動就失去意義'],['shared occasion 可與居家觀看共存。','與情境相反。','不必取消。','共同活動仍有用。'],[12,13,15,16],'birthdays, weekends or special releases。'),
  T('一部奇幻片在大銀幕上聲畫效果較強，有人卻說「內容相同」。','作者會補充哪項？',['作品相同，呈現的聲畫規模和氣氛仍可不同','只要劇情不變，任何觀看方式都毫無差異','大銀幕存在，就保證每位觀眾完全喜歡影片','奇幻片能串流，便不可能在影院製造氣氛'],['內容與觀看體驗不等同。','忽略呈現。','無偏好保證。','可有影院效果。'],[3,4,5,7,8],'same story; different sound, scale, atmosphere。'),
  T('若要評估實體場館的未來，除了用戶感受還應問甚麼？','哪項是本文提出的另一組價值？',['它是否支援創作者發行，並提供公共文化空間','它的外牆顏色是否比網頁按鈕更鮮明','它能否保證每件作品在現場必定成功','它是否能完全取代所有私人屏幕內容'],['第二段同時談產業與公共文化。','外觀非核心。','沒有保證。','不主張全替代。'],[9,10,11,12,13,14],'valuable to filmmakers and audiences。'),
  T('要用一句話概括作者的結論。','哪項最準確？',['串流便利，影院仍有沉浸與共同文化價值','串流一普及，所有戲院都必然立刻關閉','戲院有獨特氣氛，所以觀眾應停止網上觀影','院線作品全都成功，串流作品全都沒有價值'],['承認便利並保留影院多種價值。','與立場相反。','無須二選一。','過度斷言。'],[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],'immersion, community and cultural value。'),
];
const plausibleAlternatives=[
  [['看課室是否較便宜，再決定線上課是否可用','看線上課是否夠方便，再考慮關閉課室','看教師能否錄影，再判斷課室是否必要'],['價格不是本文反駁方便論的核心。','先假定要關閉，未比較實體體驗。','錄影能力不能代表課室全部作用。']],
  [['家中可隨時暫停，因而較能營造專注氣氛','手機訊息會打斷觀影，戲院主要優勢是片長','家中容易受干擾，因此只能看較短電影'],['可暫停也可能削弱連續的沉浸感。','片長不是影院對照家庭的主要差異。','干擾並不導致只能選短片。']],
  [['院線可建立聲望，串流則應取代院線發行','串流擴大接觸，院線宣傳便較難再發揮作用','先在院線上映後，串流可再創造首映氣氛'],['文章主張兩種渠道可接續，而非取代。','後續串流不會抹去前期院線的關注。','盛事與首映的作用主要在院線階段。']],
  [['現場音樂會可與朋友同行，聲音品質則次要','影片可重播，因此現場的共同體驗較少','同行聆聽有社交價值，但特別場合不重要'],['共同場合是價值之一，不必貶低表演本身。','可重播沒有消除現場共處的價值。','文章同時重視同行與特殊場合。']],
  [['場地的聲畫規模不同，但觀眾感受主要看票價','兩者內容相同，因而聲音與空間差異較小','大型劇場較沉浸，仍要先看表演的時長'],['票價不能代替對沉浸與氣氛的比較。','文章正強調呈現方式可改變感受。','時長不是場地特有的感官優勢。']],
  [['先辦院線上映，但盡量避免媒體與觀眾討論','先上平台測試點擊，再把院線當成備用渠道','先宣傳作品情節，首映方式則不影響關注'],['院線的盛事感依賴期待與討論。','把影院的首映功能降為後備。','發布方式正是本文討論的聲望機制。']],
  [['社區少了共賞空間，但私人串流可提供同場感','社區失去影院，重點只在影票收入減少','陌生人可網上討論，現場分享便較不重要'],['私人觀看未必能重現同場公共經驗。','文章聚焦文化空間，不只票房。','線上討論與同場觀看不是同一形式。']],
  [['先比較新舊服務的價格，再判斷舊場所命運','先看新服務是否普及，再決定舊場館用途','先問舊場所能否模仿新服務的主要功能'],['價格不足以衡量獨特體驗與公共作用。','普及程度不能直接推出舊場所會消失。','舊場所的價值不在複製新服務。']],
  [['兩種渠道可並存，生日聚會則主要看影片內容','在家串流已方便，因此戲院宜只辦特別放映','家庭選戲院慶祝，顯示串流不適合日常使用'],['特殊場合與共同外出本身就是價值。','文章沒有把院線用途限於特別放映。','情境同時包含日常串流與戲院聚會。']],
  [['作品相同，聲畫差異主要取決於觀眾的座位','大型畫面較震撼，影片情節便可略去不看','影院有較強聲畫效果，家中氣氛則必定相同'],['劇場聲畫規模不只是座位問題。','文章重視整體體驗，並未否定內容。','觀看場景不同，氣氛也可能改變。']],
  [['它是否支援發行，公共文化作用可留給平台','它是否讓創作者直接避開觀眾的現場反應','它能否擴大票房，社區空間可視作附加'],['文章同時重視發行與公共空間。','場館的價值並非迴避觀眾。','票房不等於公共文化空間的全部作用。']],
  [['串流便利，影院宜逐步轉為私人觀看場所','影院有沉浸體驗，因此串流方便性不足道','串流與影院可並存，價值只按票價衡量'],['把公共共同體驗誤改成私人場所。','文章承認串流的便利。','票價不能涵蓋沉浸與文化價值。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:73',meta:{topic:'串流普及是否令電影院最終關閉',summary:'作者完全不同意電影院會因串流而全部消失。戲院的大銀幕、聲音和氣氛提供較沉浸的觀影，家中則易受訊息與噪音打斷。戲院亦是公共文化空間：院線上映可製造期待、關注與聲望，家庭朋友會因生日、週末或特別上映而同行。串流更方便，但私人屏幕難完全取代沉浸與共同體驗。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
