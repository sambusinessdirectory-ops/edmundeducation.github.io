import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-054-v2-audio','audio','只聽一句邀請。說話者請朋友做甚麼？',
    ['到說話者這裏來坐坐。','跟說話者離開這個地方。','打電話給另一個朋友。','幫說話者搬家。'],
    '到說話者這裏來坐坐。','Do you want to come over? 在熟人之間是邀請對方來自己所在的地方，通常是家。'),
  mc('native-054-v2-contrast','contrast','Do you want to come over? 和 Do you want to go out? 最大差別是甚麼？',
    ['前句邀對方來你這裏；後句提議一起外出。','前句要求搬家；後句要求出國。','兩句都只表示在家打電話。','前句問天氣；後句問交通。'],
    '前句邀對方來你這裏；後句提議一起外出。','come over 的方向是往邀請者所在處；go out 是離開所在處去外面活動。'),
  mc('native-054-v2-reverse','reverse','朋友問 Any plans tonight? 你沒事，想邀他來你家。哪句自然又留給對方選擇？',
    ['Not really. Do you want to come over?','Yes. You must come to my house now.','No. I am coming over to your home without asking.','The house was built last year.'],
    'Not really. Do you want to come over?','先回應今晚安排，再用問句邀請；對方可以接受或拒絕。'),
  blank('native-054-v2-final','final','最後挑戰：朋友週末沒有計劃，你在家準備看電影。用兩句英文邀請他星期六來你家一起看電影。',
    ['Do you want to come over on Saturday? We can watch a movie.','Would you like to come over on Saturday? We can watch a movie.','Do you want to come over Saturday? We could watch a movie.','Want to come over on Saturday? We can watch a movie.'],
    '說明來你家、哪一天，以及可以一起做甚麼。','come over 表示到邀請者這裏；加上 Saturday 和 watch a movie，邀請就具體而容易回覆。')
];

const steps=[
  {id:'native-054-v2-audio',style:'audio',label:'聽出邀請',title:'朋友被邀去哪裏？',intro:'先只聽聲音，判斷方向。',model:'Do you want to come over?',zh:'你想過來我這裏嗎？',audioOnly:true,questions:['native-054-v2-audio']},
  {id:'native-054-v2-contrast',style:'contrast',label:'來還是出去',title:'come over ≠ go out',intro:'兩句方向不同，活動安排也不同。',questions:['native-054-v2-contrast']},
  {id:'native-054-v2-reverse',style:'reverse',label:'今晚邀約',title:'接住朋友的問題',intro:'先回答安排，再自然提出邀請。',questions:['native-054-v2-reverse']},
  {id:'native-054-v2-speak',style:'speak',label:'親口邀請',title:'請朋友過來',intro:'先自己說；錄音或跳過後才聽示範。',model:'Do you want to come over?',zh:'你想過來我這裏嗎？',speakingPrompt:'朋友：I have no plans tonight. 你想請他來你家坐坐。',recording:'phrase',questions:[]},
  {id:'native-054-v2-final',style:'final',label:'週末電影',title:'讓邀請更具體',intro:'新情境，自己說明時間和活動。',questions:['native-054-v2-final']}
];

export default {revision:2,summary:'用 come over 邀朋友來自己這裏，分清與 go out 的方向，並提出具體活動。',steps,questions,takeaways:['come over','Do you want to come over?'],completionTitle:'你能自然邀請朋友來家裏，也能把時間和活動說清楚了！'};
