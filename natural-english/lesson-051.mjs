import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-051-v2-audio','audio','只聽一句話。說話者進行下一個活動前要做甚麼？',
    ['把自己身上的水擦乾。','再洗一次澡。','把衣服洗乾淨。','把地上的水抹乾。'],
    '把自己身上的水擦乾。','dry myself off 指把自己身上的水擦乾，常見於洗澡、游泳或淋雨之後。'),
  mc('native-051-v2-explain','explain','I need to dry myself off. 的 myself 為甚麼重要？',
    ['它說明被擦乾的是說話者自己。','它表示說話者要幫別人擦乾。','它表示衣服需要熨平。','它表示水要流走。'],
    '它說明被擦乾的是說話者自己。','myself 讓動作回到說話者身上；dry the floor off 則會換成地板。'),
  mc('native-051-v2-reverse','reverse','你剛游完泳，朋友催你出門；你還濕透。哪句先交代你需要的動作？',
    ['Give me a second. I need to dry myself off.','Give me a second. I need to wash the dishes.','I need to dry the swimming pool.','I am dry already.'],
    'Give me a second. I need to dry myself off.','朋友在等你，先請他稍等，再說你要把自己擦乾。'),
  blank('native-051-v2-final','final','最後挑戰：你淋雨回家，外套和頭髮都濕。室友問你要不要立刻吃飯；你想先擦乾自己。寫一句自然英文回覆。',
    ['Let me dry myself off first.','I need to dry myself off first.','Give me a minute to dry myself off.','I need to dry off first.'],
    '先說你要處理身上的水，再去吃飯。','dry myself off / dry off 都能表示把自己擦乾；first 交代這是吃飯前要做的事。')
];

const steps=[
  {id:'native-051-v2-audio',style:'audio',label:'聽出動作',title:'為何還不能出門？',intro:'先只聽聲音，判斷動作對象。',model:'I need to dry myself off.',zh:'我需要把自己擦乾。',audioOnly:true,questions:['native-051-v2-audio']},
  {id:'native-051-v2-explain',style:'explain',label:'釐清對象',title:'擦乾誰？',intro:'留意反身代名詞。',questions:['native-051-v2-explain']},
  {id:'native-051-v2-reverse',style:'reverse',label:'游泳之後',title:'朋友催你出門',intro:'把動作放進等待你的對話。',questions:['native-051-v2-reverse']},
  {id:'native-051-v2-speak',style:'speak',label:'即時口說',title:'請朋友等一等',intro:'先自己說；錄音或跳過後才聽示範。',model:'I need to dry myself off.',zh:'我需要把自己擦乾。',speakingPrompt:'朋友：Ready to go? 你剛洗完澡，身上還濕。',recording:'phrase',questions:[]},
  {id:'native-051-v2-final',style:'final',label:'淋雨挑戰',title:'先擦乾再吃飯',intro:'新情境，不給選項，自己說明先後次序。',questions:['native-051-v2-final']}
];

export default {revision:2,summary:'用 dry myself off 說明要把身上的水擦乾，並在別人等候時交代先後次序。',steps,questions,takeaways:['dry yourself off','I need to dry myself off.'],completionTitle:'你能自然說出把自己擦乾，也能清楚請人等一等了！'};
