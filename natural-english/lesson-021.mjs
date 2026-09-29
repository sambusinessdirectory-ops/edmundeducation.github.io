import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-021-v2-scene','scene',
    '你點了意粉，店員卻把牛排放到你面前。你想指出送錯餐，哪句最直接又有禮？',
    ["Sorry, I didn't order this.",'Sorry, this is too salty.','Could I get more sauce?','Can I take this home?'],
    "Sorry, I didn't order this.",
    '問題是送來的菜不是你的訂單；I didn’t order this 指出錯誤，Sorry 讓語氣保持有禮。'),
  mc('native-021-v2-audio','audio',
    '只聽客人說一句話。他是在指出哪一種問題？',
    ['送來的不是他點的。','他點的菜味道不好。','餐點還未送到。','他想取消已吃完的餐點。'],
    '送來的不是他點的。',
    'I didn’t order this. 說的是訂單不符；它沒有評論食物味道。'),
  mc('native-021-v2-explain','explain',
    '為甚麼收到錯誤餐點時，I didn’t order this. 比 I don’t like this. 更準確？',
    ['前者指出送錯訂單；後者只說自己不喜歡。','前者說食物太辣；後者說沒有付款。','兩句都表示想多點一份。','前者承認自己點過這道菜。'],
    '前者指出送錯訂單；後者只說自己不喜歡。',
    '要讓店員查核訂單，先說明這不是你點的；味道喜好是另一種問題。'),
  mc('native-021-v2-detail','detail',
    '店員道歉後問 What did you order? 你點的是意粉，不是剛送來的牛排。下一句怎樣回答最有用？',
    ['I ordered the pasta.','I did not enjoy the steak.','I have already paid.','The steak looks good.'],
    'I ordered the pasta.',
    '店員需要查對你原本點的菜，直接說 I ordered the pasta. 才能幫他改正。'),
  blank('native-021-v2-final','final',
    '最後挑戰：你點了冰茶，店員送來檸檬水。先有禮地說這不是你點的，再說出你原本點的是冰茶。寫兩句英文。',
    ["Sorry, I didn't order this. I ordered iced tea.","I didn't order this. I ordered iced tea.","Sorry, this isn't what I ordered. I ordered iced tea.","This isn't what I ordered. I ordered iced tea."],
    '先指出訂單不符，再交代原本的飲品。',
    'Sorry, I didn’t order this. I ordered iced tea. 既指出錯誤，也給店員可核對的資料。')
];

const steps=[
  {id:'native-021-v2-scene',style:'scene',label:'先看餐桌',title:'牛排不是你的意粉',intro:'問題是餐點身分，不是味道。先選合適的說法。',questions:['native-021-v2-scene']},
  {id:'native-021-v2-audio',style:'audio',label:'聽客人說',title:'他在抱怨味道嗎？',intro:'只聽聲音判斷；答完才看逐字稿。',model:'I didn’t order this.',zh:'這不是我點的。',audioOnly:true,questions:['native-021-v2-audio']},
  {id:'native-021-v2-explain',style:'explain',label:'說明差別',title:'送錯與不好吃，是兩種問題',intro:'選出這句話真正在指出的錯誤。',questions:['native-021-v2-explain']},
  {id:'native-021-v2-detail',style:'detail',label:'交代原單',title:'店員追問你點了甚麼',intro:'不要只重複「送錯了」，給店員下一個線索。',questions:['native-021-v2-detail']},
  {id:'native-021-v2-speak',style:'speak',label:'口說更正',title:'店員正在等你的回應',intro:'你面前是沒點過的牛排。先自己說，錄音或跳過後才看示範。',model:'I didn’t order this.',zh:'這不是我點的。',speakingPrompt:'店員：Here’s your steak. 你點的是意粉，想有禮地指出送錯了。',recording:'phrase',questions:[]},
  {id:'native-021-v2-final',style:'final',label:'飲品挑戰',title:'從主菜轉到飲品',intro:'沒有選項；同時說清楚錯誤和原本點的飲品。',questions:['native-021-v2-final']}
];

export default {revision:2,summary:'在餐廳指出送錯餐點，分清訂單不符與味道不好，並交代原本點的項目。',steps,questions,takeaways:['I didn’t order this.','This isn’t what I ordered.'],completionTitle:'你能有禮地指出送錯餐點，並幫店員查對訂單了！'};
