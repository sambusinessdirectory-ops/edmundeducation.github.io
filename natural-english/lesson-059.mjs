import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-059-v2-audio','audio','只聽店員的一句話。他需要顧客決定甚麼？',
    ['尺寸。','口味。','付款方式。','是否外賣。'],
    '尺寸。','What size would you like? 是詢問所需尺寸；先聽清問題才回答 regular。'),
  mc('native-059-v2-detail','detail','店員問 Small, regular, or large? 這裏的 regular 指甚麼？',
    ['這家店列出的標準尺寸選項。','是否有咖啡因。','是否少冰。','是否要普通糖。'],
    '這家店列出的標準尺寸選項。','在明確列出的尺寸選項裏，regular 是一般／標準尺寸；不能把它硬換算成各店相同的毫升數。'),
  mc('native-059-v2-transfer','transfer','在咖啡店剛聽到 Regular or decaf?，不能照搬「regular size」來理解，因為這次問的是甚麼？',
    ['咖啡因類別。','杯子的尺寸。','咖啡的溫度。','要不要杯蓋。'],
    '咖啡因類別。','regular 的意思要由同一句的對比項決定；和 decaf 並列時說的是一般咖啡因。'),
  mc('native-059-v2-repair','repair','你想點標準尺寸飲品，店員問 Small, regular, or large? 你說 I want a normal one.，哪句更貼近菜單用語？',
    ['Regular, please.','Decaf, please.','Still, please.','On the side, please.'],
    'Regular, please.','店員已提供 regular 作尺寸名稱；沿用同一個詞，比說 normal one 更清楚。'),
  blank('native-059-v2-reverse','reverse','朋友代你買果汁，傳訊息問 What size? 店內有 small、regular、large，你要中間的標準選項。用簡短英文答覆。',
    ['Regular, please.','The regular size, please.','A regular, please.','Regular size, please.'],
    '按店內列出的尺寸名稱回答。','這裏 regular 是尺寸選項；不要從中推斷容量，或把它和咖啡的 decaf 對比混淆。'),
  blank('native-059-v2-final','final','最後挑戰：你在戲院買汽水。店員說 Small, regular, or large? 你要標準尺寸，另想確認它有多少毫升。用兩句英文回答並詢問容量。',
    ['Regular, please. How many milliliters is that?','The regular size, please. How many milliliters is that?','Regular, please. How big is that in milliliters?','A regular, please. How many milliliters is that?'],
    '先選尺寸，再問實際容量。','regular 選定店內標準尺寸；若容量重要，應另問，不要假定各店的 regular 一樣大。')
];

const steps=[
  {id:'native-059-v2-audio',style:'audio',label:'聽出分類',title:'店員在問甚麼？',intro:'先只聽問題，別搶先套用 regular。',model:'What size would you like?',zh:'你想要甚麼尺寸？',audioOnly:true,questions:['native-059-v2-audio']},
  {id:'native-059-v2-detail',style:'detail',label:'店內選項',title:'regular 是標準尺寸',intro:'只在這個尺寸問題下這樣理解。',questions:['native-059-v2-detail']},
  {id:'native-059-v2-transfer',style:'transfer',label:'回看咖啡',title:'regular 也可能不是尺寸',intro:'用對比項推斷意思。',questions:['native-059-v2-transfer']},
  {id:'native-059-v2-repair',style:'repair',label:'沿用菜單',title:'normal one 不夠精準',intro:'服務員已給出標準選項名稱。',questions:['native-059-v2-repair']},
  {id:'native-059-v2-reverse',style:'reverse',label:'朋友代買',title:'直接回覆尺寸',intro:'簡短回答，不加多餘的猜測。',questions:['native-059-v2-reverse']},
  {id:'native-059-v2-final',style:'final',label:'戲院挑戰',title:'尺寸與容量分開問',intro:'新情境，自己選尺寸並核實實際容量。',questions:['native-059-v2-final']}
];

export default {revision:2,summary:'在尺寸問題中用 regular 選標準選項，並按對比項分清它與咖啡因語境的意思。',steps,questions,takeaways:['regular size','What size would you like?'],completionTitle:'你能按店內尺寸選項回答，也會另外核實實際容量了！'};
