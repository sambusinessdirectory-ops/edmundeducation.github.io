import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-163-v2-audio','audio','只聽這個追問。說話者最想確認甚麼？',['對方有沒有收到剛傳出的東西。','對方有沒有看懂內容。','對方何時會回覆。','對方是否已打開並看完檔案。'],'對方有沒有收到剛傳出的東西。','Did you get it? 可在剛傳訊息、相片或文件後確認收到；不必然問是否看懂。'),
  mc('native-163-v2-tone','tone','你剛發了一份文件，同事未回訊息。想簡短確認收件，哪句最自然？',["I just sent the file. Did you get it?","Can you review the file before lunch?","Could you let me know after you've read it?","I uploaded the file to the shared folder."],"I just sent the file. Did you get it?",'先交代傳送內容，再問有沒有收到，語氣直接但不催促閱讀或回覆。'),
  mc('native-163-v2-rewrite','rewrite','你剛私訊朋友活動地址，想確認這條私訊有沒有收到。哪條最清楚？',["I sent you the address just now. Did you get it?","I sent the location earlier. Have you opened it?","I think the address is in our old messages.","I shared the address in the group chat. Can you see it?"],"I sent you the address just now. Did you get it?",'說明 it 指剛發出的地址，可避免朋友不知道你在問哪樣東西。'),
  open('native-163-v2-final','final','最後挑戰：你剛把照片用訊息傳給朋友，畫面顯示已送出但你想確認他是否收到。寫兩句英文自然詢問。',["I just sent you the photos. Did you get them?","I sent the picture a moment ago. Did you get it?"],'先指出剛傳的是一張還是多張照片，再用 it 或 them 正確指代。')
];
const steps=[
  {id:'native-163-v2-audio',style:'audio',label:'先聽追問',title:'有收到嗎？',intro:'聽聽說話者想核對哪一步。',model:'Did you get it?',zh:'你有收到嗎？',audioOnly:true,questions:['native-163-v2-audio']},
  {id:'native-163-v2-tone',style:'tone',label:'確認文件',title:'不等於催對方看完',intro:'保持簡短自然的語氣。',questions:['native-163-v2-tone']},
  {id:'native-163-v2-rewrite',style:'rewrite',label:'地址訊息',title:'it 到底指甚麼',intro:'給追問加上清楚的前文。',questions:['native-163-v2-rewrite']},
  {id:'native-163-v2-speak',style:'speak',label:'口頭詢問',title:'指定是那條訊息',intro:'先自己說；錄音或跳過後才聽示範。',model:'Did you get my message?',zh:'你有收到我的訊息嗎？',speakingPrompt:'你剛發了一條訊息，當面問朋友有沒有收到。',recording:'phrase',questions:[]},
  {id:'native-163-v2-final',style:'final',label:'照片挑戰',title:'一張還是幾張？',intro:'自己寫清楚傳了甚麼。',questions:['native-163-v2-final']}
];
export default {revision:2,summary:'用 Did you get it? 確認剛傳出的內容是否送到，並讓 it 的指代清楚。',steps,questions,takeaways:['Did you get it?','Did you get my message?'],completionTitle:'你能自然確認朋友有沒有收到文件或照片。'};
