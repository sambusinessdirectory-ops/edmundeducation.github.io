import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-179-v2-audio','audio','只聽這句近況。說話者對自己身體的判斷是甚麼？',['似乎快要生病，但還不確定是甚麼。','已經完全康復。','已知道自己患上感冒。','只是昨晚沒睡好，沒有其他不適。'],'似乎快要生病，但還不確定是甚麼。','coming down with something 說初起不適，還未確定具體病因。'),
  mc('native-179-v2-detail','detail','哪組初起徵狀最支持這句話？',['喉嚨有點怪、鼻子不舒服、比平時疲累。','昨晚睡得飽、今天精神很好。','跑完步後立即喘了幾分鐘。','剛運動完，呼吸暫時較快。'],'喉嚨有點怪、鼻子不舒服、比平時疲累。','幾個輕微不適同時出現，可讓人覺得快要生病；運動後短暫喘氣不同。'),
  mc('native-179-v2-explain','explain','為甚麼說 something，而不直接說 a cold？',['症狀剛開始，還不知道是不是感冒。','症狀很明確，已經確定是感冒。','something 一定指特定一種病。','用 something 會比說 a cold 更確定。'],'症狀剛開始，還不知道是不是感冒。','something 保留不確定；有把握是感冒時才可更具體說 a cold。'),
  open('native-179-v2-final','final','最後挑戰：你今天喉嚨微痛、很累，晚上原本約了朋友。你還不能確定是不是感冒。寫兩句英文說明身體感覺，並提出今晚先休息。',["I think I'm coming down with something. My throat hurts, so I'd like to rest tonight.","I'm feeling run-down and my throat is sore. I might be coming down with something, so can we meet another day?"],'用不確定的說法交代初起徵狀，再清楚提出休息或改期。')
];
const steps=[
  {id:'native-179-v2-audio',style:'audio',label:'先聽近況',title:'好像快病了',intro:'只聽一句身體狀況。',model:'I think I’m coming down with something.',zh:'我覺得好像快生病了。',audioOnly:true,questions:['native-179-v2-audio']},
  {id:'native-179-v2-detail',style:'detail',label:'初起線索',title:'喉嚨與疲勞',intro:'找出與病初相符的徵狀。',questions:['native-179-v2-detail']},
  {id:'native-179-v2-explain',style:'explain',label:'保留不確定',title:'還未知道是甚麼',intro:'理解 something 的作用。',questions:['native-179-v2-explain']},
  {id:'native-179-v2-speak',style:'speak',label:'口頭具體化',title:'如果覺得是感冒',intro:'先自己說；錄音或跳過後才聽示範。',model:'I think I’m coming down with a cold.',zh:'我覺得好像快感冒了。',speakingPrompt:'你有典型感冒初起徵狀，想向朋友說可能是感冒。先口頭說。',recording:'phrase',questions:[]},
  {id:'native-179-v2-final',style:'final',label:'今晚挑戰',title:'身體不適先休息',intro:'自己交代狀況和安排。',questions:['native-179-v2-final']}
];
export default {revision:2,summary:'用 coming down with something 描述似乎快生病的初起不適，並保留病因不確定。',steps,questions,takeaways:['I think I’m coming down with something.','I think I’m coming down with a cold.'],completionTitle:'你能自然說出快生病的感覺，也能交代休息安排。'};
