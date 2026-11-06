import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-372-v2-audio','audio','先聽店員這句話。退貨方面發生甚麼？',['允許退貨的期限已過。','退貨期還有三十天。','商品尚未交付。','店舖今天暫停營業。'],'允許退貨的期限已過。','return window has closed 指可退貨的期間已結束。'),
  mc('native-372-v2-repair','repair','你買衣服四十五天後想退，店規寫三十天。原句「The shop is closed」會誤導。哪句修正？',["The return window has closed.","The store's front door is locked.","The price tag is missing.","The item is still in transit."],"The return window has closed.",'關閉的是退貨期限，不是實體店門；window 在此指一段時間。'),
  mc('native-372-v2-transfer','transfer','同樣規則換到網購：平台規定收到商品後十四天內可退，現在已過二十天。哪句仍適用？',["The return window has closed.","The shipment was split in two.","The website is down.","The item is missing a price tag."],"The return window has closed.",'實體店與網店都可設定退貨期限，超過後可用同一句。'),
  open('native-372-v2-final','final','新情境：顧客三十七天前買了耳機，店舖規定三十天內可退。寫兩句禮貌英文告知期限已過，並提出可幫忙查其他選項。',["I'm sorry, but the return window has closed after 30 days. I can check whether any other options are available.","The return period ended last week, so we can't process a standard return. Let me see what else we can do.","Unfortunately, the 30-day return window has closed. I can still ask about repair options."],'自評時看是否說明過了期限，而非店舖關門，並禮貌提供下一步。')
];
const steps=[
  {id:'native-372-v2-audio',style:'audio',label:'聽出期限',title:'還能正常退貨嗎？',intro:'辨認是退貨期限過了，還是商店關門。',model:'The return window has closed.',zh:'退貨期限已過。',audioOnly:true,questions:['native-372-v2-audio']},
  {id:'native-372-v2-repair',style:'repair',label:'修正 closed',title:'關閉的是哪個 window？',intro:'分清退貨時段與店門。',questions:['native-372-v2-repair']},
  {id:'native-372-v2-transfer',style:'transfer',label:'換到網購',title:'超過十四天',intro:'把期限說法用於另一個渠道。',questions:['native-372-v2-transfer']},
  {id:'native-372-v2-speak',style:'speak',label:'櫃台口說',title:'告知無法按期限退貨',intro:'先自己說；錄音或跳過後才聽示範。',model:'The return window has closed.',zh:'退貨期限已過。',speakingPrompt:'顧客在退貨期限過後來店。用一句英文說明期限狀態。',recording:'phrase',questions:[]},
  {id:'native-372-v2-final',style:'final',label:'耳機挑戰',title:'告知期限並協助',intro:'告知退貨期限已過，再提出可行協助。',questions:['native-372-v2-final']}
];
export default {revision:2,summary:'用 return window has closed 說明已過可退貨期限，並與商店停止營業區分。',steps,questions,takeaways:['The return window has closed.'],completionTitle:'你能禮貌告知退貨期限已過，並提出其他協助。'};
