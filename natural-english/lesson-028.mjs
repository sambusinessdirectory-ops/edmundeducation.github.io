const mc=(id,style,prompt,options,answer,explanation)=>({id,type:'mc',style,prompt,before:'',after:'',options,answers:[answer],explanation});
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'open',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-028-v2-detail','detail',
    '朋友說 My nose is stuffed up. 你知道的是哪個具體症狀？',
    ['鼻子塞住，呼吸不太暢順。','鼻子一直流血。','嗅覺突然變得特別敏銳。','只是喉嚨痛。'],
    '鼻子塞住，呼吸不太暢順。',
    'stuffed up 在這句指鼻塞；它沒有說流鼻血或喉嚨痛。'),
  mc('native-028-v2-audio','audio',
    '只聽另一種自然說法。說話者最可能在描述甚麼？',
    ['鼻腔不通暢。','眼睛乾澀。','飯後太飽。','跑步後氣喘。'],
    '鼻腔不通暢。',
    'I’m congested. 常用來說鼻塞；在傷風的語境尤其常見。'),
  mc('native-028-v2-contrast','contrast',
    '你鼻子堵住，幾乎沒有鼻涕流出來。哪一組用字對比最準確？',
    ['stuffy 是塞住；runny 是流鼻水。','stuffy 是流鼻水；runny 是塞住。','兩者都只表示打噴嚏。','兩者都只表示嗅覺很好。'],
    'stuffy 是塞住；runny 是流鼻水。',
    '鼻塞與流鼻水可以同時出現，但這兩個字各自指出不同症狀。'),
  blank('native-028-v2-rewrite','rewrite',
    '你已寫 My nose is blocked.，意思正確。現在把它改寫成這課較常見的美式口語說法，仍然只說鼻塞。',
    ['My nose is stuffed up.','My nose feels stuffed up.'],
    '保留「鼻子不通」的意思；改用本課聽到的口語詞組。',
    'My nose is stuffed up. 是常見美式口語；My nose is blocked. 在其他英語用法中也自然，這裏只是練習另一種說法。'),
  blank('native-028-v2-final','final',
    '最後挑戰：你傷風後鼻子塞得很厲害，想向朋友簡短說明。沒有選項，寫一句自然英文。',
    ['My nose is really stuffed up.','My nose is stuffed up.','I’m really congested.','I’m congested.','My nose is blocked.','My nose is really blocked.'],
    '只需描述鼻塞，不用替自己判斷是哪一種病。',
    'My nose is really stuffed up. 清楚描述鼻塞程度；I’m congested. 與 My nose is blocked. 也是自然說法。')
];

const steps=[
  {id:'native-028-v2-detail',style:'detail',label:'辨認症狀',title:'鼻塞，不一定流鼻水',intro:'從完整句找出真正提到的症狀。',questions:['native-028-v2-detail']},
  {id:'native-028-v2-audio',style:'audio',label:'聽另一說法',title:'congested 在說甚麼？',intro:'先只聽聲音，答完才看文字。',model:'I’m congested.',zh:'我鼻塞了。',audioOnly:true,questions:['native-028-v2-audio']},
  {id:'native-028-v2-contrast',style:'contrast',label:'分清鼻況',title:'塞住與流鼻水不一樣',intro:'兩種症狀可能同時有，但英文字詞各有焦點。',questions:['native-028-v2-contrast']},
  {id:'native-028-v2-rewrite',style:'rewrite',label:'換種說法',title:'blocked 也自然，再學美式口語',intro:'意思保持一樣；練另一個常見表達。',questions:['native-028-v2-rewrite']},
  {id:'native-028-v2-speak',style:'speak',label:'自己描述',title:'朋友聽你鼻音很重',intro:'先用自己的聲音說明，錄音或跳過後才看示範。',model:'My nose is stuffed up.',zh:'我鼻塞了。',speakingPrompt:'朋友：You sound a little different today. 你鼻子塞住，想告訴他原因。',recording:'phrase',questions:[]},
  {id:'native-028-v2-final',style:'final',label:'傷風挑戰',title:'寫一句讓朋友明白的話',intro:'沒有選項；只描述你現在的鼻塞。',questions:['native-028-v2-final']}
];

export default {revision:2,summary:'辨認鼻塞與流鼻水，學會 stuffed up、congested 與 blocked 的自然用法。',steps,questions,takeaways:['My nose is stuffed up.','I’m congested.'],completionTitle:'你能準確又自然地描述鼻塞了！'};
