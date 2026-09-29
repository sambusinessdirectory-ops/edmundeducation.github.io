import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-116-v2-audio','audio','只聽水槽的情況。現在最可能看到甚麼？',['水還會流走，但積在盆底一會兒。','水龍頭完全沒有水。','水槽完全堵住，一滴水也排不下。','水槽出水很慢，但排水正常。'],'水還會流走，但積在盆底一會兒。','draining slowly 是排水速度慢，並不表示完全堵塞或水龍頭壞了。'),
  mc('native-116-v2-explain','explain','維修員問「是完全堵住嗎？」哪項描述最能幫他判斷程度？',['水要幾分鐘才排乾，但最後會流走。','水槽水龍頭的水壓變低。','水停下後，盆底仍有一點水。','水槽下方偶爾有一滴水漏出。'],'水要幾分鐘才排乾，但最後會流走。','水仍能排走，說明是 draining slowly；完全停住才更接近 clogged。'),
  mc('native-116-v2-transfer','transfer','酒店浴室洗手盆有同樣問題。哪句向櫃檯說明最清楚？',["The bathroom sink is draining slowly.","The bathroom sink is running slowly.","The bathroom sink won't turn on.","The bathroom sink is dripping from the tap."],"The bathroom sink is draining slowly.",'drain 說排水；run、turn on、drip 會讓人以為是供水或水龍頭問題。'),
  open('native-116-v2-final','final','最後挑戰：你洗碗後，水積在廚房水槽裡，過了三分鐘才排完。給房東寫兩句英文，描述問題及請他檢查排水口。',["The kitchen sink is draining slowly. Could you check the drain?","Water sits in the sink for a few minutes before it drains. Could someone take a look?"],'先說明排水慢的可觀察情況，再提出檢查要求；不要把仍能排走的水說成完全堵死。')
];
const steps=[
  {id:'native-116-v2-audio',style:'audio',label:'聽出程度',title:'水到底排不排？',intro:'先聽，不看句子文字。',model:'The sink is draining slowly.',zh:'水槽排水很慢。',audioOnly:true,questions:['native-116-v2-audio']},
  {id:'native-116-v2-explain',style:'explain',label:'講清程度',title:'慢，還是全堵？',intro:'給維修員一個有用的細節。',questions:['native-116-v2-explain']},
  {id:'native-116-v2-speak',style:'speak',label:'口頭報修',title:'告訴酒店櫃檯',intro:'先自己說；錄音或跳過後才聽示範。',model:'The drain is clogged.',zh:'排水口堵塞了。',speakingPrompt:'浴室水槽已完全不排水。向櫃檯描述問題。',recording:'phrase',questions:[]},
  {id:'native-116-v2-transfer',style:'transfer',label:'換到酒店',title:'洗手盆也會排水慢',intro:'把核心說法換到另一個場景。',questions:['native-116-v2-transfer']},
  {id:'native-116-v2-final',style:'final',label:'房東訊息',title:'描述可觀察的問題',intro:'自己寫完整的報修訊息。',questions:['native-116-v2-final']}
];
export default {revision:2,summary:'說明水槽排水緩慢，並與完全堵塞區分，能準確向維修人員描述。',steps,questions,takeaways:['The sink is draining slowly.','The drain is clogged.'],completionTitle:'你能把「排得慢」與「堵死」說清楚了。'};
