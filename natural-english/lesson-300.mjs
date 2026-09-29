import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-300-v2-audio','audio','聽完這句飛機後的抱怨，耳朵目前怎樣？',['試過幾個方法，耳壓仍通不了。','剛剛啵一下通了。','完全沒有任何悶塞感。','耳朵裏有水流出。'],'試過幾個方法，耳壓仍通不了。','won’t pop 表示耳壓仍未通；與 popped 已通了正相反。'),
  mc('native-300-v2-scene','scene','飛機落地後你吞口水、打呵欠，耳朵仍悶着。哪句最準確？',["My ears won't pop.","My ears just popped.","My ears are ringing.","My ears are wet."],"My ears won't pop.",'won’t pop 帶出嘗試後仍未能平衡耳壓的感覺。'),
  mc('native-300-v2-reverse','reverse','朋友說「My ears won’t pop」。你可推斷哪項？',['他等着耳壓通，現在仍悶塞。','他已聽得完全清楚。','他耳內一直有鈴聲。','他耳朵外側被水濺到。'],'他等着耳壓通，現在仍悶塞。','這句強調預期中的啵一下沒有發生，並非已改善。'),
  mc('native-300-v2-transfer','transfer','從坐飛機換到上山後：海拔變化使耳朵悶住，吞口水仍無效。哪句可用？',["My ears still won't pop.","My ears popped and cleared immediately.","My eyes are bloodshot.","The car won't start."],"My ears still won't pop.",'氣壓變化不限飛機；若耳壓仍不通，won’t pop 仍可用。'),
  open('native-300-v2-final','final','新情境：飛機降落後你一直覺得耳朵悶，已試過吞口水和打呵欠，但仍未通。寫兩句英文回答朋友「Feeling better?」，並說明試過甚麼。',["Not really. My ears still won't pop, even after I tried yawning.","My ears won't pop yet. I've tried swallowing, but they still feel plugged.","No, they're still plugged and won't pop. I already tried yawning and swallowing."],'自評時看是否說出耳壓仍未通，以及已做過的嘗試；不要誤寫成 popped。')
];
const steps=[
  {id:'native-300-v2-audio',style:'audio',label:'聽出未解決',title:'耳壓還是通不了？',intro:'聽嘗試後耳壓仍有沒有通。',model:'My ears won’t pop.',zh:'我的耳壓通不了。',audioOnly:true,questions:['native-300-v2-audio']},
  {id:'native-300-v2-scene',style:'scene',label:'落地後',title:'吞口水也沒用',intro:'按嘗試後的結果選說法。',questions:['native-300-v2-scene']},
  {id:'native-300-v2-reverse',style:'reverse',label:'由句子找狀態',title:'為何說 won’t？',intro:'推斷這句暗示的現在狀況。',questions:['native-300-v2-reverse']},
  {id:'native-300-v2-transfer',style:'transfer',label:'換到山路',title:'氣壓變化仍會影響耳朵',intro:'把同一感受用在另一個場景。',questions:['native-300-v2-transfer']},
  {id:'native-300-v2-speak',style:'speak',label:'即時回答',title:'耳朵仍很悶',intro:'先自己說；錄音或跳過後才聽示範。',model:'My ears won’t pop.',zh:'我的耳壓通不了。',speakingPrompt:'下機後已吞口水，耳朵仍未通。朋友問你感覺如何，簡短回答。',recording:'phrase',questions:[]},
  {id:'native-300-v2-final',style:'final',label:'下機挑戰',title:'交代感受和嘗試',intro:'交代耳壓仍未通，以及你已試過甚麼。',questions:['native-300-v2-final']}
];
export default {revision:2,summary:'用 won’t pop 描述嘗試後耳壓仍未通，與剛通了的 popped 區分。',steps,questions,takeaways:['My ears won’t pop.'],completionTitle:'你能說明耳朵仍悶塞，也能交代已試過甚麼。'};
