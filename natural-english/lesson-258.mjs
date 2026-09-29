import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-258-v2-audio','audio','先聽一句對老房子的描述。木地板最可能有甚麼特徵？',['踩上去會吱嘎作響。','表面濕得打滑。','每塊木板都已脫落。','地板剛上新漆。'],'踩上去會吱嘎作響。','creaky 描述受壓時發出的咯吱聲；與濕滑、脫落或油漆無關。'),
  mc('native-258-v2-scene','scene','半夜你走過走廊，每踏一步都有「吱、嘎」聲。哪句最符合？',['The floorboards are creaky.','The floorboards are slippery.','The floorboards are wet.','The floorboards are stained.'],'The floorboards are creaky.','聲音隨腳步出現是 creaky 的線索；其餘句子描述摩擦或外觀。'),
  mc('native-258-v2-branch','branch','室友問：「What was that sound?」你知道沒有人敲門，只是腳下木板發響。怎樣接話？',["Just the floorboards. They're pretty creaky.","Someone knocked on the front door.","The sink is dripping again.","My phone was ringing."],"Just the floorboards. They're pretty creaky.",'先指出聲源是地板，再用 creaky 解釋聲音；沒有證據支持門、水槽或電話。'),
  mc('native-258-v2-transfer','transfer','這回不談地板：你坐上一張老木椅，椅子承重時也發出咯吱聲。哪句自然沿用這個形容詞？',['This chair is creaky.','This chair is moldy.','This chair is blurry.','This chair is spotty.'],'This chair is creaky.','creaky 可形容椅子等受力時吱嘎作響的物件，不限木地板。'),
  open('native-258-v2-final','final','新情境：你住在舊屋，夜裏走到廚房時吱嘎聲吵醒了朋友。寫兩句英文解釋聲音來源，並表示下次會留意。',["The floorboards are really creaky. I'll try to walk more quietly next time.","Sorry I woke you. The floor creaks whenever I walk through the hall.","It was just the creaky floorboards, not someone at the door. I'll be more careful tonight."],'自評時看是否指出聲音來自踩踏木板，並以第二句回應被吵醒的朋友。')
];
const steps=[
  {id:'native-258-v2-audio',style:'audio',label:'聽出聲音',title:'老地板有甚麼特徵？',intro:'先只聽示範，不看英文。',model:'The floorboards are creaky.',zh:'木地板吱嘎響。',audioOnly:true,questions:['native-258-v2-audio']},
  {id:'native-258-v2-scene',style:'scene',label:'夜裏走廊',title:'每踩一步都發響',intro:'從聲音和動作選最貼切的說法。',questions:['native-258-v2-scene']},
  {id:'native-258-v2-branch',style:'branch',label:'回答室友',title:'聲音從哪裏來？',intro:'用一句話消除對方疑慮。',questions:['native-258-v2-branch']},
  {id:'native-258-v2-transfer',style:'transfer',label:'換到木椅',title:'同一種吱嘎聲',intro:'把形容詞用在另一件受壓作響的物件。',questions:['native-258-v2-transfer']},
  {id:'native-258-v2-final',style:'final',label:'舊屋挑戰',title:'向被吵醒的朋友解釋',intro:'兩句英文，完成後自行比對示例。',questions:['native-258-v2-final']}
];
export default {revision:2,summary:'辨認木地板受踩踏時的吱嘎聲，並把 creaky 用於其他作響的家具。',steps,questions,takeaways:['The floorboards are creaky.'],completionTitle:'你能描述地板吱嘎聲，也能自然解釋聲音來源。'};
