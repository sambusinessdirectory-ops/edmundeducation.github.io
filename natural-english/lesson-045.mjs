import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-045-v2-audio','audio','只聽一句話。司機接下來需要做甚麼？',
    ['在這裏讓乘客下車。','去車站接乘客。','把車停進車房。','繼續載乘客到下一座城市。'],
    '在這裏讓乘客下車。','drop me off 是司機把乘客送到某處讓他下車；pick me up 才是接人上車。'),
  mc('native-045-v2-detail','detail','你說 You can drop me off here.。句中的 me 指誰？',
    ['需要下車的乘客。','負責開車的人。','稍後來接你的人。','已經離開的店員。'],
    '需要下車的乘客。','drop me off 中的 me 是下車的人；句子是向司機說話。'),
  mc('native-045-v2-branch','branch','朋友開車載你。他問 Do you want me to pull up to the entrance? 你想減少他繞路，這裏下即可。哪句回覆自然？',
    ["No, thanks. You can drop me off here.","Yes, please pick me up here.","I need you to park and come inside.","Don't drive me anywhere."],
    "No, thanks. You can drop me off here.",'拒絕繞到入口，同時明確告訴朋友這裏下車就可以；pick me up 是來接，不是讓你下車。'),
  blank('native-045-v2-repair','repair','你向司機說 You can pick me up here.，但你人已在車上、現在想下車。請改成自然的一句英文。',
    ['You can drop me off here.','Could you drop me off here?','Can you drop me off here?','Please drop me off here.'],
    '你要司機讓你下車，不是來接你。','drop me off 指把你送到指定位置讓你下車；pick me up 指接你上車。'),
  blank('native-045-v2-final','final','最後挑戰：你坐朋友的車到火車站。正門前車太多；你願意在旁邊安全可停的位置下車。用英文告訴朋友，不用他駛到正門。',
    ['You can drop me off over here. No need to go to the entrance.','You can drop me off here. No need to go to the entrance.','You can let me out here. No need to go to the entrance.','I can get out here. No need to go to the entrance.'],
    '說明在附近下車就好，也免去繞到正門。','drop me off here 直接告訴司機位置；後句讓朋友知道不用在繁忙正門停車。')
];

const steps=[
  {id:'native-045-v2-audio',style:'audio',label:'聽出動作',title:'接人還是讓人下車？',intro:'先只聽一句，不看逐字稿。',model:'You can drop me off here.',zh:'你可以在這裏讓我下車。',audioOnly:true,questions:['native-045-v2-audio']},
  {id:'native-045-v2-detail',style:'detail',label:'釐清主語',title:'誰下車？',intro:'對着司機說話時，留意句中的 me。',questions:['native-045-v2-detail']},
  {id:'native-045-v2-branch',style:'branch',label:'朋友提議',title:'不用駛到正門',intro:'接住朋友的問題，說明你想在哪裏下。',questions:['native-045-v2-branch']},
  {id:'native-045-v2-speak',style:'speak',label:'車上口說',title:'告訴司機這裏就好',intro:'先自己開口；錄音或跳過後才聽示範。',model:'You can drop me off here.',zh:'你可以在這裏讓我下車。',speakingPrompt:'司機：Where would you like me to stop? 車已停在合適位置。',recording:'phrase',questions:[]},
  {id:'native-045-v2-repair',style:'repair',label:'修正方向',title:'pick up 說反了',intro:'上車和下車用不同片語。',questions:['native-045-v2-repair']},
  {id:'native-045-v2-final',style:'final',label:'車站挑戰',title:'正門太擠，旁邊下車',intro:'新情境，自己把地點和原因交代清楚。',questions:['native-045-v2-final']}
];

export default {revision:2,summary:'用 drop me off 向司機說明下車地點，分清 pick up 與 drop off。',steps,questions,takeaways:['You can drop me off here.','Can you pick me up at the station?'],completionTitle:'你能準確說出接人和讓人下車，也能自然指示下車地點了！'};
