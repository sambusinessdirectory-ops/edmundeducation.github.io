import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-363-v2-audio','audio','先聽這句網站登入描述。為何需要重新登入？',['太久沒有操作，登入時段到期。','App 每五分鐘無故登出。','密碼從一開始就錯。','帳戶已被永久刪除。'],'太久沒有操作，登入時段到期。','session timed out 指登入時段因閒置到期，通常需重新登入。'),
  mc('native-363-v2-detail','detail','你登入銀行網站後離開電腦半小時；回來時網站要你再登入。哪個線索支持 timed out？',['一段時間沒有任何操作。','你一直每分鐘按一次按鈕。','你從未輸入帳密。','銀行網站完全打不開。'],'一段時間沒有任何操作。','閒置一段時間是 session 到期的關鍵，與服務整體故障不同。'),
  mc('native-363-v2-repair','repair','朋友把一次閒置後登出說成「The app keeps signing me out」。哪句對這一次事件更準？',["My session timed out.","My account was permanently deleted.","The website is down for everyone.","I chose to close the browser."],"My session timed out.",'這裏有明確的閒置原因與一次到期，沒有反覆無故登出的證據。'),
  mc('native-363-v2-explain','explain','這句的 session 指甚麼？',['一次已登入的網站使用時段。','電腦上的一個檔案。','銀行的一間分行。','網站的價格標籤。'],'一次已登入的網站使用時段。','session 是網站維持登入狀態的一段使用時期；到期後通常要重新登入。'),
  mc('native-363-v2-transfer','transfer','換到政府服務網站：填表中途離開電腦很久，回來需重新登入。哪句可用？',["My session timed out while I was away.","The form printed itself.","My password never worked.","The whole site is permanently closed."],"My session timed out while I was away.",'網站種類改變，但因閒置而登入時段到期的機制相同。'),
  open('native-363-v2-branch-write','branch','新情境：你在網上填報稅表，中途離開四十分鐘；回來時系統已登出。朋友問你為何又在登入。寫兩句英文回答原因並說你要檢查已填內容是否保存。',["My session timed out while I was away. I'll check whether the form saved my answers.","I was inactive for too long, so my session timed out. Let me see if my progress was saved.","The site signed me out after I left it idle. I need to check the draft before continuing."],'自評時看是否交代閒置到期，而不是無故反覆登出，並提出檢查進度。')
];
const steps=[
  {id:'native-363-v2-audio',style:'audio',label:'聽出登出原因',title:'登入時段到期？',intro:'聽登入時段是否因閒置而到期。',model:'My session timed out.',zh:'我的登入時段到期了。',audioOnly:true,questions:['native-363-v2-audio']},
  {id:'native-363-v2-detail',style:'detail',label:'查看時間線',title:'離開半小時',intro:'從閒置時間判斷原因。',questions:['native-363-v2-detail']},
  {id:'native-363-v2-repair',style:'repair',label:'修正描述',title:'一次到期與反覆登出',intro:'按發生頻率說準問題。',questions:['native-363-v2-repair']},
  {id:'native-363-v2-explain',style:'explain',label:'理解 session',title:'網站維持登入的一段時間',intro:'拆解這個技術詞在日常對話的意思。',questions:['native-363-v2-explain']},
  {id:'native-363-v2-transfer',style:'transfer',label:'換到政府網站',title:'填表時離開很久',intro:'把表達用在另一個閒置場景。',questions:['native-363-v2-transfer']},
  {id:'native-363-v2-branch',style:'branch',label:'報稅表挑戰',title:'說明並檢查草稿',intro:'獨立寫兩句，再對照示例。',questions:['native-363-v2-branch-write']}
];
export default {revision:2,summary:'用 session timed out 說明網站因閒置而結束登入時段，與 App 反覆無故登出區分。',steps,questions,takeaways:['My session timed out.'],completionTitle:'你能說明為何要重新登入，並檢查填表進度。'};
