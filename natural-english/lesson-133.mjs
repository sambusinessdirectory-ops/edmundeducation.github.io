import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-133-v2-audio','audio','只聽這條毛巾的狀況。最可能是哪種味道？',['潮濕放久的焗霉味。','剛洗完的清新香味。','燒焦的煙味。','一般洗衣液的香味。'],'潮濕放久的焗霉味。','musty 常形容潮濕、空氣不流通後的霉焗味。'),
  mc('native-133-v2-contrast','contrast','毛巾洗完後晾不乾，隔天聞起來不對勁。與香水味或焦味相比，哪個詞最貼合？',["musty","fragrant","smoky","sour"],"musty",'musty 的線索是長時間潮濕、悶住；其他詞分別指香、煙或辛辣。'),
  mc('native-133-v2-transfer','transfer','換到地下室：牆角長期潮濕，空氣有同樣焗霉味。哪句自然？',["The room smells musty.","The room looks dim.","The room smells like detergent.","The room feels damp."],"The room smells musty.",'musty 也可形容房間的氣味；用 smells 指嗅覺。'),
  mc('native-133-v2-repair','repair','酒店毛巾有潮霉味，你向櫃檯說 It smells rotten。哪個改法更精準？',["The towel smells musty.","The towel smells smoky.","The towel smells sour.","The towel smells like perfume."],"The towel smells musty.",'musty 對準潮濕焗住的味道；rotten 通常暗示腐爛。'),
  open('native-133-v2-rewrite','rewrite',"酒店毛巾晾不乾，聞起來有潮霉味。寫兩句英文向櫃檯描述問題並禮貌要求更換。",["The towel smells musty, as if it didn't dry properly. Could we have a clean one?", "This towel has a musty smell. Would you mind replacing it?"],"用 musty 指出潮濕焗住的氣味，再提出換毛巾的具體要求。"),
];
const steps=[
  {id:'native-133-v2-audio',style:'audio',label:'先聽氣味',title:'毛巾晾不乾',intro:'只聽一句描述。',model:'The towel smells musty.',zh:'毛巾有潮霉味。',audioOnly:true,questions:['native-133-v2-audio']},
  {id:'native-133-v2-contrast',style:'contrast',label:'辨別味道',title:'焗霉不是焦味',intro:'依照毛巾放置經過選用詞。',questions:['native-133-v2-contrast']},
  {id:'native-133-v2-transfer',style:'transfer',label:'換到房間',title:'牆角也可能潮',intro:'把詞換到另一個常見來源。',questions:['native-133-v2-transfer']},
  {id:'native-133-v2-repair',style:'repair',label:'改準描述',title:'櫃檯需要知道哪種味道',intro:'避免用過強或不準的詞。',questions:['native-133-v2-repair']},
  {id:'native-133-v2-rewrite',style:'rewrite',label:'寫給房東',title:'指出潮濕位置',intro:'把氣味變成可跟進的訊息。',model:'The room smells musty.',zh:'房間有潮霉味。',questions:['native-133-v2-rewrite']}
];
export default {revision:2,summary:'用 musty 描述毛巾或房間因潮濕、焗住而產生的霉味。',steps,questions,takeaways:['The towel smells musty.','The room smells musty.'],completionTitle:'你能說出潮霉味，也能指出可能的潮濕來源。'};
