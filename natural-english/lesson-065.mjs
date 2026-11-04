import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-065-v2-audio','audio','只聽一個工具名稱。它最直接幫你打開哪種瓶？',
    ['用軟木塞封住的酒瓶。','普通旋蓋汽水瓶。','拉環易開罐。','裝果醬的玻璃罐。'],
    '用軟木塞封住的酒瓶。','corkscrew 的螺旋部分用來拔出 cork，即軟木塞。'),
  mc('native-065-v2-detail','detail','你看見紅酒瓶口有軟木塞，而不是旋蓋。向朋友借工具時，哪項細節最值得先說？',
    ['瓶子是 cork-sealed，需要拔塞工具。','酒標是紅色。','瓶子很高。','今晚有四個人喝。'],
    '瓶子是 cork-sealed，需要拔塞工具。','需要甚麼開瓶工具由封口方式決定；標籤和高度不決定是否要 corkscrew。'),
  mc('native-065-v2-explain','explain','為甚麼對旋蓋酒瓶問 Do we have a corkscrew? 可能多此一舉？',
    ['旋蓋通常直接扭開，不需要拔軟木塞。','旋蓋瓶裏一定沒有酒。','corkscrew 只能用於啤酒。','所有瓶子都要先鑽洞。'],
    '旋蓋通常直接扭開，不需要拔軟木塞。','先看瓶口的封口方式：旋蓋可以直接扭開，只有軟木塞瓶才需要 corkscrew 來拔塞。'),
  mc('native-065-v2-reverse','reverse','朋友問 What do we need to open this corked bottle? 你應答哪個工具？',
    ['A corkscrew.','A hair tie.','Nail clippers.','A cotton swab.'],
    'A corkscrew.','問題已說明瓶口有 cork；corkscrew 正是用來拔它。'),
  open('native-065-v2-repair','repair','你對朋友說 I need a wine screw.，對方沒明白。改成一句自然英文，說你需要開軟木塞酒瓶的工具。',
    ['I need a corkscrew.','Do you have a corkscrew?','Could I borrow a corkscrew?'],
    'corkscrew 是這件工具的自然名稱；說明你需要或借用即可。')
];

const steps=[
  {id:'native-065-v2-audio',style:'audio',label:'聽出工具',title:'哪種瓶要用它？',intro:'先只聽名稱，再看瓶口。',model:'corkscrew',zh:'紅酒開瓶器／拔軟木塞器。',audioOnly:true,questions:['native-065-v2-audio']},
  {id:'native-065-v2-detail',style:'detail',label:'看清瓶口',title:'有軟木塞嗎？',intro:'找出真正決定工具的細節。',questions:['native-065-v2-detail']},
  {id:'native-065-v2-explain',style:'explain',label:'避免多做',title:'旋蓋不需要拔塞',intro:'不是每瓶紅酒都要用同一工具。',questions:['native-065-v2-explain']},
  {id:'native-065-v2-reverse',style:'reverse',label:'由需要找工具',title:'軟木塞瓶要甚麼？',intro:'從瓶口條件反推工具名稱。',questions:['native-065-v2-reverse']},
  {id:'native-065-v2-speak',style:'speak',label:'廚房口說',title:'向朋友找開瓶器',intro:'先自己說；錄音或跳過後才聽示範。',model:'I need a corkscrew.',zh:'我需要一把拔軟木塞的開瓶器。',speakingPrompt:'朋友問：Ready to open the wine? 瓶口有軟木塞，你還缺工具。',recording:'phrase',questions:[]},
  {id:'native-065-v2-repair',style:'repair',label:'修正名稱',title:'不是 wine screw',intro:'自己改成自然的工具名稱。',questions:['native-065-v2-repair']}
];

export default {revision:2,summary:'用 corkscrew 指拔軟木塞的開瓶器，先看封口方式，再提出借用請求。',steps,questions,takeaways:['corkscrew','I need a corkscrew.'],completionTitle:'你能按瓶口選對工具，也能自然向朋友借開瓶器了！'};
