import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-288-v2-audio','audio','先聽這句店內對話。說話者為何還不能走？',['收銀員正在替她掃貨結帳。','店員正替她補貨。','她在等餐廳座位。','她還未挑選任何商品。'],'收銀員正在替她掃貨結帳。','ringing me up 是在收銀台替顧客輸入商品和結算金額。'),
  mc('native-288-v2-scene','scene','朋友在商店門口等你，收銀員正在掃描你買的幾件衣服。你怎樣回應朋友？',["Almost. She's ringing me up now.","She's putting new clothes on the shelves.","I haven't chosen anything yet.","The store closed hours ago."],"Almost. She's ringing me up now.",'Almost 告知快好，ringing me up 說明你正在結帳。'),
  mc('native-288-v2-explain','explain','這裏的「ringing me up」不是店員打電話給你。哪個證據最有力？',['店員正在掃碼並計算應付總額。','你的手機正在響。','店員拿着電話聽筒。','你接到商店的來電。'],'店員正在掃碼並計算應付總額。','購物及收銀台場景使 ring up 解作替顧客結帳。'),
  mc('native-288-v2-branch','branch','朋友說：「Okay, I’ll wait over here.」收銀員還有最後一件貨未掃。你怎樣接話？',["Thanks. I'll be there as soon as she finishes ringing me up.","Please leave without telling me.","I never bought anything in this store.","We already ate our dinner."],"Thanks. I'll be there as soon as she finishes ringing me up.",'朋友已同意在旁邊等；向他道謝並說收銀員完成結帳後就過去，能自然接續對話。'),
  mc('native-288-v2-continue','continue','朋友問：「Are you ready to go?」你已把貨放到收銀台，但還沒付款。哪句最自然？',["Almost. The cashier is ringing me up.","Yes, I left all the items at home.","No, I'm still looking for a table.","The cashier is cleaning the windows."],"Almost. The cashier is ringing me up.",'正在結帳表示還差最後一步；Almost 比直接說 ready 更貼合進度。'),
  open('native-288-v2-continue-write','continue','新情境：朋友在商店門外等你。收銀員正在掃最後兩件貨，付款後你便會出去。寫兩句英文回覆朋友目前進度和你何時會過去。',
    ["The cashier is ringing me up now. I'll be outside as soon as I pay.","I'm almost done; she's ringing me up. I'll meet you at the door in a minute.","She's still scanning my last two items. I'll come out right after checkout."],
    '自評時看是否說清楚正在結帳，而不是仍在挑商品，並交代很快會出去。')
];
const steps=[
  {id:'native-288-v2-audio',style:'audio',label:'聽出購物階段',title:'朋友還在等甚麼？',intro:'聽店員是在掃貨結帳，還是已收完錢。',model:'She’s ringing me up.',zh:'她正在替我結帳。',audioOnly:true,questions:['native-288-v2-audio']},
  {id:'native-288-v2-scene',style:'scene',label:'商店門口',title:'朋友催你離開',intro:'根據收銀員當下的動作回答。',questions:['native-288-v2-scene']},
  {id:'native-288-v2-explain',style:'explain',label:'理解口語',title:'這裏沒有電話',intro:'從購物場景判斷 ring up 的意思。',questions:['native-288-v2-explain']},
  {id:'native-288-v2-branch',style:'branch',label:'接朋友回應',title:'他會在旁邊等',intro:'說明結帳完成後會過去。',questions:['native-288-v2-branch']},
  {id:'native-288-v2-continue',style:'continue',label:'交代進度',title:'還差最後一步',intro:'回應朋友準備走的問題。',questions:['native-288-v2-continue','native-288-v2-continue-write']},
  {id:'native-288-v2-speak',style:'speak',label:'即時口說',title:'告訴朋友你快好了',intro:'先自己說；錄音或跳過後才聽示範。',model:'She’s ringing me up.',zh:'她正在替我結帳。',speakingPrompt:'收銀員正逐件掃描你買的貨，朋友在門口等。簡短解釋。',recording:'phrase',questions:[]}
];
export default {revision:2,summary:'用 ringing me up 說明店員正在替你掃貨及結帳，並向等候的朋友交代進度。',steps,questions,takeaways:['She’s ringing me up.'],completionTitle:'你能自然告訴朋友自己正在結帳，很快便可離開。'};
