import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-090-v2-audio','audio','只聽這句請求。對方需要做甚麼？',
    ['把附近那件東西拿過來。','替說話者一直拿著手上的東西。','把東西放回遠處。','立即修好那件東西。'],
    '把附近那件東西拿過來。','grab that for me 在這裡是請對方順手把那件東西拿給你；不是幫你暫時拿著手上的東西。'),
  mc('native-090-v2-branch','branch','你指著桌上兩支筆說 Can you grab that for me? 對方問 This one? 你指的正是他拿起的那支。怎樣接？',
    ['Yeah, that one. Thanks.','No, I never asked for anything.','You must guess without asking.','Put both pens in the trash.'],
    'Yeah, that one. Thanks.','當 that 的所指有歧義，先確認再道謝，讓對話順暢而不責怪對方。'),
  mc('native-090-v2-tone','tone','你跟不太熟的同事坐在會議桌兩端，遙控器在他手邊。哪句較適合？',
    ['Could you grab the remote for me, please?','Grab it. Now.','Bring me every object on the table.','Hold my bag until tomorrow.'],
    'Could you grab the remote for me, please?','Could you…please? 是有禮的請求；指明 the remote 比只說 that 清楚。'),
  mc('native-090-v2-rewrite','rewrite','原句：Can you hold this for me? 其實東西在對方身後的架上，你想請他拿過來。哪個改寫最準確？',
    ['Can you grab that for me?','Can you hold this steady?','Can you keep this overnight?','Can you leave it there?'],
    'Can you grab that for me?','grab 指去拿並交給你；hold 指拿著或扶著，兩者動作不同。'),
  open('native-090-v2-final','final','最後挑戰：你在做飯，雙手沾著麵粉，量匙在朋友身旁的抽屜。用兩句英文禮貌請朋友把量匙拿給你，並說明你現在不方便自己拿。',
    ["Could you grab the measuring spoon for me, please? My hands are covered in flour.","Can you get me the measuring spoon from that drawer? I've got flour on my hands.","Would you mind grabbing the measuring spoon? I can't open the drawer with flour on my hands."],
    '用 grab 或 get 表示請對方把東西拿來，指明 measuring spoon 或抽屜；再交代為何你無法自己拿。')
];
const steps=[
  {id:'native-090-v2-audio',style:'audio',label:'聽出動作',title:'拿過來，還是拿著？',intro:'先只聽請求，判斷動作。',model:'Can you grab that for me?',zh:'可以幫我拿一下那個嗎？',audioOnly:true,questions:['native-090-v2-audio']},
  {id:'native-090-v2-rewrite',style:'rewrite',label:'把動詞換準',title:'hold 與 grab',intro:'比較前一課的暫時拿著。',questions:['native-090-v2-rewrite']},
  {id:'native-090-v2-branch',style:'branch',label:'指清是哪個',title:'This one?',intro:'學會在有歧義時確認物件。',questions:['native-090-v2-branch']},
  {id:'native-090-v2-speak',style:'speak',label:'當場請求',title:'遙控器在朋友那邊',intro:'先自己說；錄音或跳過後才聽示範。',model:'Can you grab that for me?',zh:'可以幫我拿一下那個嗎？',speakingPrompt:'你指著朋友手邊的遙控器，想請他把那個拿過來。你會怎樣說？',recording:'phrase',questions:[]},
  {id:'native-090-v2-tone',style:'tone',label:'換個說法',title:'會議室的距離',intro:'對不熟的同事說得清楚、有禮。',questions:['native-090-v2-tone']},
  {id:'native-090-v2-final',style:'final',label:'廚房挑戰',title:'手沾麵粉，想拿量匙',intro:'新情境，自己說出請求和原因。',questions:['native-090-v2-final']}
];
export default {revision:2,summary:'用 grab 或 get 請別人拿來附近物品，並分清 hold this 的「暫時拿著」。',steps,questions,takeaways:['Can you grab that for me?','Can you hold this for a second?'],completionTitle:'你能分清拿過來與替你拿著，並把請求說清楚。'};
