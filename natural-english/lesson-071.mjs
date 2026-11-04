import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-071-v2-audio','audio','只聽一句晚餐提議。說話者現在特別想吃甚麼？',
    ['拉麵。','披薩。','冰淇淋。','三文治。'],
    '拉麵。','I’m craving ramen. 表示此刻很想吃拉麵；craving 比一般「可以吃」更強。'),
  mc('native-071-v2-tone','tone','朋友問 What do you feel like eating? 你突然很想吃拉麵，但對方可以提出別的選擇。哪句表達偏好而不強迫？',
    ["I'm craving ramen. How about you?","We must eat ramen, and you have no choice.","I have no idea what food is.","I don't want to eat anything."],
    "I'm craving ramen. How about you?",'說出自己特別想吃的東西，再把選擇權留給朋友。'),
  mc('native-071-v2-scene','scene','午餐剛吃飽，但你正盤算晚餐。I’m craving ramen. 在這裏最接近哪個意思？',
    ['現在很想晚餐吃拉麵，不一定已餓得受不了。','我已經點了拉麵並付錢。','我對拉麵過敏。','我剛剛煮完拉麵。'],
    '現在很想晚餐吃拉麵，不一定已餓得受不了。','craving 說的是強烈想吃，不等於已下單或一定身體飢餓。'),
  mc('native-071-v2-branch','branch','朋友說 Ramen sounds good. Shall we try the new place? 你也願意去。哪句自然接續？',
    ['Yes, let’s try it!','No, I have never heard of food.','You must go alone.','I already ate at that place tomorrow.'],
    'Yes, let’s try it!','朋友已接受拉麵提議，下一步是回應新店建議；不用再反覆說自己 craving。'),
  open('native-071-v2-rewrite','rewrite','你只傳 Ramen! 給晚餐同伴。改成一句自然英文，表達你突然很想吃拉麵。',
    ["I'm craving ramen.","I'm really craving ramen tonight.","I'm in the mood for ramen."],
    'craving 表示較強的想吃；in the mood for 語氣較輕，也可表達現在想吃。'),
  open('native-071-v2-continue','continue','朋友回 I’m craving ramen too. 你知道附近有一間新店。用一句英文把談話推到下一步。',
    ['There’s a new ramen place nearby. Want to try it?','I know a new ramen place near here. Shall we go?','Let’s try the new ramen place nearby.'],
    '當兩人都想吃拉麵，提出具體地點或邀請，比只重複偏好更有用。')
];

const steps=[
  {id:'native-071-v2-audio',style:'audio',label:'聽出渴望',title:'突然想吃甚麼？',intro:'先只聽聲音，判斷食物。',model:'I’m craving ramen.',zh:'我突然很想吃拉麵。',audioOnly:true,questions:['native-071-v2-audio']},
  {id:'native-071-v2-tone',style:'tone',label:'表達偏好',title:'很想吃，但不強迫朋友',intro:'說出自己的想法，也讓對方回應。',questions:['native-071-v2-tone']},
  {id:'native-071-v2-scene',style:'scene',label:'晚餐打算',title:'craving 不等於已點餐',intro:'分清想吃和已採取的行動。',questions:['native-071-v2-scene']},
  {id:'native-071-v2-branch',style:'branch',label:'接新店提議',title:'朋友也想吃拉麵',intro:'談話要向具體決定走。',questions:['native-071-v2-branch']},
  {id:'native-071-v2-rewrite',style:'rewrite',label:'改寫短訊',title:'不只傳 Ramen!',intro:'完整表達當下想吃的心情。',questions:['native-071-v2-rewrite']},
  {id:'native-071-v2-continue',style:'continue',label:'提出下一步',title:'附近有新店',intro:'用自己的話把偏好變成可行安排。',questions:['native-071-v2-continue']}
];

export default {revision:2,summary:'用 craving 表達當下特別想吃某種食物，保留同伴選擇，並自然接到具體安排。',steps,questions,takeaways:['I’m craving ramen.','I’m in the mood for ramen.'],completionTitle:'你能自然說出想吃甚麼，也能把晚餐談話接到下一步了！'};
