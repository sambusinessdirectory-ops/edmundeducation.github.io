import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-298-v2-audio','audio','先聽這句飛機後的感受。耳朵目前怎樣？',['仍悶住，聽聲音不太清楚。','耳壓剛突然通了。','耳裏一直有鈴聲。','耳朵外側被擦傷。'],'仍悶住，聽聲音不太清楚。','feel plugged 表示仍有塞住的感覺，常見於氣壓變化後。'),
  mc('native-298-v2-contrast','contrast','飛機剛降落，你聽聲音像隔着一層東西；還沒有「啵」一下通了。哪句準確？',["My ears feel plugged.","My ears just popped.","My ears are ringing.","My hearing is perfect now."],"My ears feel plugged.",'plugged 是未通的悶塞感；popped 是壓力突然通了。'),
  mc('native-298-v2-rewrite','rewrite','朋友問你能否聽清廣播。原稿只寫「My ears are strange」。哪句具體說明坐飛機後的感覺？',["My ears still feel plugged after the flight.","My ears popped and everything sounds clear.","My eyes are red from the flight.","My headphones are broken."],"My ears still feel plugged after the flight.",'仍悶住與聽不清廣播吻合；still 說明狀況尚未解除。'),
  open('native-298-v2-final','final','新情境：飛機下降後，你的耳朵一直悶住，朋友問你能否聽清他說話。寫兩句英文回答感覺，並說你會試着打呵欠。',["Not very clearly; my ears feel plugged. I'll try yawning to see if that helps.","My ears still feel plugged after landing. I'm going to yawn and see if they pop.","Everything sounds muffled because my ears feel plugged. I'll try yawning for a moment."],'自評時看是否表達耳朵仍悶塞，並把打呵欠說成接下來的嘗試。')
];
const steps=[
  {id:'native-298-v2-audio',style:'audio',label:'聽出耳壓',title:'現在還悶着嗎？',intro:'辨認飛機升降後耳朵是否仍悶塞。',model:'My ears feel plugged.',zh:'我的耳朵感覺塞住。',audioOnly:true,questions:['native-298-v2-audio']},
  {id:'native-298-v2-contrast',style:'contrast',label:'通了還是未通',title:'還沒有啵的一下',intro:'分清 plugged 和 popped 的時間點。',questions:['native-298-v2-contrast']},
  {id:'native-298-v2-rewrite',style:'rewrite',label:'改寫感覺',title:'廣播聽不清',intro:'把模糊描述改成具體狀況。',questions:['native-298-v2-rewrite']},
  {id:'native-298-v2-speak',style:'speak',label:'口頭回答',title:'下機後耳朵很悶',intro:'先自己說；錄音或跳過後才聽示範。',model:'My ears feel plugged.',zh:'我的耳朵感覺塞住。',speakingPrompt:'剛下機，耳朵悶悶的。朋友問你還好嗎，簡短回答。',recording:'phrase',questions:[]},
  {id:'native-298-v2-final',style:'final',label:'落地挑戰',title:'解釋並嘗試打呵欠',intro:'寫兩句，再按示例檢查。',questions:['native-298-v2-final']}
];
export default {revision:2,summary:'用 feel plugged 描述飛機升降後耳朵仍悶塞，並與耳壓已通的 popped 分開。',steps,questions,takeaways:['My ears feel plugged.'],completionTitle:'你能準確說明耳朵仍悶塞，也能說出下一步。'};
