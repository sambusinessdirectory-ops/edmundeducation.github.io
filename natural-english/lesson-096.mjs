import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-096-v2-audio','audio','只聽這句話。說話者希望對方做甚麼？',
    ['讓出一點空間，讓自己經過。','帶自己去下一個城市。','把東西交給自己。','跟自己交換座位。'],
    '讓出一點空間，讓自己經過。','get by 在此情境是從旁邊通過；不是去旅行或取得物件。'),
  mc('native-096-v2-tone','tone','電影院裡你要走過一排坐著的人去自己的座位。哪句有禮而清楚？',
    ['Excuse me, can I get by?','Excuse me, is this seat taken?','Could you move to another row?','Would you mind swapping seats with me?'],
    'Excuse me, can I get by?','你只需要經過，不是詢問座位是否有人、要求換排或交換座位。'),
  mc('native-096-v2-rewrite','rewrite','原稿：Can I go around your body? 你只想請前面的人讓你穿過。怎樣改自然？',
    ['Excuse me, can I get by?','Can I own your body?','Can I change this building?','Can I sit on your bag?'],
    'Excuse me, can I get by?','在擠迫位置請人讓路，get by 簡潔自然；原稿逐字形容身體，不像日常請求。'),
  open('native-096-v2-final','final','最後挑戰：飛機上你坐靠窗，想去洗手間。靠走道的乘客正坐著看書。用兩句英文先引起注意，再禮貌請對方讓你經過。',
    ["Excuse me. Could I get by for a moment?","Excuse me, can I get by? I need to get out for a minute.","Sorry to bother you. Would you mind letting me get by?"],
    '先用 Excuse me 或 Sorry to bother you；再把需要經過說清楚，給對方移動的機會。')
];
const steps=[
  {id:'native-096-v2-audio',style:'audio',label:'聽懂請求',title:'想從旁邊經過',intro:'聽出說話者想移動的位置。',model:'Can I get by?',zh:'可以讓我過去嗎？',audioOnly:true,questions:['native-096-v2-audio']},
  {id:'native-096-v2-tone',style:'tone',label:'影院座位',title:'先讓人知道你要過去',intro:'比較有禮與突兀的開口。',questions:['native-096-v2-tone']},
  {id:'native-096-v2-rewrite',style:'rewrite',label:'改自然一點',title:'不必逐字說「你的身體」',intro:'用日常請求替換生硬翻譯。',questions:['native-096-v2-rewrite']},
  {id:'native-096-v2-speak',style:'speak',label:'即時開口',title:'飛機走道',intro:'先自己說；錄音或跳過後才聽示範。',model:'Excuse me, can I get by?',zh:'不好意思，可以讓我過去嗎？',speakingPrompt:'你想從坐在外側的乘客旁邊經過。',recording:'phrase',questions:[]},
  {id:'native-096-v2-final',style:'final',label:'靠窗挑戰',title:'禮貌請人移動一下',intro:'新情境，自己組織請求。',questions:['native-096-v2-final']}
];
export default {revision:2,summary:'用 Can I get by? 請人讓你經過，並配合 Excuse me 讓請求有禮。',steps,questions,takeaways:['Can I get by?','Excuse me, can I get by?'],completionTitle:'你能在擠迫位置自然請人讓路。'};
