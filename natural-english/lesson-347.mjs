import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-347-v2-audio','audio','聽完這句對書的描述，哪個部位有裂痕？',['連接封面和書頁的書脊。','其中一頁的邊角。','外面的塑膠書套。','印在封面的書名。'],'連接封面和書頁的書脊。','spine 在書本情境指書脊，不是人體脊椎。'),
  mc('native-347-v2-reverse','reverse','你翻一本舊書時，書背中央沿着摺線裂開。哪句最準？',["The spine is cracked.","A page corner is bent.","The cover is stained.","The book is missing its title."],"The spine is cracked.",'裂的是書脊；頁角彎曲及封面污漬都是其他位置。'),
  mc('native-347-v2-tone','tone','朋友借你珍藏的書，你發現書脊已裂，但書頁仍在。哪句既準確又不誇大？',["The spine is cracked, so I'll handle it carefully.","Every page has fallen out and the book is gone.","The book is completely waterproof now.","Nothing at all has changed with the book."],"The spine is cracked, so I'll handle it carefully.",'說明已見到的裂痕，並表達會小心處理；不用說整本散掉。'),
  mc('native-347-v2-transfer','transfer','同一詞換到精裝筆記本：封面與頁面連接處裂開。哪句仍可用？',["The notebook's spine is cracked.","The notebook's pages are wet.","The notebook's ink is faded.","The notebook's corners are folded."],"The notebook's spine is cracked.",'精裝筆記本也有書脊，連接處裂開仍可用 spine is cracked。'),
  open('native-347-v2-final','final','新情境：你翻閱一本借來的舊書，書脊已有裂痕；你想繼續閱讀但怕弄壞。寫兩句英文告訴朋友狀況和你會怎樣小心處理。',["The spine is cracked, so I'll be careful when I open the book. I don't want the pages to come loose.","This old book has a cracked spine. I'll avoid opening it too wide.","I noticed the spine is cracked. I'll turn the pages gently and support the cover."],'自評時看是否明確指出書脊，而非頁角或封面，並說出小心處理的方法。')
];
const steps=[
  {id:'native-347-v2-audio',style:'audio',label:'聽出部位',title:'書背的裂痕',intro:'聽裂開的是書脊，不是內頁。',model:'The spine is cracked.',zh:'書脊裂開了。',audioOnly:true,questions:['native-347-v2-audio']},
  {id:'native-347-v2-reverse',style:'reverse',label:'由裂痕找句子',title:'不是頁角彎曲',intro:'用書的構造定位損傷。',questions:['native-347-v2-reverse']},
  {id:'native-347-v2-tone',style:'tone',label:'珍藏書',title:'說清程度並小心',intro:'如實說書脊裂，不誇大整本散掉。',questions:['native-347-v2-tone']},
  {id:'native-347-v2-transfer',style:'transfer',label:'換到筆記本',title:'精裝本也有書脊',intro:'把同一部位用於另一種裝訂物。',questions:['native-347-v2-transfer']},
  {id:'native-347-v2-speak',style:'speak',label:'口頭提醒',title:'翻書時別用力',intro:'先自己說；錄音或跳過後才聽示範。',model:'The spine is cracked.',zh:'書脊裂開了。',speakingPrompt:'你拿着一本舊書，書背中央已有裂痕。簡短指出狀況。',recording:'phrase',questions:[]},
  {id:'native-347-v2-final',style:'final',label:'借書挑戰',title:'說明如何避免再損壞',intro:'說明書脊裂痕與往後翻書會怎樣小心。',questions:['native-347-v2-final']}
];
export default {revision:2,summary:'用 spine is cracked 描述書脊裂開，並說明閱讀時會如何小心處理。',steps,questions,takeaways:['The spine is cracked.'],completionTitle:'你能定位書脊裂痕並向朋友說明。'};
