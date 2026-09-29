import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-109-v2-audio','audio','只聽這句話。說話者昨晚的睡眠如何？',
    ['一直翻身，睡得不安穩。','很快熟睡到天亮。','整晚刻意工作不睡。','只睡了一個短午覺。'],
    '一直翻身，睡得不安穩。','tossed and turned all night 指在床上翻來覆去，難以安睡；與故意熬夜工作不同。'),
  mc('native-109-v2-explain','explain','I tossed and turned all night 與 I pulled an all-nighter 在原因上可能有甚麼差別？',
    ['前者想睡卻難睡；後者通常指整晚沒睡、例如為了工作或讀書。','前者保證睡得很好；後者只指午睡。','兩句都只說去健身房。','兩句都表示白天沒有出門。'],
    '前者想睡卻難睡；後者通常指整晚沒睡、例如為了工作或讀書。','這課的翻來覆去是難以入睡；all-nighter 常說主動熬夜做事。'),
  mc('native-109-v2-branch','branch','朋友說 I tossed and turned all night。你想關心他，哪句較貼切？',
    ["That sounds rough. Are you feeling okay today?","Great, you must feel fully rested!","Why didn't you finish more work?","I hope you kept running all night."],
    "That sounds rough. Are you feeling okay today?",'先承認他睡得辛苦，再關心今天的狀態；不要把失眠當成休息充足。'),
  mc('native-109-v2-continue','continue','朋友問 Did you sleep okay? 你說 Not really. I tossed and turned all night。若想補充具體感受，哪句自然？',
    ["I just couldn't get comfortable.","I slept deeply without waking once.","I was wide awake at work all night.","I took a great nap yesterday afternoon."],
    "I just couldn't get comfortable.",'翻來覆去常與找不到舒服姿勢或難以安睡連在一起；其餘句子改變了昨晚情況。'),
  open('native-109-v2-final','final','最後挑戰：昨晚你想睡卻一直在床上翻來覆去，今天同事看你很疲倦，問 Did you sleep? 用兩句英文說出昨晚發生甚麼，並交代今天的感覺。',
    ["Not really. I tossed and turned all night, so I'm tired today.","I tried to sleep, but I tossed and turned all night. I'm exhausted now.","Barely. I couldn't get comfortable and tossed and turned all night."],
    '說出你有嘗試睡、但一直翻來覆去；別把這個情境說成刻意通宵工作。')
];
const steps=[
  {id:'native-109-v2-audio',style:'audio',label:'聽出睡況',title:'夜裡一直翻身',intro:'先只聽一個描述。',model:'I tossed and turned all night.',zh:'我整晚翻來覆去。',audioOnly:true,questions:['native-109-v2-audio']},
  {id:'native-109-v2-explain',style:'explain',label:'對照熬夜',title:'睡不著與不去睡',intro:'分辨兩種都會令人疲倦的夜晚。',questions:['native-109-v2-explain']},
  {id:'native-109-v2-branch',style:'branch',label:'朋友關心',title:'先承認他睡得辛苦',intro:'選一句有分寸的回應。',questions:['native-109-v2-branch']},
  {id:'native-109-v2-speak',style:'speak',label:'口頭補充',title:'怎樣躺都不舒服',intro:'先自己說；錄音或跳過後才聽示範。',model:'I couldn’t get comfortable.',zh:'我怎樣躺都不舒服。',speakingPrompt:'朋友問為何你在床上翻來覆去。你一直找不到舒服姿勢。',recording:'phrase',questions:[]},
  {id:'native-109-v2-continue',style:'continue',label:'接續說明',title:'昨晚到底怎樣了？',intro:'補上更具體的睡眠感受。',questions:['native-109-v2-continue']},
  {id:'native-109-v2-final',style:'final',label:'早晨挑戰',title:'回答疲倦的原因',intro:'新情境，自己說明昨晚和今天。',questions:['native-109-v2-final']}
];
export default {revision:2,summary:'用 tossed and turned all night 說明整晚翻來覆去，與刻意熬夜作區分。',steps,questions,takeaways:['I tossed and turned all night.','I couldn’t get comfortable.'],completionTitle:'你能具體說明睡不安穩，也能讓朋友明白今天為何疲倦。'};
