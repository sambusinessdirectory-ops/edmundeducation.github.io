import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-079-v2-audio','audio','只聽一個皮膚痕跡的名稱。它是由甚麼引起？',
    ['蚊子叮咬。','被紙割傷。','衣服染色。','太陽曬黑。'],
    '蚊子叮咬。','mosquito bite 可指被蚊子咬這件事，也可指皮膚留下的痕跡。'),
  mc('native-079-v2-contrast','contrast','mosquito bite 和 insect bite 的關係是甚麼？',
    ['蚊子叮咬是昆蟲叮咬的一種；insect bite 更籠統。','兩者完全相反。','insect bite 一定是蜘蛛咬。','mosquito bite 只說食物。'],
    '蚊子叮咬是昆蟲叮咬的一種；insect bite 更籠統。','如果確定是蚊子，可具體說 mosquito bite；如果不知道是哪種昆蟲，說 insect bite 較準。'),
  mc('native-079-v2-reverse','reverse','朋友指着你手臂一個小包問 What’s that? 你確實看見蚊子咬了你。哪句直接回答？',
    ["It's a mosquito bite.","It's a paper cut.","It's a bruise from the table.","It's a stain on my sleeve."],
    "It's a mosquito bite.",'既知道原因，就直接用 mosquito bite 指這個叮咬痕跡。'),
  open('native-079-v2-repair','repair','你說 I have a mosquito bag on my arm.，想說手臂上有蚊子咬的包。改成自然英文。',
    ['I have a mosquito bite on my arm.','I got bitten by a mosquito on my arm.','There’s a mosquito bite on my arm.'],
    'bite 是這種叮咬痕跡，不是 bag；也可用 got bitten 描述被咬的經過。'),
  open('native-079-v2-final','final','最後挑戰：昨晚在戶外坐了一會，今天手臂有幾個癢的小包，你確定是蚊子咬的。向朋友用一句英文說明。',
    ['I have a few mosquito bites on my arm.','I got a few mosquito bites on my arm last night.','Mosquitoes bit my arm last night, and now I have a few itchy bites.'],
    '用 mosquito bites 的複數說幾個叮咬痕跡；若只是推測原因，應避免說得太肯定。')
];

const steps=[
  {id:'native-079-v2-audio',style:'audio',label:'聽出來源',title:'這是甚麼痕跡？',intro:'先只聽名稱。',model:'mosquito bite',zh:'蚊子咬的包／痕跡。',audioOnly:true,questions:['native-079-v2-audio']},
  {id:'native-079-v2-contrast',style:'contrast',label:'具體或籠統',title:'mosquito 和 insect',intro:'確定來源才說得更具體。',questions:['native-079-v2-contrast']},
  {id:'native-079-v2-reverse',style:'reverse',label:'回答朋友',title:'手臂上的小包',intro:'對方問的是眼前的痕跡。',questions:['native-079-v2-reverse']},
  {id:'native-079-v2-speak',style:'speak',label:'即時口說',title:'向朋友描述手臂',intro:'先自己說；錄音或跳過後才聽示範。',model:'I have a few mosquito bites on my arm.',zh:'我手臂有幾個蚊子咬的包。',speakingPrompt:'朋友問：What happened to your arm? 你昨晚被幾隻蚊子咬了。',recording:'phrase',questions:[]},
  {id:'native-079-v2-repair',style:'repair',label:'修正直譯',title:'不是 mosquito bag',intro:'自己寫出自然描述。',questions:['native-079-v2-repair']},
  {id:'native-079-v2-final',style:'final',label:'戶外挑戰',title:'幾個癢的小包',intro:'新情境，自己說明數量與位置。',questions:['native-079-v2-final']}
];

export default {revision:2,summary:'用 mosquito bite 指蚊子叮咬與留下的包，分清具體來源和籠統的 insect bite。',steps,questions,takeaways:['mosquito bite','I have a few mosquito bites on my arm.'],completionTitle:'你能準確說出蚊子叮咬痕跡，也能交代數量和位置了！'};
