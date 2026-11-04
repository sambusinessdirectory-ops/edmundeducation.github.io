import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-340-v2-audio','audio','只聽這句話。塑膠盒蓋現在是甚麼狀態？',
    ['壓下去也扣不緊。','已經啪一聲扣緊。','盒底裂成兩半。','蓋子完全不見了。'],
    '壓下去也扣不緊。','won’t snap shut 指蓋子不能扣到位；不一定代表蓋子裂了或遺失。'),
  mc('native-340-v2-detail','detail','你按下盒蓋四邊，但其中一邊一直彈起，沒有扣住。哪句最貼近？',
    ["The lid won’t snap shut.","The lid snapped shut.","The lid has gone missing.","The food inside has leaked out."],
    "The lid won’t snap shut.",'問題是蓋子未能扣合；snapped shut 反而表示已經扣好。'),
  mc('native-340-v2-contrast','contrast','朋友說 The lid snapped shut。你再看盒蓋，哪個觀察才支持這句話？',
    ['邊緣都已卡到位，輕提蓋子也不會鬆開。','一角持續翹起，輕碰便打開。','蓋子尺寸根本不合。','蓋子已丟在垃圾桶。'],
    '邊緣都已卡到位，輕提蓋子也不會鬆開。','snapped shut 說的是成功扣合，與 won’t snap shut 的失敗狀態相反。'),
  mc('native-340-v2-branch','branch','你正要把湯盒放進袋，蓋子扣不上。朋友問 Is it sealed? 哪句回答最合適？',
    ["Not yet. The lid won’t snap shut, so I shouldn’t put it in the bag.","Yes, it’s sealed, even though the lid keeps popping up.","I don’t know; the box is made of plastic.","It was sealed last week, so it must be sealed now."],
    "Not yet. The lid won’t snap shut, so I shouldn’t put it in the bag.",'蓋子未扣好時，不宜說盒子已密封；回應亦說明放入袋前要處理。'),
  open('native-340-v2-final','final','最後挑戰：你準備把一盒湯放進背包，但壓下塑膠盒蓋後一角仍會彈起。用兩句英文告訴朋友蓋子的問題，並說你會先做甚麼。',
    ["The lid won’t snap shut, and one corner keeps popping up. I’ll try another container before putting the soup in my bag.","I can’t get the lid to snap shut. I’ll transfer the soup to a different box.","This lid isn’t closing securely. I’ll find another container so the soup doesn’t spill."],
    '指出沒有扣到位和一角彈起；先換盒或處理好蓋子，才放進背包。')
];
const steps=[
  {id:'native-340-v2-audio',style:'audio',label:'聽出結果',title:'蓋子未扣緊',intro:'先聽盒蓋的狀態。',model:'The lid won’t snap shut.',zh:'蓋子怎樣也扣不上。',audioOnly:true,questions:['native-340-v2-audio']},
  {id:'native-340-v2-detail',style:'detail',label:'看盒蓋邊角',title:'一邊仍會彈起',intro:'選描述扣合失敗的句子。',questions:['native-340-v2-detail']},
  {id:'native-340-v2-contrast',style:'contrast',label:'比較相反狀態',title:'snapped shut 是扣好了',intro:'有沒有 won’t，意思差很多。',questions:['native-340-v2-contrast']},
  {id:'native-340-v2-branch',style:'branch',label:'回答密封問題',title:'裝湯之前再檢查',intro:'朋友問盒子能否放進袋。',questions:['native-340-v2-branch']},
  {id:'native-340-v2-speak',style:'speak',label:'廚房口說',title:'告知蓋子扣不上',intro:'先自己說；錄音或跳過後才聽示範。',model:'The lid won’t snap shut.',zh:'蓋子怎樣也扣不上。',speakingPrompt:'塑膠盒蓋一角一直彈起；你要提醒朋友。',recording:'phrase',questions:[]},
  {id:'native-340-v2-final',style:'final',label:'帶湯挑戰',title:'先解決密封問題',intro:'自行寫兩句，交代問題和處理。',questions:['native-340-v2-final']}
];
export default {revision:2,summary:'分清 lid won’t snap shut 與 snapped shut，描述塑膠盒蓋未扣到位。',steps,questions,takeaways:['The lid won’t snap shut.','The lid snapped shut.'],completionTitle:'你能說明盒蓋未扣好，並在攜帶湯前提出安全處理。'};
