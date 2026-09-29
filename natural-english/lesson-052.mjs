import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-052-v2-audio','audio','只聽聚會上一句話。說話者現在打算做甚麼？',
    ['離開聚會。','去另一間房拿食物。','開始一個新話題。','請主人也一起走。'],
    '離開聚會。',"I'm gonna head out. 是口語、友善地表示自己要走了；head out 在這裏不是指出門散步。"),
  mc('native-052-v2-tone','tone','你在朋友家聚會，已到離開時間。哪句語氣自然，不像在下命令或突然失蹤？',
    ["I'm gonna head out. Thanks for having me!","Everyone has to leave now.","I refuse to speak to you again.","I was gone an hour ago."],
    "I'm gonna head out. Thanks for having me!",'先說自己要走，再感謝主人；這是輕鬆聚會中的自然告別。'),
  mc('native-052-v2-branch','branch','主人說 Want another drink? 你不想再喝，準備離開。怎樣同時婉拒和告別？',
    ["No, thanks. I'm gonna head out.","Yes, please. I'll stay all night.","No, thanks. You must leave.","I need a bigger glass."],
    "No, thanks. I'm gonna head out.",'先回應飲品提議，再交代你要離開；主人不會誤以為你只是在拒絕那杯飲料。'),
  mc('native-052-v2-transfer','transfer','原本在朋友家說 I’m gonna head out.。換成正式工作會議結束時，哪句較合適？',
    ['I need to leave now. Thank you for the meeting.','I’m gonna bail on you all.','You people can stay here forever.','Head out, everyone.'],
    'I need to leave now. Thank you for the meeting.','gonna head out 偏輕鬆口語；正式會議可改用較直接、完整的 leave now 加致謝。'),
  blank('native-052-v2-rewrite','rewrite','你原本只傳 Gone. 給朋友，對方不知道你是準備走還是已經走了。你仍在門口，將要離開。改寫成一句自然英文。',
    ["I'm gonna head out.","I'm going to head out.","I'm gonna head out now.","I should get going."],
    '你還在這裏，但現在準備走。',"I'm gonna head out. 表示即將離開；Gone. 容易讓人以為你已經不在。")
];

const steps=[
  {id:'native-052-v2-audio',style:'audio',label:'聽出離意',title:'他要去哪？',intro:'先只聽聲音，判斷是甚麼社交動作。',model:'I’m gonna head out.',zh:'我要先走了。',audioOnly:true,questions:['native-052-v2-audio']},
  {id:'native-052-v2-tone',style:'tone',label:'告別分寸',title:'離開聚會要怎樣說？',intro:'保持友善，也讓主人知道你要走。',questions:['native-052-v2-tone']},
  {id:'native-052-v2-branch',style:'branch',label:'婉拒再喝',title:'主人留你喝多一杯',intro:'回應提議之後，清楚交代離開。',questions:['native-052-v2-branch']},
  {id:'native-052-v2-speak',style:'speak',label:'聚會口說',title:'跟朋友說你要走',intro:'先自己說；錄音或跳過後才聽示範。',model:'I’m gonna head out.',zh:'我要先走了。',speakingPrompt:'朋友問：You leaving already? 你現在準備離開。',recording:'phrase',questions:[]},
  {id:'native-052-v2-transfer',style:'transfer',label:'換正式場合',title:'工作會議的告別',intro:'同樣是離開，場合會影響語氣。',questions:['native-052-v2-transfer']},
  {id:'native-052-v2-rewrite',style:'rewrite',label:'短訊改寫',title:'你還沒走，不要只寫 Gone',intro:'說清楚是現在準備離開。',questions:['native-052-v2-rewrite']}
];

export default {revision:2,summary:'在輕鬆場合自然表達準備離開，回應主人挽留，並按正式程度調整語氣。',steps,questions,takeaways:['I’m gonna head out.','I should get going.'],completionTitle:'你能自然向朋友告別，也懂得在正式場合調整說法了！'};
