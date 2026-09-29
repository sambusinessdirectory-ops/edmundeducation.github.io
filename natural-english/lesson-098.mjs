import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-098-v2-audio','audio','只聽這句提醒。眼前最可能有甚麼危險？',
    ['低矮處可能撞到頭。','地板非常滑。','飲料很燙。','後方有車要倒車。'],
    '低矮處可能撞到頭。','Watch your head 是提醒留意頭部，常在矮門框、低天花等地方說。'),
  mc('native-098-v2-repair','repair','你想提醒朋友低門框，卻說 Watch your shoes。哪句修正最準確？',
    ['Watch your head.','Watch your wallet.','Watch the clock.','Watch your phone.'],
    'Watch your head.','可能撞到的是頭；提醒時要說對部位，讓對方立即作出動作。'),
  mc('native-098-v2-explain','explain','為甚麼在低門框前要說 Watch your head，而不是等朋友撞到後才解釋？',
    ['這是一句事前安全提醒，可讓對方及時低頭。','這句是撞到後才用的道歉。','這句保證門框會自己升高。','這句只用在談電影時。'],
    '這是一句事前安全提醒，可讓對方及時低頭。','安全提醒的價值在於事前；watch 在這裡不是要求盯著自己的頭看。'),
  mc('native-098-v2-branch','branch','朋友聽到 Watch your head，抬頭看見低樑，低頭走過後說 Oh, thanks。你怎樣接？',
    ["No problem. It's easy to miss.","No, I wanted you to hit it.","You should go back and try again.","The ceiling has disappeared."],
    "No problem. It's easy to miss.",'對方已避開障礙並道謝，簡短回應即可；可補充這裡確實容易忽略。'),
  mc('native-098-v2-continue','continue','你說 Watch your head。朋友問 Where? 你最有用的下一句是甚麼？',
    ['The doorway just ahead is low.','Somewhere in this city.','Maybe next month.','I forgot what a doorway is.'],
    'The doorway just ahead is low.','既然對方未看到危險，立即指明前方低門框，讓提醒可執行。'),
  open('native-098-v2-writing','continue','你帶朋友走進閣樓，門框很低；朋友正在看手機，還未留意。用兩句英文即時提醒他頭部要小心，並指出低門框在哪裡。',
    ["Watch your head! The doorway right in front of you is low.","Careful—watch your head. There's a low doorframe just ahead.","Duck your head. The doorway up ahead is really low."],
    '先給短而急的提醒，再指出障礙位置；比只說 watch your… 而不說清楚更有用。')
];
const steps=[
  {id:'native-098-v2-audio',style:'audio',label:'聽出危險',title:'前面有低處',intro:'只聽警告，判斷要保護甚麼。',model:'Watch your head.',zh:'小心撞頭。',audioOnly:true,questions:['native-098-v2-audio']},
  {id:'native-098-v2-repair',style:'repair',label:'說對部位',title:'別提醒錯地方',intro:'把安全訊息修正到一聽就懂。',questions:['native-098-v2-repair']},
  {id:'native-098-v2-explain',style:'explain',label:'理解作用',title:'事前說才有用',intro:'分辨提醒和事後解釋。',questions:['native-098-v2-explain']},
  {id:'native-098-v2-speak',style:'speak',label:'即時提醒',title:'矮門框就在前面',intro:'先自己說；錄音或跳過後才聽示範。',model:'Watch your head.',zh:'小心撞頭。',speakingPrompt:'朋友快走到很低的門框前。你要即時叫他小心頭部。',recording:'phrase',questions:[]},
  {id:'native-098-v2-branch',style:'branch',label:'對方避開了',title:'接一句自然回應',intro:'把短提醒接成自然對話。',questions:['native-098-v2-branch']},
  {id:'native-098-v2-continue',style:'continue',label:'指明位置',title:'他還沒看到障礙',intro:'先判斷缺少甚麼，再自己補上。',questions:['native-098-v2-continue','native-098-v2-writing']}
];
export default {revision:2,summary:'用 Watch your head 即時提醒低門框等頭部危險，必要時再指出具體位置。',steps,questions,takeaways:['Watch your head.','watch your...'],completionTitle:'你能在低處前及時提醒朋友，並把危險位置說清楚。'};
