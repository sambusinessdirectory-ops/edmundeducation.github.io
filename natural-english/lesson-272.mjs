import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-272-v2-audio','audio','先聽顧客的說法。他在收據上發現甚麼？',['店員收的錢比應收金額少。','店員多收了一筆錢。','同一筆款項扣了兩次。','他的付款被銀行拒絕。'],'店員收的錢比應收金額少。','undercharged 是少收；overcharged 才是多收。'),
  mc('native-272-v2-scene','scene','你買了兩件商品，但收據只列出其中一件。你想主動告訴收銀員。哪句準確？',["I think I was undercharged.","I think I was overcharged.","I was charged twice for both items.","My card was declined."],"I think I was undercharged.",'少算一件使總額偏低；用 I think 留待收銀員核對。'),
  mc('native-272-v2-explain','explain','為何「undercharged」比「wrongly charged」更有用？',['它直接指出錯誤方向：收得太少。','它表示收據完全沒有價格。','它一定代表有人故意偷竊。','它表示信用卡被停用。'],'它直接指出錯誤方向：收得太少。','under- 明確表示低於應收額；店員便知道先檢查是否漏掃商品。'),
  mc('native-272-v2-continue','continue','收銀員說：「Really? Let me check.」你發現牛奶沒列在收據上。怎樣幫他核對？',["I don't think this milk was included.","I paid twice for the milk.","The milk expired yesterday.","I already returned the milk."],"I don't think this milk was included.",'指出具體漏列商品，比只重複少收更容易查清金額。'),
  open('native-272-v2-continue-write','continue','新情境：你結帳後發現收據少列一盒牛奶，總額因此偏低。收銀員請你指出問題。寫兩句英文說明金額方向，並指出漏列的商品。',
    ["I think I was undercharged. This carton of milk isn't on the receipt.","The total looks too low because I was undercharged. I don't see the milk listed here.","I believe one item was missed at checkout. The milk doesn't appear on my receipt."],
    '自評時看是否說明少收而非多收，並指出具體漏列的牛奶。')
];
const steps=[
  {id:'native-272-v2-audio',style:'audio',label:'聽出方向',title:'收多還是收少？',intro:'聽金額方向：店員收少了，還是收多了？',model:'I was undercharged.',zh:'店員少收了我錢。',audioOnly:true,questions:['native-272-v2-audio']},
  {id:'native-272-v2-scene',style:'scene',label:'收據情境',title:'少算了一件貨',intro:'按收據上的商品數目選說法。',questions:['native-272-v2-scene']},
  {id:'native-272-v2-explain',style:'explain',label:'拆解意思',title:'under- 指向哪一邊？',intro:'說明這個字給店員甚麼資訊。',questions:['native-272-v2-explain']},
  {id:'native-272-v2-continue',style:'continue',label:'幫忙核對',title:'指出漏算的牛奶',intro:'接着店員的詢問提供具體線索。',questions:['native-272-v2-continue','native-272-v2-continue-write']},
  {id:'native-272-v2-speak',style:'speak',label:'口頭提醒',title:'主動告訴收銀員',intro:'先自己說；錄音或跳過後才聽示範。',model:'I was undercharged.',zh:'店員少收了我錢。',speakingPrompt:'結帳後發現收據總額比應付額低。向店員指出這件事。',recording:'phrase',questions:[]}
];
export default {revision:2,summary:'用 undercharged 說明店員少收，而非多收或重複扣款，並提出收據上的具體線索。',steps,questions,takeaways:['I was undercharged.'],completionTitle:'你能向收銀員準確指出少收的問題。'};
