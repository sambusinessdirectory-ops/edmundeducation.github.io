import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-294-v2-audio','audio','聽完這句聲音描述，說話者最可能怎樣？',['仍能說話，但嗓音粗啞。','完全發不出任何聲音。','耳朵裏一直有鈴聲。','麥克風音量太小。'],'仍能說話，但嗓音粗啞。','hoarse 指可說話但聲音變沙啞；與完全失聲的 lost my voice 不同。'),
  mc('native-294-v2-contrast','contrast','你感冒後仍能完整回答問題，只是聲音低沉沙沙的。哪句更準確？',["My voice is hoarse.","I've lost my voice.","My ears are plugged.","My mic is muted."],"My voice is hoarse.",'仍能說清句子，重點是聲音質地粗啞；lost my voice 會說得太重。'),
  mc('native-294-v2-repair','repair','朋友問你怎樣了，你原本說「I can’t speak」，但事實是你可以說，只是沙啞。怎樣修正？',["My voice is hoarse from my cold.","I can't make any sound at all.","My hearing is gone.","The phone is disconnected."],"My voice is hoarse from my cold.",'修正後保留感冒背景，也把問題限定在嗓音變沙啞。'),
  mc('native-294-v2-rewrite','rewrite','你要告訴老師今天聲音不太好，但仍可簡短發言。哪句訊息準確？',["My voice is a little hoarse, but I can still answer briefly.","I have no voice and can't say one word.","My microphone broke, so I can't hear.","My throat is perfectly normal."],"My voice is a little hoarse, but I can still answer briefly.",'訊息同時說明沙啞程度和仍可發言，方便老師安排。'),
  open('native-294-v2-final','final','新情境：你感冒後聲音變沙啞，但仍能談話。朋友聽到你聲音不一樣，問你是否好些。寫兩句英文回答聲音狀況和身體感覺。',["My voice is still hoarse from the cold. I feel much better otherwise.","I'm feeling better, but my voice is still a little hoarse. It may take another day to recover.","The cold is almost gone. My voice is still rough and hoarse, though."],'自評時看是否說明仍可說話但聲音沙啞，以及整體感覺如何。')
];
const steps=[
  {id:'native-294-v2-audio',style:'audio',label:'聽出嗓音',title:'說話仍清楚嗎？',intro:'聽聲音粗啞時，說話者是否仍能發聲。',model:'My voice is hoarse.',zh:'我的聲音沙啞。',audioOnly:true,questions:['native-294-v2-audio']},
  {id:'native-294-v2-contrast',style:'contrast',label:'對照失聲',title:'還可以回答問題',intro:'按能否發聲判斷程度。',questions:['native-294-v2-contrast']},
  {id:'native-294-v2-repair',style:'repair',label:'修正誇大',title:'不是完全不能說',intro:'用更準確的程度描述。',questions:['native-294-v2-repair']},
  {id:'native-294-v2-rewrite',style:'rewrite',label:'寫給老師',title:'交代可否發言',intro:'在訊息中說明聲音與能力。',questions:['native-294-v2-rewrite']},
  {id:'native-294-v2-final',style:'final',label:'朋友關心',title:'說明沙啞和近況',intro:'說明聲音仍粗啞，但身體其他方面如何。',questions:['native-294-v2-final']}
];
export default {revision:2,summary:'用 hoarse 形容感冒後仍能說話但聲音粗啞，與失聲區分。',steps,questions,takeaways:['My voice is hoarse.'],completionTitle:'你能清楚交代沙啞程度和身體近況。'};
