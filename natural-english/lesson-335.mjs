import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-335-v2-audio','audio','只聽旅客一句話。拉桿是在甚麼位置出問題？',
    ['能伸出一段，但到一半就卡住。','從箱內完全拉不出。','已完全伸出，但不能縮回。','整根拉桿已折斷脫落。'],
    '能伸出一段，但到一半就卡住。','jams halfway 指動到半途才卡住；這個位置資訊可幫人分辨故障。'),
  mc('native-335-v2-detail','detail','拉桿每次都伸出約一半，之後要用力也拉不高。哪句保留最重要的細節？',
    ["The handle jams halfway.","The handle won’t come out at all.","The handle came off completely.","The handle closes smoothly."],
    "The handle jams halfway.",'halfway 點出每次卡在半路，與完全不能拉出或完全脫落不同。'),
  mc('native-335-v2-contrast','contrast','比較兩個行李箱：甲的拉桿完全拉不出；乙可伸到一半才停。下列哪句只適用於乙？',
    ["The handle jams halfway.","The handle is stuck inside and won’t move at all.","The handle snapped off at the base.","The suitcase is bulging at the zipper."],
    "The handle jams halfway.",'乙的關鍵是起初能移動，到一半才停；其他句子分別是完全卡死、折斷或箱身過滿。'),
  mc('native-335-v2-explain','explain','維修人員問 How far does the handle extend? 哪句回答最有助定位故障？',
    ["It extends halfway, then jams in the same spot each time.","The handle has a nice colour.","It belongs to my old suitcase.","I usually pack too many clothes."],
    "It extends halfway, then jams in the same spot each time.",'說明伸出距離及每次卡住的位置，比只說「壞了」更能幫維修人員了解問題。'),
  open('native-335-v2-final','final','最後挑戰：你借來的行李箱拉桿可以拉出一半，但再拉就卡住；這情況每次都發生。用兩句英文向物主說明故障，並問對方是否早已知道。',
    ["The handle extends halfway, then jams every time. Did you know it was doing that?","I can pull the handle up partway, but it gets stuck halfway. Has this happened to you before?","The suitcase handle stops at the same point each time. Were you aware that it jams halfway?"],
    '清楚說明先能伸出、到半途才卡住，而且反覆發生；追問物主時保持中性語氣。')
];
const steps=[
  {id:'native-335-v2-audio',style:'audio',label:'聽出位置',title:'卡在伸出一半',intro:'留意 halfway 的資訊。',model:'The handle jams halfway.',zh:'拉桿拉到一半就卡住。',audioOnly:true,questions:['native-335-v2-audio']},
  {id:'native-335-v2-detail',style:'detail',label:'抓位置',title:'並非完全不動',intro:'選保留半途卡住這個細節的句子。',questions:['native-335-v2-detail']},
  {id:'native-335-v2-contrast',style:'contrast',label:'比較兩箱',title:'同是卡住，位置不同',intro:'分辨這課與完全拉不出的情況。',questions:['native-335-v2-contrast']},
  {id:'native-335-v2-explain',style:'explain',label:'幫人定位',title:'說明故障規律',intro:'回答維修人員最需要知道的事。',questions:['native-335-v2-explain']},
  {id:'native-335-v2-speak',style:'speak',label:'即場口說',title:'說出卡住位置',intro:'先自己說；錄音或跳過後才聽示範。',model:'The handle jams halfway.',zh:'拉桿拉到一半就卡住。',speakingPrompt:'你試著拉行李箱拉桿；它伸出一半便停。',recording:'phrase',questions:[]},
  {id:'native-335-v2-final',style:'final',label:'向物主說明',title:'描述重複故障',intro:'自行寫兩句，包含位置與追問。',questions:['native-335-v2-final']}
];
export default {revision:2,summary:'用 jams halfway 精確說出行李箱拉桿在伸出半途卡住。',steps,questions,takeaways:['The handle jams halfway.','The handle is stuck.'],completionTitle:'你能說明卡住的位置與規律，不把半途卡住說成完全拉不出。'};
