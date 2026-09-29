import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-444-v2-audio','audio','只聽停車場機器問題。最可能卡住的是甚麼？',['應從出口吐出的票。','停車場閘門的感應器。','你的車匙。','繳費螢幕上的字。'],'應從出口吐出的票。','ticket dispenser is jammed 指出票機的機械通道卡住，票未正常出來。'),
  mc('native-444-v2-reverse','reverse','你按取票鈕後聽到機器動了一下，但票沒有吐出。要向職員描述哪個設備卡住？',["The ticket dispenser is jammed.","The payment card was declined.","The parking meter has expired.","The gate sensor didn't detect my car."],"The ticket dispenser is jammed.",'機器有動作卻不出票，對準出票機卡住，不是付款或停車時間問題。'),
  mc('native-444-v2-branch','branch','職員問 Is the ticket stuck inside? 你看不見票，只知道沒出來。怎樣審慎回覆？',["I'm not sure, but nothing came out when I pressed the button.","Yes, I can clearly see the ticket hanging out.","No, I already collected the ticket.","The payment went through twice."],"I'm not sure, but nothing came out when I pressed the button.",'說出確知的按鈕與無出票結果，不假裝看見機器裡面。'),
  open('native-444-v2-final','final','最後挑戰：你在停車場入口按了取票鈕，機器有聲響但沒票吐出。你看不到票是否卡在裡面。向職員寫兩句英文報告問題並請求協助。',["The ticket dispenser seems jammed. I pressed the button, but no ticket came out—could you help?","I can hear the machine running, but it won't give me a ticket. Could someone check the dispenser?"],'把未出票的觀察和 jammed 的推測分開，再向職員提出協助請求。')
];
const steps=[
  {id:'native-444-v2-audio',style:'audio',label:'先聽故障',title:'按鈕後沒有票',intro:'聽出問題在出票環節。',model:'The ticket dispenser is jammed.',zh:'出票機卡住了。',audioOnly:true,questions:['native-444-v2-audio']},
  {id:'native-444-v2-reverse',style:'reverse',label:'由現象找設備',title:'聽到機器動了一下',intro:'選出卡住的位置。',questions:['native-444-v2-reverse']},
  {id:'native-444-v2-branch',style:'branch',label:'看不見內部',title:'回覆職員追問',intro:'只說可觀察的事。',questions:['native-444-v2-branch']},
  {id:'native-444-v2-speak',style:'speak',label:'口頭確認',title:'票是否卡裡面？',intro:'先自己說；錄音或跳過後才聽示範。',model:'Is the ticket stuck inside?',zh:'票卡在裡面嗎？',speakingPrompt:'朋友也看不到票在哪裡。向職員詢問是否卡在機器裡。',recording:'phrase',questions:[]},
  {id:'native-444-v2-final',style:'final',label:'停車入口',title:'報告沒出票',intro:'自己說明現象和請求。',questions:['native-444-v2-final']}
];
export default {revision:2,summary:'用 ticket dispenser is jammed 描述取票機不出票，並審慎區分可見現象與內部推測。',steps,questions,takeaways:['The ticket dispenser is jammed.','Is the ticket stuck inside?'],completionTitle:'你能向停車場職員清楚報告出票機卡住。'};
