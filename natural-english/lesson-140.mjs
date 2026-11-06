import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-140-v2-audio','audio','只聽座椅名稱。孩子需要它的原因最可能是甚麼？',['能坐普通椅，但需要墊高。','還不能獨立坐穩。','需要附餐盤的獨立幼兒椅。','普通椅足夠高，不需加座椅。'],'能坐普通椅，但需要墊高。','booster seat 放在普通椅上，讓較大的小孩坐得夠高。'),
  mc('native-140-v2-contrast','contrast','五歲孩子能自己坐穩，但普通餐椅太低，和嬰兒用 high chair 相比哪個更合適？',["a booster seat","a high chair with a tray","a bar stool","a booth for adults"],"a booster seat",'這個孩子只需墊高；high chair 是給更小、需獨立幼兒椅的孩子。'),
  mc('native-140-v2-reverse','reverse','服務生拿來一個放在普通餐椅上的增高座椅。這件物品叫甚麼？',["a booster seat","a high chair","a child-size chair","an extra cushion"],"a booster seat",'booster seat 依附普通椅墊高孩子；high chair 本身就是獨立的幼兒椅。'),
  open('native-140-v2-final','final','最後挑戰：服務生問你的四歲孩子是否要 high chair。孩子能坐穩，只是坐普通椅不夠高。寫兩句英文禮貌改要合適的座椅。',["A booster seat would be better, thanks. She can sit in a regular chair but needs a little extra height.","Could we have a booster seat instead? He doesn't need a high chair anymore."],'用 booster seat 指普通椅上的增高座椅，並交代為何不需幼兒高腳椅。')
];
const steps=[
  {id:'native-140-v2-audio',style:'audio',label:'先聽名稱',title:'坐得穩但不夠高',intro:'只聽座椅名稱。',model:'booster seat',zh:'兒童增高座椅。',audioOnly:true,questions:['native-140-v2-audio']},
  {id:'native-140-v2-contrast',style:'contrast',label:'比較年齡',title:'高腳椅已太小',intro:'按孩子的坐姿需要選座椅。',questions:['native-140-v2-contrast']},
  {id:'native-140-v2-reverse',style:'reverse',label:'看實物命名',title:'放在普通椅上',intro:'用座椅結構判斷。',questions:['native-140-v2-reverse']},
  {id:'native-140-v2-speak',style:'speak',label:'口頭請求',title:'向服務生要一張',intro:'先自己說；錄音或跳過後才聽示範。',model:'A booster seat, please.',zh:'請給我們一張增高座椅。',speakingPrompt:'服務生問孩子需要甚麼座椅；他只需墊高。先口頭回答。',recording:'phrase',questions:[]},
  {id:'native-140-v2-final',style:'final',label:'家庭餐桌',title:'禮貌更改座椅',intro:'自己向服務生說明。',questions:['native-140-v2-final']}
];
export default {revision:2,summary:'用 booster seat 指放在普通餐椅上的兒童增高座椅，與獨立幼兒 high chair 區分。',steps,questions,takeaways:['booster seat','A booster seat, please.'],completionTitle:'你能為較大的孩子要求合適的增高座椅。'};
