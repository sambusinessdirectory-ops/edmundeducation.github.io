import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-468-v2-audio','audio','先只聽皮膚的感覺。它有甚麼特徵？',['又冷又濕黏。','又熱又乾。','紅腫發癢。','被曬得發燙。'],'又冷又濕黏。','clammy 描述皮膚摸起來帶點冷、濕黏，不只是出汗。'),
  mc('native-468-v2-contrast','contrast','手摸起來冷冷濕濕、黏黏的，並非單純運動後大汗。哪句較精確？',["My hands feel clammy.","My hands are sweaty from running.","My hands feel dry and rough.","My hands are warm and sticky from food."],"My hands feel clammy.",'clammy 同時帶出冷與濕黏；sweaty 本身不表達冷感。'),
  mc('native-468-v2-rewrite','rewrite','把 My skin is wet 改成包含冷和濕黏觸感的描述。',["My skin feels clammy.","My skin feels dry.","My skin feels sunburned.","My skin feels hot and sweaty."],"My skin feels clammy.",'feels clammy 比 wet 多出冷、濕黏而不舒服的觸感。'),
  open('native-468-v2-speak','speak','你觸摸手臂，皮膚冷冷濕黏。先口頭說明感覺，再聽示範。',["My skin feels clammy.","My hands feel clammy."],'feels clammy 把冷與濕黏合在一起描述。'),
  open('native-468-v2-final','final','新場景：你坐在候診室，皮膚摸起來又冷又濕黏；朋友以為你只是運動出汗。寫兩句英文更正，並說明實際觸感。',["It's not just sweat from exercise. My skin feels cold and clammy.","I haven't been working out. My hands feel clammy—cold and a little damp."],'用 clammy 連起冷與濕黏，和單純運動流汗區分。')
];
const steps=[
  {id:'native-468-v2-audio',style:'audio',label:'先聽觸感',title:'皮膚不太舒服',intro:'只憑聲音辨認感覺。',model:'My skin feels clammy.',zh:'我的皮膚冷冷濕黏。',audioOnly:true,questions:['native-468-v2-audio']},
  {id:'native-468-v2-contrast',style:'contrast',label:'不只是汗',title:'手冷又濕',intro:'區分 sweaty 與 clammy。',model:'My hands feel clammy.',zh:'我的手冷冷濕黏。',questions:['native-468-v2-contrast']},
  {id:'native-468-v2-rewrite',style:'rewrite',label:'描述觸感',title:'比 wet 更準',intro:'加上冷與黏。',questions:['native-468-v2-rewrite']},
  {id:'native-468-v2-speak',style:'speak',label:'親口描述',title:'摸摸手臂',intro:'先說再核對。',model:'My skin feels clammy.',zh:'我的皮膚冷冷濕黏。',speakingPrompt:'手臂皮膚摸起來冷濕黏，先口頭描述。',recording:'phrase',questions:['native-468-v2-speak']},
  {id:'native-468-v2-final',style:'final',label:'候診室挑戰',title:'更正朋友',intro:'寫出區別與觸感。',questions:['native-468-v2-final']}
];
export default {revision:2,summary:'用 clammy 描述皮膚帶冷感的濕黏，與一般出汗區分。',steps,questions,takeaways:['My skin feels clammy.','My hands feel clammy.'],completionTitle:'你能說清冷濕黏的觸感。'};
