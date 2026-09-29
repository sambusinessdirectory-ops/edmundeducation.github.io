import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-142-v2-audio','audio','只聽烹調前的動作。肉類現在需要甚麼處理？',['讓它由冰凍狀態解凍。','把它重新放進冰格。','把它放回冰格保存。','等它仍冷凍時就下鍋。'],'讓它由冰凍狀態解凍。','thaw 和 defrost 都可表示讓冷凍食物解凍，通常在烹調前進行。'),
  mc('native-142-v2-contrast','contrast','雞胸肉仍然結冰，朋友說 Let’s chill it first。哪句才說出所需步驟？',["Let's let it thaw first.","Let's freeze it again.","Let's leave it frozen until cooking time.","Let's cook it straight from the freezer."],"Let's let it thaw first.",'chill 是弄涼，freeze 是冷凍；現在要讓冰凍的肉變回可處理狀態。'),
  mc('native-142-v2-rewrite','rewrite','你要留字條提醒室友：晚餐前先把冰凍肉放雪櫃慢慢解凍。哪句最清楚？',["Let the meat thaw in the fridge before dinner.","Leave the meat out until dinner tonight.","Put the meat in warm water to thaw quickly.","Keep the meat frozen and cook it tomorrow."],"Let the meat thaw in the fridge before dinner.",'字條既說明要讓肉從冰凍狀態解凍，也指定放在雪櫃及晚餐前完成，室友才能照著準備。'),
  open('native-142-v2-final','final','最後挑戰：你打算明晚煮冷凍雞肉，目前它仍是硬邦邦的。給室友寫兩句英文，說明要先解凍，以及你會把它放在哪裡。',["I need to thaw the chicken before cooking it tomorrow. I'll put it in the fridge tonight.","The chicken is still frozen, so I'll let it defrost in the fridge overnight. Then we can cook it tomorrow."],'用 thaw 或 defrost 說解凍，並把具體位置和烹調時間交代清楚。')
];
const steps=[
  {id:'native-142-v2-audio',style:'audio',label:'先聽動作',title:'冰凍肉還不能煮',intro:'只聽烹調前的指示。',model:'thaw it / defrost it',zh:'把它解凍。',audioOnly:true,questions:['native-142-v2-audio']},
  {id:'native-142-v2-contrast',style:'contrast',label:'別再冷凍',title:'需要變回可煮的狀態',intro:'區分解凍和冷藏、冷凍。',questions:['native-142-v2-contrast']},
  {id:'native-142-v2-rewrite',style:'rewrite',label:'寫張字條',title:'晚餐前要先做甚麼',intro:'把動作和位置寫清楚。',questions:['native-142-v2-rewrite']},
  {id:'native-142-v2-speak',style:'speak',label:'口頭安排',title:'雪櫃裡慢慢解凍',intro:'先自己說；錄音或跳過後才聽示範。',model:'Let the meat thaw in the fridge.',zh:'讓肉放在雪櫃裡解凍。',speakingPrompt:'室友問為甚麼你把冷凍肉移到雪櫃。先口頭解釋。',recording:'phrase',questions:[]},
  {id:'native-142-v2-final',style:'final',label:'明晚晚餐',title:'把準備步驟安排好',intro:'自己寫解凍安排。',questions:['native-142-v2-final']}
];
export default {revision:2,summary:'用 thaw 或 defrost 描述冷凍食物解凍，並能交代烹調前的安排。',steps,questions,takeaways:['thaw it / defrost it','Let the meat thaw in the fridge.'],completionTitle:'你能清楚說明冷凍食物要先解凍。'};
