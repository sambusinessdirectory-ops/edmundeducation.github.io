import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-029-v2-reverse','reverse',
    '服裝店的標示寫 You can try it on. 客人獲准做甚麼？',
    ['先穿上看看是否合身。','只可以看標價。','必須立刻付款。','要把衣服帶回家才打開。'],
    '先穿上看看是否合身。',
    'try on 是把衣服或鞋穿上試尺寸、效果；不表示已決定購買。'),
  mc('native-029-v2-tone','tone',
    '你拿着一件外套，想有禮地向店員問能否試穿。哪句最切合？',
    ['Can I try this on?','I’m buying this without checking the size.','Where can I pay for this?','Do you have this in black?'],
    'Can I try this on?',
    'Can I try this on? 直接、有禮地問能否試穿；其餘句子談付款或顏色，沒有提出試穿要求。'),
  mc('native-029-v2-audio','audio',
    '只聽一句店內請求。客人現在想做甚麼？',
    ['穿上這件商品試一試。','要求另一種顏色。','問能否退貨。','請店員立即剪標籤。'],
    '穿上這件商品試一試。',
    'Can I try this on? 問的是試穿，不是購買或退貨。'),
  mc('native-029-v2-branch','branch',
    '店員回答 Sure. The fitting rooms are over there. 這段回應表示你接下來可以怎樣做？',
    ['到那邊的試衣間試穿。','在收銀台直接付款。','把商品留在店外。','等店員明天送來。'],
    '到那邊的試衣間試穿。',
    'fitting rooms 是試衣間；店員已答應你試穿並指出位置。'),
  open('native-029-v2-final','final',
    '最後挑戰：你在鞋店找到一雙喜歡的鞋，但不肯定尺碼。用兩句英文有禮地問店員能否試穿，再問試鞋的位置。',
    ['Could I try these shoes on? Where can I sit to do that?','Can I try this pair on? Is there a place where I can sit down?','I like these shoes, but I need to check the fit. May I try them on here?'],
    '把單數衣物 this 與一雙鞋 these shoes 或 this pair 分清，並自然地問下一步在哪裏試穿。')
];

const steps=[
  {id:'native-029-v2-audio',style:'audio',label:'聽出意圖',title:'客人的下一步是甚麼？',intro:'只聽聲音，答完才看逐字稿。',model:'Can I try this on?',zh:'我可以試穿這件嗎？',audioOnly:true,questions:['native-029-v2-audio']},
  {id:'native-029-v2-reverse',style:'reverse',label:'先看詞組',title:'try on 是甚麼動作？',intro:'從店內標示理解這個動作，不急着背整句。',questions:['native-029-v2-reverse']},
  {id:'native-029-v2-tone',style:'tone',label:'有禮請求',title:'試穿前先問店員',intro:'你想試穿，並非準備付款。',questions:['native-029-v2-tone']},
  {id:'native-029-v2-branch',style:'branch',label:'接住店員',title:'店員指向試衣間',intro:'聽懂回應，知道下一步去哪裏。',questions:['native-029-v2-branch']},
  {id:'native-029-v2-speak',style:'speak',label:'現場開口',title:'拿起外套，換你問一次',intro:'先自己提出請求，錄音或跳過後才聽示範。',model:'Can I try this on?',zh:'我可以試穿這件嗎？',speakingPrompt:'你在服裝店拿着一件外套，想在買之前看看是否合身。向店員問。',recording:'phrase',questions:[]},
  {id:'native-029-v2-final',style:'final',label:'試鞋挑戰',title:'換一種商品自己問',intro:'不看選項，自己寫兩句。',questions:['native-029-v2-final']}
];

export default {revision:2,summary:'在服裝店有禮地問能否試穿，並聽懂店員指向試衣間的回應。',steps,questions,takeaways:['Can I try this on?','Can I try these shoes on?'],completionTitle:'你能自然地問店員可否試穿了！'};
