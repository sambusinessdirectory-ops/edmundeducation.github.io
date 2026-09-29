import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-019-v2-audio','audio',
    '只聽客人在點餐時補的一句話。他希望食物怎樣改？',
    ['不要放洋蔥。','多加洋蔥。','洋蔥另外裝。','把洋蔥切小。'],
    '不要放洋蔥。',
    'No onions, please. 是請店員不要在餐點裏放洋蔥；不是把洋蔥另外裝。'),
  mc('native-019-v2-detail','detail',
    '你對洋蔥敏感，漢堡不能有洋蔥。菜單寫 onions on the side，這是否符合你的需要？',
    ['不符合；它仍然會附洋蔥，只是另外放。','符合；on the side 一定表示完全不供應。','符合；它會自動把洋蔥換成番茄。','不符合；它表示洋蔥加倍。'],
    '不符合；它仍然會附洋蔥，只是另外放。',
    'on the side 表示另外裝，仍會有洋蔥；你真正需要的是 no onions。'),
  mc('native-019-v2-branch','branch',
    '店員已記下你的芝士漢堡，接着問 Any changes to the burger? 你不要洋蔥，怎樣簡潔地補充？',
    ['No onions, please.','Extra onions, please.','Onions on the side, please.','The onion rings, please.'],
    'No onions, please.',
    'No onions, please. 直接交代要省去的配料；其餘選項都仍會給你洋蔥。'),
  blank('native-019-v2-repair','repair',
    '你原本說 Onions on the side, please.，但其實一點洋蔥都不要。請改成一句簡短、有禮的英文。',
    ['No onions, please.','Without onions, please.','No onion, please.','Without onion, please.'],
    '你要省去配料，不是改變擺放位置。',
    'No onions, please. 表示完全不要洋蔥；Without onions, please. 也自然。'),
  mc('native-019-v2-continue','continue',
    '店員重複確認 No onions, right? 你確實不要洋蔥。哪句最清楚地完成確認？',
    ['That’s right, no onions.','Actually, extra onions.','On the side is fine.','I haven’t decided what to order.'],
    'That’s right, no onions.',
    '店員在核對特殊要求，簡短確認 no onions 可以減少做錯餐點的機會。')
];

const steps=[
  {id:'native-019-v2-audio',style:'audio',label:'先聽要求',title:'客人要刪去哪樣配料？',intro:'只聽聲音，答完才看文字。',model:'No onions, please.',zh:'不要洋蔥，謝謝。',audioOnly:true,questions:['native-019-v2-audio']},
  {id:'native-019-v2-detail',style:'detail',label:'看清意思',title:'另外放仍然會附洋蔥',intro:'先判斷菜單上的處理方式是否真的適合你的需要。',questions:['native-019-v2-detail']},
  {id:'native-019-v2-branch',style:'branch',label:'回應店員',title:'店員問你要不要改漢堡',intro:'直接補充你要省去的配料。',questions:['native-019-v2-branch']},
  {id:'native-019-v2-repair',style:'repair',label:'修正訂單',title:'別說成另外放',intro:'餐點還沒做，趁現在把錯說的要求改正。',questions:['native-019-v2-repair']},
  {id:'native-019-v2-continue',style:'continue',label:'確認訂單',title:'店員覆述後，再核對一次',intro:'把談話接到確認階段，不再只是選最初的點餐句。',questions:['native-019-v2-continue']},
  {id:'native-019-v2-speak',style:'speak',label:'口說點餐',title:'你要一個不加洋蔥的漢堡',intro:'先自己告訴店員；錄音或跳過後才看示範。',model:'No onions, please.',zh:'不要洋蔥，謝謝。',speakingPrompt:'店員：Any changes to your burger? 你不想要洋蔥。',recording:'phrase',questions:[]}
];

export default {revision:2,summary:'在點餐時清楚省去洋蔥，分清不要、另外放和加量，並核對特殊要求。',steps,questions,takeaways:['No onions, please.','No tomatoes, please.'],completionTitle:'你能清楚要求走洋蔥，也能確認店員沒有聽錯了！'};
