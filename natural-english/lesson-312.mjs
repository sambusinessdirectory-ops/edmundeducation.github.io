import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-312-v2-audio','audio','只聽毛衣問題。袖口和從前相比怎樣？',['穿久後鬆垮，不再貼手腕。','洗完後縮得太緊。','袖口只是有些起毛球。','袖口洗後縮得更緊。'],'穿久後鬆垮，不再貼手腕。','stretched out 表示原本的形狀被拉鬆，失去貼合度。'),
  mc('native-312-v2-detail','detail','哪項觀察最能支持 cuffs have stretched out？',['袖口會滑到手背，鬆鬆垮垮。','袖口緊得很難穿過手。','袖口仍緊貼手腕，但布料變薄。','袖口不再有原本的顏色。'],'袖口會滑到手背，鬆鬆垮垮。','袖口從貼手腕變成往下滑，是失去彈性、變鬆的具體證據。'),
  mc('native-312-v2-reverse','reverse','舊毛衣領口也被拉得不再貼頸。要說「領口變鬆了」，哪句合適？',["The neckline has stretched out.","The neckline has shrunk.","The neckline is stained.","The neckline is slightly wrinkled."],"The neckline has stretched out.",'stretched out 可換到領口；shrunken 是縮小而非鬆開。'),
  open('native-312-v2-final','final','最後挑戰：你整理衣櫃，發現一件舊毛衣的袖口已鬆得滑到手背。朋友問你為何不常穿它。寫兩句英文描述變化和穿著感覺。',["The cuffs have stretched out. They don't stay snug around my wrists anymore.","I don't wear it much because the cuffs are loose now. They slide down over my hands."],'用 stretched out 描述長期穿用後失去形狀，再說它怎樣影響穿著。')
];
const steps=[
  {id:'native-312-v2-audio',style:'audio',label:'先聽變化',title:'袖口變鬆',intro:'只聽一句衣物描述。',model:'The cuffs have stretched out.',zh:'袖口穿久變鬆了。',audioOnly:true,questions:['native-312-v2-audio']},
  {id:'native-312-v2-detail',style:'detail',label:'看貼合度',title:'會滑到手背',intro:'找出變鬆的具體表現。',questions:['native-312-v2-detail']},
  {id:'native-312-v2-reverse',style:'reverse',label:'換到領口',title:'同樣失去彈性',intro:'從衣物部位想說法。',model:'The neckline has stretched out.',zh:'領口被拉鬆了。',questions:['native-312-v2-reverse']},
  {id:'native-312-v2-speak',style:'speak',label:'口頭說明',title:'舊毛衣不再合身',intro:'先自己說；錄音或跳過後才聽示範。',model:'The cuffs have stretched out.',zh:'袖口變鬆了。',speakingPrompt:'袖口原本貼手腕，現在一直滑下。先口頭描述。',recording:'phrase',questions:[]},
  {id:'native-312-v2-final',style:'final',label:'衣櫃挑戰',title:'為何不再常穿',intro:'自己說明變化及影響。',questions:['native-312-v2-final']}
];
export default {revision:2,summary:'用 stretched out 描述毛衣袖口或領口穿久後變鬆，與縮水區分。',steps,questions,takeaways:['The cuffs have stretched out.','The neckline has stretched out.'],completionTitle:'你能說清毛衣哪裡變鬆，以及穿著時的影響。'};
