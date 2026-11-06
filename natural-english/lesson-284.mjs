import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-284-v2-audio','audio','先聽這句烹調描述。最可能出了甚麼事？',['牛奶或醬汁在鍋底有些燒焦。','醬汁油水分層。','牛奶完全蒸發。','食物已被冷凍。'],'牛奶或醬汁在鍋底有些燒焦。','scorched 指受熱過度而焦，常發生在鍋底；不等於整鍋燒成灰。'),
  mc('native-284-v2-detail','detail','你攪拌奶油醬時聞到焦味，抬起鍋底有一層褐色黏附物。哪個線索最支持 scorched？',['焦味和鍋底褐色黏附物。','醬汁表面有一層油。','醬汁放涼後出現薄皮。','奶油剛從雪櫃拿出來。'],'焦味和鍋底褐色黏附物。','scorched 與局部受熱過度有關；分層與表面結皮是別的變化。'),
  mc('native-284-v2-contrast','contrast','你想區分「The sauce separated」和「It scorched」。哪個狀況屬於後者？',['鍋底留有焦痕，聞起來有一點燒焦味。','油浮在水上形成兩層。','整碗醬汁仍均勻但太稀。','醬汁被放進冰箱變冷。'],'鍋底留有焦痕，聞起來有一點燒焦味。','scorched 指受熱焦化；separated 是成分分離。'),
  mc('native-284-v2-tone','tone','朋友問奶油醬是否還能用。你只知道鍋底有一點焦味，未檢查整鍋。哪句避免誇大？',["I think it scorched a little on the bottom.","The entire meal is completely ruined forever.","It definitely contains no food anymore.","It has frozen solid in the pan."],"I think it scorched a little on the bottom.",'I think 和 a little 限定目前觀察，說出鍋底焦味而不武斷宣稱整餐報廢。'),
  mc('native-284-v2-rewrite','rewrite','給室友的訊息原稿是「The milk smells strange」。你看見鍋底焦痕。哪句改寫給出真正原因？',["The milk scorched on the bottom of the pan.","The milk has turned into ice.","The carton is leaking in the fridge.","The milk was never heated."],"The milk scorched on the bottom of the pan.",'把焦味連到鍋底受熱過度，室友便知道問題出在煮奶過程。'),
  open('native-284-v2-rewrite-write','rewrite','新情境：你煮奶油醬時聞到輕微焦味，發現鍋底有褐色痕跡。寫兩句英文向同伴解釋，並說明你會先做甚麼。',
    ["I think the sauce scorched on the bottom. I'll take the pan off the heat.","The bottom of the sauce has scorched a little. Let's stop cooking it for a moment.","There's a burnt smell because the sauce scorched underneath. I'll turn the heat off now."],
    '自評時看是否把焦味連到鍋底局部燒焦，並提出停止加熱等相關動作。')
];
const steps=[
  {id:'native-284-v2-audio',style:'audio',label:'聽出焦味',title:'鍋底發生甚麼事？',intro:'聽鍋底是否有局部燒焦的痕跡。',model:'It scorched.',zh:'它有點燒焦了。',audioOnly:true,questions:['native-284-v2-audio']},
  {id:'native-284-v2-detail',style:'detail',label:'看鍋底',title:'褐色黏附物',intro:'從氣味和鍋底痕跡判斷。',questions:['native-284-v2-detail']},
  {id:'native-284-v2-contrast',style:'contrast',label:'與分層對照',title:'焦化不是油水分離',intro:'把兩種常見醬汁問題分開。',questions:['native-284-v2-contrast']},
  {id:'native-284-v2-tone',style:'tone',label:'拿捏程度',title:'只是鍋底有點焦',intro:'按觀察說明程度，不多作推斷。',questions:['native-284-v2-tone']},
  {id:'native-284-v2-rewrite',style:'rewrite',label:'改寫訊息',title:'告訴室友焦味來源',intro:'把模糊的 strange 改成具體原因。',questions:['native-284-v2-rewrite','native-284-v2-rewrite-write']},
  {id:'native-284-v2-speak',style:'speak',label:'即時口說',title:'提醒同伴關火',intro:'先自己說；錄音或跳過後才聽示範。',model:'It scorched.',zh:'它有點燒焦了。',speakingPrompt:'你煮牛奶時聞到鍋底焦味。簡短告訴同伴狀況。',recording:'phrase',questions:[]}
];
export default {revision:2,summary:'用 scorched 描述奶或醬汁在鍋底局部燒焦，並與分層區分。',steps,questions,takeaways:['It scorched.'],completionTitle:'你能辨認鍋底焦化，並準確告知同伴。'};
