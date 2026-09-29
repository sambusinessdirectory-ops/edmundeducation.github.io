import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-299-v2-audio','audio','先聽這句坐飛機後的描述。耳壓剛發生甚麼？',['忽然通了，悶塞感減輕。','現在仍完全通不了。','開始持續嗡嗡響。','耳朵外面沾了水。'],'忽然通了，悶塞感減輕。','ears popped 指耳壓突然平衡的那一下，與仍塞住不同。'),
  mc('native-299-v2-detail','detail','哪個時間順序最吻合 popped？',['先悶住，接着「啵」一下，聽聲音變清楚。','先聽得很清楚，接着耳朵更悶。','一直有鈴聲，完全沒有變化。','耳朵外側先濕後乾。'],'先悶住，接着「啵」一下，聽聲音變清楚。','popped 是狀態轉換：壓力通了，原本的悶塞感改善。'),
  mc('native-299-v2-branch','branch','朋友問：「Are your ears still plugged?」你剛感覺耳壓通了。哪句回答最直接？',["No, they just popped. I can hear better now.","Yes, they still won't pop at all.","No, my eyes are bloodshot.","I haven't been on a plane."],"No, they just popped. I can hear better now.",'朋友問耳朵是否仍塞住；No 先回答，just popped 再說耳壓剛通，現在聽得更清楚。'),
  mc('native-299-v2-tone','tone','你不想把正常耳壓變化說成嚴重事故。哪句最平實？',["My ears just popped. They feel better now.","Both my ears have permanently stopped working.","The plane damaged every passenger's ears.","I need to leave the airport immediately."],"My ears just popped. They feel better now.",'簡單描述已通及舒服些，不作沒有根據的嚴重推斷。'),
  open('native-299-v2-final','final','新情境：飛機落地前你的耳朵悶住，現在剛「啵」一下通了。朋友問你是否仍聽不清。寫兩句英文回答變化和現在感覺。',["My ears just popped. I can hear you clearly again.","No, they popped a moment ago. Everything sounds much clearer now.","They just popped as we landed. The plugged feeling is gone."],'自評時看是否表達「剛通了」這個變化，並說出現在感覺較清楚。')
];
const steps=[
  {id:'native-299-v2-audio',style:'audio',label:'聽出轉折',title:'耳朵剛通了嗎？',intro:'聽耳壓是剛通了，還是仍卡住。',model:'My ears popped.',zh:'我的耳壓通了。',audioOnly:true,questions:['native-299-v2-audio']},
  {id:'native-299-v2-detail',style:'detail',label:'排時間順序',title:'先悶，後來變清楚',intro:'從前後變化辨認 popped。',questions:['native-299-v2-detail']},
  {id:'native-299-v2-branch',style:'branch',label:'回答朋友',title:'還塞住嗎？',intro:'接着對方的問題說出新狀態。',questions:['native-299-v2-branch']},
  {id:'native-299-v2-tone',style:'tone',label:'平實描述',title:'只是耳壓通了',intro:'別把常見變化說得過重。',questions:['native-299-v2-tone']},
  {id:'native-299-v2-speak',style:'speak',label:'即時口說',title:'告訴朋友耳朵通了',intro:'先自己說；錄音或跳過後才聽示範。',model:'My ears popped.',zh:'我的耳壓通了。',speakingPrompt:'下機時耳朵剛啵一下，悶塞感消失。簡短告訴朋友。',recording:'phrase',questions:[]},
  {id:'native-299-v2-final',style:'final',label:'落地挑戰',title:'說出前後變化',intro:'寫兩句，完成後自行比對。',questions:['native-299-v2-final']}
];
export default {revision:2,summary:'用 ears popped 描述飛機升降時耳壓剛突然通了，並說明悶塞感改善。',steps,questions,takeaways:['My ears popped.'],completionTitle:'你能說出耳壓通了的瞬間和隨後的感覺。'};
