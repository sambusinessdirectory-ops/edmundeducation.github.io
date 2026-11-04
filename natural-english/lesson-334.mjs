import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-334-v2-audio','audio','只聽旅客說明。行李箱哪個部位出了問題？',
    ['伸縮拉桿卡住，怎樣也拉不出來。','其中一個輪子斷掉了。','拉鍊已裂開。','拉桿已完全伸出，只是握把滑。'],
    '伸縮拉桿卡住，怎樣也拉不出來。','handle is stuck 在這裡指行李箱伸縮拉桿卡住；情境沒有說輪子或拉鍊壞。'),
  mc('native-334-v2-scene','scene','你準備拉著行李箱走，但伸縮拉桿仍縮在箱內，拉了幾次也動不了。你會怎樣描述？',
    ["The handle is stuck.","The wheel snapped off.","The zipper is coming undone.","The suitcase is too heavy for the scale."],
    "The handle is stuck.",'問題是拉桿無法移動；其餘選項描述不同部件或重量。'),
  mc('native-334-v2-repair','repair','旅伴說 The drawer is stuck，卻指著行李箱伸縮拉桿。怎樣改正部件名稱？',
    ["The suitcase handle is stuck.","The drawer handle is stuck in the kitchen.","The suitcase wheel is missing.","The suitcase has no zipper."],
    "The suitcase handle is stuck.",'drawers 是抽屜；說 suitcase handle 才能讓人知道卡住的是行李箱拉桿。'),
  mc('native-334-v2-branch','branch','機場職員問 Can you extend the handle at all? 你試過後完全拉不出來。哪句最貼切？',
    ["No, the handle won’t pull out at all; it seems stuck.","Yes, it extends fully, but the wheels are noisy.","It only catches halfway up, then stops.","The handle fell off when I picked up the suitcase."],
    "No, the handle won’t pull out at all; it seems stuck.",'at all 配合「完全拉不出」；只卡在半路是另一種故障，不能混為一談。'),
  open('native-334-v2-final','final','最後挑戰：你在機場拿著行李箱，伸縮拉桿完全縮在箱內，無論怎樣拉都拉不出。向同行的人用兩句英文描述故障，再說你打算怎樣搬它。',
    ["The suitcase handle is stuck and won’t pull out. I’ll carry the suitcase by the side handle for now.","I can’t extend the handle at all. I’ll lift the case until we can get help.","The telescopic handle seems jammed inside the suitcase. I’ll carry it instead of dragging it."],
    '先講拉桿完全不能伸出，再說暫時怎樣搬運；不要把輪子或半途卡住當成同一問題。')
];
const steps=[
  {id:'native-334-v2-audio',style:'audio',label:'先聽故障',title:'拉桿動不了',intro:'聽清楚是哪個部件。',model:'The handle is stuck.',zh:'拉桿卡住了。',audioOnly:true,questions:['native-334-v2-audio']},
  {id:'native-334-v2-scene',style:'scene',label:'現場描述',title:'拉桿縮在箱內',intro:'根據實際故障選說法。',questions:['native-334-v2-scene']},
  {id:'native-334-v2-repair',style:'repair',label:'修正部件',title:'不是抽屜',intro:'讓旅伴明白卡住的是甚麼。',questions:['native-334-v2-repair']},
  {id:'native-334-v2-branch',style:'branch',label:'回答追問',title:'完全拉不出',intro:'職員追問拉桿能否伸出。',questions:['native-334-v2-branch']},
  {id:'native-334-v2-speak',style:'speak',label:'行李口說',title:'快速說明故障',intro:'先自己說；錄音或跳過後才聽示範。',model:'The handle is stuck.',zh:'拉桿卡住了。',speakingPrompt:'同行的人問你為甚麼不拖著行李箱；拉桿完全拉不出。',recording:'phrase',questions:[]},
  {id:'native-334-v2-final',style:'final',label:'搬運挑戰',title:'故障後怎樣處理',intro:'自行寫兩句，說明現況與行動。',questions:['native-334-v2-final']}
];
export default {revision:2,summary:'描述行李箱伸縮拉桿完全卡住、無法拉出，並和其他行李故障分清。',steps,questions,takeaways:['The handle is stuck.','The drawer is stuck.'],completionTitle:'你能清楚指出拉桿完全不能伸出，並說明暫時處理方法。'};
