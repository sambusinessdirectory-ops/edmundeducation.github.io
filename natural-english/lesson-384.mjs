import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-384-v2-audio','audio','聽完後，哪個部分會左右移動？',['馬桶座圈。','馬桶水箱蓋。','整個馬桶底座。','馬桶座圈上的蓋板。'],'馬桶座圈。','toilet seat 指坐上去的座圈；loose 在這裏是沒有固定緊。'),
  mc('native-384-v2-branch','branch','坐下時座圈向旁邊滑動，但馬桶本體穩固。哪句報修最準確？',['The toilet seat is loose.','The whole toilet is falling over.','The toilet is clogged.','The bathroom floor is slippery.'],'The toilet seat is loose.','只指出座圈鬆動，讓維修人員知道需檢查固定座圈的部位。'),
  mc('native-384-v2-continue','continue','房東聽到「The toilet seat is loose」後，哪個追問最能判斷問題？',['Does it shift when someone sits on it?','Does the tap drip after you turn it off?','Does the toilet refuse to flush?','Is the bathroom light too bright?'],'Does it shift when someone sits on it?','問坐下時是否移位，直接確認座圈鬆動的具體表現。'),
  mc('native-384-v2-repair','repair','報修訊息寫「The toilet is broken」太籠統。哪句能精確修正？',['The toilet seat is loose and shifts from side to side.','The bathroom is broken in every way.','The toilet water is too blue.','The seat is missing, so nothing can move.'],'The toilet seat is loose and shifts from side to side.','補上座圈與左右移動的細節，避免把整個馬桶說成壞了。'),
  open('native-384-v2-final','final','新情境：旅館房間的馬桶座圈一坐就左右晃，但沖水正常。寫兩句英文向櫃檯描述問題並請人查看。',["The toilet seat in my room is loose and shifts when I sit down. Could someone please take a look at it?","The toilet flushes normally, but the seat wobbles from side to side. Could you have someone tighten it?","The seat on my toilet moves whenever I sit on it. Would someone be able to check it today?"],'自評時要指出座圈而不是整個馬桶，描述晃動，並提出具體請求。')
];
const steps=[
  {id:'native-384-v2-audio',style:'audio',label:'聽故障部位',title:'哪裏沒固定緊？',intro:'先留意會移動的是座圈還是馬桶本體。',model:'The toilet seat is loose.',zh:'馬桶座圈鬆了。',audioOnly:true,questions:['native-384-v2-audio']},
  {id:'native-384-v2-branch',style:'branch',label:'選報修句',title:'座圈左右滑',intro:'根據實際晃動範圍描述故障。',questions:['native-384-v2-branch']},
  {id:'native-384-v2-continue',style:'continue',label:'追問移動方式',title:'坐下時會晃嗎？',intro:'用下一個問題確認座圈鬆動。',questions:['native-384-v2-continue']},
  {id:'native-384-v2-repair',style:'repair',label:'修好報修文字',title:'別只說 broken',intro:'補上部位與左右移位。',questions:['native-384-v2-repair']},
  {id:'native-384-v2-speak',style:'speak',label:'口頭報修',title:'座圈鬆動',intro:'先自己說；錄音或跳過後才聽示範。',model:'The toilet seat is loose.',zh:'馬桶座圈鬆了。',speakingPrompt:'向旅館員工說馬桶座圈鬆了。',recording:'phrase',questions:[]},
  {id:'native-384-v2-final',style:'final',label:'旅館新情境',title:'描述並請人查看',intro:'說清座圈晃動，再提出維修請求。',questions:['native-384-v2-final']}
];
export default {revision:2,summary:'用 The toilet seat is loose 指出座圈固定不緊，而非整個馬桶故障。',steps,questions,takeaways:['The toilet seat is loose.'],completionTitle:'你能具體報告座圈鬆動。'};
