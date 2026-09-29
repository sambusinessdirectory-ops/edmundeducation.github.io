import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-466-v2-audio','audio','只聽牙醫後的感覺。仍未恢復的是甚麼？',['半邊嘴的感覺。','整個身體的力氣。','牙齒的顏色。','嘴唇的形狀。'],'半邊嘴的感覺。','Half my mouth is still numb 說局部麻醉後半邊嘴仍沒感覺。'),
  mc('native-466-v2-scene','scene','補牙後左邊嘴唇碰到杯子也幾乎沒感覺，另一邊正常。哪句貼切？',["Half my mouth is still numb.","My whole mouth is swollen.","Both lips are bleeding.","My tooth is loose."],"Half my mouth is still numb.",'一側感覺尚未恢復是 numb；不是腫脹、流血或牙鬆。'),
  mc('native-466-v2-reverse','reverse','朋友聽你說 My lip is still numb，會理解哪件事？',['嘴唇觸感還沒完全回來。','嘴唇正在流血。','嘴唇因熱食灼傷。','嘴唇乾裂疼痛。'],'嘴唇觸感還沒完全回來。','numb 說感覺減弱或消失，不等於疼痛或外觀受傷。'),
  mc('native-466-v2-branch','branch','剛補完牙仍嘴麻，朋友邀你馬上吃熱湯。你想解釋為何先等一等，哪句合適？',["Half my mouth is still numb, so I'll wait until I can feel it properly.","My mouth is fine; I just don't like soup.","My teeth are all broken, so I can't eat.","The soup is too cold for my mouth."],"Half my mouth is still numb, so I'll wait until I can feel it properly.",'以仍然麻木解釋等待，與補牙後尚未恢復觸感的情境吻合。'),
  open('native-466-v2-speak','speak','牙醫治療後你一側嘴唇仍沒感覺。先口頭告訴朋友目前狀態，再聽示範。',["Half my mouth is still numb.","My lip is still numb from the dentist."],'用 still numb 說麻木尚未消退，不把它說成疼痛。'),
  open('native-466-v2-final','final','新場景：牙醫麻醉後過了一小時，右半邊嘴還是沒感覺。寫兩句英文告訴同伴狀況，並說你會等感覺恢復才吃東西。',["Half my mouth is still numb. I'll wait until the feeling comes back before I eat.","The right side of my mouth is still numb. I'm going to wait before eating."],'說明右半邊嘴在牙醫麻醉後仍麻木，並把等待進食與觸感恢復連起來。')
];
const steps=[
  {id:'native-466-v2-audio',style:'audio',label:'先聽感覺',title:'牙醫治療後',intro:'聽出尚未恢復的狀況。',model:'Half my mouth is still numb.',zh:'我半邊嘴還是麻的。',audioOnly:true,questions:['native-466-v2-audio']},
  {id:'native-466-v2-scene',style:'scene',label:'一邊沒感覺',title:'碰杯子也不敏感',intro:'從症狀選描述。',questions:['native-466-v2-scene']},
  {id:'native-466-v2-reverse',style:'reverse',label:'理解 numb',title:'嘴唇仍麻',intro:'由句子回推感覺。',model:'My lip is still numb.',zh:'我的嘴唇還是麻的。',questions:['native-466-v2-reverse']},
  {id:'native-466-v2-branch',style:'branch',label:'稍後才吃',title:'朋友端來熱湯',intro:'說明你要等的原因。',questions:['native-466-v2-branch']},
  {id:'native-466-v2-speak',style:'speak',label:'親口報告',title:'治療後一小時',intro:'先說再聽示範。',model:'Half my mouth is still numb.',zh:'我半邊嘴還是麻的。',speakingPrompt:'向朋友口頭說明一側嘴唇仍麻木。',recording:'phrase',questions:['native-466-v2-speak']},
  {id:'native-466-v2-final',style:'final',label:'進食決定',title:'等感覺回來',intro:'寫狀況與下一步。',questions:['native-466-v2-final']}
];
export default {revision:2,summary:'用 still numb 說牙醫麻醉後嘴唇或半邊嘴尚未恢復觸感。',steps,questions,takeaways:['Half my mouth is still numb.','My lip is still numb.'],completionTitle:'你能說清局部麻木，並解釋為何稍後才吃。'};
