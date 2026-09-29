import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-355-v2-audio','audio','只聽這句對平底鍋的描述。鍋底留了甚麼？',['燒焦並黏牢的食物層。','少量未煮的食材。','新倒進去的清水。','從鍋面剝落的塗層。'],'燒焦並黏牢的食物層。','burnt-on food 是煮焦後附着在鍋上的食物，不是鍋的塗層。'),
  mc('native-355-v2-scene','scene','你煎食物時火太大，鍋底留下一層焦黑的食物，刷不掉。哪句描述最準？',["There's burnt-on food on the pan.","The coating is flaking off.","The pan is filled with fresh sauce.","The handle is loose."],"There's burnt-on food on the pan.",'焦黑層來自食物；coating flaking off 則是鍋面材質脫落。'),
  mc('native-355-v2-branch','branch','朋友問：「Why are you soaking the pan?」你看到鍋底焦黏一層。怎樣答？',["There's burnt-on food all over the bottom. I'm trying to loosen it.","There's nothing on it; I just like water.","The handle has fallen into the sink.","The pan is brand new and unused."],"There's burnt-on food all over the bottom. I'm trying to loosen it.",'回答說明浸泡的原因和目的，與鍋底可見的焦黏物一致。'),
  mc('native-355-v2-continue','continue','朋友說：「That looks hard to clean.」哪句可自然接上？',["It is. The burnt-on food has stuck to the bottom.","No, the pan is already perfectly clean.","The food has never been in this pan.","The fridge is too cold to open."],"It is. The burnt-on food has stuck to the bottom.",'朋友說鍋難清洗；先承認，再指出燒焦食物黏住鍋底，正好解釋刷洗困難。'),
  mc('native-355-v2-tone','tone','你要請室友幫忙清洗，哪句清楚而不把責任推給他？',["I left the pan too long and there's burnt-on food. Could we soak it first?","You destroyed this pan even though you didn't use it.","There is absolutely nothing to clean.","The pan will never be usable again, so throw everything away."],"I left the pan too long and there's burnt-on food. Could we soak it first?",'承認自己煮得太久，說出焦黏問題，再禮貌提出浸泡。'),
  open('native-355-v2-transfer-write','transfer','新情境：你用另一隻鍋煎蛋後忘了關火，鍋底留下一層焦硬蛋液。寫兩句英文向室友描述殘留物和你的清潔打算。',["There's burnt-on egg on the bottom of this pan. I'll soak it before scrubbing.","The egg burned and stuck to the pan. I'm going to let it soak first.","I left the heat on too long, so there's burnt-on food underneath. I'll clean it after soaking."],'自評時看是否說出焦掉的是食物而非不沾塗層，並提出具體清潔步驟。')
];
const steps=[
  {id:'native-355-v2-audio',style:'audio',label:'聽出殘留物',title:'焦的是食物還是鍋？',intro:'分清鍋底焦黏的是食物還是塗層。',model:'There’s burnt-on food on the pan.',zh:'鍋上黏着燒焦食物。',audioOnly:true,questions:['native-355-v2-audio']},
  {id:'native-355-v2-scene',style:'scene',label:'檢查鍋底',title:'焦黑層刷不掉',intro:'按殘留物來源選描述。',questions:['native-355-v2-scene']},
  {id:'native-355-v2-branch',style:'branch',label:'回答浸泡原因',title:'為何把鍋放水裏？',intro:'接着朋友的問題說明清潔目的。',questions:['native-355-v2-branch']},
  {id:'native-355-v2-continue',style:'continue',label:'接着說',title:'朋友說這很難洗',intro:'用鍋底的具體情況回應。',questions:['native-355-v2-continue']},
  {id:'native-355-v2-tone',style:'tone',label:'請室友協助',title:'承認自己煮太久',intro:'清楚交代問題再提出請求。',questions:['native-355-v2-tone']},
  {id:'native-355-v2-transfer',style:'transfer',label:'換到煎蛋',title:'另一種焦黏食物',intro:'獨立寫兩句，將說法用到新食材。',questions:['native-355-v2-transfer-write']}
];
export default {revision:2,summary:'用 burnt-on food 指出鍋底焦黏的是食物，並與塗層剝落區分。',steps,questions,takeaways:['There’s burnt-on food on the pan.'],completionTitle:'你能說清鍋底焦黏物，並安排清潔。'};
