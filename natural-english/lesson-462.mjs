import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-462-v2-audio','audio','只聽眼鏡缺了甚麼。少的是哪個小零件？',['一側鼻托。','一片鏡片。','一條鏡腿。','一顆鏡框螺絲。'],'一側鼻托。','nose pad 是貼近鼻樑的小墊片；one of 表示只掉了一個。'),
  mc('native-462-v2-scene','scene','戴眼鏡時右邊鼻樑被硬框壓着，左邊仍有軟墊。哪句符合情況？',["One of the nose pads fell off.","Both nose pads fell off.","One arm of the glasses broke.","The right lens fell out."],"One of the nose pads fell off.",'只有一側軟墊缺失，所以用 one of the nose pads；不是兩個都掉。'),
  mc('native-462-v2-reverse','reverse','店員聽到 One of the nose pads fell off，問 Which side? 你指右邊，最簡潔怎樣答？',["The right side.","Both sides.","The front lens.","The left arm."],"The right side.",'Which side 問缺失位置；回答右邊即可，毋須重複整句。'),
  mc('native-462-v2-contrast','contrast','眼鏡總滑下來，但你發現其中一個鼻托整顆不見了。你應先說哪個具體問題？',["One of the nose pads fell off.","The arms on my glasses are loose.","The lenses are scratched.","The frame is too wide."],"One of the nose pads fell off.",'雖然眼鏡滑落，但可見原因是一個鼻托掉了；不要改說鏡腿鬆。'),
  mc('native-462-v2-rewrite','rewrite','把 A thing on my glasses came off 改得足夠具體，讓店員知道要找哪個零件。',["One of the nose pads fell off.","One of the lenses fell off.","One side of the frame is loose.","The bridge has slipped down."],"One of the nose pads fell off.",'指出掉的是貼在鼻樑旁的小鼻托，店員才知道該補哪個零件，而不會去換鏡片。'),
  open('native-462-v2-final','final','新場景：在眼鏡店，你右側鼻托掉了，另一側仍在。寫兩句英文說明缺失零件和位置，並問能否換一個。',["One of the nose pads fell off—the right one. Could you replace it for me?","The nose pad on the right side fell off. Do you have a replacement?"],'交代只有一側鼻托脫落，並指出右邊，讓店員能準確補件。')
];
const steps=[
  {id:'native-462-v2-audio',style:'audio',label:'先聽零件',title:'鼻樑旁少一顆',intro:'辨認掉落的部位。',model:'One of the nose pads fell off.',zh:'其中一個鼻托掉了。',audioOnly:true,questions:['native-462-v2-audio']},
  {id:'native-462-v2-scene',style:'scene',label:'戴上才發現',title:'只有右邊硬',intro:'看具體症狀選句子。',questions:['native-462-v2-scene']},
  {id:'native-462-v2-reverse',style:'reverse',label:'回答哪邊',title:'店員追問',intro:'給出簡潔位置。',model:'The right side.',zh:'右邊。',questions:['native-462-v2-reverse']},
  {id:'native-462-v2-contrast',style:'contrast',label:'別說錯部位',title:'鼻托與鏡腿',intro:'區分兩種滑落原因。',questions:['native-462-v2-contrast']},
  {id:'native-462-v2-rewrite',style:'rewrite',label:'改掉 thing',title:'讓店員找對零件',intro:'說清楚缺的是甚麼。',questions:['native-462-v2-rewrite']},
  {id:'native-462-v2-final',style:'final',label:'補鼻托挑戰',title:'指出右側',intro:'寫兩句描述與請求。',questions:['native-462-v2-final']}
];
export default {revision:2,summary:'用 one of the nose pads fell off 說眼鏡其中一個鼻托脫落。',steps,questions,takeaways:['One of the nose pads fell off.','The right side.'],completionTitle:'你能準確指出缺少的鼻托與位置。'};
