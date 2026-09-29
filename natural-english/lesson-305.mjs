import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-305-v2-audio','audio','只聽網站狀態。與剛才相比，現在有甚麼改變？',['網站已恢復，可以再使用。','網站剛開始故障。','錯誤頁仍在，但登入可能已正常。','網站只恢復了首頁，登入仍失敗。'],'網站已恢復，可以再使用。','back up 表示先前停擺的服務恢復正常。'),
  mc('native-305-v2-detail','detail','同事說網站 back up 了。哪個測試最能確認真的恢復？',['重新打開網站並成功登入。','只看網站公告說修復中。','用同一舊分頁看錯誤畫面。','問同事他們是否仍看見舊錯誤。'],'重新打開網站並成功登入。','能開啟並完成原本失敗的登入，才直接證明服務恢復。'),
  mc('native-305-v2-reverse','reverse','網站早上整體無法登入，下午已能正常使用。哪句通知同事？',["The site is back up.","The site is still down.","The site was working before the outage.","The homepage loads, but login still fails."],"The site is back up.",'back up 說恢復；still down 則表示故障仍持續。'),
  mc('native-305-v2-continue','continue','同事說 The site is back up。你仍需交文件，哪句接續最有用？',["Great, I'll log in and upload the file now.","Then I'll wait for another outage.","So the website must be down.","I'll replace my mouse first."],"Great, I'll log in and upload the file now.",'恢復後可重試剛才被阻礙的操作；這句直接推進工作。'),
  open('native-305-v2-branch','branch',"網站剛恢復，你已成功登入，但同事仍看見先前的錯誤頁。寫兩句英文告訴他你的結果，並建議一個簡單重試動作。",["The site is back up—I can log in now. Try refreshing the page and signing in again.", "I just got into the site, so it seems to be working again. Could you reload the page and retry?"],"先提供自己成功登入的證據，再建議重新整理，讓同事知道可以重試。"),
];
const steps=[
  {id:'native-305-v2-audio',style:'audio',label:'先聽狀態',title:'網站恢復了',intro:'只聽一句更新。',model:'The site is back up.',zh:'網站恢復正常了。',audioOnly:true,questions:['native-305-v2-audio']},
  {id:'native-305-v2-detail',style:'detail',label:'實際驗證',title:'登入成功才算',intro:'找出恢復的具體證據。',questions:['native-305-v2-detail']},
  {id:'native-305-v2-reverse',style:'reverse',label:'由前後想句',title:'上午停，下午好',intro:'選擇表示恢復的說法。',model:'The site is down.',zh:'網站目前無法使用。',questions:['native-305-v2-reverse']},
  {id:'native-305-v2-continue',style:'continue',label:'恢復工作',title:'現在可交文件',intro:'接續網站恢復後的行動。',questions:['native-305-v2-continue']},
  {id:'native-305-v2-branch',style:'branch',label:'舊錯誤頁',title:'請同事重新整理',intro:'用自己能登入的資訊幫忙。',questions:['native-305-v2-branch']},
  {id:'native-305-v2-speak',style:'speak',label:'口頭通知',title:'告訴團隊可再試',intro:'先自己說；錄音或跳過後才聽示範。',model:'The site is back up.',zh:'網站恢復了。',speakingPrompt:'你剛成功登入先前停擺的網站。口頭通知同事。',recording:'phrase',questions:[]}
];
export default {revision:2,summary:'用 The site is back up 說明網站從停擺中恢復，並通知同事重試原本受阻的操作。',steps,questions,takeaways:['The site is back up.','The site is down.'],completionTitle:'你能確認網站已恢復，並讓同事繼續工作。'};
