import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-362-v2-audio','audio','聽完這句對 App 的抱怨，登入狀態怎樣？',['成功登入後又反覆被自動登出。','從未成功登入過。','只在使用者按下登出時離開。','App 一直在下載更新。'],'成功登入後又反覆被自動登出。','keeps signing me out 指 App 多次把已登入的使用者登出。'),
  mc('native-362-v2-scene','scene','你每天登入某 App，過一會它又要求輸入密碼；今天已重複三次。怎樣說？',["The app keeps signing me out.","The app won't let me sign in at all.","I chose to sign out three times.","The app keeps opening the camera."],"The app keeps signing me out.",'先能登入、後被登出而且反覆發生，是 keeps signing me out 的完整情況。'),
  mc('native-362-v2-reverse','reverse','朋友說「It signed me out」。與本課句子的差別是甚麼？',['只說一次登出，沒有明確表示反覆。','表示他永遠無法登入。','表示他主動刪除了帳戶。','表示手機完全沒電。'],'只說一次登出，沒有明確表示反覆。','keeps 加動名詞才突出一再發生；單次過去式不帶這層意思。'),
  mc('native-362-v2-tone','tone','向客服報告問題時，哪句給出具體又平實的現象？',["I can log in, but the app keeps signing me out after a few minutes.","Your company deleted every account on purpose.","My password has never worked even once.","The app is perfect and never signs me out."],"I can log in, but the app keeps signing me out after a few minutes.",'清楚交代登入成功及幾分鐘後被登出，方便客服查核。'),
  open('native-362-v2-final','final','新情境：你用銀行 App，登入成功後約五分鐘便被自動登出，今天已發生三次。寫兩句英文向客服描述規律和造成的困擾。',["The app keeps signing me out about five minutes after I log in. I've had to enter my password three times today.","I can sign in successfully, but the app logs me out again after a few minutes. It's interrupted my banking three times today.","The app has signed me out repeatedly today. Each time, I have to start the task again."],'自評時看是否說出成功登入後反覆被登出，而不是從未登入成功。')
];
const steps=[
  {id:'native-362-v2-audio',style:'audio',label:'聽出反覆',title:'App 為何又要密碼？',intro:'留意 App 是否登入後又反覆自動登出。',model:'The app keeps signing me out.',zh:'App 一直把我登出。',audioOnly:true,questions:['native-362-v2-audio']},
  {id:'native-362-v2-scene',style:'scene',label:'登入三次',title:'成功進入後又退出',intro:'按時間順序選說法。',questions:['native-362-v2-scene']},
  {id:'native-362-v2-reverse',style:'reverse',label:'一次與反覆',title:'keeps 加了甚麼？',intro:'比較單次登出和重複登出。',questions:['native-362-v2-reverse']},
  {id:'native-362-v2-tone',style:'tone',label:'客服通報',title:'給出重現規律',intro:'把問題描述成可檢查的步驟。',questions:['native-362-v2-tone']},
  {id:'native-362-v2-speak',style:'speak',label:'即時口說',title:'App 又把你登出',intro:'先自己說；錄音或跳過後才聽示範。',model:'The app keeps signing me out.',zh:'App 一直把我登出。',speakingPrompt:'你已成功登入，但 App 過一會又自動登出，反覆發生。簡短描述。',recording:'phrase',questions:[]},
  {id:'native-362-v2-final',style:'final',label:'銀行 App 挑戰',title:'向客服說明規律',intro:'寫兩句，再自行對照。',questions:['native-362-v2-final']}
];
export default {revision:2,summary:'用 keeps signing me out 描述 App 在成功登入後反覆自動登出，與從未能登入分開。',steps,questions,takeaways:['The app keeps signing me out.'],completionTitle:'你能向客服清楚描述反覆被登出的規律。'};
