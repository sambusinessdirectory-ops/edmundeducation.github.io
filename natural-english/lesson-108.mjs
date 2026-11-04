import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-108-v2-audio','audio','只聽這個詞組。它說明小傷口怎樣來？',
    ['被紙的邊緣割到。','被滾水燙到。','被蚊子叮到。','被鞋磨到。'],
    '被紙的邊緣割到。','paper cut 是紙邊造成的小割傷；重點是來源，不只是傷口大小。'),
  mc('native-108-v2-contrast','contrast','I have a cut on my finger 與 I got a paper cut 有甚麼不同？',
    ['前者只說手指有割傷；後者指出是紙造成。','前者只說紙張，後者只說燙傷。','兩句都保證傷口已痊癒。','兩句都表示手指完全沒有傷口。'],
    '前者只說手指有割傷；後者指出是紙造成。','cut on my finger 說位置和傷口；paper cut 額外說明來源。'),
  mc('native-108-v2-reverse','reverse','朋友說 I got a paper cut while sorting documents。哪個轉述最貼近？',
    ['整理文件時被紙邊割到。','整理文件時扭傷手腕。','整理文件時把紙燒焦。','整理文件時被訂書針刺到。'],
    '整理文件時被紙邊割到。','paper cut 指紙造成的細小割傷，不是文件工作中任何一種手部傷害。'),
  mc('native-108-v2-detail','detail','你想向同事交代手指的 paper cut。哪個細節與這種傷口最一致？',
    ['翻頁時紙邊劃到指尖，留下一道小口。','搬箱子時被重物砸到整隻手。','倒熱水時燙紅了手背。','走路時腳踝扭了一下。'],
    '翻頁時紙邊劃到指尖，留下一道小口。','描述要與紙邊接觸及小割口相符；其餘選項都是不同傷因。'),
  open('native-108-v2-final','final','最後挑戰：你整理文件時被紙邊割到食指，留下小傷口。同事問 What happened to your finger? 用兩句英文說明傷口與當時在做甚麼。',
    ["I got a paper cut on my index finger. I was sorting some documents.","It's just a paper cut. I got it while going through the papers.","The edge of a sheet of paper cut my finger while I was sorting files."],
    'paper cut 說出來源；再交代整理文件的情境，毋須把小傷口誇大成其他傷勢。')
];
const steps=[
  {id:'native-108-v2-audio',style:'audio',label:'聽出來源',title:'紙邊很利',intro:'先只聽詞組。',model:'paper cut',zh:'紙割傷。',audioOnly:true,questions:['native-108-v2-audio']},
  {id:'native-108-v2-contrast',style:'contrast',label:'普通割傷',title:'有說明來源嗎？',intro:'比較一般 cut 與 paper cut。',questions:['native-108-v2-contrast']},
  {id:'native-108-v2-reverse',style:'reverse',label:'轉述同事',title:'整理文件時發生',intro:'保留傷因，不替換成其他意外。',questions:['native-108-v2-reverse']},
  {id:'native-108-v2-speak',style:'speak',label:'口頭描述',title:'指尖一道小口',intro:'先自己說；錄音或跳過後才聽示範。',model:'I have a cut on my finger.',zh:'我的手指有一道傷口。',speakingPrompt:'手指有一道小割傷；先用一般說法告訴同事。',recording:'phrase',questions:[]},
  {id:'native-108-v2-detail',style:'detail',label:'對上細節',title:'怎樣才算紙割傷？',intro:'從幾種手部意外中辨認來源。',questions:['native-108-v2-detail']},
  {id:'native-108-v2-final',style:'final',label:'文件夾挑戰',title:'小傷口從哪裡來？',intro:'自己說出傷口和發生時的動作。',questions:['native-108-v2-final']}
];
export default {revision:2,summary:'用 paper cut 指明紙邊造成的小割傷，分清一般 cut 只說傷口。',steps,questions,takeaways:['paper cut','I have a cut on my finger.'],completionTitle:'你能準確交代手指小割傷的來源。'};
