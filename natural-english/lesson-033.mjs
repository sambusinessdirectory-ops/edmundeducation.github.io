import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-033-v2-scene','scene',
    '餐廳桌子有一隻腳較短，你輕放手肘它就左右搖。向店員描述桌子的問題，哪句最準確？',
    ['The table is wobbly.','The table is sticky.','The table is crowded.','The table is too bright.'],
    'The table is wobbly.',
    'wobbly 描述桌子不穩、容易搖晃；其他句子分別說黏、擠或太亮。'),
  mc('native-033-v2-audio','audio',
    '只聽一個形容詞。它指出家具哪一方面出了問題？',
    ['不穩固，容易左右搖。','表面太黏。','材質太硬。','顏色不平均。'],
    '不穩固，容易左右搖。',
    'wobbly 指物件不穩、輕碰會搖；桌椅、架子都可以這樣形容。'),
  mc('native-033-v2-detail','detail',
    '你想讓店員明白椅子是 wobbly，不是單純不舒服。哪個細節最能支持這個描述？',
    ['坐下時椅子會左右晃，像一隻腳沒有着地。','椅墊顏色不喜歡。','椅背很直。','椅子剛擦乾淨。'],
    '坐下時椅子會左右晃，像一隻腳沒有着地。',
    '關鍵是結構不穩造成的搖動，而不是美觀或軟硬。'),
  blank('native-033-v2-repair','repair',
    '你剛向店員說 The table is stable.，但其實桌子一碰就搖。請把意思改正，寫一句自然英文。',
    ['The table is wobbly.','This table is wobbly.','The table is a little wobbly.','This table is a little wobbly.'],
    'stable 是穩固；你現在要說相反情況。',
    'The table is wobbly. 清楚表達桌子不穩、會搖晃。'),
  mc('native-033-v2-branch','branch',
    '店員聽完後說 I can fix the leg, or move you to another table. 你想立刻換桌，怎樣回答最清楚？',
    ['Could we move to another table, please?','The food tastes good.','Please bring the check.','I prefer the same table after you fix it.'],
    'Could we move to another table, please?',
    '店員提出兩個處理方法；這句直接選擇換桌，讓對方知道下一步怎樣做。')
];

const steps=[
  {id:'native-033-v2-scene',style:'scene',label:'辨認問題',title:'桌子一碰就搖',intro:'找出真正描述桌子不穩的說法。',questions:['native-033-v2-scene']},
  {id:'native-033-v2-audio',style:'audio',label:'聽出質感',title:'wobbly 指哪一種問題？',intro:'先只聽聲音，答完再看字。',model:'It’s wobbly.',zh:'它搖搖晃晃、不穩。',audioOnly:true,questions:['native-033-v2-audio']},
  {id:'native-033-v2-detail',style:'detail',label:'補上證據',title:'椅子怎樣才算不穩？',intro:'把形容詞連到可以觀察的動作。',questions:['native-033-v2-detail']},
  {id:'native-033-v2-repair',style:'repair',label:'修正報告',title:'stable 說反了',intro:'在店員處理前，先把真正問題說準。',questions:['native-033-v2-repair']},
  {id:'native-033-v2-branch',style:'branch',label:'選處理方法',title:'店員給你兩個選擇',intro:'挑一個你想要的解決方法並回應。',questions:['native-033-v2-branch']}
];

export default {revision:2,summary:'用 wobbly 描述桌椅結構不穩，提供具體細節，並接住店員的處理建議。',steps,questions,takeaways:['It’s wobbly.','The table is stable.'],completionTitle:'你能清楚說明桌椅搖晃，也能選擇處理方法了！'};
