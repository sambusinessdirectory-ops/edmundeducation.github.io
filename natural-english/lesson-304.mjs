import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-304-v2-audio','audio','只聽網站狀態。故障範圍最可能是甚麼？',['整個服務暫時無法使用。','只有你的某個頁面圖片太慢。','只有你的瀏覽器卡在登入畫面。','網站載得很慢但仍可用。'],'整個服務暫時無法使用。','site is down 通常指服務端目前不可用，不只是單一頁面載入慢。'),
  mc('native-304-v2-detail','detail','你懷疑網站整體故障。哪個觀察最能支持，而非只怪自己的裝置？',['幾位朋友用不同裝置也打不開。','只有你的手機電量低。','你換瀏覽器後就能登入。','朋友用手機網路可以正常登入。'],'幾位朋友用不同裝置也打不開。','不同人、不同裝置都失敗，較支持服務端出問題。'),
  mc('native-304-v2-repair','repair','只有你的一個頁面轉圈圈，朋友可正常登入。你說 The site is down。哪句更審慎？',["This page won't load for me.","The whole site is down for everyone.","The site is back up.","The website no longer exists."],"This page won't load for me.",'目前證據只支持你的頁面載不出來，不足以判定整個網站停擺。'),
  mc('native-304-v2-explain','explain','同事說網站好像 down 了。你想先驗證，哪一步最有用？',['請另一人從不同網路試著開同一網站。','只在自己電腦上清掉瀏覽器快取。','先重開自己的瀏覽器。','先等十分鐘，卻不問其他使用者。'],'請另一人從不同網路試著開同一網站。','另一網路與裝置都打不開，可幫助區分服務端故障和本機連線問題。'),
  open('native-304-v2-transfer','transfer',"線上銀行網站剛才你和兩位同事都打不開。現在你要通知另一位同事。寫兩句英文描述服務狀態及你們已怎樣核對。",["The banking site seems to be down. Several of us tried it on different devices and couldn't log in.", "I think the banking site is down. It isn't working for me or my colleagues either."],"用多人、不同裝置都失敗支持整體服務停擺的判斷，而非只報告自己的頁面載不到。"),
  mc('native-304-v2-continue','continue','你說 The site is down，同事說 Same here。接下來哪句最合理？',["Let's wait and try again later.","It must be only my browser.","Maybe only the login page is affected.","Let's clear the local browser cache first."],"Let's wait and try again later.",'兩人都不能用網站，先等服務恢復並稍後重試，比只修自己的瀏覽器合理。')
];
const steps=[
  {id:'native-304-v2-audio',style:'audio',label:'先聽範圍',title:'服務整體停了',intro:'只聽一句。',model:'The site is down.',zh:'網站目前無法使用。',audioOnly:true,questions:['native-304-v2-audio']},
  {id:'native-304-v2-detail',style:'detail',label:'多人驗證',title:'不只是你打不開',intro:'找出故障範圍的證據。',questions:['native-304-v2-detail']},
  {id:'native-304-v2-repair',style:'repair',label:'修正推斷',title:'單頁載不出來時',intro:'別把本機問題說成網站整體停擺。',model:'The page won’t load.',zh:'這個頁面載不出來。',questions:['native-304-v2-repair']},
  {id:'native-304-v2-explain',style:'explain',label:'驗證來源',title:'換網路試一試',intro:'用簡單方法判斷故障在哪。',questions:['native-304-v2-explain']},
  {id:'native-304-v2-transfer',style:'transfer',label:'換個服務',title:'銀行網站也會停',intro:'把 down 用於另一服務。',questions:['native-304-v2-transfer']},
  {id:'native-304-v2-continue',style:'continue',label:'一起等恢復',title:'同事也打不開',intro:'接續多人共同遇到的故障。',questions:['native-304-v2-continue']}
];
export default {revision:2,summary:'用 site is down 描述整體網站服務暫時不可用，並與個別頁面載入失敗區分。',steps,questions,takeaways:['The site is down.','The page won’t load.'],completionTitle:'你能判斷網站是否整體停擺，並準確告訴同事。'};
