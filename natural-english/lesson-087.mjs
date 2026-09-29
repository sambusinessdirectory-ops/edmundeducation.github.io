import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-087-v2-audio','audio','只聽包裝上的詞組。它明確保證了甚麼？',
    ['製作時沒有額外加入糖。','飲品完全不含任何糖。','飲品必然沒有熱量。','所有甜味都來自代糖。'],
    '製作時沒有額外加入糖。','no added sugar 只說沒有額外加糖；水果等原料本身仍可能含天然糖。'),
  mc('native-087-v2-reverse','reverse','果汁標示 no added sugar。怎樣用中文準確解釋給朋友？',
    ['沒有額外加糖，但不等於完全無糖。','任何人喝都不會攝取糖。','已經去掉水果本身所有糖分。','這瓶只有人工甜味劑。'],
    '沒有額外加糖，但不等於完全無糖。','關鍵是 added：沒有在原料以外加糖；原料本身有沒有糖，要另外看。'),
  mc('native-087-v2-repair','repair','店員說 This juice has no added sugar。你轉述為「這是零糖果汁」。怎樣修正較準確？',
    ['改說「沒有額外加糖」，再查看營養標示了解糖含量。','繼續說零糖，兩者完全一樣。','改說「它一定有代糖」。','改說「它的水果沒有天然糖」。'],
    '改說「沒有額外加糖」，再查看營養標示了解糖含量。','不要把 no added sugar 當成 sugar-free；兩者的承諾不同。'),
  mc('native-087-v2-tone','tone','朋友問 Is this sugar-free? 你只知道包裝寫 no added sugar。哪個回答最誠實、也最有幫助？',
    ["Not exactly. It says no added sugar, but it may still contain natural sugar.","Yes, it definitely has zero sugar of any kind.","No, it must be loaded with extra sugar.","I can guarantee it has no calories."],
    "Not exactly. It says no added sugar, but it may still contain natural sugar.",'Not exactly 禮貌地修正對方的理解，沒有超出包裝資料作保證。'),
  open('native-087-v2-final','final','最後挑戰：朋友想買「完全無糖」飲品。你看到一瓶果汁只標示 no added sugar。用兩句英文解釋這標示的意思，並提醒朋友它可能仍有天然糖。',
    ["It says no added sugar, not sugar-free. The fruit may still contain natural sugar.","No added sugar means they didn't add extra sugar. It might still have sugar from the fruit.","This juice has no added sugar, but it may still contain natural sugar. Check the label if you need sugar-free."],
    '把「沒有額外加糖」和「完全無糖」分開說清楚；不要替產品作包裝沒有提供的保證。')
];
const steps=[
  {id:'native-087-v2-audio',style:'audio',label:'聽懂標示',title:'added 是關鍵',intro:'先只聽標示，判斷它保證甚麼。',model:'no added sugar',zh:'沒有額外加糖。',audioOnly:true,questions:['native-087-v2-audio']},
  {id:'native-087-v2-reverse',style:'reverse',label:'向朋友翻譯',title:'沒有加，不等於沒有',intro:'準確轉述標示的範圍。',questions:['native-087-v2-reverse']},
  {id:'native-087-v2-repair',style:'repair',label:'修正誤會',title:'別當成零糖',intro:'發現轉述過度肯定時怎樣改。',questions:['native-087-v2-repair']},
  {id:'native-087-v2-tone',style:'tone',label:'溫和提醒',title:'回答 Is this sugar-free?',intro:'用有分寸的語氣補充限制。',questions:['native-087-v2-tone']},
  {id:'native-087-v2-speak',style:'speak',label:'口頭說標示',title:'只說已知的事',intro:'先自己說；錄音或跳過後才聽示範。',model:'No added sugar.',zh:'沒有額外加糖。',speakingPrompt:'朋友指著包裝問這瓶飲品寫甚麼。只說標示上已知的內容。',recording:'phrase',questions:[]},
  {id:'native-087-v2-final',style:'final',label:'果汁架挑戰',title:'向要買無糖飲品的人解釋',intro:'自己把標示的界線說清楚。',questions:['native-087-v2-final']}
];
export default {revision:2,summary:'分清 no added sugar 與 sugar-free；前者不排除原料本身含天然糖。',steps,questions,takeaways:['no added sugar','No added sugar.'],completionTitle:'你能準確解釋「無加糖」，也不會把它誤說成零糖。'};
