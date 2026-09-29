import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-371-v2-audio','audio','聽完這句身體變化，腫脹現在怎樣？',['比之前明顯減輕。','剛開始迅速腫大。','完全沒有變化。','皮膚開始流血。'],'比之前明顯減輕。','has gone down 指腫脹程度降低，不一定完全消失。'),
  mc('native-371-v2-reverse','reverse','昨天扭到的腳踝很腫；今天看來小了不少，但仍有點腫。哪句準確？',["The swelling has gone down.","My ankle is swelling more and more.","The wound has reopened.","The bruise has disappeared completely."],"The swelling has gone down.",'腫脹比昨天少，正是 gone down；不必聲稱已完全康復。'),
  mc('native-371-v2-contrast','contrast','「My ankle is swollen」和「The swelling has gone down」的重點有甚麼不同？',['前者說現在仍腫，後者說相對以前減輕。','兩句都表示腫脹正在增加。','前者指疼痛，後者指皮膚顏色。','兩句都保證完全不再腫。'],'前者說現在仍腫，後者說相對以前減輕。','gone down 比較前後程度；目前仍可有少量腫脹。'),
  mc('native-371-v2-tone','tone','朋友關心你的膝蓋，你看到腫脹減輕但仍有一點不適。哪句不誇大？',["It's better; the swelling has gone down, though it still aches a little.","I'm completely healed and feel absolutely nothing.","It has become much more swollen than yesterday.","My knee was never swollen at all."],"It's better; the swelling has gone down, though it still aches a little.",'如實交代改善與剩餘不適，避免把腫脹減輕說成完全痊癒。'),
  mc('native-371-v2-rewrite','rewrite','你要傳訊息更新腳踝情況，原稿只寫「It’s different」。哪句交代變化方向？',["The swelling has gone down since yesterday.","The ankle is a different color shoe.","The floor has become uneven.","I can't remember whether it was swollen."],"The swelling has gone down since yesterday.",'寫出與昨天相比腫脹減少，比 different 提供更實用的近況。'),
  open('native-371-v2-rewrite-write','rewrite','新情境：你的手腕昨天撞到桌角而腫起，今天腫脹明顯消了一些，但碰到仍有點痛。寫兩句英文向朋友更新情況。',["The swelling has gone down since yesterday. It's still a little tender to the touch.","My wrist looks less swollen today. It still hurts a bit when I touch it.","The swelling has improved, but the spot is still sore. I'm taking it easy today."],'自評時看是否交代腫脹減輕和仍存在的觸碰不適，不誤說完全痊癒。')
];
const steps=[
  {id:'native-371-v2-audio',style:'audio',label:'聽出改善',title:'比昨天腫得少？',intro:'聽腫脹是否比昨天減輕，而非完全消失。',model:'The swelling has gone down.',zh:'腫脹慢慢消了。',audioOnly:true,questions:['native-371-v2-audio']},
  {id:'native-371-v2-reverse',style:'reverse',label:'由變化找句子',title:'腳踝仍有點腫',intro:'比較昨天和今天。',questions:['native-371-v2-reverse']},
  {id:'native-371-v2-contrast',style:'contrast',label:'狀態與趨勢',title:'still swollen 可以同時成立',intro:'分開目前狀態和前後變化。',questions:['native-371-v2-contrast']},
  {id:'native-371-v2-tone',style:'tone',label:'回應關心',title:'改善但未完全好',intro:'保留剩餘不適。',questions:['native-371-v2-tone']},
  {id:'native-371-v2-rewrite',style:'rewrite',label:'更新近況',title:'告訴朋友變化方向',intro:'自己寫兩句，再對照示例。',questions:['native-371-v2-rewrite','native-371-v2-rewrite-write']}
];
export default {revision:2,summary:'用 swelling has gone down 說明腫脹比之前減輕，並與完全消失區分。',steps,questions,takeaways:['The swelling has gone down.'],completionTitle:'你能準確說明腫脹改善而仍有不適。'};
