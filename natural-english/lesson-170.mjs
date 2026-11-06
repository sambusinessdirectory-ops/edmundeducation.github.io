import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-170-v2-audio','audio','只聽這句通知。說話者今天的出席狀況是甚麼？',['本來有安排，但今天不能來。','已在現場等候。','今天會遲到十分鐘。','今天可到，但要早走。'],'本來有安排，但今天不能來。','can’t make it 指不能按原定出席或赴約，不是交通製造問題。'),
  mc('native-170-v2-detail','detail','朋友問 Are you still coming tonight? 你說這句。對方還需要知道哪件事，才能調整安排？',['你今天確定不能出席。','你早餐吃了甚麼。','你是否已通知餐廳減少人數。','你可否換成另一個晚上。'],'你今天確定不能出席。','清楚說不能來，對方才能更新訂位或人數；含糊說 maybe 會耽誤安排。'),
  mc('native-170-v2-branch','branch','聚會主人已訂了六人桌，你臨時無法到。哪句最負責任？',["I'm sorry, I can't make it today. Please count five people.","I might be a little late; keep my seat.","I can come for dessert, so keep six seats.","I can't make it today, but maybe later."],"I'm sorry, I can't make it today. Please count five people.",'道歉並明確說自己今天不能到，再把六人改為五人，主人才能及時調整餐廳訂位。'),
  mc('native-170-v2-continue','continue','朋友回覆 No worries。你想保留之後再見的可能，怎樣接？',["Thanks for understanding. Let's catch up another day.","Thanks. I'll let you know if I can come later.","Maybe we can talk after dinner tonight.","I'll check if I can still make the later part."],"Thanks for understanding. Let's catch up another day.",'先謝謝體諒，再提出另約一天；不把今天不能來擴大成永不再見。'),
  open('native-170-v2-final','final','最後挑戰：你答應今天參加朋友生日晚餐，但下午突然發燒，不能出席。寫兩句英文通知朋友、道歉，並請他替你向壽星說聲生日快樂。',["I'm sorry, I can't make it today because I have a fever. Please wish her a happy birthday for me.","I won't be able to come to dinner tonight—I'm sick. Sorry, and please tell him happy birthday from me."],'明確說今晚不能到，簡短交代原因及希望轉達的祝福。')
];
const steps=[
  {id:'native-170-v2-audio',style:'audio',label:'聽出出席',title:'今天去不了',intro:'只聽一句通知。',model:'I can’t make it today.',zh:'我今天不能來。',audioOnly:true,questions:['native-170-v2-audio']},
  {id:'native-170-v2-detail',style:'detail',label:'通知要明確',title:'對方需要改安排',intro:'找出最關鍵的事實。',questions:['native-170-v2-detail']},
  {id:'native-170-v2-branch',style:'branch',label:'已訂六人桌',title:'及時通知主人',intro:'把缺席說得可供安排。',questions:['native-170-v2-branch']},
  {id:'native-170-v2-continue',style:'continue',label:'接住體諒',title:'改天再見',intro:'對方理解之後怎樣接。',questions:['native-170-v2-continue']},
  {id:'native-170-v2-speak',style:'speak',label:'口頭對照',title:'能參加時',intro:'先自己說；錄音或跳過後才聽示範。',model:'I can make it.',zh:'我能來。',speakingPrompt:'朋友問週末聚會你能否參加，你可以。先口頭回答。',recording:'phrase',questions:[]},
  {id:'native-170-v2-final',style:'final',label:'生日挑戰',title:'生病無法赴宴',intro:'自己寫通知和祝福。',questions:['native-170-v2-final']}
];
export default {revision:2,summary:'用 I can’t make it today 明確通知不能赴約，並自然交代後續安排。',steps,questions,takeaways:['I can’t make it today.','I can make it.'],completionTitle:'你能及時、清楚地通知朋友今天不能來。'};
