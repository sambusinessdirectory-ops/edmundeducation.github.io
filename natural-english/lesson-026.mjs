import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-026-v2-scene','scene',
    '吃完午餐後，你覺得肚子有點不對勁，但說不出是甚麼痛，也未嚴重到要停下工作。哪句最貼近目前感覺？',
    ['My stomach feels weird.','I have a severe stomachache.','I feel dizzy.','My throat hurts when I swallow.'],
    'My stomach feels weird.',
    'feels weird 可描述難以明確界定的胃部不適；其他句子說得更嚴重，或說的是頭暈和喉嚨。'),
  mc('native-026-v2-audio','audio',
    '只聽一句關於肚子的描述。說話者最可能想表達甚麼？',
    ['肚子有點不對勁，但感覺還說不準。','確定有劇烈刺痛。','只是已經吃飽。','突然頭暈站不穩。'],
    '肚子有點不對勁，但感覺還說不準。',
    'My stomach feels off. 是自然地說胃部感覺有點不對；它沒有指定疼痛種類或嚴重程度。'),
  mc('native-026-v2-continue','continue',
    '朋友問 Do you want dessert? 你因為肚子怪怪的暫時不想吃。哪句回答最能解釋原因？',
    ['Maybe not. My stomach feels weird.','Yes, I want two desserts.','No, my nose is stuffed up.','I already ordered the bill.'],
    'Maybe not. My stomach feels weird.',
    '先婉轉拒絕甜品，再交代自己胃部不太舒服，對方就明白你為何改變主意。'),
  blank('native-026-v2-transfer','transfer',
    '換到早上：你起床後肚子有點怪，但沒有明確的劇痛。家人問你是否舒服。用一句自然英文說明。',
    ['My stomach feels weird.','My stomach feels off.','My stomach does not feel right.','My stomach doesn’t feel right.'],
    '描述不明確的不適，不必替自己下診斷。',
    'My stomach feels off. 和 My stomach feels weird. 都能準確表達「肚子有點不對勁」。')
];

const steps=[
  {id:'native-026-v2-scene',style:'scene',label:'先辨感覺',title:'怪怪的，不等於劇痛',intro:'先選一個符合你實際感覺的描述。',questions:['native-026-v2-scene']},
  {id:'native-026-v2-audio',style:'audio',label:'聽另一說法',title:'feels off 是甚麼意思？',intro:'只聽聲音；答完才看句子。',model:'My stomach feels off.',zh:'我的肚子有點不對勁。',audioOnly:true,questions:['native-026-v2-audio']},
  {id:'native-026-v2-continue',style:'continue',label:'回答朋友',title:'為何今天不吃甜品？',intro:'不只拒絕，還要讓朋友明白你改變主意的原因。',questions:['native-026-v2-continue']},
  {id:'native-026-v2-speak',style:'speak',label:'自己描述',title:'把不舒服說出口',intro:'先用自己的聲音描述，錄音或跳過後才看示範。',model:'My stomach feels weird.',zh:'我的肚子有點怪怪的。',speakingPrompt:'朋友：Are you okay? 你覺得肚子有點不對勁，但說不出具體哪裡痛。',recording:'phrase',questions:[]},
  {id:'native-026-v2-transfer',style:'transfer',label:'改變時段',title:'早上醒來時也會用',intro:'從飯後改成起床後，不給選項，自行描述感覺。',questions:['native-026-v2-transfer']}
];

export default {revision:2,summary:'用 feels weird 或 feels off 描述難以明確界定的胃部不適，並向朋友說清楚原因。',steps,questions,takeaways:['My stomach feels weird.','My stomach feels off.'],completionTitle:'你能自然地說出肚子有點不對勁了！'};
