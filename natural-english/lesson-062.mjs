import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-062-v2-audio','audio','只聽一句酒店客人的請求。他在問甚麼物件？',
    ['棉花棒。','牙線。','毛巾。','髮圈。'],
    '棉花棒。','Q-tips 在美式日常口語中常指棉花棒；cotton swabs 是通用名稱。'),
  mc('native-062-v2-detail','detail','酒店職員說 We can send some up. 這裏的 some 最可能回指甚麼？',
    ['客人剛問的棉花棒。','新房間。','一條完整毛巾。','早餐時段。'],
    '客人剛問的棉花棒。','some 承接先前提出的複數用品；按對話脈絡理解，不必把物件名每句重複。'),
  mc('native-062-v2-contrast','contrast','cotton swab 和 Q-tip 的關係最接近哪一項？',
    ['通用名稱與常見品牌名稱。','大小兩種不同的棉被。','一個是牙刷，一個是牙線。','一個是液體，一個是紙巾。'],
    '通用名稱與常見品牌名稱。','cotton swab 是通用名稱；Q-tip 原是品牌名，在美式口語中常泛指棉花棒。'),
  open('native-062-v2-repair','repair','你向酒店說 Do you have cotton sticks?，對方沒明白。改成一句自然英文詢問有沒有棉花棒。',
    ['Do you have any cotton swabs?','Do you have any Q-tips?','Could I get a few cotton swabs?'],
    'cotton swabs 和 Q-tips 都可讓美式英語使用者明白你要的日用品。'),
  open('native-062-v2-transfer','transfer','換到藥房：你找不到棉花棒，想問店員放在哪個貨架。寫一句自然英文。',
    ['Where can I find cotton swabs?','Do you know where the cotton swabs are?','Which aisle has cotton swabs?'],
    '這次不是向酒店索取，而是在藥房問貨架位置；因此用 Where can I find…? 更直接。')
];

const steps=[
  {id:'native-062-v2-audio',style:'audio',label:'聽出日用品',title:'酒店客人要甚麼？',intro:'先只聽英文請求。',model:'Do you have any Q-tips?',zh:'你們有棉花棒嗎？',audioOnly:true,questions:['native-062-v2-audio']},
  {id:'native-062-v2-detail',style:'detail',label:'接住代詞',title:'職員說 some 指甚麼？',intro:'用對話脈絡找出物件。',questions:['native-062-v2-detail']},
  {id:'native-062-v2-contrast',style:'contrast',label:'兩種名稱',title:'通用詞與常見品牌名',intro:'同一類物件有兩個常聽到的名字。',questions:['native-062-v2-contrast']},
  {id:'native-062-v2-speak',style:'speak',label:'前台口說',title:'請職員幫忙找棉花棒',intro:'先自己說；錄音或跳過後才聽示範。',model:'Do you have any Q-tips?',zh:'你們有棉花棒嗎？',speakingPrompt:'酒店前台問：How can I help? 你想問有沒有棉花棒。',recording:'phrase',questions:[]},
  {id:'native-062-v2-repair',style:'repair',label:'修正直譯',title:'cotton sticks 說不清',intro:'改用自然名稱。',questions:['native-062-v2-repair']},
  {id:'native-062-v2-transfer',style:'transfer',label:'藥房貨架',title:'從索取變成問路',intro:'物件沒變，任務換了。',questions:['native-062-v2-transfer']}
];

export default {revision:2,summary:'認識 cotton swab / Q-tip，並按酒店索取或藥房尋找的任務提出不同請求。',steps,questions,takeaways:['cotton swab / Q-tip','Do you have any Q-tips?'],completionTitle:'你能辨認棉花棒的兩種名稱，也能在不同地點清楚詢問了！'};
