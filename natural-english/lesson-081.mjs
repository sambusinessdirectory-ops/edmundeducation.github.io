import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-081-v2-audio','audio','只聽對方說剛跑完的狀態。他最需要甚麼？',
    ['停下來喘口氣。','找遺失的鞋。','吃一頓大餐。','再跑快一點。'],
    '停下來喘口氣。','out of breath 說的是暫時喘不過氣，接著停一停、調整呼吸很自然；它本身沒有說明其他需要。'),
  mc('native-081-v2-transfer','transfer','你沒有跑步，只是提著重行李爬到五樓。現在說話要先喘一下。哪句同樣適用？',
    ["I'm out of breath.","I'm out of luck.","I'm out of town.","I'm out of time."],
    "I'm out of breath.",'out of breath 可以是爬樓梯後的狀態，不限於跑步；其餘三句分別談運氣、所在地和時間。'),
  mc('native-081-v2-explain','explain','朋友剛跑到你面前，說 I’m winded。你怎樣理解，才不會誤以為他在談天氣？',
    ['他跑得有點喘，想緩一緩。','他說今天風勢很大。','他正在找擋風外套。','他已經完全恢復體力。'],
    '他跑得有點喘，想緩一緩。','winded 在這個身體狀態情境是「喘了、氣被耗掉了」，不是 windy 的「有風」。'),
  mc('native-081-v2-continue','continue','對方跑完說 I’m out of breath。你最自然怎樣接話？',
    ['Take a second. We can walk from here.','Then sprint up the next hill now.','So you must have lost your voice forever.','Then the weather forecast is wrong.'],
    'Take a second. We can walk from here.','先讓對方喘口氣，並放慢接下來的步速，回應了他眼前的狀態。'),
  open('native-081-v2-final','final','最後挑戰：你剛提著行李爬完四層樓，朋友問 Are you okay? 寫兩句自然回答：說出現在的狀態，並請對方等你一下。',
    ["I'm okay, just out of breath. Give me a second.","Yeah, I'm a little winded. Can you give me a second?","I'm out of breath from the stairs. Let me catch my breath."],
    '用 out of breath 或 winded 描述剛做完活動的喘；再接一個短暫停頓的請求，比只重複詞組更像真實對話。')
];
const steps=[
  {id:'native-081-v2-audio',style:'audio',label:'聽出狀態',title:'跑完後先喘一下',intro:'先只聽一句話，再判斷當下需要。',model:'I’m out of breath.',zh:'我喘得很。',audioOnly:true,questions:['native-081-v2-audio']},
  {id:'native-081-v2-transfer',style:'transfer',label:'換一個原因',title:'爬樓梯也會喘',intro:'把同一個狀態搬到沒有跑步的情境。',questions:['native-081-v2-transfer']},
  {id:'native-081-v2-explain',style:'explain',label:'拆開誤會',title:'winded 不是 windy',intro:'用上下文判斷身體狀態。',questions:['native-081-v2-explain']},
  {id:'native-081-v2-continue',style:'continue',label:'接住對方',title:'怎樣回應剛跑完的人？',intro:'練習有分寸的下一句。',questions:['native-081-v2-continue']},
  {id:'native-081-v2-final',style:'final',label:'樓梯口挑戰',title:'喘著把話說完',intro:'新情境，不給選項或示範。',questions:['native-081-v2-final']}
];
export default {revision:2,summary:'分清 out of breath 與 winded，並在跑步或爬樓梯後自然說明自己需要喘口氣。',steps,questions,takeaways:['I’m out of breath.','I’m winded.'],completionTitle:'你能說清楚剛運動後的喘，也能自然請朋友等一下。'};
