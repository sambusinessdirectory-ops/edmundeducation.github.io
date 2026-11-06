import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-350-v2-audio','audio','聽完這句廚房報告，湯發生了甚麼？',['煮滾後越過鍋邊溢出。','剛開始在鍋內冒泡。','鍋裏的水完全燒乾。','湯已在雪櫃結凍。'],'煮滾後越過鍋邊溢出。','boiled over 指滾湯從鍋邊滿出；不只是正在沸騰。'),
  mc('native-350-v2-branch','branch','同伴問：「What happened to the stove?」你看到湯從鍋邊流到爐面。怎樣回答？',["The soup boiled over. I'll turn the heat down.","The soup is gently simmering inside the pot.","The pot boiled dry and has no liquid left.","The stove has been unplugged all day."],"The soup boiled over. I'll turn the heat down.",'把爐面弄濕的原因說成湯溢出，並提出調低火力。'),
  mc('native-350-v2-continue','continue','朋友問：「Was the heat too high?」你剛才沒有留意，不能確定。哪句合適？',["Maybe. I didn't notice until the soup boiled over.","Definitely not; the stove was never on.","Yes, the soup froze because the heat was high.","No, I poured the soup away before cooking."],"Maybe. I didn't notice until the soup boiled over.",'Maybe 承認可能原因，但不假裝確定；後半句說明你何時發現。'),
  mc('native-350-v2-tone','tone','你向正在擦爐面的室友解釋事故。哪句承擔責任而不誇大？',["Sorry, I left the heat too high and the soup boiled over.","Nothing spilled; you're imagining the mess.","The whole kitchen is destroyed beyond repair.","The soup deliberately jumped out of the pot."],"Sorry, I left the heat too high and the soup boiled over.",'道歉並交代火太大與湯溢出的關係，比否認或誇大更合適。'),
  open('native-350-v2-final','final','新情境：你煮湯時轉身去接電話，回來發現湯從鍋邊滿到爐面。寫兩句英文告訴家人發生甚麼事，並說你會先做甚麼。',["The soup boiled over while I was on the phone. I'll turn off the heat and clean the stove.","I stepped away, and the soup boiled over the edge. Let me lower the heat first.","Some soup spilled onto the stove because it boiled over. I'll switch off the burner now."],'自評時看是否說出湯因沸騰而滿出，不只說正在煮，並提出處理爐火的下一步。')
];
const steps=[
  {id:'native-350-v2-audio',style:'audio',label:'聽出結果',title:'湯只是在滾嗎？',intro:'聽滾湯是否越過鍋邊。',model:'The soup boiled over.',zh:'湯煮到滿出來了。',audioOnly:true,questions:['native-350-v2-audio']},
  {id:'native-350-v2-branch',style:'branch',label:'回答同伴',title:'爐面為何濕了？',intro:'把看見的溢出與下一步連起來。',questions:['native-350-v2-branch']},
  {id:'native-350-v2-continue',style:'continue',label:'回答原因',title:'火是否太大？',intro:'對不確定的原因保持準確。',questions:['native-350-v2-continue']},
  {id:'native-350-v2-tone',style:'tone',label:'向室友交代',title:'道歉並說清事故',intro:'說明自己的疏忽和湯的結果。',questions:['native-350-v2-tone']},
  {id:'native-350-v2-final',style:'final',label:'接電話挑戰',title:'處理滿出的湯',intro:'說明湯怎樣溢出，再提出清理方法。',questions:['native-350-v2-final']}
];
export default {revision:2,summary:'用 boiled over 描述滾湯越過鍋邊溢出，並與單純沸騰或燒乾分開。',steps,questions,takeaways:['The soup boiled over.'],completionTitle:'你能清楚報告湯滿出鍋子的事故與下一步。'};
