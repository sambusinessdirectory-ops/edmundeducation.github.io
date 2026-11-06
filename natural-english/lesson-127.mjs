import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-127-v2-audio','audio','只聽這句口語說法。對方做了哪兩件事？',['看過訊息，卻一直沒有回覆。','收到訊息卻尚未打開。','立即回覆並道歉。','看過訊息，但很晚才回覆。'],'看過訊息，卻一直沒有回覆。','left me on read 結合「已讀」和「沒有回」；有已讀記錄才知道看過。'),
  mc('native-127-v2-explain','explain','朋友說「他可能只是沒收到」。哪項證據最能支持 on read 的說法？',['聊天畫面顯示已讀，但仍沒有回覆。','訊息仍顯示傳送中。','訊息已送達，但回條功能關閉。','對方今晚仍有上線。'],'聊天畫面顯示已讀，但仍沒有回覆。','已讀標記與未回覆缺一不可；只知道送達不足以判斷。'),
  mc('native-127-v2-transfer','transfer','換成群組朋友 Maya：她看了你的私訊，兩天仍沒有回。怎樣自然轉述？',["Maya left me on read.","Maya left me on delivered.","Maya read my message and replied right away.","Maya hasn't opened my message yet."],"Maya left me on read.",'主語可換成 Maya，on read 保留「已讀不回」的口語意思。'),
  open('native-127-v2-final','final','最後挑戰：你問朋友週末要不要看電影。聊天程式顯示他昨天已讀，但還未答覆。另一位朋友問進展。寫兩句英文交代事實，避免斷定他為何不回。',["I asked him about the movie, but he left me on read. Maybe he's just busy.","He read my message yesterday and hasn't replied yet. I don't know why."],'說明已讀與未回，保留對原因的不確定；on read 不證明對方故意冷落。')
];
const steps=[
  {id:'native-127-v2-audio',style:'audio',label:'聽出口語',title:'已讀之後呢？',intro:'先只聽句子。',model:'He left me on read.',zh:'他已讀了我的訊息卻沒回。',audioOnly:true,questions:['native-127-v2-audio']},
  {id:'native-127-v2-explain',style:'explain',label:'看證據',title:'能確定他看過嗎？',intro:'用介面訊息支撐描述。',questions:['native-127-v2-explain']},
  {id:'native-127-v2-speak',style:'speak',label:'口頭交代',title:'朋友問回覆了沒',intro:'先自己說；錄音或跳過後才聽示範。',model:'His read receipts are on.',zh:'他的已讀回條開著。',speakingPrompt:'你知道對方看過訊息，因為他的已讀回條開著。向朋友說明。',recording:'phrase',questions:[]},
  {id:'native-127-v2-transfer',style:'transfer',label:'換個人名',title:'Maya 也已讀不回',intro:'把口語句換到另一個人物。',questions:['native-127-v2-transfer']},
  {id:'native-127-v2-final',style:'final',label:'電影挑戰',title:'只說知道的事',intro:'寫進展，不猜測對方動機。',questions:['native-127-v2-final']}
];
export default {revision:2,summary:'理解 left me on read 指已讀未回，並把可見事實與對方動機分開。',steps,questions,takeaways:['He left me on read.','His read receipts are on.'],completionTitle:'你能自然說出已讀未回，也能避免過度推測。'};
