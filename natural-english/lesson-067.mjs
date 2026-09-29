import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-067-v2-audio','audio','只聽一句話。說話者指出了哪個可能原因？',
    ['斷路器跳脫。','水管破裂。','燃氣用完。','燈泡被拔走。'],
    '斷路器跳脫。','The breaker tripped. 指斷路器跳掣；若沒有確認，應加 I think 或 It looks like。'),
  mc('native-067-v2-detail','detail','家裏只有廚房插座沒電，客廳的燈還亮着。哪個細節提醒你不能說整棟樓都停電？',
    ['客廳仍有電。','廚房有窗。','插座是白色。','昨天也煮過飯。'],
    '客廳仍有電。','不同位置的供電狀態不同，問題可能只在某個迴路；不能直接說全棟停電。'),
  mc('native-067-v2-branch','branch','室友問 What happened? 你還沒查看電箱，只猜可能跳掣。哪句把不確定性說準？',
    ['I think the breaker tripped.','The breaker definitely exploded.','The entire city lost power forever.','The light is on, so there is no problem.'],
    'I think the breaker tripped.','I think 明確標示這仍是推測；未查看前不應說成已確定。'),
  mc('native-067-v2-continue','continue','你說 I think the breaker tripped.。室友回 Should we check the breaker box? 最合適的下一句是甚麼？',
    ['Yes, let’s check it safely.','No, let’s pretend the power is on.','The kitchen table is too small.','Please buy more coffee.'],
    'Yes, let’s check it safely.','先核實是否真的跳掣；如果不懂操作或有危險徵象，應交給合資格的人處理。'),
  open('native-067-v2-repair','repair','你還未看過電箱，剛才卻肯定地說 The breaker tripped.。改成一句保留不確定性的英文。',
    ['I think the breaker tripped.','It looks like the breaker tripped.','The breaker may have tripped.'],
    'I think / may have / looks like 都能把尚未核實的原因說成推測。')
];

const steps=[
  {id:'native-067-v2-audio',style:'audio',label:'聽出原因',title:'是甚麼跳脫？',intro:'先只聽英文說法。',model:'The breaker tripped.',zh:'斷路器跳掣了。',audioOnly:true,questions:['native-067-v2-audio']},
  {id:'native-067-v2-detail',style:'detail',label:'判斷範圍',title:'並非全屋都沒電',intro:'從仍有電的地方找線索。',questions:['native-067-v2-detail']},
  {id:'native-067-v2-branch',style:'branch',label:'標示推測',title:'還沒看電箱',intro:'原因未確認時，不要說得太肯定。',questions:['native-067-v2-branch']},
  {id:'native-067-v2-speak',style:'speak',label:'口頭說明',title:'向室友解釋可能原因',intro:'先自己說；錄音或跳過後才聽示範。',model:'The breaker tripped.',zh:'斷路器跳掣了。',speakingPrompt:'你查看電箱，確認斷路器跳掣。室友問 What happened?',recording:'phrase',questions:[]},
  {id:'native-067-v2-continue',style:'continue',label:'核實下一步',title:'室友提議檢查電箱',intro:'先確認狀況，注意安全。',questions:['native-067-v2-continue']},
  {id:'native-067-v2-repair',style:'repair',label:'修正斷言',title:'把肯定句改成推測',intro:'證據程度要和語氣一致。',questions:['native-067-v2-repair']}
];

export default {revision:2,summary:'分辨一般停電與斷路器跳脫，在原因未確認時保留推測語氣。',steps,questions,takeaways:['The breaker tripped.','The power is out.'],completionTitle:'你能說出斷路器跳掣，也會在未核實前用恰當語氣了！'};
