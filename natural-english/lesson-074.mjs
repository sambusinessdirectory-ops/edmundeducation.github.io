import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-074-v2-audio','audio','只聽一句話。說話者在說自己的反應怎樣？',
    ['很難控制或忍住。','已經完全忘記。','是別人強迫的。','只是明天才會發生。'],
    '很難控制或忍住。',"I can't help it. 常表示自己忍不住某個反應；it 要靠前文知道具體指甚麼。"),
  mc('native-074-v2-explain','explain','朋友問 Why are you laughing? 你回 I can’t help it.。it 回指甚麼？',
    ['自己忍不住笑。','朋友的名字。','餐廳的菜單。','一件明天才發生的事。'],
    '自己忍不住笑。','在這段對話裏，it 回指 laughing；離開語境，單聽 I can’t help it. 不一定知道忍不住甚麼。'),
  mc('native-074-v2-continue','continue','朋友說 I know, but I can’t help worrying about the exam. 你想表示理解，而非命令他「別擔心」。哪句較合適？',
    ["I get it. Do you want to talk through what's worrying you?","Just stop worrying right now.","You should never take exams again.","I can't hear what you said."],
    "I get it. Do you want to talk through what's worrying you?",'先承認對方的考試擔憂有其原因，再讓對方選擇是否談談細節；沒有命令他立刻停止擔心。'),
  mc('native-074-v2-detail','explain','你不小心打破朋友的杯子，只說 I can’t help it. 有甚麼問題？',
    ['聽起來像推卸責任；應先道歉並提出補救。','這句表示你已經修好杯子。','這句會讓杯子自動恢復。','這句只可用於考試。'],
    '聽起來像推卸責任；應先道歉並提出補救。','不能控制的笑或擔憂和自己造成的損失不同；後者需要承擔責任。'),
  open('native-074-v2-final','final','最後挑戰：朋友講了個很有趣的故事，你忍不住笑，怕他以為你在取笑他。用兩句英文說你忍不住笑，並說明故事真的很有趣。',
    ["Sorry, I can't help laughing. The story is just so funny.","I'm sorry—I can't help laughing. That story is really funny.","I don't mean to laugh at you. I just can't help it; the story is funny."],
    '說出不能控制的反應，同時交代笑的對象是故事，不是刻意取笑朋友。')
];

const steps=[
  {id:'native-074-v2-audio',style:'audio',label:'聽出反應',title:'忍不住甚麼？',intro:'先只聽一句，再從情境找 it。',model:'I can’t help it.',zh:'我忍不住。',audioOnly:true,questions:['native-074-v2-audio']},
  {id:'native-074-v2-explain',style:'explain',label:'找回所指',title:'it 指哪個反應？',intro:'同一句要靠前文才能完整理解。',questions:['native-074-v2-explain','native-074-v2-detail']},
  {id:'native-074-v2-speak',style:'speak',label:'笑出聲',title:'朋友問你為甚麼笑',intro:'先自己說；錄音或跳過後才聽示範。',model:'I can’t help laughing.',zh:'我忍不住笑。',speakingPrompt:'朋友：Why are you laughing? 你真的覺得故事好笑。',recording:'phrase',questions:[]},
  {id:'native-074-v2-continue',style:'continue',label:'接住擔憂',title:'朋友忍不住擔心考試',intro:'不要只叫對方停止擔心。',questions:['native-074-v2-continue']},
  {id:'native-074-v2-final',style:'final',label:'故事挑戰',title:'笑，但不是取笑朋友',intro:'新情境，自己把反應和原因說明白。',questions:['native-074-v2-final']}
];

export default {revision:2,summary:'用 can’t help it / can’t help laughing 說難以控制的反應，同時注意語境與責任。',steps,questions,takeaways:['I can’t help it.','I can’t help laughing.'],completionTitle:'你能說清忍不住的反應，也知道甚麼時候需要承擔責任了！'};
