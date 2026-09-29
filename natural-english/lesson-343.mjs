import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-343-v2-audio','audio','先聽這句餐桌描述。湯匙怎樣進入碗裏？',['原本擱在碗邊，後來滑了進去。','有人故意用湯匙攪湯。','湯匙從桌上被扔進碗。','湯匙被收進抽屜。'],'原本擱在碗邊，後來滑了進去。','slipped into 指不小心滑進去；句子沒有說有人故意放入。'),
  mc('native-343-v2-rewrite','rewrite','你把湯匙平衡放在碗沿，它滑進熱湯。原稿只說「The spoon is in the bowl」。怎樣補上發生過程？',["The spoon slipped into the bowl.","I stirred the soup with the spoon.","I threw the spoon into the bowl.","The spoon is beside the bowl."],"The spoon slipped into the bowl.",'slipped 表明意外滑入，與故意攪拌或投進去不同。'),
  mc('native-343-v2-tone','tone','朋友問湯匙去哪裏，你剛看到它滑進碗內。哪句自然又不責怪任何人？',["It slipped into the bowl. I'll get another spoon.","You must have thrown it into the soup.","The bowl swallowed it on purpose.","No spoon was ever on the table."],"It slipped into the bowl. I'll get another spoon.",'說出意外過程並提出拿新湯匙，不把責任無端推給朋友。'),
  mc('native-343-v2-explain','explain','為何用 slipped 比 fell 更細緻？',['它帶出湯匙從碗邊滑動進去的路徑。','它表示湯匙完全沒有碰到碗。','它表示有人用力扔下去。','它表示湯匙斷成兩截。'],'它帶出湯匙從碗邊滑動進去的路徑。','fell 可泛指掉下；slipped 更貼合從光滑碗沿滑入的動作。'),
  open('native-343-v2-final','final','新情境：你把小湯匙放在甜品碗邊，一轉身它就整支滑進布丁。寫兩句英文告訴朋友發生甚麼事，並說你要拿新湯匙。',["The spoon slipped into the bowl when I turned away. I'll get a clean one.","My spoon just slid into the pudding. Let me grab another spoon.","I left the spoon on the rim, but it slipped into the bowl. I'll replace it."],'自評時看是否描述從碗沿意外滑入，並交代拿新湯匙的下一步。')
];
const steps=[
  {id:'native-343-v2-audio',style:'audio',label:'聽出動作',title:'湯匙怎樣掉進去？',intro:'聽湯匙是滑進碗裏，還是本來就在裏面。',model:'The spoon slipped into the bowl.',zh:'湯匙滑進碗裏了。',audioOnly:true,questions:['native-343-v2-audio']},
  {id:'native-343-v2-rewrite',style:'rewrite',label:'加上過程',title:'不只是「湯匙在碗裏」',intro:'說清它如何進入碗。',questions:['native-343-v2-rewrite']},
  {id:'native-343-v2-tone',style:'tone',label:'餐桌回應',title:'拿一支新湯匙',intro:'平實說明意外並處理。',questions:['native-343-v2-tone']},
  {id:'native-343-v2-explain',style:'explain',label:'比較動詞',title:'slipped 比 fell 多甚麼？',intro:'從碗沿的動作理解詞義。',questions:['native-343-v2-explain']},
  {id:'native-343-v2-final',style:'final',label:'甜品挑戰',title:'滑進布丁裏',intro:'用兩句英文寫，再自行對照。',questions:['native-343-v2-final']}
];
export default {revision:2,summary:'用 slipped into 說明湯匙從碗沿意外滑入，而不只是指出它最後在碗裏。',steps,questions,takeaways:['The spoon slipped into the bowl.'],completionTitle:'你能說清湯匙滑入碗內的過程，並自然提出處理方法。'};
