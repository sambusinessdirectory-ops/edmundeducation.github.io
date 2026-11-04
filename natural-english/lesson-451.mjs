import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-451-v2-audio','audio','只聽湯的問題。它是怎樣變得難喝？',['煮的時候鹽加過量。','放太久而變酸。','溫度太低。','水加太多而太淡。'],'煮的時候鹽加過量。','oversalted 說加鹽過多；與食物變壞、太冷或過淡不同。'),
  mc('native-451-v2-detail','detail','你舀一口湯，鹹味蓋過其他味道，但沒有酸臭味。哪個觀察支持 oversalted？',['鹹味明顯過重。','湯放了三天。','湯裡有很多蔬菜。','湯顏色比昨天深。'],'鹹味明顯過重。','判斷是鹽量過多，根據是鹹味強，而非新鮮度或顏色。'),
  mc('native-451-v2-repair','repair','朋友說 The soup went bad，但你剛煮好，只是不小心多加鹽。哪句改得準確？',["The soup is oversalted.","The soup has gone rancid.","The soup is too bland.","The soup is lukewarm."],"The soup is oversalted.",'新煮的湯不是放壞；oversalted 指調味失手。'),
  mc('native-451-v2-tone','tone','你煮的湯太鹹，想向朋友坦白並提出補救。哪句自然？',["I think I oversalted the soup. Let me try to fix it.","You must like very salty soup.","The soup is perfect; don't taste it.","It's your fault for noticing the salt."],"I think I oversalted the soup. Let me try to fix it.",'承認自己的調味失手並提出處理，比否認或責怪客人得體。'),
  mc('native-451-v2-continue','continue','朋友試湯後說 It’s too salty。你想確認程度再處理，怎樣接？',["Is it just a little salty, or hard to eat?","Should I add even more salt?","Do you think it's too cold?","Did you finish the whole bowl?"],"Is it just a little salty, or hard to eat?",'問鹹到甚麼程度，能幫你決定需不需要調整整鍋湯。'),
  open('native-451-v2-final','final','最後挑戰：你剛煮的湯放鹽時手滑，朋友嚐後覺得很鹹。寫兩句英文承認問題，並表示你會想辦法調整。',["I oversalted the soup by mistake. Let me see if I can fix it before we serve it.","Sorry, the soup is too salty because I added too much salt. I'll try to balance it out."],'指出鹽加過量，而非說湯變壞；再提出處理的下一步。')
];
const steps=[
  {id:'native-451-v2-audio',style:'audio',label:'先聽調味',title:'鹽加過頭',intro:'判斷是過鹹還是變質。',model:'The soup is oversalted.',zh:'湯鹽加太多。',audioOnly:true,questions:['native-451-v2-audio']},
  {id:'native-451-v2-detail',style:'detail',label:'嚐出線索',title:'鹹味蓋住其他味',intro:'由味道判斷問題。',questions:['native-451-v2-detail']},
  {id:'native-451-v2-repair',style:'repair',label:'不是放壞',title:'剛煮好的湯',intro:'修正變質的誤會。',model:'The soup is too salty.',zh:'湯太鹹了。',questions:['native-451-v2-repair']},
  {id:'native-451-v2-tone',style:'tone',label:'坦白失手',title:'向朋友說一聲',intro:'承認問題並提出補救。',questions:['native-451-v2-tone']},
  {id:'native-451-v2-continue',style:'continue',label:'了解程度',title:'鹹到不能吃嗎？',intro:'接住朋友的試味反應。',questions:['native-451-v2-continue']},
  {id:'native-451-v2-final',style:'final',label:'餐桌挑戰',title:'自己加多了鹽',intro:'寫清問題與下一步。',questions:['native-451-v2-final']}
];
export default {revision:2,summary:'用 oversalted 說湯調味時鹽加過量，與食物變質區分。',steps,questions,takeaways:['The soup is oversalted.','The soup is too salty.'],completionTitle:'你能坦白說湯太鹹，並提出補救。'};
