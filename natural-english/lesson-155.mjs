import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-155-v2-audio','audio','只聽對房間的評價。眼前最可能是甚麼情況？',['東西散落各處，很亂。','空氣不流通。','物品都整齊收進櫃子。','房間空氣有些悶。'],'東西散落各處，很亂。','This place is a mess 指整個地方凌亂，不是溫度或空氣問題。'),
  mc('native-155-v2-detail','detail','朋友進門看見衣服在梳化上、書堆在地上、碗留在桌上。哪項證據最支持 mess？',['多種東西沒有收好，散落在不同位置。','桌上只有幾本排好的書。','衣服已收進衣櫃。','紙箱都已堆放整齊。'],'多種東西沒有收好，散落在不同位置。','mess 由物品雜亂、未整理支撐；來客時間本身不是亂的證據。'),
  mc('native-155-v2-scene','scene','你剛搬家，紙箱、衣服和工具都攤在客廳。朋友問 Is it okay if I come in? 哪句最自然？',["Sure, but this place is a mess right now.","Sure, it's nice and airy.","Sure, but it's still a little untidy.","Sure, I've already cleared the boxes from the living room."],"Sure, but this place is a mess right now.",'搬家時物品鋪滿房間，先提醒朋友環境凌亂，和入屋情境直接相關。'),
  mc('native-155-v2-continue','continue','朋友說 Sorry, this place is a mess。你想明確表示自己不介意凌亂，怎樣回應？',["Don't worry about it. Moving is always chaotic.","It's okay; I came a little early.","We can move the boxes out of the way.","I can wait outside while you finish tidying."],"Don't worry about it. Moving is always chaotic.",'對方為凌亂道歉，回應理解與安慰比評論無關的空氣或氣味合適。'),
  open('native-155-v2-final','final','最後挑戰：朋友提早到你家，你還沒收拾，書和衣服都在地上。開門時寫兩句英文歡迎他進來並為凌亂道歉。',["Come on in, but sorry—this place is a mess. I haven't had time to tidy up yet.","You're welcome to come in. Sorry, my room is a mess because I was still cleaning."],'先讓朋友知道可進來，再簡單解釋凌亂；不必把 mess 用來描述房間的空氣。')
];
const steps=[
  {id:'native-155-v2-audio',style:'audio',label:'聽出環境',title:'整間都亂',intro:'聽完後想像朋友進門看到的房間。',model:'This place is a mess.',zh:'這地方亂糟糟。',audioOnly:true,questions:['native-155-v2-audio']},
  {id:'native-155-v2-detail',style:'detail',label:'看見證據',title:'東西散在哪裡？',intro:'連結用詞與可見的雜亂。',questions:['native-155-v2-detail']},
  {id:'native-155-v2-scene',style:'scene',label:'搬家現場',title:'紙箱到處都是',intro:'在朋友上門前自然提醒。',questions:['native-155-v2-scene']},
  {id:'native-155-v2-continue',style:'continue',label:'接住道歉',title:'朋友不用介意',intro:'選一個有同理心的回應。',questions:['native-155-v2-continue']},
  {id:'native-155-v2-speak',style:'speak',label:'口頭描述',title:'自己的房間',intro:'先自己說；錄音或跳過後才聽示範。',model:'My room is a mess.',zh:'我的房間很亂。',speakingPrompt:'你的房間衣物和書籍都沒收好。先口頭描述。',recording:'phrase',questions:[]},
  {id:'native-155-v2-final',style:'final',label:'開門挑戰',title:'朋友提早到了',intro:'自己歡迎朋友並簡短道歉。',questions:['native-155-v2-final']}
];
export default {revision:2,summary:'用 This place is a mess 描述整個地方凌亂，並在朋友上門時自然說明。',steps,questions,takeaways:['This place is a mess.','My room is a mess.'],completionTitle:'你能自然描述房間凌亂，也能得體地招呼來客。'};
