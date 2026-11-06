import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-159-v2-audio','audio','只聽這句科技問題。訊息現在處於甚麼狀態？',['嘗試傳送，但一直失敗。','已讀但對方不回。','已成功送達。','仍停在傳送中的畫面。'],'嘗試傳送，但一直失敗。','won’t go through 指傳送過程未成功，不等於已讀不回。'),
  mc('native-159-v2-explain','explain','朋友說 Maybe she’s ignoring you。哪項手機畫面能澄清其實不是「已讀不回」？',['訊息旁一直顯示傳送失敗。','訊息下面顯示 Read 9:12。','朋友說他半小時前收到另一條訊息。','訊息旁顯示已送達，但沒有已讀。'],'訊息旁一直顯示傳送失敗。','傳送未成功，對方可能根本沒收到；不能從未回覆推斷對方忽略。'),
  mc('native-159-v2-repair','repair','手機沒有訊號，訊息按了送出卻失敗。你說 She left me on read。哪句改得符合證據？',["The message won't go through.","She read it but didn't reply.","She replied immediately.","The message was delivered twice."],"The message won't go through.",'已讀未回需要已讀證據；當下問題是訊息甚至沒有傳出去。'),
  mc('native-159-v2-tone','tone','朋友問 Did you text her? 你試了，但網絡不穩。哪句自然又不責怪收件人？',["I tried, but the message won't go through.","She may not have seen it yet.","I think she's busy and hasn't replied.","I sent it, but I haven't checked the status yet."],"I tried, but the message won't go through.",'先交代嘗試，再說傳送障礙；不臆測對方做了甚麼。'),
  mc('native-159-v2-rewrite','rewrite','你要通知同伴「電話一直接不通，稍後再試」。哪條訊息用法正確？',["The call won't go through, so I'll try again later.","The phone is busy, so I'll text instead.","The call rings once, then disconnects.","I called but she hasn't called back."],"The call won't go through, so I'll try again later.",'go through 也可用於電話接通；加上稍後再試便是完整安排。'),
  open('native-159-v2-final','final','最後挑戰：你在地鐵站想傳文件給同事，畫面一直顯示傳送失敗，可能是訊號差。寫兩句英文向同事解釋並說明你稍後會重試。',["I tried to send you the file, but the message won't go through. I'll try again when I have a better signal.","The file isn't sending from the station. I'll resend it once I'm outside."],'說明尚未送達，並把重試安排連到訊號改善；不要說成對方已讀不回。')
];
const steps=[
  {id:'native-159-v2-audio',style:'audio',label:'先聽狀態',title:'傳送卡住了',intro:'先聽訊息是在傳送前、傳送中，還是已送達。',model:'The message won’t go through.',zh:'訊息一直傳不出去。',audioOnly:true,questions:['native-159-v2-audio']},
  {id:'native-159-v2-explain',style:'explain',label:'看畫面證據',title:'對方可能根本沒收到',intro:'區分傳送失敗與已讀未回。',questions:['native-159-v2-explain']},
  {id:'native-159-v2-repair',style:'repair',label:'改準說法',title:'不是已讀不回',intro:'用螢幕資訊修正推測。',questions:['native-159-v2-repair']},
  {id:'native-159-v2-tone',style:'tone',label:'回答朋友',title:'只說確知的事',intro:'避免無根據地責怪收件人。',questions:['native-159-v2-tone']},
  {id:'native-159-v2-rewrite',style:'rewrite',label:'換到電話',title:'電話也接不通',intro:'把 go through 用於另一種連線。',model:'The call won’t go through.',zh:'電話一直接不通。',questions:['native-159-v2-rewrite']},
  {id:'native-159-v2-final',style:'final',label:'地鐵挑戰',title:'文件稍後再傳',intro:'自己交代傳送狀況和計劃。',questions:['native-159-v2-final']}
];
export default {revision:2,summary:'用 won’t go through 描述訊息或電話無法傳送、接通，並與已讀未回區分。',steps,questions,takeaways:['The message won’t go through.','The call won’t go through.'],completionTitle:'你能說清訊息未成功送出，也能提出重試安排。'};
