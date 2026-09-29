const mc=(id,style,prompt,options,answer,explanation)=>({id,type:'mc',style,prompt,options,answers:[answer],explanation});
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-034-v2-audio','audio',
    '只聽一句關於廚具的評語。這把刀有甚麼問題？',
    ['刀刃不夠利，切東西很費力。','刀柄太短。','刀身太重。','刀已經生鏽。'],
    '刀刃不夠利，切東西很費力。',
    'The knife is dull. 在刀具情境指刀刃鈍、不夠鋒利。'),
  mc('native-034-v2-explain','explain',
    'The knife is dull. 和 The knife isn’t sharp. 在這個情境有甚麼關係？',
    ['兩句都能自然說刀不夠利。','前句說刀很有趣，後句說刀很鋒利。','前句說刀太重，後句說刀太輕。','兩句都說刀柄壞掉。'],
    '兩句都能自然說刀不夠利。',
    'dull 形容刀鈍；isn’t sharp 也能表達相近意思，不能把其中一句硬判成錯。'),
  mc('native-034-v2-repair','repair',
    '你想說刀不利，卻把 dull 的另一個意思「無聊」誤套進句子，說 The knife is boring.。哪句最適合修正？',
    ['The knife is dull.','The knife is bored.','The knife is sleepy.','The knife is noisy.'],
    'The knife is dull.',
    '在刀具情境，dull 是刀刃鈍；boring 形容令人覺得無聊的事，不說刀切不動。'),
  blank('native-034-v2-transfer','transfer',
    '換一件工具：你用一把剪刀剪紙，刀刃不夠利。用英文寫一句，指出剪刀已經鈍了。',
    ['These scissors are dull.','The scissors are dull.','These scissors aren’t sharp.','The scissors are not sharp.'],
    '剪刀在英文通常用複數形式。',
    'These scissors are dull. 把同一個形容詞轉用到剪刀，並正確使用複數。'),
  blank('native-034-v2-final','final',
    '最後挑戰：你在餐廳切牛排，刀鈍得很難切。先向店員說明問題，再禮貌地請他換一把鋒利些的刀。寫兩句英文。',
    ['This knife is dull. Could I have a sharper one?','The knife is dull. Could I have a sharper one?','This knife isn’t sharp. Could I have a sharper one?','This knife is dull. Can I have a sharper one?','The knife is dull. Can I have a sharper one?'],
    '先說刀刃的問題，再提出你需要的替換品。',
    'This knife is dull. Could I have a sharper one? 既說明切不動的原因，也禮貌地要求更合用的刀。')
];

const steps=[
  {id:'native-034-v2-audio',style:'audio',label:'聽出刀況',title:'刀是重，還是鈍？',intro:'先只聽聲音，答完才看文字。',model:'The knife is dull.',zh:'這把刀鈍了。',audioOnly:true,questions:['native-034-v2-audio']},
  {id:'native-034-v2-explain',style:'explain',label:'認識同義說法',title:'not sharp 也可以說',intro:'不要把另一句自然英文當成錯誤。',questions:['native-034-v2-explain']},
  {id:'native-034-v2-repair',style:'repair',label:'修正詞義',title:'刀不是「覺得無聊」',intro:'同一個字有不同意思，這次只談刀刃。',questions:['native-034-v2-repair']},
  {id:'native-034-v2-transfer',style:'transfer',label:'換到剪刀',title:'形容詞可以轉用',intro:'換工具之後，也要留意英文單複數。',questions:['native-034-v2-transfer']},
  {id:'native-034-v2-final',style:'final',label:'餐廳挑戰',title:'說明問題，再提出需要',intro:'沒有選項，完成一段真正能用來求助的話。',questions:['native-034-v2-final']}
];

export default {revision:2,summary:'用 dull 描述刀具不夠鋒利，知道 not sharp 也自然，並把說法轉用到剪刀。',steps,questions,takeaways:['It’s dull.','The knife is dull.'],completionTitle:'你能清楚指出刀具變鈍，也能禮貌地要求替換了！'};
