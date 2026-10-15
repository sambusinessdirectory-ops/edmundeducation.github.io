import {mc} from './editorial-question.mjs';

const open=(id,prompt,answers,explanation,glossary)=>({id,type:'open',style:'final',prompt,answers,explanation,glossary});
const reply=(id,[prompt,options,golden])=>({id,type:'mc',style:'reply',prompt,options,answers:[...options],golden,allCorrect:true,explanation:'四句都能自然地回答這個問題；使用本課表達的句子會獲得金句標記。'});
const lessons=[
  {
    id:'advanced-native-001',number:1,titleZh:'走出熟悉的範圍',cardTitleLines:['走出熟悉的範圍'],titleEn:'stay in their comfort zone',kind:'比喻用法 · Figurative use',
    summary:'分清「熟悉而安全」與「懶惰」；學會在適當的語境使用 comfort zone。',
    audio:'The new role seemed risky, so they stayed in their comfort zone.',audioZh:'新職位看來有風險，所以他們留在熟悉的範圍。',
    meaning:'留在熟悉、安全的做法或環境；不一定表示懶惰。',
    reply:['朋友問：Why does she always choose familiar projects?',["She prefers work she already knows.","She feels safer with familiar tasks.","She tends to stay in her comfort zone.","She has not felt ready to try something new."],"She tends to stay in her comfort zone."],
    scene:['一位出色的廚師一直只做自己最熟悉的菜，不敢嘗試新菜式。哪個說法最準確？',['They are staying in their comfort zone.','They have forgotten how to cook.','They are cooking without any effort.'],'They are staying in their comfort zone.','重點是避免不熟悉的挑戰，不是忘記技能或完全沒有付出。'],
    contrast:['同事說 I am happy in this role. 你有甚麼需要先確定，才說他 stays in his comfort zone？',['他是否因為害怕風險而避開新機會。','他的薪金是否比你高。','他是否準時下班。'],'他是否因為害怕風險而避開新機會。','滿意現狀本身不是問題；這個比喻通常帶有因熟悉而不願嘗試的意思。'],
    branch:['朋友想報名公開演講，但總是避開。哪一句既自然又不貶低他？',["You could start with a small group if you want to step outside your comfort zone.","You are lazy because you stay in your comfort zone.","Your comfort zone is a real room you should leave."],"You could start with a small group if you want to step outside your comfort zone.",'step outside your comfort zone 是逐步嘗試新事物；提出小步驟比貼上懶惰標籤更合適。'],
    speak:'I stayed in my comfort zone until I joined the debate club.',speakCloze:'__________________ until I joined the debate club.',speakPrompt:'你以前不敢參加辯論社，後來終於加入。試用英文說出這個轉變。',
    final:['新情境：你的朋友一直只接熟悉的設計工作，現在想接一個新項目。用一至兩句英文描述她原本的選擇，並鼓勵她嘗試。',["She has stayed in her comfort zone, but this new project could help her grow.","She usually stays in her comfort zone. Maybe this is a good chance to try something new."],'能指出她選擇熟悉工作，並用溫和的方式鼓勵新嘗試；不必與示例逐字相同。',[
      ['this new project','這個新項目'],['help her grow','幫助她成長'],['usually','通常'],['a good chance','一個好機會'],['try something new','嘗試新事物']
    ]],
    takeaways:['They stayed in their comfort zone.','She is ready to step outside her comfort zone.']
  },
  {
    id:'advanced-native-002',number:2,titleZh:'不費力地繼續',titleEn:'coast along',kind:'動詞片語 · Phrasal verb',
    summary:'辨別 coast along 與穩定進步：它強調幾乎沒有用力。',
    audio:'After passing the first test, Leo began to coast along in class.',audioZh:'通過第一次測驗後，Leo 開始在課堂上不太努力。',
    meaning:'繼續前進，卻只付出很少努力；可帶輕微批評意味。',
    reply:['同學問：Why has Leo stopped improving in class?',["He has been doing only the minimum.","He is coasting along instead of challenging himself.","He has not been practising enough.","He keeps relying on what he already knows."],"He is coasting along instead of challenging himself."],
    scene:['一名學生靠以前學過的內容過關，最近沒有認真準備。哪句最貼切？',['He is coasting along.','He is making rapid progress.','He is working around the clock.'],'He is coasting along.','coast along 指靠慣性前進，沒有積極投入；不是快速進步。'],
    contrast:['哪個情況不宜說 coast along？',['她每天刻意練習新技巧，水平穩定上升。','他做最低限度的工作，暫時仍能過關。','球隊一直靠早前的優勢撐下去。'],'她每天刻意練習新技巧，水平穩定上升。','刻意練習與提升表示持續用力，與 coast along 的低投入不符。'],
    branch:['經理發現團隊完成舊任務沒問題，但沒有準備下一輪工作。哪句提醒比較準確？',["We can't just coast along; let's plan for next month.","Let's coast along so we can improve faster.","We must stop the project because the team has already failed."],"We can't just coast along; let's plan for next month.",'這句承認當前仍在運作，同時指出不能一直只靠慣性。'],
    speak:'I was coasting along, so I set myself a harder goal.',speakCloze:'__________________ so I set myself a harder goal.',speakPrompt:'你發現自己只做最低限度的功課，於是訂下較難的目標。聽完示範後，自己說一句。',
    final:['新情境：你的樂隊一直演同一批歌，演出尚可，但沒有練習新曲。用一至兩句英文說明問題及下一步。',["We've been coasting along with the same songs. Let's practise a new set.","The band is coasting along, so we should learn some new material."],'表明樂隊仍能演出但缺少投入，並提出具體的新練習方向。',[
      ['The band','樂隊'],['the same songs','同一批歌'],['practise a new set','練習一套新曲目'],['we should','我們應該'],['learn some new material','學習一些新曲目']
    ]],
    takeaways:['We have been coasting along.','We cannot just coast along forever.']
  },
  {
    id:'advanced-native-003',number:3,titleZh:'提醒自己要改變的警號',titleEn:'wake-up call',kind:'慣用語 · Idiom or set phrase',
    summary:'用 wake-up call 描述令你正視問題、開始改變的事件。',
    audio:'Missing the deadline was a wake-up call for the whole team.',audioZh:'錯過限期讓全組人警覺，知道必須改變做法。',
    meaning:'一件讓人意識到問題、需要改變的事；不是真正的電話或鬧鐘。',
    reply:['隊友問：What did missing the deadline teach us?',["It showed us that our planning needs to change.","It was a wake-up call for the whole team.","It made us take the schedule more seriously.","It reminded us to check progress earlier."],"It was a wake-up call for the whole team."],
    scene:['球隊連續兩次因為沒有熱身而有人受傷，教練終於更改流程。那兩次受傷可稱為甚麼？',['A wake-up call.','A friendly reminder about the weather.','A lucky break.'],'A wake-up call.','事件暴露了問題，促使教練採取行動。'],
    contrast:['哪個情況最不像 wake-up call？',['手機每天早上準時響，提醒你起床。','一份差的報告令公司重新檢查品質。','朋友的健康警告令他改變飲食。'],'手機每天早上準時響，提醒你起床。','這裏是字面上的鬧鐘；慣用語指讓人正視問題的事件。'],
    branch:['朋友說自己忘了交一份重要申請，現在開始使用日曆提醒。哪句回應自然？',["That sounds like a wake-up call; your new reminder system should help.","That was a wake-up call, so you must never apply again.","Your calendar is the wake-up call that rang at seven."],"That sounds like a wake-up call; your new reminder system should help.",'肯定這次教訓帶來了具體改變，不誇大也不誤用字面意思。'],
    speak:'The failed inspection was a wake-up call for our restaurant.',speakCloze:'The failed inspection was __________________ for our restaurant.',speakPrompt:'餐廳檢查不合格，大家開始改善衛生流程。聽完示範後，說出這次事件的作用。',
    final:['新情境：你的小組在演講前沒有彩排，結果超時。用一至兩句英文說這次經歷帶來甚麼改變。',["Running over time was a wake-up call. We will rehearse before the next presentation.","Our last presentation was a wake-up call, so we'll time our rehearsal next time."],'指出一次具體問題，以及它如何促使下一次改進。',[
      ['Running over time','超時'],['rehearse','彩排'],['the next presentation','下次演講'],['Our last presentation','我們上次的演講'],['time our rehearsal','為彩排計時']
    ]],
    takeaways:['It was a wake-up call for the team.','That mistake was a wake-up call.']
  },
  {
    id:'advanced-native-004',number:4,titleZh:'毫無準備就要應付難事',cardTitleLines:['毫無準備就要','應付難事'],titleEn:'life throws them in at the deep end',kind:'慣用語 · Idiom or set phrase',
    summary:'掌握 be thrown in at the deep end：在缺少準備時被迫處理難題。',
    audio:'On her first day, she had to lead a meeting. Life threw her in at the deep end.',audioZh:'上班第一天，她就要主持會議；人生一下子把她推進難關。',
    meaning:'未有充分準備，就被迫應付困難的工作或處境；借用泳池深水區的意象。',
    reply:['朋友問：How was Maya’s first day at work?',["She had to lead a meeting with no preparation.","She was thrown in at the deep end.","She faced a difficult task straight away.","She had to learn while doing the job."],"She was thrown in at the deep end."],
    scene:['新同事上班第一天就被要求獨自處理大客戶，事前沒有培訓。哪句最準確？',['She was thrown in at the deep end.','She took a relaxing swim.','She chose the easiest task.'],'She was thrown in at the deep end.','關鍵是缺少準備，卻要立刻處理難題。'],
    contrast:['哪個情況不符合 be thrown in at the deep end？',['他受了完整訓練，先觀察三個月，才自願接簡單任務。','她沒有帶隊經驗，突然要代替主管主持簡報。','他第一天工作就被安排獨立應付投訴。'],'他受了完整訓練，先觀察三個月，才自願接簡單任務。','充分準備、自己選擇簡單任務，缺少這個慣用語的「突然且困難」兩點。'],
    branch:['朋友第一天做義工便要應付一大群孩子。哪句回應既明白他的處境又自然？',["You were thrown in at the deep end. How did you manage?","You swam in the deep end, so the children must be wet.","You chose to avoid every difficult task."],"You were thrown in at the deep end. How did you manage?",'用被動式描述突然面對艱難任務，然後關心他如何應付。'],
    speak:'I was thrown in at the deep end when I had to host the event alone.',speakCloze:'__________________ when I had to host the event alone.',speakPrompt:'你沒有綵排，卻突然要獨自主持活動。聽完示範後，用英文說出感受。',
    final:['新情境：你的朋友第一次在咖啡店工作，就要在繁忙時段獨自負責收銀。用一至兩句英文描述她的經歷與應對。',["She was thrown in at the deep end on her first shift, but she stayed calm.","Life threw her in at the deep end when she had to handle the rush alone."],'說清楚突然、缺少準備和任務困難；可用被動式或 life 作主語。',[
      ['on her first shift','在她第一天上班時'],['stayed calm','保持冷靜'],['had to handle','不得不應付'],['the rush','繁忙時段'],['alone','獨自']
    ]],
    takeaways:['Life threw her in at the deep end.','She was thrown in at the deep end.']
  },
  {
    id:'advanced-native-005',number:5,titleZh:'磨練成才的經歷',titleEn:'the making of a person',kind:'慣用語 · Idiom or set phrase',
    summary:'掌握 be the making of someone：一段經歷令人成長，不是字面上的「製造」。',
    audio:'Her year abroad was the making of her: she became far more independent.',audioZh:'那一年在海外生活讓她成長，變得獨立得多。',
    meaning:'某段經歷塑造一個人的能力或性格；自然句型是 be the making of someone。',
    reply:['朋友問：How did the year abroad change her?',["She became much more independent.","It helped her grow in confidence.","She learned to manage life on her own.","It was the making of her."],"It was the making of her."],
    scene:['一名害羞學生經營校報一年後更有自信，也學會帶領團隊。哪句自然？',['Running the school paper was the making of her.','Running the school paper manufactured her.','The paper was made by her personality.'],'Running the school paper was the making of her.','指經歷令她成長；be the making of someone 是慣用句型。'],
    contrast:['哪一句的用法最恰當？',["That difficult apprenticeship was the making of him.","The apprenticeship was the making of a chair.","He was making of the apprenticeship."],"That difficult apprenticeship was the making of him.",'固定結構是經歷 + was the making of + 人；表示被磨練而成長。'],
    branch:['朋友說創業第一年很辛苦，卻學會了面對失敗。你會怎樣回應？',["It sounds like that year was the making of you.","It sounds like the year made a factory of you.","It sounds like you learned nothing at all."],"It sounds like that year was the making of you.",'對方經過艱難經歷而變得更成熟，用 be the making of you 自然。'],
    speak:'Leading that project was the making of me.',speakCloze:'Leading that project was __________________.',speakPrompt:'你第一次領導項目，雖然辛苦，卻變得更有能力。聽完示範後，自己說一句。',
    final:['新情境：一位朋友獨自照顧社區花園一年，變得更有耐性和責任感。用一至兩句英文描述這段經歷。',["Caring for the community garden was the making of her; she became more patient and responsible.","That year in the garden was the making of her. She learned to take responsibility."],'使用 be the making of someone，並指出具體成長；不必照抄示例。',[
      ['Caring for the community garden','照顧社區花園'],['more patient','更有耐性'],['responsible','有責任感'],['That year in the garden','在花園度過的那一年'],['take responsibility','承擔責任']
    ]],
    takeaways:['That experience was the making of her.','The challenge was the making of me.']
  }
];

