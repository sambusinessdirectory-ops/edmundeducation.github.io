import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'open',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-017-v2-scene','scene',
    '朋友還在討論吃披薩還是壽司，你兩種都喜歡，也沒有特別偏好。哪句最能表達你願意配合？',
    ["I'm up for anything.","I'm up for that.",'I only want pizza.','I would rather stay home.'],
    "I'm up for anything.",
    '還沒決定任何一個方案時，I’m up for anything. 表示不同選擇你都願意考慮；that 通常指已提出的特定方案。'),
  mc('native-017-v2-audio','audio',
    '先只聽一句回應。這位朋友的態度是哪一種？',
    ['對不同提議都開放。','已堅持只吃一種菜。','甚麼活動都拒絕。','已確認某個指定地方。'],
    '對不同提議都開放。',
    'I’m up for anything. 表示「我甚麼都可以」，語氣比單純說 I don’t care 更積極。'),
  blank('native-017-v2-rewrite','rewrite',
    '朋友問你想做甚麼，你其實都願意。把可能顯得冷淡的 I don’t care. 改成一句較積極的英文回覆。',
    ["I'm up for anything.","I'm good with anything.",'Anything works for me.'],
    '表達你願意接受不同提議，而不是不在乎朋友。',
    'I’m up for anything. 讓對方知道你願意參與，只是沒有特別偏好。'),
  mc('native-017-v2-continue','continue',
    '朋友後來提出 Let’s go hiking on Saturday. 你喜歡這個具體提議。哪句最直接表示同意？',
    ["I'm up for that.","I'm up for anything.",'I don’t know what hiking is.','Maybe we should decide where to eat.'],
    "I'm up for that.",
    'that 指剛提出的行山計劃；anything 則表示對多種尚未決定的選擇都開放。'),
  blank('native-017-v2-transfer','transfer',
    '換到電影之夜：大家還沒決定看哪部片，你都可以。用自然英文告訴朋友你沒有特別偏好，但願意一起看。',
    ["I'm up for anything.","I'm good with anything.",'Anything works for me.','I am up for anything.'],
    '這時還沒有特定提議，不要用 that 指不存在的選項。',
    'I’m up for anything. 適用於還在挑選方案時；也可說 Anything works for me.。')
];

const steps=[
  {id:'native-017-v2-scene',style:'scene',label:'先看情境',title:'還沒決定吃甚麼',intro:'你願意配合，但朋友還沒提出最後方案。',questions:['native-017-v2-scene']},
  {id:'native-017-v2-audio',style:'audio',label:'聽出態度',title:'開放，還是冷淡？',intro:'先只聽聲音，答完才看逐字稿。',model:"I'm up for anything.",zh:'我甚麼都可以。',audioOnly:true,questions:['native-017-v2-audio']},
  {id:'native-017-v2-rewrite',style:'rewrite',label:'改寫語氣',title:'不想說得像「我不在乎」',intro:'把你的配合意願說出來。',questions:['native-017-v2-rewrite']},
  {id:'native-017-v2-continue',style:'continue',label:'接住提議',title:'朋友決定去行山',intro:'從「甚麼都可以」轉成同意一個具體計劃。',questions:['native-017-v2-continue']},
  {id:'native-017-v2-speak',style:'speak',label:'即時口說',title:'朋友等你表態',intro:'你對不同活動都開放。先用自己的聲音回應，錄音可跳過。',model:"I'm up for anything.",zh:'我甚麼都可以。',speakingPrompt:'朋友：Pizza or sushi? 你都喜歡，也想跟大家一起吃。',recording:'phrase',questions:[]},
  {id:'native-017-v2-transfer',style:'transfer',label:'換場景運用',title:'從晚餐轉到電影',intro:'現在要選電影；沒有選項，自己表達開放態度。',questions:['native-017-v2-transfer']}
];

export default {revision:2,summary:'分清 I’m up for anything. 的開放態度與 I’m up for that. 對特定提議的同意。',steps,questions,takeaways:["I'm up for anything.","I'm up for that."],completionTitle:'你能積極地說「我甚麼都可以」，也能同意具體提議了！'};
