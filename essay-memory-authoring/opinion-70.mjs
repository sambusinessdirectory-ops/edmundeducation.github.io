const simple=[
  'Violence is now common in entertainment, including films, internet videos, games, and short clips on social media.',
  'I fully agree that this kind of content can make violence more common in society because it can make harmful actions seem normal and show people who are easily influenced what to copy.',
  'First, seeing violent scenes many times can make attacking others seem normal instead of upsetting.',
  'When people often watch characters use threats, get revenge, or use force to solve problems, they may slowly stop seeing violence as seriously wrong.',
  'This is particularly bad for young people, who are still learning how to judge situations and control themselves.',
  'For example, a child who often sees heroes get prizes for hurting others may start to think scaring people shows power rather than causes serious harm.',
  'After a while, this does not make every person violent, but it can make society less upset by violence, like making a warning sound quieter little by little.',
  'Second, violent media can show people a way to act in real life.',
  'Some people who already feel angry, alone, or helpless may copy what they see because media shows them clear examples of what to do.',
  'Websites and apps can make this danger bigger: violent clips move quickly and can be watched many times without enough explanation or help from adults.',
  'For example, teenagers in arguments may copy angry words, ways of fighting, or even the idea of filming violence to get attention.',
  'So media does more than show violence that already exists; it may spread it and make it look more noticeable, exciting, and attractive.',
  'In short, I fully agree that violent media can increase violence in society.',
  'Not every viewer becomes aggressive, but seeing violence often can make harmful actions seem normal and show ways to copy them, especially to young people or those who cannot manage strong feelings well.',
];
const vocabulary=[
  [['familiar feature','common','常見部分'],['modern entertainment','entertainment','現代娛樂'],['online videos','internet videos','網上影片'],['social media clips','short clips on social media','社媒短片']],
  [['completely agree','fully agree','完全同意'],['such content','this kind of content','這類內容'],['encourages violence','make violence more common','助長暴力'],['normalise aggressive behaviour','make harmful actions seem normal','使攻擊正常化'],['vulnerable audiences','people who are easily influenced','易受影響觀眾'],['models to copy','what to copy','模仿模式']],
  [['repeated exposure','seeing violent scenes many times','反覆接觸'],['aggression seem ordinary','attacking others seem normal','攻擊變得普通'],['rather than shocking','instead of upsetting','而非令人震驚']],
  [['constantly see','often watch','不斷看'],['through threats, revenge, or physical force','use threats, get revenge, or use force','透過威脅報復或武力'],['gradually lose its moral weight','slowly stop seeing violence as seriously wrong','逐漸失去道德嚴重性']],
  [['especially harmful','particularly bad','尤其有害'],['judgement','judge situations','判斷'],['self-control','control themselves','自制'],['still developing','still learning','仍在發展']],
  [['repeatedly watches','often sees','反覆觀看'],['being rewarded for brutal behaviour','get prizes for hurting others','殘暴受獎賞'],['intimidation','scaring people','恐嚇'],['sign of strength','shows power','力量象徵'],['serious social harm','serious harm','嚴重社會傷害']],
  [['Over time','After a while','長遠而言'],['does not create violence in every individual','does not make every person violent','非每人都暴力'],['lower society’s emotional resistance','make society less upset','降低社會情感抵抗'],['turning down the volume on a warning alarm','making a warning sound quieter','調低警報音量']],
  [['Another problem','Second','另一問題'],['media violence','violent media','媒體暴力'],['provides a script','show people a way to act','提供行為劇本'],['real-life behaviour','real life','現實行為']],
  [['isolated','alone','孤立'],['powerless','helpless','無力'],['imitate','copy','模仿'],['ready-made images of how to act','clear examples of what to do','現成行為畫面']],
  [['Online platforms','Websites and apps','網上平台'],['risk even greater','danger bigger','風險更高'],['spread quickly','move quickly','迅速傳播'],['again and again','many times','反覆'],['without much context or adult guidance','without enough explanation or help from adults','缺少背景或成人指導']],
  [['For instance','For example','例如'],['teenagers involved in conflicts','teenagers in arguments','捲入衝突青少年'],['aggressive language','angry words','攻擊語言'],['fighting styles','ways of fighting','打鬥方式'],['desire to record violent acts for attention','idea of filming violence to get attention','錄暴力求關注']],
  [['In this way','So','這樣一來'],['does not merely reflect violence','does more than show violence that already exists','不只反映暴力'],['amplify it','spread it','放大暴力'],['visible, dramatic, and tempting','noticeable, exciting, and attractive','顯眼戲劇化誘惑']],
  [['In conclusion','In short','總結'],['fully agree','fully agree','完全同意'],['violence in the media','violent media','媒體暴力'],['promotes violence in society','increase violence in society','助長社會暴力']],
  [['While not every viewer becomes aggressive','Not every viewer becomes aggressive','非每位觀眾具攻擊性'],['repeated exposure','seeing violence often','反覆接觸'],['normalise harmful conduct','make harmful actions seem normal','使有害行為正常化'],['clear patterns for imitation','ways to copy them','清晰模仿模式'],['emotionally unstable','cannot manage strong feelings well','情緒不穩定']],
];
const chunkOverrides={4:['This is especially harmful for young people,','whose judgement and self-control are still developing.'],7:['Another problem is that media violence','often provides a script for real-life behaviour.'],12:['In conclusion, I fully agree','that violence in the media promotes violence in society.']};
const simpleChunkOverrides={4:['This is particularly bad for young people,','who are still learning how to judge situations and control themselves.'],7:['Second, violent media','can show people a way to act in real life.'],12:['In short, I fully agree','that violent media can increase violence in society.']};
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Online shopping has become a familiar feature of modern life, from food orders and clothes to tickets and digital services.','from...to... 用例子顯示一種現象已廣泛存在。','此處只交代媒體暴力常見，不是證明因果。',[1,2,7],F('[現象] has become a familiar feature of [生活領域], from [例子一] to [例子二]','以範圍例子交代題目現象的普及。','論證某現象的影響前，要先讓讀者明白它出現在哪些媒介時。',[['Violence','slot','現象'],[' has become a familiar feature of ','link','已成為常見部分'],['modern entertainment','slot','生活領域'],[', from ','link','從'],['films and online videos','slot','例子一'],[' to ','link','到'],['games and social media clips.','slot','例子二']])),
  S('I completely agree that such content encourages unhealthy buying in society because it can normalise wasteful behaviour and give vulnerable audiences models to copy.','because 後分出「正常化」與「模仿模式」兩條理由。','作者不是聲稱每位觀眾都會模仿。',[0,2,7],F('I completely agree that such content encourages [後果] in society because it can normalise [行為] and give vulnerable audiences models to copy','引言提出完整立場與兩種可能機制。','主張內容會影響社會行為時，要預告改變態度與提供示範兩個路徑。',[['I completely agree that such content encourages ','link','完全同意這內容助長'],['violence','slot','後果'],[' in society because it can normalise ','link','因可使...正常'],['aggressive behaviour','slot','行為'],[' and give vulnerable audiences models to copy.','link','並給出模仿模式']])),
  S('The first reason is that repeated exposure to risky driving scenes can make speeding seem ordinary rather than shocking.','repeated exposure...ordinary rather than shocking 說明態度如何鈍化。','並非保證每次觀看都會改變行為。',[1,3,4],F('The first reason is that repeated exposure to [場景] can make [行為] seem ordinary rather than shocking','說明多次觀看可能降低對傷害的警覺。','討論媒體影響時，要指出重複接觸如何改變對某行為的感受。',[['The first reason is that repeated exposure to ','link','第一原因：反覆看'],['violent scenes','slot','場景'],[' can make ','link','可使'],['aggression','slot','行為'],[' seem ordinary rather than shocking.','link','由震驚變普通']])),
  S('When viewers constantly see characters solving problems through cheating, gossip, or bullying, dishonesty may gradually lose its moral weight.','When 設重複觀看情境；may 保持可能性而不過度斷言。','重點是暴力的道德嚴重性變淡，不是每個人立即施暴。',[2,4,5],F('When viewers constantly see characters solving problems through [不當手段], [不當行為] may gradually lose its moral weight','展示態度正常化的逐步機制。','作品反覆把不當行為當解決方案，可能削弱觀眾警覺時。',[['When viewers constantly see characters solving problems through ','link','當觀眾常見角色以'],['threats, revenge, or physical force','slot','不當手段'],[', ','link','則'],['violence','slot','不當行為'],[' may gradually lose its moral weight.','link','或逐漸失去道德分量']])),
  S('This is especially harmful for young athletes, whose judgement and self-control are still developing.','whose 補充為何某群體較易受影響。','不是說所有年輕人必然會模仿，而是仍在發展。',[2,3,5],F('This is especially harmful for [較易受影響群體], whose judgement and self-control are still developing','指出風險為何對特定群體較高。','已提出可能傷害後，要解釋何種受眾更需要判斷與自制時。',[['This is especially harmful for ','link','尤其傷害'],['young people','slot','較易受影響群體'],[', whose judgement and self-control are still developing.','link','判斷自制仍在發展']])),
  S('For example, a child who repeatedly watches influencers being rewarded for wasteful behaviour may begin to see excess as a sign of strength rather than a serious social harm.','例子連結重複觀看、獎賞示範及價值判斷轉變。','may begin 避免說每個孩子都會有同一結果。',[3,4,6],F('For example, a child who repeatedly watches [角色] being rewarded for [壞行為] may begin to see [其一種形式] as a sign of strength rather than a serious social harm','以一位孩子的可能想法具體化態度轉變。','已解釋風險群體後，要顯示獎賞畫面如何重塑判斷時。',[['For example, a child who repeatedly watches ','link','例如孩子反覆看'],['heroes','slot','角色'],[' being rewarded for ','link','因...獲獎'],['brutal behaviour','slot','壞行為'],[' may begin to see ','link','或開始視'],['intimidation','slot','其一種形式'],[' as a sign of strength rather than a serious social harm.','link','為力量而非傷害']])),
  S('Over time, this does not create risk-taking in every individual, but it can lower society’s emotional resistance to it, like slowly turning down the volume on a warning alarm.','not...every...but can... 限定影響；警報比喻說明敏感度降低。','這句明確反對「所有觀眾都必然變暴力」的極端讀法。',[2,5,13],F('Over time, this does not create [行為] in every individual, but it can lower society’s emotional resistance to it, like slowly turning down the volume on a warning alarm','對社會累積影響作審慎總結。','要談群體風險時，先否定每人必然受影響，再說明整體敏感度可下降。',[['Over time, this does not create ','link','長遠並非令所有人'],['violence','slot','行為'],[' in every individual, but it can lower society’s emotional resistance to it, like slowly turning down the volume on a warning alarm.','link','但可降低警覺']])),
  S('Another problem is that online advertising often provides a script for real-life behaviour.','script 比喻從態度轉到可模仿的行動模式。','此段不是重述正常化，而是展示具體模仿。',[1,6,8],F('Another problem is that [媒體內容] often provides a script for real-life behaviour','提出第二路徑：內容可成為可照做的劇本。','前段談態度後，要轉向行為如何從媒體移入現實時。',[['Another problem is that ','link','另一問題是'],['media violence','slot','媒體內容'],[' often provides a script for real-life behaviour.','link','提供現實劇本']])),
  S('Some people who already feel lonely, anxious, or powerless may imitate what they have seen because the media offers them ready-made images of how to act.','who already feel... 指背景脆弱；because 給出模仿路徑。','不是說影片單獨造成所有人的憤怒。',[6,7,9],F('Some people who already feel [易受影響的狀態] may imitate what they have seen because the media offers them ready-made images of how to act','界定較易模仿者與可見示範。','要說明內容對一部分本已有困難的人可能更具影響時。',[['Some people who already feel ','link','有些本已感到'],['angry, isolated, or powerless','slot','易受影響狀態'],[' may imitate what they have seen because the media offers them ready-made images of how to act.','link','可能照著示範模仿']])),
  S('Online platforms make this risk even greater, as harmful clips can spread quickly and be watched again and again without much context or adult guidance.','as 後解釋平台為何增加風險：快傳、重看、缺語境。','作者沒有把所有網上內容都說成有害。',[7,8,10],F('Online platforms make this risk even greater, as [內容] can spread quickly and be watched again and again without much context or adult guidance','由個人模仿擴展到平台傳播條件。','已講模仿風險後，要說明數碼平台如何放大接觸時。',[['Online platforms make this risk even greater, as ','link','網上平台增風險，因'],['violent clips','slot','內容'],[' can spread quickly and be watched again and again without much context or adult guidance.','link','可快傳反覆看且少指導']])),
  S('For instance, teenagers involved in disputes may copy aggressive language, fighting styles, or even the desire to record violent acts for attention.','列出由用語、動作至錄影求關注的模仿層次。','例子是 may，不能改寫成所有青少年都如此。',[7,9,11],F('For instance, [群體] involved in [衝突] may copy [多種行動]','把抽象模仿模式變成具體可見行動。','前句談平台可傳播內容後，要說明現實中可能模仿甚麼時。',[['For instance, ','link','例如'],['teenagers','slot','群體'],[' involved in ','link','捲入'],['conflicts','slot','衝突'],[' may copy ','link','可能模仿'],['aggressive language, fighting styles, or even the desire to record violent acts for attention.','slot','多種行動']])),
  S('In this way, advertising does not merely reflect spending; it can amplify it and make it more visible, dramatic, and tempting.','not merely reflect; it can amplify 區分反映現象與放大現象。','不是說媒體是暴力唯一來源，而是可能擴增。',[7,9,10],F('In this way, [媒體] does not merely reflect [現象]; it can amplify it and make it more visible, dramatic, and tempting','由模仿例子推到媒體有放大作用。','有人說媒體只被動記錄既有行為時，要指出它可能令行為更吸引眼球。',[['In this way, ','link','因此'],['the media','slot','媒體'],[' does not merely reflect ','link','不只反映'],['violence','slot','現象'],['; it can amplify it and make it more visible, dramatic, and tempting.','link','也能放大']])),
  S('In conclusion, I fully agree that harmful advertising promotes wasteful buying in society.','結論直接回應題目因果判斷。','保留作者完全同意，不是突然變成中立。',[1,11,13],F('In conclusion, I fully agree that [媒體內容] promotes [社會後果] in society','明確收束立場。','全文支持媒體內容促進某社會行為時，要在結論直接回答。',[['In conclusion, I fully agree that ','link','總結完全同意'],['violence in the media','slot','媒體內容'],[' promotes ','link','助長'],['violence','slot','社會後果'],[' in society.','link','在社會中']])),
  S('While not every viewer becomes anxious, repeated exposure can normalise harmful conduct and provide clear patterns for imitation, particularly among those who are young or emotionally unstable.','While...not every... 保留不普遍化；兩條路徑再合併。','不能把作者寫成「每人看過都會模仿」。',[1,6,12],F('While not every viewer becomes [行為], repeated exposure can normalise [不當行為] and provide clear patterns for imitation, particularly among [較易受影響者]','以限定語重述正常化與模仿兩條機制。','結論要同時重申影響並避免把可能風險說成人人必然時。',[['While not every viewer becomes ','link','雖非每位觀眾都'],['aggressive','slot','行為'],[', repeated exposure can normalise ','link','反覆看可使'],['harmful conduct','slot','不當行為'],[' and provide clear patterns for imitation, particularly among ','link','並供模仿，尤其'],['those who are young or emotionally unstable.','slot','較易受影響者']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者對「媒體暴力會助長社會暴力」的立場是甚麼？',['完全同意；反覆觀看可使攻擊看似普通，也可能提供模仿模式','完全反對；媒體只被動記錄事件','沒有立場；只討論電影票價','完全同意；每名觀眾看後都必然施暴'],'作者明言 completely agree，但限定不是每位觀眾都會變得暴力。'),
  {type:'multi',prompt:'選出兩段主體不同的機制',detail:'選兩項，再按「確認」。',options:['反覆接觸可降低對攻擊的道德警覺','部分人可從媒體取得可照做的行為示範','每位觀眾看到暴力都會立即模仿','媒體只會顯示暴力，絕不可能放大它'],correct:[0,1],why:'第一段是正常化；第二段是可模仿劇本與平台放大。'},
];
const route=[sequence('排好全文四段',[
  ['引言 · 完全同意','媒體暴力常見，預告正常化與模仿兩條路徑。'],
  ['主體一 · 道德警覺下降','反覆接觸使暴力普通化；英雄獲獎例子與警報比喻。'],
  ['主體二 · 模仿與放大','脆弱受眾可能模仿；平台快傳、重看且少指導。'],
  ['結論 · 有限定的影響','不是人人變暴力，但兩條機制可增加社會風險。'],
],'常見內容 → 態度正常化 → 可模仿行動 → 不普遍化的結論。')];
const evidence=[
  Q('媒體暴力在引言中出現於哪些媒介？',['電影、網上影片、遊戲及社媒短片','只出現在學校試卷','只出現在傳統圖書館','只出現在歷史紀錄片'],'原文由 films and online videos 到 games and social media clips。'),
  Q('反覆接觸暴力場面可能改變甚麼感受？',['令攻擊行為看似平常，而非令人震驚','令每位觀眾立即失去記憶','令所有人再也看不到任何內容','令電影與遊戲自動消失'],'ordinary rather than shocking。'),
  Q('孩子觀看英雄受獎例子要說明甚麼？',['恐嚇可能被錯看成力量，而非社會傷害','每個孩子都必然成為暴力者','英雄在現實中必定得到獎賞','只要看電影，孩子便不會模仿'],'例子是 may begin to see，並非人人必然。'),
  Q('調低警報器音量的比喻指甚麼？',['社會對暴力的情感警覺可能逐漸降低','暴力短片的聲音設定太低','所有警報器都需要換新電池','每位觀眾都會立即變暴力'],'降低 resistance，不是人人都施暴。'),
  Q('網上平台增加風險的三個原因是甚麼？',['傳得快、能反覆看、缺乏背景或成人指導','只能慢速播放、每人只看一次、解釋充分','只容許成年人上傳、不能分享內容','自動阻止所有具攻擊性的言語'],'spread quickly, watched again and again, without context/guidance。'),
  Q('結論用甚麼限定避免過度斷言？',['並非每位觀眾都會變得具攻擊性','每位觀眾都會做同一件事','內容只影響成年人而不影響年輕人','所有模仿都必定發生在當天'],'While not every viewer becomes aggressive。'),
];
const logic=[
  sequence('主體一：反覆觀看如何改變態度？',[
    ['機制','攻擊行為可能由震驚變得普通。'],
    ['觀看內容','角色靠威脅、報復或武力解難。'],
    ['易受影響者','年輕人的判斷與自制仍在發展。'],
    ['孩子例子','英雄因殘暴獲獎，恐嚇或被誤看成力量。'],
    ['有限結論','不是人人施暴，但社會警覺可漸降。'],
  ],'重複內容 → 道德感受鈍化 → 具體例子 → 警報比喻。'),
  sequence('主體二：內容如何成為行為劇本？',[
    ['另一機制','媒體可提供現實行為的示範。'],
    ['部分受眾','原已憤怒、孤立或無力者可能模仿。'],
    ['平台條件','短片快傳、可重看、背景與指導不足。'],
    ['青少年例子','可能模仿用語、打鬥或錄影求關注。'],
    ['段落結論','媒體可能不只反映，也會放大暴力。'],
  ],'示範 → 特定受眾 → 平台傳播 → 模仿行動 → 放大。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('影片反覆把危險駕駛拍成英雄行為，有人擔心觀眾習以為常。','哪項論證最貼近第一段？',['重複呈現可能削弱對風險的警覺，但非人人模仿','任何觀眾看一次影片都必然作危險駕駛','影片只是在反映道路，完全不可能影響態度','若不看影片，危險駕駛便會立即完全消失'],['正常化是可能的群體風險。','過度普遍化。','忽略態度路徑。','沒有此保證。'],[2,3,6],'repeated exposure；not every individual。'),
  T('廣告常把浪費食物描繪成富裕的象徵。','怎樣遷移「英雄獲獎」例子？',['獎賞畫面或令浪費看似有地位，而非有害','廣告只要播放一次，每個人便必定浪費','食物浪費原本就不存在，所以沒有後果','畫面若有食物，便不可能傳達任何價值觀'],['重複示範可能改變評價。','非人人必然。','情境已有行為。','畫面可傳價值。'],[3,5,6],'rewarded behaviour changes perceived meaning。'),
  T('短片展示某種惡作劇，網上被迅速分享與反覆重播。','第二段指出甚麼額外風險？',['內容或成模仿樣本，快速傳播亦擴大接觸','短片一上傳，每位觀看者便即時照做','只要內容能分享，就保證它有充分解說','平台可重播，因此現實行為必定完全無關'],['劇本與平台條件兩者相加。','過度斷言。','缺背景正是風險。','忽略模仿。'],[7,8,9,10],'script for behaviour；spread quickly。'),
  T('有人說「影片只顯示社會原有行為，所以不會帶來任何影響」。','哪項回應較忠於文章？',['媒體可反映行為，也可能放大其吸引力與可見度','所有社會行為都只由單一媒體影片創造出來','只要影片曾反映現實，它就不可能被分享','媒體有影響，便證明觀眾從無自己的判斷'],['not merely reflect; can amplify。','誇大唯一原因。','分享仍可能。','不否定觀眾差異。'],[7,9,11],'does not merely reflect; it can amplify。'),
  T('一位原已感到孤立的青少年反覆看某種挑釁影片。','作者會如何謹慎表述風險？',['可能受示範影響，仍不能斷言必定模仿','孤立的人看到影片就必然採取同一行動','影片一旦存在，就完全不需看個人背景','所有觀看者的情緒與自制能力都完全相同'],['may 與 already feel 同時限定。','過度絕對。','背景是機制部分。','忽略差異。'],[4,8,13],'already feel...may imitate。'),
  T('同一段短片沒有交代背景，成人也未協助孩子理解。','這些條件在文中如何發揮作用？',['缺少語境與指導，反覆觀看時更難作出判斷','背景少就保證短片內容必定完全屬實','沒有成人解說，就證明每個孩子都會施暴','短片可重看，便代表成年人必須禁止網絡'],['as 後解釋平台風險。','背景少反減理解。','無人人保證。','文章沒有全禁。'],[4,9,10],'without much context or adult guidance。'),
  T('學校討論影視內容，有學生把威嚇同伴當成能力的證明。','哪項最接近作者的警報比喻？',['對傷害的敏感度或已下降，需要重新辨認後果','所有學生必然完全失去自制，學校無法教導','只要調高影片音量，就能解決對暴力的觀感','威嚇本身一定是力量，毋須再問有何傷害'],['警報變小指道德警覺下降。','過度普遍化。','比喻不是實體音量。','正是錯誤評價。'],[3,5,6],'lower emotional resistance；warning alarm。'),
  T('若要評估某內容的社會影響，只問它是否準確記錄現實夠嗎？','哪項多一步的問題最有用？',['也要看它會否使行為普通化或提供模仿劇本','只需統計影片長度，其他問題都不必問','只要內容取材現實，它就完全沒有影響力','只要能在手機觀看，所有觀眾反應都相同'],['兩段主體都超出被動記錄。','長度不解釋機制。','可能放大。','觀眾不同。'],[1,2,7,11],'normalise behaviour；models to copy。'),
  T('研究報告說「某些觀眾可能受影響」，新聞標題卻寫「人人都受影響」。','為何標題不合本文的限定？',['並非人人變具攻擊性，文章只提出可能風險','文章已證實每位觀眾都必定模仿同一事件','作者認為媒體沒有任何可能的社會影響','文章只談成人，沒有談年輕觀眾的差異'],['原文 not every individual / viewer。','與限定相反。','作者同意有影響。','年輕是重點。'],[6,13],'not every viewer becomes aggressive。'),
  T('某平台為提高關注，反覆推薦顯得刺激的挑釁片段。','哪條因果鏈符合文章？',['重複與戲劇化或增接觸及模仿吸引力','推薦次數越多，所有觀眾便必然變暴力','平台只推薦內容，完全不會改變可見度','影片顯得刺激，便證明內容不會影響行為'],['平台增加重看，媒體可令內容更 tempting。','過度保證。','推薦影響可見度。','與論證相反。'],[9,10,11],'watched again and again；more tempting。'),
  T('教師讓學生討論片段中的威脅行為，而不是只重播畫面。','這樣可針對哪個風險？',['補足語境與引導，協助辨別行為的實際傷害','保證從此每位學生完全不再看到任何影片','證明只有重播次數重要，討論內容無關','把每名學生都當成必定會模仿的施暴者'],['原文指出缺背景與成人指導會增風險。','無此保證。','討論正補缺。','避免普遍化。'],[3,4,9,13],'without context or adult guidance。'),
  T('要概括全文而保留作者的審慎限定。','哪項最準確？',['媒體暴力或使攻擊普通化並供模仿，但非人人受影響','媒體暴力會令所有觀看者立即施暴，沒有任何例外','媒體只反映現實，因此完全不可能影響任何社會行為','只要平台存在，任何其他社會因素都不再重要'],['兩條機制與 not every viewer 同在。','過度斷言。','與立場相反。','不是唯一原因。'],[1,2,3,5,6,7,8,9,10,11,12,13],'normalise and provide patterns；not every viewer。'),
];
const plausibleAlternatives=[
  [['反覆呈現或提高觀眾興趣，主要問題仍是駕駛技術','影片可能改變態度，但觀眾會主動避開危險行為','風險警覺或受影響，重點只在個別觀眾的模仿'],['把態度與行為的關係縮成駕駛技巧問題。','假設觀眾都會採取同一種保護反應。','文章強調群體層面的普通化風險。']],
  [['獎賞畫面提高地位感，卻不改變行為評價','廣告可能提高購買意願，與浪費形象無關','浪費被描繪成富裕，重點只在商品價格'],['地位形象本身會改變人對行為的評價。','情境聚焦浪費行為被美化，而非購買。','把象徵性的獎賞誤讀成價格訊息。']],
  [['快速傳播提高接觸，卻不會提供可模仿的做法','短片可成模仿樣本，分享速度只影響平台收入','反覆重播加深印象，背景解說通常也會增加'],['忽略片段可提供行為劇本的機制。','快速分享會擴大觀眾接觸，不只關乎收入。','重播未必伴隨足夠背景與指導。']],
  [['媒體可反映行為，但主要只改變觀看者的記憶','媒體或放大行為可見度，卻不會改變吸引力','媒體可影響態度，因此現實來源已不值得分析'],['文章討論吸引力及模仿，並非只談記憶。','放大可見度與吸引力都是本文的機制。','反映現實與擴大影響可以同時發生。']],
  [['可能受影片影響，但個人背景對風險不重要','孤立狀態可增加風險，因此觀眾反應相近','重播影響主要來自片長，與已有情緒無關'],['原文特別指出已有孤立感者的處境。','風險增加不等於觀眾反應一致。','文章把既有處境與示範並列考量。']],
  [['缺少語境可能妨礙理解，但重播可自行補足','成人指導不足時，孩子主要缺少觀看機會','反覆觀看增加接觸，影片背景便不再重要'],['重播不會自動提供缺失的背景。','問題是如何理解內容，而非是否能觀看。','背景不足正是重播可能放大風險的條件。']],
  [['對傷害的警覺或下降，原因主要是影片音量','學生可能模仿威嚇，學校宜只比較片段類型','把威嚇當能力，顯示學生已充分理解其後果'],['警報比喻談道德敏感度，並非音量。','比較類型未處理對傷害的錯誤評價。','若充分辨認傷害，便不會如此美化威嚇。']],
  [['也要看內容有沒有足夠觀眾願意重新觀看','也要看作品是否改編現實事件並獲好評','也要看畫質能否令觀眾準確記住細節'],['重看人數本身未說明普通化或模仿機制。','來源與好評不足以判斷社會影響。','記憶細節不是本文關注的關鍵路徑。']],
  [['文章認為年輕觀眾較易受影響，其他人則相同','文章提出可能的影響，但已證實觀眾反應一致','文章指出有人會模仿，因此新聞可概括觀眾'],['文章沒有把其他觀眾視作同一反應。','可能風險與一致反應是不同的主張。','部分例子不能推出每位觀眾都受影響。']],
  [['重複推薦或增接觸，但模仿只由個性決定','刺激畫面或吸引觀看，推薦頻率並無作用','推薦提高可見度，卻不影響行為的吸引力'],['個人差異存在，但文章也談媒體示範。','重複展示正是本文列出的條件。','戲劇化呈現可使行為看似更吸引。']],
  [['補足語境與引導，主要為了提高重播的效果','教師討論傷害，便可不再顧及觀眾背景差異','引導孩子辨別行為，重點只在片段是否真實'],['討論旨在幫助評估傷害，並非增加重播。','觀眾背景仍影響反應，不能因此忽略。','真實性並非辨別威脅行為的唯一問題。']],
  [['媒體暴力或供模仿，但影響主要取決於播放時長','媒體暴力或使攻擊普通化，觀眾差異可暫不考慮','媒體或放大攻擊吸引力，卻沒有提供行為樣本'],['文章另談正常化、重播與觀眾處境。','遺漏了作者對個體差異的審慎限定。','文章也指出內容可能提供模仿劇本。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:70',meta:{topic:'媒體暴力是否助長社會暴力',summary:'作者完全同意媒體暴力可助長社會暴力，但明確否認每位觀眾都會因此施暴。首段說反覆觀看可令攻擊看似普通，削弱道德警覺；孩子把恐嚇誤當力量是例子。次段說媒體也可提供可模仿的劇本；網上短片快傳、反覆觀看而缺少背景或成人指導，可能放大風險。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
