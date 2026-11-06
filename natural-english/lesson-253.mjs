import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-253-v2-audio','audio','先聽一句對肉的評價。說話者抱怨哪一種口感？',
    ['肉裏有很多韌筋，很難咬。','肉外面烤得太焦。','肉的調味太淡。','肉還是冰凍的。'],
    '肉裏有很多韌筋，很難咬。','gristly 指肉含較多筋、軟骨等難咬的部分；焦、淡或冰凍是不同問題。'),
  mc('native-253-v2-scene','scene','你吃一口牛排，味道不錯，但每咬幾下都碰到筋，難以咬斷。哪句最貼切？',
    ['This steak is gristly.','This steak is bland.','This steak is burnt.','This steak is undercooked.'],
    'This steak is gristly.','這裏的關鍵是肉中有筋。bland、burnt 和 undercooked 分別談味道、烤焦和熟度。'),
  mc('native-253-v2-reverse','reverse','朋友說某塊肉「gristly」。哪項觀察最能證實他的意思？',
    ['切面有不少筋，咀嚼時有韌韌的部分。','表面沒有撒鹽，所以味道很淡。','中心還是粉紅色。','表面有烤過的焦痕。'],
    '切面有不少筋，咀嚼時有韌韌的部分。','gristly 聚焦肉的筋和難咬的組織，不是熟度、調味或表面焦痕。'),
  mc('native-253-v2-tone','tone','朋友自己煎牛排，問你「How is it?」你想誠實指出其中有筋，但又不想把整道菜說得一無是處。哪句最合適？',
    ["The flavor's good, but this piece is a bit gristly.","This is disgusting. You can't cook.","It's completely raw and unsafe.","There's nothing wrong with it at all."],
    "The flavor's good, but this piece is a bit gristly.",'a bit 緩和語氣，指出的是這塊肉的筋；其餘說法不是無端責備，就是與情境不符。'),
  open('native-253-v2-tone-write','tone','新情境：朋友親自煮牛排，味道很好，但你的那塊肉有很多筋。寫兩句友善英文，先肯定味道，再準確描述口感。',
    ["The flavor is lovely. My piece is a little gristly, though.","I like the seasoning. This part of the steak is quite gristly and hard to chew.","It tastes good overall. I found a few gristly bits in this piece."],
    '自評時看是否保留真實讚賞，同時把難咬的筋說清楚；不要把問題誤指熟度。')
];

const steps=[
  {id:'native-253-v2-audio',style:'audio',label:'聽出口感',title:'肉有甚麼問題？',intro:'先聽，不看英文評語。',model:'The meat is gristly.',zh:'肉裏很多難咬的筋。',audioOnly:true,questions:['native-253-v2-audio']},
  {id:'native-253-v2-scene',style:'scene',label:'餐桌情境',title:'味道好，卻很難咬',intro:'根據真正的口感選一句話。',questions:['native-253-v2-scene']},
  {id:'native-253-v2-reverse',style:'reverse',label:'由詞找證據',title:'甚麼才算 gristly？',intro:'用食物的實際特徵核對意思。',questions:['native-253-v2-reverse']},
  {id:'native-253-v2-tone',style:'tone',label:'拿捏語氣',title:'對朋友的牛排提出意見',intro:'在誠實和禮貌之間找合適說法。',questions:['native-253-v2-tone','native-253-v2-tone-write']},
  {id:'native-253-v2-speak',style:'speak',label:'口頭描述',title:'說出這塊牛排的問題',intro:'先自己說；錄音或跳過後才聽示範。',model:'This steak is gristly.',zh:'這塊牛排有很多筋。',speakingPrompt:'服務員問牛排如何；這塊肉裏面有不少筋，咬起來很韌。簡短描述。',recording:'phrase',questions:[]}
];

export default {revision:2,summary:'用 gristly 指出肉裏有難咬的筋，並分清它與熟度、調味或表面焦痕。',steps,questions,takeaways:['The meat is gristly.','This steak is gristly.'],completionTitle:'你能準確描述肉裏的韌筋，也能在餐桌上自然表達意見。'};
