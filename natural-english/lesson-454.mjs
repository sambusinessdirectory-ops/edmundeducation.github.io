import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-454-v2-audio','audio','只聽杯子的描述。水珠出現在哪裏？',['冰杯的外側。','杯底的飲料裏。','杯蓋裏面。','桌布下面。'],'冰杯的外側。','condensation 指空氣中的水氣遇冷後凝成杯外水珠，不是飲料漏出。'),
  mc('native-454-v2-detail','detail','冰飲放在桌上，杯壁均勻佈滿細小水珠；杯口乾燥。哪個線索最能區分凝結與漏水？',['水珠沿冷的外壁形成，杯口沒有灑出的痕跡。','杯口和杯身都有水。','杯底有一小灘水。','飲料仍然很冰。'],'水珠沿冷的外壁形成，杯口沒有灑出的痕跡。','杯外均勻成珠而杯口乾，支持 condensation；單看杯底水或溫度不能排除灑漏。'),
  mc('native-454-v2-reverse','reverse','朋友問 Why is the outside of the cup wet? 你確定飲料沒灑，怎樣回答原因？',["It's condensation from the cold drink.","The drink spilled down the side.","The cup is cracked near the bottom.","The lid wasn't put on properly."],"It's condensation from the cold drink.",'問題已排除灑漏；冷杯外壁的水氣凝結才是原因。'),
  mc('native-454-v2-explain','explain','這裏 condensation 的意思是甚麼？',['水氣在冷表面變成水珠。','杯中飲料變得更濃。','冰塊融化到飲料裏。','杯子吸收了飲料。'],'水氣在冷表面變成水珠。','凝結發生在杯外表面；它不描述飲料濃度或冰在杯內融化。'),
  mc('native-454-v2-transfer','transfer','從冷藏室拿出玻璃瓶，瓶外慢慢起水珠；你要向同事說明沒有漏。哪句最準？',["There's condensation on the bottle.","The bottle is leaking at the cap.","The bottle is sweating out its contents.","The drink has overflowed."],"There's condensation on the bottle.",'把同一個外壁水珠現象轉到瓶子，仍可用 condensation；其他句子都指飲料流出。'),
  open('native-454-v2-final','final','新場景：冰咖啡杯外面滿是水珠，同伴以為杯子漏了。用兩句英文指出看到甚麼，並解釋不是漏水。',["There's condensation on the cup. The cold drink is making moisture form on the outside; it isn't leaking.","Those droplets are condensation on the cup. The drink hasn't spilled."],'同時點出杯外水珠與原因，避免把 condensation 當作杯內漏出的液體。')
];
const steps=[
  {id:'native-454-v2-audio',style:'audio',label:'先聽水珠',title:'冰杯外面',intro:'只憑聲音判斷位置。',model:'There’s condensation on the cup.',zh:'杯外有凝結的水珠。',audioOnly:true,questions:['native-454-v2-audio']},
  {id:'native-454-v2-detail',style:'detail',label:'找出線索',title:'凝結還是灑漏',intro:'看杯壁與杯口。',questions:['native-454-v2-detail']},
  {id:'native-454-v2-reverse',style:'reverse',label:'回答疑問',title:'外面為何濕了',intro:'由問題回推原因。',model:'Why is the outside of the cup wet?',zh:'杯外為甚麼濕了？',questions:['native-454-v2-reverse']},
  {id:'native-454-v2-explain',style:'explain',label:'理解成因',title:'水從哪裏來',intro:'分清杯外水氣與杯內飲料。',questions:['native-454-v2-explain']},
  {id:'native-454-v2-transfer',style:'transfer',label:'換成玻璃瓶',title:'同樣的水珠',intro:'轉用到另一個冷容器。',questions:['native-454-v2-transfer']},
  {id:'native-454-v2-final',style:'final',label:'自己解釋',title:'不是漏水',intro:'用兩句讓同伴放心。',questions:['native-454-v2-final']}
];
export default {revision:2,summary:'用 condensation 描述冷杯外壁的水珠，並與灑漏區分。',steps,questions,takeaways:['There’s condensation on the cup.','Why is the outside of the cup wet?'],completionTitle:'你能解釋冷杯外的水珠從何而來。'};
