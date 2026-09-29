import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'open',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-024-v2-reverse','reverse',
    '食評說 The vegetables are mushy. 你最可能在碟上看到甚麼？',
    ['蔬菜軟爛，形狀快要散掉。','蔬菜仍然硬脆。','蔬菜表面結冰。','蔬菜完全沒有調味。'],
    '蔬菜軟爛，形狀快要散掉。',
    'mushy 描述過軟、糊爛的質地，不只是「容易咬」或沒有調味。'),
  mc('native-024-v2-audio','audio',
    '只聽一句關於薯條的評語。它們失去了哪種特質？',
    ['原本的酥脆。','原本的甜味。','原本的鹹味。','原本的顏色。'],
    '原本的酥脆。',
    'The fries are soggy. 通常指薯條受潮、變軟而不再酥脆。'),
  mc('native-024-v2-contrast','contrast',
    '一碟菜花煮太久，壓下去像糊；一盒外賣薯條因水蒸氣變軟。兩者依次用哪組字較準確？',
    ['mushy／soggy','soggy／mushy','crispy／fresh','stale／raw'],
    'mushy／soggy',
    '煮到軟爛、近乎糊狀是 mushy；原本應酥脆卻因濕氣變軟是 soggy。'),
  mc('native-024-v2-detail','detail',
    '朋友說菜花只是 soft。你想說它其實已經 mushy；哪個新細節最能支持你的判斷？',
    ['用叉子輕碰就散開成糊。','仍然有清脆的咬感。','只是溫度比較低。','沒有加任何鹽。'],
    '用叉子輕碰就散開成糊。',
    'mushy 不只是柔軟，還帶有過度軟爛、失去正常形狀的感覺。'),
  blank('native-024-v2-final','final',
    '最後挑戰：西蘭花煮太久，叉子一碰就散開。朋友問 How are the vegetables? 用完整英文說它們有點軟爛。',
    ["They're a little mushy.",'The vegetables are a little mushy.',"They're mushy.",'The vegetables are mushy.'],
    '說明質地已經過軟，而不是只說味道。',
    'They’re a little mushy. 準確描述煮得過軟的質地；一個完整句子比單說 mushy 更清楚。')
];

const steps=[
  {id:'native-024-v2-reverse',style:'reverse',label:'從字看質地',title:'mushy 是怎樣的軟？',intro:'先把食評轉成你會看到、摸到的狀態。',questions:['native-024-v2-reverse']},
  {id:'native-024-v2-audio',style:'audio',label:'聽另一種軟',title:'薯條變軟，是同一回事嗎？',intro:'只聽聲音；答完才看那句評語。',model:'The fries are soggy.',zh:'薯條受潮變軟，不酥脆了。',audioOnly:true,questions:['native-024-v2-audio']},
  {id:'native-024-v2-contrast',style:'contrast',label:'兩種質地',title:'煮爛與受潮要分開說',intro:'菜花和薯條都變軟，但原因和質感不同。',questions:['native-024-v2-contrast']},
  {id:'native-024-v2-detail',style:'detail',label:'找到關鍵',title:'soft 還未必是 mushy',intro:'找出足以說明「糊爛」的細節。',questions:['native-024-v2-detail']},
  {id:'native-024-v2-speak',style:'speak',label:'一字回應',title:'先用耳朵，再用自己的聲音',intro:'朋友問蔬菜口感；先用一個形容詞回答，錄音或跳過後才聽發音。',model:'mushy',zh:'軟爛糊糊的。',speakingPrompt:'朋友：How are the vegetables? 它們煮得過軟、快成糊了。先用一個英文形容詞回答。',recording:'phrase',questions:[]},
  {id:'native-024-v2-final',style:'final',label:'完整句挑戰',title:'從一個字變成完整評語',intro:'沒有選項，把西蘭花的質地說成一句自然英文。',questions:['native-024-v2-final']}
];

export default {revision:2,summary:'分清煮到軟爛的 mushy 與受潮失脆的 soggy，並用具體質地線索判斷。',steps,questions,takeaways:['mushy','The fries are soggy.'],completionTitle:'你能分辨軟爛和受潮，並自然描述食物質地了！'};
