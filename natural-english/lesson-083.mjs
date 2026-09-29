import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-083-v2-audio','audio','只聽這句話。說話者的腿發生甚麼事？',
    ['坐久或壓住後暫時麻掉。','睡覺時突然踢被子。','跌倒後骨折。','跑步後感到很餓。'],
    '坐久或壓住後暫時麻掉。','My leg fell asleep 是日常說法，指腿暫時麻掉；這裡的 asleep 不是腿真的睡覺。'),
  mc('native-083-v2-contrast','contrast','朋友說 My leg fell asleep。哪個說法聚焦在「開始恢復感覺時麻麻刺刺」，而不只是「腿麻了」？',
    ['I have pins and needles in my leg.','I lost my leg.','I have a stiff neck.','I have a sore throat.'],
    'I have pins and needles in my leg.','fell asleep 說腿麻掉；pins and needles 把其後刺麻的感覺說得更具體。'),
  mc('native-083-v2-rewrite','rewrite','短訊原稿：My leg is sleeping, so I need a moment. 想說「坐到腿麻」，怎樣改得自然又不改變意思？',
    ['My leg fell asleep, so give me a moment.','My leg went to bed, so give me a moment.','My leg is sleepy, so give me a moment.','My leg stayed awake, so give me a moment.'],
    'My leg fell asleep, so give me a moment.','固定說法是 My leg fell asleep；其他寫法把腿當成真的要睡或醒著。'),
  open('native-083-v2-final','final','最後挑戰：你在地上坐著整理東西，起來後一條腿麻掉，走路有點怪。朋友問 What happened? 用兩句英文回答，說明腿的狀態和原因。',
    ["My leg fell asleep. I was sitting on it for too long.","My leg's gone numb because I was sitting on it.","I was sitting on my leg, and it fell asleep. Give me a second."],
    'fell asleep 是腿暫時麻掉的慣用說法；也可說 gone numb。補上坐姿或久坐的原因，讓回答完整。')
];
const steps=[
  {id:'native-083-v2-audio',style:'audio',label:'聽懂比喻',title:'腿不是真的睡著',intro:'先聽一句日常說法。',model:'My leg fell asleep.',zh:'我的腿坐到麻掉了。',audioOnly:true,questions:['native-083-v2-audio']},
  {id:'native-083-v2-contrast',style:'contrast',label:'比較感覺',title:'麻掉與刺麻',intro:'從相近表達中找出不同的側重。',questions:['native-083-v2-contrast']},
  {id:'native-083-v2-rewrite',style:'rewrite',label:'改好短訊',title:'別把腿當成真的會睡覺',intro:'把意思保留，改成自然英文。',questions:['native-083-v2-rewrite']},
  {id:'native-083-v2-speak',style:'speak',label:'即時說明',title:'站起來才發現腿麻',intro:'先自己說；錄音或跳過後才聽示範。',model:'I have pins and needles in my leg.',zh:'我的腿有麻麻刺刺的感覺。',speakingPrompt:'你坐得太久，腿恢復感覺時刺麻。向朋友說出現在的感覺。',recording:'phrase',questions:[]},
  {id:'native-083-v2-final',style:'final',label:'地板上挑戰',title:'怎樣解釋走路怪怪的？',intro:'新情境，自己交代狀態和原因。',questions:['native-083-v2-final']}
];
export default {revision:2,summary:'理解 My leg fell asleep 的比喻，並在需要時用 pins and needles 說出刺麻感。',steps,questions,takeaways:['My leg fell asleep.','I have pins and needles in my leg.'],completionTitle:'你能自然解釋腿坐麻，並區分刺麻的感覺了！'};
