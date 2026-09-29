import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'open',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-050-v2-audio','audio','只聽一句話。說話者接下來需要做甚麼？',
    ['清洗吃飯用過的碗碟餐具。','洗衣服。','擦乾餐桌。','再煮一頓飯。'],
    '清洗吃飯用過的碗碟餐具。','do the dishes 是日常說「洗碗碟」；dishes 在這裏也包括用過的餐具。'),
  mc('native-050-v2-scene','scene','朋友煮完晚餐，你自願負責餐後清洗碗碟。哪句自然？',
    ["Thanks for cooking. I'll do the dishes.","Thanks for cooking. I'll do the laundry.","Thanks for cooking. I'll set the table now.","Thanks for cooking. I'll leave everything dirty."],
    "Thanks for cooking. I'll do the dishes.",'煮飯和洗碗可以分工；do the dishes 正好表示你願意處理餐後碗碟。'),
  mc('native-050-v2-contrast','contrast','do the dishes 和 wash the dishes 的關係是甚麼？',
    ['兩者都能說洗碗碟，前者更像日常家務名稱。','前者是煮飯，後者才是洗碗。','前者只洗杯子，後者只洗鍋。','前者是用洗碗機，後者一定是手洗。'],
    '兩者都能說洗碗碟，前者更像日常家務名稱。','兩句通常都可以描述清理用過的碗碟；do 不限定一定手洗或用機器。'),
  blank('native-050-v2-repair','repair','你說 I need to make the dishes.，但意思是「飯後我需要洗碗」。把動詞改成自然說法，寫完整一句。',
    ['I need to do the dishes.','I need to wash the dishes.','I have to do the dishes.','I have to wash the dishes.'],
    'make 會像是製造碗碟；你要說清洗家務。','I need to do the dishes. 和 I need to wash the dishes. 都自然，意思是飯後清洗碗碟。'),
  blank('native-050-v2-reverse','reverse','室友問 Who’s doing the dishes tonight? 你自願負責。用一句簡短英文答應。',
    ["I'll do the dishes.","I can do the dishes.","I'll wash the dishes.","I can wash the dishes."],
    '回答「我來做」，不是再問一次。',"I'll do the dishes. 清楚接下這項家務；I can… 也可自然表示自願。")
];

const steps=[
  {id:'native-050-v2-audio',style:'audio',label:'聽出家務',title:'飯後還有甚麼事？',intro:'先只聽聲音，辨認家務。',model:'I need to wash the dishes.',zh:'我需要洗碗。',audioOnly:true,questions:['native-050-v2-audio']},
  {id:'native-050-v2-scene',style:'scene',label:'餐後分工',title:'朋友煮飯，你來洗碗',intro:'在真實分工中選自然回覆。',questions:['native-050-v2-scene']},
  {id:'native-050-v2-contrast',style:'contrast',label:'兩種說法',title:'do 或 wash 都可以',intro:'分清自然變體與真正不同的家務。',questions:['native-050-v2-contrast']},
  {id:'native-050-v2-repair',style:'repair',label:'修正動詞',title:'不是 make the dishes',intro:'把字面直譯改為地道家務說法。',questions:['native-050-v2-repair']},
  {id:'native-050-v2-speak',style:'speak',label:'口頭承擔',title:'告訴室友你來洗碗',intro:'先自己說；錄音或跳過後才聽示範。',model:'I need to wash the dishes.',zh:'我需要洗碗。',speakingPrompt:'室友：What are you doing after dinner? 你要清洗用過的碗碟。',recording:'phrase',questions:[]},
  {id:'native-050-v2-reverse',style:'reverse',label:'主動答應',title:'今晚誰負責？',intro:'從理解別人的話，轉到自己接下家務。',questions:['native-050-v2-reverse']}
];

export default {revision:2,summary:'在餐後分工中自然說 do/wash the dishes，並避免直譯成 make the dishes。',steps,questions,takeaways:['do the dishes','I need to wash the dishes.'],completionTitle:'你能自然談洗碗家務，也能主動接下餐後清理了！'};
