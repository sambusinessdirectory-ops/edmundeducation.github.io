import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-089-v2-audio','audio','只聽這句請求。對方被請求做甚麼？',
    ['暫時替說話者拿著手上的東西。','去遠處找另一件東西。','立即把東西丟掉。','把東西送去修理。'],
    '暫時替說話者拿著手上的東西。','hold this for a second 是「幫我拿著這個一下」；重點是暫時保管或扶住眼前的東西。'),
  mc('native-089-v2-rewrite','rewrite','短訊原稿：Can you take this to your house? 其實你只想對方幫忙拿著飲料幾秒，方便你拿手機。怎樣改？',
    ['Can you hold this for a second?','Can you take this home forever?','Can you throw this out now?','Can you buy another one for me?'],
    'Can you hold this for a second?','hold this 清楚說暫時替你拿著；for a second 交代時間很短，沒有要求帶回家。'),
  mc('native-089-v2-tone','tone','你雙手拿滿袋子，想請陌生人短暫幫你扶著門。哪句較有禮又清楚？',
    ['Could you hold the door for a second, please?','You must work for me now.','Hold all my bags until tonight.','The door is entirely your problem.'],
    'Could you hold the door for a second, please?','Could you…please? 是有禮請求；hold the door 說明要扶住甚麼，for a second 也降低負擔。'),
  open('native-089-v2-final','final','最後挑戰：你手裡拿著一杯飲料，鞋帶鬆了。你想請朋友幫你拿著杯子一下，好讓你綁鞋帶。用兩句英文說明請求與原因。',
    ["Can you hold this for a second? I need to tie my shoe.","Could you hold my drink for a moment? My shoelace has come undone.","Can you hold this while I tie my shoelace? It will only take a second."],
    '用 hold 表示朋友暫時替你拿著眼前的東西，再把綁鞋帶的原因交代出來；不是要朋友去拿另一樣東西。')
];
const steps=[
  {id:'native-089-v2-audio',style:'audio',label:'先聽請求',title:'只需幾秒鐘',intro:'聽句子，再判斷對方需要做甚麼。',model:'Can you hold this for a second?',zh:'可以幫我拿著這個一下嗎？',audioOnly:true,questions:['native-089-v2-audio']},
  {id:'native-089-v2-rewrite',style:'rewrite',label:'改準動作',title:'不是叫朋友帶回家',intro:'把時間與動作說準。',questions:['native-089-v2-rewrite']},
  {id:'native-089-v2-speak',style:'speak',label:'當場開口',title:'雙手騰不開',intro:'先自己說；錄音或跳過後才聽示範。',model:'Can you hold this steady?',zh:'你能幫我扶穩這個嗎？',speakingPrompt:'你正在搬一個不穩的盒子，想請朋友暫時幫你扶穩。',recording:'phrase',questions:[]},
  {id:'native-089-v2-tone',style:'tone',label:'禮貌請求',title:'換成扶住門',intro:'同一個 hold，在不同對象上怎樣說。',questions:['native-089-v2-tone']},
  {id:'native-089-v2-final',style:'final',label:'鞋帶挑戰',title:'請朋友替你拿一下',intro:'新情境，說清請求和原因。',questions:['native-089-v2-final']}
];
export default {revision:2,summary:'用 hold this 請別人暫時拿著東西，並分清 hold steady 的「扶穩」。',steps,questions,takeaways:['Can you hold this for a second?','Can you hold this steady?'],completionTitle:'你能在雙手忙碌時清楚、禮貌地請人幫忙了！'};
