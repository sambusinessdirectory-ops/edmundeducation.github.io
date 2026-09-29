import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-134-v2-audio','audio','只聽對食物的判斷。最值得懷疑的是哪類變質？',['含油食物放久後的油饐味。','牛奶放久後變酸。','蔬菜失水變軟。','湯放久後有異味。'],'含油食物放久後的油饐味。','rancid 常用於油脂氧化後的異味，例如舊油、堅果或薯片。'),
  mc('native-134-v2-scene','scene','開封的核桃放在暖櫃裡幾個月，聞到刺鼻的舊油味。哪句最貼切？',["The walnuts smell rancid.","The walnuts smell musty.","The walnuts smell stale.","The walnuts smell sour."],"The walnuts smell rancid.",'核桃含油，久放後的油脂變質可用 rancid；其餘詞描述不同狀態。'),
  mc('native-134-v2-contrast','contrast','鮮奶酸掉了，堅果有油饐味。哪組說法分別最自然？',["The milk has gone bad; the nuts are rancid.","The milk has gone bad; the nuts are stale.","The milk smells sour; the nuts are moldy.","The milk has gone bad; the nuts are musty."],"The milk has gone bad; the nuts are rancid.",'gone bad 泛指食物變壞；rancid 特別適用於油脂變質。'),
  mc('native-134-v2-rewrite','rewrite','你要提醒室友不要用櫃裡那瓶舊油。哪條訊息最有用？',["The cooking oil smells rancid—please use the new bottle instead.","The old oil may still be okay; smell it first.","The cooking oil looks clear, but it smells off.","The cooking oil is past its date; check it first."],"The cooking oil smells rancid—please use the new bottle instead.",'這句指出舊油的油饐氣味，又提供新的一瓶作替代，讓室友知道如何避免誤用。'),
  open('native-134-v2-final','final','最後挑戰：你打開一袋放了很久的薯片，聞到油饐味。朋友要吃，你如何用兩句英文提醒並建議換一袋？',["These chips smell rancid. Let's open a fresh bag instead.","I don't think these are good anymore; the oil smells rancid. Let's get another bag."],'rancid 對準含油食物久放後的變質氣味，再提出簡單替代做法。')
];
const steps=[
  {id:'native-134-v2-audio',style:'audio',label:'聽出變質',title:'是哪種壞味？',intro:'只聽一句食物評價。',model:'It’s rancid.',zh:'有油饐味，變質了。',audioOnly:true,questions:['native-134-v2-audio']},
  {id:'native-134-v2-scene',style:'scene',label:'久放核桃',title:'舊油味從哪來',intro:'把詞放進含油食物。',questions:['native-134-v2-scene']},
  {id:'native-134-v2-contrast',style:'contrast',label:'比較食物',title:'奶酸與油饐',intro:'不同變質用詞有分工。',questions:['native-134-v2-contrast']},
  {id:'native-134-v2-rewrite',style:'rewrite',label:'提醒室友',title:'別用那瓶舊油',intro:'把觀察寫成可行提醒。',questions:['native-134-v2-rewrite']},
  {id:'native-134-v2-speak',style:'speak',label:'口頭比較',title:'牛奶已經變壞',intro:'先自己說；錄音或跳過後才聽示範。',model:'The milk has gone bad.',zh:'牛奶變壞了。',speakingPrompt:'牛奶開封太久，已經酸了。告訴朋友。',recording:'phrase',questions:[]},
  {id:'native-134-v2-final',style:'final',label:'薯片挑戰',title:'換一袋新的',intro:'自己提醒朋友不要吃油饐薯片。',questions:['native-134-v2-final']}
];
export default {revision:2,summary:'用 rancid 描述油脂變質的異味，並與其他食物的一般變壞說法區分。',steps,questions,takeaways:['It’s rancid.','The milk has gone bad.'],completionTitle:'你能辨認油饐味，並準確提醒別人。'};
