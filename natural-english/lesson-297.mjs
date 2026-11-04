import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-297-v2-audio','audio','聽完這句對手指的描述，最可能剛做過甚麼？',['在水裏泡了很久。','被熱鍋燙到。','被木刺扎到。','在寒風裏凍傷。'],'在水裏泡了很久。','pruney 是泡水後手指皮膚皺起來的口語說法。'),
  mc('native-297-v2-transfer','transfer','不在泳池，而是在浴缸泡了很久。手指一樣皺起來。哪句可用？',["My fingers are pruney after that bath.","My fingers have splinters from the bath.","My fingers are burned by dry air.","My fingers are covered in paint."],"My fingers are pruney after that bath.",'只要長時間泡水造成皺紋，浴缸和泳池都可用 pruney。'),
  mc('native-297-v2-explain','explain','這裏為何說 pruney，而不是 injured？',['它描述泡水後暫時皺起的外觀，沒有受傷線索。','它表示手指骨頭斷了。','它表示手指被刀割傷。','它表示手指失去知覺。'],'它描述泡水後暫時皺起的外觀，沒有受傷線索。','pruney 聚焦像梅乾般起皺，不暗示傷口或骨折。'),
  open('native-297-v2-final','final','新情境：你陪孩子游泳很久，上岸後孩子指着自己皺皺的手問原因。寫兩句自然英文描述手指和它們為何變這樣。',["Your fingers are pruney. They've been in the water for a long time.","Look, your fingers have gone all pruney. That's because you stayed in the pool so long.","Your fingers are wrinkly and pruney now. They'll look normal again after you're out of the water."],'自評時確認你說的是泡水後皺起，不誤說成燙傷或其他傷害。')
];
const steps=[
  {id:'native-297-v2-audio',style:'audio',label:'聽出原因',title:'手指為何皺皺的？',intro:'聽手指泡水後表面出現甚麼變化。',model:'My fingers are pruney.',zh:'我的手指泡水泡皺了。',audioOnly:true,questions:['native-297-v2-audio']},
  {id:'native-297-v2-transfer',style:'transfer',label:'換到浴缸',title:'不只游泳後才會',intro:'把同一說法用到另一種泡水情境。',questions:['native-297-v2-transfer']},
  {id:'native-297-v2-explain',style:'explain',label:'分清外觀',title:'皺起不等於受傷',intro:'解釋這個口語形容詞的範圍。',questions:['native-297-v2-explain']},
  {id:'native-297-v2-speak',style:'speak',label:'口頭描述',title:'泡水太久的手指',intro:'先自己說；錄音或跳過後才聽示範。',model:'My fingers are pruney.',zh:'我的手指泡水泡皺了。',speakingPrompt:'你浸浴很久，手指變得皺皺的。用一句英文描述。',recording:'phrase',questions:[]},
  {id:'native-297-v2-final',style:'final',label:'泳池挑戰',title:'向孩子解釋皺紋',intro:'用孩子能理解的話說手指為何泡皺。',questions:['native-297-v2-final']}
];
export default {revision:2,summary:'用 pruney 口語描述手指長時間泡水後變皺，並說明形成原因。',steps,questions,takeaways:['My fingers are pruney.'],completionTitle:'你能自然描述泡水皺起的手指，也能解釋原因。'};
