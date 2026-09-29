import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-165-v2-audio','audio','只聽這個安排問題。說話者想確認甚麼？',['星期五是否方便對方。','星期五是不是假期。','對方星期五是不是正在上班。','對方有沒有在星期五安排其他事。'],'星期五是否方便對方。','Does Friday work for you? 中的 work 是時間可不可行，不是工作日或工作內容。'),
  mc('native-165-v2-reverse','reverse','你想向客戶提議這個星期五見面，但暫不指定上午或下午。哪句最自然？',["Does Friday work for you?","Are you working this Friday?","Are you free this Friday afternoon?","Would next Friday be too soon?"],"Does Friday work for you?",'把日期當提議，用 work for you 問是否配合對方時間。'),
  mc('native-165-v2-tone','tone','對方提議星期五下午，你完全可以，沒有附加條件。哪句簡短肯定？',["That works for me.","Friday is usually a busy day for me.","I'm working every Friday, so maybe.","I could make Friday if we keep it short."],"That works for me.",'works for me 表示那個安排可行，直接接受對方提出的時間。'),
  mc('native-165-v2-rewrite','rewrite','要寫給同事提議星期五開會，並留有改期空間。哪條最清楚？',["Does Friday work for you? If not, we can find another day.","I've put the meeting on Friday for now.","Friday works for me; let me know if you need another day.","Are you available sometime next week?"],"Does Friday work for you? If not, we can find another day.",'先提出具體日期，再讓對方有回應空間，是安排會議的自然方式。'),
  open('native-165-v2-final','final','最後挑戰：你想約朋友星期五吃午飯，但不知道他是否有空。寫兩句英文提出星期五，並讓他在不方便時提別的日子。',["Does Friday work for you for lunch? If not, let me know what day is better.","Would Friday work for lunch? We can pick another day if you're busy."],'用日期加 work for you 問可行性，接著留下替代安排的空間。')
];
const steps=[
  {id:'native-165-v2-audio',style:'audio',label:'先聽提議',title:'星期五可行嗎？',intro:'只聽一個安排問題。',model:'Does Friday work for you?',zh:'星期五方便你嗎？',audioOnly:true,questions:['native-165-v2-audio']},
  {id:'native-165-v2-reverse',style:'reverse',label:'由需要想問句',title:'向客戶提日期',intro:'用完整問題問可行性。',questions:['native-165-v2-reverse']},
  {id:'native-165-v2-tone',style:'tone',label:'接受時間',title:'這時間可以',intro:'簡短回應對方的提議。',model:'That works for me.',zh:'這個時間我方便。',questions:['native-165-v2-tone']},
  {id:'native-165-v2-rewrite',style:'rewrite',label:'寫給同事',title:'不方便也可改',intro:'讓訊息有日期及調整空間。',questions:['native-165-v2-rewrite']},
  {id:'native-165-v2-final',style:'final',label:'午飯挑戰',title:'提出星期五',intro:'自己寫提議與備選空間。',questions:['native-165-v2-final']}
];
export default {revision:2,summary:'用 Does Friday work for you? 詢問某日期是否方便，並用 works for me 回應。',steps,questions,takeaways:['Does Friday work for you?','That works for me.'],completionTitle:'你能自然提議星期五，也能給對方改期空間。'};
