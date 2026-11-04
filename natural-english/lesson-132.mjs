import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-132-v2-audio','audio','只聽結帳問題。錯誤出現在哪一步？',['商品掃描後，系統顯示的價格。','商品原本的標示價。','付款後的信用卡扣款。','銀行重複扣款。'],'商品掃描後，系統顯示的價格。','rang up 指收銀機掃描、登錄商品後顯示的價格。'),
  mc('native-132-v2-tone','tone','標籤 $10，掃描卻顯示 $15。哪句禮貌指出掃描價可能有誤，並請店員核對？',["I think this rang up at the wrong price. Could you check the tag?","Could I see the price tag before I pay?","I think the tag might be $10, but I'm not sure.","Last week this same item cost $10."],"I think this rang up at the wrong price. Could you check the tag?",'指出掃描價格可能有誤，並提出明確、禮貌的核對要求。'),
  mc('native-132-v2-branch','branch','店員問 What price did it ring up at? 螢幕顯示 $15。哪句直接回答？',["It rang up at $15.","It's marked at $10.","The tag says $10, but I haven't checked the register.","I think the tag said $15, though I'm not certain."],"It rang up at $15.",'問題問的是掃描價；標價 $10 是下一個可補充的資訊。'),
  open('native-132-v2-final','final','最後挑戰：你買的水杯標籤寫 $12，收銀機掃描出 $18，你還未付款。向店員寫兩句英文指出差異並請他檢查。',["I think this cup rang up at the wrong price. The tag says $12, but the register shows $18—could you check?","This rang up at $18, although it's marked at $12. Could you take a look before I pay?"],'同時給出標價和掃描價，明確說明錯誤發生在收銀機顯示階段。')
];
const steps=[
  {id:'native-132-v2-audio',style:'audio',label:'聽出階段',title:'掃描後的價錢',intro:'先只聽一句。',model:'It rang up at the wrong price.',zh:'掃描出來的價錢錯了。',audioOnly:true,questions:['native-132-v2-audio']},
  {id:'native-132-v2-tone',style:'tone',label:'禮貌指出',title:'先請店員核對',intro:'價格不一致，選擇有分寸的開場。',questions:['native-132-v2-tone']},
  {id:'native-132-v2-branch',style:'branch',label:'回答追問',title:'掃描顯示多少？',intro:'分清店員問的是標價還是掃描價。',questions:['native-132-v2-branch']},
  {id:'native-132-v2-speak',style:'speak',label:'口頭報價',title:'說出螢幕顯示',intro:'先自己說；錄音或跳過後才聽示範。',model:'It rang up at $15.',zh:'它掃描出十五元。',speakingPrompt:'收銀員問商品掃描出多少，螢幕上是 $15。先口頭回答。',recording:'phrase',questions:[]},
  {id:'native-132-v2-final',style:'final',label:'水杯挑戰',title:'十二變十八',intro:'自己寫明兩個價錢及核對請求。',questions:['native-132-v2-final']}
];
export default {revision:2,summary:'用 rang up at 描述收銀機掃描價，並與商品標示價作比較。',steps,questions,takeaways:['It rang up at the wrong price.','It rang up at $15.'],completionTitle:'你能在付款前說清楚標價與掃描價的差異。'};
