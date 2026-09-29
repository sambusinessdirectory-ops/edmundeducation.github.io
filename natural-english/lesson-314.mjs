import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-314-v2-audio','audio','只聽門的狀況。最關鍵的反覆現象是甚麼？',['推上後過一會又自己打開。','門完全推不到門框。','門推到一半就被地毯卡住。','門關穩了，但鑰匙無法轉動。'],'推上後過一會又自己打開。','won’t stay shut 強調關好後不能維持關閉，不一定已找出門扣或門框原因。'),
  mc('native-314-v2-repair','repair','你知道門會自行慢慢開，但還不確定是否門舌問題。哪句比直接斷定 latch 故障審慎？',["The door won't stay shut.","The door definitely won't latch.","The lock turns only when I hold the door.","The handle is a little loose."],"The door won't stay shut.",'先報告能觀察到的「關不穩」；未檢查前不要指定門舌故障。'),
  mc('native-314-v2-transfer','transfer','換成衣櫃門：每次推回去，幾分鐘後又打開。哪句可沿用核心說法？',["The closet door won't stay shut.","The closet door won't open at all.","The closet door sticks when I try to open it.","The closet door closes but is hard to pull open."],"The closet door won't stay shut.",'stay shut 可用於衣櫃門；重點是不能保持關閉。'),
  mc('native-314-v2-branch','branch','房東問 What happens when you close it? 你看到門會慢慢自己打開。哪句最準確？',["It shuts at first, then slowly swings open again.","I can't move it toward the frame.","It stays shut but the key won't turn.","It closes only if I pull the handle hard."],"It shuts at first, then slowly swings open again.",'把先關、後自開的時間順序說清楚，房東才能判斷故障。'),
  open('native-314-v2-final','final','最後挑戰：你在酒店房間把門推上，鬆手一分鐘後它自己慢慢打開。你不知道是哪個零件壞了。向櫃檯寫兩句英文描述可觀察問題並請求檢查。',["The room door won't stay shut. It slowly opens again after I close it—could someone check it?","I can close the door, but it swings back open on its own. Could you send someone to take a look?"],'先報告門不能保持關閉的事實，不必未檢查就指定門舌或門鎖壞了。')
];
const steps=[
  {id:'native-314-v2-audio',style:'audio',label:'先聽故障',title:'關上又自己開',intro:'聽出門是否能維持關閉。',model:'The door won’t stay shut.',zh:'門關上後保持不了關閉。',audioOnly:true,questions:['native-314-v2-audio']},
  {id:'native-314-v2-repair',style:'repair',label:'先報現象',title:'還未查出故障點',intro:'不要把未證實的原因當事實。',model:'The door won’t latch.',zh:'門舌扣不上。',questions:['native-314-v2-repair']},
  {id:'native-314-v2-transfer',style:'transfer',label:'衣櫃門也會',title:'同一種自開',intro:'把說法換到另一扇門。',questions:['native-314-v2-transfer']},
  {id:'native-314-v2-branch',style:'branch',label:'回答房東',title:'先關、後開',intro:'講清楚時間順序。',questions:['native-314-v2-branch']},
  {id:'native-314-v2-speak',style:'speak',label:'口頭報修',title:'門總會自行打開',intro:'先自己說；錄音或跳過後才聽示範。',model:'The door won’t stay shut.',zh:'門關不穩。',speakingPrompt:'你關門後它又自己開，向櫃檯簡短報修。',recording:'phrase',questions:[]},
  {id:'native-314-v2-final',style:'final',label:'酒店挑戰',title:'請人檢查門',intro:'自己寫可觀察現象和請求。',questions:['native-314-v2-final']}
];
export default {revision:2,summary:'用 won’t stay shut 描述門關好後又自行打開，與已確認的 latch 故障區分。',steps,questions,takeaways:['The door won’t stay shut.','The door won’t latch.'],completionTitle:'你能準確描述門關不穩，而不亂猜故障零件。'};
