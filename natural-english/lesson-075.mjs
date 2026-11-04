import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-075-v2-audio','audio','只聽一句近況回答。說話者更可能處於哪種狀況？',
    ['最近有些辛苦，但還在撐。','一切好得不能再好。','完全沒有任何困難。','已經決定不再說話。'],
    '最近有些辛苦，但還在撐。',"I'm hanging in there. 常帶有「不容易，但我還撐得住」的意味，比 Can't complain. 更透露壓力。"),
  mc('native-075-v2-detail','detail','朋友說 I’m hanging in there. Work’s been pretty stressful.。哪個細節說明他不是單純「還不錯」？',
    ['工作壓力大。','他提到了工作這個字。','他用了縮寫 I’m。','他沒有說今天星期幾。'],
    '工作壓力大。','後句明確交代壓力來源；hanging in there 在這裏是勉強支撐，不是歡欣的近況。'),
  mc('native-075-v2-branch','branch','同事說 I’m hanging in there. 你想表示關心，哪句較能給對方自主空間？',
    ["Sounds like it's been tough. Want to talk about it?","Great! So everything is perfect.","Stop feeling stressed immediately.","I'm sure nothing is wrong."],
    "Sounds like it's been tough. Want to talk about it?",'承認對方可能辛苦，再問他願不願意談；不強迫也不否定。'),
  open('native-075-v2-transfer','transfer','換到你自己：工作這週很忙，進度有點吃力，但仍然應付到。朋友問 How are things? 用一句自然英文回答近況。',
    ["I'm hanging in there. Work's been busy.","I'm hanging in there—it's been a tough week at work.","It's been busy, but I'm hanging in there."],
    '用 hanging in there 承認不容易，再補上具體原因；不要說成完全沒事或已放棄。')
];

const steps=[
  {id:'native-075-v2-audio',style:'audio',label:'聽出分寸',title:'還撐得住，但不輕鬆',intro:'先只聽近況回答。',model:'I’m hanging in there.',zh:'有點難，但我還撐得住。',audioOnly:true,questions:['native-075-v2-audio']},
  {id:'native-075-v2-detail',style:'detail',label:'找壓力線索',title:'工作最近很吃力',intro:'從後一句讀出真正程度。',questions:['native-075-v2-detail']},
  {id:'native-075-v2-branch',style:'branch',label:'關心朋友',title:'不要硬說「一切都好」',intro:'接住對方透露的辛苦。',questions:['native-075-v2-branch']},
  {id:'native-075-v2-speak',style:'speak',label:'自己回應',title:'朋友問你最近怎樣',intro:'先自己說；錄音或跳過後才聽示範。',model:'I’m hanging in there.',zh:'我還撐得住。',speakingPrompt:'朋友：How have you been? 最近事情不容易，但你仍然應付着。',recording:'phrase',questions:[]},
  {id:'native-075-v2-transfer',style:'transfer',label:'換成自己',title:'加上一句真實原因',intro:'自己寫近況，不只是背一個片語。',questions:['native-075-v2-transfer']}
];

export default {revision:2,summary:'用 hanging in there 表達處境不輕鬆但仍在撐，並在聽到別人這樣說時給予合適關心。',steps,questions,takeaways:['I’m hanging in there.','Hang in there!'],completionTitle:'你能分辨勉強撐住的語氣，也能恰當回應朋友了！'};
