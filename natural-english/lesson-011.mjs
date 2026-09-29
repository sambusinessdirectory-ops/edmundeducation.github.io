import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-011-v2-audio','audio',
    '出門前只聽朋友說一句話。他現在最確定的是甚麼？',
    ['暫時找不到鑰匙。','鑰匙一定在街上弄丟了。','鑰匙已經斷掉。','他不打算出門。'],
    '暫時找不到鑰匙。',
    'I can’t find my keys 只說現在找不到；說話者還不知道鑰匙是否真的遺失。'),
  mc('native-011-v2-repair','repair',
    '你只找了兩分鐘，還未檢查背包。朋友替你說 I lost my keys. 哪句較準確地修正目前情況？',
    ["I can't find my keys.",'My keys are broken.','I gave my keys away.','I found my keys.'],
    "I can't find my keys.",
    '還在找，未能確定是否真的丟失，說 I can’t find my keys 比 I lost my keys 更準確。'),
  mc('native-011-v2-explain','explain',
    '同樣是找不到鑰匙，為甚麼剛開始找時不急着說 I lost my keys? ',
    ['lost 較像已判定遺失；can’t find 只描述目前找不到。','lost 表示鑰匙壞了；can’t find 表示鑰匙借了人。','兩句都表示鑰匙已找回。','can’t find 只可用於手機，不能用於鑰匙。'],
    'lost 較像已判定遺失；can’t find 只描述目前找不到。',
    'can’t find 是眼下的搜尋結果；lost 通常暗示東西已遺失，語氣更確定。'),
  mc('native-011-v2-continue','continue',
    '室友說 I can’t find my keys. 你想幫忙找，下一句怎樣接最有用？',
    ['Have you checked your bag?','I lost mine last year.','You should buy a new set tomorrow.','They must have been stolen.'],
    'Have you checked your bag?',
    '對方正在找鑰匙，先問他有沒有查過可能放鑰匙的地方，能自然接續並提供幫助。'),
  blank('native-011-v2-final','final',
    '最後挑戰：你要趕去看醫生，臨出門發現鑰匙不在平常的位置。你仍在找，未確定是否遺失。用英文向家人說明。',
    ["I can't find my keys.","I can't find the keys.",'I cannot find my keys.','I cannot find the keys.'],
    '描述目前找不到，不要直接斷定已丟失。',
    'I can’t find my keys. 清楚說明當下的情況；若指家裡共用的鑰匙，the keys 也自然。')
];

const steps=[
  {id:'native-011-v2-audio',style:'audio',label:'只聽判斷',title:'是找不到，還是確定丟了？',intro:'先只聽聲音，判斷說話者實際知道多少。',model:"I can't find my keys.",zh:'我找不到鑰匙。',audioOnly:true,questions:['native-011-v2-audio']},
  {id:'native-011-v2-repair',style:'repair',label:'修正判斷',title:'別太快說「丟了」',intro:'只找了兩分鐘，說法要符合眼前證據。',questions:['native-011-v2-repair']},
  {id:'native-011-v2-explain',style:'explain',label:'說明差別',title:'can’t find 和 lost 的分寸',intro:'選出兩種說法在確定程度上的差別。',questions:['native-011-v2-explain']},
  {id:'native-011-v2-continue',style:'continue',label:'幫忙接話',title:'室友找不到鑰匙，你怎樣幫？',intro:'這次不是重複主句；把對話推進到下一步。',questions:['native-011-v2-continue']},
  {id:'native-011-v2-speak',style:'speak',label:'即時口說',title:'出門前，向家人說明',intro:'先自己說出目前的問題，錄音或跳過後才看示範。',model:"I can't find my keys.",zh:'我找不到鑰匙。',speakingPrompt:'家人：Are you ready to leave? 你正在找鑰匙，還未確定是否遺失。',recording:'phrase',questions:[]},
  {id:'native-011-v2-final',style:'final',label:'趕時間挑戰',title:'趕約會時，也要說得準',intro:'不給選項，用一句自然英文描述目前狀況。',questions:['native-011-v2-final']}
];

export default {revision:2,summary:'用 I can’t find my keys 描述眼下找不到的情況，分清尚在尋找與已確定遺失。',steps,questions,takeaways:["I can't find my keys.",'I lost my keys.'],completionTitle:'你能準確說明鑰匙找不到，也能接住別人的求助了！'};
