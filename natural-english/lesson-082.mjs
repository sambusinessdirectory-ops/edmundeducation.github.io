import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-082-v2-audio','audio','只聽這個詞組。它比較像哪種感覺？',
    ['被壓住後一陣麻麻刺刺。','突然一陣劇烈灼熱。','肌肉一直痠痛。','皮膚表面有一塊瘀青。'],
    '被壓住後一陣麻麻刺刺。','pins and needles 常說手腳被壓一段時間後，像小針刺的麻感；不等於痛、燙或瘀青。'),
  mc('native-082-v2-scene','scene','你坐姿不變太久，腳恢復知覺時一陣陣刺麻。朋友問 Why are you walking funny? 哪句最切合？',
    ["I've got pins and needles in my foot.","My foot is bleeding badly.","I've got a mosquito bite on my foot.","My foot is soaking wet."],
    "I've got pins and needles in my foot.",'說出 pins and needles 能準確交代刺麻感；其他句子都把感覺換成了不同的問題。'),
  mc('native-082-v2-reverse','reverse','聽到 My foot is numb。下列哪個中文描述較貼近，且沒有自行加上「刺痛」？',
    ['我的腳麻了，感覺變鈍。','我的腳正在抽筋。','我的腳被針刺穿。','我的腳燙傷了。'],
    '我的腳麻了，感覺變鈍。','numb 強調感覺變少或沒有感覺；pins and needles 則較明確是刺刺麻麻。'),
  mc('native-082-v2-repair','repair','有人把 pins and needles 理解成「我腳上真的有針」。你怎樣修正，最能幫他掌握日常用法？',
    ['這是形容刺麻感，不一定有真正的針。','這只用來說縫衣針掉在地上。','這只形容被蚊咬後的痕。','這跟 numb 完全一樣，沒有程度差別。'],
    '這是形容刺麻感，不一定有真正的針。','這是感覺的形象說法；有時也和 numb 一起出現，但兩者側重不同。'),
  open('native-082-v2-final','final','最後挑戰：你盤腿坐了很久，站起來時右腳一陣刺麻。朋友問你怎麼了。用兩句英文交代感覺和可能原因。',
    ["I've got pins and needles in my right foot. I was sitting on it for too long.","My right foot has pins and needles. I think I sat on it too long.","My foot feels numb and tingly. I was sitting on it for ages."],
    'pins and needles 指刺麻感；若改用 numb and tingly，也要把感覺說清楚。再交代久坐的原因，而不是只抄詞組。')
];
const steps=[
  {id:'native-082-v2-audio',style:'audio',label:'先辨感覺',title:'像許多小針在刺',intro:'先聽詞組，再判斷身體感受。',model:'pins and needles',zh:'麻麻刺刺的感覺。',audioOnly:true,questions:['native-082-v2-audio']},
  {id:'native-082-v2-scene',style:'scene',label:'起身的一刻',title:'腳麻得走路怪怪的',intro:'把感覺放回真實對話。',questions:['native-082-v2-scene']},
  {id:'native-082-v2-reverse',style:'reverse',label:'反向理解',title:'numb 著重甚麼？',intro:'避免把兩個相近描述說成完全一樣。',questions:['native-082-v2-reverse']},
  {id:'native-082-v2-repair',style:'repair',label:'修正誤讀',title:'沒有真的被針刺',intro:'辨認詞組的比喻意思。',questions:['native-082-v2-repair']},
  {id:'native-082-v2-final',style:'final',label:'久坐挑戰',title:'說出感覺，也說出原因',intro:'新情境，不給選項或示範。',questions:['native-082-v2-final']}
];
export default {revision:2,summary:'用 pins and needles 形容刺麻，並分清 numb 偏重感覺變鈍。',steps,questions,takeaways:['pins and needles','My foot is numb.'],completionTitle:'你能說明久坐後的刺麻，也能分清 numb 的側重。'};
