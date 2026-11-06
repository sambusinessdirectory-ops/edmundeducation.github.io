import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-446-v2-audio','audio','只聽電梯公告。乘客現在應怎樣理解？',['這部電梯目前不能使用。','電梯正在慢速運行。','只有頂樓按鈕不能按。','電梯仍可用，但要先預約。'],'這部電梯目前不能使用。','out of service 表示設備暫停提供服務，通常要找替代路線。'),
  mc('native-446-v2-contrast','contrast','電梯門關著，旁邊牌子寫 Out of service。哪個理解比「正在等候」準確？',['暫時不能乘坐，應找樓梯或另一部電梯。','門會在下一班自動打開。','只是上行停止、下行仍正常。','需要刷卡就能乘坐。'],'暫時不能乘坐，應找樓梯或另一部電梯。','牌子表示整部設備停用，並非正常等候或單向限制。'),
  mc('native-446-v2-explain','explain','訪客問 Is it broken or just busy? 你只知道貼有停用告示。哪句審慎？',["It's out of service today; I don't know the exact cause.","The motor is definitely broken.","It's only busy, so keep waiting.","It will reopen in exactly five minutes."],"It's out of service today; I don't know the exact cause.",'告示只確認目前不能使用，未必說明故障原因或恢復時間。'),
  mc('native-446-v2-rewrite','rewrite','給上樓開會的同事寫一條通知，說電梯停用，樓梯仍可走。哪句最清楚？',["The elevator is out of service today. Please use the stairs to reach the meeting room.","The elevator might be slow, but keep waiting.","The stairs are out of service, so use the elevator.","The meeting room moved because the elevator is busy."],"The elevator is out of service today. Please use the stairs to reach the meeting room.",'先說明電梯不能用，再給可行替代路線，方便同事按時到場。'),
  open('native-446-v2-final','final','最後挑戰：酒店大堂電梯貼了停用告示，住客問怎樣上二樓。寫兩句英文說明電梯狀態並指出樓梯位置。',["Sorry, the elevator is out of service today. The stairs to the second floor are beside the front desk.","The elevator isn't available right now. You can take the stairs just behind the lobby."],'明確說設備停用，再給具體路線；不需無證據承諾修復時間。')
];
const steps=[
  {id:'native-446-v2-audio',style:'audio',label:'先聽公告',title:'電梯停用',intro:'判斷是等候還是不能使用。',model:'The elevator is out of service.',zh:'電梯停用。',audioOnly:true,questions:['native-446-v2-audio']},
  {id:'native-446-v2-contrast',style:'contrast',label:'看告示',title:'不是排隊等下一班',intro:'理解 out of service 的程度。',questions:['native-446-v2-contrast']},
  {id:'native-446-v2-explain',style:'explain',label:'原因未知',title:'只說告示能證實的事',intro:'不要猜壞了哪個零件。',questions:['native-446-v2-explain']},
  {id:'native-446-v2-rewrite',style:'rewrite',label:'通知同事',title:'改走樓梯',intro:'把狀態與替代路線寫在一起。',model:'Sorry, the elevator is out of service today.',zh:'抱歉，電梯今天停用。',questions:['native-446-v2-rewrite']},
  {id:'native-446-v2-final',style:'final',label:'酒店挑戰',title:'住客要上二樓',intro:'自己說明停用和樓梯位置。',questions:['native-446-v2-final']}
];
export default {revision:2,summary:'用 out of service 說電梯暫不能用，並提供明確替代路線。',steps,questions,takeaways:['The elevator is out of service.','Sorry, the elevator is out of service today.'],completionTitle:'你能告訴住客電梯停用，並指引他走樓梯。'};
