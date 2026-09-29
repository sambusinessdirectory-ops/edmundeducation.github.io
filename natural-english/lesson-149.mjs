import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-149-v2-audio','audio','只聽這句回應。說話者對未來計劃的態度是甚麼？',['暫時不下定論，看看發展。','已經作了不可更改的決定。','完全放棄這件事。','先定下不可更改的計劃。'],'暫時不下定論，看看發展。','Let’s see what happens 表示先觀察後續，再決定如何應對。'),
  mc('native-149-v2-scene','scene','朋友問你新工作會不會長做，你才上班兩天，不想先訂評估期限。哪句最自然？',["Let's see what happens.","I'll decide by the end of this week.","I'll ask for a fixed contract tomorrow.","I think I'll stay for at least a year."],"Let's see what happens.",'才兩天資訊不足，先看看發展比作出永久承諾合適。'),
  mc('native-149-v2-tone','tone','朋友問新認識的人會否成為伴侶。你想保持開放、又不做保證。哪句語氣最合適？',["I don't know yet. Let's see what happens.","I think we should set a date now.","I don't think I'll see him again.","I'll decide what this is after our next date."],"I don't know yet. Let's see what happens.",'既承認未知，也保留可能性；語氣不像保證或拒絕。'),
  open('native-149-v2-repair','repair',"朋友問你們下週是否一定去郊遊，但你要先看天氣，不想現在保證。寫兩句英文把過早的承諾修正成有彈性的回覆。",["I'm not sure yet. Let's see what happens with the weather.", "We haven't decided for sure. We'll see how the weather looks next week."],"把尚未確定的天氣條件說出來，保留日後決定的空間。"),
];
const steps=[
  {id:'native-149-v2-audio',style:'audio',label:'聽出態度',title:'先看發展',intro:'只聽一句回應。',model:'Let’s see what happens.',zh:'先看看會怎樣。',audioOnly:true,questions:['native-149-v2-audio']},
  {id:'native-149-v2-scene',style:'scene',label:'新工作',title:'才上班兩天',intro:'資訊不足時怎樣回答。',questions:['native-149-v2-scene']},
  {id:'native-149-v2-tone',style:'tone',label:'保留可能',title:'新認識的人',intro:'在不確定中保持自然語氣。',questions:['native-149-v2-tone']},
  {id:'native-149-v2-repair',style:'repair',label:'修正承諾',title:'週末還要看天氣',intro:'把過早的肯定改成合理條件。',questions:['native-149-v2-repair']},
  {id:'native-149-v2-speak',style:'speak',label:'口頭回應',title:'暫時未決定',intro:'先自己說；錄音或跳過後才聽示範。',model:'We’ll see.',zh:'到時再看吧。',speakingPrompt:'朋友問週末會否出門，你還要看天氣。先自然回答。',recording:'phrase',questions:[]}
];
export default {revision:2,summary:'用 Let’s see what happens 表示暫不定案，待更多情況出現後再決定。',steps,questions,takeaways:['Let’s see what happens.','We’ll see.'],completionTitle:'你能自然表示先觀察情況，不過早作承諾。'};