export default lessons.map(data=>{
  // Keep existing question IDs so students retain completed work; only the new
  // reply step receives a new ID.
  const qid=(name)=>`${data.id}-${name==='reply'?'v2':'v1'}-${name}`;
  const questions=[
    mc(qid('audio'),'audio','先只聽示範句。說話者想表達甚麼？',
      [data.meaning,'這句只在描述一個具體地點。','這句表示事情一定很容易。','這句的重點是準確的日期和時間。'],data.meaning,
      `這是${data.kind}。${data.meaning}`),
    reply(qid('reply'),data.reply),
    mc(qid('scene'),'scene',...data.scene),
    mc(qid('contrast'),'contrast',...data.contrast),
    mc(qid('branch'),'branch',...data.branch),
    open(qid('final'),...data.final)
  ];
  const steps=[
    {id:qid('audio'),style:'audio',label:'先聽意思',title:'聽懂情境',intro:'先只聽英文，不看逐字稿；判斷說話者的意思。',model:data.audio,zh:data.audioZh,audioOnly:true,questions:[qid('audio')]},
    {id:qid('reply'),style:'reply',label:'回應提問',title:'四種回答，都說得通',intro:'有人問你一個問題。四個回應都正確；選出使用本課表達的回應，會得到金句標記。',questions:[qid('reply')]},
    {id:qid('scene'),style:'scene',label:'選對情境',title:'甚麼時候會這樣說？',intro:'讀一個新情境，判斷表達是否合適。',questions:[qid('scene')]},
    {id:qid('contrast'),style:'contrast',label:'分清界線',title:'避免用得太闊',intro:'辨別相似但意思不同的情況。',questions:[qid('contrast')]},
    {id:qid('branch'),style:'branch',label:'接續對話',title:'把表達放入對話',intro:'既要自然，也要照顧對方的語境。',questions:[qid('branch')]},
    {id:qid('speak'),style:'speak',label:'聽後開口',title:'先聽示範，再自己說',intro:'先聽完整示範，再看保留空格的句子說出本課表達；錄音屬選做，也可跳過。',model:data.speak,displayModel:data.speakCloze,zh:data.meaning,speakingPrompt:data.speakPrompt,recording:'phrase',questions:[]},
    {id:qid('final'),style:'final',label:'換境應用',title:'在新情境自己寫',intro:'先寫自己的英文，再對照多個自然示例。這是自我檢查，不會按字面一致評分。',questions:[qid('final')]}
  ];
  return {...data,course:'advanced-native',slug:data.id,heading:data.titleEn,
    surpriseLabel:'',steps,questions,takeaways:data.takeaways,
    completionTitle:`你已能在新情境中使用 ${data.titleEn}！`};
});
