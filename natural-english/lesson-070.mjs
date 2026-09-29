import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-070-v2-audio','audio','只聽一句話。說話者目前的狀態是甚麼？',
    ['已準備好，可以出發或開始。','還要找一件重要物品。','決定取消行程。','正在問對方是否準備好。'],
    '已準備好，可以出發或開始。',"I'm good to go. 在此表示自己已準備妥當，不是在評價交通工具。"),
  mc('native-070-v2-tone','tone','朋友問 Do you need more time? 你已穿好鞋、帶齊物品。哪句簡短又肯定？',
    ["No, I'm good to go.","Yes, I'm still looking for my wallet.","I can never leave.","I might be ready next week."],
    "No, I'm good to go.",'先回答不用再等，再用 good to go 表示一切準備好了。'),
  open('native-070-v2-rewrite','rewrite','你傳了 Ready. 給等你的朋友，想更自然地表示你已準備好、現在可以出發。改寫成一句英文。',
    ["I'm good to go.","I'm ready to go.","I'm all set. Let's go."],
    'good to go 和 ready to go 都自然；這裏重點是已準備好，不需要對方再等。'),
  open('native-070-v2-final','final','最後挑戰：朋友在樓下等，你剛拿好鎖匙和外套，現在可以下樓出發。傳兩句簡短英文訊息：先說你已準備好，再說你現在下來。',
    ["I'm good to go. I'm coming down now.","I'm ready to go. I'm coming down now.","I'm all set. I'll come down now."],
    '把「準備好了」和「正在下樓」分開交代，朋友便知道不用再等你收拾。')
];

const steps=[
  {id:'native-070-v2-audio',style:'audio',label:'聽出狀態',title:'還要等嗎？',intro:'先只聽一句回覆。',model:'I’m good to go.',zh:'我準備好了，可以走了。',audioOnly:true,questions:['native-070-v2-audio']},
  {id:'native-070-v2-tone',style:'tone',label:'簡短確認',title:'不用再給我時間',intro:'直接接住朋友的問題。',questions:['native-070-v2-tone']},
  {id:'native-070-v2-speak',style:'speak',label:'出門口說',title:'朋友問你準備好了嗎',intro:'先自己說；錄音或跳過後才聽示範。',model:'I’m good to go.',zh:'我準備好了。',speakingPrompt:'朋友：Are you ready? 你已經帶齊東西，可以立刻出門。',recording:'phrase',questions:[]},
  {id:'native-070-v2-rewrite',style:'rewrite',label:'自然短訊',title:'不只傳 Ready.',intro:'把狀態寫成自然完整句。',questions:['native-070-v2-rewrite']},
  {id:'native-070-v2-final',style:'final',label:'樓下挑戰',title:'告訴朋友你現在下來',intro:'新情境，自己寫出狀態和下一個動作。',questions:['native-070-v2-final']}
];

export default {revision:2,summary:'用 I’m good to go. 表示準備好出發，並向等候的人更新下一個動作。',steps,questions,takeaways:['I’m good to go.','Is everything ready?'],completionTitle:'你能自然告訴朋友你已準備好，也能讓對方知道你現在會下來了！'};
