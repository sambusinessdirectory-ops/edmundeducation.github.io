import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-039-v2-audio','audio','只聽一句視訊通話中的話。發生了甚麼事？',
    ['對方畫面定住不動。','對方把鏡頭關掉了。','電話完全斷線。','畫面正常但聲音太小。'],
    '對方畫面定住不動。',"You're frozen. 在視訊中說對方的畫面卡住；不代表對方真的感到冷。"),
  mc('native-039-v2-scene','scene','網上會議中，對方的臉定格，但你仍聽到他的聲音。你要讓他知道甚麼？',
    ["You're frozen, but I can still hear you.","Your microphone is muted; I can't hear you.","Your camera is off; I can't see you.","The meeting has ended."],
    "You're frozen, but I can still hear you.",'畫面卡住但聲音仍在；這句把兩個訊號分開說清楚，方便對方處理影像連線。'),
  mc('native-039-v2-contrast','contrast','Your video is lagging. 和 You’re frozen. 最核心的差別是甚麼？',
    ['lagging 是畫面延遲或不順；frozen 是畫面停在同一格。','lagging 指開不了咪；frozen 指沒有耳機。','兩句都只表示網頁沒開。','前句是稱讚畫面；後句是批評說話速度。'],
    'lagging 是畫面延遲或不順；frozen 是畫面停在同一格。','若動作還在但慢半拍，可說 lagging；若停成一張靜止畫面，可說 frozen。'),
  blank('native-039-v2-rewrite','rewrite','你原本傳 Your screen is bad.。改成一句具體英文：對方的畫面定住，但你還聽得到聲音。',
    ["You're frozen, but I can still hear you.","Your video is frozen, but I can still hear you.","Your screen is frozen, but I can still hear you."],
    '分開描述影像和聲音。',"You're frozen, but I can still hear you. 讓對方知道故障只出在畫面，不必先排查咪高峰。"),
  blank('native-039-v2-final','final','最後挑戰：線上面試時，面試官的影像突然定格，你仍能聽到她。用一句禮貌英文報告畫面問題，並問她可否重連。',
    ["Your video seems to be frozen. Could you reconnect?","Your video is frozen. Could you reconnect?","I can hear you, but your video is frozen. Could you reconnect?","Your video seems frozen. Could you reconnect?"],
    '說清楚影像問題，再提出可行的下一步。','先避免把聲音問題誤報，然後禮貌建議 reconnect；seems 也讓語氣更柔和。')
];

const steps=[
  {id:'native-039-v2-audio',style:'audio',label:'聽出故障',title:'畫面發生甚麼事？',intro:'先只聽，不看句子。',model:'You’re frozen.',zh:'你的視訊畫面卡住了。',audioOnly:true,questions:['native-039-v2-audio']},
  {id:'native-039-v2-scene',style:'scene',label:'鏡頭停格',title:'聲音還在，畫面不動',intro:'分開判斷影像與聲音。',questions:['native-039-v2-scene']},
  {id:'native-039-v2-contrast',style:'contrast',label:'分清症狀',title:'延遲還是完全定格？',intro:'用不同詞描述不同程度的畫面問題。',questions:['native-039-v2-contrast']},
  {id:'native-039-v2-speak',style:'speak',label:'即時提醒',title:'請同事檢查畫面',intro:'先自己說；錄音或跳過後才看示範。',model:'You’re frozen.',zh:'你的畫面卡住了。',speakingPrompt:'視訊中，同事的臉停在同一格，他還不知道。',recording:'phrase',questions:[]},
  {id:'native-039-v2-rewrite',style:'rewrite',label:'具體回報',title:'不是「畫面不好」而已',intro:'交代聲音是否仍正常。',questions:['native-039-v2-rewrite']},
  {id:'native-039-v2-final',style:'final',label:'面試挑戰',title:'禮貌請面試官重連',intro:'全新情境，自己寫出清楚而有禮的句子。',questions:['native-039-v2-final']}
];

export default {revision:2,summary:'在視訊中分辨畫面定格與延遲，並分開描述影像、聲音和下一步。',steps,questions,takeaways:['You’re frozen.','Your video is lagging.'],completionTitle:'你能具體報告視訊畫面問題，並有禮請對方重連了！'};
