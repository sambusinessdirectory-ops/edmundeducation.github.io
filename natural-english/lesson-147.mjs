import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-147-v2-audio','audio','只聽這句勸朋友的話。說話者希望對方怎樣處理已發生的事？',['別一直抓著不放。','立刻再吵一次。','把事情暫時擱置，晚點再談。','對方應立刻向當事人追究。'],'別一直抓著不放。','Let it go 在情緒語境是放下難以改變的事，停止反覆糾結。'),
  mc('native-147-v2-explain','explain','同事一週後仍因一句冒犯說話生氣。甚麼情況下 Let it go 才比較像體貼提醒？',['先承認他受傷，再說繼續糾結可能不值得。','先說事情已過去，卻不回應他的感受。','聽完他的經過後，只叫他別再提起。','建議他先處理仍可改變的部分。'],'先承認他受傷，再說繼續糾結可能不值得。','這句可能顯得輕率；先理解感受再提出放下，語氣更有分寸。'),
  mc('native-147-v2-branch','branch','朋友說 I still can’t believe he said that。你了解事情已無法改變，也想同理他。哪句合適？',["I know it hurt. Maybe it's time to let it go.","I know it hurt, but you should forget it immediately.","Maybe you should ask him to explain it once more.","I know it hurt. Would talking to him help you move on?"],"I know it hurt. Maybe it's time to let it go.",'先承認傷害，再以 maybe 緩和建議；比直接命令放下更體貼。'),
  open('native-147-v2-final','final','最後挑戰：朋友一直為上週一次無心的爭執煩惱，對方已道歉。寫兩句英文先表示理解，再溫和建議他慢慢放下。',["I know that comment hurt, even though he apologized. Maybe you can try to let it go now.","It makes sense that you're still upset. Since he apologized, perhaps it's time to let it go."],'先同理情緒，再提出放下的建議；Let it go 不宜像命令般否定對方感受。')
];
const steps=[
  {id:'native-147-v2-audio',style:'audio',label:'先聽勸說',title:'別再糾結',intro:'聽聽這句勸說是否在叫人停止糾結。',model:'Let it go.',zh:'放下這件事吧。',audioOnly:true,questions:['native-147-v2-audio']},
  {id:'native-147-v2-explain',style:'explain',label:'看語氣',title:'別把關心說成敷衍',intro:'同一句話需要配合對方心情。',questions:['native-147-v2-explain']},
  {id:'native-147-v2-branch',style:'branch',label:'接住朋友',title:'先承認難受',intro:'用有分寸的話接續。',questions:['native-147-v2-branch']},
  {id:'native-147-v2-speak',style:'speak',label:'口頭短句',title:'簡單勸他放下',intro:'先自己說；錄音或跳過後才聽示範。',model:'Forget it.',zh:'算了，別再想。',speakingPrompt:'朋友仍惦記一件小誤會。用簡短一句勸他別再想。',recording:'phrase',questions:[]},
  {id:'native-147-v2-final',style:'final',label:'和解挑戰',title:'道歉後仍難釋懷',intro:'自己寫出同理和勸說。',questions:['native-147-v2-final']}
];
export default {revision:2,summary:'用 Let it go 勸朋友放下已難改變的事，同時留意先表達理解。',steps,questions,takeaways:['Let it go.','Forget it.'],completionTitle:'你能溫和地勸人放下，不忽略對方的感受。'};
