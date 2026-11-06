import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-306-v2-audio','audio','只聽滑鼠問題。延遲發生在哪兩件事之間？',['移動滑鼠與游標跟著動。','移動滑鼠與電腦接收滑鼠訊號。','移動滑鼠與滑鼠燈亮起。','按鍵與畫面回應。'],'移動滑鼠與游標跟著動。','input lag 是輸入動作與螢幕反應之間有可察覺延遲。'),
  mc('native-306-v2-continue','continue','朋友說 There’s input lag。你想找出問題是否一直存在，怎樣追問？',["Does it happen all the time or only in that game?","Does the delay change when you plug it in?","Is the lag worse at high resolution?","Have you tried a different mouse?"],"Does it happen all the time or only in that game?",'問出現範圍，有助判斷是整個系統還是特定遊戲或程式。'),
  mc('native-306-v2-branch','branch','你移動滑鼠，游標總慢半秒才動。客服問是否滑鼠完全沒反應。哪句澄清？',["It responds, but there's noticeable input lag.","It never moves at all.","The cursor moves immediately, but clicks register late.","The cursor freezes only when I open a menu."],"It responds, but there's noticeable input lag.",'不是完全沒有反應，而是反應遲到；noticeable 表示延遲明顯。'),
  mc('native-306-v2-transfer','transfer','換到遊戲手掣：按跳躍後角色隔一會才跳。哪個詞也適用？',["input lag","a slow connection","a delayed animation","a stiff button"],"input lag",'手掣按鈕是輸入，角色動作是回應；兩者之間延遲同樣叫 input lag。'),
  open('native-306-v2-final','final','最後挑戰：你用無線滑鼠剪片，每次拖動滑鼠，螢幕游標都要半秒才跟上。向同事寫兩句英文說明問題與工作受影響的地方。',["There's noticeable input lag with this mouse. The cursor moves about half a second after I move it, so editing is difficult.","The cursor is delayed when I move the mouse. It's hard to make precise edits because of the input lag."],'明確指出輸入與顯示之間的時間差，再說它如何影響剪片。')
];
const steps=[
  {id:'native-306-v2-audio',style:'audio',label:'先聽延遲',title:'手動了，游標慢到',intro:'只聽一句科技描述。',model:'There’s input lag.',zh:'輸入有延遲。',audioOnly:true,questions:['native-306-v2-audio']},
  {id:'native-306-v2-continue',style:'continue',label:'問出範圍',title:'一直都慢嗎？',intro:'接著找問題發生條件。',questions:['native-306-v2-continue']},
  {id:'native-306-v2-branch',style:'branch',label:'澄清程度',title:'有反應但慢半拍',intro:'跟完全沒反應區分。',questions:['native-306-v2-branch']},
  {id:'native-306-v2-transfer',style:'transfer',label:'換到遊戲',title:'按鍵與跳躍不同步',intro:'把概念用於另一種輸入。',questions:['native-306-v2-transfer']},
  {id:'native-306-v2-speak',style:'speak',label:'口頭強調',title:'延遲很明顯',intro:'先自己說；錄音或跳過後才聽示範。',model:'There’s noticeable input lag.',zh:'輸入延遲很明顯。',speakingPrompt:'客服問延遲是不是肉眼可見；你每次都能看到。先口頭回答。',recording:'phrase',questions:[]},
  {id:'native-306-v2-final',style:'final',label:'剪片挑戰',title:'游標慢半秒',intro:'自己說明延遲與影響。',questions:['native-306-v2-final']}
];
export default {revision:2,summary:'用 input lag 描述操作與畫面反應不同步，並說明延遲程度和影響。',steps,questions,takeaways:['There’s input lag.','There’s noticeable input lag.'],completionTitle:'你能把「游標慢半拍」說成可查的問題。'};
