import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'open',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-048-v2-audio','audio','只聽廁所門內傳出的話。門外的人應該明白甚麼？',
    ['裏面有人，暫時不能進。','廁所已經清潔完。','門沒有鎖。','說話者要借紙巾。'],
    '裏面有人，暫時不能進。','Occupied! 和 Someone’s in here! 都是隔着門提醒外面的人這間廁所有人。'),
  mc('native-048-v2-explain','explain','為甚麼有人敲門時只說 Busy! 不如 Occupied! 明確？',
    ['Occupied! 直接說明這個廁所空間正在使用中。','Busy! 一定表示清潔人員在拖地。','Occupied! 表示門已經損壞。','兩句都只表示洗手盆不能用。'],
    'Occupied! 直接說明這個廁所空間正在使用中。','Busy! 在語境中或許也能讓人明白，但 Occupied! 是更直接的廁所佔用提示。'),
  mc('native-048-v2-continue','continue','你在洗手間內答 Someone’s in here!，門外的人回 Sorry!。你需要怎樣回？',
    ['不必長篇解釋；等對方離開，自己繼續使用。','立即把門打開讓對方進來。','再大聲重複整段話五次。','假裝自己不在裏面。'],
    '不必長篇解釋；等對方離開，自己繼續使用。','這是一個很短的即時提醒；外面的人已明白並道歉，通常不用再延伸對話。'),
  blank('native-048-v2-final','final','最後挑戰：你在餐廳廁所隔間內，有人敲門。用一句簡短自然英文讓對方知道裏面有人。',
    ['Occupied!',"Someone's in here!",'Someone is in here!',"It's occupied!",'This stall is occupied!'],
    '隔着門，簡短回應即可。','Occupied! 或 Someone’s in here! 都能讓門外的人立刻知道需要等一等。')
];

const steps=[
  {id:'native-048-v2-audio',style:'audio',label:'聽出提示',title:'門內的人在說甚麼？',intro:'先只聽聲音，判斷廁所是否可用。',model:'Occupied! / Someone’s in here!',zh:'有人！／裏面有人！',audioOnly:true,questions:['native-048-v2-audio']},
  {id:'native-048-v2-explain',style:'explain',label:'挑選用語',title:'用一個字說清楚',intro:'敲門當下，清楚比解釋很多更重要。',questions:['native-048-v2-explain']},
  {id:'native-048-v2-speak',style:'speak',label:'口頭說明',title:'向朋友解釋隔間有人',intro:'先自己說；錄音或跳過後才聽示範。',model:'This stall is occupied.',zh:'這個隔間有人使用。',speakingPrompt:'朋友指着一個關着門的廁所隔間問：Is this one free? 你知道裏面有人。',recording:'phrase',questions:[]},
  {id:'native-048-v2-continue',style:'continue',label:'到此為止',title:'門外已明白',intro:'即時提醒不需要變成長篇對話。',questions:['native-048-v2-continue']},
  {id:'native-048-v2-final',style:'final',label:'敲門挑戰',title:'廁所裏有人',intro:'全新場景，用最短但清楚的說法回應。',questions:['native-048-v2-final']}
];

export default {revision:2,summary:'廁所門外有人敲門時，用簡短自然的話表示裏面有人。',steps,questions,takeaways:['Occupied! / Someone’s in here!','This stall is occupied.'],completionTitle:'你能在有人敲門時即時、清楚地表示廁所有人了！'};
