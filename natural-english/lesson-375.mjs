import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-375-v2-audio','audio','先聽這句網購狀態。一張訂單怎樣寄出？',['分成兩批包裹寄送。','兩張不同訂單合併寄送。','整張訂單已取消。','包裹被送錯地址。'],'分成兩批包裹寄送。','split into two shipments 指同一訂單分兩批出貨，可能不同日到。'),
  mc('native-375-v2-scene','scene','你一次買三件貨，今天只收到一件；追蹤頁顯示另兩件在第二個包裹。怎樣說？',["My order was split into two shipments.","Two separate orders were combined into one box.","My whole order was canceled.","The package was misdelivered."],"My order was split into two shipments.",'三件貨屬同一訂單，但被分成兩批寄；第一批到了不表示缺貨。'),
  mc('native-375-v2-explain','explain','收到第一個包裹後，為何仍不能說整張訂單少寄？',['追蹤資料顯示第二批仍在途中。','因為一張訂單只能有一件商品。','因為第二個包裹一定被偷了。','因為所有商品已在第一個包裹。'],'追蹤資料顯示第二批仍在途中。','分批出貨意味着到貨日期可能不同；應先查第二批狀態。'),
  mc('native-375-v2-transfer','transfer','從衣服換到書本：你訂了兩本書，平台把它們分開寄。哪句仍適用？',["My book order was split into two shipments.","Both books were sent in one package.","Neither book was ordered.","The books were returned before shipping."],"My book order was split into two shipments.",'雖然商品從衣服換成書，關鍵仍是一張訂單分兩批寄；不能說成兩張訂單或一個包裹。'),
  mc('native-375-v2-branch','branch','朋友問：「So the other package is coming later?」追蹤頁顯示第二批明日到。怎樣答？',["Yes, the second shipment is scheduled for tomorrow.","No, the order has never been placed.","Yes, both packages arrived yesterday.","No, the second parcel was damaged in transit."],"Yes, the second shipment is scheduled for tomorrow.",'根據追蹤資料回答第二批的預計時間，不臆測損壞或遺失。'),
  open('native-375-v2-final','final','新情境：你一次網購杯子和書，今天只收到杯子，追蹤頁寫書在第二批，明天到。寫兩句英文向家人解釋為何只收到一個包裹。',["My order was split into two shipments. The books are in the second package, which should arrive tomorrow.","Only the cups arrived today because the order was split. The shipment with the books is due tomorrow.","The store sent my order in two separate packages. I got the cups today and expect the books tomorrow."],'自評時看是否說明同一訂單分兩批，並交代另一批的追蹤狀態。')
];
const steps=[
  {id:'native-375-v2-audio',style:'audio',label:'聽出分批',title:'一張訂單幾個包裹？',intro:'聽一張訂單被分成幾批寄出。',model:'My order was split into two shipments.',zh:'我的訂單分兩批寄。',audioOnly:true,questions:['native-375-v2-audio']},
  {id:'native-375-v2-scene',style:'scene',label:'今天只到一件',title:'其餘在第二個包裹',intro:'用追蹤資料判斷。',questions:['native-375-v2-scene']},
  {id:'native-375-v2-explain',style:'explain',label:'不要急說漏寄',title:'第二批還在途中',intro:'連結分批出貨與到貨時間。',questions:['native-375-v2-explain']},
  {id:'native-375-v2-transfer',style:'transfer',label:'換到書本',title:'書也可能分批寄',intro:'把同一訂單結構用在新商品。',questions:['native-375-v2-transfer']},
  {id:'native-375-v2-branch',style:'branch',label:'回答家人',title:'另一個包裹何時到？',intro:'根據追蹤頁接話。',questions:['native-375-v2-branch']},
  {id:'native-375-v2-final',style:'final',label:'網購挑戰',title:'解釋只到一箱',intro:'說明同單分批，並交代另一箱明天到。',questions:['native-375-v2-final']}
];
export default {revision:2,summary:'用 split into two shipments 解釋同一訂單分兩批寄送及不同到貨時間。',steps,questions,takeaways:['My order was split into two shipments.'],completionTitle:'你能向家人說清分批寄送與第二包裹的進度。'};
