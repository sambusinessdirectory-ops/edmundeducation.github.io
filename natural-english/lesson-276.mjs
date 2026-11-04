import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-276-v2-audio','audio','先聽這句泡茶指示。應該怎樣做？',['讓茶葉在熱水中浸泡一會兒。','立即把茶倒掉。','把茶包擠乾。','先把杯子放進雪櫃。'],'讓茶葉在熱水中浸泡一會兒。','steep 指讓茶葉與熱水接觸，慢慢釋出味道。'),
  mc('native-276-v2-contrast','contrast','茶包才放進熱水十秒。朋友問可否喝了。哪句比「Boil the tea」更符合現在的動作？',["Let the tea steep for a few minutes.","Freeze the tea for an hour.","Pour the tea away now.","Fry the tea leaves first."],"Let the tea steep for a few minutes.",'水已經熱了；接下來要讓茶浸泡，不是把整杯茶再煮滾。'),
  mc('native-276-v2-rewrite','rewrite','食譜原稿寫「Leave the teabag in the hot water to get stronger」。哪句更簡潔自然？',["Let the tea steep for five minutes.","Break the teabag into the cup.","Burn the tea until it turns dark.","Keep stirring until the cup is empty."],"Let the tea steep for five minutes.",'steep 一字便帶出茶在熱水中釋出味道；加時間讓指示更實用。'),
  mc('native-276-v2-explain','explain','為何「Let the tea steep」不是叫人離開茶杯不管？',['let 在這裏是「讓它」進行浸泡，steep 是泡茶的過程。','steep 的意思是把茶倒出。','let tea 是只可用於冰茶的品牌。','這句只表示把茶杯拿走。'],'let 在這裏是「讓它」進行浸泡，steep 是泡茶的過程。','句子重點是給茶葉時間在水中浸泡，而非離開現場。'),
  open('native-276-v2-final','final','新情境：你替朋友泡茶，茶包才剛放進熱水。他已拿起杯子想喝。寫兩句英文請他等等，並說明大概還要泡多久。',["Let the tea steep a little longer. Give it about three more minutes.","It's not ready yet. The tea needs to steep for a few minutes.","Wait a moment before drinking it. Let the tea steep for another two minutes."],'自評時檢查是否叫對方讓茶繼續浸泡，並給出大約時間。')
];
const steps=[
  {id:'native-276-v2-audio',style:'audio',label:'聽懂步驟',title:'茶包入水之後',intro:'先聽，不看英文指示。',model:'Let the tea steep.',zh:'讓茶浸泡一會兒。',audioOnly:true,questions:['native-276-v2-audio']},
  {id:'native-276-v2-contrast',style:'contrast',label:'浸泡或煮滾',title:'水已經熱了',intro:'分清兩種不同的烹調動作。',questions:['native-276-v2-contrast']},
  {id:'native-276-v2-rewrite',style:'rewrite',label:'改寫食譜',title:'一句話寫清泡茶時間',intro:'把冗長指示收成自然表達。',questions:['native-276-v2-rewrite']},
  {id:'native-276-v2-explain',style:'explain',label:'拆解動詞',title:'steep 的工作',intro:'說明茶葉在水中做甚麼。',questions:['native-276-v2-explain']},
  {id:'native-276-v2-speak',style:'speak',label:'即時提醒',title:'茶還沒泡好',intro:'先自己說；錄音或跳過後才聽示範。',model:'Let the tea steep.',zh:'讓茶浸泡一會兒。',speakingPrompt:'朋友剛把茶包放進熱水便要喝。簡短請他讓茶再泡一會兒。',recording:'phrase',questions:[]},
  {id:'native-276-v2-final',style:'final',label:'泡茶挑戰',title:'請朋友再等幾分鐘',intro:'說明茶還要浸泡多久，再請朋友稍等。',questions:['native-276-v2-final']}
];
export default {revision:2,summary:'用 steep 指茶葉在熱水中浸泡釋出味道，並給朋友適當的等待時間。',steps,questions,takeaways:['Let the tea steep.'],completionTitle:'你能自然指示泡茶時間，不會把浸泡誤說成煮滾。'};
