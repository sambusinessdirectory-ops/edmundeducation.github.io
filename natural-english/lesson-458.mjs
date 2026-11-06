import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-458-v2-audio','audio','只聽膠帶的狀況。哪個問題最貼切？',['放久後黏力消失。','膠帶拉不出來。','膠帶黏得太牢。','膠帶剪得太短。'],'放久後黏力消失。','lost its stickiness 說原本會黏，現在黏力不足。'),
  mc('native-458-v2-detail','detail','貼紙貼上後立刻掉下來；黏面摸起來乾乾的。哪個線索支持「失去黏性」？',['黏面已抓不住表面。','貼紙顏色褪了。','紙背仍然完整。','貼紙比原本小。'],'黏面已抓不住表面。','能否附著是 stickiness 的核心；顏色與尺寸不決定黏力。'),
  mc('native-458-v2-repair','repair','朋友說 This tape is too sticky，但它一貼上就掉。怎樣修正？',["This tape has lost its stickiness.","This tape is sticking too well.","This tape is hard to tear.","This tape is too wide for the box."],"This tape has lost its stickiness.",'一貼就掉表示黏力不足，不是黏得太牢；lost its stickiness 也帶出原本會黏、現在不再黏的變化。'),
  mc('native-458-v2-explain','explain','It’s lost its stickiness 中 lost 傳達甚麼時間變化？',['以前黏，現在不太黏。','從來沒有黏過。','將來才會有黏力。','現在比以前更黏。'],'以前黏，現在不太黏。','has lost 描述從原有狀態變成現在缺乏黏性。'),
  mc('native-458-v2-continue','continue','朋友說封箱膠帶一再鬆開，懷疑存放太久。你要提出下一步，怎樣接？',["Let's use a fresh roll instead.","Let's add more of the same old tape.","Let's pull the tape more tightly.","Let's leave the box open."],"Let's use a fresh roll instead.",'舊膠帶已失黏，換新的一卷才直接處理黏力問題。'),
  open('native-458-v2-final','final','新場景：你找到一疊舊貼紙，貼在禮物袋上總會掉。寫兩句英文說明原因與你的替代做法。',["These stickers have lost their stickiness. I'll use a newer set for the gift bags.","The old stickers won't stay on because they've lost their stickiness. Let's use fresh tape instead."],'說明原本的黏性已消失，再提出能固定禮物袋的做法。')
];
const steps=[
  {id:'native-458-v2-audio',style:'audio',label:'先聽狀況',title:'舊膠帶',intro:'只憑聲音判斷問題。',model:'It’s lost its stickiness.',zh:'它已經不黏了。',audioOnly:true,questions:['native-458-v2-audio']},
  {id:'native-458-v2-detail',style:'detail',label:'摸黏面',title:'一貼就掉',intro:'找黏力不足的證據。',questions:['native-458-v2-detail']},
  {id:'native-458-v2-repair',style:'repair',label:'修正誤說',title:'不是太黏',intro:'改成符合現象的句子。',model:'This tape has lost its stickiness.',zh:'這卷膠帶已經不黏了。',questions:['native-458-v2-repair']},
  {id:'native-458-v2-explain',style:'explain',label:'看時間變化',title:'原本會黏',intro:'理解 has lost 的含義。',questions:['native-458-v2-explain']},
  {id:'native-458-v2-continue',style:'continue',label:'換哪一卷',title:'封箱前',intro:'接住朋友的發現。',questions:['native-458-v2-continue']},
  {id:'native-458-v2-final',style:'final',label:'禮物袋挑戰',title:'舊貼紙掉落',intro:'自己寫問題與做法。',questions:['native-458-v2-final']}
];
export default {revision:2,summary:'用 lost its stickiness 說膠帶或貼紙放久後黏力消失。',steps,questions,takeaways:['It’s lost its stickiness.','This tape has lost its stickiness.'],completionTitle:'你能解釋舊貼紙為何貼不牢。'};
