import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-283-v2-audio','audio','只聽這句話，食物表面出現甚麼？',['一層薄薄的皮或膜。','厚厚一層霉。','焦黑的硬殼。','撒上的糖粉。'],'一層薄薄的皮或膜。','A skin formed on top 描述熱牛奶、布丁等靜置後的表面薄層。'),
  mc('native-283-v2-scene','scene','一碗熱吉士放涼後，表面多了一層薄膜；下面仍是軟滑的。怎樣說？',["A skin formed on top.","It burned all the way through.","The whole bowl froze solid.","Someone dusted it with sugar."],"A skin formed on top.",'薄膜只在表層，與整碗燒焦、結冰或加糖粉不同。'),
  mc('native-283-v2-contrast','contrast','朋友把牛奶表面的一層薄皮當成「the milk curdled」。哪項解釋較準確？',['只是表面形成薄層，未必整杯結塊。','整杯牛奶一定已經變酸。','牛奶一定在雪櫃結冰。','表面薄層其實是一層砂糖。'],'只是表面形成薄層，未必整杯結塊。','skin on top 限定在表面；curdled 涉及液體結塊，兩者不能混同。'),
  mc('native-283-v2-rewrite','rewrite','食譜筆記只寫「The top changed」。哪句能具體記下奶布丁放涼後的變化？',["A thin skin formed on top as it cooled.","The pudding vanished from the bowl.","The bowl cracked in two.","Someone added ice cubes."],"A thin skin formed on top as it cooled.",'寫出表面薄皮及冷卻過程，比 changed 更能重現觀察。'),
  open('native-283-v2-final','final','新情境：你把熱牛奶放在桌上，一會兒後看見表面有薄薄一層。寫兩句英文告訴朋友現象，並問能否攪拌。',["A skin formed on top of the milk. Can I stir it back in?","The milk has a thin skin on top now. Should I mix it in?","A thin skin appeared on the milk while it cooled. Is it okay to stir it?"],'自評時看是否把變化限定在表面薄皮，並清楚提出是否攪拌的問題。')
];
const steps=[
  {id:'native-283-v2-audio',style:'audio',label:'聽出表面變化',title:'上面多了甚麼？',intro:'先聽熱牛奶表面形成了甚麼。',model:'A skin formed on top.',zh:'表面結了一層皮。',audioOnly:true,questions:['native-283-v2-audio']},
  {id:'native-283-v2-scene',style:'scene',label:'吉士放涼',title:'只有表面不同',intro:'根據薄膜出現的位置選描述。',questions:['native-283-v2-scene']},
  {id:'native-283-v2-contrast',style:'contrast',label:'表面或整杯',title:'沒有整杯結塊',intro:'把薄皮和液體變質分開。',questions:['native-283-v2-contrast']},
  {id:'native-283-v2-rewrite',style:'rewrite',label:'記錄觀察',title:'比 changed 更具體',intro:'改寫含糊的食譜筆記。',questions:['native-283-v2-rewrite']},
  {id:'native-283-v2-final',style:'final',label:'熱牛奶挑戰',title:'問能否攪拌',intro:'用兩句英文寫，之後對照示例。',questions:['native-283-v2-final']}
];
export default {revision:2,summary:'描述熱牛奶或布丁靜置後表面形成薄皮，並與整體結塊區分。',steps,questions,takeaways:['A skin formed on top.'],completionTitle:'你能準確描述食物表面的薄皮，並自然提出處理問題。'};
