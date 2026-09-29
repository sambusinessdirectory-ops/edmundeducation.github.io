import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-037-v2-scene','scene','你正在開會，朋友打來。你不能現在談，但十分鐘後可以。哪句清楚交代下一步？',
    ["I'm in a meeting. I'll call you back in ten minutes.","I'm in a meeting. Call me right now.","I called you yesterday.","I don't have your number."],
    "I'm in a meeting. I'll call you back in ten minutes.",'說明現在不能接聽，再承諾何時回電；比只說 busy 更能讓朋友安心等候。'),
  mc('native-037-v2-audio','audio','只聽一句話。說話者打算由誰發起下一通電話？',
    ['由說話者稍後打給對方。','由對方立即再打一次。','由第三個人代為聯絡。','兩人改用電郵。'],
    '由說話者稍後打給對方。',"I'll call you back. 中的 I'll 表示說話者自己稍後回電。"),
  mc('native-037-v2-contrast','contrast','朋友說 I’ll call you back.，和 Please call me back. 的責任有何不同？',
    ['前句承諾自己回電；後句請對方回電。','兩句都請對方回電。','兩句都表示不再聯絡。','前句是傳訊息；後句是寄電郵。'],
    '前句承諾自己回電；後句請對方回電。','留意 I’ll 和 Please：主語或請求對象一變，下一個行動的人就不同。'),
  blank('native-037-v2-reverse','reverse','你漏接媽媽電話，現在要傳短訊承諾下班後由你回電。寫一句自然英文。',
    ["I'll call you back after work.","I will call you back after work.","I'll call back after work.","I'll call you after work."],
    '由你主動打回去，說明時間。',"I'll call you back after work. 把回電的人和時間都說清楚。")
];

const steps=[
  {id:'native-037-v2-scene',style:'scene',label:'開會中',title:'現在不方便接',intro:'讓朋友知道你會怎樣跟進。',questions:['native-037-v2-scene']},
  {id:'native-037-v2-audio',style:'audio',label:'聽清誰打',title:'誰會打下一通電話？',intro:'先只聽聲音，判斷行動的人。',model:'I’ll call you back.',zh:'我會回電給你。',audioOnly:true,questions:['native-037-v2-audio']},
  {id:'native-037-v2-contrast',style:'contrast',label:'分清主動者',title:'I’ll 還是 Please？',intro:'同樣是回電，主動者可以相反。',questions:['native-037-v2-contrast']},
  {id:'native-037-v2-speak',style:'speak',label:'即時答覆',title:'要走進會議室了',intro:'錄音或跳過後才看示範。',model:'I’ll call you back.',zh:'我會回電給你。',speakingPrompt:'電話另一端：Hey, can we talk? 你正要開會，稍後會由你回電。',recording:'phrase',questions:[]},
  {id:'native-037-v2-reverse',style:'reverse',label:'漏接後訊息',title:'下班後打給媽媽',intro:'把已學說法用到新的時間安排。',questions:['native-037-v2-reverse']}
];

export default {revision:2,summary:'分清誰負責回電，並在忙碌或漏接電話時說明何時再聯絡。',steps,questions,takeaways:['call back','I’ll call you back.'],completionTitle:'你能自然承諾回電，並把時間說清楚了！'};
