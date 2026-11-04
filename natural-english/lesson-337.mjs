import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-337-v2-audio','audio','只聽旅客的一句話。行李箱外殼留下了甚麼痕跡？',
    ['向內凹的一塊。','向外鼓起的一塊。','一道可以擦掉的灰塵。','拉鍊附近的一個破洞。'],
    '向內凹的一塊。','dented 指外殼被撞出凹痕，與塞得太滿而向外鼓起不同。'),
  mc('native-337-v2-detail','detail','你從輸送帶拿起行李箱，發現硬殼一角向內凹，輪子仍完整。哪句最準？',
    ["There’s a dent in my suitcase.","One of the wheels snapped off.","My suitcase is overstuffed.","The zipper won’t snap shut."],
    "There’s a dent in my suitcase.",'dent 是向內凹痕；題目沒有輪子、裝箱或拉鍊故障。'),
  mc('native-337-v2-branch','branch','行李服務處問 When did you notice the damage? 你剛領回行李時才看到凹痕。哪句回答最有用？',
    ["I noticed the dent as soon as I collected it from the baggage carousel.","I’ve always liked this suitcase’s colour.","I packed a lot of clothes before the trip.","The suitcase may be useful next year."],
    "I noticed the dent as soon as I collected it from the baggage carousel.",'回答發現損壞的時間和地點，方便職員記錄；其餘資訊沒有回答追問。'),
  mc('native-337-v2-repair','repair','你說 My suitcase is bulging，但你想描述的是被撞到向內凹。怎樣改說才準確？',
    ["My suitcase got dented.","My suitcase is overstuffed.","My suitcase is bursting at the seams.","My suitcase handle is jammed."],
    "My suitcase got dented.",'把 bulging 改成 dented，才符合硬殼被撞出向內凹痕的狀況。'),
  open('native-337-v2-final','final','最後挑戰：你剛領回托運行李，硬殼側面出現一大塊以前沒有的凹痕。用兩句英文向航空公司職員指出損壞，以及何時發現。',
    ["There’s a large dent in the side of my suitcase. I noticed it when I picked it up from the baggage carousel.","My suitcase got dented during the trip. I saw the damage as soon as I collected it.","This dent wasn’t here when I checked in my suitcase. I found it after collecting my bag."],
    '指出凹痕位置與發現時間；如果不確定確切是哪個環節造成，避免聲稱看見有人摔箱。')
];
const steps=[
  {id:'native-337-v2-audio',style:'audio',label:'聽出痕跡',title:'外殼撞凹了',intro:'留意向內凹這個形狀。',model:'My suitcase got dented.',zh:'我的行李箱被撞凹了。',audioOnly:true,questions:['native-337-v2-audio']},
  {id:'native-337-v2-detail',style:'detail',label:'看損壞位置',title:'硬殼一角凹下',intro:'只說看得到的損壞。',questions:['native-337-v2-detail']},
  {id:'native-337-v2-branch',style:'branch',label:'回答服務處',title:'何時發現凹痕',intro:'職員需要記錄發現損壞的時間。',questions:['native-337-v2-branch']},
  {id:'native-337-v2-repair',style:'repair',label:'修正形狀',title:'不是裝太滿鼓起',intro:'把向外鼓起與向內凹分清。',questions:['native-337-v2-repair']},
  {id:'native-337-v2-speak',style:'speak',label:'報損口說',title:'即場指出凹痕',intro:'先自己說；錄音或跳過後才聽示範。',model:'My suitcase got dented.',zh:'我的行李箱被撞凹了。',speakingPrompt:'你在行李輸送帶旁，看見箱殼有新的凹痕。',recording:'phrase',questions:[]},
  {id:'native-337-v2-final',style:'final',label:'服務處挑戰',title:'說明損壞與時間',intro:'自行寫兩句，不編造碰撞經過。',questions:['native-337-v2-final']}
];
export default {revision:2,summary:'辨認 dented 是外殼向內凹，並向行李服務處說明發現損壞的時間。',steps,questions,takeaways:['My suitcase got dented.','There’s a dent in my suitcase.'],completionTitle:'你能準確指出行李箱凹痕，並清楚交代何時發現。'};
