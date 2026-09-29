import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-118-v2-audio','audio','只聽這個指示。對方應把窗戶留在甚麼位置？',['留一條小縫。','完全關緊。','整扇推到最開。','窗玻璃本身出現裂痕。'],'留一條小縫。','leave it cracked 在窗戶語境是留一道縫；沒有叫人弄破玻璃。'),
  mc('native-118-v2-detail','detail','朋友問 Is this enough? 哪個動作才符合剛才的要求？',['把窗戶打開幾厘米。','把窗戶完全鎖緊。','把整扇窗推到底。','把窗簾拉開一點。'],'把窗戶打開幾厘米。','cracked open 只表示微開，讓少量空氣進來。'),
  mc('native-118-v2-repair','repair','房間太悶，你想叫朋友把窗微開；他以為窗玻璃裂了。怎樣澄清？',["I mean leave it open just a little.","I mean the pane has a small crack.","I mean close it all the way.","I mean open it halfway."],"I mean leave it open just a little.",'leave the window cracked 在此是微開；the window is cracked 才可能指玻璃有裂紋。'),
  mc('native-118-v2-continue','continue','你說了指示，對方問 Just a little? 你想維持小縫，哪句自然？',["Yes, just enough to let some air in.","No, open it as wide as possible.","No, seal it completely.","Yes, the pane is already cracked."],"Yes, just enough to let some air in.",'用 let some air in 指出微開的目的，讓程度更清楚。'),
  mc('native-118-v2-branch','branch','夜晚想通風，但外面很冷。朋友手放在窗把上問 Close it? 你應怎樣接？',["Leave it cracked, please—just a small gap.","Open it all the way so it gets cold.","Open it halfway so more air comes in.","Yes, lock it completely shut."],"Leave it cracked, please—just a small gap.",'small gap 消除了「開很大」的誤會，也符合想稍微通風。'),
  open('native-118-v2-final','final','最後挑戰：你睡前想讓臥室有一點新鮮空氣，但不想冷風吹進太多。室友問要不要把窗關上。寫兩句英文指示和解釋。',["Leave the window cracked, please. Just a little fresh air would be nice.","Could you leave it open just a crack? I don't want the room to get too cold."],'說明微開的幅度和通風原因；cracked 在這個指示中不是玻璃受損。')
];
const steps=[
  {id:'native-118-v2-audio',style:'audio',label:'先聽指示',title:'窗戶留在哪裡？',intro:'只聽，不先看英文。',model:'Leave the window cracked.',zh:'讓窗戶留一條小縫。',audioOnly:true,questions:['native-118-v2-audio']},
  {id:'native-118-v2-detail',style:'detail',label:'看出幅度',title:'幾厘米就夠',intro:'把用詞連到窗戶的位置。',questions:['native-118-v2-detail']},
  {id:'native-118-v2-repair',style:'repair',label:'澄清誤會',title:'不是玻璃裂了',intro:'同一個 cracked 在不同句子裡可能指不同事。',questions:['native-118-v2-repair']},
  {id:'native-118-v2-continue',style:'continue',label:'回答追問',title:'Just a little?',intro:'對方確認開窗幅度。',questions:['native-118-v2-continue']},
  {id:'native-118-v2-branch',style:'branch',label:'睡前選擇',title:'通風又不太冷',intro:'接住室友的問題。',questions:['native-118-v2-branch']},
  {id:'native-118-v2-final',style:'final',label:'臥室挑戰',title:'說明小縫的原因',intro:'自己寫清楚指示和理由。',questions:['native-118-v2-final']}
];
export default {revision:2,summary:'用 leave the window cracked 要求窗戶微開，並分清玻璃本身裂開的意思。',steps,questions,takeaways:['Leave the window cracked.','The window is cracked.'],completionTitle:'你能清楚請人把窗戶留一條小縫。'};
