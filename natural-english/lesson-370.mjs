import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-370-v2-audio','audio','先聽這句對汽車的描述。事件順序是甚麼？',['行駛中突然熄火，之後再也發不動。','停車後正常關引擎，現在可再開。','遙控鑰匙沒電，但車子正行駛。','輪胎漏氣但引擎仍運轉。'],'行駛中突然熄火，之後再也發不動。','stalled 是引擎意外熄火；won’t restart 補上再次發動失敗。'),
  mc('native-370-v2-detail','detail','哪項資訊最能區分「stalled and won’t restart」與單純停車熄匙？',['開車途中引擎突然停，之後按啟動也沒反應。','到達目的地後主動關車，十分鐘後正常啟動。','停車後只忘了鎖門。','車上的收音機音量太小。'],'開車途中引擎突然停，之後按啟動也沒反應。','必須有兩個先後條件：行駛中引擎意外熄火，接着嘗試重新發動仍失敗。'),
  mc('native-370-v2-repair','repair','你向道路救援只說「My car broke down」。哪句能補上他們需要的兩個關鍵事實？',["The car stalled while I was driving and won't restart.","The key fob battery is low, but the engine runs.","A tire looks soft, but the car drives normally.","I parked here on purpose and can leave anytime."],"The car stalled while I was driving and won't restart.",'補充行駛中熄火與無法重新發動，讓救援知道當前狀況。'),
  open('native-370-v2-final','final','新情境：你開車經過住宅街時引擎突然熄了，安全停靠後試着重新發動兩次都不成功。寫兩句英文向道路救援說明經過和現在的狀態。',["The car stalled while I was driving through a residential street. It won't restart after two tries.","My engine stopped unexpectedly on the road. I've pulled over, but the car won't restart.","The car suddenly stalled, so I stopped safely. I've tried starting it twice, but it still won't run."],'自評時看是否同時說出意外熄火與現在不能重新發動，不只泛稱車壞了。')
];
const steps=[
  {id:'native-370-v2-audio',style:'audio',label:'聽出兩段事件',title:'先熄火，再怎樣？',intro:'先聽汽車熄火後能否重新發動。',model:'The car stalled and won’t restart.',zh:'車突然熄火後再發不動。',audioOnly:true,questions:['native-370-v2-audio']},
  {id:'native-370-v2-detail',style:'detail',label:'核對時間線',title:'不是正常停車',intro:'找出意外熄火與重啟失敗。',questions:['native-370-v2-detail']},
  {id:'native-370-v2-repair',style:'repair',label:'補充救援資訊',title:'比 broke down 更具體',intro:'把救援需要的兩個事實說清。',questions:['native-370-v2-repair']},
  {id:'native-370-v2-speak',style:'speak',label:'口頭通報',title:'車現在發不動',intro:'先自己說；錄音或跳過後才聽示範。',model:'The car stalled and won’t restart.',zh:'車突然熄火後再發不動。',speakingPrompt:'行駛中引擎突然停下，現在安全停靠卻重新發不動。簡短向救援報告。',recording:'phrase',questions:[]},
  {id:'native-370-v2-final',style:'final',label:'道路救援挑戰',title:'交代經過和現況',intro:'交代車先熄火、現在仍不能重啟。',questions:['native-370-v2-final']}
];
export default {revision:2,summary:'用 stalled and won’t restart 交代汽車意外熄火後仍無法重新發動的兩段時間線。',steps,questions,takeaways:['The car stalled and won’t restart.'],completionTitle:'你能向道路救援清楚交代熄火與重啟失敗。'};
