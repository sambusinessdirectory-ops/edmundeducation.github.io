import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-310-v2-audio','audio','只聽這塊奶油的狀態。現在最可能遇到甚麼？',['剛離開雪櫃，硬得抹不開。','已融化到會滴下來。','在室溫放太久而完全融化。','奶油有點軟，但仍能成片地抹開。'],'剛離開雪櫃，硬得抹不開。','isn’t spreadable yet 說現在不能順利塗抹；yet 暗示再等一會可能變軟。'),
  mc('native-310-v2-contrast','contrast','奶油太硬，刀一推就把多士弄破。哪個描述比「奶油已融化」準確？',["The butter isn't spreadable yet.","The butter has melted completely.","The toast is too soft to eat.","The butter has gone rancid."],"The butter isn't spreadable yet.",'問題是奶油太硬而抹不開，不是融化或油脂變質。'),
  mc('native-310-v2-tone','tone','朋友問可否現在抹奶油，你想建議稍等一會。哪句自然？',["It's still too hard to spread; let's leave it out for a few minutes.","Try pressing harder with the knife.","Let's warm the toast instead of waiting.","Could we slice the butter and put it on top?"],"It's still too hard to spread; let's leave it out for a few minutes.",'說明當下太硬，再給奶油一些時間變軟；不需要把整塊融化。'),
  open('native-310-v2-final','final','最後挑戰：早餐時你從雪櫃拿出奶油，發現太硬，刀一抹就把多士刮破。寫兩句英文向朋友說明問題及打算。',["The butter isn't spreadable yet. Let's leave it out for a few minutes before putting it on the toast.","It's still too hard to spread on the toast. I'll wait until it softens a little."],'用 spreadable 描述是否能塗抹，並用 yet 或 wait 表示只是暫時太硬。')
];
const steps=[
  {id:'native-310-v2-audio',style:'audio',label:'先聽質地',title:'奶油太硬',intro:'只聽早餐時的描述。',model:'The butter isn’t spreadable yet.',zh:'奶油還硬得抹不開。',audioOnly:true,questions:['native-310-v2-audio']},
  {id:'native-310-v2-contrast',style:'contrast',label:'看塗抹結果',title:'太硬還是融化？',intro:'由刀和多士的接觸判斷。',questions:['native-310-v2-contrast']},
  {id:'native-310-v2-tone',style:'tone',label:'提議等一等',title:'幾分鐘後再抹',intro:'給朋友一個可行回應。',questions:['native-310-v2-tone']},
  {id:'native-310-v2-speak',style:'speak',label:'口頭請求',title:'抹到多士上',intro:'先自己說；錄音或跳過後才聽示範。',model:'Spread some butter on the toast.',zh:'在多士上抹點奶油。',speakingPrompt:'奶油已變軟，請朋友在多士上抹一點。先口頭說。',recording:'phrase',questions:[]},
  {id:'native-310-v2-final',style:'final',label:'早餐挑戰',title:'刮破了多士',intro:'自己解釋質地和做法。',questions:['native-310-v2-final']}
];
export default {revision:2,summary:'用 isn’t spreadable yet 說奶油暫時太硬、抹不開，並能提出稍等變軟的安排。',steps,questions,takeaways:['The butter isn’t spreadable yet.','Spread some butter on the toast.'],completionTitle:'你能說明奶油為何暫時抹不開，也知道怎樣等它變軟。'};
