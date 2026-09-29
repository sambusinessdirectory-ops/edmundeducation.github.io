import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-055-v2-audio','audio','只聽一個餐廳飲品選擇。說話者要的是哪種水？',
    ['不帶氣泡的水。','氣泡水。','加糖水。','加冰汽水。'],
    '不帶氣泡的水。','still water 是不含氣泡的水；sparkling water 才是氣泡水。'),
  mc('native-055-v2-contrast','contrast','still water 和 tap water 必然一樣嗎？',
    ['不必然：still 說有沒有氣泡；tap 說水來自水龍頭。','是：兩個詞都表示必定免費。','是：兩個詞都表示必定是瓶裝水。','不一樣：still 是熱水，tap 是凍水。'],
    '不必然：still 說有沒有氣泡；tap 說水來自水龍頭。','一個描述氣泡，一個描述來源；瓶裝水也可以是 still，水龍頭的水通常也沒有氣泡。'),
  mc('native-055-v2-explain','explain','服務員問 Still or sparkling? 你回 Still, please.。為甚麼不需要先講 tap？',
    ['他在問有沒有氣泡，不是在問水的來源。','他已經答應提供免費水。','tap 只可用來說咖啡。','sparkling 指水是否加冰。'],
    '他在問有沒有氣泡，不是在問水的來源。','先回答對方實際提出的二選一問題；如果你另有水源或收費考量，再另行詢問。'),
  blank('native-055-v2-repair','repair','你在餐廳說 No gas water, please.，想表達不要氣泡。改成自然英文回應服務員的 Still or sparkling?。',
    ['Still, please.','Still water, please.','Just still water, please.','I would like still water, please.'],
    '用菜單上和服務員問題相同的飲品名稱。','Still, please. 直接選不帶氣泡的水，也避免把英文 gas 直譯進點餐。'),
  blank('native-055-v2-reverse','reverse','你想要普通自來水，並非指定瓶裝水。用一句禮貌英文向餐廳詢問。',
    ['Can I just get tap water?','Could I get tap water, please?','Can I have tap water, please?','Could I have some tap water?'],
    '這次要指定水源，而非只說有沒有氣泡。','tap water 指水龍頭供應的水；仍可禮貌問餐廳有沒有提供。'),
  blank('native-055-v2-final','final','最後挑戰：服務員問 Still or sparkling? 你不要氣泡水，但對方還未問瓶裝還是自來水。先用最簡短自然英文回答眼前的問題。',
    ['Still, please.','Still water, please.','Just still water, please.','Still, thanks.'],
    '只回答有沒有氣泡，不要猜餐廳的供水來源。','Still, please. 正好回應服務員的對比；tap water 是另一個問題。')
];

const steps=[
  {id:'native-055-v2-audio',style:'audio',label:'聽出水類',title:'有氣泡還是沒有？',intro:'先只聽飲品名稱。',model:'still water',zh:'沒有氣泡的水。',audioOnly:true,questions:['native-055-v2-audio']},
  {id:'native-055-v2-contrast',style:'contrast',label:'兩個分類',title:'still 不等於 tap',intro:'一個說氣泡，一個說來源。',questions:['native-055-v2-contrast']},
  {id:'native-055-v2-explain',style:'explain',label:'聽懂問題',title:'服務員真正問哪一件事？',intro:'不要回答對方沒有問的供水問題。',questions:['native-055-v2-explain']},
  {id:'native-055-v2-repair',style:'repair',label:'修正點餐',title:'不要直譯「氣」',intro:'改成餐廳自然聽得懂的說法。',questions:['native-055-v2-repair']},
  {id:'native-055-v2-reverse',style:'reverse',label:'指定自來水',title:'如果你真正想問 tap water',intro:'換一種分類來提出請求。',questions:['native-055-v2-reverse']},
  {id:'native-055-v2-final',style:'final',label:'即場回答',title:'Still or sparkling?',intro:'無選項，先答眼前問題。',questions:['native-055-v2-final']}
];

export default {revision:2,summary:'分清 still/sparkling 的氣泡差別與 tap 的水源差別，準確回答餐廳的問題。',steps,questions,takeaways:['still water','Can I just get tap water?'],completionTitle:'你能清楚選擇不帶氣泡的水，也不會把 still 和 tap 混為一談了！'};
