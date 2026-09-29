import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-273-v2-audio','audio','聽完這句向銀行提出的問題，說話者最確定的是甚麼？',['有一筆交易自己沒有印象。','同一筆款項一定扣了兩次。','店員肯定故意偷錢。','信用卡已經過期。'],'有一筆交易自己沒有印象。','don’t recognize 表示目前無法辨認；尚未證實原因。'),
  mc('native-273-v2-contrast','contrast','你在帳單看到一筆不熟悉的餐廳消費，卻還沒核對日期與同行者。哪句避免過早斷定是重複扣款？',["I don't recognize this charge.","There's definitely a duplicate charge.","The cashier undercharged me.","My card has expired."],"I don't recognize this charge.",'先說自己不認得這筆消費，再請客服查詳情，比沒有證據便指稱重複扣款準確。'),
  mc('native-273-v2-rewrite','rewrite','你要向信用卡客服寫訊息，請對方協助查一筆陌生交易。哪句最清楚？',["I don't recognize this charge on my statement. Could you tell me the date and merchant?","I paid twice for this exact purchase, and I have both receipts.","Please increase my credit limit immediately.","I need a new card because this one has expired."],"I don't recognize this charge on my statement. Could you tell me the date and merchant?",'訊息先指出不認得的交易，再要求日期與商戶資訊供核對。'),
  open('native-273-v2-final','final','新情境：信用卡月結單有一筆你沒印象的 $38 餐廳消費。寫兩句英文向銀行客服描述，並請對方提供交易資料。',["I don't recognize this $38 charge on my statement. Could you tell me when and where it was made?","There's a $38 restaurant charge I don't recognize. Can you check the merchant and date for me?","I don't remember making this $38 restaurant purchase. Could you give me more details about the charge?"],'自評時看是否清楚指出不認得的交易，並要求可核對的具體資料，不先斷言是盜用。')
];
const steps=[
  {id:'native-273-v2-audio',style:'audio',label:'聽出疑問',title:'這筆交易是哪來的？',intro:'先聽英文，不看帳單句子。',model:'I don’t recognize this charge.',zh:'我不認得這筆消費。',audioOnly:true,questions:['native-273-v2-audio']},
  {id:'native-273-v2-contrast',style:'contrast',label:'先別下結論',title:'不認得還是重複扣？',intro:'按目前證據選適當表述。',questions:['native-273-v2-contrast']},
  {id:'native-273-v2-rewrite',style:'rewrite',label:'寫給銀行',title:'要求可核對的資料',intro:'把含糊的疑問寫成清楚請求。',questions:['native-273-v2-rewrite']},
  {id:'native-273-v2-speak',style:'speak',label:'致電客服',title:'一句話報告',intro:'先自己說；錄音或跳過後才聽示範。',model:'I don’t recognize this charge.',zh:'我不認得這筆消費。',speakingPrompt:'你在信用卡帳單看到一筆完全沒有印象的交易。向客服先報告問題。',recording:'phrase',questions:[]},
  {id:'native-273-v2-final',style:'final',label:'月結單挑戰',title:'問清楚 $38 消費',intro:'寫兩句，再對照示例檢查。',questions:['native-273-v2-final']}
];
export default {revision:2,summary:'向信用卡客服指出不認得的消費，並先取得交易資料再判斷原因。',steps,questions,takeaways:['I don’t recognize this charge.'],completionTitle:'你能清楚提出陌生交易並要求核對資料。'};
