import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-072-v2-audio','audio','只聽一句回覆。說話者今晚更可能選擇甚麼？',
    ['留在家。','出去喝一杯。','去機場。','邀所有人到餐廳。'],
    '留在家。',"I don't feel like going out. 表示現在不想外出，不等於永遠都不想見朋友。"),
  mc('native-072-v2-branch','branch','朋友約你今晚去酒吧，你想休息，仍希望下週見面。哪句既拒絕今晚又保留關係？',
    ["I don't feel like going out tonight. Could we meet next week instead?","I never want to see you again.","Sure, I'll go even though I can't.","You shouldn't go out either."],
    "I don't feel like going out tonight. Could we meet next week instead?",'把拒絕限定在今晚，再提出可行的下次見面時間。'),
  mc('native-072-v2-continue','continue','朋友回 No worries. Maybe another time. 你也願意另約，怎樣自然回應？',
    ["Thanks for understanding. Let's plan something next week.","No, stop speaking to me forever.","I already went out with you tonight.","The restaurant is made of wood."],
    "Thanks for understanding. Let's plan something next week.",'對方已接受你今晚不外出的決定；感謝理解並跟進另約即可。'),
  open('native-072-v2-final','final','最後挑戰：同事邀你今晚看電影。你今天累了，想留在家，但週末願意一起去。用兩句英文回覆。',
    ["I don't feel like going out tonight. Could we go this weekend instead?","I'm tired and feel like staying home tonight. Want to go this weekend?","I think I'll stay home tonight. Could we see the movie this weekend?"],
    '把「今晚不想出去」和「週末願意」分開說，對方才不會誤以為你完全拒絕。')
];

const steps=[
  {id:'native-072-v2-audio',style:'audio',label:'聽出意願',title:'今晚要外出嗎？',intro:'先只聽聲音，判斷今晚的選擇。',model:'I don’t feel like going out.',zh:'我今天不想出去。',audioOnly:true,questions:['native-072-v2-audio']},
  {id:'native-072-v2-branch',style:'branch',label:'拒絕今晚',title:'下週仍想見面',intro:'不想外出不必變成拒絕朋友本人。',questions:['native-072-v2-branch']},
  {id:'native-072-v2-speak',style:'speak',label:'即時答覆',title:'朋友約你喝一杯',intro:'先自己說；錄音或跳過後才聽示範。',model:'I don’t feel like going out.',zh:'我不想出去。',speakingPrompt:'朋友：Want to go out tonight? 你今天只想在家休息。',recording:'phrase',questions:[]},
  {id:'native-072-v2-continue',style:'continue',label:'接受體諒',title:'對方說改天吧',intro:'用一句話維持聯絡。',questions:['native-072-v2-continue']},
  {id:'native-072-v2-final',style:'final',label:'電影挑戰',title:'今晚休息，週末可去',intro:'新情境，自己說清時間界線。',questions:['native-072-v2-final']}
];

export default {revision:2,summary:'表達今天不想外出，同時避免把暫時需要休息說成拒絕友誼。',steps,questions,takeaways:['I don’t feel like going out.','I feel like staying home.'],completionTitle:'你能清楚拒絕今晚的邀約，也能自然提出改天見面了！'};
