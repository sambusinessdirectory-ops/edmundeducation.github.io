import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-100-v2-audio','audio','只聽這句話。說話者希望對方之後怎樣做？',
    ['有新消息時持續告訴自己。','現在立刻結束所有工作。','每天寄出同一份舊資料。','不要再提這件事。'],
    '有新消息時持續告訴自己。','Keep me posted 是請對方有進展時更新；它沒有指定一定要每天聯絡。'),
  mc('native-100-v2-repair','repair','你要朋友有面試結果後告訴你，卻寫 Keep me on the wall。怎樣改自然？',
    ['Keep me posted.','Keep me painted.','Keep me sleeping.','Keep me locked.'],
    'Keep me posted.','這裡 posted 是「得到消息、被告知最新進展」的慣用說法，不是把人貼到牆上。'),
  mc('native-100-v2-branch','branch','朋友說 I’ll ask them tomorrow。你很想知道答覆，但不想催他立即行動。怎樣接？',
    ['Great, keep me posted.','Call them every five minutes right now.','Never tell me their answer.','You already know the answer, so stop asking.'],
    'Great, keep me posted.','接受朋友明天才問的安排，同時請他有消息時更新；這比額外催促自然。'),
  mc('native-100-v2-continue','continue','對方答 Will do。數天後他收到回覆。哪個動作符合之前的承諾？',
    ['把新回覆告訴你。','故意只重複幾天前的猜測。','把訊息刪掉並說沒有消息。','等你猜出結果才確認。'],
    '把新回覆告訴你。','Will do 回應了 Keep me posted；真正有新進展時便應把消息告訴對方。'),
  mc('native-100-v2-transfer','transfer','你正等快遞公司的調查結果，想請客服有進展時更新你。哪句清楚、也較適合這個場合？',
    ['Please let me know when you have an update.','Could you send me the current case number?','When did you last contact the courier?','Can you close the case for me today?'],
    'Please let me know when you have an update.','四句都可能出現在客服對話，但只有這句請對方在出現新進展時通知你。'),
  open('native-100-v2-writing','scene','最後情境：朋友正在替你問一間店有沒有補貨；他說明天下午才會收到答覆。用兩句英文回應：先謝謝他，再請他一有消息就告訴你。',
    ["Thanks for checking. Keep me posted when you hear back.","Thanks for asking them. Let me know as soon as they reply.","I appreciate it. Please keep me posted about the restock."],
    '先承接朋友願意幫忙，再要求有更新時通知；不把「明天下午才有答覆」改成催他現在回覆。')
];
const steps=[
  {id:'native-100-v2-audio',style:'audio',label:'聽懂要求',title:'有消息再告訴我',intro:'先只聽簡短的更新請求。',model:'Keep me posted.',zh:'有消息記得告訴我。',audioOnly:true,questions:['native-100-v2-audio']},
  {id:'native-100-v2-repair',style:'repair',label:'修正直譯',title:'不是貼到牆上',intro:'把生硬的理解改成慣用說法。',questions:['native-100-v2-repair']},
  {id:'native-100-v2-branch',style:'branch',label:'朋友明天問',title:'怎樣接話不催促？',intro:'按對方的時間表提出更新請求。',questions:['native-100-v2-branch']},
  {id:'native-100-v2-continue',style:'continue',label:'之後真的有消息',title:'承諾要怎樣履行？',intro:'從對話往後推進。',questions:['native-100-v2-continue']},
  {id:'native-100-v2-transfer',style:'transfer',label:'換成客服',title:'較正式的更新請求',intro:'選一個適合客服對話的說法。',questions:['native-100-v2-transfer']},
  {id:'native-100-v2-scene',style:'scene',label:'補貨挑戰',title:'感謝，再請朋友更新',intro:'新情境，不給選項或示範。',questions:['native-100-v2-writing']}
];
export default {revision:2,summary:'用 Keep me posted 請朋友有進展時更新，並在較正式場合改用 let me know。',steps,questions,takeaways:['Keep me posted.','Let me know.'],completionTitle:'你能有禮地請人有消息再通知，也不會把更新要求變成催促。'};
