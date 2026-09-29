import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-066-v2-audio','audio','只聽一句話。屋裏目前最可能出了甚麼狀況？',
    ['沒有電力供應。','只有一盞燈被人關上。','冷氣溫度太低。','網絡密碼更改了。'],
    '沒有電力供應。','The power is out. 說的是停電，不只是某人關了燈。'),
  mc('native-066-v2-branch','branch','酒店房間的燈和插座突然都不能用。向前台報告後，哪句補充最有助職員判斷範圍？',
    ['The lights and outlets in my room have no power.','The curtain is blue.','I checked in yesterday.','I would like a bigger pillow.'],
    'The lights and outlets in my room have no power.','補上房間和受影響的設備，讓前台分清是否只是一盞燈壞了。'),
  mc('native-066-v2-continue','continue','前台說 We’ll check it right away. 你已報告房間停電。最自然的下一句是甚麼？',
    ['Thank you. Please let me know what you find.','No, I have never stayed here.','The power cannot ever return.','Please ignore the room.'],
    'Thank you. Please let me know what you find.','職員已答應立刻檢查；先道謝，再請對方告知檢查結果，才能知道房間何時可能恢復供電。'),
  mc('native-066-v2-tone','tone','你只知道自己房間沒電，還不知道整棟樓是否受影響。哪句報告避免過度斷言？',
    ['The power is out in my room.','The entire city has no electricity.','Every building in the area has gone dark.','The electrical grid is permanently broken.'],
    'The power is out in my room.','把範圍限制在自己確認過的房間；不要憑一間房的情況推論整座城市。'),
  open('native-066-v2-final','final','最後挑戰：你在酒店房間，燈和插座都沒電。向前台用兩句英文報告停電，並請他們檢查。',
    ['The power is out in my room. Could someone check it?','There’s no power in my room. Could you send someone to check?','The lights and outlets in my room aren’t working. Could someone take a look?'],
    '清楚說明你確認到的範圍和設備，再提出檢查請求；不要猜測原因。')
];

const steps=[
  {id:'native-066-v2-audio',style:'audio',label:'聽出狀況',title:'燈為甚麼全滅？',intro:'先只聽一句報告。',model:'The power is out.',zh:'停電了。',audioOnly:true,questions:['native-066-v2-audio']},
  {id:'native-066-v2-branch',style:'branch',label:'補上範圍',title:'房間還是整棟樓？',intro:'說出你已確認的設備。',questions:['native-066-v2-branch']},
  {id:'native-066-v2-tone',style:'tone',label:'不亂推論',title:'只說你知道的',intro:'停電範圍未確認時避免誇大。',questions:['native-066-v2-tone']},
  {id:'native-066-v2-speak',style:'speak',label:'前台口說',title:'報告房間沒電',intro:'先自己說；錄音或跳過後才聽示範。',model:'The power is out.',zh:'停電了。',speakingPrompt:'酒店前台問：What seems to be the problem? 你房間燈和插座都不能用。',recording:'phrase',questions:[]},
  {id:'native-066-v2-continue',style:'continue',label:'接住安排',title:'職員會立刻檢查',intro:'簡短感謝，並請對方跟進。',questions:['native-066-v2-continue']},
  {id:'native-066-v2-final',style:'final',label:'酒店挑戰',title:'停電並要求檢查',intro:'新情境，自己寫有用的報告。',questions:['native-066-v2-final']}
];

export default {revision:2,summary:'用 The power is out. 報告停電，說清已知範圍，並請人檢查。',steps,questions,takeaways:['The power is out.','The power went out.'],completionTitle:'你能準確報告停電範圍，也能清楚提出檢查需要了！'};
