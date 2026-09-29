import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-160-v2-audio','audio','只聽這句提醒。朋友手機正在做甚麼？',['發出來電鈴聲。','只在靜音模式下震動。','手機顯示剛錯過的來電。','手機正在靜音閃動通知。'],'發出來電鈴聲。','ringing 指電話鈴聲在響；vibrating 才是震動。'),
  mc('native-160-v2-scene','scene','餐桌另一頭響起熟悉鈴聲，朋友沒聽見他的手機。你怎樣提醒？',["Your phone's ringing.","Your phone's vibrating silently.","Your phone just stopped ringing.","Your phone rang yesterday."],"Your phone's ringing.",'當下正在響，用現在進行式提醒；昨天響過是已過去的事。'),
  mc('native-160-v2-continue','continue','你提醒後，朋友說 Oh, I didn’t hear it。你知道手機就在他袋旁的桌上，哪句接話最有幫助？',["It's on the table beside your bag.","I think it was ringing from the hallway.","It sounds like it's in your bag.","I think it stopped a moment ago."],"It's on the table beside your bag.",'朋友已表示沒有聽見鈴聲，指出手機在袋旁的桌上，能幫他立刻找到並接聽。'),
  mc('native-160-v2-branch','branch','鈴聲停了，朋友問我是不是來不及接。你看見剛才的未接來電，哪句符合事實？',["It rang, but you didn't answer in time.","It's still ringing right now.","It may still ring again.","You can call back later."],"It rang, but you didn't answer in time.",'鈴聲已停要用過去時 rang；未接來電支持沒有接到。'),
  open('native-160-v2-final','final','最後挑戰：朋友的手機放在外套口袋，鈴聲正在響，他卻在聊天沒留意。用兩句英文提醒並指出手機位置。',["Your phone's ringing. It's in your jacket pocket.","Hey, I think your phone is ringing. Check your coat pocket."],'用現在進行式說正在響，再給具體位置，讓朋友能立即找到手機。')
];
const steps=[
  {id:'native-160-v2-audio',style:'audio',label:'先聽提醒',title:'有來電鈴聲',intro:'先聽提醒，辨認是鈴聲還是震動。',model:'Your phone’s ringing.',zh:'你的手機響了。',audioOnly:true,questions:['native-160-v2-audio']},
  {id:'native-160-v2-scene',style:'scene',label:'餐桌來電',title:'朋友沒聽見',intro:'按聲音和時間選說法。',questions:['native-160-v2-scene']},
  {id:'native-160-v2-continue',style:'continue',label:'幫他找手機',title:'鈴聲從哪來？',intro:'接續對方的反應。',questions:['native-160-v2-continue']},
  {id:'native-160-v2-branch',style:'branch',label:'鈴聲停了',title:'現在要改用過去式',intro:'依照狀態改變回答。',questions:['native-160-v2-branch']},
  {id:'native-160-v2-speak',style:'speak',label:'口頭回顧',title:'剛才響了但沒接',intro:'先自己說；錄音或跳過後才聽示範。',model:'My phone rang, but I didn’t answer it.',zh:'我的手機響了，但我沒接。',speakingPrompt:'朋友問你剛才是不是有電話，你聽到了卻沒接。先口頭回答。',recording:'phrase',questions:[]},
  {id:'native-160-v2-final',style:'final',label:'口袋挑戰',title:'來電正在響',intro:'自己提醒並指出位置。',questions:['native-160-v2-final']}
];
export default {revision:2,summary:'用 Your phone’s ringing 提醒當下來電，並分清鈴聲已停後的過去式。',steps,questions,takeaways:['Your phone’s ringing.','My phone rang, but I didn’t answer it.'],completionTitle:'你能即時提醒朋友接電話，也能描述剛才的未接來電。'};
