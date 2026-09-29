import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-043-v2-audio','audio','只聽一句話。說話者想向對方確認哪項資訊？',
    ['附近能不能泊車。','餐廳是否有空桌。','車輛是否需要維修。','附近有沒有巴士站。'],
    '附近能不能泊車。','Is there parking nearby? 是詢問附近的泊車安排。'),
  mc('native-043-v2-branch','branch','你已駛到餐廳門外，但附近找不到空位。朋友問 Are you here? 哪句最能讓他知道進度？',
    ["I'm nearby. I'm looking for parking.","I haven't left home yet.","I'm stuck in traffic on the highway.","The restaurant has no tables."],
    "I'm nearby. I'm looking for parking.",'說明你已在附近、只差泊車；和未出門或仍在路上不同。'),
  mc('native-043-v2-explain','explain','問 Is there parking nearby? 時，parking 最自然指甚麼？',
    ['附近可泊車的地方或車位。','泊車的動作已完成。','汽車維修服務。','公共交通車站。'],
    '附近可泊車的地方或車位。','這個問句是在查附近有沒有停車安排；若要問一個特定空位，也可說 a parking spot。'),
  blank('native-043-v2-final','final','最後挑戰：朋友在樓上等你。你已到大廈附近但找不到車位。寫兩句英文短訊交代位置和正在做甚麼。',
    ["I'm nearby. I'm looking for parking.","I'm near the building. I'm looking for parking.","I'm close by. I'm looking for a parking spot.","I'm nearby. I'm looking for a parking spot."],
    '你已在附近，但還沒有泊好車。','把位置和正在找車位分開說，朋友就不會誤以為你還塞在路上。')
];

const steps=[
  {id:'native-043-v2-audio',style:'audio',label:'聽出問題',title:'他在問甚麼？',intro:'只聽聲音，先判斷他要查哪項資訊。',model:'Is there parking nearby?',zh:'附近有地方泊車嗎？',audioOnly:true,questions:['native-043-v2-audio']},
  {id:'native-043-v2-branch',style:'branch',label:'更新朋友',title:'已到餐廳附近',intro:'選一句和真正位置一致的回覆。',questions:['native-043-v2-branch']},
  {id:'native-043-v2-explain',style:'explain',label:'理解 parking',title:'parking 不只是動作',intro:'弄清楚問句想查甚麼。',questions:['native-043-v2-explain']},
  {id:'native-043-v2-speak',style:'speak',label:'口頭詢問',title:'請店員指點泊車地方',intro:'先自己開口；錄音或跳過後才聽示範。',model:'Is there parking nearby?',zh:'附近有地方泊車嗎？',speakingPrompt:'到店門口，你看不到停車場。問店員附近能否泊車。',recording:'phrase',questions:[]},
  {id:'native-043-v2-final',style:'final',label:'到達訊息',title:'樓下找車位',intro:'新情境，用兩句交代清楚。',questions:['native-043-v2-final']}
];

export default {revision:2,summary:'問附近泊車安排，並在到達後向朋友說明自己仍在找車位。',steps,questions,takeaways:['look for parking / a parking spot','Is there parking nearby?'],completionTitle:'你能問清泊車地點，也能準確更新自己的到達進度了！'};
