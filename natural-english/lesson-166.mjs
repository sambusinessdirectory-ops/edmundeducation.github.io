import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-166-v2-audio','audio','只聽這個問題。對方被邀請提供甚麼？',['一個方便見面的時間。','一份工作內容。','某個已經定下的日期。','一段會議的長度。'],'一個方便見面的時間。','When works for you? 是開放式問對方哪個時間方便。'),
  mc('native-166-v2-reverse','reverse','你們同意要見面，但還沒有提出任何日期。哪句可讓對方先說時間？',["When works for you?","Does Friday work for you?","That works for me.","We already met yesterday."],"When works for you?",'When 不預設日期；Does Friday work for you? 已提出星期五作候選。'),
  mc('native-166-v2-tone','tone','和客戶安排通話，你想禮貌地請他提出方便的時段。哪句較完整？',["What time works for you?","Would Friday afternoon be possible?","Can you make time during the workday?","I'll send you a few possible slots later."],"What time works for you?",'What time works for you? 禮貌而具體，讓對方提出可行時段。'),
  open('native-166-v2-final','final','最後挑戰：你和朋友說好下週找時間見面，但還沒有定日期或時段。寫兩句英文問對方何時方便，並表示你可以配合。',["When works for you next week? My schedule is flexible.","What time works for you? I can make most evenings next week."],'先用開放式問題讓對方提出時間，再交代自己的彈性。')
];
const steps=[
  {id:'native-166-v2-audio',style:'audio',label:'先聽問題',title:'你何時方便？',intro:'只聽一個時間問題。',model:'When works for you?',zh:'甚麼時候方便你？',audioOnly:true,questions:['native-166-v2-audio']},
  {id:'native-166-v2-reverse',style:'reverse',label:'日期還未定',title:'先讓對方說',intro:'區分開放式詢問與指定日期。',questions:['native-166-v2-reverse']},
  {id:'native-166-v2-tone',style:'tone',label:'客戶通話',title:'有禮地問時段',intro:'選一個適合安排通話的問句。',questions:['native-166-v2-tone']},
  {id:'native-166-v2-speak',style:'speak',label:'口頭再問',title:'時段再具體一點',intro:'先自己說；錄音或跳過後才聽示範。',model:'What time works for you?',zh:'甚麼時間方便你？',speakingPrompt:'日期已定，但未知道對方幾點有空。先口頭問。',recording:'phrase',questions:[]},
  {id:'native-166-v2-final',style:'final',label:'下週挑戰',title:'先問朋友時間',intro:'自己寫問題和彈性安排。',questions:['native-166-v2-final']}
];
export default {revision:2,summary:'用 When works for you? 開放地問對方何時方便，與提出指定日期的問法區分。',steps,questions,takeaways:['When works for you?','What time works for you?'],completionTitle:'你能讓對方提出方便的時間，再一起定約。'};
