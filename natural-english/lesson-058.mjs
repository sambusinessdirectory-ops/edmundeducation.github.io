import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-058-v2-audio','audio','只聽一個午餐說法。食物最初是哪一餐留下的？',
    ['昨晚那餐。','今天早上。','明天的晚餐。','餐廳剛做好的午餐。'],
    '昨晚那餐。',"last night's leftovers 是昨晚吃剩的食物；leftovers 不等於已經變壞。"),
  mc('native-058-v2-scene','scene','你昨晚煮的意粉還剩一份，今天中午加熱來吃。朋友問 What are you having for lunch? 哪句自然？',
    ["I'm heating up last night's leftovers.","I'm cooking tomorrow's leftovers.","I need to throw away last night's dinner.","I'm eating someone else's lunch without asking."],
    "I'm heating up last night's leftovers.",'既說明來源是昨晚吃剩的食物，也說明你現在正在加熱。'),
  mc('native-058-v2-contrast','contrast','leftovers 和 spoiled food 的差別是甚麼？',
    ['leftovers 只說剩下的食物；spoiled food 才說食物變壞。','leftovers 一定已經不能吃。','spoiled food 是剛煮好的飯。','兩個詞都只表示外賣。'],
    'leftovers 只說剩下的食物；spoiled food 才說食物變壞。','剩菜是否仍安全可吃是另一個判斷；leftovers 本身不宣稱腐壞。'),
  blank('native-058-v2-final','final','最後挑戰：今晚沒時間煮飯，雪櫃有昨晚吃剩的菜。用兩句英文告訴室友你打算加熱它們當晚餐。',
    ["We have leftovers from last night. I'll heat them up for dinner.","We have last night's leftovers. I'll heat them up for dinner.","There are leftovers from last night. I'll heat them up for dinner.","We have leftovers from last night. I'm going to heat them up for dinner."],
    '先說食物從哪裏來，再說你的安排。','last night’s leftovers 說明是昨晚剩下的菜；heat them up 說明現在的動作。')
];

const steps=[
  {id:'native-058-v2-audio',style:'audio',label:'聽出來源',title:'這是哪餐剩下的？',intro:'先只聽食物來源。',model:'last night’s leftovers',zh:'昨晚吃剩的菜。',audioOnly:true,questions:['native-058-v2-audio']},
  {id:'native-058-v2-scene',style:'scene',label:'午餐現場',title:'加熱昨晚意粉',intro:'說明現在正在做甚麼。',questions:['native-058-v2-scene']},
  {id:'native-058-v2-contrast',style:'contrast',label:'剩下或變壞',title:'leftovers 不等於 spoiled',intro:'不要從「剩菜」直接推論食物已壞。',questions:['native-058-v2-contrast']},
  {id:'native-058-v2-speak',style:'speak',label:'午餐口說',title:'告訴朋友你吃甚麼',intro:'先自己說；錄音或跳過後才聽示範。',model:'I’m heating up the leftovers.',zh:'我在加熱剩菜。',speakingPrompt:'朋友問：Are you making lunch? 你只是加熱昨天的菜。',recording:'phrase',questions:[]},
  {id:'native-058-v2-final',style:'final',label:'晚餐安排',title:'今晚吃昨晚剩菜',intro:'新情境，自己說來源和下一步。',questions:['native-058-v2-final']}
];

export default {revision:2,summary:'用 leftovers 說剩下但未必變壞的食物，並描述加熱和下一餐安排。',steps,questions,takeaways:['last night’s leftovers','I’m heating up the leftovers.'],completionTitle:'你能自然談昨晚的剩菜，也能說明如何處理下一餐了！'};
