import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-097-v2-audio','audio','只聽這句提醒。說話者正在做甚麼？',
    ['提醒附近的人自己正要穿過。','宣布自己已到終點。','請大家立即坐下。','詢問誰是隊伍最後一人。'],
    '提醒附近的人自己正要穿過。','Coming through 常在要從人群中經過時先提醒別人；語氣要配合場合。'),
  mc('native-097-v2-detail','detail','你端著一盤熱湯，要從擁擠的廚房通過。說 Coming through 時，哪個細節讓提醒更有用？',
    ['讓人有時間讓開，必要時再說明湯很熱。','加快速度，完全不看前面。','等撞到人後才提醒。','以為一句提醒就可以推開別人。'],
    '讓人有時間讓開，必要時再說明湯很熱。','提醒應在經過前說，讓人能反應；熱湯也值得另外說明。'),
  mc('native-097-v2-branch','branch','你說 Excuse me, coming through。前面的人轉身並讓開，下一句最自然是甚麼？',
    ['Thanks.','You should have moved sooner.','I never needed to pass.','Please block me again.'],
    'Thanks.','對方已讓路，簡短道謝即可自然結束這一回合。'),
  mc('native-097-v2-scene','scene','比較 Coming through 與 Can I get by? 哪個用法更貼近你正在穿過一群人、需要提醒沿途的人？',
    ['Coming through.','Can I get by?','Have you arrived?','Where is the exit?'],
    'Coming through.','Coming through 像向周圍人發出的通行提醒；Can I get by? 更像向眼前阻路的人提出請求。'),
  mc('native-097-v2-transfer','transfer','除了人群，哪個場景也適合先說 Coming through？',
    ['推著手推車經過狹窄走道。','在空房間獨自讀書。','坐在椅上看天氣預報。','已穿過走道後才發訊息。'],
    '推著手推車經過狹窄走道。','要帶著東西經過有人或可能有人移動的狹窄通道，先提醒更有用。'),
  open('native-097-v2-final','final','最後挑戰：你端著兩杯熱飲，要穿過站滿人的房間。用兩句英文先禮貌提醒大家你正要經過，再提醒手上是熱飲。',
    ["Excuse me, coming through. I've got hot drinks.","Coming through, please. These drinks are hot.","Excuse me, I'm coming through with hot drinks."],
    '把通行提醒放在經過前；說出 hot drinks，讓周圍的人知道為何需要多一點空間。')
];
const steps=[
  {id:'native-097-v2-audio',style:'audio',label:'聽出提醒',title:'先說一聲再走',intro:'只聽短句，判斷說話者要做甚麼。',model:'Coming through.',zh:'借過，我要過去。',audioOnly:true,questions:['native-097-v2-audio']},
  {id:'native-097-v2-detail',style:'detail',label:'留意安全',title:'手上有熱湯',intro:'提醒的時機與內容都重要。',questions:['native-097-v2-detail']},
  {id:'native-097-v2-scene',style:'scene',label:'兩種說法',title:'提醒人群，還是請眼前的人讓路？',intro:'比較這一課與上一課的用途。',questions:['native-097-v2-scene']},
  {id:'native-097-v2-branch',style:'branch',label:'對方讓開',title:'順勢道謝',intro:'接好短短一回合對話。',questions:['native-097-v2-branch']},
  {id:'native-097-v2-transfer',style:'transfer',label:'換個物件',title:'推車經過走道',intro:'判斷另一個適用情境。',questions:['native-097-v2-transfer']},
  {id:'native-097-v2-final',style:'final',label:'熱飲挑戰',title:'穿過站滿人的房間',intro:'新情境，不給選項或示範。',questions:['native-097-v2-final']}
];
export default {revision:2,summary:'用 Coming through 先提醒人群自己要經過，並在需要時補充手上有熱物。',steps,questions,takeaways:['Coming through.','Can I get by?'],completionTitle:'你能在穿過人群前清楚提醒，也懂得回應讓路的人。'};
