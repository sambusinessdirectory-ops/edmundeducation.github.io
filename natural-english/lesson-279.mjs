import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-279-v2-audio','audio','只聽這句緊急通報。家中最可能發生甚麼？',['水管突然裂開，水大量湧出。','水龍頭只是一滴滴漏水。','排水口有少許堵塞。','水壓變得稍低。'],'水管突然裂開，水大量湧出。','burst 指突然破裂；水管爆裂通常比普通滴漏急得多。'),
  mc('native-279-v2-reverse','reverse','浴室牆內突然一聲響，接着地上迅速積水。哪句英文最直接報告原因？',["A pipe burst.","The faucet is dripping.","The drain is slow.","The water pressure is low."],"A pipe burst.",'大量水突然湧出與水管爆裂吻合；其餘描述較輕或不同問題。'),
  mc('native-279-v2-repair','repair','室友看到地板迅速積水，卻只說「There is a little leak」。你已看到水管裂開。怎樣更精確？',["A pipe burst in the bathroom.","The tap needs a new washer.","The floor is slightly damp.","The sink is clogged with hair."],"A pipe burst in the bathroom.",'明確說水管爆裂和位置，有助別人立即處理；little leak 低估了程度。'),
  mc('native-279-v2-branch','branch','室友問：「Is water still coming out?」水仍在噴，你想他去關總掣。哪句最有用？',["Yes. Please shut off the main water valve.","No, the pipe fixed itself.","Let's leave the water running overnight.","The lights are too bright."],"Yes. Please shut off the main water valve.",'先回答仍在出水，再請人關總掣；這是現場最相關的下一步。'),
  mc('native-279-v2-tone','tone','你要致電大廈管理員報告爆管。哪句清楚而不拖延？',["A pipe burst in my kitchen, and water is flooding the floor.","My kitchen has a tiny decorative stain.","Someone may have spilled one drop of water.","I'd like to discuss paint colors next week."],"A pipe burst in my kitchen, and water is flooding the floor.",'通報包含地點、爆管和正在淹水，讓管理員知道問題緊急。'),
  open('native-279-v2-tone-write','tone','新情境：廚房水管突然爆裂，水仍在噴，你打電話給大廈管理員。寫兩句英文說明位置和問題，並要求盡快派人處理。',
    ["A pipe burst in my kitchen, and water is still coming out. Could you send someone urgently?","There's a burst pipe in my kitchen and the floor is flooding. Please send maintenance as soon as possible.","My kitchen pipe has burst. I need help shutting off the water and repairing it."],
    '自評時檢查是否交代地點、爆管和仍在出水，並提出緊急協助請求。')
];
const steps=[
  {id:'native-279-v2-audio',style:'audio',label:'聽出緊急狀況',title:'是滴漏還是爆裂？',intro:'先聽通報，不看英文。',model:'A pipe burst.',zh:'水管爆了。',audioOnly:true,questions:['native-279-v2-audio']},
  {id:'native-279-v2-reverse',style:'reverse',label:'從現場找說法',title:'地板迅速積水',intro:'根據突然大量出水選英文。',questions:['native-279-v2-reverse']},
  {id:'native-279-v2-repair',style:'repair',label:'修正程度',title:'不是小滴漏',intro:'把過輕的描述改得符合現場。',questions:['native-279-v2-repair']},
  {id:'native-279-v2-branch',style:'branch',label:'應急接話',title:'室友問水還在流嗎',intro:'回答當下問題並提出下一步。',questions:['native-279-v2-branch']},
  {id:'native-279-v2-tone',style:'tone',label:'管理員通報',title:'一句話說清位置和程度',intro:'把緊急資訊放在前面。',questions:['native-279-v2-tone','native-279-v2-tone-write']},
  {id:'native-279-v2-speak',style:'speak',label:'即時口說',title:'喊室友來幫忙',intro:'先自己說；錄音或跳過後才聽示範。',model:'A pipe burst.',zh:'水管爆了。',speakingPrompt:'浴室水管突然裂開，大量水湧出。立即告訴室友。',recording:'phrase',questions:[]}
];
export default {revision:2,summary:'用 A pipe burst 通報水管突然破裂，並與普通滴漏區分。',steps,questions,takeaways:['A pipe burst.'],completionTitle:'你能清楚報告爆管，並提出現場最需要的下一步。'};
