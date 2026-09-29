import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-295-v2-audio','audio','先聽這句眼睛的描述。外觀最可能如何？',['眼白有很多明顯紅血絲。','眼皮浮腫但眼白正常。','視線突然變得模糊。','眼睛完全閉不上。'],'眼白有很多明顯紅血絲。','bloodshot 形容眼白充滿血絲，看起來很紅。'),
  mc('native-295-v2-detail','detail','朋友昨晚沒睡好。哪項觀察最支持 bloodshot？',['眼白佈滿一條條紅色血絲。','上下眼皮只是稍微腫起。','瞳孔顏色和平時不同。','眼鏡鏡片沾上灰塵。'],'眼白佈滿一條條紅色血絲。','bloodshot 看的是眼白的血絲；眼皮腫脹通常用 puffy 描述。'),
  mc('native-295-v2-tone','tone','朋友問：「Are you okay? Your eyes look really red.」你昨夜只睡兩小時。哪句自然回應？',["Yeah, they're bloodshot. I barely slept last night.","No, my glasses are broken, so I can't see you.","Yes, the room lights are always red.","I have no idea what eyes are."],"Yeah, they're bloodshot. I barely slept last night.",'先確認眼睛有血絲，再給出睡眠不足的背景，回應朋友的關心。'),
  mc('native-295-v2-continue','continue','朋友說：「You look exhausted.」你確實熬夜，眼睛很多血絲。哪句能接上？',["I know. My eyes are bloodshot after that all-nighter.","No, my eyes are puffy because I ate too much salt.","The camera is out of focus, not my eyes.","I slept twelve hours and feel fully rested."],"I know. My eyes are bloodshot after that all-nighter.",'朋友看到你疲倦；這句承認熬夜，並用 bloodshot 準確指出眼白血絲的外觀。'),
  open('native-295-v2-final','final','新情境：你熬夜趕報告，早上照鏡子看到眼白有很多血絲；同事問你是否累了。寫兩句英文說明眼睛狀況和昨夜原因。',["My eyes are bloodshot today. I was up late finishing a report.","I barely slept, so my eyes are bloodshot. I had to finish a report last night.","Yes, I'm tired and my eyes are really bloodshot. I stayed up working on the report."],'自評時確認你說的是眼白血絲，而非眼皮腫，並交代熬夜原因。')
];
const steps=[
  {id:'native-295-v2-audio',style:'audio',label:'聽出外觀',title:'眼白有甚麼變化？',intro:'先聽眼白是有血絲還是眼皮浮腫。',model:'My eyes are bloodshot.',zh:'我的眼睛有很多血絲。',audioOnly:true,questions:['native-295-v2-audio']},
  {id:'native-295-v2-detail',style:'detail',label:'看眼白',title:'血絲還是浮腫？',intro:'把觀察到的部位分清。',questions:['native-295-v2-detail']},
  {id:'native-295-v2-tone',style:'tone',label:'回應關心',title:'朋友看見眼睛很紅',intro:'自然說明身體狀態。',questions:['native-295-v2-tone']},
  {id:'native-295-v2-continue',style:'continue',label:'接朋友的話',title:'你看起來很累',intro:'說明熬夜與眼睛外觀。',questions:['native-295-v2-continue']},
  {id:'native-295-v2-speak',style:'speak',label:'口頭描述',title:'照鏡子後的發現',intro:'先自己說；錄音或跳過後才聽示範。',model:'My eyes are bloodshot.',zh:'我的眼睛有很多血絲。',speakingPrompt:'熬夜後眼白佈滿紅色血絲。簡短告訴朋友。',recording:'phrase',questions:[]},
  {id:'native-295-v2-final',style:'final',label:'趕報告挑戰',title:'向同事解釋疲倦',intro:'描述眼白血絲，再解釋昨晚睡得少。',questions:['native-295-v2-final']}
];
export default {revision:2,summary:'用 bloodshot 描述眼白有明顯血絲，並與眼皮浮腫的 puffy 分開。',steps,questions,takeaways:['My eyes are bloodshot.'],completionTitle:'你能準確描述眼睛血絲，並解釋熬夜背景。'};
