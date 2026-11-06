import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-365-v2-audio','audio','先聽這句檔案描述。最可能出了甚麼事？',['檔案內容損壞，無法正常讀取。','檔案仍在下載途中。','檔案只是不在你常用資料夾。','你故意改了檔名。'],'檔案內容損壞，無法正常讀取。','corrupted 指檔案資料可能受損；打不開是可能表現。'),
  mc('native-365-v2-contrast','contrast','雙擊文件時系統顯示內容錯誤；檔案確實存在。哪句比「The file is missing」更準？',["The file may be corrupted.","The file has not been created.","The file is only in another folder.","The file is still syncing normally."],"The file may be corrupted.",'檔案存在卻讀取失敗，才有資料損壞的線索；may 保留檢查空間。'),
  mc('native-365-v2-rewrite','rewrite','你傳給同事的訊息只寫「It doesn’t work」。哪句說明檔案錯誤和下一步？',["The file won't open and may be corrupted. Do we have a backup?","The printer is out of paper. Can you buy some?","The folder is blue. Should we rename it?","The internet is fast. Do you want to download a game?"],"The file won't open and may be corrupted. Do we have a backup?",'交代打不開與可能損壞，再問備份，讓同事知道要查甚麼。'),
  mc('native-365-v2-scene','scene','你下載的試算表檔案已在電腦裏，但每次開啟都出現資料錯誤。哪個判斷最合理？',['檔案可能損壞，需要另一份副本。','檔案必定正在另一台電腦同步。','網站已經對所有人停機。','你的鍵盤帽掉了。'],'檔案可能損壞，需要另一份副本。','可見檔案存在但讀取失敗；重新取得副本是合理下一步。'),
  open('native-365-v2-transfer-write','transfer','新情境：你收到同事寄來的簡報檔，檔案在下載資料夾，但打開時軟件顯示讀取錯誤。寫兩句英文向同事說明，並請他再寄一份。',["The presentation file seems corrupted because it won't open. Could you send me another copy?","I downloaded the file, but it gives an error when I open it. Would you mind resending it?","The file may be corrupted; I can't read it in the presentation app. Could you send the original again?"],'自評時看是否分清檔案存在與內容讀取失敗，並提出重新寄送。')
];
const steps=[
  {id:'native-365-v2-audio',style:'audio',label:'聽出檔案狀況',title:'檔案在，卻打不開？',intro:'聽檔案是否仍存在，但無法正常開啟。',model:'The file is corrupted.',zh:'檔案損壞了。',audioOnly:true,questions:['native-365-v2-audio']},
  {id:'native-365-v2-contrast',style:'contrast',label:'存在或損壞',title:'不是找不到檔案',intro:'按錯誤訊息分辨問題。',questions:['native-365-v2-contrast']},
  {id:'native-365-v2-rewrite',style:'rewrite',label:'改寫求助',title:'比 It doesn’t work 清楚',intro:'說出症狀和可查的下一步。',questions:['native-365-v2-rewrite']},
  {id:'native-365-v2-scene',style:'scene',label:'試算表場景',title:'一開啟就報錯',intro:'根據檔案存在卻不能讀取作判斷。',questions:['native-365-v2-scene']},
  {id:'native-365-v2-speak',style:'speak',label:'口頭報告',title:'檔案可能壞了',intro:'先自己說；錄音或跳過後才聽示範。',model:'The file is corrupted.',zh:'檔案損壞了。',speakingPrompt:'檔案確實存在，但軟件一直顯示讀取錯誤。簡短告訴同事。',recording:'phrase',questions:[]},
  {id:'native-365-v2-transfer',style:'transfer',label:'簡報挑戰',title:'請同事重寄',intro:'獨立寫兩句，再依示例自評。',questions:['native-365-v2-transfer-write']}
];
export default {revision:2,summary:'用 corrupted 描述檔案存在但可能因資料損壞而無法開啟，並請同事提供副本。',steps,questions,takeaways:['The file is corrupted.'],completionTitle:'你能區分檔案損壞與遺失，並清楚請求重寄。'};
