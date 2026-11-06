import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-349-v2-audio','audio','先聽這句對外套的描述。填充物發生甚麼變化？',['從原來位置移到一邊，分布不均。','全部掉出外套。','每一團都黏成硬塊。','外套表面印花裂開。'],'從原來位置移到一邊，分布不均。','shifted 強調位置移動；clumped together 則強調結成團。'),
  mc('native-349-v2-scene','scene','羽絨外套洗完後左邊鼓鼓的，右邊變薄；填充物沒有漏出。怎樣描述？',["The filling has shifted.","The filling has leaked out.","The print is cracking.","The zipper is stuck."],"The filling has shifted.",'一邊厚、一邊薄顯示填充物移位，沒有證據表示漏出。'),
  mc('native-349-v2-continue','continue','朋友問：「Why is one side so puffy?」你剛洗完外套。怎樣接話？',["The filling has shifted to one side. I'll try to spread it out.","The jacket has no filling at all.","The sleeves have become shorter.","The fabric has turned a different color."],"The filling has shifted to one side. I'll try to spread it out.",'先解釋單側鼓起的原因，再說想重新分散填充物。'),
  open('native-349-v2-final','final','新情境：你剛從洗衣機取出羽絨外套，右肩很鼓、左肩卻扁扁的。寫兩句英文向家人說明填充物的變化與你打算怎樣處理。',["The filling has shifted to the right side. I'll try to redistribute it as the jacket dries.","One shoulder is puffy and the other is flat because the filling has shifted. Let me spread it out.","The filling has moved to one side in the wash. I'll gently work it back into place."],'自評時看是否說清楚填充物移位造成不平均，並提出重新分散的做法。')
];
const steps=[
  {id:'native-349-v2-audio',style:'audio',label:'聽出移位',title:'外套為何一邊鼓？',intro:'留意外套填充物是否移到一邊。',model:'The filling has shifted.',zh:'填充物移位了。',audioOnly:true,questions:['native-349-v2-audio']},
  {id:'native-349-v2-scene',style:'scene',label:'洗後外套',title:'左右厚薄不同',intro:'按填充物的分布判斷。',questions:['native-349-v2-scene']},
  {id:'native-349-v2-continue',style:'continue',label:'回答朋友',title:'一邊很鼓的原因',intro:'接着對方的觀察提出處理辦法。',questions:['native-349-v2-continue']},
  {id:'native-349-v2-speak',style:'speak',label:'口頭描述',title:'羽絨移到一邊',intro:'先自己說；錄音或跳過後才聽示範。',model:'The filling has shifted.',zh:'填充物移位了。',speakingPrompt:'外套一邊鼓、一邊扁，裏面的羽絨沒有漏出。簡短描述。',recording:'phrase',questions:[]},
  {id:'native-349-v2-final',style:'final',label:'洗衣挑戰',title:'說明並嘗試分散',intro:'描述外套兩邊填充不均，再說如何分散。',questions:['native-349-v2-final']}
];
export default {revision:2,summary:'用 filling has shifted 描述外套填充物移到一邊，與漏出或結塊分開。',steps,questions,takeaways:['The filling has shifted.'],completionTitle:'你能說清外套填充物移位，並提出整理方法。'};
