import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-369-v2-audio','audio','聽完這句天氣描述，遠處最可能看起來怎樣？',['因煙霧等微粒而灰濛濛。','被厚厚的清晨霧完全遮住。','天空清晰透亮。','正下着大顆冰雹。'],'因煙霧等微粒而灰濛濛。','hazy 指灰濛、能見度下降；在此語境可由煙霧或污染造成。'),
  mc('native-369-v2-detail','detail','你從窗看遠方山樓：輪廓仍看得到，但像隔着灰色薄紗；新聞提到附近煙霧。哪個判斷貼切？',["It looks hazy from the smoke.","It's completely clear outside.","The mountains have disappeared physically.","Heavy snow covers every building."],"It looks hazy from the smoke.",'仍可見輪廓但灰濛，並有煙霧線索；不像厚霧完全遮蔽。'),
  mc('native-369-v2-reverse','reverse','朋友說「It’s hazy」。哪個觀察最支持這句？',['遠景模糊泛灰，空中似有微粒。','近處草地有露水但遠景清楚。','窗玻璃本身沾污，戶外清晰。','房間燈光偏黃。'],'遠景模糊泛灰，空中似有微粒。','hazy 描述空氣令遠景看不清；單一窗玻璃污漬不是戶外空氣問題。'),
  open('native-369-v2-transfer-write','transfer','新情境：你到另一座城市，午間天空因遠處山火煙霧顯得灰濛，但不是厚霧。寫兩句英文向朋友描述視野，並說出可能原因。',["It's hazy today, and the distant buildings look gray. I think the smoke may be affecting visibility.","The view is hazy even though it's midday. It may be from the wildfire smoke nearby.","I can still see the hills, but they look hazy. The smoke in the air could be the cause."],'自評時看是否描述灰濛視野，並把煙霧原因表述為有根據的推測。')
];
const steps=[
  {id:'native-369-v2-audio',style:'audio',label:'聽出能見度',title:'遠處為何灰濛？',intro:'聽遠景灰濛是否來自空氣，而非玻璃。',model:'It’s hazy.',zh:'外面灰濛濛。',audioOnly:true,questions:['native-369-v2-audio']},
  {id:'native-369-v2-detail',style:'detail',label:'看遠景',title:'仍見輪廓卻不清楚',intro:'用視野和煙霧線索判斷。',questions:['native-369-v2-detail']},
  {id:'native-369-v2-reverse',style:'reverse',label:'由詞找證據',title:'是空氣，不是窗玻璃',intro:'分開戶外灰濛和近處污漬。',questions:['native-369-v2-reverse']},
  {id:'native-369-v2-transfer',style:'transfer',label:'換座城市',title:'山火煙霧下的午間',intro:'獨立寫兩句描述灰濛視野。',questions:['native-369-v2-transfer-write']},
  {id:'native-369-v2-speak',style:'speak',label:'口頭描述',title:'今天看不清遠處',intro:'先自己說；錄音或跳過後才聽示範。',model:'It’s hazy.',zh:'外面灰濛濛。',speakingPrompt:'遠處大樓輪廓灰濛，空氣裏似有煙霧。簡短描述。',recording:'phrase',questions:[]}
];
export default {revision:2,summary:'用 hazy 描述煙霧或污染令遠景灰濛，並與單純玻璃污漬區分。',steps,questions,takeaways:['It’s hazy.'],completionTitle:'你能描述灰濛能見度，並說明可能的煙霧來源。'};
