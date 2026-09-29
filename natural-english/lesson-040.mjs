import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'open',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-040-v2-audio','audio','只聽一句話。這次通話怎樣結束？',
    ['連線意外中斷。','說話者主動掛線。','對方要求轉接。','兩人約定明天再說。'],
    '連線意外中斷。','The call dropped. 指通話突然斷掉；不是有意結束談話。'),
  mc('native-040-v2-explain','explain','為甚麼在重新接通後說 Sorry, the call dropped. 比 Sorry, I hung up. 更準確？',
    ['前句表示意外斷線，後句會讓人以為你主動掛斷。','前句表示手機沒電，後句表示網速太慢。','兩句都表示對方把電話轉接了。','前句只適用於面對面交談。'],
    '前句表示意外斷線，後句會讓人以為你主動掛斷。','dropped 描述連線中斷；hung up 描述掛線動作，會改變對方對事件的理解。'),
  mc('native-040-v2-repair','repair','你想道歉斷線，卻說成 Sorry, I dropped my phone.。手機沒有掉到地上；要改哪句？',
    ['Sorry, the call dropped.','Sorry, I broke the phone.','Sorry, I turned the phone off.','Sorry, I lost your number.'],
    'Sorry, the call dropped.','主語要是 the call；I dropped my phone. 說的是手機從手上掉下。'),
  blank('native-040-v2-rewrite','rewrite','重新打給朋友後，寫一句英文道歉，並說剛才那通電話意外斷了。',
    ['Sorry, the call dropped.','Sorry, we got disconnected.','The call dropped. Sorry.','Sorry, our call dropped.'],
    '不是有人主動掛線。','The call dropped. 和 We got disconnected. 都自然指出意外斷線。'),
  blank('native-040-v2-transfer','transfer','換到視訊會議：你重新加入後想說剛才你們斷線了。用 We 開頭寫一句英文。',
    ['We got disconnected.','We were disconnected.','We got cut off.'],
    '由兩人共同經歷的斷線來說。','We got disconnected. 既可描述電話，也可描述視訊的意外中斷。'),
  blank('native-040-v2-final','final','最後挑戰：你和客戶講電話時線路斷掉。重新接通後寫兩句英文：簡短道歉、說明是通話斷線，然後請對方接着說。',
    ['Sorry, the call dropped. Please go on.','Sorry, we got disconnected. Please go on.','Sorry, the call dropped. Could you continue?','Sorry, we got disconnected. Could you continue?'],
    '道歉和解釋後，把話語權交回對方。','說明意外斷線，再用 Please go on. 或 Could you continue? 讓對方知道你願意繼續聽。')
];

const steps=[
  {id:'native-040-v2-audio',style:'audio',label:'聽出斷線',title:'通話怎樣結束？',intro:'先聽聲音，不看逐字稿。',model:'The call dropped.',zh:'通話突然斷了。',audioOnly:true,questions:['native-040-v2-audio']},
  {id:'native-040-v2-explain',style:'explain',label:'解釋用字',title:'不是你主動掛線',intro:'比較斷線和主動掛斷造成的不同意思。',questions:['native-040-v2-explain']},
  {id:'native-040-v2-repair',style:'repair',label:'修正主語',title:'掉的是通話，不是手機',intro:'主語一變，整件事就變了。',questions:['native-040-v2-repair']},
  {id:'native-040-v2-rewrite',style:'rewrite',label:'重撥道歉',title:'回到剛才的話題',intro:'用簡短一句向朋友交代。',questions:['native-040-v2-rewrite']},
  {id:'native-040-v2-transfer',style:'transfer',label:'轉到視訊',title:'視訊斷線也能這樣說',intro:'更換通話媒介和主語。',questions:['native-040-v2-transfer']},
  {id:'native-040-v2-final',style:'final',label:'客戶重連',title:'道歉並請對方繼續',intro:'全新情境，不給選項。',questions:['native-040-v2-final']}
];

export default {revision:2,summary:'分清意外斷線與主動掛線，在電話或視訊重連後道歉並自然接續談話。',steps,questions,takeaways:['The call dropped.','We got disconnected.'],completionTitle:'你能準確解釋通話中斷，重新接上話題了！'};
