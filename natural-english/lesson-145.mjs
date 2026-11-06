import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-145-v2-audio','audio','只聽這句關心的話。說話者最想對方怎樣？',['按身體狀況放慢，不要勉強。','先把訓練縮短到半小時。','暫停今天的訓練，等康復再決定。','把今天未完成的工作留到明天。'],'按身體狀況放慢，不要勉強。','Don’t push yourself 是關心對方不要超過自己當下能負荷的程度。'),
  mc('native-145-v2-branch','branch','朋友病後剛好一點，就說要立刻跑十公里。你想提醒他不要勉強，但可先做一點較輕的活動。哪句符合兩個意思？',["Don't push yourself. You can start with a short walk.","If you feel okay, keep your usual pace.","Skip just this workout and rest today.","Go ahead with ten kilometers and rest afterward."],"Don't push yourself. You can start with a short walk.",'這句同時提醒不要硬撐，並提出短距離散步；全休雖可行，卻沒有表達你希望他先試較輕活動。'),
  mc('native-145-v2-transfer','transfer','同事已連續加班三晚，今晚仍想硬撐到凌晨。你想明確請他把剩餘工作留到明天。哪句最完整地說出這個關心？',["Don't push yourself too hard. The rest can wait until tomorrow.","Maybe finish only the urgent part tonight.","Could you ask someone to share the remaining work?","Take a short break, then decide what still needs doing."],"Don't push yourself too hard. The rest can wait until tomorrow.",'這句直接勸同事別再硬撐，並明確把餘下工作留到明天；其他回應仍可能今晚繼續做。'),
  open('native-145-v2-final','final','最後挑戰：朋友感冒未完全好，仍打算今晚去健身房做高強度訓練。寫兩句英文表達關心，並提出較輕的選擇。',["Don't push yourself while you're still sick. Maybe take a rest day instead.","You're still recovering, so don't push yourself too hard. A gentle walk might be enough today."],'用關心而非命令的語氣，指出當下身體狀況，再提出可行的較輕安排。')
];
const steps=[
  {id:'native-145-v2-audio',style:'audio',label:'聽出關心',title:'別硬撐',intro:'只聽一句提醒。',model:'Don’t push yourself.',zh:'別勉強自己。',audioOnly:true,questions:['native-145-v2-audio']},
  {id:'native-145-v2-branch',style:'branch',label:'病後運動',title:'十公里太急',intro:'回應朋友的具體計劃。',questions:['native-145-v2-branch']},
  {id:'native-145-v2-transfer',style:'transfer',label:'換到工作',title:'加班也會過度',intro:'把關心用到另一種負荷。',questions:['native-145-v2-transfer']},
  {id:'native-145-v2-speak',style:'speak',label:'口頭提醒',title:'同事還想繼續做',intro:'先自己說；錄音或跳過後才聽示範。',model:'Don’t push yourself too hard.',zh:'不要太勉強自己。',speakingPrompt:'同事很累，還想再做幾小時。先口頭提醒。',recording:'phrase',questions:[]},
  {id:'native-145-v2-final',style:'final',label:'恢復挑戰',title:'生病仍想高強度訓練',intro:'自己寫出關心和替代建議。',questions:['native-145-v2-final']}
];
export default {revision:2,summary:'用 Don’t push yourself 關心身體不適或疲累的人，提醒他按能力調整。',steps,questions,takeaways:['Don’t push yourself.','Don’t push yourself too hard.'],completionTitle:'你能在朋友勉強自己時，給出有分寸的提醒。'};
