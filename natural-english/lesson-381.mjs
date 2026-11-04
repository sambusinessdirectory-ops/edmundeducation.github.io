import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-381-v2-audio','audio','聽完這句，傷口最可能在做甚麼？',['少量液體慢慢滲出。','大量血液突然噴出。','已完全乾燥沒有任何液體。','只是在表面形成一層痂。'],'少量液體慢慢滲出。','oozing 指液體緩慢滲出，與突然大量出血或完全乾燥不同。'),
  mc('native-381-v2-tone','tone','朋友問傷口是否仍大量流血；你只見少許液體滲出，哪句準確？',["It's not bleeding heavily, but the wound is oozing a little.","Blood is pouring out very fast.","The cut is completely dry and healed.","There is no wound on my arm."],"It's not bleeding heavily, but the wound is oozing a little.",'not bleeding heavily 和 oozing a little 把液體量及速度都交代準確。'),
  mc('native-381-v2-repair','repair','原句「The wound is pouring a little」不自然；要說少量液體慢慢滲出，怎樣改？',['The wound is oozing a little.','The wound is raining a little.','The wound is dripping like a tap.','The wound is spraying everywhere.'],'The wound is oozing a little.','oozing 已包含慢慢滲出的意思，a little 再指出量不多。'),
  open('native-381-v2-transfer','transfer','新情境：你換繃帶時發現擦傷仍有少量液體滲出，但沒有大量流血。寫兩句英文描述所見與你準備怎樣處理繃帶。',["The scrape is still oozing a little, but it isn't bleeding heavily. I'm going to put on a clean bandage.","I noticed a little fluid oozing from the cut when I changed the bandage. I'll cover it with a fresh one.","The wound is oozing slowly, not pouring blood. I'll replace the old bandage now."],'自評時要說出緩慢滲出與少量，並寫出換繃帶的具體下一步。'),
  open('native-381-v2-final','final','另一個新情境：朋友看到你手肘傷口還是濕的，問你有沒有大量出血。寫兩句英文回應並說明現在的狀況。',["No, it isn't bleeding heavily. The wound is just oozing a little.","There's no heavy bleeding from my elbow. A little fluid is still oozing out.","It's not a lot of blood. The wound is oozing slowly, so the surface looks wet."],'回應朋友的疑問後，用 oozing 描述慢慢滲出，不要把濕潤說成大量出血。')
];
const steps=[
  {id:'native-381-v2-audio',style:'audio',label:'聽液體速度',title:'流出還是滲出？',intro:'先聽液體流出的速度與量，不急着判斷嚴重程度。',model:'The wound is oozing.',zh:'傷口正在慢慢滲出液體。',audioOnly:true,questions:['native-381-v2-audio']},
  {id:'native-381-v2-tone',style:'tone',label:'描述程度',title:'沒有大量流血',intro:'在回答中區分滲出與大量出血。',questions:['native-381-v2-tone']},
  {id:'native-381-v2-repair',style:'repair',label:'修正動詞',title:'不用 pouring',intro:'換成表達慢慢滲出的動詞。',questions:['native-381-v2-repair']},
  {id:'native-381-v2-transfer',style:'transfer',label:'換繃帶',title:'觀察與處理',intro:'寫出看到的量，以及下一步。',questions:['native-381-v2-transfer']},
  {id:'native-381-v2-speak',style:'speak',label:'口頭描述',title:'少量液體滲出',intro:'先自己說；錄音或跳過後才聽示範。',model:'The wound is oozing.',zh:'傷口正在慢慢滲出液體。',speakingPrompt:'傷口有少量液體慢慢滲出，簡短描述。',recording:'phrase',questions:[]},
  {id:'native-381-v2-final',style:'final',label:'回應朋友',title:'說清沒有大量流血',intro:'把「不大量」和「仍滲出」各寫清楚。',questions:['native-381-v2-final']}
];
export default {revision:2,summary:'用 oozing 描述少量液體從傷口慢慢滲出，與大量出血區分。',steps,questions,takeaways:['The wound is oozing.'],completionTitle:'你能準確描述傷口的緩慢滲出。'};
