import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-364-v2-audio','audio','只聽這句關於電郵的話，送件結果如何？',['電郵沒送達，系統退回了。','對方已閱讀並回覆。','電郵仍在草稿夾。','附件被成功下載。'],'電郵沒送達，系統退回了。','email bounced 表示寄送失敗並收到退件，不代表對方已讀。'),
  mc('native-364-v2-explain','explain','朋友問：「Did they read your email?」你收到地址不存在的退件通知。哪項最準確？',['不能假定對方已讀；信根本沒有送達。','對方一定讀過並故意不回。','附件肯定已下載。','郵件只是被標成星號。'],'不能假定對方已讀；信根本沒有送達。','地址不存在的退件通知說明信件沒有進入對方信箱；應先核對地址，不能說對方已讀不回。'),
  mc('native-364-v2-tone','tone','你要告訴同事先前寄出的邀請沒有送達，可能是地址錯。哪句合適？',["The email bounced. I'll check the address and resend it.","They ignored our invitation on purpose.","The email was read but never written.","Our server has definitely shut down forever."],"The email bounced. I'll check the address and resend it.",'先報告已知的退件，再提出核對地址；不臆測收件者意圖。'),
  open('native-364-v2-final','final','新情境：你寄發會議邀請後收到「address not found」通知，同事問邀請是否送到。寫兩句英文回答並說明下一步。',["No, the email bounced because the address wasn't found. I'll confirm the address and send it again.","The invitation didn't go through; the email bounced. Let me check their address before I retry.","It bounced back with an address error. I'll ask for the correct email address and resend it."],'自評時看是否說清楚未送達，而不是說對方已讀不回，並提出核對地址。')
];
const steps=[
  {id:'native-364-v2-audio',style:'audio',label:'聽出送達結果',title:'電郵有到對方信箱嗎？',intro:'辨認電郵是已送達還是被退回。',model:'The email bounced.',zh:'電郵寄不出又退回。',audioOnly:true,questions:['native-364-v2-audio']},
  {id:'native-364-v2-explain',style:'explain',label:'理解退件',title:'不能推斷對方已讀',intro:'從系統通知判斷送達情況。',questions:['native-364-v2-explain']},
  {id:'native-364-v2-tone',style:'tone',label:'通知同事',title:'報告問題但不臆測',intro:'把確定的退件與可能原因分開。',questions:['native-364-v2-tone']},
  {id:'native-364-v2-speak',style:'speak',label:'口頭報告',title:'邀請電郵退回',intro:'先自己說；錄音或跳過後才聽示範。',model:'The email bounced.',zh:'電郵寄不出又退回。',speakingPrompt:'你寄出電郵後收到退件通知。簡短向同事報告。',recording:'phrase',questions:[]},
  {id:'native-364-v2-final',style:'final',label:'邀請挑戰',title:'核對地址再重寄',intro:'說明電郵被退回，再請對方核對地址。',questions:['native-364-v2-final']}
];
export default {revision:2,summary:'用 email bounced 說明電郵未送達並被退回，接着核對地址。',steps,questions,takeaways:['The email bounced.'],completionTitle:'你能清楚報告退件，並安排重寄。'};
