import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-122-v2-audio','audio','只聽這個動作。客人打算怎樣處理不合適的餐點？',['請店員把餐點拿回廚房。','把剩菜帶回家。','請店員幫忙換一份餐點。','保留餐點但請店員調整帳單。'],'請店員把餐點拿回廚房。','send it back 在餐廳是把不合適的餐點退回廚房處理。'),
  mc('native-122-v2-reverse','reverse','你點三分熟牛扒，送來的卻煮得太熟；哪個英文片語對應「請他們拿回去」？',["send it back","pack it up","ask for a refund","keep it as it is"],"send it back",'send it back 是退回餐點；pack it up 是打包，ask for a refund 是分帳。'),
  mc('native-122-v2-contrast','contrast','朋友說餐點不對，但只吃剩下一半想帶走。這時哪個動作與「退回廚房」不同？',["Ask to box up the leftovers.","Ask the kitchen to remake it.","Tell the server it was the wrong dish.","Return the plate to be fixed."],"Ask to box up the leftovers.",'打包剩菜是帶回家；退回廚房則因餐點問題請店方處理。'),
  open('native-122-v2-final','final','最後挑戰：你點的牛扒要三分熟，送來的卻全熟。店員問 How is everything? 寫兩句禮貌回覆，說明問題並請他們重做。',["I'm sorry, this steak is overcooked. Could I send it back and have it remade?","I asked for it medium rare, but it's well done. Could the kitchen make another one?"],'說明可觀察的落差，再禮貌提出退回或重做；send it back 不表示你要把食物帶走。')
];
const steps=[
  {id:'native-122-v2-audio',style:'audio',label:'聽出動作',title:'餐點要去哪裡？',intro:'先聽英文片語。',model:'send it back',zh:'把餐點退回去。',audioOnly:true,questions:['native-122-v2-audio']},
  {id:'native-122-v2-reverse',style:'reverse',label:'反向配對',title:'牛扒煮過頭',intro:'由實際需要找出合適動作。',questions:['native-122-v2-reverse']},
  {id:'native-122-v2-contrast',style:'contrast',label:'分清去向',title:'退回還是打包？',intro:'同樣離開桌面，目的卻不同。',questions:['native-122-v2-contrast']},
  {id:'native-122-v2-speak',style:'speak',label:'口頭說明',title:'向店員提出要求',intro:'先自己說；錄音或跳過後才聽示範。',model:'The steak is overcooked, so I’m sending it back.',zh:'牛扒煮得太熟，所以我要退回去。',speakingPrompt:'牛扒煮得太熟。向店員說明你想退回。',recording:'phrase',questions:[]},
  {id:'native-122-v2-final',style:'final',label:'餐桌挑戰',title:'禮貌要求重做',intro:'自己把問題和處理要求說完整。',questions:['native-122-v2-final']}
];
export default {revision:2,summary:'用 send it back 表示將做錯或煮錯的餐點退回廚房，與打包剩菜區分。',steps,questions,takeaways:['send it back','The steak is overcooked, so I’m sending it back.'],completionTitle:'你能禮貌指出餐點問題並要求退回重做。'};
