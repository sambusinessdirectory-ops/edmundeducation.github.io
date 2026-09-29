import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-385-v2-audio','audio','聽完後，桌面留下甚麼痕跡？',['杯子留下的圓形水印。','桌子被切出一道長裂縫。','咖啡灑滿整張桌子。','桌面塗層整片剝落。'],'杯子留下的圓形水印。','water ring 是杯底水分在桌面留下的環形印，不是整片濕透。'),
  mc('native-385-v2-explain','explain','為甚麼這裏用 ring 而不只說 water？',['因為痕跡呈杯底形狀的圓圈。','因為桌上放了一枚戒指。','因為桌子會發出鈴聲。','因為桌面完全浸在水裏。'],'因為痕跡呈杯底形狀的圓圈。','ring 在此指圓圈形狀，具體描述杯子拿走後留下的印。'),
  mc('native-385-v2-branch','branch','移開冷飲杯後，木桌面多了一個白色圓圈。哪句最準確？',["There's a water ring on the table.","There's a crack across the table.","The whole table is soaking wet.","There's a scratch from a knife on the table."],"There's a water ring on the table.",'白色圓圈與杯底對應，是 water ring；裂縫、刀痕和整桌濕都改變了痕跡。'),
  open('native-385-v2-transfer','transfer','新情境：你借用朋友的木桌放冰飲，拿起杯子後看到白色圓圈。寫兩句英文告訴朋友你看到甚麼，並為此道歉。',["There's a water ring on your wooden table where I put my drink. I'm sorry I didn't use a coaster.","I left a pale water ring on the table with my cold glass. I'm sorry about the mark.","I can see a white ring where my glass was sitting. I'm sorry I put it directly on the wood."],'自評時要說清圓形水印及其與杯子的關係，道歉要對應你的行為。'),
  open('native-385-v2-final','final','另一個新情境：聚會後整理桌面，你發現幾個杯底圓印，想請朋友拿杯墊。寫兩句英文描述發現並提出請求。',["There are a few water rings on the wooden table. Could we use coasters for the drinks from now on?","I found several pale rings where the glasses were sitting. Can you put a coaster under your cup?","The cups have left water rings on the table. Let's use these coasters for the rest of the party."],'自評時用 water rings 表示多個圓印，並把請求明確連到杯墊。')
];
const steps=[
  {id:'native-385-v2-audio',style:'audio',label:'聽痕跡形狀',title:'杯子拿走後剩甚麼？',intro:'留意桌面留下的是一圈印，不是整面水。',model:'There’s a water ring on the table.',zh:'桌上有一個杯底水印。',audioOnly:true,questions:['native-385-v2-audio']},
  {id:'native-385-v2-explain',style:'explain',label:'理解 ring',title:'不是戒指',intro:'從杯底形狀理解 water ring。',questions:['native-385-v2-explain']},
  {id:'native-385-v2-branch',style:'branch',label:'木桌白圈',title:'依外觀選句',intro:'辨認圓印、裂縫與刮痕。',questions:['native-385-v2-branch']},
  {id:'native-385-v2-transfer',style:'transfer',label:'向朋友道歉',title:'說明水印來源',intro:'描述看見的白圈，再承擔放杯子的責任。',questions:['native-385-v2-transfer']},
  {id:'native-385-v2-final',style:'final',label:'聚會後新情境',title:'多個水印與杯墊',intro:'用兩句把多個印和下一步連起來。',questions:['native-385-v2-final']}
];
export default {revision:2,summary:'用 water ring 描述杯底在桌面留下的圓形水印。',steps,questions,takeaways:['There’s a water ring on the table.'],completionTitle:'你能指出杯底水印並提出合適請求。'};
