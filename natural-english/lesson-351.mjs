import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-351-v2-audio','audio','聽完這句廚房描述，鍋裏的水現在怎樣？',['加熱太久，水已完全蒸發。','水滾到從鍋邊溢出。','水仍滿滿一鍋。','水剛倒進鍋。'],'加熱太久，水已完全蒸發。','boiled dry 指液體煮到完全沒有；boiled over 則是滿出鍋。'),
  mc('native-351-v2-explain','explain','為何鍋子 boiled dry 不等於湯 boiled over？',['前者水煮到沒有，後者液體越過鍋邊。','兩者都表示鍋仍裝滿水。','前者只可用於冷水，後者只可用於油。','兩者都表示關火後結冰。'],'前者水煮到沒有，後者液體越過鍋邊。','dry 說明鍋內最後的狀態；over 說明液體從鍋邊流出去。'),
  mc('native-351-v2-transfer','transfer','換到煮雞蛋的小鍋：你忘了關火，回來時水完全沒了。哪句仍合適？',["The pot boiled dry while I was away.","The pot boiled over and spilled water everywhere.","The water is still cold in the pot.","The pan has a loose handle."],"The pot boiled dry while I was away.",'只要加熱把水蒸發至鍋內乾了，換成煮雞蛋的鍋仍可用 boiled dry。'),
  mc('native-351-v2-rewrite','rewrite','室友問爐上為何有焦味。原稿只寫「I forgot the water」。哪句具體說出結果？',["I left the pot on the stove, and it boiled dry.","I filled the pot and turned off the stove.","The soup spilled over the edge.","The kettle is full of cold water."],"I left the pot on the stove, and it boiled dry.",'把忘記關火與水全部煮乾連起來，解釋焦味可能來源。'),
  open('native-351-v2-rewrite-write','rewrite','新情境：你把一鍋水放上爐煮，接電話後忘了它；回來時鍋裏完全乾了。寫兩句英文向室友交代發生甚麼，並說你已關火。',["I forgot the pot on the stove, and it boiled dry. I've turned off the heat now.","All the water boiled away, so the pot boiled dry. I switched the burner off as soon as I noticed.","The pot boiled dry while I was on the phone. The stove is off now."],'自評時看是否說清鍋內水已煮光，不誤寫成液體滿出。')
];
const steps=[
  {id:'native-351-v2-audio',style:'audio',label:'聽出最後狀態',title:'鍋裏還有水嗎？',intro:'聽鍋裏的液體是否已煮到全乾。',model:'The pot boiled dry.',zh:'鍋裏的水煮乾了。',audioOnly:true,questions:['native-351-v2-audio']},
  {id:'native-351-v2-explain',style:'explain',label:'拆解 dry',title:'和 boiled over 不同',intro:'比較兩種加熱後果。',questions:['native-351-v2-explain']},
  {id:'native-351-v2-transfer',style:'transfer',label:'換到煮蛋',title:'忘記關火的水鍋',intro:'把用法移到另一種食物。',questions:['native-351-v2-transfer']},
  {id:'native-351-v2-rewrite',style:'rewrite',label:'說清結果',title:'向室友交代焦味',intro:'把含糊說法改成可理解的經過。',questions:['native-351-v2-rewrite','native-351-v2-rewrite-write']},
  {id:'native-351-v2-speak',style:'speak',label:'口頭報告',title:'水已經煮光',intro:'先自己說；錄音或跳過後才聽示範。',model:'The pot boiled dry.',zh:'鍋裏的水煮乾了。',speakingPrompt:'爐上的鍋加熱太久，現在完全沒有水。向室友簡短報告。',recording:'phrase',questions:[]}
];
export default {revision:2,summary:'用 boiled dry 描述鍋中液體加熱至完全蒸發，並與滿出鍋邊區分。',steps,questions,takeaways:['The pot boiled dry.'],completionTitle:'你能說清鍋子煮乾的結果，也能交代已關火。'};
