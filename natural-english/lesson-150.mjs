import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-150-v2-audio','audio','只聽水龍頭的狀況。現在最可能看到甚麼？',['水還持續流出。','只有一滴一滴慢慢漏。','水龍頭完全沒有水。','水槽裡的水排得慢。'],'水還持續流出。','still running 指水龍頭仍開著，水在持續流；dripping 才偏向一滴滴漏。'),
  mc('native-150-v2-continue','continue','你提醒室友水龍頭還開著。他說 I thought I turned it off。你想請他現在關掉，怎樣接？',["It’s still running—could you turn it off now?","I thought it was just dripping; is it still flowing?","Maybe the handle didn't turn all the way off.","I can check the handle after I finish this."],"It’s still running—could you turn it off now?",'再指出目前仍在流水，並提出關掉的下一步，直接回應他的誤以為。'),
  mc('native-150-v2-branch','branch','廚房裡是持續水流，室友卻以為只是漏一滴。哪句澄清最清楚？',["It's not just dripping; the faucet is still running.","It's only dripping a little now.","The sink is draining slowly.","The basin is filling because the drain is slow."],"It's not just dripping; the faucet is still running.",'明確對照滴水和持續出水，讓室友知道要立刻關龍頭。'),
  mc('native-150-v2-transfer','transfer','換到浴室：刷牙後沒關好水龍頭，水仍連續流著。哪句適用？',["The bathroom faucet is still running.","The bathroom drain is clogged.","The bathroom faucet is off.","The bathroom faucet is dripping."],"The bathroom faucet is still running.",'同一說法可換到浴室；重點是龍頭仍在持續出水。'),
  open('native-150-v2-final','final','最後挑戰：你在廚房看到室友洗完碗離開，水龍頭仍不停出水。用兩句英文提醒他，並請他關掉。',["The faucet is still running. Could you turn it off, please?","Hey, the tap is still on and water is running. Please turn it off."],'說明是持續流水，不只是滴水，再提出關掉的具體請求。')
];
const steps=[
  {id:'native-150-v2-audio',style:'audio',label:'先聽水聲',title:'龍頭仍開著',intro:'只聽一句描述。',model:'The faucet is still running.',zh:'水龍頭還在流水。',audioOnly:true,questions:['native-150-v2-audio']},
  {id:'native-150-v2-branch',style:'branch',label:'分清水量',title:'不只是滴水',intro:'用水流狀態修正誤會。',questions:['native-150-v2-branch']},
  {id:'native-150-v2-continue',style:'continue',label:'接住室友',title:'以為已關掉',intro:'把提醒推進到關水。',questions:['native-150-v2-continue']},
  {id:'native-150-v2-transfer',style:'transfer',label:'換到浴室',title:'刷牙後也要關',intro:'把說法用在另一個水龍頭。',questions:['native-150-v2-transfer']},
  {id:'native-150-v2-speak',style:'speak',label:'口頭比較',title:'只是一滴滴漏時',intro:'先自己說；錄音或跳過後才聽示範。',model:'The faucet is dripping.',zh:'水龍頭在滴水。',speakingPrompt:'你已關好龍頭，但它仍一滴滴漏水。先口頭描述。',recording:'phrase',questions:[]},
  {id:'native-150-v2-final',style:'final',label:'廚房挑戰',title:'洗碗後忘記關水',intro:'自己提醒室友並請他處理。',questions:['native-150-v2-final']}
];
export default {revision:2,summary:'用 still running 說水龍頭仍持續出水，並與一滴滴漏水區分。',steps,questions,takeaways:['The faucet is still running.','The faucet is dripping.'],completionTitle:'你能清楚提醒別人水龍頭還開著。'};
