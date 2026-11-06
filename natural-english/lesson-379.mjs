import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-379-v2-audio','audio','聽完後，擦傷表面發生甚麼變化？',['表面變乾並結了一層痂。','傷口完全沒有留下痕跡。','傷口剛被重新撕開。','液體正不斷大量流出。'],'表面變乾並結了一層痂。','a scab has formed 指表面結痂，是癒合過程中的可見變化，不代表完全康復。'),
  mc('native-379-v2-detail','detail','你要向朋友交代「痂已經形成」，哪句時間狀態最準確？',['A scab has formed.','A scab may form next week.','A scab used to form every day.','A scab is falling off right now.'],'A scab has formed.','has formed 表示形成這件事已發生，現在可以看到痂；其他句子改了時間或動作。'),
  mc('native-379-v2-branch','branch','朋友看着你手肘的擦傷問進展。哪個觀察支持「A scab has formed」？',['表面有一層乾硬的褐色薄殼。','邊緣裂開，重新流出鮮血。','擦傷剛發生，表面仍濕潤。','皮膚完全沒有曾受傷的痕跡。'],'表面有一層乾硬的褐色薄殼。','scab 是傷口表面的乾硬薄殼；裂開流血或剛受傷，都不是已結痂。'),
  mc('native-379-v2-continue','continue','朋友說「A scab has formed.」你想關心進展，下一句問甚麼最合適？',['Does it still hurt when you move your arm?','Which restaurant served that meal?','Did the car battery stop working?','Is the table made of wood?'],'Does it still hurt when you move your arm?','已知傷口結痂後，追問活動時是否仍痛，能自然延續同一話題。'),
  open('native-379-v2-final','final','新情境：兩天前手肘擦傷，今天表面已乾並結痂，但彎手臂時仍有點繃。寫兩句英文告訴朋友進展和剩下的不適。',["A scab has formed on my elbow scrape. It still feels tight when I bend my arm.","The scrape on my elbow has started to scab over. It pulls a little when I move my arm.","My elbow is healing and a scab has formed. I can still feel some tightness when I bend it."],'自評時要分清已結痂與完全康復，並交代仍感到繃緊的動作。')
];
const steps=[
  {id:'native-379-v2-audio',style:'audio',label:'聽癒合進展',title:'傷口表面變了甚麼？',intro:'先聽表面變化，留意是否已乾硬。',model:'A scab has formed.',zh:'傷口已經結痂。',audioOnly:true,questions:['native-379-v2-audio']},
  {id:'native-379-v2-detail',style:'detail',label:'時間狀態',title:'痂已形成',intro:'留意 has formed 的已發生含義。',questions:['native-379-v2-detail']},
  {id:'native-379-v2-branch',style:'branch',label:'看傷口外觀',title:'甚麼算結痂？',intro:'用可觀察的表面狀態判斷。',questions:['native-379-v2-branch']},
  {id:'native-379-v2-continue',style:'continue',label:'追問不適',title:'結痂後仍會痛嗎？',intro:'沿着傷口進展提出自然問題。',questions:['native-379-v2-continue']},
  {id:'native-379-v2-final',style:'final',label:'手肘進展',title:'結痂但還有點繃',intro:'寫出今天看到的變化與仍有的不適。',questions:['native-379-v2-final']}
];
export default {revision:2,summary:'用 A scab has formed 描述傷口表面已結痂，並避免把結痂等同完全康復。',steps,questions,takeaways:['A scab has formed.'],completionTitle:'你能描述傷口結痂的進展。'};
