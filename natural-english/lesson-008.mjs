import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'open',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-008-v2-scene','scene',
    '你看中一個背包，架上只有藍色。想問店員同一款有沒有黑色，怎樣說最清楚？',
    ['Do you have this in black?','Do you have a different backpack?','Is this black?','What colors do you like?'],
    'Do you have this in black?',
    'this 指你手上的同一款背包；in black 問它有沒有黑色版本。其他句子改問另一款、眼前顏色，或店員的喜好。'),
  mc('native-008-v2-audio','audio',
    '只聽客人和店員的對話。店員說 Let me check 時，哪件事尚未確定？',
    ['這款有沒有黑色。','客人是否已付款。','背包是否可以試背。','店員喜不喜歡藍色。'],
    '這款有沒有黑色。',
    '客人問黑色版本有沒有貨；Let me check 表示店員要先查，並沒有保證一定有。'),
  blank('native-008-v2-rewrite','rewrite',
    '你原本寫 Do you have this with black? 請改成自然問同一款有沒有黑色的完整句。',
    ['Do you have this in black?','Do you have it in black?'],
    '把顏色當作這一款的版本來問。',
    '問商品的顏色版本用 in black；this 和 it 都可指眼前的背包。'),
  blank('native-008-v2-final','final',
    '最後挑戰：朋友喜歡你拿着的外套，但架上只有灰色。他請你向店員問這款有沒有黑色。自己寫出完整英文問句。',
    ['Do you have this in black?','Do you have it in black?'],
    '問同一款的另一個顏色。',
    'Do you have this in black? 能準確指向眼前那款外套及所需顏色。')
];

const steps=[
  {id:'native-008-v2-scene',style:'scene',label:'選對需要',title:'同一款，換一個顏色',intro:'先分清你要的是另一個顏色，還是另一款背包。',model:'Do you have this in black?',zh:'這款有黑色嗎？',revealAfterAnswer:true,questions:['native-008-v2-scene']},
  {id:'native-008-v2-audio',style:'audio',label:'聽查貨對話',title:'Let me check 並不是「一定有」',intro:'先聽聲音；答完才看逐字稿。',model:'Do you have this in black? Let me check.',zh:'這款有黑色嗎？我查一下。',audioOnly:true,questions:['native-008-v2-audio']},
  {id:'native-008-v2-rewrite',style:'rewrite',label:'改寫訊息',title:'把 with black 改自然',intro:'改正顏色版本的說法，不用逐字照抄示範。',questions:['native-008-v2-rewrite']},
  {id:'native-008-v2-speak',style:'speak',label:'店內開口',title:'這次由你直接問店員',intro:'你手上拿着藍色背包，想找黑色。先自己說；錄音可以跳過。',model:'Do you have this in black?',zh:'這款有黑色嗎？',speakingPrompt:'店員：Can I help you? 你想問手上這款背包有沒有黑色。',recording:'phrase',questions:[]},
  {id:'native-008-v2-final',style:'final',label:'換物挑戰',title:'從背包轉到外套',intro:'商品變了，但你仍要問同一款的黑色版本。沒有選項。',questions:['native-008-v2-final']}
];

export default {revision:2,summary:'在店內問同一款商品的顏色版本，並聽懂店員尚未確認存貨的回應。',steps,questions,takeaways:['Do you have this in black?','What colors does this come in?'],completionTitle:'你能清楚問同款商品有沒有黑色了！'};
