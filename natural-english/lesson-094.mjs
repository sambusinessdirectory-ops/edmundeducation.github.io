import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-094-v2-audio','audio','只聽這個片語。它可以描述哪種變化？',
    ['原本連在物件上的部分脫落。','物件的顏色變深。','物件忽然變得很重。','有人把物件買走。'],
    '原本連在物件上的部分脫落。','come off 可說把手、鈕扣、蓋子等從原位脫落；不能單憑片語知道是否有人拆下。'),
  mc('native-094-v2-reverse','reverse','The handle came off。怎樣轉述才沒有加入未知的原因？',
    ['把手脫落了。','有人故意扯掉把手。','把手被偷走了。','把手因高溫融化了。'],
    '把手脫落了。','came off 交代結果，未交代是磨損、意外或有人動手。'),
  mc('native-094-v2-contrast','contrast','The handle came off 和 The handle is loose 有甚麼不同？',
    ['前者已脫落；後者仍在原位但鬆動。','兩句都保證把手完好。','前者指顏色；後者指溫度。','後者表示把手已經不見了。'],
    '前者已脫落；後者仍在原位但鬆動。','come off 說部件離開了原位；loose 只說連接不緊。'),
  mc('native-094-v2-transfer','transfer','外套的鈕扣洗完後掉下來。哪句可把今天的片語用到新物件？',
    ['The button came off in the wash.','The button came on in the wash.','The button was thirsty in the wash.','The button arrived at the shop.'],
    'The button came off in the wash.','部件從原位脫落時可用 came off；in the wash 補上發生時的情境。'),
  open('native-094-v2-writing','transfer','你打開抽屜時，抽屜把手突然整個脫落。你要向同事報告。用兩句英文說明發生了甚麼，以及現在需要怎樣處理；不要假定脫落原因。',
    ["The drawer handle came off when I opened it. Could someone take a look?","The handle came off the drawer. We should get it fixed.","The drawer handle came off just now. I'll report it so it can be repaired."],
    '用 came off 報告看得到的結果，處理方法可按情況改；不要無證據說成有人故意弄壞。')
];
const steps=[
  {id:'native-094-v2-audio',style:'audio',label:'聽出變化',title:'原本連著的部分',intro:'先只聽片語。',model:'come off',zh:'脫落。',audioOnly:true,questions:['native-094-v2-audio']},
  {id:'native-094-v2-reverse',style:'reverse',label:'準確轉述',title:'結果不等於原因',intro:'避免替脫落的把手編原因。',questions:['native-094-v2-reverse']},
  {id:'native-094-v2-contrast',style:'contrast',label:'分清程度',title:'鬆了，還是已經掉了？',intro:'比較兩種不同狀態。',questions:['native-094-v2-contrast']},
  {id:'native-094-v2-speak',style:'speak',label:'口頭報告',title:'把手掉了',intro:'先自己說；錄音或跳過後才聽示範。',model:'The handle came off.',zh:'把手脫落了。',speakingPrompt:'你一拉門，把手整個掉下來。向旁邊的人說發生了甚麼。',recording:'phrase',questions:[]},
  {id:'native-094-v2-transfer',style:'transfer',label:'換件物品',title:'鈕扣也會掉',intro:'先辨認用法，再在新情境自行報告。',questions:['native-094-v2-transfer','native-094-v2-writing']}
];
export default {revision:2,summary:'用 come off 描述部件脫落，並分清鬆動與已脫落。',steps,questions,takeaways:['come off','The handle came off.'],completionTitle:'你能準確報告零件脫落，而不亂猜原因。'};
