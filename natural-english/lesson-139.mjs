import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-139-v2-audio','audio','只聽座椅名稱。它主要給哪位客人使用？',['需要獨立高腳椅的幼兒。','想坐高凳的成年人。','已能坐穩普通椅、只需墊高的大孩子。','已長大到可坐普通餐椅的孩子。'],'需要獨立高腳椅的幼兒。','餐廳的 high chair 是給嬰幼兒坐的獨立高腳椅，通常有安全帶或餐盤。'),
  mc('native-139-v2-contrast','contrast','兩歲幼兒坐普通餐椅不安全，需要有餐盤的獨立座椅。你應要哪個？',["a high chair","a booth","a bar stool","an extra cushion"],"a high chair",'high chair 為幼兒設計；booth 和 bar stool 不是同一種安全座椅。'),
  mc('native-139-v2-reverse','reverse','服務生推來一張帶小餐盤、幼兒可以固定坐好的高腳椅。英文標籤應是甚麼？',["high chair","booster seat","child seat","bar stool"],"high chair",'有自己椅腳和餐盤的幼兒座椅是 high chair；booster seat 放在普通椅上墊高。'),
  mc('native-139-v2-tone','tone','帶幼兒入座時，哪句向服務生請求自然有禮？',["Could we get a high chair, please?","Could we have an extra cushion for her?","Could we have a booster seat instead?","Could the baby sit on the bench?"],"Could we get a high chair, please?",'用 could we get 加 please，是簡短明確的餐廳請求。'),
  open('native-139-v2-final','final','最後挑戰：你帶著一歲幼兒去餐廳。服務生問 How many? 寫兩句英文回答人數，並提出需要幼兒高腳椅。',["Three, please. Could we also get a high chair for the baby?","There are two adults and a baby. Could you bring us a high chair, please?"],'交代用餐人數及嬰幼兒座椅需要；high chair 比只說 chair 清楚。')
];
const steps=[
  {id:'native-139-v2-audio',style:'audio',label:'先聽座椅',title:'幼兒坐哪裡？',intro:'只聽餐廳用詞。',model:'high chair',zh:'幼兒高腳椅。',audioOnly:true,questions:['native-139-v2-audio']},
  {id:'native-139-v2-contrast',style:'contrast',label:'看年齡需求',title:'獨立的幼兒椅',intro:'座椅應符合孩子目前的坐法。',questions:['native-139-v2-contrast']},
  {id:'native-139-v2-reverse',style:'reverse',label:'從實物想詞',title:'有餐盤的高腳椅',intro:'依照座椅構造選名稱。',questions:['native-139-v2-reverse']},
  {id:'native-139-v2-tone',style:'tone',label:'禮貌請求',title:'向服務生開口',intro:'選明確而有禮的句子。',questions:['native-139-v2-tone']},
  {id:'native-139-v2-speak',style:'speak',label:'口頭比較',title:'年紀大一點時',intro:'先自己說；錄音或跳過後才聽示範。',model:'High chair or booster seat?',zh:'高腳椅還是增高座椅？',speakingPrompt:'服務生問孩子需要哪種座椅，你想確認兩個選項。先口頭問。',recording:'phrase',questions:[]},
  {id:'native-139-v2-final',style:'final',label:'家庭入座',title:'人數和高腳椅',intro:'自己回答服務生。',questions:['native-139-v2-final']}
];
export default {revision:2,summary:'認識幼兒 high chair，與放在普通椅上的 booster seat 區分，並能禮貌向服務生要求。',steps,questions,takeaways:['high chair','High chair or booster seat?'],completionTitle:'你能為幼兒清楚要求合適的餐廳座椅。'};
