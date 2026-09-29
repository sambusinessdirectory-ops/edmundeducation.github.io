import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-323-v2-audio','audio','只聽這句話。說話者想店員怎樣處理商品？',
    ['暫時替自己保留。','立即送貨到家。','現在開始維修。','把它退回原廠。'],
    '暫時替自己保留。','put it on hold 指暫時留起商品，通常還需要說明保留多久；不是已經購買。'),
  mc('native-323-v2-scene','scene','你看中一件外套，但要先去銀行，下午會回來買。哪句請求最貼切？',
    ['Could you put this jacket on hold for me until this afternoon?','Could you refund this jacket I already bought?','Could you send this jacket to another country?','Could you repair the zipper before I decide?'],
    'Could you put this jacket on hold for me until this afternoon?','請店員暫留、並給出合理期限；其他請求說的是退款、寄送或維修。'),
  mc('native-323-v2-branch','branch','店員答 Sure. How long do you need us to hold it? 你打算當日下午回來。怎樣接？',
    ["I'll be back this afternoon, if that's okay.","I bought it yesterday.","Please keep it forever.","I'm still looking for the store."],
    "I'll be back this afternoon, if that's okay.",'直接回答保留期限，並讓店員確認是否可行；不假定商店一定能無限期留貨。'),
  mc('native-323-v2-repair','repair','朋友說 I put this jacket on hold，所以「我已經買了」。怎樣修正理解？',
    ['只是請店員暫留，不代表交易已完成。','一定代表已全額付款。','表示外套正在送貨。','表示外套已經退貨。'],
    '只是請店員暫留，不代表交易已完成。','on hold 在這個商店情境是保留；是否付款，需要另外確認。'),
  open('native-323-v2-final','final','最後挑戰：商店只剩一件你想要的鞋，但你要先和朋友確認尺寸，兩小時後會回來。用兩句英文禮貌請店員暫時保留，並說明何時回來。',
    ["Could you put these shoes on hold for me? I'll be back in about two hours.","Would you mind holding these shoes for me until later today? I can return in two hours.","Can you put this pair on hold for two hours? I need to check the size with my friend."],
    '請求暫留時說清楚商品和期限；不要把保留說成已付款或保證店家一定同意。')
];
const steps=[
  {id:'native-323-v2-audio',style:'audio',label:'聽懂請求',title:'先替我留著',intro:'先只聽一句商店用語。',model:'Put it on hold for me.',zh:'幫我暫時保留它。',audioOnly:true,questions:['native-323-v2-audio']},
  {id:'native-323-v2-scene',style:'scene',label:'下午回來',title:'外套先別賣走',intro:'把保留請求放進真實安排。',questions:['native-323-v2-scene']},
  {id:'native-323-v2-branch',style:'branch',label:'店員問期限',title:'答得具體一點',intro:'商店要知道需要留多久。',questions:['native-323-v2-branch']},
  {id:'native-323-v2-repair',style:'repair',label:'分清交易',title:'保留不等於已買',intro:'修正對 on hold 的過度推斷。',questions:['native-323-v2-repair']},
  {id:'native-323-v2-speak',style:'speak',label:'口頭請求',title:'當面請店員留貨',intro:'先自己說；錄音或跳過後才聽示範。',model:'Can you put this on hold for me?',zh:'可以幫我暫時保留這個嗎？',speakingPrompt:'你想店員先留起手上的商品，晚一點回來買。',recording:'phrase',questions:[]},
  {id:'native-323-v2-final',style:'final',label:'鞋店挑戰',title:'兩小時後回來',intro:'自行提出請求和期限。',questions:['native-323-v2-final']}
];
export default {revision:2,summary:'用 put it on hold 請店員暫留商品，並交代期限；保留不等於付款。',steps,questions,takeaways:['Put it on hold for me.','Can you put this on hold for me?'],completionTitle:'你能清楚請店員暫留商品，也會說明何時回來。'};
