const mc=(id,prompt,options,answer,explanation)=>({id,type:'mc',prompt,options,answers:[answer],explanation});
const blank=(id,prompt,before,after,answers,hint,explanation)=>({id,type:'blank',prompt,before,after,answers,hint,explanation});

const questions=[
  mc('native-102-v2-spot','新工作很忙，但同事友善，你整體過得不錯。朋友問 How have you been? 哪句最符合低調、正面的語氣？',
    ['Can’t complain.','I’ve had better days.','Couldn’t be better.','I need to complain.'],'Can’t complain.',
    'Can’t complain 是「整體還不錯，沒有甚麼好抱怨」；它沒有說一切完美，也不是在訴苦。'),
  mc('native-102-v2-listen','只聽對話、不看逐字稿。回答者的近況最接近哪一種？',
    ['整體還不錯，語氣低調。','最近很難捱，只能勉強撐住。','每件事都完美，興奮得不得了。','對方拒絕談自己的近況。'],
    '整體還不錯，語氣低調。','他說 Can’t complain，意思是整體過得不錯；不是字面上的「不能投訴」。'),
  mc('native-102-v2-contrast-hard','朋友最近失業，坦言這段日子很艱難，但仍在努力撐住。哪句最貼近他的心情？',
    ['I’m hanging in there.','Can’t complain.','Couldn’t be better.','Never been happier.'],
    'I’m hanging in there.','I’m hanging in there 表示處境艱難但仍在撐；Can’t complain 會顯得過於輕鬆。'),
  mc('native-102-v2-contrast-great','假期比預期還好，你非常興奮，想明確說「好得不能再好」。哪句最準確？',
    ['Couldn’t be better.','Can’t complain.','I’ve had better days.','I’m just getting by.'],
    'Couldn’t be better.','Couldn’t be better 是強烈的正面評價；Can’t complain 的語氣較含蓄。'),
  blank('native-102-v2-build','新工作忙碌，但團隊很好。朋友問 How’s the new job? 不看選項，用本課的低調正面表達回答。','','',
    ['Can’t complain.','I can’t complain.'],'想想「沒甚麼好抱怨」的兩字慣用回應。',
    'Can’t complain. 也可以說 I can’t complain. 語氣是「整體還不錯」。'),
  blank('native-102-v2-detail','再補一句真實細節：你的新同事很友善。','My new coworkers have been really ','.',
    ['kind','friendly','welcoming','helpful','nice'],'用一個形容人的正面形容詞。',
    '例如 My new coworkers have been really kind. 這句具體說明你為何覺得近況不錯。'),
  mc('native-102-v2-neutral','只聽第二種近況回應。它與本課主句的語氣有甚麼分別？',
    ['I’m okay 較直接、中性；Can’t complain 較含蓄地表示整體還不錯。','I’m okay 表示處境非常糟；Can’t complain 表示完美。','兩句都表示說話者正在提出投訴。'],
    'I’m okay 較直接、中性；Can’t complain 較含蓄地表示整體還不錯。',
    '兩句都可以用於近況問候，但 Can’t complain 帶有一點低調的正面語氣。'),
  mc('native-102-v2-return','聽完對話。回答者接著說 How about you?，目的是甚麼？',
    ['禮貌地把同一個問題問回對方。','要求對方列出可以投訴的事。','表示自己其實很不開心。','立即結束對話。'],
    '禮貌地把同一個問題問回對方。','回答近況後再問 How about you?，可以自然地延續雙方的談話。'),
  mc('native-102-v2-empathy','如果對方改答 I’ve had better days，你接下來怎樣回應較體貼？',
    ['Sorry to hear that. Want to talk about it?','Couldn’t be better!','Can’t complain.','Then you should stop complaining.'],
    'Sorry to hear that. Want to talk about it?','對方暗示近況不佳，先表示關心；不要把自己的「還不錯」硬套在對方身上。'),
  blank('native-102-v2-final','最後挑戰：你剛搬到新城市，安頓的過程很忙，但鄰居友善，整體過得不錯。朋友問 How’s it going? 用本課的低調正面表達回答。','','',
    ['Can’t complain.','I can’t complain.'],'用簡短、含蓄的正面回應；不需要說自己完美。',
    'Can’t complain. 這句適合「有點忙，但整體滿意」的新情境。'),
  mc('native-102-v2-final-detail','你已回答近況還不錯。哪一句補充最能支持這種語氣？',
    ['I’m still settling in, but I’ve met some kind neighbors.','Every day here has been miserable.','Everything has been absolutely perfect from day one.','I’m not allowed to talk about the move.'],
    'I’m still settling in, but I’ve met some kind neighbors.',
    '這句同時交代小困難和正面經驗，與 Can’t complain 的分寸一致。')
];

