import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-063-v2-audio','audio','只聽一個用品名稱。你會用它處理甚麼？',
    ['剪手指或腳趾的指甲。','整理頭髮。','拔出軟木塞。','擦乾身體。'],
    '剪手指或腳趾的指甲。','nail clippers 是指甲剪；nail 在這裏指指甲，不是釘子。'),
  mc('native-063-v2-explain','explain','為甚麼一般說 a pair of nail clippers 或 some nail clippers？',
    ['clippers 常以複數形式指這種工具。','因為每次一定要借兩把。','因為 nail 指兩隻手。','因為它只可剪兩根指甲。'],
    'clippers 常以複數形式指這種工具。','工具名稱慣用複數 clippers；some 不一定表示好幾把。'),
  mc('native-063-v2-contrast','contrast','你要剪指甲，不是剪紙。向室友借哪個物件最明確？',
    ['nail clippers','paper scissors','a hair tie','a corkscrew'],
    'nail clippers','nail clippers 專指修剪指甲的工具；一般剪刀未必適合。'),
  mc('native-063-v2-reverse','reverse','室友說 The ones in the bathroom drawer. 這句最可能是在回答哪個問題？',
    ['Where are the nail clippers?','How old is the bathroom?','What is the dinner menu?','When did you buy the drawer?'],
    'Where are the nail clippers?','The ones 指剛提到的指甲剪，in the bathroom drawer 告訴你位置。'),
  open('native-063-v2-repair','repair','你向室友說 I need a nail cutter.，但想用更常見的美式說法。重寫成自然的一句。',
    ['I need some nail clippers.','Do you have any nail clippers?','Could I borrow your nail clippers?'],
    'nail clippers 是很常見的用品名稱；按需要可以說你需要它，或向室友借。'),
  open('native-063-v2-final','final','最後挑戰：旅行途中指甲裂了一點，你想向酒店前台問有沒有指甲剪可以借。寫一句有禮英文。',
    ['Do you have any nail clippers I could borrow?','Could I borrow some nail clippers?','Do you happen to have nail clippers I could use?'],
    '先點名 nail clippers，再用 could borrow 或 could use 提出借用，不必講成買一把。')
];

const steps=[
  {id:'native-063-v2-audio',style:'audio',label:'聽出工具',title:'nail clippers 用來做甚麼？',intro:'先只聽物件名稱。',model:'nail clippers',zh:'指甲剪。',audioOnly:true,questions:['native-063-v2-audio']},
  {id:'native-063-v2-explain',style:'explain',label:'理解形式',title:'為何叫 clippers？',intro:'工具名稱的複數形式不等於要兩把。',questions:['native-063-v2-explain']},
  {id:'native-063-v2-contrast',style:'contrast',label:'選對工具',title:'指甲不是紙張',intro:'不要把專用工具和普通剪刀混淆。',questions:['native-063-v2-contrast']},
  {id:'native-063-v2-reverse',style:'reverse',label:'室友回答',title:'從位置推回問題',intro:'理解 the ones 回指剛談的物件。',questions:['native-063-v2-reverse']},
  {id:'native-063-v2-repair',style:'repair',label:'自然借法',title:'從直譯改成日常說法',intro:'不是每件工具都可用 cutter 命名。',questions:['native-063-v2-repair']},
  {id:'native-063-v2-final',style:'final',label:'旅館挑戰',title:'向前台借指甲剪',intro:'新情境，自己寫出有禮請求。',questions:['native-063-v2-final']}
];

export default {revision:2,summary:'辨認 nail clippers 的用途與慣用複數形式，並在家中或酒店自然借用。',steps,questions,takeaways:['nail clippers','I need some nail clippers.'],completionTitle:'你能準確叫出指甲剪，也能有禮向別人借用了！'};
