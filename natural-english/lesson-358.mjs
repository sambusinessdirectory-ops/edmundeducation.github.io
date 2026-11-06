import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-358-v2-audio','audio','先聽這句對食物味道的解釋。它受了甚麼影響？',['在冰箱吸收其他食物氣味。','在烤箱燒焦。','冷凍後完全沒味道。','加入太多鹽。'],'在冰箱吸收其他食物氣味。','picked up fridge odors 指放在冰箱時沾上周圍氣味，不一定已變壞。'),
  mc('native-358-v2-reverse','reverse','蛋糕沒蓋好放在冰箱，吃時有洋蔥氣味。哪句能概括原因？',["It picked up fridge odors.","It was baked with onions.","It scorched in the oven.","It lost all its moisture."],"It picked up fridge odors.",'蛋糕可能吸收冰箱內洋蔥味；句子不推斷原配方含洋蔥。'),
  mc('native-358-v2-explain','explain','這裏的 picked up 為何不是「拿起冰箱」？',['主語是食物，受詞是氣味，表示吸收到味道。','因為冰箱正在移動。','因為蛋糕被人拿起。','因為冰箱的門被拆下。'],'主語是食物，受詞是氣味，表示吸收到味道。','picked up odors 是吸收周圍氣味的自然說法；語境決定意義。'),
  mc('native-358-v2-tone','tone','朋友問蛋糕是否壞了。你只知道有點洋蔥味，沒有其他變質證據。哪句謹慎？',["I think it picked up some fridge odors because it wasn't covered.","It is definitely rotten and dangerous.","It certainly contains onions in the recipe.","The fridge has stopped working forever."],"I think it picked up some fridge odors because it wasn't covered.",'說出觀察到的異味和可能來源，不把異味直接當成變質證據。'),
  open('native-358-v2-final','final','新情境：你把一小塊蛋糕沒加蓋放進冰箱，隔天它有一點洋蔥味。寫兩句英文向朋友描述並說明可能原因。',["The cake picked up some fridge odors. I think it was too close to the onions and wasn't covered.","It tastes a little like onions now. It probably picked up the smell in the fridge overnight.","The cake wasn't covered, so it seems to have picked up fridge odors. I can smell onion on it."],'自評時看是否指出氣味從冰箱沾上，並以 probably 或 I think 表示原因是推測。')
];
const steps=[
  {id:'native-358-v2-audio',style:'audio',label:'聽出異味來源',title:'蛋糕原本有這個味嗎？',intro:'聽蛋糕是否吸收了冰箱其他食物的氣味。',model:'It picked up fridge odors.',zh:'它吸了冰箱裏其他味道。',audioOnly:true,questions:['native-358-v2-audio']},
  {id:'native-358-v2-reverse',style:'reverse',label:'洋蔥味蛋糕',title:'沒蓋好的後果',intro:'從食物氣味選最可能原因。',questions:['native-358-v2-reverse']},
  {id:'native-358-v2-explain',style:'explain',label:'理解片語',title:'picked up 的受詞',intro:'用句子結構理解吸味。',questions:['native-358-v2-explain']},
  {id:'native-358-v2-tone',style:'tone',label:'謹慎回答',title:'異味不等於肯定變壞',intro:'分開所聞與尚未證實的推斷。',questions:['native-358-v2-tone']},
  {id:'native-358-v2-speak',style:'speak',label:'口頭解釋',title:'蛋糕沾上冰箱味',intro:'先自己說；錄音或跳過後才聽示範。',model:'It picked up fridge odors.',zh:'它吸了冰箱裏其他味道。',speakingPrompt:'沒加蓋的蛋糕放冰箱一晚，現在聞起來有其他食物氣味。簡短說明。',recording:'phrase',questions:[]},
  {id:'native-358-v2-final',style:'final',label:'冰箱挑戰',title:'描述並推測來源',intro:'描述蛋糕的冰箱氣味，再推測來源。',questions:['native-358-v2-final']}
];
export default {revision:2,summary:'用 picked up fridge odors 描述食物吸收冰箱其他氣味，與已變壞區分。',steps,questions,takeaways:['It picked up fridge odors.'],completionTitle:'你能說明食物沾上冰箱味，並謹慎推測原因。'};
