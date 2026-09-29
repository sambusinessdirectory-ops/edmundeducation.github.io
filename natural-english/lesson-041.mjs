import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'open',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-041-v2-scene','scene','朋友說剛才打了兩次電話，你完全沒聽見，因為手機設成靜音。怎樣解釋最貼切？',
    ["Sorry, my phone was on silent.","Sorry, my phone was out of battery.","Sorry, I was on the phone with you.","Sorry, I lost my phone."],
    "Sorry, my phone was on silent.",'靜音解釋了為何沒有聽到來電；沒電、遺失或正在與對方通話都是不同情況。'),
  mc('native-041-v2-audio','audio','只聽一句話。說話者手機當時有甚麼設定？',
    ['處於靜音模式。','已關機。','正在充電。','開了擴音。'],
    '處於靜音模式。','on silent 是手機設定為靜音；它不必然表示關機或沒有收到來電。'),
  mc('native-041-v2-detail','detail','朋友傳訊息問「你明明看見通知，為何沒有回？」你想解釋的事實只是手機靜音。哪項推論應避免？',
    ['靜音不能證明你是否看見或故意不回。','靜音必定會刪掉訊息。','靜音代表朋友打錯號碼。','靜音表示手機沒有螢幕。'],
    '靜音不能證明你是否看見或故意不回。','on silent 只說明聲音提示被關掉；它不能替你解釋所有未回覆的原因。'),
  mc('native-041-v2-branch','branch','同事急事曾打電話給你；你剛發現手機靜音。現在最有幫助的下一步是甚麼？',
    ["Sorry, my phone was on silent. Do you still need me?","My phone was on silent, so I never need to check it.","Please don't call anyone ever again.","I left the office yesterday."],
    "Sorry, my phone was on silent. Do you still need me?",'先解釋漏接，再問對方現在是否仍需要幫忙，讓對話向前走。'),
  blank('native-041-v2-continue','continue','朋友說 I called you earlier. 你因手機靜音漏接，但現在方便談。回一句包含解釋和邀請對方繼續說的英文。',
    ["Sorry, my phone was on silent. What's up?","Sorry, my phone was on silent. What did you need?","My phone was on silent. What did you need?","Sorry, my phone was in silent mode. What's up?"],
    '解釋漏接後，問對方為甚麼找你。',"My phone was on silent. 說明漏接原因；What's up? 或 What did you need? 讓對方接着說。")
];

const steps=[
  {id:'native-041-v2-scene',style:'scene',label:'漏接原因',title:'明明來電卻沒聽見',intro:'根據真實原因回答朋友。',questions:['native-041-v2-scene']},
  {id:'native-041-v2-audio',style:'audio',label:'聽出設定',title:'手機出了甚麼狀況？',intro:'先只聽聲音。',model:'My phone was on silent.',zh:'我的手機當時開了靜音。',audioOnly:true,questions:['native-041-v2-audio']},
  {id:'native-041-v2-detail',style:'detail',label:'避免推論',title:'靜音能解釋甚麼？',intro:'把事實和未經證實的推論分開。',questions:['native-041-v2-detail']},
  {id:'native-041-v2-branch',style:'branch',label:'急事跟進',title:'同事還需要你嗎？',intro:'漏接電話後，主動確認下一步。',questions:['native-041-v2-branch']},
  {id:'native-041-v2-continue',style:'continue',label:'接續通話',title:'現在可以談了',intro:'自己寫出解釋和自然反問。',questions:['native-041-v2-continue']}
];

export default {revision:2,summary:'用 on silent 說明漏接原因，不做過度推論，並在重新聯絡時接住對方需要。',steps,questions,takeaways:['My phone was on silent.','My phone was in silent mode.'],completionTitle:'你能清楚解釋漏接電話，並主動跟進對方的事了！'};
