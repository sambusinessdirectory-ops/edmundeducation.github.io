import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-141-v2-audio','audio','只聽點 Pizza 時的詞。它指哪一部分？',['放在餅面上的配料。','薄餅底的厚薄。','薄餅旁附送的醬料。','外送費用。'],'放在餅面上的配料。','toppings 指放在 pizza 上面的食材，例如 pepperoni、蘑菇和橄欖。'),
  mc('native-141-v2-reverse','reverse','你想問薄餅上有甚麼配料，例如橄欖、蘑菇。英文要問哪一項？',["What toppings are on it?","What crust is under it?","What size is the pizza?","What type of crust does it have?"],"What toppings are on it?",'toppings 問餅面食材；crust 問餅底，size 和 delivery 問別的事。'),
  mc('native-141-v2-contrast','contrast','店員問 toppings，你回答 thin crust。哪個改法才回答他問的部分？',["Mushrooms and olives, please.","A thinner base, please.","Cut it into eight slices.","Make it a large pizza."],"Mushrooms and olives, please.",'蘑菇和橄欖是可加在餅面上的配料；thin crust 是餅底種類。'),
  mc('native-141-v2-explain','explain','點餐時你要避開橄欖。哪個問題能先確認風險？',["What toppings are on this pizza?","Does this pizza have a thick crust?","Does this come in a large?","Can I ask for a thinner crust?"],"What toppings are on this pizza?",'先問這款薄餅已有甚麼餅面配料，才能知道是否含橄欖。'),
  open('native-141-v2-final','final','最後挑戰：你想點一個薄餅，加蘑菇和意大利辣香腸，不要橄欖。店員問 What toppings would you like? 寫兩句英文回答。',["Mushrooms and pepperoni, please. No olives, thank you.","I'd like pepperoni and mushrooms as toppings. Could you leave off the olives?"],'按店員的 toppings 問題回答餅面食材，再清楚說明要排除橄欖。')
];
const steps=[
  {id:'native-141-v2-audio',style:'audio',label:'先聽用詞',title:'薄餅上加甚麼',intro:'先只聽一個點餐詞。',model:'toppings',zh:'薄餅配料。',audioOnly:true,questions:['native-141-v2-audio']},
  {id:'native-141-v2-reverse',style:'reverse',label:'由需要想問句',title:'餅面有哪些食材？',intro:'把中文需求轉成相關問題。',questions:['native-141-v2-reverse']},
  {id:'native-141-v2-contrast',style:'contrast',label:'分清部位',title:'餅面還是餅底？',intro:'留意服務生問的是 toppings。',questions:['native-141-v2-contrast']},
  {id:'native-141-v2-explain',style:'explain',label:'避開橄欖',title:'先確認已有配料',intro:'點餐前問出關鍵資訊。',questions:['native-141-v2-explain']},
  {id:'native-141-v2-speak',style:'speak',label:'口頭詢問',title:'這款薄餅上有甚麼？',intro:'先自己說；錄音或跳過後才聽示範。',model:'What toppings are on this Pizza?',zh:'這個薄餅有甚麼配料？',speakingPrompt:'你想知道這款薄餅有沒有橄欖，先問店員有哪些配料。',recording:'phrase',questions:[]},
  {id:'native-141-v2-final',style:'final',label:'點餐挑戰',title:'要兩種，不要橄欖',intro:'自己回答店員。',questions:['native-141-v2-final']}
];
export default {revision:2,summary:'認識 pizza toppings 是餅面配料，能查問及指定加減食材，與餅底區分。',steps,questions,takeaways:['toppings','What toppings are on this Pizza?'],completionTitle:'你能清楚問配料，也能說明想加和不想加甚麼。'};
