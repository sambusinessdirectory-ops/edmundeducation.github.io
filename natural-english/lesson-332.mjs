import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-332-v2-audio','audio','先聽店員的話。這道菜目前能點嗎？',
    ['今天暫時不能點，但未說明是否已賣完。','可以點，只是要多等十五分鐘。','從今以後都不能再點。','已經賣完，店員明確說了最後一份剛售出。'],
    '今天暫時不能點，但未說明是否已賣完。','unavailable today 只確認今天不供應；原因可以是食材或廚房安排，不能自行推定 sold out。'),
  mc('native-332-v2-scene','scene','菜單仍印著南瓜湯，但今天廚房沒有做；它並不是賣到售罄。店員怎樣說較準確？',
    ["The pumpkin soup is unavailable today.","We’ve sold out of the pumpkin soup.","The pumpkin soup has been discontinued forever.","The pumpkin soup is ready for you."],
    "The pumpkin soup is unavailable today.",'今天未供應，用 unavailable today；sold out 會暗示曾有供應但已賣完。'),
  mc('native-332-v2-repair','repair','店員說 We’re sold out of the soup，但其實今天從未煮過這道湯。哪個修正避免誤導？',
    ["The soup isn’t available today.","The soup sold out before we opened.","The soup is sold out permanently.","The soup is available, but nobody ordered it."],
    "The soup isn’t available today.",'改成 isn’t available today，只說目前無法供應，不虛構已經售出。'),
  mc('native-332-v2-continue','continue','店員說 The pasta is unavailable today。客人想知道還能點甚麼。你會怎樣自然接話？',
    ["The risotto is available, though, if you’d like something similar.","We already sold you the pasta, so you must eat it.","The pasta is gone forever, and nothing else is available.","You should know why the pasta is unavailable without asking."],
    "The risotto is available, though, if you’d like something similar.",'客人需要可行替代；先前只知道 pasta 今天不供應，不宜另編永久停售或售罄。'),
  open('native-332-v2-final','final','最後挑戰：客人指著菜單上的蘑菇意粉。今天廚房因缺少蘑菇沒有製作這道菜，但其他意粉仍可點。用兩句英文告知並提供選擇；不要說成已賣完。',
    ["I’m sorry, the mushroom pasta isn’t available today. The tomato pasta is available if you’d like that instead.","We can’t offer the mushroom pasta today because we’re out of mushrooms. Would you like the tomato pasta?","The mushroom pasta is unavailable today. We do still have the tomato pasta."],
    '說今天無法供應已足夠；若知道缺蘑菇可補充原因，再提供仍有供應的選項。')
];
const steps=[
  {id:'native-332-v2-audio',style:'audio',label:'聽出限制',title:'今天不供應',intro:'先聽店員的話，不先猜原因。',model:'It’s unavailable today.',zh:'今天暫時不供應。',audioOnly:true,questions:['native-332-v2-audio']},
  {id:'native-332-v2-scene',style:'scene',label:'看情境選字',title:'並沒有賣到售罄',intro:'這道菜今天根本沒有製作。',questions:['native-332-v2-scene']},
  {id:'native-332-v2-repair',style:'repair',label:'修正誤會',title:'不替餐廳編造銷售紀錄',intro:'用準確的說法回應客人。',questions:['native-332-v2-repair']},
  {id:'native-332-v2-continue',style:'continue',label:'接續點餐',title:'提供可行替代',intro:'客人現在需要另一道菜。',questions:['native-332-v2-continue']},
  {id:'native-332-v2-speak',style:'speak',label:'現場口說',title:'簡潔說明限制',intro:'先自己說；錄音或跳過後才聽示範。',model:'It’s unavailable today.',zh:'今天暫時不供應。',speakingPrompt:'客人想點菜單上的菜，但廚房今天沒有供應。',recording:'phrase',questions:[]},
  {id:'native-332-v2-final',style:'final',label:'轉換食材情境',title:'沒有做，不是賣光',intro:'自行寫兩句給客人。',questions:['native-332-v2-final']}
];
export default {revision:2,summary:'辨別 unavailable today 與 sold out，準確告知菜品今天不供應。',steps,questions,takeaways:['It’s unavailable today.','We’re sold out of it.'],completionTitle:'你能清楚說明今天不供應，並避免誤說成已售罄。'};
