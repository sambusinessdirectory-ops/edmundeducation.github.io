import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-453-v2-audio','audio','先只聽紙飲筒的變化。它怎樣了？',['泡久後變濕軟。','被珍珠堵住。','被咬扁但仍乾燥。','掉進杯底。'],'泡久後變濕軟。','gone soggy 說紙吸收飲料後軟塌，不是通道被果粒堵住。'),
  mc('native-453-v2-scene','scene','紙飲筒浸在冰飲裏半小時，杯口的一段也彎軟了；裏面沒有果粒。哪句貼切？',["The paper straw has gone soggy.","The straw is clogged.","The straw is cracked.","The straw is too narrow."],"The paper straw has gone soggy.",'紙遇水變軟是 soggy；沒有卡物就不是 clogged。'),
  mc('native-453-v2-contrast','contrast','哪個情況應說 soggy 而非 clogged？',['紙飲筒吸水後一碰就軟。','珍珠卡在硬飲筒中間。','果肉塞住飲筒口。','飲筒內有冰粒，吸不上飲料。'],'紙飲筒吸水後一碰就軟。','soggy 描述紙材的濕軟狀態；其餘是通道被東西堵塞。'),
  mc('native-453-v2-rewrite','rewrite','把 My straw is broken 改得更具體：它是泡太久變軟，沒有斷也沒有堵。',["My paper straw is getting soggy.","My straw is clogged with fruit.","My straw has snapped in two.","My straw won't reach the drink."],"My paper straw is getting soggy.",'getting soggy 表示正在逐漸濕軟，與斷裂或堵塞不同。'),
  open('native-453-v2-final','final','新場景：你喝冰茶喝得很慢，紙飲筒泡到軟塌，朋友以為裏面有東西卡住。寫兩句英文澄清問題，並要求換一根。',["The paper straw has gone soggy; nothing is stuck in it. Could I have another straw?","It's not clogged—my paper straw is getting soggy. May I get a fresh one?"],'把紙材泡軟與堵塞區分開，再提出換新飲筒的請求。')
];
const steps=[
  {id:'native-453-v2-audio',style:'audio',label:'先聽變化',title:'紙飲筒泡久了',intro:'只憑聲音判斷問題。',model:'The paper straw has gone soggy.',zh:'紙飲筒泡到濕軟了。',audioOnly:true,questions:['native-453-v2-audio']},
  {id:'native-453-v2-scene',style:'scene',label:'看紙材',title:'管口彎軟',intro:'用材料狀態選句子。',questions:['native-453-v2-scene']},
  {id:'native-453-v2-contrast',style:'contrast',label:'軟還是堵',title:'兩種飲筒問題',intro:'分清 soggy 和 clogged。',questions:['native-453-v2-contrast']},
  {id:'native-453-v2-rewrite',style:'rewrite',label:'說得更具體',title:'不是斷裂',intro:'把籠統描述改準。',model:'My paper straw is getting soggy.',zh:'我的紙飲筒開始泡軟了。',questions:['native-453-v2-rewrite']},
  {id:'native-453-v2-final',style:'final',label:'換飲筒挑戰',title:'慢慢喝冰茶',intro:'寫出澄清與請求。',questions:['native-453-v2-final']}
];
// Source PDF filenames 452/453 are swapped: soggy-paper-straw content/audio originated in imported 452.
export default {revision:2,summary:'用 gone soggy 說紙飲筒泡久變軟，與果粒堵住飲筒區分。',steps,questions,takeaways:['The paper straw has gone soggy.','My paper straw is getting soggy.'],completionTitle:'你能說明紙飲筒泡軟並請求換一根。'};
