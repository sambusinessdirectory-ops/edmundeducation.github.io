import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-078-v2-audio','audio','只聽一句付款情況。已發生了甚麼？',
    ['這張卡付款未能成功。','付款已經完成兩次。','卡已確定遺失。','店員給了折扣。'],
    '這張卡付款未能成功。','My card was declined. 說交易未獲接受；單靠這句不能確定原因。'),
  mc('native-078-v2-contrast','contrast','My card was declined. 能否讓你直接斷定戶口沒錢？',
    ['不能；還可能涉及銀行風控、卡資料或技術問題。','能；這句只會在餘額不足時使用。','能；它表示卡已永久取消。','不能；因為這句其實是成功付款。'],
    '不能；還可能涉及銀行風控、卡資料或技術問題。','declined 描述付款結果，不是診斷原因；需要核對銀行或換一種付款方法。'),
  mc('native-078-v2-rewrite','rewrite','收銀員說 It looks like your card was declined.。你想試另一張卡，哪句回應最能讓交易繼續？',
    ["Okay, let me try another card.","This store must be permanently closed.","I already paid you in cash yesterday.","The card cannot ever work again."],
    "Okay, let me try another card.",'接受目前付款未過的事實，並提出可行下一步；不猜測卡被拒的根本原因。'),
  open('native-078-v2-final','final','最後挑戰：餐廳刷卡失敗，店員在等。用兩句英文簡短確認付款未成功，並提出改用另一張卡。',
    ['It looks like my card was declined. Let me try another card.','My card was declined. Could I try a different one?','Sorry, that card did not go through. I can use another card.'],
    '說出可觀察的付款結果，再提出下一種付款方法；不要把原因說成已確認。')
];

const steps=[
  {id:'native-078-v2-audio',style:'audio',label:'聽出結果',title:'刷卡有成功嗎？',intro:'先只聽付款結果。',model:'My card was declined.',zh:'我的卡付款被拒了。',audioOnly:true,questions:['native-078-v2-audio']},
  {id:'native-078-v2-contrast',style:'contrast',label:'別猜原因',title:'被拒不等於沒錢',intro:'先分開結果和原因。',questions:['native-078-v2-contrast']},
  {id:'native-078-v2-speak',style:'speak',label:'櫃檯口說',title:'向同伴說付款沒過',intro:'先自己說；錄音或跳過後才聽示範。',model:'My card was declined.',zh:'我的卡付款沒通過。',speakingPrompt:'同伴問：Did the payment go through? 你剛才的卡被拒。',recording:'phrase',questions:[]},
  {id:'native-078-v2-rewrite',style:'rewrite',label:'換付款方式',title:'店員在等下一步',intro:'不要卡在原因猜測，先完成付款。',questions:['native-078-v2-rewrite']},
  {id:'native-078-v2-final',style:'final',label:'餐廳挑戰',title:'提出另一張卡',intro:'新情境，自己寫出結果和下一步。',questions:['native-078-v2-final']}
];

export default {revision:2,summary:'用 card was declined 描述付款失敗，不擅自推斷原因，並提出其他付款方法。',steps,questions,takeaways:['My card was declined.','I’m not sure why it was declined.'],completionTitle:'你能準確說明刷卡未過，也能立即提出可行的付款方式了！'};
