import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-264-v2-audio','audio','聽完這句餐廳回應，這一桌的人數狀況如何？',['已到的人還在等最後一位。','所有人都已坐好。','還在等餐廳騰出座位。','其中一人決定不來。'],'已到的人還在等最後一位。','one more person 指還差一人未到；waiting for a table 則是等座位。'),
  mc('native-264-v2-scene','scene','帶位員問「Is your whole party here?」四位朋友之中已有三位到場。你怎樣回答？',["Not yet. We're still waiting for one more person.","Yes, all four of us are here.","We'd like a table for one.","One person has canceled for good."],"Not yet. We're still waiting for one more person.",'Not yet 回應是否人齊，後一句交代還有一人正在路上。'),
  mc('native-264-v2-tone','tone','你們已站在餐廳入口，後面還有客人。你想讓帶位員知道會等朋友到齊。哪句既簡短又有禮貌？',["We're still waiting for one more person. We can wait over here.","You have to hold the best table until our friend arrives.","Everyone is here, although one person isn't.","Move the other guests out of our way."],"We're still waiting for one more person. We can wait over here.",'先說明人還未齊，再提出不妨礙通道的等候方式。'),
  mc('native-264-v2-transfer','transfer','從餐廳換到密室逃脫：團隊四人已到三人，工作人員問能否開始。哪句仍適用？',["We're still waiting for one more person.","We're waiting for the bill.","We're waiting for a table.","We've all gone home."],"We're still waiting for one more person.",'這句說明團隊四人之中尚差一位，與是否在餐廳無關；其餘選項誤說成等帳單或等餐桌。'),
  mc('native-264-v2-rewrite','rewrite','你要傳短訊給帶位員，避免他誤以為你們在等空桌。哪句寫得最清楚？',["Three of us are here; we're waiting for one more person.","We haven't found a table yet.","Our table is missing a chair.","We'd like to order one more dish."],"Three of us are here; we're waiting for one more person.",'明確列出已到與未到人數，把「等人」與「等桌」分開。'),
  mc('native-264-v2-branch','branch','帶位員問：「Would you like to wait here?」你們打算在入口旁等最後一位。怎樣接話？',["Yes, thank you. She should be here soon.","No, everyone left an hour ago.","Please charge us now before we sit down.","We already finished dinner."],"Yes, thank you. She should be here soon.",'接受等候位置並簡短交代朋友快到，能自然延續現場對話。'),
  open('native-264-v2-rewrite-write','rewrite','新情境：你與兩位朋友到了餐廳，第四位仍在路上。帶位員誤以為你們在等桌子。寫兩句英文澄清目前到場人數，並說你們可以在旁邊等朋友。',
    ["We're still waiting for one more person. We can wait over here until she arrives.","Three of us are here, but one friend is still on the way. We'll wait by the entrance.","We don't need a table yet; we're waiting for one more person. We can stand to the side for now."],
    '自評時看是否清楚澄清「等人」而非「等桌」，並給出不擋路的等候安排。')
];
const steps=[
  {id:'native-264-v2-audio',style:'audio',label:'聽出人數',title:'這一桌人齊了嗎？',intro:'先聽回應，不看英文。',model:'We’re still waiting for one more person.',zh:'我們還在等最後一位。',audioOnly:true,questions:['native-264-v2-audio']},
  {id:'native-264-v2-scene',style:'scene',label:'餐廳入口',title:'帶位員問人齊未',intro:'照實回答目前到場的人數。',questions:['native-264-v2-scene']},
  {id:'native-264-v2-tone',style:'tone',label:'照顧現場',title:'在入口旁等候',intro:'清楚告知狀況，同時不擋住通道。',questions:['native-264-v2-tone']},
  {id:'native-264-v2-transfer',style:'transfer',label:'轉到團隊活動',title:'團隊還差一人',intro:'把相同的人數狀況用在另一處。',questions:['native-264-v2-transfer']},
  {id:'native-264-v2-rewrite',style:'rewrite',label:'寫給店員',title:'是等人，不是等桌',intro:'消除短訊裏的歧義。',questions:['native-264-v2-rewrite','native-264-v2-rewrite-write']},
  {id:'native-264-v2-branch',style:'branch',label:'接續對話',title:'店員讓你們等在旁邊',intro:'對他提出的等候安排作回應。',questions:['native-264-v2-branch']}
];
export default {revision:2,summary:'餐廳人尚未到齊時，清楚告知帶位員還差一位，並與等空桌區分。',steps,questions,takeaways:['We’re still waiting for one more person.'],completionTitle:'你能向店員準確說明人數和等候安排。'};
