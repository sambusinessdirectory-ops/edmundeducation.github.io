import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-103-v2-audio','audio','只聽這句話。它最自然報告哪個進度？',
    ['終於到達目的地。','剛離開家門。','還有五分鐘才到。','打算明天才出發。'],
    '終於到達目的地。','I made it! 在這類見面情境是「我到了／我終於成功到達」，常帶一點鬆一口氣的語氣。'),
  mc('native-103-v2-scene','scene','你終於趕到朋友所在的餐廳門口，已看見店名。傳哪則訊息最準確？',
    ["I made it! I'm outside the restaurant.","I just left home.","I'm still five minutes away.","I haven't started coming yet."],
    "I made it! I'm outside the restaurant.",'已到門口便可說 I made it，再交代自己在外面；其他三句都把進度報慢了。'),
  mc('native-103-v2-detail','detail','I made it to the meeting on time 比 I made it! 多說了哪兩項資訊？',
    ['到的是會議，而且沒有遲到。','是誰安排會議，以及會議何時結束。','會議有多少人，以及誰主持。','說話者上班多久，以及今天有沒有吃飯。'],
    '到的是會議，而且沒有遲到。','to the meeting 指目的地或活動；on time 說按時到。'),
  mc('native-103-v2-continue','continue','你傳 I made it! 朋友回 Great! We’re inside。你要去找他，下一句最有用是甚麼？',
    ['Which table are you at?','Did I leave home yet?','Is this still yesterday?','Why did you make the building?'],
    'Which table are you at?','既已到達、朋友又在裡面，問桌號或所在位置最能幫你會合。'),
  mc('native-103-v2-transfer','transfer','除了赴約，哪個情境也可自然說 I made it!？',
    ['辛苦趕路後，終於到達山頂。','還未開始爬山，正在找鞋。','計劃明年才去那座山。','只是在家看到山的照片。'],
    '辛苦趕路後，終於到達山頂。','I made it! 可表達經過努力後到達或做到；與沒有開始的計劃不同。'),
  open('native-103-v2-writing','transfer','最後情境：你已到達朋友等待的戲院門口，但還未看見他。用兩句英文告訴他你到了，並問他在哪個位置。',
    ["I made it! I'm outside the cinema. Where are you?","I've made it to the cinema. Which entrance are you at?","I'm here at the cinema now. Where should I meet you?"],
    '到達後再問具體會合位置；I made it 表達已到，不再說自己只是在路上。')
];
const steps=[
  {id:'native-103-v2-audio',style:'audio',label:'聽出進度',title:'終於到了',intro:'先只聽一句話。',model:'I made it!',zh:'我到了！',audioOnly:true,questions:['native-103-v2-audio']},
  {id:'native-103-v2-scene',style:'scene',label:'門口報位',title:'已到餐廳外',intro:'把訊息與真實位置對上。',questions:['native-103-v2-scene']},
  {id:'native-103-v2-detail',style:'detail',label:'補齊細節',title:'到哪裡？準時嗎？',intro:'看完整句新增了甚麼資訊。',questions:['native-103-v2-detail']},
  {id:'native-103-v2-continue',style:'continue',label:'接著會合',title:'朋友在裡面',intro:'找出下一個需要確認的細節。',questions:['native-103-v2-continue']},
  {id:'native-103-v2-transfer',style:'transfer',label:'換個抵達點',title:'從戲院到山頂',intro:'先判斷另一種用法，再自己寫到達訊息。',questions:['native-103-v2-transfer','native-103-v2-writing']}
];
export default {revision:2,summary:'用 I made it! 報告自己已到達，並補上位置以便與對方會合。',steps,questions,takeaways:['I made it!','I made it to the meeting on time.'],completionTitle:'你能說清楚已經到了，並接著安排會合。'};
