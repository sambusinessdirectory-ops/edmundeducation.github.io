import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-121-v2-audio','audio','只聽外送問題。客人遇到甚麼事？',['訂單裡少了一樣東西。','收到別人的整張訂單。','同一筆訂單被扣兩次錢。','整份餐點仍在配送途中。'],'訂單裡少了一樣東西。','missing an item 指部分商品缺漏，並非整張訂單錯了。'),
  mc('native-121-v2-repair','repair','你訂了漢堡、薯條和飲料，只收到漢堡和飲料。客服以為你是說薯條做錯。怎樣澄清？',["The fries are missing from my order.","The fries are overcooked.","I got someone else's fries.","The fries arrived cold."],"The fries are missing from my order.",'食物根本沒送到，用 missing；做錯、送錯或變冷是不同問題。'),
  mc('native-121-v2-explain','explain','客服問 What’s missing? 哪個回答最能讓對方核對訂單？',["The large fries listed on my receipt.","The bag contains two drinks and a burger.","The receipt lists both fries and a drink.","The delivery arrived later than expected."],"The large fries listed on my receipt.",'說出具體缺漏品項和收據上的規格，便於核對及補送。'),
  open('native-121-v2-final','final','最後挑戰：你叫了兩份湯和一份三文治，外送袋裡只有兩份湯。給客服寫兩句英文，指出少了甚麼並請他們幫忙處理。',["An item is missing from my order: the sandwich. Could you help me get it?","I'm missing the sandwich from my order. Could you check what happened?"],'先準確指出缺漏品項，再提出可執行的請求；只說 order is wrong 太籠統。')
];
const steps=[
  {id:'native-121-v2-audio',style:'audio',label:'先聽問題',title:'袋裡少了甚麼？',intro:'只聽，不先看文字。',model:'An item is missing from my order.',zh:'我的訂單少了一樣東西。',audioOnly:true,questions:['native-121-v2-audio']},
  {id:'native-121-v2-repair',style:'repair',label:'澄清缺漏',title:'薯條不是做錯',intro:'把客服的誤會修正到「沒收到」。',questions:['native-121-v2-repair']},
  {id:'native-121-v2-explain',style:'explain',label:'提供細節',title:'讓客服查得到',intro:'回答最有助核對的資訊。',questions:['native-121-v2-explain']},
  {id:'native-121-v2-speak',style:'speak',label:'口頭反映',title:'向餐廳說明',intro:'先自己說；錄音或跳過後才聽示範。',model:'I’m missing an item from my order.',zh:'我的訂單少了一樣東西。',speakingPrompt:'外送袋裡少了飲料。打電話向餐廳反映。',recording:'phrase',questions:[]},
  {id:'native-121-v2-final',style:'final',label:'客服訊息',title:'三文治去哪了？',intro:'自己寫清楚問題和要求。',questions:['native-121-v2-final']}
];
export default {revision:2,summary:'反映外送訂單缺少品項，並提供明確細節讓客服核對。',steps,questions,takeaways:['An item is missing from my order.','I’m missing an item from my order.'],completionTitle:'你能清楚說出外送少了甚麼，並請客服處理。'};
