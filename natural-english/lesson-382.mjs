import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-382-v2-audio','audio','聽完這句，說話者認為耳朵裏有甚麼？',['游泳後的水卡住出不來。','耳壓未通而感覺塞住。','水只沾濕了外耳，已擦乾。','耳內有水，但剛剛已流出。'],'游泳後的水卡住出不來。','water trapped in my ear 具體指出水留在耳內，常見於游泳或洗澡後。'),
  mc('native-382-v2-explain','explain','句中的 trapped 為甚麼比 wet 更準確？',['它說明水被困在耳內，並非只弄濕外面。','它說明耳朵已完全沒有聽覺。','它說明耳朵外面剛淋了雨。','它說明耳朵裏有一個陷阱。'],'它說明水被困在耳內，並非只弄濕外面。','wet 只說濕；trapped 補上水進了耳朵後一直出不來的困擾。'),
  mc('native-382-v2-reverse','reverse','剛游完泳，左耳有水一直出不來。哪句最直接？',['I have water trapped in my left ear.','My left ear still feels plugged after the swim.','My left ear popped while I was swimming.','There is water on the outside of my left ear.'],'I have water trapped in my left ear.','trapped in my left ear 同時交代水的位置及卡住的狀態。'),
  mc('native-382-v2-contrast','contrast','耳朵悶塞，但你知道是水卡在裏面。哪句資訊最具體？',['I think I have water trapped in my ear.','My ears feel plugged.','My ear feels strange.','I cannot hear anything at all.'],'I think I have water trapped in my ear.','feel plugged 只說感覺塞；water trapped 進一步說明你懷疑的原因。'),
  open('native-382-v2-rewrite','rewrite','新情境：洗澡後右耳悶塞，你覺得水沒流出來。把「My ear feels weird」改寫成兩句英文，描述感覺與可能原因。',["My right ear feels plugged after my shower. I think I have water trapped in it.","My right ear has felt blocked since I washed my hair. There may be water trapped inside.","I can't seem to clear the muffled feeling in my right ear. I think some shower water is trapped there."],'自評時要寫出耳朵悶塞的感覺和懷疑有水卡住，避免把原因說成已確診。')
];
const steps=[
  {id:'native-382-v2-audio',style:'audio',label:'聽出卡住的東西',title:'游完泳後耳朵怎樣？',intro:'留意是水留在耳內，還是只有外面濕。',model:'I have water trapped in my ear.',zh:'我的耳朵裏有水卡住了。',audioOnly:true,questions:['native-382-v2-audio']},
  {id:'native-382-v2-explain',style:'explain',label:'拆解 trapped',title:'不只是 wet',intro:'說明為甚麼「卡住」是關鍵資訊。',questions:['native-382-v2-explain']},
  {id:'native-382-v2-reverse',style:'reverse',label:'左耳情境',title:'把位置說清楚',intro:'由中文情境選英文表達。',questions:['native-382-v2-reverse']},
  {id:'native-382-v2-contrast',style:'contrast',label:'塞住與原因',title:'plugged 還是 trapped？',intro:'比較感覺與可能原因的資訊量。',questions:['native-382-v2-contrast']},
  {id:'native-382-v2-rewrite',style:'rewrite',label:'右耳新情境',title:'改寫模糊描述',intro:'補上悶塞感、洗澡背景和你懷疑的原因。',questions:['native-382-v2-rewrite']}
];
export default {revision:2,summary:'用 water trapped in my ear 說明水留在耳內，並與單純耳朵悶塞的感覺區分。',steps,questions,takeaways:['I have water trapped in my ear.'],completionTitle:'你能具體描述耳朵進水的感覺。'};
