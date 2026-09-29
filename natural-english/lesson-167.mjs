import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-167-v2-audio','audio','只聽這個約見提議。雙方現在主要定下了甚麼？',['見面的時間是七點。','見面地點已經確定。','其中一人七點才出發。','這次見面大約七小時。'],'見面的時間是七點。','Let’s meet up at 7 用 at 指具體時刻，尚未交代地點。'),
  mc('native-167-v2-detail','detail','朋友同意星期五晚上七點見，但你們還沒說在哪裡。下一個需要確認的是甚麼？',['見面地點。','是否要說清楚是早上還是晚上。','朋友從哪個出口到達。','哪個地鐵站入口最方便。'],'見面地點。','七點只解決了碰面的時間；如果沒有約定地點，兩人仍可能在不同入口等候。'),
  mc('native-167-v2-branch','branch','朋友問 What time should we meet? 你想提晚上七點。哪句直接接上？',["Let's meet up at 7.","We met at 7 yesterday.","I'll leave at 7 and arrive much later.","The restaurant is open until 7."],"Let's meet up at 7.",'這句提出約見時刻；其他句子談過去、出發時間或地址。'),
  mc('native-167-v2-transfer','transfer','換成週末，但還未定具體時刻。哪句先提出大致安排？',["Let's meet up this weekend.","Let's meet up at 7 tonight.","Let's choose a time this weekend.","Let's meet up next Saturday at 7."],"Let's meet up this weekend.",'meet up 可配週末等大致時間；等對方同意後再定具體時刻。'),
  open('native-167-v2-final','final','最後挑戰：朋友同意週五見面，問你幾點方便。你想約晚上七點在地鐵站入口。寫兩句英文提出時間和地點。',["Let's meet up at 7 on Friday. We can meet at the station entrance.","Seven in the evening works for me. Let's meet up by the subway entrance."],'七點要明確是見面時間，地點另外說明，避免只定一半安排。')
];
const steps=[
  {id:'native-167-v2-audio',style:'audio',label:'先聽時間',title:'七點碰面',intro:'只聽一個約見提議。',model:'Let’s meet up at 7.',zh:'我們七點見面吧。',audioOnly:true,questions:['native-167-v2-audio']},
  {id:'native-167-v2-branch',style:'branch',label:'回答時間',title:'朋友問幾點',intro:'直接提出具體時刻。',questions:['native-167-v2-branch']},
  {id:'native-167-v2-detail',style:'detail',label:'還缺甚麼',title:'七點在哪裡？',intro:'找出安排中的空白。',questions:['native-167-v2-detail']},
  {id:'native-167-v2-transfer',style:'transfer',label:'週末大約',title:'先定哪一天',intro:'把 meet up 用在未定時刻的邀約。',questions:['native-167-v2-transfer']},
  {id:'native-167-v2-speak',style:'speak',label:'口頭邀請',title:'週末見一面',intro:'先自己說；錄音或跳過後才聽示範。',model:'Let’s meet up this weekend.',zh:'週末找時間見面吧。',speakingPrompt:'你想跟朋友週末見面，時刻稍後再定。先口頭提出。',recording:'phrase',questions:[]},
  {id:'native-167-v2-final',style:'final',label:'地鐵站挑戰',title:'時間和地點都定下',intro:'自己寫完整約見安排。',questions:['native-167-v2-final']}
];
export default {revision:2,summary:'用 Let’s meet up at 7 提出具體見面時刻，並記得另行確認地點。',steps,questions,takeaways:['Let’s meet up at 7.','Let’s meet up this weekend.'],completionTitle:'你能把見面時間和地點說完整。'};
