import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-068-v2-audio','audio','只聽一句話。和剛才相比，現在發生了甚麼變化？',
    ['電力供應恢復了。','剛剛開始停電。','斷路器已損壞。','有人把燈泡拆下。'],
    '電力供應恢復了。','The power is back on. 表示先前沒有電，現在重新有電。'),
  mc('native-068-v2-branch','branch','酒店前台剛幫你報修停電。房間燈重新亮了，你要更新對方。哪句最準確？',
    ['The power is back on in my room now.','The whole city definitely has power now.','The room is still completely dark.','The breaker must be new.'],
    'The power is back on in my room now.','只報告你確認到的房間狀況，不推論整座城市或電箱原因。'),
  mc('native-068-v2-continue','continue','前台問 Is everything working again? 你的燈亮了，但冷氣仍未運作。哪句不會過早表示全部已修好？',
    ['The lights are back, but the AC still isn’t working.','Yes, everything is perfect.','The power has never gone out.','Please ignore the AC forever.'],
    'The lights are back, but the AC still isn’t working.','把已恢復的燈和仍有問題的冷氣分開說；power is back on 不保證所有設備都正常。'),
  open('native-068-v2-final','final','最後挑戰：停電後，家裏燈和雪櫃重新運作；朋友還在路上，想知道是否可回來。用兩句英文告訴他電已恢復，並說明你看到的證據。',
    ['The power is back on. The lights and fridge are working again.','The power is back. The lights and fridge are on again.','The power has come back on. The lights and fridge are working again.'],
    '先說恢復供電，再補上你親眼確認的設備；不必猜測停電原因。')
];

const steps=[
  {id:'native-068-v2-audio',style:'audio',label:'聽出恢復',title:'電回來了嗎？',intro:'先只聽一句狀態更新。',model:'The power is back on.',zh:'電來了／供電恢復了。',audioOnly:true,questions:['native-068-v2-audio']},
  {id:'native-068-v2-branch',style:'branch',label:'通知前台',title:'更新已恢復的範圍',intro:'只說自己已確認的房間。',questions:['native-068-v2-branch']},
  {id:'native-068-v2-speak',style:'speak',label:'即時口說',title:'告訴家人燈亮了',intro:'先自己說；錄音或跳過後才聽示範。',model:'The power is back on.',zh:'電已經恢復了。',speakingPrompt:'剛才停電，現在燈重新亮了。家人問：Any update?',recording:'phrase',questions:[]},
  {id:'native-068-v2-continue',style:'continue',label:'別說太滿',title:'燈亮了，冷氣仍壞',intro:'供電恢復不等於每樣電器都正常。',questions:['native-068-v2-continue']},
  {id:'native-068-v2-final',style:'final',label:'回家訊息',title:'給路上的朋友更新',intro:'新情境，自己附上看得到的證據。',questions:['native-068-v2-final']}
];

export default {revision:2,summary:'用 The power is back on. 報告供電恢復，並分清已恢復與仍有問題的設備。',steps,questions,takeaways:['The power is back on.','The breaker tripped.'],completionTitle:'你能準確更新供電狀況，也不會把所有設備都說成已修好了！'};
