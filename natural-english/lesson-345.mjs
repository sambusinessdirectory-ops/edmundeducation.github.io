import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-345-v2-audio','audio','聽完這句對房間的評語，最可能有甚麼問題？',['隔壁的聲音很容易傳進來。','牆壁的厚度在肉眼下變薄。','房間只有一面牆。','牆紙正在剝落。'],'隔壁的聲音很容易傳進來。','The walls are thin 是說隔音差；不需要實際量牆厚。'),
  mc('native-345-v2-continue','continue','朋友問：「Did you sleep okay?」你整晚聽到隔壁談話和電視。哪句自然接上？',["Not really. The walls are thin, so I could hear next door.","Yes, the room was completely silent.","No, the wallpaper color is too bright.","Yes, the bed was missing entirely."],"Not really. The walls are thin, so I could hear next door.",'把睡不好連到隔壁聲音傳入，回答具體而不誇大。'),
  mc('native-345-v2-tone','tone','你向酒店櫃台投訴隔音，想陳述經驗而非指責隔壁客人。哪句最好？',["The walls seem thin; I can hear conversations from the next room.","The guests next door are bad people and must leave.","There are no walls in my room at all.","The hotel building is about to collapse."],"The walls seem thin; I can hear conversations from the next room.",'先說可聽到的具體聲音，再用 seem 限定對隔音原因的判斷。'),
  mc('native-345-v2-transfer','transfer','換到宿舍：隔壁室友正常音量講電話，你仍能聽清每句。哪句仍適用？',["The walls are thin in this dorm.","The bed frame is cracked.","The windows are painted shut.","The floorboards are wet."],"The walls are thin in this dorm.",'同樣是聲音穿過牆壁，酒店換成宿舍仍可用這句。'),
  open('native-345-v2-final','final','新情境：你入住酒店，晚上能清楚聽到隔壁正常說話聲，睡不安穩。寫兩句禮貌英文向櫃台描述問題並問是否能換房。',["The walls are quite thin, and I can hear the room next door. Is there a quieter room available?","I could hear conversations through the wall all night. Could I move to a quieter room?","The room isn't very soundproof, so I had trouble sleeping. Would it be possible to change rooms?"],'自評時看是否提供可聽到的具體情況，並禮貌提出換房請求。')
];
const steps=[
  {id:'native-345-v2-audio',style:'audio',label:'聽出隔音',title:'隔壁為何聽得清？',intro:'聽隔壁聲音為何能清楚傳進房間。',model:'The walls are thin.',zh:'房間隔音很差。',audioOnly:true,questions:['native-345-v2-audio']},
  {id:'native-345-v2-continue',style:'continue',label:'回答朋友',title:'昨晚睡得如何？',intro:'把睡眠情況接上隔壁聲音。',questions:['native-345-v2-continue']},
  {id:'native-345-v2-tone',style:'tone',label:'向櫃台反映',title:'先說聽到甚麼',intro:'描述可證實的聲音，不責怪鄰房。',questions:['native-345-v2-tone']},
  {id:'native-345-v2-transfer',style:'transfer',label:'換到宿舍',title:'隔壁講電話也聽清',intro:'把說法用到另一種房間。',questions:['native-345-v2-transfer']},
  {id:'native-345-v2-speak',style:'speak',label:'口頭反映',title:'房間隔音差',intro:'先自己說；錄音或跳過後才聽示範。',model:'The walls are thin.',zh:'房間隔音很差。',speakingPrompt:'隔壁正常說話聲在你房間都很清楚。用一句英文描述。',recording:'phrase',questions:[]},
  {id:'native-345-v2-final',style:'final',label:'酒店挑戰',title:'問能否換安靜房間',intro:'寫兩句，完成後自行對照。',questions:['native-345-v2-final']}
];
export default {revision:2,summary:'用 The walls are thin 說明隔音差，並向酒店櫃台描述可聽到的聲音。',steps,questions,takeaways:['The walls are thin.'],completionTitle:'你能清楚反映隔音問題並禮貌請求換房。'};
