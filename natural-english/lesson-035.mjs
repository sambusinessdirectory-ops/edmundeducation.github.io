import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-035-v2-audio','audio',
    '只聽一句話。說話者為甚麼不能照原定時間到達？',
    ['車發生故障，無法正常繼續行駛。','他遇上一般塞車。','他忘了帶車匙。','他決定步行。'],
    '車發生故障，無法正常繼續行駛。',
    'My car broke down. 表示車在使用途中出了故障，不能正常繼續走；不是單純塞車。'),
  mc('native-035-v2-explain','explain',
    '為甚麼向等你的朋友說 My car broke down.，比只說 The traffic is bad. 更能解釋你的處境？',
    ['車故障令你暫時不能繼續開；塞車仍可慢慢前進。','車故障表示你不想赴約；塞車表示你已到了。','兩句都表示找不到停車位。','前句表示車已賣掉。'],
    '車故障令你暫時不能繼續開；塞車仍可慢慢前進。',
    'broke down 指機械故障；它讓朋友知道你需要先處理車，而不只是路上慢。'),
  mc('native-035-v2-continue','continue',
    '朋友聽完說 Are you okay? 你人沒事，正在等拖車。下一句怎樣回應能同時報平安和更新情況？',
    ["I'm okay. I'm waiting for a tow truck.",'The food is getting cold.','I can already see your house.','I forgot what time we agreed to meet.'],
    "I'm okay. I'm waiting for a tow truck.",
    '朋友先關心你的人身狀況，再需要知道你如何處理故障；這句兩點都回答了。'),
  blank('native-035-v2-transfer','transfer',
    '換一部機器：家裏洗衣機運作到一半故障停下。用英文說洗衣機壞了、不能繼續運作。',
    ['The washing machine broke down.','My washing machine broke down.','The washing machine has broken down.','My washing machine has broken down.'],
    '同一個片語也能說機器故障。',
    'The washing machine broke down. 把 broke down 從車轉用到洗衣機。'),
  blank('native-035-v2-final','final',
    '最後挑戰：你開車去開會，途中車故障，現在會遲到。寫一則兩句英文訊息，先說明車出事，再通知對方你會遲到。',
    ["My car broke down. I'll be late.","My car broke down, so I'll be late.","My car has broken down. I'll be late.","My car broke down. I'm going to be late."],
    '先說阻礙，再說它對到達時間的影響。',
    'My car broke down. I’ll be late. 把原因和後果交代清楚，方便對方調整安排。')
];

const steps=[
  {id:'native-035-v2-audio',style:'audio',label:'聽出事故',title:'只是塞車，還是車故障？',intro:'先只聽聲音，判斷車能否繼續正常行駛。',model:'My car broke down.',zh:'我的車拋錨了。',audioOnly:true,questions:['native-035-v2-audio']},
  {id:'native-035-v2-explain',style:'explain',label:'分清延誤',title:'拋錨和塞車的差別',intro:'兩者都會遲到，但朋友需要知道真正原因。',questions:['native-035-v2-explain']},
  {id:'native-035-v2-continue',style:'continue',label:'接住關心',title:'朋友先問你安不安全',intro:'報平安，再說你如何處理車。',questions:['native-035-v2-continue']},
  {id:'native-035-v2-speak',style:'speak',label:'電話口說',title:'讓等你的人知道原因',intro:'先用自己的聲音告訴朋友；錄音或跳過後才聽示範。',model:'My car broke down.',zh:'我的車拋錨了。',speakingPrompt:'朋友：Where are you? 你在路上，但車突然故障，不能繼續開。',recording:'phrase',questions:[]},
  {id:'native-035-v2-transfer',style:'transfer',label:'換部機器',title:'洗衣機也會 broke down',intro:'改變主語，不再談交通。',questions:['native-035-v2-transfer']},
  {id:'native-035-v2-final',style:'final',label:'會議訊息',title:'說明故障與遲到',intro:'沒有選項，寫一則對方真正能用來調整安排的訊息。',questions:['native-035-v2-final']}
];

export default {revision:2,summary:'用 broke down 說明車或機器故障，並把延誤原因、平安狀況和下一步交代清楚。',steps,questions,takeaways:['My car broke down.','The washing machine broke down.'],completionTitle:'你能清楚交代拋錨和遲到，也能把說法用於其他機器了！'};
