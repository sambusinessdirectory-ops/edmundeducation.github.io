import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-262-v2-audio','audio','只聽這句向店員提出的請求。說話者手上最可能有甚麼？',['一張二十元鈔票，想換小面額。','二十元硬幣，想買商品。','需要借二十元。','一張遺失的二十元收據。'],'一張二十元鈔票，想換小面額。','change for a twenty 在這裏是把二十元紙幣找開，取得較小面額。'),
  mc('native-262-v2-reverse','reverse','你想問店員可否把手上的 $20 換成小鈔。哪句正好提出這個問題？',["Do you have change for a twenty?","Can I borrow twenty dollars?","Does this item cost twenty dollars?","Can you refund my twenty dollars?"],"Do you have change for a twenty?",'change for a twenty 問對方有沒有零錢找開；不涉及借款、價格或退款。'),
  mc('native-262-v2-tone','tone','你在繁忙咖啡店想找開 $20，店員正在服務其他人。哪個開口既禮貌又清楚？',["Excuse me, do you have change for a twenty?","Give me twenty dollars in coins now.","You must change this bill immediately.","I lost twenty dollars; pay me back."],"Excuse me, do you have change for a twenty?",'Excuse me 先引起注意，再具體問有沒有零錢；其餘說法像命令或改變了請求。'),
  mc('native-262-v2-continue','continue','你問完後店員說：「Yeah, no problem.」哪個回答自然接下去？',["Great, thanks. Here you go.","No, I wanted to borrow the money.","Then cancel my order forever.","Why is this item so expensive?"],"Great, thanks. Here you go.",'店員已答應把大鈔找開；道謝並遞出手上的二十元鈔票，才能讓找換繼續。'),
  mc('native-262-v2-rewrite','rewrite','你準備傳訊息問朋友能否幫你找開一張 $20，而不是借你 $20。哪句不會混淆？',["Do you have change for a twenty? I only have a big bill.","Can you lend me twenty? I have no money.","Can you pay twenty for me? I'll buy it later.","Did you lose your twenty-dollar bill?"],"Do you have change for a twenty? I only have a big bill.",'補上手上只有大鈔，進一步說明你要換面額，不是借款。'),
  open('native-262-v2-rewrite-write','rewrite','新情境：停車咪錶只收小額鈔票，你手上只有一張二十元。寫兩句英文問附近店員能否幫你找開，並說明用途。',
    ["Excuse me, do you have change for a twenty? The parking meter won't take this bill.","Could you change this twenty for me? I need smaller bills for the meter.","Do you have change for a twenty-dollar bill? I need to pay at the parking meter."],
    '自評時檢查是否說明找開鈔票的請求和停車咪錶的用途，而不是借錢。')
];
const steps=[
  {id:'native-262-v2-audio',style:'audio',label:'聽出請求',title:'不是借二十元',intro:'先聽英文，不看句子。',model:'Do you have change for a twenty?',zh:'你有零錢找開二十元嗎？',audioOnly:true,questions:['native-262-v2-audio']},
  {id:'native-262-v2-reverse',style:'reverse',label:'由目的找問句',title:'把大鈔找開',intro:'從現金需求選準確英文。',questions:['native-262-v2-reverse']},
  {id:'native-262-v2-tone',style:'tone',label:'櫃台語氣',title:'忙碌時禮貌開口',intro:'保留請求內容，也照顧對方正在工作。',questions:['native-262-v2-tone']},
  {id:'native-262-v2-continue',style:'continue',label:'接續對話',title:'店員答應以後',intro:'按對方回應自然把交易完成。',questions:['native-262-v2-continue']},
  {id:'native-262-v2-rewrite',style:'rewrite',label:'改寫訊息',title:'找開還是借錢？',intro:'讓朋友一看便知道你要換面額。',questions:['native-262-v2-rewrite','native-262-v2-rewrite-write']}
];
export default {revision:2,summary:'用 change for a twenty 問對方能否把 $20 紙幣找開，並分清換面額與借錢。',steps,questions,takeaways:['Do you have change for a twenty?'],completionTitle:'你能禮貌詢問找開大鈔，也能接續對方的回應。'};
