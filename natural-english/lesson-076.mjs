import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-076-v2-audio','audio','只聽訊息開頭。寄訊息的人主要想做甚麼？',
    ['主動關心對方最近如何。','確認酒店入住時間。','查詢包裹是否寄到。','要求對方報到點名。'],
    '主動關心對方最近如何。','Just checking in. 在朋友之間可以是簡短的關心訊息；不是學校點名。'),
  mc('native-076-v2-scene','scene','朋友最近工作壓力大，你幾天沒聯絡他。哪則訊息較自然地表達關心，並留給他選擇是否回覆？',
    ["Hey, just checking in. How have you been?","Why haven't you replied? Answer me immediately.","I need your work report by noon.","I already know exactly how you feel."],
    "Hey, just checking in. How have you been?",'簡短表明你在關心，提出開放問題；不要求對方立即交代。'),
  mc('native-076-v2-branch','branch','朋友回 I’m hanging in there.。你想提供支持，又不想把對方逼着細說。哪句較好？',
    ["I'm here if you want to talk.","Tell me every detail right now.","Everything must be fine, then.","You are not allowed to be stressed."],
    "I'm here if you want to talk.",'提供可選擇的支持，尊重對方是否想談。'),
  open('native-076-v2-continue','continue','朋友回 Thanks for checking in. I’m doing a bit better. 你要用一句簡短英文接住好消息。',
    ["I'm glad to hear you're doing a bit better.","That's good to hear. Let me know if you need anything.","I'm glad to hear it. Take care."],
    '回應對方透露的「好一點了」即可，不必把關心變成連串追問。'),
  open('native-076-v2-final','final','最後挑戰：同事最近請病假。你想傳一則兩句短訊關心近況，但不問私人病情，也不催他回工作訊息。用英文寫。',
    ["Hi, just checking in. Hope you're feeling a bit better.","Hey, I just wanted to check in on you. Hope you're getting some rest.","Just checking in to see how you're doing. No need to reply right away."],
    '以 checking in 表達關心；用祝福或留白，不要求對方解釋病情或立刻回覆。')
];

const steps=[
  {id:'native-076-v2-audio',style:'audio',label:'聽出用意',title:'這是關心訊息',intro:'先只聽開頭，判斷關係中的目的。',model:'Just checking in.',zh:'只是來關心一下。',audioOnly:true,questions:['native-076-v2-audio']},
  {id:'native-076-v2-scene',style:'scene',label:'主動聯絡',title:'幾天沒聽到朋友消息',intro:'關心不是催促。',questions:['native-076-v2-scene']},
  {id:'native-076-v2-speak',style:'speak',label:'口頭關心',title:'跟朋友說你來問候',intro:'先自己說；錄音或跳過後才聽示範。',model:'I just wanted to check in on you.',zh:'我只是想來關心一下你。',speakingPrompt:'你打電話給最近很忙的朋友，他接了電話。說明你只是想關心他。',recording:'phrase',questions:[]},
  {id:'native-076-v2-branch',style:'branch',label:'接住近況',title:'朋友說還在撐',intro:'提供支持，不要求詳述。',questions:['native-076-v2-branch']},
  {id:'native-076-v2-continue',style:'continue',label:'回應好消息',title:'朋友說好一些了',intro:'用自己的話自然接住。',questions:['native-076-v2-continue']},
  {id:'native-076-v2-final',style:'final',label:'同事短訊',title:'關心但不追問病情',intro:'新情境，自己寫一則有界線的訊息。',questions:['native-076-v2-final']}
];

export default {revision:2,summary:'用 checking in 主動關心近況，並在朋友或同事回覆時尊重對方的界線。',steps,questions,takeaways:['Just checking in.','I just wanted to check in on you.'],completionTitle:'你能主動關心朋友或同事，也會留給對方回覆的空間了！'};
