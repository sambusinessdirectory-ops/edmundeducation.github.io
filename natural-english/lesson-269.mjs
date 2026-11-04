import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-269-v2-audio','audio','先聽這個簡短問題。說話者想確認甚麼？',['面前的人是否正在排隊。','隊伍何時開始營業。','要排多久才能買到東西。','隊尾在店內哪個角落。'],'面前的人是否正在排隊。','Are you in line? 問的是眼前這個人的狀態；隊尾在哪裏是另一個問題。'),
  mc('native-269-v2-reverse','reverse','咖啡店櫃台附近有人站着，你不知他是否在等點餐。哪個問題最直接？',["Are you in line?","Is this the end of the line?","How long is the line?","When does the cafe close?"],"Are you in line?",'先確認此人是否排隊，再決定站在哪裏，能避免插隊。'),
  mc('native-269-v2-tone','tone','你想問陌生人是否在排隊，哪句適合忙碌的櫃台？',["Excuse me, are you in line?","Move over; I'm first.","Tell me why you're standing there.","You can't stand here."],"Excuse me, are you in line?",'Excuse me 先禮貌引起注意，後面只問與排隊有關的事。'),
  mc('native-269-v2-rewrite','rewrite','你原本問「Where does the line end?」，但真正不確定的是眼前的人是否排隊。怎樣改問？',["Are you in line?","Is the register broken?","Can I order for you?","How much is a coffee?"],"Are you in line?",'把問題對準眼前的人，比直接問隊尾更能釐清是否需要站在他後面。'),
  open('native-269-v2-final','final','新情境：銀行大堂有一個人站在櫃台旁，你不想插隊，但也看不到明顯隊伍。寫兩句英文，先禮貌確認他是否排隊，再詢問自己應站在哪裏。',["Excuse me, are you in line? If you are, should I stand behind you?","Hi, are you waiting in line? Where should I queue?","Sorry, are you in line for this counter? Could you show me where the line starts?"],'自評時看兩個目的是否都達成：確認眼前人的狀態，並找到自己該排的位置。')
];
const steps=[
  {id:'native-269-v2-audio',style:'audio',label:'聽懂問句',title:'眼前的人在排隊嗎？',intro:'先聽問題是在問眼前的人有沒有排隊。',model:'Are you in line?',zh:'你在排隊嗎？',audioOnly:true,questions:['native-269-v2-audio']},
  {id:'native-269-v2-reverse',style:'reverse',label:'反向配對',title:'不確定他是不是客人',intro:'從目的挑選問題。',questions:['native-269-v2-reverse']},
  {id:'native-269-v2-tone',style:'tone',label:'禮貌開口',title:'繁忙櫃台前',intro:'用簡短問句避免打擾或指責。',questions:['native-269-v2-tone']},
  {id:'native-269-v2-rewrite',style:'rewrite',label:'改對問題',title:'隊尾還是眼前這個人？',intro:'把原問題改成真正想知道的事。',questions:['native-269-v2-rewrite']},
  {id:'native-269-v2-speak',style:'speak',label:'即時發問',title:'別不小心插隊',intro:'先自己說；錄音或跳過後才聽示範。',model:'Are you in line?',zh:'你在排隊嗎？',speakingPrompt:'咖啡店櫃台前有人站着，你不確定他是不是正在排隊。禮貌問一句。',recording:'phrase',questions:[]},
  {id:'native-269-v2-final',style:'final',label:'銀行挑戰',title:'確認人和隊伍位置',intro:'寫兩句，完成後自行對照示例。',questions:['native-269-v2-final']}
];
export default {revision:2,summary:'用 Are you in line? 確認眼前的人是否排隊，並與詢問隊尾位置區分。',steps,questions,takeaways:['Are you in line?'],completionTitle:'你能禮貌確認排隊狀況，避免在櫃台前插隊。'};
