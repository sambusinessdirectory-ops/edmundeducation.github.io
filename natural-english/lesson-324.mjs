import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-324-v2-audio','audio','只聽店員這句話。保留期限到甚麼時候？',
    ['今天晚上為止。','明天晚上為止。','一星期後。','沒有期限。'],
    '今天晚上為止。','until tonight 是留到今晚；它沒有答應明天仍替你保留。'),
  mc('native-324-v2-reverse','reverse','We can only hold it until tonight。怎樣轉述才保留了 only 的限制？',
    ['最多只能留到今晚。','至少一定要留到明晚。','任何時候都能來拿。','店員不能留起商品。'],
    '最多只能留到今晚。','only 限定了最長時間；漏掉它可能讓同行者誤以為明天仍可來。'),
  mc('native-324-v2-tone','tone','你原想明天才回來，但店員只能留到今晚。你想了解具體截止時間，怎樣有禮追問？',
    ['What time do you close tonight?','Why are you refusing to sell it to me?','Could you keep it for a week anyway?','Can you tell me what I bought yesterday?'],
    'What time do you close tonight?','先問關門時間，才知道今晚最晚何時回來；不要把商店期限說成拒售。'),
  open('native-324-v2-final','final','最後挑戰：你請店員留一件外套到明天，但他說最多只能留到今晚。你今晚可能趕得回來。用兩句英文確認期限，並問店舖幾點關門。',
    ["So you can only hold it until tonight? What time do you close?","I understand you can hold it until tonight. What time should I come back by?","Okay, I'll try to come back tonight. What time does the store close?"],
    '保留時間只到今晚；追問具體關門或取貨時間，比假定明天仍留著更可靠。')
];
const steps=[
  {id:'native-324-v2-audio',style:'audio',label:'聽出期限',title:'最多留到今晚',intro:'先只聽店員一句話。',model:'We can hold it until tonight.',zh:'我們可以替你留到今晚。',audioOnly:true,questions:['native-324-v2-audio']},
  {id:'native-324-v2-reverse',style:'reverse',label:'轉述限制',title:'別漏掉 only',intro:'把店員的最長期限說準。',questions:['native-324-v2-reverse']},
  {id:'native-324-v2-tone',style:'tone',label:'有禮追問',title:'今晚幾點前？',intro:'了解可行的下一步。',questions:['native-324-v2-tone']},
  {id:'native-324-v2-speak',style:'speak',label:'口頭確認',title:'重新提出保留請求',intro:'先自己說；錄音或跳過後才聽示範。',model:'Can you put this on hold for me?',zh:'可以幫我暫時留起這個嗎？',speakingPrompt:'店員準備幫你保留商品。你想先確認可否暫留。',recording:'phrase',questions:[]},
  {id:'native-324-v2-final',style:'final',label:'關門前挑戰',title:'把取貨時間問清楚',intro:'自行確認限制與關門時間。',questions:['native-324-v2-final']}
];
export default {revision:2,summary:'聽懂 hold it until tonight 的保留期限，並追問今晚最晚何時可取。',steps,questions,takeaways:['We can hold it until tonight.','Can you put this on hold for me?'],completionTitle:'你能抓住保留期限，也會問清何時必須回來。'};
