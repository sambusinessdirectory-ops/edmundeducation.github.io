import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-320-v2-audio','audio','只聽 USB 問題。電腦目前沒有做到甚麼？',['偵測並顯示插入的 USB drive。','看到 USB drive，但無法打開其中一個檔案。','複製檔案時速度太慢。','只看到 USB drive 名稱，但無法讀取內容。'],'偵測並顯示插入的 USB drive。','isn’t being recognized 說系統未正常辨識裝置，未必代表檔案已丟失。'),
  mc('native-320-v2-detail','detail','你插入 USB drive，檔案總管完全沒有新磁碟。哪個測試能直接比較這台電腦的兩個 USB 埠？',['換另一個 USB 埠後，電腦是否能看到它。','USB drive 上的燈是否亮起。','另一台電腦能否看到這支 USB drive。','檔案總管是否顯示其他磁碟。'],'換另一個 USB 埠後，電腦是否能看到它。','換埠可隔離原本插孔是否失效，直接幫助辨識故障來源。'),
  mc('native-320-v2-branch','branch','IT 問 Did the drive show up? 你插上後完全沒有顯示。哪句直接回答？',["No, it isn't being recognized.","Yes, it shows up but a file won't open.","It appears, but copying is slow.","I haven't plugged it in yet."],"No, it isn't being recognized.",'問題問裝置是否出現；完全未顯示是辨識失敗，不是單一檔案讀不了。'),
  mc('native-320-v2-continue','continue','同事說 Try a different USB port。你試完另一個仍沒顯示。下一句最有用？',["I tried another port, but the drive still isn't showing up.","The drive worked on another computer yesterday.","The same port recognizes my mouse.","I'll try restarting the computer later."],"I tried another port, but the drive still isn't showing up.",'回報已試的排查步驟及結果，讓同事知道換埠未解決問題。'),
  open('native-320-v2-final','final','最後挑戰：你把 USB drive 插進辦公室電腦，系統沒顯示。換另一個 USB 埠後仍一樣。向 IT 寫兩句英文描述問題及已試過的步驟。',["The drive isn't being recognized by my computer. I tried a second USB port, but it still doesn't show up.","My computer isn't recognizing the USB drive. I tested another port and got the same result."],'清楚說明裝置未被辨識，並列出已試過換埠，避免 IT 重複要求相同步驟。')
];
const steps=[
  {id:'native-320-v2-audio',style:'audio',label:'先聽問題',title:'USB 沒顯示',intro:'只聽裝置辨識狀況。',model:'The drive isn’t being recognized.',zh:'電腦未能辨識這個磁碟。',audioOnly:true,questions:['native-320-v2-audio']},
  {id:'native-320-v2-detail',style:'detail',label:'換埠試試',title:'先隔離插孔',intro:'找出能幫助判斷的測試。',questions:['native-320-v2-detail']},
  {id:'native-320-v2-branch',style:'branch',label:'回答 IT',title:'裝置出現了嗎？',intro:'分清裝置未顯示和檔案打不開。',questions:['native-320-v2-branch']},
  {id:'native-320-v2-continue',style:'continue',label:'回報結果',title:'另一個埠也沒用',intro:'把已試步驟說清楚。',model:'My computer isn’t recognizing the USB drive.',zh:'我的電腦辨識不到 USB drive。',questions:['native-320-v2-continue']},
  {id:'native-320-v2-final',style:'final',label:'IT 挑戰',title:'兩個埠都試過',intro:'自己寫問題和排查結果。',questions:['native-320-v2-final']}
];
export default {revision:2,summary:'用 isn’t being recognized 描述 USB drive 未被電腦偵測，並回報已試的 USB 埠。',steps,questions,takeaways:['The drive isn’t being recognized.','My computer isn’t recognizing the USB drive.'],completionTitle:'你能向 IT 說清 USB 未被辨識及已試過的檢查。'};
