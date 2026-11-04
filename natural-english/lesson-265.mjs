import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-265-v2-audio','audio','聽完這句對陌生人說的話，雙方最可能遇到甚麼？',['對方坐了說話者票上的指定座位。','說話者想請對方替他留座。','說話者想知道座位是否舒服。','對方正在尋找失物。'],'對方坐了說話者票上的指定座位。','I think 緩和提醒，in my seat 指眼前對方坐在自己的座位。'),
  mc('native-265-v2-detail','detail','飛機上你想用這句提醒乘客。哪項資訊最能先核對？',['你登機證上的座位號碼和眼前椅子的號碼。','你的登機時間和飛機餐內容。','對方行李的顏色。','椅背是否可以放後。'],'你登機證上的座位號碼和眼前椅子的號碼。','這句關乎指定座位；先看號碼可避免自己看錯排或座位。'),
  mc('native-265-v2-repair','repair','你原本想說「You stole my seat!」但還未核對對方的票。哪句更合適？',["Excuse me, I think you're in my seat.","Move now; this plane belongs to me.","You definitely took my wallet.","I don't need my assigned seat."],"Excuse me, I think you're in my seat.",'Excuse me 加 I think 留有核對空間，不無根據地指控對方偷座位。'),
  mc('native-265-v2-explain','explain','這句裏的 I think 在提醒別人時有甚麼作用？',['語氣較緩和，也容許雙方核對座位號。','表示說話者不識字。','表示指定座位完全不重要。','要求對方不要再說話。'],'語氣較緩和，也容許雙方核對座位號。','在尚未看對方票前，I think 讓提醒保持禮貌而不失清楚。'),
  mc('native-265-v2-continue','continue','對方聽完問：「What seat do you have?」你票上是 12A。哪個回答能幫大家核對？',["Seat 12A. What does your ticket say?","I haven't bought a ticket.","Any seat will do; forget it.","I want the seat behind the plane."],"Seat 12A. What does your ticket say?",'給出具體票號並請對方也核對，比繼續爭辯有效。'),
  open('native-265-v2-final','final','新情境：在戲院你找到票上寫的 G8，但有人坐在 G8。寫兩句禮貌英文提醒對方，並提出核對票號。',["Excuse me, I think you're in my seat. My ticket says G8—could we check yours?","Hi, I think this is my seat. Could we compare our ticket numbers?","Sorry to bother you, but I think you're in my seat. I have G8 on my ticket."],'自評時看是否禮貌提醒並提供或要求核對座位號，避免直接指控對方故意佔座。')
];
const steps=[
  {id:'native-265-v2-audio',style:'audio',label:'聽出情境',title:'誰坐錯了位置？',intro:'先聽提醒，不看英文句子。',model:'I think you’re in my seat.',zh:'我想你坐了我的位子。',audioOnly:true,questions:['native-265-v2-audio']},
  {id:'native-265-v2-detail',style:'detail',label:'核對票號',title:'先看哪兩個號碼？',intro:'在開口前查證指定座位。',questions:['native-265-v2-detail']},
  {id:'native-265-v2-repair',style:'repair',label:'修正指控',title:'把提醒說得有禮',intro:'對方可能只是看錯號碼。',questions:['native-265-v2-repair']},
  {id:'native-265-v2-explain',style:'explain',label:'解釋語氣',title:'I think 為何有用？',intro:'辨認委婉語氣在這裏的作用。',questions:['native-265-v2-explain']},
  {id:'native-265-v2-continue',style:'continue',label:'接續核對',title:'對方問你的票號',intro:'讓雙方用實際票號解決問題。',questions:['native-265-v2-continue']},
  {id:'native-265-v2-final',style:'final',label:'戲院挑戰',title:'提醒並一起看票',intro:'自己寫兩句，再按示例自評。',questions:['native-265-v2-final']}
];
export default {revision:2,summary:'在指定座位被坐時，用委婉而清楚的提醒與對方核對票號。',steps,questions,takeaways:['I think you’re in my seat.'],completionTitle:'你能禮貌指出座位問題，並用票號迅速核對。'};
