import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-084-v2-audio','audio','只聽這句話。說話者最可能是哪種狀態？',
    ['脖子僵硬，轉頭不太舒服。','手指一陣刺麻。','喉嚨乾得說不出話。','眼睛因缺睡而浮腫。'],
    '脖子僵硬，轉頭不太舒服。','stiff neck 是脖子僵硬；單靠這句無法斷定確切原因。'),
  mc('native-084-v2-detail','detail','你剛睡醒，說 I have a stiff neck。哪個補充細節最切合？',
    ['It hurts a little when I turn my head.','My neck is covered in mosquito bites.','I cannot hear the phone ringing.','My lips are dry and cracked.'],
    'It hurts a little when I turn my head.','僵硬的脖子往往令轉頭不舒服；其餘選項談的是不同身體狀況。'),
  mc('native-084-v2-branch','branch','朋友聽到你脖子僵硬，問 Did you sleep funny? 你不確定原因，但想自然接話。怎樣答？',
    ['Maybe. I woke up like this.','Yes, the weather is definitely the cause.','No, I have never slept before.','It means my shoulders are broken.'],
    'Maybe. I woke up like this.','不確定原因時用 Maybe；I woke up like this 說明起床時已經如此，不硬猜成因。'),
  mc('native-084-v2-explain','explain','My shoulders are stiff 和 I have a stiff neck 有甚麼差別？',
    ['前者說肩膀，後者說脖子；都是僵硬，但部位不同。','兩句都只說眼睛腫。','前者是肩膀出血，後者是脖子出血。','後者必然代表嚴重創傷。'],
    '前者說肩膀，後者說脖子；都是僵硬，但部位不同。','stiff 可以形容不同部位；使用時要把真正不舒服的地方說對。'),
  open('native-084-v2-final','final','最後挑戰：你早上醒來，轉頭看朋友時脖子有點僵，但不知道確切原因。朋友問 What’s wrong? 用兩句英文說明狀態和你知道的時間線。',
    ["I have a stiff neck. I woke up like this.","My neck is stiff, and it hurts a bit when I turn my head.","I woke up with a stiff neck. I'm not sure what caused it."],
    '用 stiff neck 說明部位與感覺，再補上醒來時已經如此；不需要把原因說成肯定。')
];
const steps=[
  {id:'native-084-v2-audio',style:'audio',label:'聽出部位',title:'早上轉頭有點難',intro:'先只聽狀態描述。',model:'I have a stiff neck.',zh:'我脖子很僵。',audioOnly:true,questions:['native-084-v2-audio']},
  {id:'native-084-v2-detail',style:'detail',label:'抓住細節',title:'轉頭時的不舒服',intro:'把用詞連到可描述的動作。',questions:['native-084-v2-detail']},
  {id:'native-084-v2-branch',style:'branch',label:'回應猜測',title:'朋友問你是否睡姿不對',intro:'不確定時也能自然接話。',questions:['native-084-v2-branch']},
  {id:'native-084-v2-explain',style:'explain',label:'說對部位',title:'脖子與肩膀',intro:'比較兩個相近身體描述。',questions:['native-084-v2-explain']},
  {id:'native-084-v2-speak',style:'speak',label:'即時口說',title:'轉身前說一聲',intro:'先自己說；錄音或跳過後才聽示範。',model:'My shoulders are stiff.',zh:'我的肩膀很僵硬。',speakingPrompt:'運動後兩邊肩膀僵硬。朋友問你的肩膀怎麼了。',recording:'phrase',questions:[]},
  {id:'native-084-v2-final',style:'final',label:'醒來挑戰',title:'不要猜不確定的原因',intro:'自己說出症狀和時間線。',questions:['native-084-v2-final']}
];
export default {revision:2,summary:'用 stiff neck 描述醒來後的頸部僵硬，並分清脖子與肩膀的部位。',steps,questions,takeaways:['I have a stiff neck.','My shoulders are stiff.'],completionTitle:'你能準確說明脖子僵硬，也能避免把原因說得過於肯定。'};
