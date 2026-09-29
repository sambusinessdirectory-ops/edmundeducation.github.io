const mc=(id,style,prompt,options,answer,explanation)=>({id,type:'mc',style,prompt,options,answers:[answer],explanation});
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-009-v2-audio','audio',
    '先只聽一句室內對話。說話者希望對方怎樣調整冷氣？',
    ['把冷氣調弱一點。','把冷氣調強一點。','立刻關掉冷氣。','打開房間的窗。'],
    '把冷氣調弱一點。',
    'Can you turn down the AC? 中的 turn down 是調弱；說話者沒有要求關掉機器。'),
  mc('native-009-v2-detail','detail',
    '酒店房間很冷。你向櫃檯說 The AC is too strong. 哪個字組指出「冷氣」而不是暖氣？',
    ['AC','too strong','The','is'],
    'AC',
    'AC 是 air conditioning 的日常簡稱；too strong 描述它太強，並不指設備。'),
  mc('native-009-v2-contrast','contrast',
    '室友說 Can you turn down the AC? 你想確認他的意思，哪個理解最準確？',
    ['冷氣繼續開，但風力或制冷調弱。','冷氣完全關掉。','把房間調得更冷。','轉去開暖氣。'],
    '冷氣繼續開，但風力或制冷調弱。',
    'turn down 是降低設定或強度；turn off 才是完全關掉。'),
  blank('native-009-v2-final','final',
    '最後挑戰：你在車內，冷氣吹得太強，但不用關掉。用自然英文請司機把冷氣調弱。',
    ['Can you turn down the AC?','Could you turn down the AC?','Can you turn the AC down?','Could you turn the AC down?'],
    '先想清楚是調弱，還是關掉。',
    'turn down the AC / turn the AC down 都表示把冷氣調弱；Can you 和 Could you 都是自然請求。')
];

const steps=[
  {id:'native-009-v2-audio',style:'audio',label:'聽清動作',title:'冷氣要調弱，還是關掉？',intro:'只聽聲音先判斷；答完才看文字。',model:'Can you turn down the AC?',zh:'可以把冷氣調弱一點嗎？',audioOnly:true,questions:['native-009-v2-audio']},
  {id:'native-009-v2-detail',style:'detail',label:'抓設備名稱',title:'AC 指甚麼？',intro:'從完整句中找出冷氣的日常英文名稱。',questions:['native-009-v2-detail']},
  {id:'native-009-v2-contrast',style:'contrast',label:'分清強弱',title:'turn down 與 turn off 不同',intro:'比較調弱與完全關閉，避免把對方的要求聽錯。',questions:['native-009-v2-contrast']},
  {id:'native-009-v2-speak',style:'speak',label:'口說請求',title:'房間太冷，自己開口',intro:'你想冷氣繼續開，只是調弱。先說，再聽示範；錄音可跳過。',model:'Can you turn down the AC?',zh:'可以把冷氣調弱一點嗎？',speakingPrompt:'室友：Is the room too cold? 你想請他把冷氣調弱，不用關掉。',recording:'phrase',questions:[]},
  {id:'native-009-v2-final',style:'final',label:'車內挑戰',title:'換到車上，也要說準動作',intro:'沒有選項，自己寫出向司機提出的自然請求。',questions:['native-009-v2-final']}
];

export default {revision:2,summary:'認識 AC 的日常用法，分清把冷氣調弱與完全關掉。',steps,questions,takeaways:['AC','Can you turn down the AC?'],completionTitle:'你能清楚說出冷氣，並分辨調弱與關掉了！'};
