import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-267-v2-audio','audio','聽完這句提醒，對方剛才最可能怎樣？',['離開座位時把一件物品留在原處。','手上的物品剛跌到地上。','借走說話者的手機。','把包裹交到櫃台。'],'離開座位時把一件物品留在原處。','left this behind 指人走了，物品仍留在原來的地方。'),
  mc('native-267-v2-detail','detail','哪個畫面最符合「left this behind」？',['乘客下了巴士，外套仍搭在座椅上。','乘客走路時外套掉在腳邊。','乘客把外套穿在身上走了。','乘客特意把外套送給朋友。'],'乘客下了巴士，外套仍搭在座椅上。','behind 說明物品在離開後留在原處；掉落、帶走和送贈都不同。'),
  mc('native-267-v2-reverse','reverse','你追上離開咖啡店的陌生人，拿着他忘在桌上的手機。哪句提醒最準確？',["Excuse me, you left this behind.","Excuse me, you dropped this on the floor.","Excuse me, you borrowed my phone.","Excuse me, your phone is ringing."],"Excuse me, you left this behind.",'手機留在桌上，並非行走時掉到地上；this 可配合把手機遞給對方。'),
  mc('native-267-v2-explain','explain','為何同一情境不用「You dropped something」？',['手機仍在桌上，沒發生跌落。','因為 dropped 只可用於食物。','因為 behind 指手機在身後掉落。','因為手機已被對方拿走。'],'手機仍在桌上，沒發生跌落。','drop 表示掉落；leave behind 表示離開時遺留，兩個動作不同。'),
  open('native-267-v2-explain-write','explain','新情境：一位乘客下車後，你發現他的圍巾仍掛在座椅背。你追上去歸還。寫兩句英文叫住他並指出圍巾是在哪裏留下的。',
    ["Excuse me, you left this behind. Your scarf was hanging on the seat.","Wait, I think this scarf is yours. You left it on the bus seat.","You left your scarf behind on the seat. Here it is."],
    '自評時確認你說的是離開時遺留在座位，而非行走時掉到地上。')
];
const steps=[
  {id:'native-267-v2-audio',style:'audio',label:'聽出遺漏',title:'物品還在哪裏？',intro:'先只聽提醒，不看英文。',model:'You left this behind.',zh:'你把這個忘在這裏了。',audioOnly:true,questions:['native-267-v2-audio']},
  {id:'native-267-v2-detail',style:'detail',label:'觀察現場',title:'外套留在巴士座位',intro:'用物品的位置判斷動作。',questions:['native-267-v2-detail']},
  {id:'native-267-v2-reverse',style:'reverse',label:'手機情境',title:'追上剛離開的客人',intro:'把桌上的遺留物對應到英文提醒。',questions:['native-267-v2-reverse']},
  {id:'native-267-v2-explain',style:'explain',label:'分清動作',title:'忘在桌上還是掉地上？',intro:'比較 leave behind 和 drop。',questions:['native-267-v2-explain','native-267-v2-explain-write']},
  {id:'native-267-v2-speak',style:'speak',label:'即時提醒',title:'把手機還給客人',intro:'先自己說；錄音或跳過後才聽示範。',model:'You left this behind.',zh:'你把這個忘在這裏了。',speakingPrompt:'剛離開的客人把手機留在座位上。你追上去，把手機遞給他。',recording:'phrase',questions:[]}
];
export default {revision:2,summary:'用 left this behind 提醒人離開時遺留物品，並與物品掉落的 dropped 分開。',steps,questions,takeaways:['You left this behind.'],completionTitle:'你能自然叫住忘記物品的人，也能說準物品發生了甚麼事。'};
