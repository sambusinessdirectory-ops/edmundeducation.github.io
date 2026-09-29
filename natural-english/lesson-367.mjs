import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-367-v2-audio','audio','先聽這句對包裹的判斷。最可能出了甚麼派送問題？',['物流標示送達，但可能送到別的地址。','包裹仍在運送途中。','包裹只是在家中找不到。','包裹已被收件人簽收。'],'物流標示送達，但可能送到別的地址。','misdelivered 指送錯地方；一般 missing 只說找不到，未指出配送錯誤。'),
  mc('native-367-v2-detail','detail','哪項證據最支持你向物流公司說 misdelivered？',['送達照片顯示陌生門牌，與你的住址不符。','追蹤頁寫仍在倉庫。','你還未去信箱查看。','包裝盒在你家門前但被雨淋濕。'],'送達照片顯示陌生門牌，與你的住址不符。','照片上的地址不符直接支持送錯地方，比單純未找到更具體。'),
  mc('native-367-v2-explain','explain','為何「My package is missing」比 misdelivered 證據要求少？',['missing 只說沒找到；misdelivered 進一步判斷送錯地址。','missing 表示包裹一定未寄出。','misdelivered 表示盒子在運送中破損。','兩句都表示你已簽收。'],'missing 只說沒找到；misdelivered 進一步判斷送錯地址。','missing 只表示目前找不到包裹；misdelivered 指向配送地址錯誤，最好由照片或門牌支持。'),
  mc('native-367-v2-branch','branch','客服說：「It shows delivered. Do you recognize the delivery photo?」照片是別棟樓的大門。怎樣答？',["No, that's not my building. I think it was misdelivered.","Yes, that's my door and I have the package.","The package is still in the warehouse.","The box arrived but the item was broken."],"No, that's not my building. I think it was misdelivered.",'先指出照片地址不符，再以 I think 提出送錯的判斷，能讓客服查派送記錄。'),
  open('native-367-v2-final','final','新情境：網購包裹顯示已送達，但送達照片中的藍色門不是你家的白色門。寫兩句英文向物流客服報告並請他們查送到哪裏。',["The delivery photo shows a blue door, but mine is white. I think the package was misdelivered; could you check the address?","My order says delivered, but the photo is not of my home. Could you investigate where it was delivered?","I haven't received the package, and the delivery photo shows a different building. It may have been misdelivered."],'自評時看是否提供照片與住址不符的證據，而非只說自己找不到。')
];
const steps=[
  {id:'native-367-v2-audio',style:'audio',label:'聽出派送問題',title:'包裹去了哪裏？',intro:'聽包裹是否被送到錯誤地址。',model:'The package was misdelivered.',zh:'包裹送錯地址了。',audioOnly:true,questions:['native-367-v2-audio']},
  {id:'native-367-v2-detail',style:'detail',label:'看送達照片',title:'門牌不是你的',intro:'用照片核對派送地點。',questions:['native-367-v2-detail']},
  {id:'native-367-v2-explain',style:'explain',label:'從 missing 到 misdelivered',title:'多了甚麼判斷？',intro:'分開未收到與已知送錯。',questions:['native-367-v2-explain']},
  {id:'native-367-v2-branch',style:'branch',label:'回覆客服',title:'照片是哪棟樓？',intro:'提供對方可查的具體線索。',questions:['native-367-v2-branch']},
  {id:'native-367-v2-speak',style:'speak',label:'口頭報告',title:'指出可能送錯',intro:'先自己說；錄音或跳過後才聽示範。',model:'The package was misdelivered.',zh:'包裹送錯地址了。',speakingPrompt:'送達照片顯示的不是你的家門。向客服簡短指出可能問題。',recording:'phrase',questions:[]},
  {id:'native-367-v2-final',style:'final',label:'物流挑戰',title:'用照片請客服查',intro:'對比送達照片的藍門與自家白門，請客服查地址。',questions:['native-367-v2-final']}
];
export default {revision:2,summary:'用 misdelivered 指出包裹被送到錯誤地址，並用送達照片支持判斷。',steps,questions,takeaways:['The package was misdelivered.'],completionTitle:'你能向客服說明送錯地址的證據，請他們查找包裹。'};
