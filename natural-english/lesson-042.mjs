import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-042-v2-audio','audio','只聽一句話。說話者為甚麼難以準時到達？',
    ['車被堵在車流裏。','車已經拋錨。','他正在找停車位。','他改乘火車。'],
    '車被堵在車流裏。',"I'm stuck in traffic. 指被車流阻住；不能從這句推斷車本身有故障。"),
  mc('native-042-v2-contrast','contrast','你仍在緩慢行駛，並沒有車輛故障。哪句符合事實？',
    ["I'm stuck in traffic.","My car broke down.","I can't find my keys.","My flight was cancelled."],
    "I'm stuck in traffic.",'stuck in traffic 指路況阻滯；broke down 則指車輛機械故障。'),
  mc('native-042-v2-repair','repair','朋友問 Where are you? 你只回答 I’m late.，但他需要知道原因。哪句補充最有幫助？',
    ["I'm stuck in traffic near the tunnel.","My jacket is blue.","The restaurant looks nice.","I was early yesterday."],
    "I'm stuck in traffic near the tunnel.",'補上交通阻滯和大概位置，讓朋友理解目前狀況，不只知道結果是遲到。'),
  blank('native-042-v2-rewrite','rewrite','你傳了 Traffic. 給等你的朋友。改寫成一句完整英文，說你被車流堵住。',
    ["I'm stuck in traffic.","I am stuck in traffic.","I'm stuck in heavy traffic.","I'm caught in traffic."],
    '說明自己目前處於甚麼狀況。',"I'm stuck in traffic. 是日常說「塞在車陣中」的自然完整句。"),
  blank('native-042-v2-final','final','最後挑戰：你正開車去餐廳，遇上嚴重塞車，預計遲到十分鐘。寫兩句英文訊息給等你的人，說明原因和預計延誤。',
    ["I'm stuck in traffic. I'll be about ten minutes late.","I'm stuck in traffic. I'll be ten minutes late.","I'm stuck in heavy traffic. I'll be about ten minutes late.","I'm caught in traffic. I'll be about ten minutes late."],
    '同時交代原因和可用來調整安排的時間。','塞車是原因，遲到十分鐘是對朋友有用的預計；兩項資訊都要有。')
];

const steps=[
  {id:'native-042-v2-audio',style:'audio',label:'聽出路況',title:'為何還未到？',intro:'先只聽一句交通訊息。',model:'I’m stuck in traffic.',zh:'我塞在車陣中。',audioOnly:true,questions:['native-042-v2-audio']},
  {id:'native-042-v2-contrast',style:'contrast',label:'塞車或故障',title:'車能動，只是道路很塞',intro:'分清交通和車輛機械問題。',questions:['native-042-v2-contrast']},
  {id:'native-042-v2-repair',style:'repair',label:'補足原因',title:'不只說「我會遲到」',intro:'讓等你的人知道目前位置和阻礙。',questions:['native-042-v2-repair']},
  {id:'native-042-v2-speak',style:'speak',label:'電話口說',title:'朋友問你到哪裏了',intro:'自己說出延誤原因；錄音或跳過後才看示範。',model:'I’m stuck in traffic.',zh:'我塞在車陣中。',speakingPrompt:'電話中，朋友問：Are you almost here? 你仍在車流裏。',recording:'phrase',questions:[]},
  {id:'native-042-v2-rewrite',style:'rewrite',label:'完整訊息',title:'把 Traffic. 說完整',intro:'用完整句讓朋友一看就明白。',questions:['native-042-v2-rewrite']},
  {id:'native-042-v2-final',style:'final',label:'餐廳挑戰',title:'預計遲到十分鐘',intro:'新情境，自己傳出有用的到達更新。',questions:['native-042-v2-final']}
];

export default {revision:2,summary:'用 stuck in traffic 解釋道路阻滯，區分車輛故障，並提供預計遲到時間。',steps,questions,takeaways:['I’m stuck in traffic.','I’m running late.'],completionTitle:'你能清楚交代塞車和預計到達時間了！'};
