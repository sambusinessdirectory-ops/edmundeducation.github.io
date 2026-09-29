import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-064-v2-audio','audio','只聽一個廚房物件名稱。它是甚麼的一部分？',
    ['爐具上用來加熱鍋子的爐頭。','雪櫃裏的抽屜。','焗爐裏的架。','水槽的去水口。'],
    '爐具上用來加熱鍋子的爐頭。','burner 指爐具的一個加熱位；一部 stove 可以有多個 burners。'),
  mc('native-064-v2-scene','scene','晚飯煮完，整部爐有四個爐頭，其中一個還開着。你要提醒室友甚麼？',
    ['One burner is still on. Please turn it off.','All the lights in the house are on.','The fridge door is open.','The oven timer is ringing.'],
    'One burner is still on. Please turn it off.','說明只有其中一個爐頭仍開着，再直接請人關掉。'),
  mc('native-064-v2-tone','tone','你看見瓦斯爐頭還有火，室友正走出廚房。哪句提醒清楚、及時？',
    ['Wait—the burner is still on. Please turn it off.','Maybe sometime next week you could think about the stove.','The kitchen has four walls.','It probably does not matter whether the flame stays on.'],
    'Wait—the burner is still on. Please turn it off.','對仍在燃燒的爐頭應直接提醒並請人關掉；這裏清楚比過度婉轉重要。'),
  mc('native-064-v2-transfer','transfer','換成電爐：沒有明火，但一個加熱位仍亮着。burner 能否繼續指那個加熱位？',
    ['可以；burner 也可指電爐上的加熱位。','不可以；burner 只指雪櫃。','不可以；電爐只有 oven。','可以，但只在說整座房子時用。'],
    '可以；burner 也可指電爐上的加熱位。','burner 不是只說可見火焰；電爐的加熱位也常這樣稱呼。'),
  open('native-064-v2-final','final','最後挑戰：你離開廚房前發現其中一個爐頭還開着。用兩句英文立刻提醒室友，說明哪裏沒關並請他關掉。',
    ['One burner is still on. Please turn it off.','The burner is still on. Can you turn it off?','The stove burner is still on. Please turn it off.'],
    '指出 burner 仍開着，再明確請人 turn it off；不要只說「廚房有問題」。')
];

const steps=[
  {id:'native-064-v2-audio',style:'audio',label:'聽出部件',title:'爐頭不是整部爐',intro:'先只聽物件名稱。',model:'burner',zh:'爐頭。',audioOnly:true,questions:['native-064-v2-audio']},
  {id:'native-064-v2-scene',style:'scene',label:'煮飯之後',title:'有一個爐頭還開着',intro:'說出是哪一部分需要處理。',questions:['native-064-v2-scene']},
  {id:'native-064-v2-tone',style:'tone',label:'及時提醒',title:'別把安全提醒說得含糊',intro:'清楚、立即地請室友關爐。',questions:['native-064-v2-tone']},
  {id:'native-064-v2-speak',style:'speak',label:'說出部件',title:'指出是爐頭',intro:'先自己說出部件名稱；錄音或跳過後才聽示範。',model:'burner',zh:'爐頭。',speakingPrompt:'朋友問：Which part of the stove do you mean? 用英文說出爐頭的名稱。',recording:'phrase',questions:[]},
  {id:'native-064-v2-transfer',style:'transfer',label:'換電爐',title:'不是只有明火才叫 burner',intro:'把詞用於另一種爐具。',questions:['native-064-v2-transfer']},
  {id:'native-064-v2-final',style:'final',label:'關爐挑戰',title:'離開前發現還有爐頭開着',intro:'新情境，自己提出及時清楚的提醒。',questions:['native-064-v2-final']}
];

export default {revision:2,summary:'分清整部 stove 與其中一個 burner，並在爐頭仍開着時清楚提醒關掉。',steps,questions,takeaways:['burner','The stove has four burners.'],completionTitle:'你能說清哪個爐頭仍開着，也能及時提醒別人關掉了！'};
