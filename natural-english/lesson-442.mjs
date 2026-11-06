import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-442-v2-audio','audio','只聽自動門問題。說話者認為哪一環節沒有發生？',['感應器沒有偵測到他站在門前。','門已偵測到人但開得太慢。','玻璃門被鎖上。','門開了又立刻關上。'],'感應器沒有偵測到他站在門前。','isn’t detecting me 指感應器沒有識別到人；是對門不開的可能解釋。'),
  mc('native-442-v2-reverse','reverse','你站到自動門前，又前後移了幾步，門仍毫無反應。哪句把可能問題放在感應器？',["The sensor isn't detecting me.","The door is opening too slowly.","The door is locked for the night.","The sensor detected someone behind me."],"The sensor isn't detecting me.",'門完全沒啟動，可能沒有感應到你；不要把門開得慢當成同一狀況。'),
  mc('native-442-v2-continue','continue','朋友問 Have you tried moving closer? 你已靠近仍沒反應。哪句回覆最清楚？',["Yes, I'm right in front of it, but it still isn't detecting me.","No, it opened as soon as I stepped back.","I moved closer and it opened slowly.","I haven't gone near the door yet."],"Yes, I'm right in front of it, but it still isn't detecting me.",'說明已試著靠近且仍無反應，朋友才不用重複提出相同步驟。'),
  mc('native-442-v2-branch','branch','自動門不開，旁邊有另一個入口。同行人問 What should we do? 你要先進去並讓職員知道這道門沒反應，怎樣說？',["Let's try the other entrance and report this sensor.","Let's wait at this door and see if it eventually opens.","Let's use the other entrance without mentioning this door.","Let's ask whether the building is open before trying another door."],"Let's try the other entrance and report this sensor.",'回答同時處理當下進出與回報感應門問題；其他做法只處理其中一部分或延遲進入。'),
  open('native-442-v2-final','final','最後挑戰：你站在商場自動門前，前後走了幾步，它仍不開。保安問你怎麼回事。寫兩句英文描述門的反應和你懷疑的原因。',["The automatic door won't open even when I stand right in front of it. I think the sensor isn't detecting me.","I moved closer and back, but the door never reacted. The sensor may not be picking me up."],'先說可觀察到的門不開，再用 think 或 may 表達對感應器原因的推測。')
];
const steps=[
  {id:'native-442-v2-audio',style:'audio',label:'先聽推測',title:'自動門沒有反應',intro:'分清門沒偵測與開得慢。',model:'The sensor isn’t detecting me.',zh:'感應器沒有偵測到我。',audioOnly:true,questions:['native-442-v2-audio']},
  {id:'native-442-v2-reverse',style:'reverse',label:'站到門前',title:'前後走仍不開',intro:'從門的反應推想可能環節。',questions:['native-442-v2-reverse']},
  {id:'native-442-v2-continue',style:'continue',label:'回應朋友',title:'已試過靠近',intro:'報告做過的動作與結果。',questions:['native-442-v2-continue']},
  {id:'native-442-v2-branch',style:'branch',label:'找替代入口',title:'接下來怎麼走',intro:'兼顧繼續進入與報告故障。',questions:['native-442-v2-branch']},
  {id:'native-442-v2-speak',style:'speak',label:'口頭轉用',title:'感應水龍頭也沒反應',intro:'先自己說；錄音或跳過後才聽示範。',model:'The sensor isn’t detecting my hands.',zh:'感應器偵測不到我的手。',speakingPrompt:'你把手放到感應水龍頭下，它毫無反應。先口頭說可能原因。',recording:'phrase',questions:[]},
  {id:'native-442-v2-final',style:'final',label:'保安挑戰',title:'說出觀察和推測',intro:'自己描述自動門的問題。',questions:['native-442-v2-final']}
];
export default {revision:2,summary:'用 sensor isn’t detecting me 解釋自動門無反應，並把觀察與推測分開。',steps,questions,takeaways:['The sensor isn’t detecting me.','The sensor isn’t detecting my hands.'],completionTitle:'你能清楚向保安說明自動門如何沒有反應。'};
