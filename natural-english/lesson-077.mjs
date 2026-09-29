import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-077-v2-audio','audio','只聽一個商店標籤。它最可能標示哪類商品？',
    ['準備清貨而減價的商品。','新季原價商品。','只能預訂的商品。','已經售罄的商品。'],
    '準備清貨而減價的商品。','clearance 是清貨減價區常見用字；仍要看具體價格和條件。'),
  mc('native-077-v2-contrast','contrast','on sale 與 on clearance 的關係怎樣理解較準確？',
    ['兩者都可減價；clearance 更指清貨處理。','on sale 一定比 clearance 便宜。','clearance 一定可以退貨。','on sale 只用於網店，clearance 只用於街市。'],
    '兩者都可減價；clearance 更指清貨處理。','不能只憑標籤判定哪個折扣更大或退貨規則；那要看店家的價格和政策。'),
  mc('native-077-v2-reverse','reverse','店員說 It’s 50% off in the clearance section.。哪個問題最可能引出這句回覆？',
    ['Is this on clearance?','What time is the store closing?','Do you have a hair tie?','Can you gift-wrap this?'],
    'Is this on clearance?','回覆同時指出清貨區和折扣，直接回應商品是否正在清貨。'),
  open('native-077-v2-final','final','最後挑戰：你看到一件外套放在清貨架，但沒有清楚價格。用兩句禮貌英文問店員它是否清貨品，以及現在賣多少錢。',
    ['Is this jacket on clearance? How much is it now?','Is this on clearance? Could you tell me the current price?','Is this jacket a clearance item? What is the price?'],
    '先核實是否清貨，再問實際價格；不要只憑架上的標示推斷折扣。')
];

const steps=[
  {id:'native-077-v2-audio',style:'audio',label:'聽出標籤',title:'這是哪一區？',intro:'先只聽商店用語。',model:'clearance',zh:'清貨／清倉。',audioOnly:true,questions:['native-077-v2-audio']},
  {id:'native-077-v2-contrast',style:'contrast',label:'兩種減價',title:'sale 和 clearance',intro:'都可能便宜，但原因不同。',questions:['native-077-v2-contrast']},
  {id:'native-077-v2-reverse',style:'reverse',label:'從回答推問句',title:'店員說五折',intro:'反推顧客剛才問了甚麼。',questions:['native-077-v2-reverse']},
  {id:'native-077-v2-speak',style:'speak',label:'店內口說',title:'問是不是清貨品',intro:'先自己說；錄音或跳過後才聽示範。',model:'clearance',zh:'清貨。',speakingPrompt:'你指着店員正在整理的清貨架，用英文說出這類商品的名稱。',recording:'phrase',questions:[]},
  {id:'native-077-v2-final',style:'final',label:'外套挑戰',title:'標籤沒有清楚價格',intro:'新情境，自己核實分類和售價。',questions:['native-077-v2-final']}
];

export default {revision:2,summary:'分辨 clearance 與一般 sale，並在清貨架核實商品與實際價格。',steps,questions,takeaways:['clearance','This shirt is on sale.'],completionTitle:'你能辨認清貨商品，也會核實售價和條件了！'};
