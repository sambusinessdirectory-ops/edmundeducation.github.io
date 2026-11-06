import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-111-v2-audio','audio','只聽這句。說話者的睡著是怎樣發生的？',['沒有打算睡，卻短暫睡著了。','特意提早上床睡整夜。','整晚無法入睡。','白天有意安排了一段小睡。'],'沒有打算睡，卻短暫睡著了。','dozed off 帶有不知不覺、通常短暫睡著的意思。'),
  mc('native-111-v2-scene','scene','電影看到一半，你在梳化上閉了眼，醒來才發現錯過一幕。怎樣向朋友交代？',["I dozed off for a bit.","I stayed up all night.","I took a planned nap before the movie.","I fell asleep before the movie started."],"I dozed off for a bit.",'for a bit 配合短暫、不經意睡著；planned nap 是有意小睡。'),
  mc('native-111-v2-transfer','transfer','換到巴士：你本來在看窗外，下一站才驚覺自己剛睡著。哪句最貼切？',["I dozed off on the bus.","I took a planned nap on the bus.","I was awake the whole ride.","I stayed awake for the whole bus ride."],"I dozed off on the bus.",'巴士上不經意睡著同樣可用 dozed off；不用真的上床。'),
  mc('native-111-v2-continue','continue','朋友說 I dozed off during the lecture。你想知道他有沒有漏掉重點，怎樣接話？',["Did you miss the explanation at the end?","What time did you go to bed for the night?","Did you hear the point the teacher made after that?","Did you wake up before the lecture ended?"],"Did you miss the explanation at the end?",'上課時短暫睡著可能錯過最後的講解；這個追問緊扣對方剛說的經過。'),
  open('native-111-v2-final','final','最後挑戰：你在等朋友回訊息，坐在梳化上不知不覺睡了十分鐘。朋友問為何你沒即時回覆。用兩句英文說明經過和現在的狀況。',["Sorry, I dozed off on the couch for a few minutes. I'm awake now.","I fell asleep on the couch while I was waiting. I just woke up."],'交代原本在等待、意外睡著，以及醒來後能回覆；dozed off 特別合適短暫一睡。')
];
const steps=[
  {id:'native-111-v2-audio',style:'audio',label:'只聽一句',title:'不知不覺睡著',intro:'先聽，再判斷這一睡是否有計劃。',model:'I dozed off.',zh:'我不小心睡著了。',audioOnly:true,questions:['native-111-v2-audio']},
  {id:'native-111-v2-scene',style:'scene',label:'電影中途',title:'錯過了一幕',intro:'將短暫睡著放進看電影的情境。',questions:['native-111-v2-scene']},
  {id:'native-111-v2-transfer',style:'transfer',label:'換到巴士',title:'坐車也可能打瞌睡',intro:'同一動作換一個場所。',questions:['native-111-v2-transfer']},
  {id:'native-111-v2-continue',style:'continue',label:'接住對話',title:'漏聽了多少？',intro:'對方上課時睡了一會，問出相關的下一句。',questions:['native-111-v2-continue']},
  {id:'native-111-v2-final',style:'final',label:'訊息挑戰',title:'解釋遲回覆',intro:'自己交代意外睡著及現在已醒。',questions:['native-111-v2-final']}
];
export default {revision:2,summary:'用 dozed off 說明沒有打算睡、卻短暫睡著，並可用於梳化、課堂或車上。',steps,questions,takeaways:['I dozed off.','I fell asleep on the couch.'],completionTitle:'你能自然交代自己不知不覺睡著了。'};
