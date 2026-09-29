import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-053-v2-audio','audio','只聽一句話。說話者覺得現在應該做甚麼？',
    ['是時候離開了。','是時候訂餐了。','應該邀請更多人。','需要再睡一覺。'],
    '是時候離開了。',"I should get going. 是自然表示自己該走了；should 在這裏常帶有時間、安排或責任上的考量。"),
  mc('native-053-v2-detail','detail','訪客說 I should get going. I have an early morning tomorrow.。哪項細節解釋他為何現在走？',
    ['他明天要早起。','他不喜歡主人。','他忘了帶禮物。','他等着外賣到達。'],
    '他明天要早起。','後句交代明天的安排；不要從「該走了」自行推論他不喜歡這次探訪。'),
  mc('native-053-v2-scene','scene','你和朋友聊得很開心，但明早要早起上班。對方問 Want to stay a little longer? 哪句既有禮又忠於實際原因？',
    ["I'd love to, but I should get going. I have an early start tomorrow.","I refuse to stay because you're boring.","Yes, I'll stay until morning despite work.","We should both leave your home."],
    "I'd love to, but I should get going. I have an early start tomorrow.",'先肯定相處，再說自己該走和原因；這比突然消失或編造不滿更自然。'),
  mc('native-053-v2-continue','continue','主人說 Thanks for coming over. 你正要走，哪句可以自然接住道別？',
    ['Thanks for having me. See you soon!','I still need to arrive.','Please leave your home first.','I never came over.'],
    'Thanks for having me. See you soon!','回應主人的感謝，再用 See you soon! 收尾；不用重複多次「我該走了」。'),
  blank('native-053-v2-transfer','transfer','換到電話：已聊很久，你明天要早起，現在要禮貌結束通話。用一句英文說你該走了並交代原因。',
    ["I should get going. I have an early morning tomorrow.","I should get going. I have to get up early tomorrow.","I should go now. I have to get up early tomorrow.","I should get going. I have an early start tomorrow."],
    '先說需要結束，再說明明早的安排。','get going 不只用於走出房門；電話快結束時也能自然表示自己要離開這段談話。')
];

const steps=[
  {id:'native-053-v2-audio',style:'audio',label:'聽出意圖',title:'現在該走了',intro:'先只聽聲音，不看文字。',model:'I should get going.',zh:'我該走了。',audioOnly:true,questions:['native-053-v2-audio']},
  {id:'native-053-v2-detail',style:'detail',label:'找出原因',title:'為何不再逗留？',intro:'從下一句找出真正理由，不自行猜測。',questions:['native-053-v2-detail']},
  {id:'native-053-v2-scene',style:'scene',label:'婉拒多留',title:'明早要早起',intro:'欣賞這次探訪，也需要準時離開。',questions:['native-053-v2-scene']},
  {id:'native-053-v2-speak',style:'speak',label:'口頭告別',title:'告訴朋友你該走',intro:'先自己說；錄音或跳過後才聽示範。',model:'I should get going.',zh:'我該走了。',speakingPrompt:'主人問：Do you want to stay a little longer? 你明早有安排。',recording:'phrase',questions:[]},
  {id:'native-053-v2-continue',style:'continue',label:'接住道別',title:'主人感謝你來',intro:'用一句話把談話自然收好。',questions:['native-053-v2-continue']},
  {id:'native-053-v2-transfer',style:'transfer',label:'電話結尾',title:'把離開說法移到通話',intro:'不再是從朋友家走出去。',questions:['native-053-v2-transfer']}
];

export default {revision:2,summary:'以 I should get going 禮貌結束探訪或通話，並用真實安排解釋離開原因。',steps,questions,takeaways:['I should get going.','I’m gonna head out.'],completionTitle:'你能帶着合適理由、有禮地結束探訪或通話了！'};
