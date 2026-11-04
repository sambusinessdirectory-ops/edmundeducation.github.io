import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-387-v2-audio','audio','聽完後，腳後跟因甚麼而不舒服？',['鞋子反覆摩擦使皮膚紅痛。','腳後跟被重物砸中。','腳後跟因冷水而麻木。','鞋底被泥土弄髒。'],'鞋子反覆摩擦使皮膚紅痛。','chafed 是皮膚受反覆摩擦後發紅、刺痛，並非撞擊或麻木。'),
  mc('native-387-v2-repair','repair','穿新鞋後腳後跟磨紅；原句「My heel is scratched by a pencil」不符情境。怎樣改？',['My heel is chafed from the new shoes.','My heel is bruised by a falling box.','My heel is numb from the cold floor.','My heel is wet from the rain.'],'My heel is chafed from the new shoes.','from the new shoes 交代反覆摩擦來源；scratch 通常指一次性的刮痕。'),
  mc('native-387-v2-tone','tone','朋友問你為何慢慢走；你腳後跟被新鞋磨紅，哪句最平實？',["My heel is chafed from these new shoes, so I'm walking carefully.","I can't ever walk again because of these shoes.","Nothing hurts; I'm just trying to be dramatic.","My foot was crushed under a car."],"My heel is chafed from these new shoes, so I'm walking carefully.",'這句交代摩擦位置、原因與走慢的理由，沒有誇大成不能再走。'),
  open('native-387-v2-final','final','新情境：穿新鞋逛街一小時，腳後跟已紅痛，你想暫時換回舊鞋。寫兩句英文告訴同伴情況與決定。',["My heel is chafed from walking in these new shoes. I'm going to switch back to my old pair.","These new shoes have rubbed my heel raw. I'll change into my old shoes before we walk farther.","My heel feels sore and chafed after an hour in these shoes. I want to put on my older pair now."],'自評時要說清後跟受鞋摩擦，並寫出與不適相符的換鞋決定。')
];
const steps=[
  {id:'native-387-v2-audio',style:'audio',label:'聽摩擦部位',title:'新鞋磨到哪裏？',intro:'留意受摩擦的是腳後跟，而不是鞋底。',model:'My heel is chafed.',zh:'我的腳後跟磨紅痛了。',audioOnly:true,questions:['native-387-v2-audio']},
  {id:'native-387-v2-repair',style:'repair',label:'修正受傷描述',title:'不是鉛筆刮傷',intro:'用反覆摩擦的原因改寫。',questions:['native-387-v2-repair']},
  {id:'native-387-v2-tone',style:'tone',label:'向同伴說明',title:'說明為何走慢',intro:'把不適和步速連起來。',questions:['native-387-v2-tone']},
  {id:'native-387-v2-speak',style:'speak',label:'口頭說症狀',title:'腳後跟磨紅',intro:'先自己說；錄音或跳過後才聽示範。',model:'My heel is chafed.',zh:'我的腳後跟磨紅痛了。',speakingPrompt:'新鞋把腳後跟磨紅，簡短描述。',recording:'phrase',questions:[]},
  {id:'native-387-v2-final',style:'final',label:'逛街新情境',title:'解釋換鞋',intro:'寫出後跟狀況與你想換鞋的決定。',questions:['native-387-v2-final']}
];
export default {revision:2,summary:'用 chafed 描述新鞋反覆摩擦令腳後跟紅痛。',steps,questions,takeaways:['My heel is chafed.'],completionTitle:'你能說明鞋子磨傷腳後跟。'};
