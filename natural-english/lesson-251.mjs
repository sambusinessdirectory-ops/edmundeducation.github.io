import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-251-v2-audio','audio','只聽這句描述床的話。說話者最可能發現甚麼？',
    ['床墊中間慢慢下陷。','床單剛洗完還沒乾。','床架的一隻腳斷了。','枕頭裏的棉花結塊。'],
    '床墊中間慢慢下陷。','sagging 描述承托面往下塌；這裏說的是床墊本身，而非床單、床架或枕頭。'),
  mc('native-251-v2-continue','continue','朋友問：「Why are you thinking about getting a new mattress?」你躺上去總會滑向中間的低位。哪句最直接回答？',
    ['The middle is starting to sag.','The sheets keep coming off.','The frame makes a clicking noise.','The pillows have gone flat.'],
    'The middle is starting to sag.','The middle 指床墊中間；starting to sag 交代逐漸下陷的問題，也接上換床墊的原因。'),
  mc('native-251-v2-repair','repair','你本想描述「床墊承托力變差，中間凹下去」，卻說成「The mattress has a dent」。哪句更能表達長期使用後逐漸塌陷？',
    ['The mattress is sagging in the middle.','The mattress has a stain in the middle.','The mattress is folded in the middle.','The mattress is too narrow in the middle.'],
    'The mattress is sagging in the middle.','dent 可指局部凹痕；sagging in the middle 更清楚描述床墊中央因失去承托而往下塌。'),
  open('native-251-v2-final','final','新情境：你搬進舊公寓，睡了幾晚後發現床墊中間有低位，醒來腰背不舒服。寫兩句英文給房東，說明床墊的狀況和影響。',
    ['The mattress is sagging in the middle. I wake up with a sore back.','The middle of the mattress is starting to sag. It has been uncomfortable to sleep on.','I think the mattress has sagged over time. My back hurts when I wake up.'],
    '自評時看是否說清楚「床墊下陷」和「睡後影響」兩件事；可用 sagging 或 has sagged。')
];

const steps=[
  {id:'native-251-v2-audio',style:'audio',label:'聽出問題',title:'床墊出了甚麼事？',intro:'先聽，不看英文句子。',model:'The mattress is sagging.',zh:'床墊逐漸下陷。',audioOnly:true,questions:['native-251-v2-audio']},
  {id:'native-251-v2-continue',style:'continue',label:'接續談話',title:'為何想換床墊？',intro:'接着朋友的問題，說出具體原因。',questions:['native-251-v2-continue']},
  {id:'native-251-v2-repair',style:'repair',label:'說得更準',title:'凹痕還是逐漸下陷？',intro:'把原本含糊的描述改得更貼合長期使用。',questions:['native-251-v2-repair']},
  {id:'native-251-v2-speak',style:'speak',label:'即時口說',title:'向室友描述床墊',intro:'先自己說；錄音或跳過後才聽示範。',model:'The mattress is sagging.',zh:'床墊逐漸下陷。',speakingPrompt:'室友問你睡得怎樣；床墊中間向下塌。簡短描述問題。',recording:'phrase',questions:[]},
  {id:'native-251-v2-final',style:'final',label:'寫給房東',title:'說明狀況和影響',intro:'新情境，寫完後用示例自行檢查。',questions:['native-251-v2-final']}
];

export default {revision:2,summary:'辨認床墊因長期使用而下陷，並具體說明中間低位對睡眠的影響。',steps,questions,takeaways:['The mattress is sagging.'],completionTitle:'你能準確說明床墊下陷，並向他人解釋它造成的不適。'};
