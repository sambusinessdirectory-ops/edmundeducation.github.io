import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-031-v2-tone','tone',
    '你在商店慢慢看，店員問 Can I help you find anything? 你暫時不需要幫忙，也不想顯得不耐煩。哪句最貼切？',
    ["I'm just looking, thanks.",'Yes, please find a blue jacket for me.','I want to pay for this now.','Please stop talking to every customer.'],
    "I'm just looking, thanks.",
    'I’m just looking, thanks. 清楚說明目前只是逛逛，也對店員的主動幫忙表示禮貌。'),
  mc('native-031-v2-audio','audio',
    '只聽顧客的一句回應。店員應理解成甚麼？',
    ['顧客暫時自己看看，需要時會再問。','顧客已決定購買。','顧客要求店員立即離開商店。','顧客已找到要試穿的尺寸。'],
    '顧客暫時自己看看，需要時會再問。',
    'I’m just looking, thanks. 拒絕的是「現在就幫忙」，不是拒絕整段之後可能的服務。'),
  blank('native-031-v2-rewrite','rewrite',
    '店員來詢問時，你原本想說 Leave me alone.。你其實只是想自己看看。把回覆改得友善、清楚。',
    ["I'm just looking, thanks.","Thanks, I'm just looking.","I'm just browsing, thanks.","Thanks, I'm just browsing."],
    '交代現在只是看看，並對店員表示謝意。',
    'I’m just looking, thanks. 表明暫時不需要服務，比叫店員走開更合適。'),
  mc('native-031-v2-branch','branch',
    '店員聽完後說 No problem. Let me know if you need anything. 你可以怎樣簡短接話？',
    ['Will do, thanks.','I already paid yesterday.','No, please cancel my order.','I need to return this immediately.'],
    'Will do, thanks.',
    'Will do, thanks. 是自然接住「有需要再告訴我」，也不改變你暫時自己看的決定。'),
  mc('native-031-v2-continue','continue',
    '過了一會兒，你找到喜歡的外套，現在真的想問店員有沒有 M 號。哪句最自然地更新你的需要？',
    ['Actually, do you have this in a medium?',"I'm just looking, thanks.",'No, I still need no help.','Please do not show me that jacket.'],
    'Actually, do you have this in a medium?',
    'actually 可以自然地轉到新的需要；先前說「只是看看」不妨礙你之後再問。')
];

const steps=[
  {id:'native-031-v2-tone',style:'tone',label:'先表達態度',title:'現在只想看看',intro:'你想自己逛，但仍要友善回應店員。',questions:['native-031-v2-tone']},
  {id:'native-031-v2-audio',style:'audio',label:'聽出界線',title:'顧客是永遠不要幫忙嗎？',intro:'先只聽聲音，判斷顧客目前的需要。',model:'I’m just looking, thanks.',zh:'我只是看看，謝謝。',audioOnly:true,questions:['native-031-v2-audio']},
  {id:'native-031-v2-rewrite',style:'rewrite',label:'改寫語氣',title:'不必對店員發脾氣',intro:'把過於尖銳的回覆改得清楚有禮。',questions:['native-031-v2-rewrite']},
  {id:'native-031-v2-branch',style:'branch',label:'禮貌接話',title:'店員讓你慢慢看',intro:'接住對方的禮貌回應，結束這一小段對話。',questions:['native-031-v2-branch']},
  {id:'native-031-v2-continue',style:'continue',label:'需求改變',title:'後來找到喜歡的外套',intro:'一開始只是看看，後來仍可以再提出具體問題。',questions:['native-031-v2-continue']},
  {id:'native-031-v2-speak',style:'speak',label:'當場口說',title:'店員走近時，換你回答',intro:'先自己回應，錄音或跳過後才聽示範。',model:'I’m just looking, thanks.',zh:'我只是看看，謝謝。',speakingPrompt:'店員：Can I help you find anything? 你暫時只想自己看看。',recording:'phrase',questions:[]}
];

export default {revision:2,summary:'在商店友善地說明暫時只想看看，也學會日後需要幫忙時自然地轉回對話。',steps,questions,takeaways:['I’m just looking, thanks.','I’m just looking.'],completionTitle:'你能有禮地婉拒當下的幫忙，需要時也能再開口了！'};
