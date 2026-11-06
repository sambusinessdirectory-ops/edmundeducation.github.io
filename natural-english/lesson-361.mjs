import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-361-v2-audio','audio','只聽這句開汽水時的提醒。最可能看到甚麼？',['泡沫從容器口不斷冒出。','汽水已經完全沒有氣。','瓶子裏只剩清水。','汽水結冰成固體。'],'泡沫從容器口不斷冒出。','foaming over 指泡沫向上湧並越過罐口或瓶口。'),
  mc('native-361-v2-repair','repair','朋友說「The soda is boiling over」，但汽水沒有加熱；開罐後泡沫湧出。怎樣改？',["The soda is foaming over.","The soda is simmering on the stove.","The can has boiled dry.","The soda has gone flat."],"The soda is foaming over.",'汽水是起泡溢出，並非加熱沸騰；foaming 指泡沫。'),
  mc('native-361-v2-continue','continue','朋友說：「I think someone shook it.」你看到泡沫仍在往外湧。怎樣接話？',["Maybe. It's still foaming over—grab a towel.","No, it's completely frozen now.","The can is empty and dry.","Let's put it on the stove to boil."],"Maybe. It's still foaming over—grab a towel.",'承認搖晃是可能原因，同時回到眼前持續溢出的泡沫並提出處理。'),
  mc('native-361-v2-branch','branch','同伴問：「What happened?」你剛開了一罐可能被搖過的汽水。哪句最直接？',["It's foaming over! Can you pass me a towel?","The soup boiled over earlier.","There's a tear in the shopping bag.","The bottle has no cap but no liquid inside."],"It's foaming over! Can you pass me a towel?",'先報告汽水泡沫湧出的現況，再請對方拿毛巾，符合當下需要。'),
  open('native-361-v2-final','final','新情境：你開一瓶剛從背包拿出的汽水，泡沫突然越過瓶口湧到桌上。寫兩句英文提醒朋友，並請他遞紙巾。',["Watch out, the soda is foaming over! Could you hand me some tissues?","The soda is foaming over the top of the bottle. Please pass me a towel.","I think it was shaken because it's foaming over. Can you grab some paper towels?"],'自評時看是否說清泡沫正湧出，而不是汽水被煮滾，並提出即時清理請求。')
];
const steps=[
  {id:'native-361-v2-audio',style:'audio',label:'聽出泡沫',title:'汽水開罐後怎樣？',intro:'聽汽水開罐後泡沫是否湧過邊緣。',model:'The soda is foaming over.',zh:'汽水泡沫一直湧出。',audioOnly:true,questions:['native-361-v2-audio']},
  {id:'native-361-v2-repair',style:'repair',label:'修正動詞',title:'不是 boiling over',intro:'分清起泡與加熱沸騰。',questions:['native-361-v2-repair']},
  {id:'native-361-v2-continue',style:'continue',label:'接朋友推測',title:'可能被搖過',intro:'先處理正在發生的事。',questions:['native-361-v2-continue']},
  {id:'native-361-v2-branch',style:'branch',label:'即時回應',title:'同伴問發生甚麼',intro:'報告泡沫並請人協助。',questions:['native-361-v2-branch']},
  {id:'native-361-v2-speak',style:'speak',label:'即時口說',title:'汽水冒出來了',intro:'先自己說；錄音或跳過後才聽示範。',model:'The soda is foaming over.',zh:'汽水泡沫一直湧出。',speakingPrompt:'剛開汽水瓶，泡沫正越過瓶口。立即提醒朋友。',recording:'phrase',questions:[]},
  {id:'native-361-v2-final',style:'final',label:'背包汽水挑戰',title:'提醒並請紙巾',intro:'提醒汽水泡沫正湧出，並請人拿紙巾。',questions:['native-361-v2-final']}
];
export default {revision:2,summary:'用 foaming over 描述汽水開瓶後泡沫湧出，並與加熱沸騰區分。',steps,questions,takeaways:['The soda is foaming over.'],completionTitle:'你能即時描述汽水泡沫溢出，並請人幫忙清理。'};
