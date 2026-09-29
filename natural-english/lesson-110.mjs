import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-110-v2-audio','audio','只聽這句話。說話者昨晚最可能怎樣？',
    ['為了做事整晚沒睡。','躺在床上翻來覆去。','提早睡了整夜。','只比平時晚睡十分鐘。'],
    '為了做事整晚沒睡。','pulled an all-nighter 常指為了工作、讀書等通宵不睡；不是一般睡得不安穩。'),
  mc('native-110-v2-scene','scene','你為了趕在早上交出報告，一整夜都坐在電腦前工作。哪句最準確？',
    ["I pulled an all-nighter finishing the report.","I tossed and turned all night in bed.","I took a power nap after lunch.","I went to bed early and slept well."],
    "I pulled an all-nighter finishing the report.",'這裡是刻意通宵工作；tossed and turned 是想睡卻睡不安穩，情境不同。'),
  mc('native-110-v2-repair','repair','你整晚在床上想睡卻睡不著，卻說 I pulled an all-nighter。哪個改法更貼合經過？',
    ['I tossed and turned all night.','I stayed up working on a report.','I chose to study until sunrise.','I worked a night shift.'],
    'I tossed and turned all night.','這裡的重點是睡不安穩，不是為了工作、讀書或夜班主動不睡。'),
  mc('native-110-v2-branch','branch','同事說 I pulled an all-nighter finishing the project。你想了解他是否真的整夜沒睡，哪句追問自然？',
    ["You didn't sleep at all?","Did you have a nice long nap?","What time did you wake up from your full night's sleep?","Were you at the beach instead?"],
    "You didn't sleep at all?",'這句直接確認 all-nighter 的程度；其他選項把已知情境改成別的睡眠或活動。'),
  open('native-110-v2-final','final','最後挑戰：你為了準備今天的考試，昨晚整晚讀書，完全沒睡。朋友看到你疲倦，問 Rough night? 用兩句英文交代自己做了甚麼，並說明今天的狀態。',
    ["Yeah, I pulled an all-nighter studying for today's exam. I'm exhausted now.","I stayed up all night for the exam. I didn't sleep at all, so I'm really tired.","I pulled an all-nighter preparing for the test. I could use some rest."],
    '這個情境是為準備考試主動整夜不睡；用 all-nighter 說準經過，再接今天疲倦的後果。')
];
const steps=[
  {id:'native-110-v2-audio',style:'audio',label:'聽出夜晚',title:'一夜沒睡',intro:'先只聽一句話。',model:'I pulled an all-nighter.',zh:'我熬了一整晚沒睡。',audioOnly:true,questions:['native-110-v2-audio']},
  {id:'native-110-v2-scene',style:'scene',label:'趕交報告',title:'通宵工作的夜晚',intro:'把說法配到具體原因。',questions:['native-110-v2-scene']},
  {id:'native-110-v2-repair',style:'repair',label:'修正混淆',title:'只是睡不著時',intro:'對照上一課的翻來覆去。',questions:['native-110-v2-repair']},
  {id:'native-110-v2-speak',style:'speak',label:'即時口說',title:'同事問你昨晚怎樣',intro:'先自己說；錄音或跳過後才聽示範。',model:'I pulled an all-nighter.',zh:'我整晚沒睡。',speakingPrompt:'你為了做報告整晚沒睡。同事問你昨晚怎樣，先自己回答。',recording:'phrase',questions:[]},
  {id:'native-110-v2-branch',style:'branch',label:'聽後追問',title:'真的一刻沒睡？',intro:'把對話接下去。',questions:['native-110-v2-branch']},
  {id:'native-110-v2-final',style:'final',label:'考試挑戰',title:'說清楚疲倦從哪來',intro:'自己說明原因及今天的狀態。',questions:['native-110-v2-final']}
];
export default {revision:2,summary:'用 pulled an all-nighter 說為了工作或學習整晚沒睡，與想睡卻翻來覆去區分。',steps,questions,takeaways:['I pulled an all-nighter.','I tossed and turned all night.'],completionTitle:'你能分清主動通宵與睡不安穩，也能交代原因。'};
