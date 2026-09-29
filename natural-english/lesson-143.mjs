import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-143-v2-audio','audio','只聽溫度描述。咖啡目前最可能怎樣？',['已不熱，但也不算冷。','燙得無法入口。','剛從冰箱拿出。','還帶一點餘溫。'],'已不熱，但也不算冷。','lukewarm 是溫溫的、不冷不熱；常暗示本來應該更熱。'),
  mc('native-143-v2-reverse','reverse','湯放了半小時，現在溫溫的，既不燙也不冰。哪個詞最準確？',["lukewarm","boiling","chilled","cool"],"lukewarm",'lukewarm 描述中間偏溫的狀態；boiling、chilled、frozen 是不同溫度。'),
  mc('native-143-v2-contrast','contrast','你在餐廳點熱咖啡，收到時只是溫溫的。哪句比「咖啡是冷的」更準確？',["The coffee is lukewarm.","The coffee is iced.","The coffee is boiling.","The coffee has cooled a little but is still hot."],"The coffee is lukewarm.",'它仍有些溫度，所以 lukewarm 比 cold 或 iced 精確。'),
  open('native-143-v2-final','final','最後挑戰：你點了一碗熱湯，上桌時卻只溫溫的。店員問 Is everything okay? 寫兩句英文禮貌說明溫度並請他加熱。',["The soup is a little lukewarm. Could you heat it up for me, please?","I was expecting it hot, but it's lukewarm. Would you mind warming it up?"],'指出是溫溫而非冰冷，並提出具體、禮貌的處理要求。')
];
const steps=[
  {id:'native-143-v2-audio',style:'audio',label:'先聽溫度',title:'熱度退了',intro:'只聽一個溫度詞。',model:'lukewarm',zh:'溫溫的，不冷不熱。',audioOnly:true,questions:['native-143-v2-audio']},
  {id:'native-143-v2-reverse',style:'reverse',label:'由感覺想詞',title:'湯放涼了一點',intro:'找出準確的溫度位置。',questions:['native-143-v2-reverse']},
  {id:'native-143-v2-contrast',style:'contrast',label:'溫和冷不同',title:'熱咖啡不夠熱',intro:'避免把溫溫的說成冰的。',questions:['native-143-v2-contrast']},
  {id:'native-143-v2-speak',style:'speak',label:'口頭反映',title:'咖啡只有微溫',intro:'先自己說；錄音或跳過後才聽示範。',model:'The coffee is lukewarm.',zh:'咖啡只是溫溫的。',speakingPrompt:'你點熱咖啡，拿到時不熱也不冰。先向朋友描述。',recording:'phrase',questions:[]},
  {id:'native-143-v2-final',style:'final',label:'餐廳挑戰',title:'湯不夠熱',intro:'自己向店員說明及請求。',questions:['native-143-v2-final']}
];
export default {revision:2,summary:'用 lukewarm 說食物或飲料只是溫溫的，與熱、冰冷區分。',steps,questions,takeaways:['lukewarm','The coffee is lukewarm.'],completionTitle:'你能準確說出溫度不夠熱，並禮貌請店員處理。'};
