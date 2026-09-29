import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-316-v2-audio','audio','只聽這句身體感覺。說話者想指出甚麼？',['某個具體位置突然很癢。','手臂某一處輕微刺痛。','皮膚某一處有紅點，但不癢。','整條手臂都在癢。'],'某個具體位置突然很癢。','I’ve got an itch here 用 here 指出發癢位置；itch 是癢感。'),
  mc('native-316-v2-detail','detail','朋友問 Where exactly? 你指著手肘內側。哪個細節能讓對方找到位置？',['就在手肘內側的一小塊。','整條手臂都沒有感覺。','手肘附近有一小片紅點。','衣袖蓋住手肘內側，朋友看不見。'],'就在手肘內側的一小塊。','問題問的是癢的位置；用部位加範圍，比只說「這裡」清楚。'),
  mc('native-316-v2-contrast','contrast','你只想說「我的手臂很癢」，而非特意指一個小點。哪句更直接？',["My arm itches.","I've got an itch right here.","My arm feels sore.","The skin on my arm feels dry."],"My arm itches.",'My arm itches 概括整條手臂；here 更適合配手勢指出小範圍。'),
  mc('native-316-v2-tone','tone','朋友問你為何一直抓手臂。你還不知原因，哪句較審慎？',["I've got an itch right here, but I'm not sure why.","Maybe a mosquito bit me, but I didn't see one.","My arm feels dry all over.","My sleeve may be rubbing this spot."],"I've got an itch right here, but I'm not sure why.",'只說確定的癢感與位置，不把蚊叮或衣服刺激當成已證實。'),
  open('native-316-v2-rewrite','rewrite','你在背部一小處突然很癢，自己看不到，也不知道原因。寫兩句英文告訴朋友位置並請他幫你看看。',["I've got an itch on my back, just below my shoulder. Could you check if there's anything there?","My back itches in one spot near my shoulder blade. Can you take a look?"],'指出具體部位，並在原因未知時只請朋友觀察，不要斷定是甚麼造成。')
];
const steps=[
  {id:'native-316-v2-audio',style:'audio',label:'先聽感覺',title:'這裡突然癢',intro:'聽出是癢、痛還是麻。',model:'I’ve got an itch here.',zh:'我這裡很癢。',audioOnly:true,questions:['native-316-v2-audio']},
  {id:'native-316-v2-detail',style:'detail',label:'指出位置',title:'手肘內側',intro:'讓別人找到發癢的地方。',questions:['native-316-v2-detail']},
  {id:'native-316-v2-contrast',style:'contrast',label:'整條還是一點',title:'手臂很癢',intro:'依範圍選說法。',model:'My arm itches.',zh:'我的手臂很癢。',questions:['native-316-v2-contrast']},
  {id:'native-316-v2-tone',style:'tone',label:'不亂猜原因',title:'還不知道為甚麼',intro:'只描述確知的感覺。',questions:['native-316-v2-tone']},
  {id:'native-316-v2-rewrite',style:'rewrite',label:'請朋友看看',title:'背上那一小處',intro:'自己說明位置和請求。',questions:['native-316-v2-rewrite']}
];
export default {revision:2,summary:'用 itch 描述局部癢感，並能指出位置而不武斷猜測原因。',steps,questions,takeaways:['I’ve got an itch here.','My arm itches.'],completionTitle:'你能說清楚哪裡癢，也能請人幫忙看看。'};
