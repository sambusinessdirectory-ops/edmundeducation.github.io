import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'open',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-030-v2-scene','scene',
    '你試穿一件恤衫，扣得到鈕，但肩膀和胸口有點繃。店員問 How does it fit? 哪句最準確？',
    ["It's a little tight.","It's a little loose.",'It fits perfectly.','The color is too bright.'],
    "It's a little tight.",
    'a little tight 描述穿得下，但有點緊；loose 是鬆，perfectly 是剛好。'),
  mc('native-030-v2-audio','audio',
    '只聽試穿後的一句評語。這件衣服的尺寸如何？',
    ['穿得下，但稍微緊。','太鬆會滑下來。','完全合身。','沒有試穿過。'],
    '穿得下，但稍微緊。',
    'It’s a little tight. 的 a little 表示程度不重；tight 說的是穿上後繃緊的感覺。'),
  mc('native-030-v2-explain','explain',
    '你想請店員拿大一號。為甚麼說 It’s a little tight. 比只說 It’s small. 更能幫他理解？',
    ['它直接描述穿在身上的感覺和程度。','它表示衣服太長。','它告訴店員你不喜歡顏色。','它表示你還沒試穿。'],
    '它直接描述穿在身上的感覺和程度。',
    'small 可以描述尺碼，但 a little tight 更具體說明穿上後哪裏不舒服、程度有多大。'),
  blank('native-030-v2-final','final',
    '最後挑戰：你試了一雙鞋，腳趾位置有點擠，但仍能穿上。店員問 How do they fit? 用一句自然英文描述這雙鞋。',
    ["They're a little tight.",'These shoes are a little tight.',"They're a bit tight.",'These shoes are a bit tight.'],
    '這次是雙鞋；留意代詞與單複數。',
    'They’re a little tight. 用 they 指這雙鞋，也清楚交代只是「有點」緊。')
];

const steps=[
  {id:'native-030-v2-scene',style:'scene',label:'試穿判斷',title:'扣得上，但肩膀有點繃',intro:'用穿着感受回答，不要只看標籤尺碼。',questions:['native-030-v2-scene']},
  {id:'native-030-v2-audio',style:'audio',label:'聽出程度',title:'到底有多緊？',intro:'只聽聲音，先判斷合身程度。',model:'It’s a little tight.',zh:'它有點緊。',audioOnly:true,questions:['native-030-v2-audio']},
  {id:'native-030-v2-explain',style:'explain',label:'說明理由',title:'讓店員知道問題在哪',intro:'分清標籤大小和穿上後的實際感受。',questions:['native-030-v2-explain']},
  {id:'native-030-v2-speak',style:'speak',label:'口說回應',title:'店員等你評價',intro:'先用自己的聲音回覆；錄音或跳過後才聽示範。',model:'It’s a little tight.',zh:'它有點緊。',speakingPrompt:'店員：How does the shirt fit? 你穿得下，但有點繃。',recording:'phrase',questions:[]},
  {id:'native-030-v2-final',style:'final',label:'換物品挑戰',title:'外套換成一雙鞋',intro:'沒有選項，留意雙鞋要用複數說法。',questions:['native-030-v2-final']}
];

export default {revision:2,summary:'描述衣物或鞋子稍微繃緊的穿着感受，並用 a little 準確表達程度。',steps,questions,takeaways:['It’s a little tight.','It fits perfectly.'],completionTitle:'你能清楚告訴店員衣服或鞋有點緊了！'};
