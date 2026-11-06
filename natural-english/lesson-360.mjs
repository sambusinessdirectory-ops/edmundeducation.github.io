import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-360-v2-audio','audio','聽完這句微波食物描述，盤中溫度怎樣？',['有些位置很熱，有些仍冷。','只有一個局部高溫點，其餘全都剛好。','整盤都同樣燙。','整盤都完全冷凍。'],'有些位置很熱，有些仍冷。','hot and cold spots 指同一份食物內有多處溫度不均。'),
  mc('native-360-v2-detail','detail','你微波一碗飯，邊緣燙、中間冷、另一角又熱。哪個觀察支持複數 spots？',['同一碗裏有幾處熱點及冷點。','碗面顏色完全一致。','只有一處突然特別熱，其餘都一樣。','飯粒大小略有不同。'],'同一碗裏有幾處熱點及冷點。','複數 spots 對應多個溫度不同的局部位置。'),
  mc('native-360-v2-contrast','contrast','哪個情況應說 hot and cold spots，而不是只說 a hot spot？',['一邊燙、一邊仍冷，溫度交錯。','大部分溫度正常，只有中央一口很燙。','整碗飯都均勻熱透。','飯的味道有些辣、有些淡。'],'一邊燙、一邊仍冷，溫度交錯。','兩種溫度在多處並存才適合 hot and cold spots。'),
  mc('native-360-v2-rewrite','rewrite','朋友問飯可否吃。原稿只寫「It’s not heated well」。哪句說明具體情況？',["There are still hot and cold spots. Let's stir it and heat it again.","The bowl has a water ring underneath.","The rice is undercooked in the middle.","The entire meal is equally hot."],"There are still hot and cold spots. Let's stir it and heat it again.",'說出溫度不均，再提出攪拌重熱，對朋友的問題更有用。'),
  open('native-360-v2-final','final','新情境：你微波一碗湯，邊上燙、中央還涼。寫兩句英文向朋友說明溫度問題和你的下一步。',["There are hot and cold spots in the soup. I'll stir it and heat it again.","The edge is hot, but the middle is still cool. Let me stir the soup before microwaving it again.","The soup heated unevenly and has hot and cold spots. I'll mix it well and reheat it."],'自評時看是否說出冷熱並存的局部位置，並提出攪拌或重新加熱。')
];
const steps=[
  {id:'native-360-v2-audio',style:'audio',label:'聽出溫差',title:'熱透了嗎？',intro:'聽微波食物是否同時有冷處和熱處。',model:'There are hot and cold spots.',zh:'有些地方熱、有些還冷。',audioOnly:true,questions:['native-360-v2-audio']},
  {id:'native-360-v2-detail',style:'detail',label:'測幾個位置',title:'邊緣燙，中間冷',intro:'從不同位置的溫度判斷。',questions:['native-360-v2-detail']},
  {id:'native-360-v2-contrast',style:'contrast',label:'單點與多處',title:'不止一個 hot spot',intro:'分清局部單一熱點與多處不均。',questions:['native-360-v2-contrast']},
  {id:'native-360-v2-rewrite',style:'rewrite',label:'說清問題',title:'比 heated badly 具體',intro:'把含糊評語改成可處理的描述。',questions:['native-360-v2-rewrite']},
  {id:'native-360-v2-speak',style:'speak',label:'口頭提醒',title:'微波飯還不均勻',intro:'先自己說；錄音或跳過後才聽示範。',model:'There are hot and cold spots.',zh:'有些地方熱、有些還冷。',speakingPrompt:'微波飯有幾口燙，有幾口仍冷。用一句英文告訴朋友。',recording:'phrase',questions:[]},
  {id:'native-360-v2-final',style:'final',label:'湯碗挑戰',title:'攪拌後再加熱',intro:'交代微波食物冷熱不均，再說如何處理。',questions:['native-360-v2-final']}
];
export default {revision:2,summary:'用 hot and cold spots 描述微波食物多處加熱不均，並與單一 hot spot 區分。',steps,questions,takeaways:['There are hot and cold spots.'],completionTitle:'你能描述冷熱不均，並提出重新加熱的做法。'};
