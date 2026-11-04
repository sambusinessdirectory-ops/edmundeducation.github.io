import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-329-v2-audio','audio','只聽這句話。在這課的刷卡情境，它描述甚麼？',
    ['信用卡暫時被停用。','卡片放進冰箱結冰。','信用報告被凍結。','銀行已發給你新卡。'],
    '信用卡暫時被停用。','My card was frozen 這裡指卡的使用被暫停；不要把它和 freeze your credit report 混為一談。'),
  mc('native-329-v2-contrast','contrast','付款被拒 My card was declined，和 My card was frozen 有甚麼差別？',
    ['declined 是某次付款未獲接受；frozen 是卡暫時不能如常使用。','兩句都保證卡片被偷。','declined 指卡有冰；frozen 指商品缺貨。','兩句都表示退款已完成。'],
    'declined 是某次付款未獲接受；frozen 是卡暫時不能如常使用。','單次付款被拒未必代表卡被凍結；要有銀行通知等資訊，才說 frozen。'),
  mc('native-329-v2-explain','explain','銀行通知「偵測到可疑交易，已暫停你的卡」。哪句轉述沒有把整個信用檔案也說成被凍結？',
    ['The bank froze my card because of a suspicious charge.','The bank froze my credit report at every bureau.','The bank permanently canceled all my accounts.','The merchant gave me a refund.'],
    'The bank froze my card because of a suspicious charge.','這裡被暫停的是卡，而不是信用報告或所有帳戶；句子也保留已知原因。'),
  mc('native-329-v2-rewrite','rewrite','你在收銀處說 My card was declined。之後銀行訊息確認卡已因可疑交易被暫時停用。怎樣更新朋友才準確？',
    ['The bank froze my card after flagging a suspicious charge.','The store must have frozen my credit score.','The charge was reversed, so my card is fine.','The card was only declined once, so nothing changed.'],
    'The bank froze my card after flagging a suspicious charge.','銀行的新通知增加了「凍卡」資訊，這比最初只知付款被拒更具體。'),
  open('native-329-v2-writing','rewrite','最後情境：你在店裡刷卡失敗，稍後看到銀行通知：因可疑交易，信用卡已暫時停用。你要告訴同行朋友發生了甚麼，並表示會聯絡銀行確認。用兩句英文寫出。',
    ["My bank froze my card because of a suspicious charge. I'll contact them to check what's going on.","My card was frozen after the bank flagged a suspicious transaction. I'll call the bank to confirm the details.","The bank has temporarily frozen my card. I'm going to contact them about the suspicious charge."],
    '先報告銀行已通知的事，再說會向銀行確認；不要把信用卡凍結誤講成信用報告凍結。')
];
const steps=[
  {id:'native-329-v2-audio',style:'audio',label:'聽出卡狀態',title:'不是結冰的卡',intro:'先只聽銀行狀況短句。',model:'My card was frozen.',zh:'我的卡被暫時停用了。',audioOnly:true,questions:['native-329-v2-audio']},
  {id:'native-329-v2-contrast',style:'contrast',label:'付款與卡',title:'刷卡被拒不一定是凍卡',intro:'分清某次付款和整張卡的狀態。',questions:['native-329-v2-contrast']},
  {id:'native-329-v2-explain',style:'explain',label:'範圍要說對',title:'卡，還是信用報告？',intro:'辨認 bank froze my card 的真正對象。',questions:['native-329-v2-explain']},
  {id:'native-329-v2-speak',style:'speak',label:'口頭轉述',title:'銀行做了甚麼',intro:'先自己說；錄音或跳過後才聽示範。',model:'The bank froze my card.',zh:'銀行暫時停用了我的卡。',speakingPrompt:'銀行通知已暫時停用你的卡；簡短告訴同行朋友。',recording:'phrase',questions:[]},
  {id:'native-329-v2-rewrite',style:'rewrite',label:'收到新通知',title:'更新原先的說法',intro:'先辨認如何轉述，再自行寫兩句。',questions:['native-329-v2-rewrite','native-329-v2-writing']}
];
export default {revision:2,summary:'分清單次付款被拒、信用卡暫時停用，以及信用報告凍結，並準確轉述銀行通知。',steps,questions,takeaways:['My card was frozen.','The bank froze my card.'],completionTitle:'你能說清楚被暫停的是卡，並按銀行已告知的資訊解釋原因。'};
