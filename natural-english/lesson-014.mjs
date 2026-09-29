const mc=(id,style,prompt,options,answer,explanation)=>({id,type:'mc',style,prompt,options,answers:[answer],explanation});
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-014-v2-scene','scene',
    '你和一位陌生人同時走到門口，你想停下來讓對方先進。哪句簡短又有禮？',
    ['After you.','I’ll go first.','Wait for me.','You can follow me.'],
    'After you.',
    'After you. 表示你讓對方先行；其餘句子要自己先走、叫對方等，或叫對方跟着你。'),
  mc('native-014-v2-audio','audio',
    '只聽門口的一句話。說話者接下來會怎樣做？',
    ['稍等，讓對方先走。','自己搶先進去。','叫對方站着不動。','請對方關門。'],
    '稍等，讓對方先走。',
    'After you. 是禮讓對方先行；說話者會等對方走過才跟上。'),
  mc('native-014-v2-detail','detail',
    '電梯門開了，你正要進去，裏面有人要出來。這時最關鍵的行動是哪個？',
    ['先讓裏面的人出來，再進去。','站在門中央請對方繞過你。','立刻按關門鍵。','跟對方同時擠過門口。'],
    '先讓裏面的人出來，再進去。',
    '先退開讓人出電梯，再進去，才符合 After you. 所表達的禮讓。'),
  blank('native-014-v2-final','final',
    '最後挑戰：你和同事同時到會議室門前，你想請她先進。沒有選項，用一句自然英文說。',
    ['After you.','You first.','Please, after you.'],
    '你要把先行的次序讓給對方。',
    'After you. 最簡短自然；You first. 也可以清楚表示讓對方先走。')
];

const steps=[
  {id:'native-014-v2-scene',style:'scene',label:'門口禮讓',title:'兩人同時到門口',intro:'選一句真正讓對方先行的話。',questions:['native-014-v2-scene']},
  {id:'native-014-v2-audio',style:'audio',label:'聽出先後',title:'誰會先走？',intro:'只聽聲音，先判斷說話者的動作。',model:'After you.',zh:'您先請。',audioOnly:true,questions:['native-014-v2-audio']},
  {id:'native-014-v2-detail',style:'detail',label:'電梯細節',title:'電梯門開時，先讓誰通過？',intro:'把禮貌用語和真正的行動配起來。',questions:['native-014-v2-detail']},
  {id:'native-014-v2-speak',style:'speak',label:'現場口說',title:'讓對方先走，自己說一次',intro:'想像有人正從電梯出來；先開口，錄音或跳過後才看示範。',model:'After you.',zh:'您先請。',speakingPrompt:'電梯門開了，裏面的人正要出來。你退到一旁，請對方先走。',recording:'phrase',questions:[]},
  {id:'native-014-v2-final',style:'final',label:'換門口挑戰',title:'換成會議室門前',intro:'沒有示範或選項，自己向同事說一句。',questions:['native-014-v2-final']}
];

export default {revision:2,summary:'在門口和電梯前用 After you. 禮讓對方先行，也知道該怎樣配合行動。',steps,questions,takeaways:['After you.','You first.'],completionTitle:'你能自然地讓對方先走了！'};
