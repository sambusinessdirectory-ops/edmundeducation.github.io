import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-286-v2-audio','audio','先聽這句對意粉的描述。哪個畫面最貼切？',['麵條彼此黏住，變成一大團。','麵條全部燒焦成黑色。','麵條完全未煮熟。','麵條已拌勻醬汁。'],'麵條彼此黏住，變成一大團。','clumped together 指原本分開的東西黏成團，不直接評論熟度。'),
  mc('native-286-v2-detail','detail','你想判斷意粉是否 clumped together。哪項觀察最有力？',['用叉子一夾，整團麵一起提起，難以分開。','一根麵條比另一根短。','番茄醬顏色較深。','鍋裏還有一點熱水。'],'用叉子一夾，整團麵一起提起，難以分開。','整團被夾起顯示麵條互相黏附；長短或醬色不是線索。'),
  mc('native-286-v2-repair','repair','室友說「The pasta is undercooked」，但你試過熟度正常，只是放久後黏成一塊。怎樣修正？',["The pasta has clumped together.","The pasta is still raw.","The sauce is too spicy.","The noodles have disappeared."],"The pasta has clumped together.",'問題在麵條黏成團，不在是否煮熟；clumped together 更貼合觀察。'),
  mc('native-286-v2-explain','explain','為何這裏用 has clumped together，而不是 has separated？',['麵條由分散變成黏在一起，方向是聚合。','麵條已分成油和水兩層。','麵條數量減少了一半。','醬汁已完全蒸發。'],'麵條由分散變成黏在一起，方向是聚合。','clump 表示聚成團；separate 則表示原本混合的東西分開。'),
  mc('native-286-v2-continue','continue','朋友問：「Why is the pasta in one big lump?」你知道它在雪櫃放了一晚。怎樣接話？',["It clumped together in the fridge. Let's see if we can separate it.","I haven't cooked any pasta yet.","The pasta is still in its sealed packet.","The sauce is boiling over right now."],"It clumped together in the fridge. Let's see if we can separate it.",'回應說出放雪櫃後黏成團，並接着處理朋友看到的大塊意粉。'),
  open('native-286-v2-final','final','新情境：你把昨晚煮好的意粉從雪櫃取出，麵條已黏成一大塊。寫兩句英文告訴同伴現況，並提出一個處理辦法。',["The pasta has clumped together in the fridge. Let's warm it up and separate the strands.","It's all clumped together now. Maybe a little sauce will help us loosen it.","The pasta is stuck in one big clump. I'll try gently separating it as it heats."],'自評時確認你說的是麵條黏成團，第二部分再提出處理做法。')
];
const steps=[
  {id:'native-286-v2-audio',style:'audio',label:'聽出口感問題',title:'麵條還分得開嗎？',intro:'先聽麵條能否一條條分開。',model:'The pasta has clumped together.',zh:'意粉黏成一團。',audioOnly:true,questions:['native-286-v2-audio']},
  {id:'native-286-v2-detail',style:'detail',label:'叉子測試',title:'一夾就整團起來',intro:'找出黏成團的可見證據。',questions:['native-286-v2-detail']},
  {id:'native-286-v2-repair',style:'repair',label:'修正熟度',title:'已熟卻黏住',intro:'避免把黏結誤說成未煮熟。',questions:['native-286-v2-repair']},
  {id:'native-286-v2-explain',style:'explain',label:'拆解變化',title:'聚成團，不是分開',intro:'比較 clump 與 separate 的方向。',questions:['native-286-v2-explain']},
  {id:'native-286-v2-continue',style:'continue',label:'回答同伴',title:'昨晚意粉變成一塊',intro:'接上對方的問題並提出做法。',questions:['native-286-v2-continue']},
  {id:'native-286-v2-final',style:'final',label:'雪櫃挑戰',title:'描述並處理黏團',intro:'用兩句英文，再按示例檢查。',questions:['native-286-v2-final']}
];
export default {revision:2,summary:'用 clumped together 描述意粉互相黏成團，並與未煮熟區分。',steps,questions,takeaways:['The pasta has clumped together.'],completionTitle:'你能準確描述黏成團的意粉，並提出處理方法。'};
