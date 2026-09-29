import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-315-v2-audio','audio','只聽冷氣狀況。地板可能怎樣變濕？',['機身附近一滴滴水落下。','只有冷氣附近有一小片水漬。','牆上冷氣附近的水管有水漬。','窗邊結露後有水珠滑下。'],'機身附近一滴滴水落下。','AC is dripping 指冷氣機在滴水，與水龍頭持續流出一股水不同。'),
  mc('native-315-v2-contrast','contrast','牆上的冷氣每隔幾秒掉一滴水；旁邊水龍頭卻整股水沒關。前者怎樣說？',["The AC is dripping.","The faucet is still running.","The drain is clogged.","The AC is making a rattling noise."],"The AC is dripping.",'dripping 對應一滴滴落水；running 指連續水流。'),
  mc('native-315-v2-explain','explain','管理員問 Is the AC leaking badly? 你看到每隔幾秒滴一滴，地板也開始濕。哪個補充最準確？',["It's dripping steadily from the unit, and the floor is getting wet.","It pours out continuously like a tap.","The water is only on the wall, not the floor.","The AC is cooler than usual but not dripping."],"It's dripping steadily from the unit, and the floor is getting wet.",'說出滴水頻率和地板受影響範圍，比籠統說「漏得很嚴重」更可查。'),
  open('native-315-v2-final','final','最後挑戰：酒店房間冷氣開著時每幾秒滴一滴水，正落到桌上的書旁。寫兩句英文向櫃檯說明位置和請求處理。',["The AC is dripping water onto the desk near my book. Could someone come and check it?","The unit keeps dripping every few seconds, and the desk is getting wet. Could you send maintenance?"],'交代滴水來源、落點和頻率，再請櫃檯安排檢查。')
];
const steps=[
  {id:'native-315-v2-audio',style:'audio',label:'先聽水聲',title:'冷氣在滴水',intro:'分清滴水和連續流水。',model:'The AC is dripping.',zh:'冷氣在滴水。',audioOnly:true,questions:['native-315-v2-audio']},
  {id:'native-315-v2-contrast',style:'contrast',label:'比對水流',title:'一滴滴與整股流',intro:'選準滴水來源。',questions:['native-315-v2-contrast']},
  {id:'native-315-v2-explain',style:'explain',label:'描述頻率',title:'幾秒一滴',intro:'讓報修資訊可觀察。',questions:['native-315-v2-explain']},
  {id:'native-315-v2-speak',style:'speak',label:'口頭補充',title:'一直滴個不停',intro:'先自己說；錄音或跳過後才聽示範。',model:'The AC keeps dripping.',zh:'冷氣一直滴水。',speakingPrompt:'維修員問是不是只滴過一次；你看到它一直滴。先口頭回答。',recording:'phrase',questions:[]},
  {id:'native-315-v2-final',style:'final',label:'酒店挑戰',title:'桌面快濕了',intro:'自己報告來源、位置和請求。',questions:['native-315-v2-final']}
];
export default {revision:2,summary:'用 AC is dripping 描述冷氣機一滴滴漏水，並在報修時說出位置與頻率。',steps,questions,takeaways:['The AC is dripping.','The AC keeps dripping.'],completionTitle:'你能清楚報告冷氣滴水及受影響的位置。'};
