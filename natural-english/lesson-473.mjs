import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-473-v2-audio','audio','只聽下載進度。它停在哪個位置？',['99%，差一點完成。','一開始的 1%。','安裝中途 50%。','完成後驗證階段。'],'99%，差一點完成。','stalled at 99% 說下載進度到 99% 後不再前進，尚未完成。'),
  mc('native-473-v2-explain','explain','The download stalled at 99% 中 stalled 的重點是甚麼？',['進度曾前進，然後停住。','下載已成功完成。','檔案被刻意取消。','下載速度一直穩定。'],'進度曾前進，然後停住。','stalled 表示過程中途停滯；99% 仍不是 100% 完成。'),
  mc('native-473-v2-repair','repair','朋友說 The file finished downloading，但進度條一直在 99%，檔案未能開啟。怎樣修正？',["The download stalled at 99%.","The download finished at 99%.","The installation completed halfway through.","The file opened but was corrupted."],"The download stalled at 99%.",'99% 停住表示下載尚未完成；不能說 finished。'),
  mc('native-473-v2-continue','continue','同事說下載停在 99% 已十分鐘。你想先了解是否完全不動，怎樣追問？',["Has the percentage changed at all in the last ten minutes?","Did the installation finish yesterday?","Is the file already open on your desktop?","Do you prefer a different file format?"],"Has the percentage changed at all in the last ten minutes?",'先核實進度是否真的停滯，才可判斷是否 stalled。'),
  open('native-473-v2-final','final','新場景：工作檔案下載到 99% 就不再動，同事以為已完成。寫兩句英文更正，並告訴他目前不能開檔。',["The download stalled at 99%; it hasn't finished. I can't open the file yet.","It's still at 99%, so the download has stalled. The file isn't ready to open."],'說明進度停住而非完成，再交代目前不能使用檔案。')
];
const steps=[
  {id:'native-473-v2-audio',style:'audio',label:'先聽進度',title:'就差一點',intro:'辨認停住的位置。',model:'The download stalled at 99%.',zh:'下載停在 99%。',audioOnly:true,questions:['native-473-v2-audio']},
  {id:'native-473-v2-explain',style:'explain',label:'理解停滯',title:'不是完成',intro:'看 stalled 的時間變化。',questions:['native-473-v2-explain']},
  {id:'native-473-v2-repair',style:'repair',label:'更正同事',title:'還差百分之一',intro:'不要把 99% 說成完成。',questions:['native-473-v2-repair']},
  {id:'native-473-v2-continue',style:'continue',label:'核實狀況',title:'十分鐘沒變？',intro:'追問進度是否真的停了。',questions:['native-473-v2-continue']},
  {id:'native-473-v2-final',style:'final',label:'工作檔挑戰',title:'現在不能開檔',intro:'寫出停滯與影響。',questions:['native-473-v2-final']}
];
export default {revision:2,summary:'用 stalled at 99% 說下載到接近完成時停住，並區分下載與安裝。',steps,questions,takeaways:['The download stalled at 99%.','The installation stalled halfway through.'],completionTitle:'你能指出下載進度停滯，避免誤報完成。'};
