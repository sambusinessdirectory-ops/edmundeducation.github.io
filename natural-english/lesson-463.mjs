import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-463-v2-audio','audio','只聽耳環問題。丟失的是哪一件？',['耳針後的小固定塞。','整隻耳環。','耳環前面的寶石。','一對新耳環。'],'耳針後的小固定塞。','earring back 是在耳朵後面固定耳針的小塞子，耳環本身還在。'),
  mc('native-463-v2-contrast','contrast','耳環前面的裝飾和耳針都在，只是固定不住。哪句最準？',["I lost an earring back.","I lost an earring.","My earring broke in half.","The stone fell out of my earring."],"I lost an earring back.",'只缺後塞時用 earring back；lost an earring 會讓人以為整隻不見。'),
  mc('native-463-v2-repair','repair','朋友說 You lost the earring? 你想澄清耳環仍在，只掉了後塞。怎樣答？',["No, I lost the earring back, not the earring.","Yes, the whole earring is missing.","No, the clasp on my necklace came off.","Yes, the stone fell out."],"No, I lost the earring back, not the earring.",'清楚對比後塞與整隻耳環，避免朋友去找錯物件。'),
  mc('native-463-v2-tone','tone','到飾品店想問有沒有替換後塞，怎樣向店員開口最清楚？',["I lost an earring back. Do you sell replacements?","My earrings are no good. Fix them now.","I lost some jewellery. Do you have any?","The earring is gone. Can you sell me the same pair?"],"I lost an earring back. Do you sell replacements?",'點明缺的是可替換的小後塞，店員才知道要找哪類配件。'),
  mc('native-463-v2-rewrite','rewrite','把 I need new earrings 改成你真正需要的物品：耳環還在，只要新的後塞。',["I need some new earring backs.","I need a new pair of earrings.","I need a new earring stone.","I need a new jewellery box."],"I need some new earring backs.",'earring backs 是固定耳針的配件，不必買整對耳環。'),
  open('native-463-v2-final','final','新場景：出門前發現一隻耳環的後塞不見了，耳環本身仍在。寫兩句英文向朋友交代問題和你需要買甚麼。',["I lost an earring back, but I still have the earring. I need to get some new earring backs.","The back of one earring is missing. I'll pick up replacement earring backs."],'分清遺失的是後塞，不是整隻耳環，並說出要買的替換件。')
];
const steps=[
  {id:'native-463-v2-audio',style:'audio',label:'先聽缺件',title:'耳環仍在',intro:'辨認失去的小配件。',model:'I lost an earring back.',zh:'耳環後面的固定塞不見了。',audioOnly:true,questions:['native-463-v2-audio']},
  {id:'native-463-v2-contrast',style:'contrast',label:'分清部件',title:'整隻還是後塞',intro:'從眼前狀況選句子。',questions:['native-463-v2-contrast']},
  {id:'native-463-v2-repair',style:'repair',label:'消除誤會',title:'朋友以為耳環掉了',intro:'具體澄清。',questions:['native-463-v2-repair']},
  {id:'native-463-v2-tone',style:'tone',label:'詢問店員',title:'買替換件',intro:'禮貌說明所需物品。',questions:['native-463-v2-tone']},
  {id:'native-463-v2-rewrite',style:'rewrite',label:'只買後塞',title:'改掉 new earrings',intro:'把需求說精確。',model:'I need some new earring backs.',zh:'我需要新的耳環後塞。',questions:['native-463-v2-rewrite']},
  {id:'native-463-v2-final',style:'final',label:'出門挑戰',title:'耳環無法固定',intro:'寫兩句說問題與需求。',questions:['native-463-v2-final']}
];
export default {revision:2,summary:'用 earring back 指耳針後的小固定塞，與整隻耳環區分。',steps,questions,takeaways:['I lost an earring back.','I need some new earring backs.'],completionTitle:'你能說清楚耳環哪個配件不見了。'};
