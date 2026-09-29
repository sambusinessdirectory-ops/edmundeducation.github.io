import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'open',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-057-v2-audio','audio','只聽一句點餐話。顧客要薯條扮演甚麼角色？',
    ['主餐旁的配菜。','三文治裏的餡料。','替代三文治的主餐。','飯後甜品。'],
    '主餐旁的配菜。','fries on the side 指薯條作配菜，搭配主要餐點。'),
  mc('native-057-v2-detail','detail','店員問 What would you like with your sandwich? 顧客說 Fries on the side, please. 哪項選擇仍未由這句決定？',
    ['飲品要甚麼。','配菜是不是薯條。','薯條是否和三文治搭配。','顧客有沒有禮貌用語。'],
    '飲品要甚麼。','這句只交代配菜；飲品若未問，仍是另一項選擇。'),
  mc('native-057-v2-repair','repair','你想說薯條是配菜，卻說 I want fries inside my sandwich.。哪句修正了位置與角色？',
    ["I'd like fries on the side.","I'd like fries in the sandwich.","I'd like only a plate of fries.","I'd like no fries at all."],
    "I'd like fries on the side.",'on the side 把薯條放在主餐旁，避免誤解為夾進三文治。'),
  mc('native-057-v2-reverse','reverse','店員問 What would you like on the side? 你想選薯條。哪句最直接？',
    ['Fries, please.','A chicken sandwich, please.','No meal, thanks.','A table by the window.'],
    'Fries, please.','店員已經問配菜，不必再把整個句子重說一次；直接選 fries 自然。'),
  blank('native-057-v2-final','final','最後挑戰：你點雞肉三文治，店員說可選沙律或薯條作配菜。用一句完整英文說你要薯條搭配三文治。',
    ["I'd like the chicken sandwich with fries on the side.","I'll have the chicken sandwich with fries on the side.","I'd like the chicken sandwich and fries on the side.","I would like the chicken sandwich with fries on the side."],
    '同時說主餐和配菜，不要把薯條放進三文治。','with fries on the side 讓店員知道薯條是配菜。')
];

const steps=[
  {id:'native-057-v2-audio',style:'audio',label:'聽出配菜',title:'薯條要放在哪？',intro:'先只聽聲音。',model:'I’d like fries on the side.',zh:'我想要薯條當配菜。',audioOnly:true,questions:['native-057-v2-audio']},
  {id:'native-057-v2-detail',style:'detail',label:'找未選項',title:'飲品仍未決定',intro:'別把配菜回答誤當成整份餐都點完。',questions:['native-057-v2-detail']},
  {id:'native-057-v2-repair',style:'repair',label:'修正位置',title:'不是夾進三文治',intro:'把 inside 改成配菜說法。',questions:['native-057-v2-repair']},
  {id:'native-057-v2-reverse',style:'reverse',label:'即場點餐',title:'店員已問 on the side',intro:'回應當下問的是甚麼。',questions:['native-057-v2-reverse']},
  {id:'native-057-v2-speak',style:'speak',label:'口頭選擇',title:'薯條當配菜',intro:'先自己說；錄音或跳過後才聽示範。',model:'I’d like fries on the side.',zh:'我想要薯條當配菜。',speakingPrompt:'店員：Would you like a side with that? 你選薯條。',recording:'phrase',questions:[]},
  {id:'native-057-v2-final',style:'final',label:'完整點餐',title:'雞肉三文治配薯條',intro:'新情境，不給選項，自己把主餐與配菜說清楚。',questions:['native-057-v2-final']}
];

export default {revision:2,summary:'點餐時用 fries on the side 指薯條作配菜，並按店員已問的內容回答。',steps,questions,takeaways:['fries on the side','I’d like fries on the side.'],completionTitle:'你能準確把薯條點成配菜，也能完整說清主餐了！'};
