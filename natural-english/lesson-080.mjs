import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-080-v2-audio','audio','只聽一個描述嘴唇的詞組。它比單純 dry 更可能包括甚麼？',
    ['乾到脫皮或裂開。','嘴唇被染成紅色。','剛喝完熱水。','嘴唇完全沒有感覺。'],
    '乾到脫皮或裂開。','chapped lips 指嘴唇乾燥、粗糙甚至裂開的狀態；dry lips 語氣可較輕。'),
  mc('native-080-v2-detail','detail','你想準確描述 chapped lips。哪項觀察最能支持這個用詞？',
    ['嘴唇乾燥，邊緣有細小裂紋。','嘴唇看來很有光澤。','嘴唇剛塗上顏色。','嘴角附近有一顆痣。'],
    '嘴唇乾燥，邊緣有細小裂紋。','chapped 強調因乾而粗糙或開裂，不是顏色或光澤。'),
  mc('native-080-v2-transfer','transfer','從嘴唇換到雙手：寒冷天氣令手背乾燥粗糙、裂開。哪句可自然沿用 chapped？',
    ['My hands are chapped.','My hands are mosquito bites.','My hands are sparkling.','My hands are on silent.'],
    'My hands are chapped.','chapped 也可形容乾裂的皮膚，例如雙手；不是只限嘴唇。'),
  open('native-080-v2-final','final','最後挑戰：天氣冷又乾，你的嘴唇開始脫皮、細細裂開。朋友問為何你要找潤唇膏。用兩句英文說明狀況和需要。',
    ["My lips are chapped. I need some lip balm.","My lips are really chapped, so I need lip balm.","My lips have gotten chapped in this dry weather. I need some lip balm."],
    '用 chapped 描述乾裂，比只說 dry 更貼合細小裂紋；再說明你要找潤唇膏。')
];

const steps=[
  {id:'native-080-v2-audio',style:'audio',label:'聽出程度',title:'不只是有點乾',intro:'先只聽描述。',model:'chapped lips',zh:'乾裂的嘴唇。',audioOnly:true,questions:['native-080-v2-audio']},
  {id:'native-080-v2-detail',style:'detail',label:'找出表徵',title:'甚麼情況叫 chapped？',intro:'連結用詞和看得到的狀況。',questions:['native-080-v2-detail']},
  {id:'native-080-v2-transfer',style:'transfer',label:'換到雙手',title:'手背也可能乾裂',intro:'把形容詞用到另一處皮膚。',questions:['native-080-v2-transfer']},
  {id:'native-080-v2-speak',style:'speak',label:'口頭描述',title:'告訴朋友嘴唇很乾',intro:'先自己說；錄音或跳過後才聽示範。',model:'My lips are dry.',zh:'我的嘴唇很乾。',speakingPrompt:'朋友問：Why do you need lip balm? 你嘴唇乾了。',recording:'phrase',questions:[]},
  {id:'native-080-v2-final',style:'final',label:'冬天挑戰',title:'乾到開始裂開',intro:'新情境，自己說明程度和需要。',questions:['native-080-v2-final']}
];

export default {revision:2,summary:'分清 dry lips 和 chapped lips 的程度，並把 chapped 用於其他乾裂皮膚。',steps,questions,takeaways:['chapped lips','My lips are dry.'],completionTitle:'你能準確描述嘴唇乾裂，也能說明為何要找潤唇膏了！'};
