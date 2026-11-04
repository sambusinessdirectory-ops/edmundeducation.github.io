import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-144-v2-audio','audio','只聽這個冷凍食品狀況。包裝裡最可能看到甚麼？',['表面乾白、口感變差的斑塊。','表面有白色醬汁，口感仍正常。','冰晶覆蓋，但食物仍很新鮮。','表面結了一層霜，仍未見乾白斑。'],'表面乾白、口感變差的斑塊。','freezer burn 是冷凍食物長時間保存或包裝不密實後的乾燥變質痕跡。'),
  mc('native-144-v2-reverse','reverse','冰格裡的雞肉局部發白、乾硬，解凍後口感也變差。這種現象叫甚麼？',["freezer burn","a frost coating","a bruise","ice crystals"],"freezer burn",'freezer burn 指冷凍造成的乾燥斑；bruise 是受撞擊後的軟斑。'),
  mc('native-144-v2-scene','scene','你發現一盒雪糕放了很久，表面有乾燥冰晶，吃起來粗糙。哪句描述最貼切？',["The ice cream has freezer burn.","The ice cream is too soft from thawing.","The ice cream has melted and refrozen.","The ice cream has ice crystals but tastes normal."],"The ice cream has freezer burn.",'雪糕也可能因冷凍保存太久而品質下降；其他詞對應溫度或不同食物狀態。'),
  open('native-144-v2-final','final','最後挑戰：冰格裡有一包放了數月的雞胸肉，表面乾白。室友問你要不要用它煮晚餐。寫兩句英文描述觀察，再說明你的決定。',["The chicken has freezer burn and looks really dry. Let's use the newer pack instead.","This pack has some freezer burn. I'd rather cook the fresh chicken tonight."],'說出冷凍造成的乾白品質問題，再提出具體取捨；不要單憑此詞宣稱一定不安全。')
];
const steps=[
  {id:'native-144-v2-audio',style:'audio',label:'先聽現象',title:'冰格放太久',intro:'只聽一個冷凍食品詞。',model:'freezer burn',zh:'冷凍灼傷。',audioOnly:true,questions:['native-144-v2-audio']},
  {id:'native-144-v2-reverse',style:'reverse',label:'由外觀想詞',title:'乾白的雞肉',intro:'按可觀察的品質變化命名。',questions:['native-144-v2-reverse']},
  {id:'native-144-v2-scene',style:'scene',label:'換到雪糕',title:'冰晶與粗糙口感',intro:'同一現象不只在肉類出現。',questions:['native-144-v2-scene']},
  {id:'native-144-v2-speak',style:'speak',label:'口頭說明',title:'告訴室友雞肉狀況',intro:'先自己說；錄音或跳過後才聽示範。',model:'The chicken has freezer burn.',zh:'雞肉有冷凍灼傷。',speakingPrompt:'雞胸肉表面乾白。室友問它怎麼了。先口頭回答。',recording:'phrase',questions:[]},
  {id:'native-144-v2-final',style:'final',label:'晚餐挑戰',title:'要用哪包雞肉？',intro:'自己描述外觀並作決定。',questions:['native-144-v2-final']}
];
export default {revision:2,summary:'認識 freezer burn 對冷凍食物外觀和口感的影響，並能描述具體表徵。',steps,questions,takeaways:['freezer burn','The chicken has freezer burn.'],completionTitle:'你能說明冷凍食物的乾白斑和品質變化。'};
