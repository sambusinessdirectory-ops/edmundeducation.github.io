import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'open',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-049-v2-audio','audio','只聽一句道歉。說話者不小心對飲料做了甚麼？',
    ['碰倒杯子。','喝光飲料。','把飲料放進雪櫃。','點了另一杯。'],
    '碰倒杯子。',"I knocked my drink over. 強調碰撞令杯子翻倒；不一定要先說飲料灑了多少。"),
  mc('native-049-v2-scene','scene','餐桌旁，你轉身時手肘碰到自己的飲料，杯子倒下。哪句向同桌的人描述最準確？',
    ["I knocked my drink over.","I ordered a drink.","I finished my drink.","I put my drink away."],
    "I knocked my drink over.",'knock over 說明碰倒的動作；這比只說桌子濕了更能交代剛才發生甚麼。'),
  mc('native-049-v2-detail','detail','I knocked my drink over. 和 I spilled my drink. 在重點上有甚麼差別？',
    ['前句側重杯子被碰倒；後句側重飲料灑出。','前句是故意，後句一定是意外。','前句只可說熱飲，後句只可說凍飲。','兩句都表示把飲料喝完。'],
    '前句側重杯子被碰倒；後句側重飲料灑出。','兩件事常一起發生，但 knock over 指容器翻倒，spill 指液體流出。'),
  mc('native-049-v2-branch','branch','店員看見桌上飲料灑出來，問 Are you okay? 你人沒事，想要紙巾。哪句最有幫助？',
    ["I'm okay, thanks. Could I have some napkins?","No, please ignore the spill.","I haven't ordered yet.","Could you bring me a fork?"],
    "I'm okay, thanks. Could I have some napkins?",'先說自己沒受傷，讓店員不用擔心；再清楚提出清理桌上飲料所需的紙巾。'),
  blank('native-049-v2-transfer','transfer','把碰倒飲料換成碰倒花瓶：你不小心用手臂碰倒了桌上的花瓶。用 knock over 寫一句英文。',
    ['I knocked the vase over.','I accidentally knocked the vase over.','I knocked over the vase.','I accidentally knocked over the vase.'],
    '保留碰倒的動作，換掉受影響的物件。','knock over 可用於杯子以外的物件；加入 accidentally 能更明確表示意外。')
];

const steps=[
  {id:'native-049-v2-audio',style:'audio',label:'聽出意外',title:'杯子怎樣倒了？',intro:'先只聽聲音，判斷動作。',model:'I knocked my drink over.',zh:'我不小心把飲料碰倒了。',audioOnly:true,questions:['native-049-v2-audio']},
  {id:'native-049-v2-scene',style:'scene',label:'桌邊發生',title:'轉身碰倒杯子',intro:'把動作說給同桌的人聽。',questions:['native-049-v2-scene']},
  {id:'native-049-v2-detail',style:'detail',label:'分清重點',title:'碰倒和灑出',intro:'兩句都可用，但描述焦點不同。',questions:['native-049-v2-detail']},
  {id:'native-049-v2-speak',style:'speak',label:'即時道歉',title:'向店員說剛才發生甚麼',intro:'先自己說；錄音或跳過後才聽示範。',model:'I knocked my drink over.',zh:'我把飲料碰倒了。',speakingPrompt:'店員：What happened? 你不小心碰倒了桌上的飲料。',recording:'phrase',questions:[]},
  {id:'native-049-v2-branch',style:'branch',label:'清理下一步',title:'店員先問你有沒有事',intro:'報平安，再提出實際需要。',questions:['native-049-v2-branch']},
  {id:'native-049-v2-transfer',style:'transfer',label:'換個物件',title:'不只是飲料會被碰倒',intro:'把片語用在另一個可翻倒的物件。',questions:['native-049-v2-transfer']}
];

export default {revision:2,summary:'用 knock over 描述碰倒物件，分清它與 spill 的焦點，並在意外後清楚求助。',steps,questions,takeaways:['I knocked my drink over.','I spilled my drink.'],completionTitle:'你能說明意外怎樣發生，也能自然請人幫忙清理了！'};
