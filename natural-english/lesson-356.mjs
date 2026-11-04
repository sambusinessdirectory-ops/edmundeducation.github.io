import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-356-v2-audio','audio','聽完這句食物評語，熟度問題在哪裏？',['外面看似熟，中間仍未熟透。','整塊肉都烤焦了。','只有外層仍是生的。','肉裏有很多筋。'],'外面看似熟，中間仍未熟透。','undercooked in the middle 把未熟的位置限定在中間。'),
  mc('native-356-v2-explain','explain','店員問你為何特別說 in the middle。哪項理由最有根據？',['外面看起來熟，切開後才見中心未熟。','肉的中央完全燒焦。','你只想說肉太鹹。','你想指出餐碟放錯位置。'],'外面看起來熟，切開後才見中心未熟。','in the middle 指出外表不一定看得出的內部熟度問題。'),
  mc('native-356-v2-repair','repair','你原本只對服務員說「The burger is bad」。切開後中心肉仍未熟。怎樣改得可處理？',["The burger is undercooked in the middle.","The burger has too much sauce.","The bun is stale on top.","The burger is gristly all through."],"The burger is undercooked in the middle.",'說出未熟位置，服務員便知道問題在肉餅中心而非味道或麵包。'),
  mc('native-356-v2-continue','continue','服務員說：「I’m sorry. I can have them cook it longer.」你想接受。怎樣回答？',["Yes, please. The middle still seems undercooked.","No, I want it frozen instead.","The bun needs more sugar.","I've already finished the burger."],"Yes, please. The middle still seems undercooked.",'服務員提出再煮，Yes, please 表示接受；重申肉餅中心未熟，方便廚房處理正確部位。'),
  open('native-356-v2-branch-write','branch','新情境：餐廳漢堡外面已煎熟，你切開後發現肉餅中心仍未熟。服務員問「Is everything okay?」寫兩句禮貌英文說明，並請廚房再煮一會。',["The patty is undercooked in the middle. Could the kitchen cook it a little longer?","I'm sorry, but the center of my burger seems undercooked. Would you mind having it cooked more?","The outside looks done, but the burger is still undercooked in the middle. Could you take it back for a bit longer?"],'自評時看是否把問題定位在肉餅中間，並禮貌提出再煮的請求。')
];
const steps=[
  {id:'native-356-v2-audio',style:'audio',label:'聽出熟度位置',title:'外熟內生？',intro:'聽肉餅外面與中間的熟度是否一致。',model:'It’s undercooked in the middle.',zh:'中間還未熟透。',audioOnly:true,questions:['native-356-v2-audio']},
  {id:'native-356-v2-explain',style:'explain',label:'指出內部',title:'為何要說 in the middle？',intro:'把外觀與切開後所見分開。',questions:['native-356-v2-explain']},
  {id:'native-356-v2-repair',style:'repair',label:'修準抱怨',title:'比 bad 更有用',intro:'說清楚服務員可處理的問題。',questions:['native-356-v2-repair']},
  {id:'native-356-v2-continue',style:'continue',label:'回應服務員',title:'接受再煮',intro:'接着對方的補救建議回答。',questions:['native-356-v2-continue']},
  {id:'native-356-v2-speak',style:'speak',label:'即時口說',title:'說出中心未熟',intro:'先自己說；錄音或跳過後才聽示範。',model:'It’s undercooked in the middle.',zh:'中間還未熟透。',speakingPrompt:'肉餅表面看似熟，切開中心仍未熟。向服務員簡短指出。',recording:'phrase',questions:[]},
  {id:'native-356-v2-branch',style:'branch',label:'餐廳挑戰',title:'禮貌請廚房再煮',intro:'獨立寫兩句，再依示例自評。',questions:['native-356-v2-branch-write']}
];
export default {revision:2,summary:'用 undercooked in the middle 指出肉餅或牛排外熟內未熟，並提出再煮請求。',steps,questions,takeaways:['It’s undercooked in the middle.'],completionTitle:'你能禮貌指出肉餅中心未熟，讓餐廳準確處理。'};
