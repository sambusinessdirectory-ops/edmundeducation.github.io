const mc=(id,style,prompt,options,answer,explanation)=>({id,type:'mc',style,prompt,options,answers:[answer],explanation});
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-027-v2-contrast','contrast',
    '你站起來時覺得周圍有點轉、腳步不穩，但頭並不痛。哪個描述最貼近這種感覺？',
    ['I feel dizzy.','I have a headache.','My nose is stuffed up.','My stomach feels off.'],
    'I feel dizzy.',
    'dizzy 指頭暈、可能有旋轉或不穩的感覺；headache 是頭痛，並不是同一回事。'),
  mc('native-027-v2-audio','audio',
    '只聽一句描述。說話者如何限定頭暈的程度？',
    ['只是有點頭暈。','完全沒有頭暈。','已昏倒。','頭痛得很厲害。'],
    '只是有點頭暈。',
    'I feel a little dizzy. 中的 a little 把程度限定為「有點」。'),
  mc('native-027-v2-explain','explain',
    '同事說 I feel dizzy.，接着坐了下來。哪個理解最能解釋他為何坐下？',
    ['他覺得暈或不穩，想先坐好。','他說自己只是肚子餓。','他說椅子太硬。','他想示範椅子的高度。'],
    '他覺得暈或不穩，想先坐好。',
    'dizzy 描述頭暈或不穩的感覺；在這段對話裏，坐下與這個感覺相呼應。'),
  mc('native-027-v2-repair','repair',
    '你只是短暫有點暈，尚未昏倒。原本說 I’m definitely going to faint. 太肯定、太嚴重。哪句較準確？',
    ['I feel a little dizzy.','I have already fainted.','I can’t breathe at all.','I feel completely fine.'],
    'I feel a little dizzy.',
    '描述自己實際感到的輕微頭暈，比斷定自己一定會昏倒更準確。'),
  blank('native-027-v2-rewrite','rewrite',
    '你想向同事發訊息說「我有點頭暈，想先坐一下」。把兩個意思寫成自然英文。',
    ['I feel a little dizzy. I need to sit down for a moment.','I feel a little dizzy. I need to sit down for a bit.','I feel dizzy. I need to sit down for a moment.','I feel dizzy. I need to sit down for a bit.'],
    '第一句說感覺；第二句說你現在想做甚麼。',
    'I feel a little dizzy. I need to sit down for a moment. 把感覺和當下需要分開說清楚。'),
  blank('native-027-v2-transfer','transfer',
    '換個情境：巴士突然停下後，你有點頭暈，但沒有頭痛。朋友問是否還好。用一句自然英文描述感覺。',
    ['I feel a little dizzy.','I feel dizzy.','I am a little dizzy.','I am dizzy.'],
    '只描述現在感到的症狀，不用推測原因。',
    'I feel a little dizzy. 是簡潔的頭暈描述；I’m a little dizzy. 也自然。')
];

const steps=[
  {id:'native-027-v2-contrast',style:'contrast',label:'分清感覺',title:'頭暈並不等於頭痛',intro:'先從身體感覺選對英文描述。',questions:['native-027-v2-contrast']},
  {id:'native-027-v2-audio',style:'audio',label:'聽出程度',title:'a little 有甚麼作用？',intro:'只聽聲音，先判斷說話者描述得有多重。',model:'I feel a little dizzy.',zh:'我有點頭暈。',audioOnly:true,questions:['native-027-v2-audio']},
  {id:'native-027-v2-explain',style:'explain',label:'從動作理解',title:'為何同事坐下？',intro:'把聽到的感覺與下一個動作連起來。',questions:['native-027-v2-explain']},
  {id:'native-027-v2-repair',style:'repair',label:'收準語氣',title:'別把有點暈說成一定昏倒',intro:'選一個與你實際感覺相稱的說法。',questions:['native-027-v2-repair']},
  {id:'native-027-v2-rewrite',style:'rewrite',label:'發訊息說明',title:'感覺和需要都要交代',intro:'不給選項，寫成同事看得懂的兩句話。',questions:['native-027-v2-rewrite']},
  {id:'native-027-v2-transfer',style:'transfer',label:'巴士情境',title:'換了地方，仍能準確描述',intro:'不用再提坐下；只說眼前的感覺。',questions:['native-027-v2-transfer']}
];

export default {revision:2,summary:'分清頭暈與頭痛，學會用 a little 調整程度，並說明當下需要。',steps,questions,takeaways:['I feel dizzy.','I feel a little dizzy.'],completionTitle:'你能準確描述頭暈和程度了！'};
