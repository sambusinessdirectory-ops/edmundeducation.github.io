import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'open',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-047-v2-audio','audio','只聽酒店客人的一句話。他希望改變哪項安排？',
    ['比原定時間晚退房。','比原定時間早入住。','延長早餐時間。','取消預訂。'],
    '比原定時間晚退房。','late checkout 是延後退房時間；不是延後入住，也不是把整晚住宿自動加長。'),
  mc('native-047-v2-tone','tone','你想問酒店能否在下午一時退房。哪句清楚、禮貌，而且給職員可查的時間？',
    ['Could I check out at 1 p.m., please?','I am staying until whenever I want.','You must change your policy for me.','I checked out yesterday at 1 p.m.'],
    'Could I check out at 1 p.m., please?','具體時間讓職員能查房態；Could I…? 把延遲退房表達成請求，而非擅自決定。'),
  mc('native-047-v2-reverse','reverse','櫃檯問 What time were you hoping to check out? 你希望下午一時。哪句直接回答？',
    ['At 1 p.m., if possible.','I checked in at 1 p.m.','I leave on Friday, not today.','I would like the breakfast menu.'],
    'At 1 p.m., if possible.','對方在問你希望的退房時間；給一個具體時間，再保留酒店確認的空間。'),
  blank('native-047-v2-final','final','最後挑戰：退房時間是中午十二時，你的航班傍晚才起飛。用一句禮貌英文向櫃檯詢問能否下午一時退房。',
    ['Could I check out at 1 p.m., please?','Can I check out at 1 p.m., please?','Would it be possible to check out at 1 p.m.?','Could I get a late checkout until 1 p.m.?'],
    '問是否可以，不要把晚退房當作已批准。','說清楚 1 p.m. 並用請求語氣；酒店能否批准仍需看當天安排。')
];

const steps=[
  {id:'native-047-v2-audio',style:'audio',label:'聽出請求',title:'客人想改哪項時間？',intro:'先只聽一句櫃檯對話。',model:'Can I get a late checkout?',zh:'我可以晚點退房嗎？',audioOnly:true,questions:['native-047-v2-audio']},
  {id:'native-047-v2-tone',style:'tone',label:'問得有禮',title:'提出具體時間',intro:'職員需要知道你希望延至幾點。',questions:['native-047-v2-tone']},
  {id:'native-047-v2-reverse',style:'reverse',label:'回答職員',title:'What time? 不能只說 late',intro:'直接回應對方的時間問題。',questions:['native-047-v2-reverse']},
  {id:'native-047-v2-speak',style:'speak',label:'櫃檯口說',title:'直接詢問晚退房',intro:'先自己說；錄音或跳過後才聽示範。',model:'Can I get a late checkout?',zh:'我可以晚點退房嗎？',speakingPrompt:'酒店櫃檯：How can I help you? 你希望晚一點退房。',recording:'phrase',questions:[]},
  {id:'native-047-v2-final',style:'final',label:'航班挑戰',title:'詢問下午一時退房',intro:'新情境，自己寫出具體而有禮的請求。',questions:['native-047-v2-final']}
];

export default {revision:2,summary:'向酒店詢問晚退房，說清楚希望時間，並等待職員確認。',steps,questions,takeaways:['Can I get a late checkout?','Can I check out at 1 p.m.?'],completionTitle:'你能有禮地詢問晚退房，並說出具體時間了！'};