const steps=[
  {id:'native-102-v2-surprise',label:'判斷語氣',title:'「還行啦」是哪一種心情？',intro:'先看情境作判斷。答案會在提交後解釋；作答前沒有示範句。',sentence:'How have you been?',questions:['native-102-v2-spot'],reveal:'Can’t complain 是英語閒聊中低調的「還不錯」。它不是說自己無法投訴。',model:'Can’t complain.',zh:'還不錯；沒甚麼好抱怨的。'},
  {id:'native-102-v2-listen',label:'聽出意思',title:'只聽聲音，辨別言外之意',intro:'先播放短對話。逐字稿會在答對後出現，這一步測的是理解語氣。',model:'How have you been? Can’t complain. How about you? Pretty good.',zh:'最近怎樣？還不錯。你呢？挺好的。',audioOnly:true,questions:['native-102-v2-listen']},
  {id:'native-102-v2-contrast',label:'比較分寸',title:'還不錯、勉強撐住、好得不得了',intro:'三種心情都可能出現在近況問候，但英文回應不能混用。',questions:['native-102-v2-contrast-hard','native-102-v2-contrast-great']},
  {id:'native-102-v2-build',label:'自己組句',title:'先回答，再交代原因',intro:'換到新工作的情境。先從記憶說出表達，再補上一句具體細節。',questions:['native-102-v2-build','native-102-v2-detail']},
  {id:'native-102-v2-speak',label:'開口回應',title:'聽完，換你即時回答',intro:'想像同事問 How’s the new job? 聽完示範後，不看文字，錄下自己的回應，最好加一句原因。錄音可選擇跳過。',model:'Can’t complain.',zh:'還不錯。',audioOnly:true,speakingPrompt:'想像同事問 How’s the new job? 用自己的聲音回答，再加一句原因。錄音是自我練習，不會被自動評為發音正確。',recording:'dialogue',questions:[]},
  {id:'native-102-v2-neutral',label:'第二種答法',title:'I’m okay 和 Can’t complain 差在哪？',intro:'只聽另一個自然回應，判斷它與本課主句的語氣差別。',model:'I’m okay.',zh:'我還可以。',audioOnly:true,questions:['native-102-v2-neutral']},
  {id:'native-102-v2-dialogue',label:'接住對話',title:'問回對方，也要聽懂對方',intro:'先聽一段較長的閒聊，再選擇合適的接話方式。',model:'Hey! How have you been? Can’t complain. How about you? Pretty good. Just busy with work.',zh:'嘿！最近怎樣？還不錯。你呢？挺好的，只是工作有點忙。',audioOnly:true,questions:['native-102-v2-return','native-102-v2-empathy']},
  {id:'native-102-v2-final',label:'換境挑戰',title:'搬到新城市，自己決定怎樣回應',intro:'這次沒有示範或選項提示主句。先寫出簡短回應，再選一句能支持它的真實細節。',questions:['native-102-v2-final','native-102-v2-final-detail']}
];

export default {revision:2,summary:'從語氣和新情境學會 Can’t complain，分辨「還不錯」「勉強撐住」與「好得不能再好」，並自然接住對話。',steps,questions,takeaways:['Can’t complain.','I’m okay.'],completionTitle:'你能低調地說明近況，也能聽出別人的語氣了！'};
