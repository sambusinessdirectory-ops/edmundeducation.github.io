import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-368-v2-audio','audio','只聽這句對包裹的描述。損壞最可能發生在甚麼階段？',['寄出後到送達前的運送途中。','出廠之前。','收件人使用了很久之後。','退貨期限結束後。'],'寄出後到送達前的運送途中。','in transit 指運送期間；不是單純說包裹目前正在路上。'),
  mc('native-368-v2-scene','scene','寄件前照片顯示花瓶完好；收件時盒角壓扁，花瓶已裂。你可怎樣描述？',["It appears to have been damaged in transit.","It is still in transit and has not arrived.","The item was broken before it was packed.","The recipient used it for several months."],"It appears to have been damaged in transit.",'寄前完好、到達時破損，支持運送途中受損；appears 保留查證空間。'),
  mc('native-368-v2-tone','tone','客服問你商品到手時是否已損壞。你有照片，但不知道是哪一站造成。哪句準確？',["Yes, it arrived damaged. It looks like it was damaged in transit.","I know exactly which driver broke it on purpose.","It was perfect when it arrived, but I broke it later.","The package hasn't been shipped yet."],"Yes, it arrived damaged. It looks like it was damaged in transit.",'說出到貨時受損及合理推測，不無證據指責特定人。'),
  mc('native-368-v2-continue','continue','客服問：「Can you send us a photo?」你已拍下受損盒角。怎樣回應？',["Yes, I'll send a photo of the damaged box and item.","No, the item never arrived and I have no tracking.","I'll send a photo of an unrelated product.","The box is fine, so no photo is needed."],"Yes, I'll send a photo of the damaged box and item.",'照片包括包裝及物品，能協助客服了解運送中可能受損的情況。'),
  open('native-368-v2-final','final','新情境：你收到一盞網購桌燈，盒子有壓痕，燈罩也裂了；賣家寄前照片顯示完好。寫兩句英文向客服描述，並說你可以提供甚麼證據。',["The lamp seems to have been damaged in transit. I can send photos of the crushed box and cracked shade.","It arrived with a damaged box and a cracked shade. I'll attach the delivery photos for you.","The lamp was intact before shipping, but it arrived broken. I can show you photos of the packaging and damage."],'自評時看是否說明到貨時破損與運送階段，並提出照片證據。')
];
const steps=[
  {id:'native-368-v2-audio',style:'audio',label:'聽出受損時間',title:'在哪段路上壞了？',intro:'留意商品是在運送途中受損。',model:'It was damaged in transit.',zh:'它在運送途中受損。',audioOnly:true,questions:['native-368-v2-audio']},
  {id:'native-368-v2-scene',style:'scene',label:'花瓶收貨',title:'寄前完好，到貨裂開',intro:'按前後證據判斷。',questions:['native-368-v2-scene']},
  {id:'native-368-v2-tone',style:'tone',label:'客服描述',title:'不指責特定司機',intro:'分清已知損壞與未知責任。',questions:['native-368-v2-tone']},
  {id:'native-368-v2-continue',style:'continue',label:'提供證據',title:'客服要照片',intro:'接着對方的請求回答。',questions:['native-368-v2-continue']},
  {id:'native-368-v2-final',style:'final',label:'桌燈挑戰',title:'說明並附照片',intro:'說明到貨受損，並告知客服你會附照片。',questions:['native-368-v2-final']}
];
export default {revision:2,summary:'用 damaged in transit 描述商品寄前完好、到貨時受損，並向客服提供照片。',steps,questions,takeaways:['It was damaged in transit.'],completionTitle:'你能交代物品在運送途中受損的證據。'};
