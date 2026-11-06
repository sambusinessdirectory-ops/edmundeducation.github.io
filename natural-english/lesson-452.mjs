import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-452-v2-audio','audio','先只聽飲筒的問題。飲料為甚麼吸不上來？',['珍珠或果粒卡住管道。','紙飲筒泡軟了。','杯子快空了。','吸管太短碰不到飲料。'],'珍珠或果粒卡住管道。','clogged 表示通道被東西堵塞；這裏可能有珍珠或果粒卡在飲筒內。'),
  mc('native-452-v2-repair','repair','朋友說 The straw is soggy，但這是硬塑膠飲筒，裏面卡着一顆珍珠。應怎樣改？',["The straw is clogged.","The straw has gone soft.","The straw is bent at the top.","The straw is too wide for the cup."],"The straw is clogged.",'硬飲筒沒有泡軟；珍珠堵住管道時說 clogged。'),
  mc('native-452-v2-branch','branch','朋友吸不到果茶，你想先確認是否有果粒堵住飲筒。哪句問法最準？',["Is something stuck in it?","Has the straw become soggy?","Did you forget to open the cup?","Is the drink too cold to swallow?"],"Is something stuck in it?",'問是否有東西卡在飲筒內，正對應 clogged 的可能原因。'),
  open('native-452-v2-speak','speak','飲筒沒有變軟，但一顆珍珠堵住中間。先口頭向朋友說出問題，再聽示範。',["The straw is clogged.","A pearl has clogged the straw."],'clogged 說通道被堵，並非材料變軟或杯子沒飲料。'),
  open('native-452-v2-final','final','新場景：珍珠奶茶的珍珠卡在飲筒裏，怎樣吸都吸不上來。寫兩句英文指出問題，並問朋友是否看見東西卡住。',["The straw is clogged. Is something stuck in it?","I think a pearl has clogged the straw. Can you see what's stuck inside?"],'清楚說飲筒被堵塞，再用問句確認卡在裏面的東西。')
];
const steps=[
  {id:'native-452-v2-audio',style:'audio',label:'先聽堵塞',title:'珍珠吸不上來',intro:'判斷飲筒出了甚麼事。',model:'The straw is clogged.',zh:'飲筒被堵住了。',audioOnly:true,questions:['native-452-v2-audio']},
  {id:'native-452-v2-repair',style:'repair',label:'不是泡軟',title:'硬飲筒也吸不到',intro:'修正材料狀態的誤判。',questions:['native-452-v2-repair']},
  {id:'native-452-v2-branch',style:'branch',label:'追查原因',title:'管道裏有甚麼',intro:'問是否有東西卡住。',model:'Is something stuck in it?',zh:'是不是有東西卡在裏面？',questions:['native-452-v2-branch']},
  {id:'native-452-v2-speak',style:'speak',label:'口頭指出',title:'珍珠卡在中間',intro:'先自己說，再核對示範。',model:'The straw is clogged.',zh:'飲筒被堵住了。',speakingPrompt:'一顆珍珠堵住飲筒，先口頭告訴朋友。',recording:'phrase',questions:['native-452-v2-speak']},
  {id:'native-452-v2-final',style:'final',label:'奶茶挑戰',title:'找出卡住的東西',intro:'寫出問題與追問。',questions:['native-452-v2-final']}
];
// Source PDF filenames 452/453 are swapped: clogged-straw content/audio originated in imported 453.
export default {revision:2,summary:'用 The straw is clogged 說珍珠或果粒卡住飲筒，與紙飲筒泡軟區分。',steps,questions,takeaways:['The straw is clogged.','Is something stuck in it?'],completionTitle:'你能指出飲筒堵塞並追問卡住的東西。'};
