const mc=(id,style,prompt,options,answer,explanation)=>({id,type:'mc',style,prompt,options,answers:[answer],explanation});
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-012-v2-audio','audio',
    '先只聽一句話。說話者是在問手機的甚麼事？',
    ['剛才把手機放在哪裡。','手機能不能充電。','手機是誰買的。','手機是否真的被偷。'],
    '剛才把手機放在哪裡。',
    'Where did I put my phone? 是回想自己剛才放手機的位置，不等於確定被偷。'),
  mc('native-012-v2-tone','tone',
    '你一分鐘前還拿着手機，現在桌上看不到。哪個說法不會過早斷定手機已被偷或永久遺失？',
    ['Where did I put my phone?','Someone stole my phone.','My phone is gone forever.','I need to report a theft.'],
    'Where did I put my phone?',
    '剛拿過手機，先回想自己放在哪裡最合情理；另外三句都把未確定的事說得太肯定。'),
  mc('native-012-v2-repair','repair',
    '你想保留「我剛才放在哪裡」這個意思，把 Where did I put my phone at? 改成自然英文。應刪去甚麼？',
    ['句末的 at。','did。','my。','phone。'],
    '句末的 at。',
    'where 已表示位置，Where did I put my phone? 不需要再在句尾加 at。'),
  mc('native-012-v2-branch','branch',
    '朋友問 Did you leave your phone at the café? 你剛才還在家中拿着它，現在只是不知放在哪裡。怎樣回答最貼切？',
    ['I just had it here.','Yes, I left it there yesterday.','I sold it to the café.','It has definitely been stolen.'],
    'I just had it here.',
    'I just had it here 說明它剛才還在附近，能讓朋友把搜尋範圍縮小。'),
  blank('native-012-v2-transfer','transfer',
    '同一件事發生在眼鏡：你剛把眼鏡摘下來，現在忘記放在哪裡。用相同結構問自己。',
    ['Where did I put my glasses?','Where did I put the glasses?'],
    '問自己剛才把眼鏡放在哪裡。',
    'Where did I put my glasses? 把手機情境的問法轉用到眼鏡；不是說眼鏡必定丟了。'),
  blank('native-012-v2-final','final',
    '最後挑戰：你準備出門，剛才還拿着手機，現在找不到。先問自己放在哪裡，再補一句「我剛才還拿着」。寫成兩句英文。',
    ['Where did I put my phone? I just had it.','Where did I put my phone? I had it a second ago.','Where did I put my phone? I had it just now.'],
    '先問位置，再補充時間線索；不要直接說被偷。',
    'Where did I put my phone? I just had it. 既表達忘記放在哪裡，也說明手機剛才還在手上。')
];

const steps=[
  {id:'native-012-v2-audio',style:'audio',label:'先聽問題',title:'說話者想知道甚麼？',intro:'只聽聲音，先弄清楚這是找位置，還是確認遺失。',model:'Where did I put my phone?',zh:'我把手機放哪去了？',audioOnly:true,questions:['native-012-v2-audio']},
  {id:'native-012-v2-tone',style:'tone',label:'語氣分寸',title:'別把暫時找不到說成被偷',intro:'根據你已知的事，選擇不誇大的說法。',questions:['native-012-v2-tone']},
  {id:'native-012-v2-repair',style:'repair',label:'修正問法',title:'把多餘的 at 拿掉',intro:'保留原意，只改真正不自然的地方。',questions:['native-012-v2-repair']},
  {id:'native-012-v2-branch',style:'branch',label:'回應朋友',title:'用剛才的位置縮小搜尋範圍',intro:'朋友猜手機在咖啡店；你有更近的時間線索。',questions:['native-012-v2-branch']},
  {id:'native-012-v2-transfer',style:'transfer',label:'換物品運用',title:'手機換成眼鏡',intro:'同一種「剛放下卻忘記」的情況，換物品自己寫。',questions:['native-012-v2-transfer']},
  {id:'native-012-v2-final',style:'final',label:'兩句挑戰',title:'找手機時，給出時間線索',intro:'沒有選項或示範，用兩句話把情況講清楚。',questions:['native-012-v2-final']}
];

export default {revision:2,summary:'用 Where did I put my phone? 回想剛才的位置，並用 I just had it 提供時間線索。',steps,questions,takeaways:['Where did I put my phone?','I just had it.'],completionTitle:'你能清楚說明手機剛才還在，現在卻找不到了！'};
