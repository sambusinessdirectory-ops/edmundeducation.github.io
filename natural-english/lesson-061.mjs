import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-061-v2-audio','audio','只聽一個物件名稱。這件東西主要用來做甚麼？',
    ['把頭髮束起來。','剪短頭髮。','梳開打結。','吹乾頭髮。'],
    '把頭髮束起來。','hair tie 是綁頭髮用的髮圈，不是剪刀、梳子或風筒。'),
  mc('native-061-v2-scene','scene','你要去跑步，頭髮一直遮住眼睛。朋友袋裏可能有你需要的東西。你會問甚麼？',
    ['Do you have a hair tie?','Do you have a hair dryer?','Do you have nail clippers?','Do you have a corkscrew?'],
    'Do you have a hair tie?','髮圈能把長髮束起來，適合跑步前快速處理頭髮。'),
  mc('native-061-v2-contrast','contrast','hair tie 和 hair clip 的主要區別是甚麼？',
    ['前者通常繞着頭髮綁起來；後者用夾子固定。','前者用來剪指甲；後者用來開瓶。','兩者都只指頭髮顏色。','前者是洗髮水；後者是護髮素。'],
    '前者通常繞着頭髮綁起來；後者用夾子固定。','兩者都可固定頭髮，但物件形態和使用方式不同。'),
  mc('native-061-v2-explain','explain','為甚麼只說 I need a rubber band. 可能令朋友拿錯東西？',
    ['一般橡皮筋可指綁文件等物品，不一定是為頭髮設計。','rubber band 必定是剪刀。','hair tie 只用於鞋帶。','兩個詞都只指金屬夾。'],
    '一般橡皮筋可指綁文件等物品，不一定是為頭髮設計。','說 hair tie 能更清楚指定你要的是綁頭髮的物件。'),
  open('native-061-v2-final','final','最後挑戰：運動課快開始，頭髮擋住視線。向身旁同學用一句禮貌英文借一條髮圈。',
    ['Do you have a hair tie I could borrow?','Could I borrow a hair tie?','Do you have a spare hair tie?'],
    '點名 hair tie，再用 could I borrow 或 do you have…? 讓對方知道你只是暫借。')
];

const steps=[
  {id:'native-061-v2-audio',style:'audio',label:'聽出物件',title:'綁頭髮用甚麼？',intro:'先只聽名稱。',model:'hair tie',zh:'髮圈。',audioOnly:true,questions:['native-061-v2-audio']},
  {id:'native-061-v2-scene',style:'scene',label:'跑步之前',title:'頭髮擋住眼睛',intro:'在實際需要中選對物件。',questions:['native-061-v2-scene']},
  {id:'native-061-v2-contrast',style:'contrast',label:'固定方式',title:'髮圈和髮夾',intro:'不是所有固定頭髮的東西都一樣。',questions:['native-061-v2-contrast']},
  {id:'native-061-v2-explain',style:'explain',label:'說得精準',title:'一般橡皮筋會引起誤會',intro:'讓朋友知道你要的是綁頭髮的用品。',questions:['native-061-v2-explain']},
  {id:'native-061-v2-speak',style:'speak',label:'即時借用',title:'問朋友有沒有髮圈',intro:'先自己說；錄音或跳過後才聽示範。',model:'I need a hair tie.',zh:'我需要一條髮圈。',speakingPrompt:'朋友：Are you ready? 你要先把頭髮綁起來。',recording:'phrase',questions:[]},
  {id:'native-061-v2-final',style:'final',label:'運動課挑戰',title:'向同學借髮圈',intro:'新情境，自己說出完整請求。',questions:['native-061-v2-final']}
];

export default {revision:2,summary:'用 hair tie 精準說綁頭髮的髮圈，分清髮夾與一般橡皮筋，並向人借用。',steps,questions,takeaways:['hair tie','I need a hair tie.'],completionTitle:'你能準確說出髮圈，也能自然向人借一條了！'};
