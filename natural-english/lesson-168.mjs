import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-168-v2-audio','audio','只聽這句提議。眼前的約會最可能怎樣處理？',['這次不成，之後再約。','照原時間立即見面。','這次只延遲十分鐘。','改到同一天稍晚的時間。'],'這次不成，之後再約。','Let’s do this another time 表示把這次安排延後，保留將來再約的可能。'),
  mc('native-168-v2-scene','scene','晚餐前一小時你臨時有急事，不能赴約。哪句對朋友最合適？',["I'm sorry—something came up. Let's do this another time.","I'm already at the restaurant, so don't come.","Could I arrive half an hour late instead?","Could we move dinner to eight tonight?"],"I'm sorry—something came up. Let's do this another time.",'先道歉並簡短交代臨時有事，再提出改天，讓朋友知道今晚不能照常。'),
  mc('native-168-v2-repair','repair','你想把今晚聚會改期，卻只說 Maybe later。哪句能更明確地表達？',["Can we reschedule for another day?","I'm already at the restaurant.","I might arrive ten minutes late.","I might be twenty minutes late."],"Can we reschedule for another day?",'reschedule 明確請求重新安排；Maybe later 可能只是含糊拖延。'),
  mc('native-168-v2-explain','explain','朋友聽你說 Let’s do this another time，卻以為你只會遲到。哪句補充能消除誤會？',["I can't make it tonight; can we pick another day?","I'll be there in ten minutes.","I'm already outside your door.","I can still meet at the original time."],"I can't make it tonight; can we pick another day?",'明說今晚不能到，再提出另一天，和單純遲到區分。'),
  open('native-168-v2-final','final','最後挑戰：你原本今晚和朋友吃飯，突然要照顧家人，無法赴約。寫兩句英文道歉並提出改天見。',["I'm sorry, I can't make dinner tonight because something came up at home. Let's do this another time.","I need to take care of a family matter tonight. Can we reschedule our dinner for another day?"],'道歉並清楚取消今晚安排，再表達仍想改天見；不必透露過多私事。')
];
const steps=[
  {id:'native-168-v2-audio',style:'audio',label:'聽出改期',title:'這次先不見',intro:'只聽一個提議。',model:'Let’s do this another time.',zh:'我們改天再約吧。',audioOnly:true,questions:['native-168-v2-audio']},
  {id:'native-168-v2-scene',style:'scene',label:'晚餐前急事',title:'不能照原定赴約',intro:'把道歉和改期放在一起。',questions:['native-168-v2-scene']},
  {id:'native-168-v2-repair',style:'repair',label:'說明確一點',title:'Maybe later 太含糊',intro:'把未定的說法改成改期請求。',questions:['native-168-v2-repair']},
  {id:'native-168-v2-explain',style:'explain',label:'不是遲到',title:'今晚確實去不了',intro:'消除朋友對時間的誤解。',questions:['native-168-v2-explain']},
  {id:'native-168-v2-speak',style:'speak',label:'口頭請求',title:'直接請求改期',intro:'先自己說；錄音或跳過後才聽示範。',model:'Can we reschedule?',zh:'我們可以改期嗎？',speakingPrompt:'你不能按原定時間赴約，想問朋友能否改期。先口頭說。',recording:'phrase',questions:[]},
  {id:'native-168-v2-final',style:'final',label:'家事挑戰',title:'取消今晚晚餐',intro:'自己寫道歉和後續安排。',questions:['native-168-v2-final']}
];
export default {revision:2,summary:'用 Let’s do this another time 禮貌取消眼前安排並保留再約可能，與單純遲到區分。',steps,questions,takeaways:['Let’s do this another time.','Can we reschedule?'],completionTitle:'你能清楚告訴朋友今晚去不了，並提出改期。'};
