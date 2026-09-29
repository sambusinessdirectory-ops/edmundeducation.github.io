const mc=(id,style,prompt,options,answer,explanation)=>({id,type:'mc',style,prompt,options,answers:[answer],explanation});
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-022-v2-audio','audio',
    '事情已過去。只聽說話者描述剛才吃東西時發生的事。他的意思是甚麼？',
    ['剛才真的被食物噎到。','剛才差點噎到，但沒有。','食物令他胃痛。','他完全沒有吃那件食物。'],
    '剛才真的被食物噎到。',
    'I choked on it. 說的是噎到已經發生；I almost choked on it. 才是「差點噎到」。'),
  mc('native-022-v2-branch','branch',
    '你剛才吃麵包時短暫噎到，現在已經沒事。朋友問 Are you okay? 哪句同時交代發生了甚麼和現在的狀況？',
    ["I choked on a piece of bread for a second, but I'm okay now.","I haven't eaten any bread today.",'The bread tasted a little dry.','I almost ordered some bread.'],
    "I choked on a piece of bread for a second, but I'm okay now.",
    '這句把過去短暫噎到和目前已無大礙分開說，朋友便能明白你的情況。'),
  mc('native-022-v2-transfer','transfer',
    '另一個情境：你吞得太急，咳了一下，但食物沒有真正卡住。事後回想，哪句較準確？',
    ['I almost choked on it.','I choked on it for several minutes.','I had food poisoning.','I dropped it on the floor.'],
    'I almost choked on it.',
    'almost 表示差點發生；這個新情境沒有真正噎住，因此比 I choked on it. 更合適。'),
  blank('native-022-v2-final','final',
    '最後挑戰：你剛才真的被一粒爆谷噎到，現在呼吸正常。朋友問發生甚麼事。用英文說剛才噎到爆谷，並補充現在沒事。',
    ["I choked on a piece of popcorn, but I'm okay now.","I choked on some popcorn, but I'm okay now.","I choked on popcorn for a second, but I'm okay now.","I choked on a piece of popcorn, but I'm fine now.","I choked on some popcorn, but I'm fine now."],
    '事情確實發生過；用過去式，並分開說明現在的狀態。',
    'I choked on a piece of popcorn, but I’m okay now. 清楚分開剛才的意外和現在的情況。')
];

const steps=[
  {id:'native-022-v2-audio',style:'audio',label:'聽出是否發生',title:'真的噎到，還是差點？',intro:'先只聽聲音；答完才看逐字稿。',model:'I choked on it.',zh:'我剛才被它噎到了。',audioOnly:true,questions:['native-022-v2-audio']},
  {id:'native-022-v2-branch',style:'branch',label:'回應關心',title:'朋友問你還好嗎',intro:'說明過去發生的事，也交代現在是否已經沒事。',questions:['native-022-v2-branch']},
  {id:'native-022-v2-transfer',style:'transfer',label:'改變程度',title:'差點發生時，用 almost',intro:'新情況只差一點噎到，措辭也要跟着改。',questions:['native-022-v2-transfer']},
  {id:'native-022-v2-speak',style:'speak',label:'事後口說',title:'事情過去後，自己描述一次',intro:'想像你現在已經沒事；先說，再聽示範。錄音可以跳過。',model:'I choked on it.',zh:'我剛才被它噎到了。',speakingPrompt:'朋友：What happened? 你剛才吃東西時短暫噎到，現在已沒事。',recording:'phrase',questions:[]},
  {id:'native-022-v2-final',style:'final',label:'爆谷挑戰',title:'換食物，再說清楚時間',intro:'沒有選項，自己描述剛才和現在。',questions:['native-022-v2-final']}
];

export default {revision:2,summary:'事後用 choked on 說明曾被食物噎到，分清真的發生和 almost 的差點發生。',steps,questions,takeaways:['I choked on it.','I almost choked on it.'],completionTitle:'你能準確分辨「噎到」和「差點噎到」了！'};
