import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-126-v2-audio','audio','只聽這個功能名稱。它讓傳訊者知道甚麼？',['對方是否已看過訊息。','對方手機的電量。','訊息是否已成功送達裝置。','對方是否已回覆。'],'對方是否已看過訊息。','read receipt 是已讀回條／標記，顯示訊息是否被打開查看。'),
  mc('native-126-v2-reverse','reverse','聊天程式顯示「已讀 8:42」。這個顯示英文叫甚麼？',["a read receipt","a missed call","a delivery status","a typing indicator"],"a read receipt",'read receipt 指已讀狀態；僅「已送達」尚未等於已讀。'),
  mc('native-126-v2-contrast','contrast','訊息顯示 delivered，但沒有顯示 read。現在可以確定甚麼？',['訊息送達了，未能確定對方看過。','對方一定已經讀完。','對方已經回覆。','對方可能關閉了已讀回條。'],'訊息送達了，未能確定對方看過。','送達和已讀是兩個不同狀態；沒有回條也可能是功能關閉。'),
  open('native-126-v2-final','final','最後挑戰：朋友問你是否確定對方已看過你的訊息。你的聊天程式只顯示「送達」，而你關閉了已讀回條。寫兩句英文回答及解釋。',["I can't tell if she read it. Read receipts are turned off.","It says delivered, but I don't know whether she opened it because read receipts are off."],'不要把 delivered 當成 read；指出回條關閉後便無法從介面確認已讀。')
];
const steps=[
  {id:'native-126-v2-audio',style:'audio',label:'先聽名稱',title:'已讀回條',intro:'只聽功能名稱。',model:'read receipt',zh:'已讀回條。',audioOnly:true,questions:['native-126-v2-audio']},
  {id:'native-126-v2-reverse',style:'reverse',label:'由畫面想詞',title:'「已讀 8:42」',intro:'把介面狀態配到英文。',questions:['native-126-v2-reverse']},
  {id:'native-126-v2-contrast',style:'contrast',label:'區分狀態',title:'送達不等於看過',intro:'不要從 delivered 推論 read。',questions:['native-126-v2-contrast']},
  {id:'native-126-v2-speak',style:'speak',label:'口頭解釋',title:'功能有沒有開？',intro:'先自己說；錄音或跳過後才聽示範。',model:'Read receipts are on.',zh:'已讀回條開著。',speakingPrompt:'朋友問為何你知道訊息已讀。告訴他你的已讀回條功能開著。',recording:'phrase',questions:[]},
  {id:'native-126-v2-final',style:'final',label:'聊天挑戰',title:'只能看到已送達',intro:'自己解釋目前能確認甚麼。',questions:['native-126-v2-final']}
];
export default {revision:2,summary:'認識 read receipt，分清訊息已送達與對方已讀，並理解關閉回條的影響。',steps,questions,takeaways:['read receipt','Read receipts are on.'],completionTitle:'你能準確解讀訊息狀態，不會把送達當已讀。'};
