import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-336-v2-audio','audio','先聽旅客的抱怨。箱子最可能出了甚麼狀況？',
    ['塞了太多東西，箱身鼓起來。','輪子整個掉了。','拉桿縮在裡面出不來。','箱內幾乎沒有行李。'],
    '塞了太多東西，箱身鼓起來。','overstuffed 是裝得過滿；箱子因內容物太多而鼓起，拉鍊也可能難關。'),
  mc('native-336-v2-scene','scene','收拾行李時，衣物把箱蓋頂高，拉鍊只能勉強拉上。哪句最準確？',
    ["My suitcase is overstuffed.","My suitcase is almost empty.","My suitcase handle is jammed halfway.","My suitcase has a dent from the flight."],
    "My suitcase is overstuffed.",'overstuffed 描述塞得過滿；這裡並無證據說拉桿或箱殼受損。'),
  mc('native-336-v2-contrast','contrast','旅伴說 My suitcase is bulging。哪個觀察支持他的說法？',
    ['箱身兩側被裡面的衣物撐得向外突出。','其中一個輪子在地上滾走。','箱子外殼有一處向內凹陷。','行李牌從手柄上鬆脫。'],
    '箱身兩側被裡面的衣物撐得向外突出。','bulging 是向外鼓出，與被撞出的向內凹痕方向相反。'),
  mc('native-336-v2-continue','continue','朋友看到你的行李箱鼓起，問你拉鍊還能否關上。哪個回答最自然且貼合現況？',
    ["Barely. I’ll take a few things out before the zipper breaks.","Yes, there’s plenty of empty space inside.","No, the suitcase wheel has already snapped off.","It doesn’t matter; I’ve packed nothing."],
    "Barely. I’ll take a few things out before the zipper breaks.",'過滿的箱子拉鍊勉強合上；先取出物品可回應眼前的問題。'),
  open('native-336-v2-final','final','最後挑戰：你把衣服和紀念品塞進行李箱，箱身兩邊鼓起，拉鍊繃得很緊。用兩句英文向朋友說明問題，以及你打算如何處理。',
    ["My suitcase is overstuffed and the zipper is under strain. I’m going to take some things out.","The suitcase is bulging because I packed too much. I’ll move a few items into my carry-on.","I’ve stuffed too much into this suitcase, and it won’t close easily. I’ll repack it."],
    '把過滿和箱身鼓起連起來，再說要取出或重新分配物品；別把它說成輪子或拉桿故障。')
];
const steps=[
  {id:'native-336-v2-audio',style:'audio',label:'先聽箱況',title:'東西塞得太滿',intro:'聽出問題是否在箱身。',model:'My suitcase is overstuffed.',zh:'我的行李箱塞得太滿了。',audioOnly:true,questions:['native-336-v2-audio']},
  {id:'native-336-v2-scene',style:'scene',label:'收拾情境',title:'箱蓋被頂高',intro:'看實際狀況選說法。',questions:['native-336-v2-scene']},
  {id:'native-336-v2-contrast',style:'contrast',label:'看形狀',title:'鼓起與凹陷',intro:'bulging 描述外凸，不是撞凹。',questions:['native-336-v2-contrast']},
  {id:'native-336-v2-continue',style:'continue',label:'接續對話',title:'拉鍊快受不住',intro:'回應朋友對拉鍊的擔心。',questions:['native-336-v2-continue']},
  {id:'native-336-v2-speak',style:'speak',label:'即時口說',title:'解釋箱子過滿',intro:'先自己說；錄音或跳過後才聽示範。',model:'My suitcase is overstuffed.',zh:'我的行李箱塞得太滿了。',speakingPrompt:'朋友見你怎樣也關不上行李箱；你已塞了太多衣服。',recording:'phrase',questions:[]},
  {id:'native-336-v2-final',style:'final',label:'重新分配挑戰',title:'鼓起後怎樣處理',intro:'自行寫兩句，交代現況和行動。',questions:['native-336-v2-final']}
];
export default {revision:2,summary:'描述行李箱裝得過滿、箱身鼓起，並說明如何減輕拉鍊壓力。',steps,questions,takeaways:['My suitcase is overstuffed.','My suitcase is bulging.'],completionTitle:'你能說明行李箱過滿與外凸，並提出合適處理方法。'};
