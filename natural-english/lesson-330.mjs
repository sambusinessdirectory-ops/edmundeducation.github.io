import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-330-v2-audio','audio','只聽這句向銀行提出的需要。說話者希望怎樣改變卡的狀態？',
    ['把之前暫停使用的卡重新開通。','重新申請一張全新的信用卡。','把信用報告交給銀行凍結。','取消所有過去交易。'],
    '把之前暫停使用的卡重新開通。','unfreeze my card 是解除卡的暫停狀態；不等於申請新卡或撤銷所有交易。'),
  mc('native-330-v2-reverse','reverse','I need to unfreeze my card。哪個中文理解最準確？',
    ['我需要重新開通之前被暫停的卡。','我需要把卡放回冰箱。','我需要凍結自己的信用報告。','我需要取消信用卡帳戶。'],
    '我需要重新開通之前被暫停的卡。','unfreeze 在這個情境是解除卡的暫停使用狀態；前提是卡原先被 frozen。'),
  mc('native-330-v2-repair','repair','你向銀行說 I need to unfreeze my credit report，但眼前問題是信用卡暫時停用。哪個修正較準？',
    ['I need to unfreeze my card.','I need to cancel my credit history.','I need to reverse every purchase.','I need to remove all my bank accounts.'],
    'I need to unfreeze my card.','把受影響的對象改成 card；信用報告凍結是另一回事。'),
  mc('native-330-v2-rewrite','rewrite','銀行已確認可疑交易其實是你本人消費；你想重新使用這張卡。哪句向銀行提出需要最清楚？',
    ["I'd like to reactivate my card now that the transaction has been verified.","I'd like to apply for a second card because my current card is fine.","I'd like every past charge reversed.","I'd like to keep the card frozen indefinitely."],
    "I'd like to reactivate my card now that the transaction has been verified.",'reactivate my card 說明目標是恢復這張卡的使用；已核實交易是情境提供的原因。'),
  open('native-330-v2-final','final','最後挑戰：你的信用卡早前因可疑交易被暫停；你已與銀行確認那筆交易是自己的。你要致電要求重新開通。用兩句英文說明之前的卡狀態，以及現在的請求。',
    ["My card was frozen because of a suspicious charge. I've verified the charge, and I'd like to unfreeze the card.","The bank froze my card earlier. I've confirmed the transaction was mine, so can you reactivate it?","My card is still frozen. I've verified the transaction and would like to have the card reactivated."],
    '先說明卡被暫停，再清楚提出 unfreeze 或 reactivate；別把卡與信用報告的凍結混淆。')
];
const steps=[
  {id:'native-330-v2-audio',style:'audio',label:'聽出請求',title:'想把卡重新開通',intro:'聽清楚要解除暫停的是卡，還是信用報告。',model:'I need to unfreeze my card.',zh:'我需要重新開通我的卡。',audioOnly:true,questions:['native-330-v2-audio']},
  {id:'native-330-v2-reverse',style:'reverse',label:'反向理解',title:'unfreeze 的對象是卡',intro:'辨認這句不是在說信用報告。',questions:['native-330-v2-reverse']},
  {id:'native-330-v2-repair',style:'repair',label:'改準對象',title:'卡與信用報告別混淆',intro:'修正銀行通話裡的說法。',questions:['native-330-v2-repair']},
  {id:'native-330-v2-rewrite',style:'rewrite',label:'換個動詞',title:'reactivate 也可清楚表意',intro:'按銀行已核實的事實提出需要。',questions:['native-330-v2-rewrite']},
  {id:'native-330-v2-speak',style:'speak',label:'電話口說',title:'直接說出要求',intro:'先自己說；錄音或跳過後才聽示範。',model:'I need to unfreeze my card.',zh:'我需要重新開通我的卡。',speakingPrompt:'銀行客服問你今天需要甚麼協助；你要恢復暫停使用的卡。',recording:'phrase',questions:[]},
  {id:'native-330-v2-final',style:'final',label:'銀行通話挑戰',title:'核實後要求恢復使用',intro:'自行說出過去狀態和現在請求。',questions:['native-330-v2-final']}
];
export default {revision:2,summary:'用 unfreeze 或 reactivate 請銀行恢復卡的使用，並分清卡與信用報告的凍結。',steps,questions,takeaways:['Unfreeze / reactivate the card.','I need to unfreeze my card.'],completionTitle:'你能清楚向銀行說明已核實交易，並提出重新開通卡的請求。'};
