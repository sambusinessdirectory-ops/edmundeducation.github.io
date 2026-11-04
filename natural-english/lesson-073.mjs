import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-073-v2-audio','audio','只聽一句話。說話者最直接表達甚麼？',
    ['現在沒有做那件事的興致。','他已經答應參加。','他很想吃披薩。','他要求別人改變心情。'],
    '現在沒有做那件事的興致。',"I'm not in the mood. 表示當下沒那份興致；單憑這句不能斷定他為何如此或是否生氣。"),
  mc('native-073-v2-tone','tone','朋友邀你去唱歌，你只是今天提不起勁，並非討厭對方。哪句分寸最準確？',
    ["I'm not really in the mood for karaoke tonight.","I hate spending time with you.","I never want to sing again.","You should cancel the whole party."],
    "I'm not really in the mood for karaoke tonight.",'not really 和 tonight 把拒絕限定在當下活動，避免誤傷朋友。'),
  mc('native-073-v2-explain','tone','朋友只說 I’m not in the mood.。你為甚麼不該立即回答 You must be angry with me? ',
    ['這句只說當下沒興致，沒有交代原因。','這句必然表示對方已生氣。','這句必然是身體不舒服。','這句表示他明天會去。'],
    '這句只說當下沒興致，沒有交代原因。','沒有興致可能因疲累、心事或單純不想參與；不要替對方下結論。'),
  open('native-073-v2-rewrite','rewrite','你只回朋友 No.，想改成較有禮的說法：今晚沒有心情去看電影，但不是拒絕以後再看。',
    ["I'm not really in the mood for a movie tonight. Maybe another day?","I don't feel like watching a movie tonight. Could we go another time?","I'm not in the mood tonight, but I'd be up for it another day."],
    '把拒絕限定在今晚，並提供另約可能，朋友較不會誤會你拒絕他本人。'),
  open('native-073-v2-final','final','最後挑戰：朋友邀你參加今晚的熱鬧聚會。你心情不太對，想在家安靜一晚，又不想被追問原因。寫兩句有界線而友善的英文回覆。',
    ["I'm not really in the mood for a party tonight. Thanks for inviting me, though.","I think I'll stay in tonight. Thanks for thinking of me.","I'm not up for a party tonight, but I appreciate the invitation."],
    '你可以拒絕並感謝邀請，不必交代私人原因；not in the mood 也不用被解讀成生氣。')
];

const steps=[
  {id:'native-073-v2-audio',style:'audio',label:'聽出興致',title:'現在沒有心情',intro:'先只聽一句，不猜原因。',model:'I’m not in the mood.',zh:'我現在沒那個心情。',audioOnly:true,questions:['native-073-v2-audio']},
  {id:'native-073-v2-tone',style:'tone',label:'語氣分寸',title:'不是討厭朋友',intro:'把拒絕限於今晚和活動。',questions:['native-073-v2-tone','native-073-v2-explain']},
  {id:'native-073-v2-speak',style:'speak',label:'即時口說',title:'朋友邀你去唱歌',intro:'先自己說；錄音或跳過後才聽示範。',model:'I’m not in the mood.',zh:'我現在沒有心情。',speakingPrompt:'朋友問：Want to go out tonight? 你今天提不起勁。',recording:'phrase',questions:[]},
  {id:'native-073-v2-rewrite',style:'rewrite',label:'改寫拒絕',title:'No. 太短了',intro:'既說出當下心情，也保留改天的可能。',questions:['native-073-v2-rewrite']},
  {id:'native-073-v2-final',style:'final',label:'聚會挑戰',title:'想在家安靜一晚',intro:'新情境，自己設定界線而不用解釋私人原因。',questions:['native-073-v2-final']}
];

export default {revision:2,summary:'用 I’m not in the mood. 表達當下沒興致，避免把暫時拒絕誤說成對人的否定。',steps,questions,takeaways:['I’m not in the mood.','I’m in the mood for pizza.'],completionTitle:'你能有分寸地說出今天沒心情，也懂得不替別人猜原因了！'};
