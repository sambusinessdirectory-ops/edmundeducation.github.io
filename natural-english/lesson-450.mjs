import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-450-v2-audio','audio','只聽房間氣味。時間上的關鍵是甚麼？',['來源已離開，味道卻仍留著。','氣味只出現一瞬間。','氣味越來越淡到完全聞不到。','來源一直在房間裡燃燒。'],'來源已離開，味道卻仍留著。','lingering 強調氣味在原活動結束後仍未散去。'),
  mc('native-450-v2-contrast','contrast','晚餐已吃完、廚房也收好，但房內仍聞到煎魚味。哪句比「現在正在煮魚」準確？',["The smell is lingering.","Someone is cooking fish right now.","The room smells like fresh paint.","The food has no smell."],"The smell is lingering.",'煮食已結束而氣味仍在，正是 lingering 的時間含意。'),
  mc('native-450-v2-explain','explain','朋友問味道是不是新傳來的。哪個細節最能支持 lingering？',['昨晚煮過的食物早已收起，今天仍聞得到。','剛打開裝有食物的盒子。','爐頭上仍有一鍋正在煮。','窗外有人剛開始燒烤。'],'昨晚煮過的食物早已收起，今天仍聞得到。','來源活動已結束一段時間，但氣味持續，才突顯 linger。'),
  mc('native-450-v2-rewrite','rewrite','給室友發訊息：昨天煎魚的味道今天仍在，想開窗通風。哪句同時說出持續性和請求？',["The smell from yesterday's fish is still lingering. Could we open a window?","The fish smell is strong right now. Did we leave some food out?","The smell has finally cleared. Shall we close the window?","There's still a smell from dinner. I'll light a candle later."],"The smell from yesterday's fish is still lingering. Could we open a window?",'句子交代昨日煎魚已結束、今日仍有味道，並提出開窗通風的具體請求。'),
  open('native-450-v2-final','final','最後挑戰：朋友昨晚在客廳燒烤，食物都收走了，但今天房間仍有味道。寫兩句英文描述氣味的持續狀態，並提出改善方法。',["The cooking smell is still lingering in the living room. Let's open the windows for a while.","Even though the food is gone, the smell hasn't cleared. Could we air out the room?"],'lingering 說活動結束後氣味仍在，再提出通風等處理方式。')
];
const steps=[
  {id:'native-450-v2-audio',style:'audio',label:'先聽時間',title:'味道仍未散',intro:'注意氣味是否在活動結束後仍存在。',model:'The smell is lingering.',zh:'味道久久不散。',audioOnly:true,questions:['native-450-v2-audio']},
  {id:'native-450-v2-contrast',style:'contrast',label:'不是正在煮',title:'魚已吃完',intro:'分清來源已結束與正在發生。',questions:['native-450-v2-contrast']},
  {id:'native-450-v2-explain',style:'explain',label:'看時間線',title:'昨晚的味到今天',intro:'找出 lingering 的證據。',questions:['native-450-v2-explain']},
  {id:'native-450-v2-rewrite',style:'rewrite',label:'通風訊息',title:'請室友開窗',intro:'把觀察和請求寫在一起。',model:'The smell of smoke is still lingering.',zh:'煙味仍久久不散。',questions:['native-450-v2-rewrite']},
  {id:'native-450-v2-speak',style:'speak',label:'口頭轉用',title:'煙味也會散不去',intro:'先自己說；錄音或跳過後才聽示範。',model:'The smell of smoke is still lingering.',zh:'煙味還沒散。',speakingPrompt:'有人離開後，房間裡的煙味仍在。先口頭說明。',recording:'phrase',questions:[]},
  {id:'native-450-v2-final',style:'final',label:'客廳挑戰',title:'昨晚燒烤的味道',intro:'自己描述氣味與通風建議。',questions:['native-450-v2-final']}
];
export default {revision:2,summary:'用 lingering 描述食物或煙味在來源結束後仍留在房間。',steps,questions,takeaways:['The smell is lingering.','The smell of smoke is still lingering.'],completionTitle:'你能說清味道久久未散，並提出通風做法。'};
