import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-287-v2-audio','audio','聽完這句預約消息，為何現在有空位？',['原本預約的人取消了。','店家新開了另一間分店。','所有預約都被取消。','你的預約被推遲。'],'原本預約的人取消了。','a cancellation opened up 指一個預約取消，因此騰出原本沒有的時段。'),
  mc('native-287-v2-reverse','reverse','牙醫原本全滿，剛有人取消下午三點的預約。哪句概括新機會？',["A cancellation opened up.","The clinic closed for the day.","Every appointment was canceled.","My appointment was moved to tomorrow."],"A cancellation opened up.",'一個取消帶來可預約時段；不代表診所關門或全部預約消失。'),
  mc('native-287-v2-tone','tone','診所致電問你要不要提早來。哪句提供必要資料又有禮貌？',["A cancellation opened up at 2:30. Would you like to come in earlier?","Someone canceled, so you must come right now.","All appointments have vanished; goodbye.","We will not tell you when the opening is."],"A cancellation opened up at 2:30. Would you like to come in earlier?",'先講空出時段，再給病人選擇，正是電話通知應有的資訊。'),
  open('native-287-v2-final','final','新情境：你在候補名單上等剪髮；理髮店致電說有人取消，明天下午一點半空了。寫兩句英文向家人轉述新時段，並說你會接受。',["A cancellation opened up at 1:30 tomorrow. I'm going to take that appointment.","The salon has an opening tomorrow at 1:30 because someone canceled. I'll go then.","Someone canceled, so a 1:30 slot opened up tomorrow. I said yes to it."],'自評時看是否有取消後空出的時段，以及你會接受的決定。')
];
const steps=[
  {id:'native-287-v2-audio',style:'audio',label:'聽出空位來源',title:'原本已訂滿了嗎？',intro:'聽空位是否由取消預約而來。',model:'A cancellation opened up.',zh:'有人取消，空出時段。',audioOnly:true,questions:['native-287-v2-audio']},
  {id:'native-287-v2-reverse',style:'reverse',label:'從情況找說法',title:'牙醫突然有位',intro:'把候補機會對應到自然英文。',questions:['native-287-v2-reverse']},
  {id:'native-287-v2-tone',style:'tone',label:'電話通知',title:'要不要提早來？',intro:'兼顧時段資訊與對方選擇。',questions:['native-287-v2-tone']},
  {id:'native-287-v2-speak',style:'speak',label:'即時口說',title:'向候補者報告空位',intro:'先自己說；錄音或跳過後才聽示範。',model:'A cancellation opened up.',zh:'有人取消，空出時段。',speakingPrompt:'你是診所職員，剛有一位病人取消了預約。簡短告訴候補者有空位。',recording:'phrase',questions:[]},
  {id:'native-287-v2-final',style:'final',label:'理髮店挑戰',title:'轉述並接受新時段',intro:'寫兩句，完成後自行對照。',questions:['native-287-v2-final']}
];
export default {revision:2,summary:'說明一位客人取消預約後空出時段，並在候補通知中講清楚時間。',steps,questions,takeaways:['A cancellation opened up.'],completionTitle:'你能理解和轉述因取消而空出的預約機會。'};
