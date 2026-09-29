import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-154-v2-audio','audio','只聽對房間的稱讚。它給人甚麼感覺？',['通風又不侷促。','空氣焗促。','東西凌亂。','房間大，但空氣仍有點焗促。'],'通風又不侷促。','nice and airy 說空氣流通、空間輕鬆開揚，常是正面評價。'),
  mc('native-154-v2-scene','scene','你看一間公寓：兩面大窗，微風吹進來，室內感覺開揚。哪句最貼切？',["It's nice and airy.","It's stuffy in here.","It's cramped and dark.","The place smells musty."],"It's nice and airy.",'大窗和空氣流通支持 airy；stuffy 是相反的焗促感。'),
  mc('native-154-v2-explain','explain','朋友問為何你覺得房間 airy。哪項觀察最能支持？',['開窗後有空氣流動，房間不悶。','房間在角落，只有一面小窗。','窗戶很大，但全都關著。','房間有挑高天花板，但空氣不流動。'],'開窗後有空氣流動，房間不悶。','airy 的關鍵是通風與開揚感，不單是顏色或家具數量。'),
  open('native-154-v2-branch','branch',"地產代理問你喜不喜歡這個客廳。你看到兩面大窗，開窗後有風流通。寫兩句英文回答並說明優點。",["I like it. It's nice and airy with those large windows.", "Yes, the living room feels open and airy. The windows let in a good breeze."],"用 airy 連結實際通風和開揚感，讓代理知道你喜歡的是甚麼。"),
];
const steps=[
  {id:'native-154-v2-audio',style:'audio',label:'聽出稱讚',title:'房間很通爽',intro:'只聽一句評價。',model:'It’s nice and airy.',zh:'這裡通風又開揚。',audioOnly:true,questions:['native-154-v2-audio']},
  {id:'native-154-v2-scene',style:'scene',label:'看公寓',title:'兩面大窗',intro:'把稱讚配到具體空間。',questions:['native-154-v2-scene']},
  {id:'native-154-v2-explain',style:'explain',label:'說出依據',title:'甚麼令它通爽？',intro:'找出與 airy 真正相關的特徵。',questions:['native-154-v2-explain']},
  {id:'native-154-v2-speak',style:'speak',label:'口頭對照',title:'相反的焗促',intro:'先自己說；錄音或跳過後才聽示範。',model:'It’s stuffy in here.',zh:'這裡很悶。',speakingPrompt:'另一間房沒有窗，空氣焗促。先口頭描述。',recording:'phrase',questions:[]},
  {id:'native-154-v2-branch',style:'branch',label:'回應代理',title:'說出你喜歡的地方',intro:'把評價放進看房對話。',questions:['native-154-v2-branch']}
];
export default {revision:2,summary:'用 nice and airy 正面形容通風、開揚的空間，與 stuffy 區分。',steps,questions,takeaways:['It’s nice and airy.','It’s stuffy in here.'],completionTitle:'你能具體說出房間通風開揚的優點。'};
