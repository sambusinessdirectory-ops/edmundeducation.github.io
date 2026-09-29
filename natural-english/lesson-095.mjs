import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-095-v2-audio','audio','只聽這個回應。它在別人輕輕撞到你並道歉後，通常是甚麼意思？',
    ['沒事，不用在意。','我現在很生氣。','請你再撞一次。','我不認識你。'],
    '沒事，不用在意。','You’re fine / No worries 在輕微意外後可表示不用放在心上；不是在要求對方再撞你。'),
  mc('native-095-v2-tone','tone','有人不小心擦到你的手臂，立即說 Sorry! 你沒受傷。哪句回應自然？',
    ["No worries. You're fine.","You ruined my life forever.","I demand a written apology.","Please do it again."],
    "No worries. You're fine.",'輕微碰撞且你確實沒事時，簡短安撫對方合適；若真的受傷，不必勉強說沒事。'),
  mc('native-095-v2-rewrite','rewrite','原稿：You are physically fine。你想說的是「我沒事，你不用擔心」，怎樣改得像自然回應？',
    ["It's okay. No worries.","You are medically perfect.","There was no collision in the universe.","You should be fined."],
    "It's okay. No worries.",'日常碰撞後回覆道歉，可用 It’s okay 或 No worries；不需分析對方身體狀態。'),
  open('native-095-v2-final','final','最後挑戰：走廊有人不小心輕輕撞到你，立刻道歉；你確實沒事，對方看起來很尷尬。用兩句英文安撫對方並表示你沒事。',
    ["No worries. I'm okay.","It's okay, you're fine. Don't worry about it.","No problem at all. I'm fine."],
    '根據自己確實沒事這個前提，用簡短的 No worries / It’s okay 安撫對方；不要把較嚴重情況一概說成沒事。')
];
const steps=[
  {id:'native-095-v2-audio',style:'audio',label:'聽出語氣',title:'一個小意外後',intro:'先聽常見的安撫回應。',model:'It’s okay.',zh:'沒關係。',audioOnly:true,questions:['native-095-v2-audio']},
  {id:'native-095-v2-tone',style:'tone',label:'拿捏分寸',title:'只是輕輕碰到',intro:'按意外程度選回應。',questions:['native-095-v2-tone']},
  {id:'native-095-v2-rewrite',style:'rewrite',label:'改成口語',title:'別逐字翻譯「你沒事」',intro:'把生硬說法改成真實對話。',questions:['native-095-v2-rewrite']},
  {id:'native-095-v2-speak',style:'speak',label:'即時口說',title:'有人向你道歉',intro:'先自己說；錄音或跳過後才聽示範。',model:'It’s okay.',zh:'沒關係。',speakingPrompt:'有人不小心碰到你並道歉；你沒有受傷。即時回應。',recording:'phrase',questions:[]},
  {id:'native-095-v2-final',style:'final',label:'走廊挑戰',title:'讓對方安心',intro:'自行用兩句自然英文作回應。',questions:['native-095-v2-final']}
];
export default {revision:2,summary:'在輕微碰撞後用 You’re fine、No worries 或 It’s okay 安撫道歉者。',steps,questions,takeaways:['You’re fine. / No worries.','It’s okay.'],completionTitle:'你能在小意外後自然回應道歉，也懂得按實際情況拿捏分寸。'};
