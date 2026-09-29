import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-137-v2-audio','audio','只聽拉鍊的問題。哪項現象最符合？',['拉好後又自己慢慢滑開。','拉鍊完全拉不上去。','拉鍊拉上去時很卡。','拉鍊拉到頂後完全不能動。'],'拉好後又自己慢慢滑開。','keeps coming undone 指反覆失去扣好的狀態，拉鍊原本能拉上。'),
  mc('native-137-v2-detail','detail','哪個觀察最能說明 keeps coming undone 的 keeps？',['每次拉好幾分鐘後又打開。','拉好後整天都保持原位。','拉鍊只在某一段卡住。','昨天拉好後只開了一次。'],'每次拉好幾分鐘後又打開。','keeps 強調問題反覆發生；單次打開不能表達這種持續困擾。'),
  mc('native-137-v2-branch','branch','朋友問 Why do you keep fixing your jacket? 哪句解釋最準確？',["The zipper keeps coming undone.","The zipper is hard to pull up in the first place.","The fabric keeps catching in the zipper.","The zipper is stuck halfway up."],"The zipper keeps coming undone.",'不斷重拉拉鍊，是因為它拉好後又鬆開；這句直接回答反覆動作的原因。'),
  open('native-137-v2-final','final','最後挑戰：你走路時外套拉鍊每隔幾分鐘就自己滑下來，朋友問你為何一直停下。用兩句英文說明問題與可能的打算。',["The zipper keeps coming undone. I may need to get it fixed.","I zip it up, but it keeps sliding open. I'm going to have someone check it."],'指出反覆滑開，而非完全拉不上；再交代準備處理。')
];
const steps=[
  {id:'native-137-v2-audio',style:'audio',label:'先聽故障',title:'拉好又滑開',intro:'先聽拉鍊故障，想想是拉不上還是又滑開。',model:'The zipper keeps coming undone.',zh:'拉鍊總是自己滑開。',audioOnly:true,questions:['native-137-v2-audio']},
  {id:'native-137-v2-detail',style:'detail',label:'聽出反覆',title:'不是只開過一次',intro:'留意 keeps 的時間感。',questions:['native-137-v2-detail']},
  {id:'native-137-v2-branch',style:'branch',label:'回答朋友',title:'為何一直停下？',intro:'把反覆動作連到原因。',questions:['native-137-v2-branch']},
  {id:'native-137-v2-speak',style:'speak',label:'口頭轉用',title:'鞋帶也會鬆',intro:'先自己說；錄音或跳過後才聽示範。',model:'My shoelace came undone.',zh:'我的鞋帶鬆開了。',speakingPrompt:'你的鞋帶突然散開，朋友問你為何停下。先口頭回答。',recording:'phrase',questions:[]},
  {id:'native-137-v2-final',style:'final',label:'外套挑戰',title:'每隔幾分鐘又滑下',intro:'自己說明反覆故障和打算。',questions:['native-137-v2-final']}
];
export default {revision:2,summary:'用 keeps coming undone 描述拉鍊反覆自行滑開，也認識鞋帶鬆開的同一用法。',steps,questions,takeaways:['The zipper keeps coming undone.','My shoelace came undone.'],completionTitle:'你能說清拉鍊反覆滑開的故障。'};
