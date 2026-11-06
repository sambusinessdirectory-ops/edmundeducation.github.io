import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-470-v2-audio','audio','只聽咳嗽狀況。它是怎樣發生的？',['突然一陣連續咳，暫時停不了。','整天只偶爾咳一聲。','咳嗽已完全停止。','只是喉嚨乾但沒有咳。'],'突然一陣連續咳，暫時停不了。','a coughing fit 是一陣接連而難以停下的咳嗽。'),
  mc('native-470-v2-reverse','reverse','朋友說 I’m having a coughing fit。你會預期他此刻怎樣？',['正連續咳，難以即刻講完句子。','昨天咳過，現在完全沒事。','只清了一次喉嚨。','想咳卻完全咳不出來。'],'正連續咳，難以即刻講完句子。','I’m having 指此刻正在發生；a fit 是一陣接連發作。'),
  mc('native-470-v2-continue','continue','同事在會議中突然連咳，說 I’m having a coughing fit。你想讓他暫停發言，怎樣回較好？',["Take a moment; we can wait until you're ready.","Keep talking so we don't lose time.","That was just one cough, so continue.","You should finish your sentence while coughing."],"Take a moment; we can wait until you're ready.",'讓對方先停下來，符合一陣咳嗽暫時說不了話的情況。'),
  mc('native-470-v2-transfer','transfer','一陣連續咳嗽剛停，你現在要說「我剛才咳了一陣」。哪句時間表達最準？',["I just had a coughing fit.","I'm having a coughing fit.","I always have a coughing fit.","I'll have a coughing fit later."],"I just had a coughing fit.",'just had 把咳嗽放在剛才；am having 表示當下仍在咳。'),
  open('native-470-v2-speak','speak','你正在接連咳，不能把話說完。先口頭告訴朋友狀況，再聽示範。',["I'm having a coughing fit.","Sorry, I'm having a coughing fit. Give me a moment."],'現在進行式對應此刻仍在接連咳嗽、暫時難以把話說完；咳完後則改用 just had。'),
  open('native-470-v2-final','final','新場景：會議中你突然咳個不停，過了一分鐘才停。寫兩句英文先說明當時正在咳，接着用過去時報告它剛結束。',["I was having a coughing fit and couldn't speak. It has stopped now, so I can continue.","Sorry, I was having a coughing fit. It just stopped, so I can speak again."],'用過去進行式回顧剛才仍在連續咳嗽的時段，再用現在或剛完成的表達交代已停下。')
];
const steps=[
  {id:'native-470-v2-audio',style:'audio',label:'先聽節奏',title:'突然咳個不停',intro:'判斷是一聲還是一陣。',model:'I’m having a coughing fit.',zh:'我正在一陣咳個不停。',audioOnly:true,questions:['native-470-v2-audio']},
  {id:'native-470-v2-reverse',style:'reverse',label:'回推狀態',title:'此刻說不了話',intro:'從句子推想情況。',questions:['native-470-v2-reverse']},
  {id:'native-470-v2-continue',style:'continue',label:'留出時間',title:'會議中咳嗽',intro:'接住同事的狀況。',questions:['native-470-v2-continue']},
  {id:'native-470-v2-transfer',style:'transfer',label:'咳嗽停了',title:'剛才的一陣',intro:'改用剛結束的時間。',model:'I just had a coughing fit.',zh:'我剛才咳了一陣。',questions:['native-470-v2-transfer']},
  {id:'native-470-v2-speak',style:'speak',label:'親口說明',title:'還在連續咳',intro:'先說再核對。',model:'I’m having a coughing fit.',zh:'我正在一陣咳個不停。',speakingPrompt:'連續咳到難以說完話，先口頭說明狀況。',recording:'phrase',questions:['native-470-v2-speak']},
  {id:'native-470-v2-final',style:'final',label:'會議挑戰',title:'從發作到停下',intro:'寫兩句交代時間變化。',questions:['native-470-v2-final']}
];
export default {revision:2,summary:'用 a coughing fit 描述突然一陣連續咳嗽，並區分正在發作與剛結束。',steps,questions,takeaways:['I’m having a coughing fit.','I just had a coughing fit.'],completionTitle:'你能說清一陣咳嗽及其時間變化。'};
