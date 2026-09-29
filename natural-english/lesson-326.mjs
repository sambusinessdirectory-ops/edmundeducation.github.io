import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-326-v2-audio','audio','只聽店員這句話。關於缺貨商品，現在知道甚麼？',
    ['店方正在補貨，但未必已經可買。','商品已永久停產。','現在每間分店都有現貨。','店員正在替你辦退款。'],
    '店方正在補貨，但未必已經可買。','It’s being restocked 說補貨正在進行；不等於貨已到架上，更沒有保證確切日期。'),
  mc('native-326-v2-scene','scene','你要的尺寸眼前沒有，店員說正在補貨。你向朋友轉述，哪句沒有過度保證？',
    ["They're restocking this size, but I don't know when it'll be available.","They have plenty of this size right now.","The size has been discontinued forever.","They promised it would be here in an hour."],
    "They're restocking this size, but I don't know when it'll be available.",'把「正在補貨」和「未知到貨時間」分開；不要把 restocking 說成已到貨。'),
  mc('native-326-v2-tone','tone','你週末前需要商品；店員只說 It’s being restocked。哪個追問有禮又切中需要？',
    ["Do you know when it'll be back in stock?","Why didn't you keep it for me personally?","Are you sure your store ever had it?","Can you promise it will arrive tonight?"],
    "Do you know when it'll be back in stock?",'先問有沒有預計補貨時間，再決定等不等；避免強迫店員保證不確定的日期。'),
  open('native-326-v2-final','final','最後挑戰：你要的筆記本目前售罄；店員說正在補貨，卻沒有給日期。你想知道下週上課前買不買得到。用兩句英文確認正在補貨，並詢問預計到貨時間。',
    ["I understand the notebooks are being restocked. Do you know when they'll be back in stock?","So you're restocking them now? Is there an estimated date when I can buy one?","Thanks. Do you know when this notebook will be available again? I need it before next week."],
    'restocking 說過程，back in stock 才說再次有貨；問題應問預估時間，而非假定已可購買。')
];
const steps=[
  {id:'native-326-v2-audio',style:'audio',label:'聽出進度',title:'正在補貨',intro:'先只聽一句庫存消息。',model:'It’s being restocked.',zh:'這件商品正在補貨。',audioOnly:true,questions:['native-326-v2-audio']},
  {id:'native-326-v2-scene',style:'scene',label:'轉述店員',title:'別說成已經有貨',intro:'把已知和未知的部分說清楚。',questions:['native-326-v2-scene']},
  {id:'native-326-v2-tone',style:'tone',label:'問可買時間',title:'週末前需要',intro:'提出有用而不強迫保證的問題。',questions:['native-326-v2-tone']},
  {id:'native-326-v2-speak',style:'speak',label:'口頭更新',title:'告訴朋友店裡在補貨',intro:'先自己說；錄音或跳過後才聽示範。',model:'They’re restocking this item.',zh:'他們正在補這款商品。',speakingPrompt:'朋友問你為何貨架空了；店員說這款正在補貨。',recording:'phrase',questions:[]},
  {id:'native-326-v2-final',style:'final',label:'筆記本挑戰',title:'下週前能買嗎？',intro:'新情境，自己問清補貨進度。',questions:['native-326-v2-final']}
];
export default {revision:2,summary:'分清 being restocked 與 back in stock，並詢問商品何時再可購買。',steps,questions,takeaways:['It’s being restocked.','They’re restocking this item.'],completionTitle:'你能準確轉述補貨進度，並問出對自己有用的時間。'};
