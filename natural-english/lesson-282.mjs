import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-282-v2-audio','audio','聽完這句對飛機座位的描述，故障是甚麼？',['椅背不能往後傾。','座位安全帶扣不上。','椅子不能向前移。','座位號碼看不清。'],'椅背不能往後傾。','recline 指椅背向後放；won’t 表示嘗試後仍做不到。'),
  mc('native-282-v2-contrast','contrast','你按了椅背調節鈕，椅背完全沒動。哪句是報告故障，而不是問可否放後？',["The seat won't recline.","May I recline my seat?","The seat belt won't buckle.","Where is my seat number?"],"The seat won't recline.",'won’t recline 報告功能失效；May I recline 是徵詢許可。'),
  mc('native-282-v2-rewrite','rewrite','你向空服員原本只說「The seat is bad」。哪句能讓對方知道要檢查哪個功能？',["My seat won't recline when I press the button.","My seat number is printed on the ticket.","My seat is next to the window.","My seat is blue and gray."],"My seat won't recline when I press the button.",'加入按鈕無反應這個觀察，讓空服員知道是椅背調節問題。'),
  open('native-282-v2-final','final','新情境：長途航班上，你按了椅背按鈕幾次，椅背仍直立。寫兩句禮貌英文向空服員說明並請他看看。',["Excuse me, my seat won't recline. Could you take a look at it?","I've pressed the button, but the seat won't recline. Could someone check it, please?","Sorry to bother you; this seat doesn't recline. Would you mind seeing if it's stuck?"],'自評時看是否報告椅背無法放後，而非只問能否放後；第二句要有具體請求。')
];
const steps=[
  {id:'native-282-v2-audio',style:'audio',label:'聽出座位故障',title:'椅背有反應嗎？',intro:'聽椅背能否往後調整。',model:'The seat won’t recline.',zh:'椅背不能往後倒。',audioOnly:true,questions:['native-282-v2-audio']},
  {id:'native-282-v2-contrast',style:'contrast',label:'許可與故障',title:'不是問可不可以放後',intro:'分清功能壞了和禮貌詢問。',questions:['native-282-v2-contrast']},
  {id:'native-282-v2-rewrite',style:'rewrite',label:'描述得具體',title:'告訴空服員哪裏失靈',intro:'把含糊抱怨改成可檢查的問題。',questions:['native-282-v2-rewrite']},
  {id:'native-282-v2-speak',style:'speak',label:'口頭報告',title:'椅背按鈕沒用',intro:'先自己說；錄音或跳過後才聽示範。',model:'The seat won’t recline.',zh:'椅背不能往後倒。',speakingPrompt:'飛機座位按了調節鈕，椅背仍直立。向空服員簡短說明。',recording:'phrase',questions:[]},
  {id:'native-282-v2-final',style:'final',label:'航班挑戰',title:'禮貌請人檢查',intro:'說明椅背按鈕無效，再禮貌請空服員檢查。',questions:['native-282-v2-final']}
];
export default {revision:2,summary:'用 won’t recline 報告飛機椅背調節失靈，並向空服員提出檢查請求。',steps,questions,takeaways:['The seat won’t recline.'],completionTitle:'你能說清椅背故障，並禮貌請人查看。'};
