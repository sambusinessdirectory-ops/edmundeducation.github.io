import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'open',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-056-v2-audio','audio','只聽咖啡店職員的問題。他要你在甚麼之間選擇？',
    ['一般含咖啡因咖啡和低咖啡因咖啡。','大杯和小杯。','熱咖啡和冰咖啡。','堂食和外賣。'],
    '一般含咖啡因咖啡和低咖啡因咖啡。','Regular or decaf? 在這個二選一情境中，regular 指一般含咖啡因的咖啡。'),
  mc('native-056-v2-detail','detail','如果客人回答 Regular, please.，哪件事仍未由這句決定？',
    ['杯子的尺寸。','是否選低咖啡因。','是否選一般咖啡因。','店員剛才提出甚麼對比。'],
    '杯子的尺寸。','在 Regular or decaf? 後，regular 回答的是咖啡因類別；杯量要看店員是否另問。'),
  mc('native-056-v2-explain','explain','為甚麼只看 regular 一字，不能永遠判定它指咖啡因？',
    ['它會隨問題改變：Regular or decaf? 問咖啡因；What size? 可能問杯量。','因為 regular 只用於衣服。','因為 decaf 是杯量名稱。','因為所有咖啡店的 regular 都表示無糖。'],
    '它會隨問題改變：Regular or decaf? 問咖啡因；What size? 可能問杯量。','同一字在不同店或問題中可能指不同選項；先聽清對方在比較甚麼。'),
  mc('native-056-v2-reverse','reverse','你不要 decaf，店員剛問 Regular or decaf? 哪句最直接回答？',
    ['Regular, please.','A large cup, please.','No sugar, please.','To go, please.'],
    'Regular, please.','店員此刻問的是咖啡因類別；直接選 regular，就表達一般咖啡而非低咖啡因。'),
  blank('native-056-v2-final','final','最後挑戰：朋友幫你買咖啡，傳訊息問 Regular or decaf? 你想要一般有咖啡因的咖啡。用簡短英文回覆，並提醒他這不是在說杯量。',
    ['Regular, please — not decaf.','Regular, please. Not decaf.','Regular coffee, please. Not decaf.','Regular, please, not decaf.'],
    '依照這個二選一問題回答咖啡因類別。','Regular, please — not decaf. 消除歧義；若要指定大小，可以另加一個句子。')
];

const steps=[
  {id:'native-056-v2-audio',style:'audio',label:'聽出對比',title:'店員在問哪個選擇？',intro:'先只聽問句，不憑 regular 一字猜。',model:'Regular or decaf?',zh:'一般咖啡還是低咖啡因？',audioOnly:true,questions:['native-056-v2-audio']},
  {id:'native-056-v2-detail',style:'detail',label:'找未說之事',title:'甚麼還沒決定？',intro:'答了咖啡因，不等於答了杯量。',questions:['native-056-v2-detail']},
  {id:'native-056-v2-explain',style:'explain',label:'理解語境',title:'regular 要看問題',intro:'同一字不能脫離服務員的問句。',questions:['native-056-v2-explain']},
  {id:'native-056-v2-reverse',style:'reverse',label:'即時回答',title:'不要 decaf',intro:'根據對方的二選一問題作答。',questions:['native-056-v2-reverse']},
  {id:'native-056-v2-final',style:'final',label:'短訊挑戰',title:'朋友代你買咖啡',intro:'新情境，自己消除咖啡因和杯量的混淆。',questions:['native-056-v2-final']}
];

export default {revision:2,summary:'聽清 Regular or decaf? 的對比，分辨 regular 在咖啡因和杯量語境中的不同意思。',steps,questions,takeaways:['regular coffee','Regular or decaf?'],completionTitle:'你能在咖啡店準確選擇一般咖啡，也會先聽清 regular 指甚麼了！'};
