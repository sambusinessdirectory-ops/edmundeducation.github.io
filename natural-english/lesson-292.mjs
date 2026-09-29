import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-292-v2-audio','audio','先聽這句關於 T-shirt 的話。衣服哪部分出了甚麼問題？',['表面的印花開始出現裂紋。','布料被剪出一個洞。','袖口穿久變鬆。','領口被染成另一種顏色。'],'表面的印花開始出現裂紋。','print 是衣服上的圖案印花；cracking 是印花表層出現裂線。'),
  mc('native-292-v2-scene','scene','你洗完舊 T-shirt，胸前圖案出現很多細裂線，但沒有整片脫落。怎樣說？',["The print is cracking.","The fabric is torn.","The sleeves have stretched out.","The print has vanished completely."],"The print is cracking.",'細裂線是 cracking；整片脫落或布料破洞都比眼前狀況不同。'),
  mc('native-292-v2-reverse','reverse','朋友說「The print is cracking」。你應檢查哪裏？',['T-shirt 表面的圖案。','衣服內側的洗衣標籤。','鞋底的橡膠。','毛衣的袖口。'],'T-shirt 表面的圖案。','print 在此指衣服外面的印刷圖案，不是布料本身或標籤。'),
  mc('native-292-v2-continue','continue','朋友問：「You’ve had that shirt for a while, right?」你看到圖案開始龜裂。怎樣接上？',["Yeah, and the print is starting to crack.","No, I bought it an hour ago and it's perfect.","Yes, but the shoes are too tight.","I don't own any shirts."],"Yeah, and the print is starting to crack.",'先回應穿了很久，再指出可見的老化跡象，接話自然。'),
  open('native-292-v2-final','final','新情境：你想把穿了多年的活動 T-shirt 送洗，發現胸前印花已開始龜裂。寫兩句英文告訴朋友衣服的情況及你打算如何小心處理。',["The print is cracking after all these washes. I'll wash the shirt gently from now on.","This old T-shirt's print has started to crack. I'm going to be careful when I wash it.","The design on the front is cracking. I'll turn the shirt inside out before washing it."],'自評時檢查是否指出印花裂紋，而非布料破洞，並給出具體處理方式。')
];
const steps=[
  {id:'native-292-v2-audio',style:'audio',label:'聽出老化',title:'衣服哪一層在裂？',intro:'先聽裂開的是布料還是 T-shirt 印花。',model:'The print is cracking.',zh:'衣服印花開始龜裂。',audioOnly:true,questions:['native-292-v2-audio']},
  {id:'native-292-v2-scene',style:'scene',label:'查看舊 T-shirt',title:'圖案出現細裂線',intro:'按印花的實際狀態選說法。',questions:['native-292-v2-scene']},
  {id:'native-292-v2-reverse',style:'reverse',label:'由詞找部位',title:'print 指哪裏？',intro:'把衣服的印花與其他部位分開。',questions:['native-292-v2-reverse']},
  {id:'native-292-v2-continue',style:'continue',label:'接朋友的話',title:'穿了很久的衫',intro:'用印花變化回答對方。',questions:['native-292-v2-continue']},
  {id:'native-292-v2-speak',style:'speak',label:'口頭描述',title:'指出印花龜裂',intro:'先自己說；錄音或跳過後才聽示範。',model:'The print is cracking.',zh:'衣服印花開始龜裂。',speakingPrompt:'朋友問舊 T-shirt 還好嗎；你看到胸前印花有細裂紋。簡短回答。',recording:'phrase',questions:[]},
  {id:'native-292-v2-final',style:'final',label:'洗衣挑戰',title:'告訴朋友如何處理',intro:'寫兩句，完成後對照示例。',questions:['native-292-v2-final']}
];
export default {revision:2,summary:'用 print is cracking 描述舊 T-shirt 印花出現裂線，與布料破洞或印花整片脫落區分。',steps,questions,takeaways:['The print is cracking.'],completionTitle:'你能描述印花老化，並說明如何小心處理衣服。'};
