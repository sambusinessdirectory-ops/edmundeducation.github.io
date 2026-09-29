import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-178-v2-audio','audio','只聽藥後狀態。說話者最可能感到甚麼？',['眼皮重、想睡、精神不集中。','突然非常興奮清醒。','只是有點放鬆，但仍精神集中。','肌肉酸痛而想休息。'],'眼皮重、想睡、精神不集中。','drowsy 指昏昏欲睡，常見於某些藥物作用或疲勞。'),
  mc('native-178-v2-reverse','reverse','藥盒上提醒「可能令人昏昏欲睡」。英文標籤最可能寫甚麼？',["May cause drowsiness.","May cause dizziness.","May cause dry mouth.","May cause fatigue."],"May cause drowsiness.",'drowsiness 是 drowsy 的名詞，指嗜睡或昏沉狀態。'),
  mc('native-178-v2-contrast','contrast','朋友吃藥後還能說話，但眼皮很重、反應變慢。哪個詞比「完全昏倒」準確？',["drowsy","unconscious","energized","asleep"],"drowsy",'drowsy 是仍清醒卻很想睡；unconscious 是失去意識，程度完全不同。'),
  open('native-178-v2-final','final','最後挑戰：你剛吃了藥，現在眼皮很重、注意力難集中。朋友問你能否一起看電影。寫兩句英文描述狀態並說明你想先休息。',["I feel a little drowsy after taking the medicine. I'd rather rest first and watch the movie later.","The medicine is making me drowsy. Can we watch the film after I've rested?"],'用 drowsy 說明昏沉想睡的感覺，再提出休息或延後安排；不把它說成失去意識。')
];
const steps=[
  {id:'native-178-v2-audio',style:'audio',label:'先聽狀態',title:'吃藥後想睡',intro:'只聽一個形容詞。',model:'drowsy',zh:'昏昏欲睡。',audioOnly:true,questions:['native-178-v2-audio']},
  {id:'native-178-v2-reverse',style:'reverse',label:'讀藥盒',title:'可能令人昏沉',intro:'把形容詞連到名詞警示。',questions:['native-178-v2-reverse']},
  {id:'native-178-v2-contrast',style:'contrast',label:'看程度',title:'想睡不是昏倒',intro:'分清兩種不同程度。',questions:['native-178-v2-contrast']},
  {id:'native-178-v2-speak',style:'speak',label:'口頭讀提醒',title:'藥盒上的一行字',intro:'先自己說；錄音或跳過後才聽示範。',model:'May cause drowsiness.',zh:'可能導致嗜睡。',speakingPrompt:'朋友問藥盒上寫了甚麼關於想睡的提醒。先口頭轉述。',recording:'phrase',questions:[]},
  {id:'native-178-v2-final',style:'final',label:'電影挑戰',title:'先休息再看',intro:'自己說明藥後感覺和安排。',questions:['native-178-v2-final']}
];
export default {revision:2,summary:'理解 drowsy 是昏昏欲睡、仍清醒的狀態，也認識藥盒上的 drowsiness。',steps,questions,takeaways:['drowsy','May cause drowsiness.'],completionTitle:'你能準確描述藥後想睡的感覺並提出休息。'};
