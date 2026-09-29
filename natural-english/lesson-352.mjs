import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-352-v2-audio','audio','先聽這句水果描述。水果最可能怎樣？',['放久失水，縮小起皺。','剛洗過而濕潤。','表面長滿可見黴點。','被刀切成小塊。'],'放久失水，縮小起皺。','shriveled 描述水分流失後皺縮，不等於長黴。'),
  mc('native-352-v2-scene','scene','冰箱裏的葡萄放了很久，表皮皺起、果粒變小。哪句貼切？',["The grapes are shriveled.","The grapes are moldy.","The grapes are frozen solid.","The grapes have been sliced."],"The grapes are shriveled.",'皺縮與體積變小是 shriveled 的關鍵；沒有黴點或冰凍線索。'),
  mc('native-352-v2-explain','explain','與單說 wrinkled 相比，shriveled 多帶出甚麼？',['因失水而皺縮、變小。','水果剛被烘烤成熟。','水果只在表面畫了皺紋。','水果一定含有酒精。'],'因失水而皺縮、變小。','shriveled 除皺紋外，也強調乾癟、收縮的狀態。'),
  mc('native-352-v2-rewrite','rewrite','朋友問你為何不拿這盤葡萄待客，原稿只寫「They look old」。哪句更具體？',["They've become shriveled in the fridge.","They're still wet from washing.","They're freshly picked and firm.","They've been cut into pieces."],"They've become shriveled in the fridge.",'指出在冰箱放久後皺縮，比泛說 old 更能說明外觀。'),
  open('native-352-v2-final','final','新情境：你清理冰箱，發現盒內葡萄表皮皺了、果粒縮小。寫兩句英文向家人說明狀況，並提出用較新鮮水果待客。',["These grapes are shriveled from sitting in the fridge. Let's serve the fresh fruit instead.","The grapes have shrunk and look shriveled. We should use the newer fruit for our guests.","I don't think these shriveled grapes look fresh enough to serve. Let's bring out the apples instead."],'自評時看是否說出失水皺縮，不把它直接誤當成長黴。')
];
const steps=[
  {id:'native-352-v2-audio',style:'audio',label:'聽出外觀',title:'水果怎樣變小？',intro:'辨認水果是否因失水而皺縮。',model:'The fruit is shriveled.',zh:'水果乾縮起皺了。',audioOnly:true,questions:['native-352-v2-audio']},
  {id:'native-352-v2-scene',style:'scene',label:'冰箱葡萄',title:'皺而縮小',intro:'用可見外觀判斷。',questions:['native-352-v2-scene']},
  {id:'native-352-v2-explain',style:'explain',label:'比較皺紋',title:'不只 wrinkled',intro:'說明乾癟所帶出的額外意思。',questions:['native-352-v2-explain']},
  {id:'native-352-v2-rewrite',style:'rewrite',label:'改寫評語',title:'比 old 更具體',intro:'把含糊評語換成可見變化。',questions:['native-352-v2-rewrite']},
  {id:'native-352-v2-speak',style:'speak',label:'口頭描述',title:'冰箱裏的舊水果',intro:'先自己說；錄音或跳過後才聽示範。',model:'The fruit is shriveled.',zh:'水果乾縮起皺了。',speakingPrompt:'水果放久，表面皺起而且縮小。用一句英文描述。',recording:'phrase',questions:[]},
  {id:'native-352-v2-final',style:'final',label:'待客挑戰',title:'說明為何換水果',intro:'指出葡萄皺縮，並提出改用較新鮮的水果。',questions:['native-352-v2-final']}
];
export default {revision:2,summary:'用 shriveled 描述水果放久失水後皺縮，並與長黴區分。',steps,questions,takeaways:['The fruit is shriveled.'],completionTitle:'你能準確描述乾癟水果，並向家人說明換水果的原因。'};
