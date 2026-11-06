import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-366-v2-audio','audio','聽完這句對雲端檔案的話，兩台裝置最可能有甚麼差異？',['一台有新修改，另一台仍顯示舊版本。','兩台都顯示同一新版本。','兩台都沒有該檔案。','其中一台的螢幕碎了。'],'一台有新修改，另一台仍顯示舊版本。','not syncing 指變更沒有如預期同步到另一裝置。'),
  mc('native-366-v2-reverse','reverse','你在手機改了雲端文件，電腦上卻仍是昨天的內容。哪句直接描述問題？',["It's not syncing.","The file is corrupted.","The email bounced.","The website is back up."],"It's not syncing.",'檔案可讀但版本沒更新，是同步問題；不是資料損壞或退件。'),
  mc('native-366-v2-repair','repair','同事說「The file is missing」，但你在電腦上找到舊版，只是看不到手機的新改動。怎樣修正？',["The file is there, but it isn't syncing.","The file is completely gone from both devices.","The file opens with an error every time.","The cloud account has never existed."],"The file is there, but it isn't syncing.",'先澄清檔案存在，再指出新修改未同步，比 missing 準確。'),
  mc('native-366-v2-continue','continue','朋友問：「Did the changes show up on your laptop?」你看到的仍是舊版。怎樣接話？',["No, it's not syncing. I'll check the cloud connection.","Yes, all the changes are there already.","No, the laptop doesn't have a screen.","The file was printed but never saved."],"No, it's not syncing. I'll check the cloud connection.",'先回答沒有更新，再提出檢查雲端連線；符合眼前版本差異。'),
  open('native-366-v2-branch-write','branch','新情境：你在平板修改共享簡報，十分鐘後筆記本仍顯示舊版本。同事問新內容在哪裏。寫兩句英文解釋問題並說你要檢查網絡。',["The slides aren't syncing to my laptop yet. I'll check the internet connection on the tablet.","I saved the changes on my tablet, but the laptop still shows the old version. Let me check why it isn't syncing.","The new slides haven't appeared here because the file isn't syncing. I'll check the cloud connection."],'自評時看是否說明兩台裝置版本不同，而不是檔案損壞或遺失。')
];
const steps=[
  {id:'native-366-v2-audio',style:'audio',label:'聽出版本差異',title:'另一台仍是舊版？',intro:'聽兩台裝置顯示的檔案版本是否一致。',model:'It’s not syncing.',zh:'它沒有同步。',audioOnly:true,questions:['native-366-v2-audio']},
  {id:'native-366-v2-reverse',style:'reverse',label:'手機與電腦',title:'修改沒有跟過去',intro:'從兩台的內容差異找英文。',questions:['native-366-v2-reverse']},
  {id:'native-366-v2-repair',style:'repair',label:'修正 missing',title:'檔案還在',intro:'指出真正缺的是新改動。',questions:['native-366-v2-repair']},
  {id:'native-366-v2-continue',style:'continue',label:'回答朋友',title:'新內容有出現嗎？',intro:'接着問題說明舊版和下一步。',questions:['native-366-v2-continue']},
  {id:'native-366-v2-speak',style:'speak',label:'即時口說',title:'雲端沒有更新',intro:'先自己說；錄音或跳過後才聽示範。',model:'It’s not syncing.',zh:'它沒有同步。',speakingPrompt:'你在一台裝置修改雲端檔案，另一台仍顯示舊版。簡短描述。',recording:'phrase',questions:[]},
  {id:'native-366-v2-branch',style:'branch',label:'簡報挑戰',title:'向同事解釋新內容',intro:'獨立寫兩句，再對照示例。',questions:['native-366-v2-branch-write']}
];
export default {revision:2,summary:'用 not syncing 說明雲端檔案一台已更新、另一台仍顯示舊版。',steps,questions,takeaways:['It’s not syncing.'],completionTitle:'你能說明跨裝置版本不同，並檢查同步連線。'};
