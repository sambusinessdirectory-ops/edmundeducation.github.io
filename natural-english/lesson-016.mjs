import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-016-v2-audio','audio',
    '朋友邀請你參加今晚的桌遊。只聽一句回應，說話者的意思是甚麼？',
    ['這次不參加。','會晚一點加入。','想知道遊戲規則。','已答應一定會來。'],
    '這次不參加。',
    'I’ll pass. 是婉拒這一次的提議或邀請，並非說「我要經過」。'),
  mc('native-016-v2-explain','explain',
    '為甚麼朋友說 I’ll pass. 時，不應理解成「他會走過你身旁」？',
    ['前文是在邀請他參加，pass 在這裡是放棄這次機會。','pass 一定指駕照考試及格。','他已說自己在路上。','這句表示他會把球傳給你。'],
    '前文是在邀請他參加，pass 在這裡是放棄這次機會。',
    '同一句話要靠情境判斷；回應邀請時 I’ll pass. 是「這次先不了」。'),
  blank('native-016-v2-rewrite','rewrite',
    '朋友邀你吃辣到你受不了的火鍋。你原本打算回 No, that sounds awful. 請改寫成有禮貌的婉拒，並加上一句謝意。',
    ["I'll pass, but thanks.","Thanks, but I'll pass.","I'll pass, thanks.","No thanks, I'll pass.","No, thanks.","Thanks, but not tonight."],
    '表明這次不參加，再對邀請表示感謝。',
    'Thanks, but I’ll pass. 清楚拒絕，同時保留友善語氣。'),
  mc('native-016-v2-continue','continue',
    '你已婉拒這次邀請，但真心願意以後再參加。哪句補充最能保留這個可能？',
    ['Maybe next time.','Never ask me again.','I already went yesterday.','Please count me in tonight.'],
    'Maybe next time.',
    'Maybe next time. 不承諾一定參加，但友善地表示將來仍有可能。'),
  blank('native-016-v2-final','final',
    '最後挑戰：同事邀你今晚看電影。你已有安排，這次不去，但想禮貌地回應，並表示以後可能再約。寫成兩句英文。',
    ["Thanks, but I'll pass. Maybe next time.","I'll pass, but thanks. Maybe next time.","I'll pass, thanks. Maybe next time.","No thanks, I'll pass. Maybe next time.","Sorry, I have plans tonight. Maybe next time.","Thanks, but I already have plans. Maybe next time.","Thanks, but I can't make it tonight. Maybe next time."],
    '第一句禮貌拒絕這次；第二句保留將來的可能。',
    'Thanks, but I’ll pass. Maybe next time. 既說明這次不去，也沒有把以後的邀請一併拒絕。')
];

const steps=[
  {id:'native-016-v2-audio',style:'audio',label:'先聽決定',title:'這次是去，還是不去？',intro:'只聽聲音先判斷；答完才看逐字稿。',model:"I'll pass.",zh:'這次先不了。',audioOnly:true,questions:['native-016-v2-audio']},
  {id:'native-016-v2-explain',style:'explain',label:'理解語境',title:'同一個 pass，這裡是甚麼意思？',intro:'邀請的上下文比字面翻譯更重要。',questions:['native-016-v2-explain']},
  {id:'native-016-v2-rewrite',style:'rewrite',label:'改寫語氣',title:'拒絕辣火鍋，也可以友善',intro:'把過於尖銳的回覆改成禮貌而清楚的兩個意思。',questions:['native-016-v2-rewrite']},
  {id:'native-016-v2-continue',style:'continue',label:'留下空間',title:'這次不去，以後可以',intro:'選一句不作承諾、也不把門關死的補充。',questions:['native-016-v2-continue']},
  {id:'native-016-v2-speak',style:'speak',label:'即時婉拒',title:'朋友邀請，換你開口',intro:'先自己回應；錄音或跳過後才聽示範。',model:"I'll pass.",zh:'這次先不了。',speakingPrompt:'朋友：Want to join us for karaoke tonight? 你今晚不想去，請友善回應。',recording:'phrase',questions:[]},
  {id:'native-016-v2-final',style:'final',label:'兩句挑戰',title:'婉拒今天，保留下一次',intro:'沒有選項，用兩句話同時處理禮貌和將來的可能。',questions:['native-016-v2-final']}
];

export default {revision:2,summary:'用 I’ll pass. 婉拒這次提議，必要時加 thanks 和 Maybe next time. 調整語氣。',steps,questions,takeaways:["I'll pass.",'Maybe next time.'],completionTitle:'你能有禮地婉拒，也能保留以後的可能了！'};
