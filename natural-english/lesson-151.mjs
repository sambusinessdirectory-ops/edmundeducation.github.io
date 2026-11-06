import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-151-v2-audio','audio','只聽這句提醒。當下最需要做甚麼？',['把還在流的水關掉。','等水槽慢慢排水。','看一下洗手盆有沒有堵塞。','擦乾洗手盆旁的水。'],'把還在流的水關掉。','water’s still running 指水尚未停，常是龍頭忘了關。'),
  mc('native-151-v2-detail','detail','室友在刷牙後離開，浴室裡仍聽見連續水聲。哪個細節支持這句提醒？',['水從龍頭一直流進洗手盆。','水龍頭雖關了，仍偶爾滴下一滴。','洗手盆排水很慢，水面暫時積著。','水龍頭把手還沒完全扭緊。'],'水從龍頭一直流進洗手盆。','持續流出的水正對應 running，不是只見到濕物或霧氣。'),
  mc('native-151-v2-tone','tone','你想直接說明水還在流，又不責怪室友。哪句最合適？',["Hey, the water's still running.","Did you mean to leave the tap on?","I think the tap might still be open.","The tap may be dripping a little."],"Hey, the water's still running.",'先指出現況而非猜測對方用意，讓他容易立即關水。'),
  mc('native-151-v2-explain','explain','哪個理解最能分清 the water’s still running 與 the faucet is dripping？',['前者說持續水流；後者通常是關後一滴滴漏。','前者偏向流個不停，後者可能是關緊後仍漏水。','前者可說水仍流出，後者特別指一滴滴落下。','前者表示水仍開著，後者表示水已完全停止。'],'前者說持續水流；後者通常是關後一滴滴漏。','running 的水流通常比 dripping 連續且明顯，處理方式也可能不同。'),
  open('native-151-v2-final','final','最後挑戰：朋友洗手後匆匆走開，水還從浴室龍頭連續流出。寫兩句英文提醒他，並回應他說「我忘記了」。',["The water's still running in the bathroom. No worries—could you turn it off now?","Hey, the faucet is still running. That's okay; please shut it off when you go back."],'先說清水仍在流，再用平和語氣要求關掉；不必指責忘記的人。')
];
const steps=[
  {id:'native-151-v2-audio',style:'audio',label:'聽出水聲',title:'水還沒停',intro:'只聽一句提醒。',model:'The water’s still running.',zh:'水還在流。',audioOnly:true,questions:['native-151-v2-audio']},
  {id:'native-151-v2-detail',style:'detail',label:'找出證據',title:'連續水聲從哪來',intro:'把說法連到眼前現象。',questions:['native-151-v2-detail']},
  {id:'native-151-v2-tone',style:'tone',label:'友善提醒',title:'先說現況',intro:'選不帶責備的語氣。',questions:['native-151-v2-tone']},
  {id:'native-151-v2-explain',style:'explain',label:'比較水量',title:'流著與滴著',intro:'看兩句話有何不同。',questions:['native-151-v2-explain']},
  {id:'native-151-v2-speak',style:'speak',label:'口頭轉說',title:'指出水龍頭',intro:'先自己說；錄音或跳過後才聽示範。',model:'The faucet is still running.',zh:'水龍頭還在流水。',speakingPrompt:'你想更明確說明是哪個地方在流水。先提醒朋友。',recording:'phrase',questions:[]},
  {id:'native-151-v2-final',style:'final',label:'浴室挑戰',title:'他說忘記關',intro:'自己提醒並作平和回應。',questions:['native-151-v2-final']}
];
export default {revision:2,summary:'用 The water’s still running 提醒水仍持續流出，並以平和語氣請人關掉。',steps,questions,takeaways:['The water’s still running.','The faucet is still running.'],completionTitle:'你能清楚而自然地提醒別人關掉流水。'};
