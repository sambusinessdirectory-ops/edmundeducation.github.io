import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'open',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-036-v2-audio','audio','只聽聲音：說話者留意到機器發出哪種聲響？',
    ['持續、低沉的嗡嗡聲。','一下很響的爆裂聲。','有節奏的敲門聲。','短促的一聲鈴響。'],
    '持續、低沉的嗡嗡聲。','humming 通常是穩定、低沉的嗡聲；單靠這個字不能判定機器已壞。'),
  mc('native-036-v2-detail','detail','半夜雪櫃一直發出 hum。哪個觀察細節最適合告訴維修員？',
    ['嗡聲是持續的，關上廚房門仍聽得到。','門面是不鏽鋼色。','雪櫃裏有牛奶。','廚房燈開着。'],
    '嗡聲是持續的，關上廚房門仍聽得到。','描述聲音是否持續、何時出現，能幫對方判斷；外觀和食物不是這次問題的關鍵。'),
  mc('native-036-v2-contrast','contrast','你聽到的是連續低嗡聲，不是每隔幾秒傳來的敲擊。哪種描述比較準確？',
    ["It's humming.","It's banging.","It's beeping.","It's squeaking."],
    "It's humming.",'humming 是連續嗡聲；banging 是撞擊聲，beeping 是電子嗶聲，squeaking 是尖細吱聲。'),
  blank('native-036-v2-rewrite','rewrite','你原本只說 The fridge is noisy.，現在要讓室友知道它發出哪種聲音。重寫成一句較具體的英文。',
    ["The fridge is humming.","The refrigerator is humming.","My fridge is humming.","The fridge keeps humming."],
    '用描述連續低嗡聲的動詞。','The fridge is humming. 比 noisy 具體；它描述聲響，不武斷宣稱機器故障。'),
  blank('native-036-v2-final','final','最後挑戰：冷氣整晚發出持續低嗡聲。寫一則兩句英文訊息給屋主，描述聲音並問能否檢查。',
    ["The AC has been humming all night. Could you check it?","The AC has been humming all night. Can you check it?","The AC keeps humming. Could you check it?","The AC is humming. Could you check it?"],
    '先說出可觀察的聲音，再提出檢查請求。','先描述 humming，再請對方 check it，讓屋主知道問題和下一步；不要直接猜測零件壞了。')
];

const steps=[
  {id:'native-036-v2-audio',style:'audio',label:'聽出聲響',title:'這是甚麼聲音？',intro:'先聽，不看逐字稿。',model:'It’s humming.',zh:'它一直發出低沉嗡聲。',audioOnly:true,questions:['native-036-v2-audio']},
  {id:'native-036-v2-detail',style:'detail',label:'補上觀察',title:'告訴維修員有用的細節',intro:'把籠統的「有聲」變成可查證的觀察。',questions:['native-036-v2-detail']},
  {id:'native-036-v2-contrast',style:'contrast',label:'辨認音色',title:'嗡聲、敲聲、嗶聲',intro:'不同聲音需要不同詞語。',questions:['native-036-v2-contrast']},
  {id:'native-036-v2-speak',style:'speak',label:'即時描述',title:'室友問你聽到甚麼',intro:'先自己說；錄音或跳過後才聽示範。',model:'It’s humming.',zh:'它在發出嗡聲。',speakingPrompt:'室友：What’s that low sound coming from the fridge?',recording:'phrase',questions:[]},
  {id:'native-036-v2-rewrite',style:'rewrite',label:'說得具體',title:'不只說 noisy',intro:'改寫給室友的報告。',questions:['native-036-v2-rewrite']},
  {id:'native-036-v2-final',style:'final',label:'聯絡屋主',title:'整晚的冷氣嗡聲',intro:'新情境，自己寫完整訊息。',questions:['native-036-v2-final']}
];

export default {revision:2,summary:'辨認 humming 的持續低嗡聲，描述可觀察細節，並在需要時請人檢查。',steps,questions,takeaways:['It’s humming.','It’s making a weird noise.'],completionTitle:'你能準確描述持續嗡聲，也能把問題說給維修的人聽了！'};
