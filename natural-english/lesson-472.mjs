import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-472-v2-audio','audio','先只聽 App 的狀況。畫面停在哪裏？',['一直停在載入畫面。','打開後立即閃退。','下載進度停在 99%。','登入後顯示錯誤密碼。'],'一直停在載入畫面。','stuck on the loading screen 表示畫面仍在載入中，未進到下一頁。'),
  mc('native-472-v2-contrast','contrast','App 還開着，轉圈圈十分鐘都沒進首頁；它沒有自行關閉。哪句最準？',["The app is stuck on the loading screen.","The app crashed.","The app won't install.","The app logged me out."],"The app is stuck on the loading screen.",'畫面持續卡在載入中，不等於程式崩潰關閉或安裝失敗。'),
  mc('native-472-v2-transfer','transfer','同一個 App 在平板上也一直顯示 Loading，沒有任何新頁面。你向客服怎樣描述？',["It's stuck on the loading screen on my tablet too.","It crashes as soon as I open it on the tablet.","It finishes loading but the page is blank.","It asks me to reset my password."],"It's stuck on the loading screen on my tablet too.",'換了裝置但仍卡在 Loading；不要把持續顯示載入誤說成閃退。'),
  mc('native-472-v2-rewrite','rewrite',"把 The app doesn't work 改成可觀察的具體現象：打開後一直轉圈。",["The app is stuck on the loading screen.","The app crashed after I logged in.","The app opens, but the home page stays blank.","The app freezes after I reach the home screen."],"The app is stuck on the loading screen.",'描述卡住的畫面，客服才知道問題在啟動載入階段；其他句子指向登入後或進首頁後的故障。'),
  open('native-472-v2-speak','speak','打開 App 後十多分鐘仍只有 Loading。先口頭向朋友描述，再聽示範。',["The app is stuck on the loading screen.","It's been stuck on the loading screen for ten minutes."],'stuck on the loading screen 表示仍停在載入畫面，未必崩潰。'),
  open('native-472-v2-final','final','新場景：你要用訂餐 App，但轉圈圈一直不結束。寫兩句英文給客服，指出卡在哪個畫面，並說你已等了多久。',["The app is stuck on the loading screen. I've been waiting for over ten minutes.","I can't get past the loading screen in the app. It's been spinning for about fifteen minutes."],'交代卡住的具體畫面與等待時間，避免只說 App 不好用。')
];
const steps=[
  {id:'native-472-v2-audio',style:'audio',label:'先聽畫面',title:'只見轉圈圈',intro:'判斷 App 停在哪一步。',model:'The app is stuck on the loading screen.',zh:'App 卡在載入畫面。',audioOnly:true,questions:['native-472-v2-audio']},
  {id:'native-472-v2-contrast',style:'contrast',label:'沒有閃退',title:'還在 Loading',intro:'分清卡住與崩潰。',model:'The app crashed.',zh:'App 崩潰了。',questions:['native-472-v2-contrast']},
  {id:'native-472-v2-transfer',style:'transfer',label:'換到平板',title:'問題也出現',intro:'把描述轉到另一裝置。',questions:['native-472-v2-transfer']},
  {id:'native-472-v2-rewrite',style:'rewrite',label:'給客服線索',title:'比籠統描述具體',intro:'說出卡住的階段。',questions:['native-472-v2-rewrite']},
  {id:'native-472-v2-speak',style:'speak',label:'口頭報告',title:'等了十分鐘',intro:'先說再聽示範。',model:'The app is stuck on the loading screen.',zh:'App 卡在載入畫面。',speakingPrompt:'App 一直顯示 Loading，先口頭描述故障。',recording:'phrase',questions:['native-472-v2-speak']},
  {id:'native-472-v2-final',style:'final',label:'客服挑戰',title:'訂餐前卡住',intro:'寫畫面與等待時間。',questions:['native-472-v2-final']}
];
export default {revision:2,summary:'用 stuck on the loading screen 描述 App 持續轉圈、無法進下一頁，與閃退區分。',steps,questions,takeaways:['The app is stuck on the loading screen.','The app crashed.'],completionTitle:'你能準確向客服描述 App 載入卡住。'};
