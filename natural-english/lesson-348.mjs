import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-348-v2-audio','audio','聽完這句抱怨，鞋帶怎樣？',['綁好後又反覆鬆開。','鞋帶太短，完全綁不上。','鞋帶被剪斷。','鞋帶始終綁得太緊。'],'綁好後又反覆鬆開。','keep coming undone 指綁結一次又一次地自行鬆開。'),
  mc('native-348-v2-reverse','reverse','你走十步，鞋帶又散了；剛才已重新綁過兩次。哪句準確？',["My shoelaces keep coming undone.","My shoelaces are missing.","My shoes are too small.","My shoelaces are knotted permanently."],"My shoelaces keep coming undone.",'keep 表示問題反覆，coming undone 指原本綁好的結鬆掉。'),
  mc('native-348-v2-rewrite','rewrite','你向朋友說「My shoes are broken」。其實鞋子完好，只是鞋帶結總鬆。怎樣改？',["My shoelaces keep coming undone.","My soles are worn through.","My shoes have holes in them.","The tongues keep sliding sideways."],"My shoelaces keep coming undone.",'鞋子本身沒有破損；這句把問題定位在綁好的鞋帶結反覆鬆開。'),
  mc('native-348-v2-transfer','transfer','外套拉鍊拉好後走一會又自己往下滑。哪句沿用 coming undone 的「反覆鬆開」概念？',["The zipper keeps coming undone.","The jacket keeps getting wet.","The sleeves are too long.","The coat's filling has shifted."],"The zipper keeps coming undone.",'拉鍊反覆開掉可用同一片語；主語換成 zipper。'),
  open('native-348-v2-final','final','新情境：你在公園慢跑，鞋帶綁好後又鬆開兩次。寫兩句英文告訴同伴問題，並說你要停下來打雙結。',["My shoelaces keep coming undone. I'm stopping to tie a double knot.","I tied them twice, but my shoelaces keep coming undone. Let me double-knot them.","My laces keep loosening as I run. I'll stop and tie them more securely."],'自評時看是否表達「綁好後反覆鬆開」，並提出打雙結的下一步。')
];
const steps=[
  {id:'native-348-v2-audio',style:'audio',label:'聽出反覆',title:'綁好後又怎樣？',intro:'聽鞋帶綁好之後是否反覆鬆開。',model:'My shoelaces keep coming undone.',zh:'鞋帶一直自己鬆開。',audioOnly:true,questions:['native-348-v2-audio']},
  {id:'native-348-v2-reverse',style:'reverse',label:'跑步現場',title:'第三次鬆開',intro:'從反覆出現的問題找英文。',questions:['native-348-v2-reverse']},
  {id:'native-348-v2-rewrite',style:'rewrite',label:'定位故障',title:'鞋子沒有壞',intro:'把泛稱鞋壞了改成鞋帶問題。',questions:['native-348-v2-rewrite']},
  {id:'native-348-v2-transfer',style:'transfer',label:'換到拉鍊',title:'另一種反覆鬆開',intro:'把 coming undone 用在衣服。',questions:['native-348-v2-transfer']},
  {id:'native-348-v2-final',style:'final',label:'慢跑挑戰',title:'停下打雙結',intro:'交代鞋帶再次鬆開，並提出打雙結。',questions:['native-348-v2-final']}
];
export default {revision:2,summary:'用 keep coming undone 描述鞋帶綁好後反覆鬆開，並延伸至拉鍊。',steps,questions,takeaways:['My shoelaces keep coming undone.'],completionTitle:'你能說明鞋帶反覆鬆開，也能提出打雙結。'};
