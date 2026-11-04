import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-333-v2-audio','audio','只聽旅客的一句話。行李箱輪子發生了甚麼事？',
    ['輪子折斷並從箱身脫落。','輪子只是轉得不順。','輪子沾了泥但仍然完整。','行李箱拉桿卡住了。'],
    '輪子折斷並從箱身脫落。','snapped off 描述突然斷裂且脫落，比單純轉不動嚴重。'),
  mc('native-333-v2-detail','detail','你在機場推行李箱，輪子突然斷開，現在掉在地上。哪個說法保留「斷裂」這個細節？',
    ["The wheel snapped off.","The wheel is wobbling.","The handle is stuck.","The wheel is dirty."],
    "The wheel snapped off.",'snapped off 同時帶出斷開和脫落；wobbling 只說搖晃。'),
  mc('native-333-v2-contrast','contrast','哪個情境較適合說 The wheel came off，而不能確定它是否折斷？',
    ['輪子整個脫離箱身，但你還未看清連接處有沒有裂。','輪子仍裝著，只是發出聲響。','拉桿只拉到一半便卡住。','箱身被撞凹，但輪子沒事。'],
    '輪子整個脫離箱身，但你還未看清連接處有沒有裂。','came off 只確認脫落；若看見連接處斷裂，才更有根據說 snapped off。'),
  mc('native-333-v2-branch','branch','你向航空公司行李服務處報告輪子斷掉。職員問 Which part was damaged? 哪個回答最具體？',
    ["One of the wheels snapped off when I pulled the suitcase.","My luggage is unhappy with the airport.","The wheel may be repaired someday, I suppose.","Everything about my journey was terrible."],
    "One of the wheels snapped off when I pulled the suitcase.",'指出是其中一個輪子，也說明何時斷開，方便職員記錄實際損壞。'),
  open('native-333-v2-final','final','最後挑戰：你剛從行李輸送帶拿到行李箱，發現其中一個輪子已折斷並掉下來。向航空公司職員用兩句英文描述具體損壞，並提出希望對方查看。',
    ["One of the wheels has snapped off my suitcase. Could you take a look at the damage?","A wheel came off my suitcase, and the attachment looks broken. Could someone inspect it?","I’ve just collected my suitcase, and one wheel is broken off. Can you help me report the damage?"],
    '描述是哪個部位折斷、是否脫落，再提出請職員查看或記錄；比只說行李壞了清楚。')
];
const steps=[
  {id:'native-333-v2-audio',style:'audio',label:'聽出損壞',title:'輪子不是只卡住',intro:'先聽旅客一句描述。',model:'The wheel snapped off.',zh:'輪子斷掉並脫落了。',audioOnly:true,questions:['native-333-v2-audio']},
  {id:'native-333-v2-detail',style:'detail',label:'抓損壞細節',title:'斷開與脫落',intro:'選保留斷裂資訊的說法。',questions:['native-333-v2-detail']},
  {id:'native-333-v2-contrast',style:'contrast',label:'比較描述',title:'came off 的界線',intro:'只看見脫落時，先不要假設斷裂。',questions:['native-333-v2-contrast']},
  {id:'native-333-v2-branch',style:'branch',label:'服務處回應',title:'回答職員的追問',intro:'用具體部位和經過協助記錄。',questions:['native-333-v2-branch']},
  {id:'native-333-v2-speak',style:'speak',label:'即時口說',title:'說明輪子斷掉',intro:'先自己說；錄音或跳過後才聽示範。',model:'The wheel snapped off.',zh:'輪子斷掉並脫落了。',speakingPrompt:'你看見行李箱輪子折斷，向旁邊的職員說明。',recording:'phrase',questions:[]},
  {id:'native-333-v2-final',style:'final',label:'行李報損挑戰',title:'描述並請人查看',intro:'自行寫兩句，不看答案。',questions:['native-333-v2-final']}
];
export default {revision:2,summary:'區分 snapped off 與 came off，向職員具體說明行李箱輪子斷裂脫落。',steps,questions,takeaways:['The wheel snapped off.','The wheel came off.'],completionTitle:'你能準確描述輪子損壞，並向服務處提出查看請求。'};
