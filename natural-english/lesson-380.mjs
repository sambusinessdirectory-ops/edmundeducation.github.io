import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-380-v2-audio','audio','聽到這句時，傷口之前最可能處於甚麼狀態？',['曾開始癒合，現在又裂開。','剛第一次割傷，還沒處理。','已結痂而且保持完整。','只是皮膚乾燥脫屑。'],'曾開始癒合，現在又裂開。','reopened 的 re- 指再次；傷口原先已閉合或正癒合，現在重新裂開。'),
  mc('native-380-v2-explain','explain','為何「The wound reopened」不能只譯作「我剛受傷」？',['因為 reopened 包含先前閉合、後來再裂的時間順序。','因為 reopened 專指第一次割傷。','因為 wound 只指皮膚乾燥。','因為句子保證傷口已完全痊癒。'],'因為 reopened 包含先前閉合、後來再裂的時間順序。','這句的重點是癒合進度倒退，少了「再次」就失去事件的關鍵。'),
  mc('native-380-v2-tone','tone','朋友問原本快好的手指為何又包紮，哪句平實而準確？',["It was healing, but the wound reopened when I bumped it.","It was healed forever, so nothing happened.","My whole hand has disappeared.","The cut has never closed at all."],"It was healing, but the wound reopened when I bumped it.",'先交代原本在癒合，再說碰撞後裂開，語氣準確而沒有誇張。'),
  open('native-380-v2-scene','scene','新情境：手指上的傷口快好了，搬箱時擦到邊角，又裂開。寫兩句英文說明原本進展及剛才發生甚麼。',["My finger cut was almost healed. I caught it on a box, and the wound reopened.","The cut on my finger was getting better. It reopened when I brushed it against a box.","My finger was healing well until I moved the boxes. The wound reopened after I bumped it."],'自評時先交代原本在癒合，再交代碰撞後重新裂開，不能只說新受傷。')
];
const steps=[
  {id:'native-380-v2-audio',style:'audio',label:'聽出再次',title:'快好了又裂？',intro:'留意動詞裏的「再一次」，判斷傷口先前狀態。',model:'The wound reopened.',zh:'傷口又裂開了。',audioOnly:true,questions:['native-380-v2-audio']},
  {id:'native-380-v2-explain',style:'explain',label:'拆解時間線',title:'reopened 的 re-',intro:'先閉合、後來再裂，順序不能省。',questions:['native-380-v2-explain']},
  {id:'native-380-v2-tone',style:'tone',label:'平實交代',title:'向朋友說清楚',intro:'把原本進展和碰撞說明白。',questions:['native-380-v2-tone']},
  {id:'native-380-v2-scene',style:'scene',label:'搬箱新情境',title:'完整交代經過',intro:'親自寫出癒合進度如何倒退。',questions:['native-380-v2-scene']},
  {id:'native-380-v2-speak',style:'speak',label:'口頭說經過',title:'手指又裂開',intro:'先自己說；錄音或跳過後才聽示範。',model:'The wound reopened.',zh:'傷口又裂開了。',speakingPrompt:'向朋友簡短說手指傷口又裂開。',recording:'phrase',questions:[]}
];
export default {revision:2,summary:'用 reopened 說傷口原本在癒合後再次裂開，保留先後次序。',steps,questions,takeaways:['The wound reopened.'],completionTitle:'你能說清傷口重新裂開的經過。'};
