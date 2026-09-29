import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-303-v2-audio','audio','只聽鍵盤故障。掉下來的是哪一部分？',['按鍵上面的塑膠帽。','整個鍵盤。','按鍵下方的機械開關。','按鍵上印的字母已磨掉。'],'按鍵上面的塑膠帽。','keycap 是鍵頂可見、可拆的塑膠蓋；popped off 是突然脫落。'),
  mc('native-303-v2-scene','scene','你打字時 Enter 鍵頂部的塑膠片突然彈到桌上，但下面的開關仍在。哪句準確？',["The keycap popped off.","The Enter key is sticking.","The switch under the key stopped responding.","The Enter key is physically stuck."],"The keycap popped off.",'塑膠帽脫落是 keycap popped off；sticking 是按鍵卡住，另一種問題。'),
  mc('native-303-v2-contrast','contrast','哪個狀況才是「按鍵卡住」，而不是「鍵帽掉下」？',['按鍵按下後慢慢才彈回。','塑膠帽躺在桌面。','鍵帽從開關上飛開。','鍵帽字母磨掉了，但鍵帽仍牢牢裝著。'],'按鍵按下後慢慢才彈回。','sticking 說按鍵機械動作不順；keycap popped off 是外蓋脫落。'),
  mc('native-303-v2-tone','tone','IT 同事問鍵盤怎麼了。你想說明可見問題並問能否裝回，哪句合適？',["The keycap popped off. Can it be put back on?","The keyboard is ruined forever.","Every key is broken now.","You must buy me a new computer."],"The keycap popped off. Can it be put back on?",'準確指出脫落部分，再詢問能否重新裝好，方便同事判斷。'),
  open('native-303-v2-rewrite','rewrite',"你要給 IT 發報修訊息：空白鍵的鍵帽突然掉到桌上，下面的開關仍可按。寫兩句英文指出是哪個部件掉了，以及鍵盤其餘部分是否仍能用。",["The spacebar keycap popped off, but the switch underneath still works. The other keys are fine.", "One keycap came off the spacebar. I can still type with the rest of the keyboard."],"說明掉的是可見的塑膠鍵帽，不是整個鍵盤失效；再交代其他按鍵狀況。"),
];
const steps=[
  {id:'native-303-v2-audio',style:'audio',label:'先聽部件',title:'鍵頂塑膠帽',intro:'只聽一句故障描述。',model:'The keycap popped off.',zh:'鍵帽彈掉了。',audioOnly:true,questions:['native-303-v2-audio']},
  {id:'native-303-v2-scene',style:'scene',label:'Enter 鍵',title:'塑膠片彈到桌上',intro:'找出掉下的是哪部分。',questions:['native-303-v2-scene']},
  {id:'native-303-v2-contrast',style:'contrast',label:'兩種故障',title:'掉帽與卡鍵',intro:'用按鍵動作區分。',model:'The Enter key is sticking.',zh:'Enter 鍵卡住了。',questions:['native-303-v2-contrast']},
  {id:'native-303-v2-tone',style:'tone',label:'向 IT 說明',title:'能裝回去嗎？',intro:'提出具體報修問題。',questions:['native-303-v2-tone']},
  {id:'native-303-v2-rewrite',style:'rewrite',label:'寫清範圍',title:'只有空白鍵',intro:'讓同事知道局部故障。',questions:['native-303-v2-rewrite']}
];
export default {revision:2,summary:'用 keycap popped off 描述鍵帽脫落，與按鍵卡住的 sticking 區分。',steps,questions,takeaways:['The keycap popped off.','The Enter key is sticking.'],completionTitle:'你能指出鍵盤究竟哪個部件出了問題。'};
