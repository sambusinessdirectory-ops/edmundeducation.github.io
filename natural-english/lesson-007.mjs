import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'open',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-007-v2-tone','tone',
    '你在服裝店拿着一件外套，想禮貌、直接地問店員同款有沒有 M 號。哪一句最適合？',
    ['Do you have this in a medium?','Give me the medium one.','I demand a medium.','Is medium your favourite size?'],
    'Do you have this in a medium?',
    'Do you have this in a medium? 清楚問同一款的尺碼，語氣自然有禮。其餘句子不是在問存貨，或語氣太強硬。'),
  mc('native-007-v2-audio','audio',
    '先只聽店內對話。店員說 Let me check，表示她接下來會做甚麼？',
    ['查看有沒有這個尺碼。','幫客人量身訂造。','立即替客人付款。','告訴客人只剩黑色。'],
    '查看有沒有這個尺碼。',
    '客人問的是同一款有沒有 M 號；Let me check 是店員說「我幫你查一下」。'),
  mc('native-007-v2-branch','branch',
    '店員問 What size are you looking for? 你要 M 號，怎樣簡潔地回答？',
    ['A medium, please.','A blue one, please.','I would like to pay now.','No, I haven’t tried it on.'],
    'A medium, please.',
    '店員已問尺碼，直接回答 A medium, please. 即可；另外三句分別談顏色、付款和試穿。'),
  blank('native-007-v2-transfer','transfer',
    '換一個情境：同款外套的 M 號太緊，你想問有沒有 L 號。寫出完整、自然的英文問句。',
    ['Do you have this in a large?','Do you have it in a large?','Do you have this in large?','Do you have it in large?'],
    '用 in 接尺碼；可以用 this 或 it 指眼前的外套。',
    '例如 Do you have this in a large? 這次換了尺碼，而不是照抄 M 號的句子。'),
  blank('native-007-v2-final','final',
    '最後挑戰：你在另一間店找到一件喜歡的 T-shirt，只看到 S 號。沒有選項或示範，問店員這款有沒有 M 號。',
    ['Do you have this in a medium?','Do you have it in a medium?','Do you have this in medium?','Do you have it in medium?'],
    '想想如何指着「這一款」問指定尺碼。',
    'Do you have this in a medium? 用 this 指眼前這款，in a medium 問 M 號版本。')
];

const steps=[
  {id:'native-007-v2-tone',style:'tone',label:'看語氣',title:'問尺碼，也要問得自然',intro:'先想清楚你對店員的需要；作答後才看示範。',questions:['native-007-v2-tone'],revealAfterAnswer:true,model:'Do you have this in a medium?',zh:'這款有 M 號嗎？'},
  {id:'native-007-v2-audio',style:'audio',label:'聽店內對話',title:'店員接下來會做甚麼？',intro:'先只聽聲音，完成判斷後再看逐字稿。',model:'Do you have this in a medium? Let me check.',zh:'這款有 M 號嗎？我幫你查一下。',audioOnly:true,questions:['native-007-v2-audio']},
  {id:'native-007-v2-branch',style:'branch',label:'接住對話',title:'店員問你要甚麼尺碼',intro:'這次不用重複整句問法，直接回答店員的問題。',questions:['native-007-v2-branch']},
  {id:'native-007-v2-transfer',style:'transfer',label:'換一個尺碼',title:'M 號太緊，試問 L 號',intro:'把結構帶到新需要；完整寫出問句。',questions:['native-007-v2-transfer']},
  {id:'native-007-v2-speak',style:'speak',label:'即時口說',title:'店員走過來，輪到你開口',intro:'想像店員問 Can I help you? 先用自己的聲音問 M 號；示範會在錄音或跳過後出現。',model:'Do you have this in a medium?',zh:'這款有 M 號嗎？',speakingPrompt:'店員：Can I help you? 你拿着喜歡的外套，想問 M 號。先自己回答，錄音可選擇跳過。',recording:'phrase',questions:[]},
  {id:'native-007-v2-final',style:'final',label:'新店挑戰',title:'換一件 T-shirt，再問一次',intro:'不看選項，自己決定怎樣向新店員問 M 號。',questions:['native-007-v2-final']}
];

export default {revision:2,summary:'在服裝店問指定尺碼，分清問存貨、回答尺碼與換尺碼時的說法。',steps,questions,takeaways:['Do you have this in a medium?','Do you have this in black?'],completionTitle:'你能自然地問尺碼，也能接住店員的回答了！'};
