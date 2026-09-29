import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'open',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-060-v2-audio','audio','只聽一句快餐點餐話。顧客這次要甚麼？',
    ['只要三文治本身。','要三文治套餐。','只要薯條。','要把三文治取消。'],
    '只要三文治本身。','Just the sandwich. 是只點主餐，不是把它做成 combo。'),
  mc('native-060-v2-explain','explain','快餐店說 combo meal 時，為甚麼不應只憑「套餐」兩字猜一定有某種飲品？',
    ['具體配搭由店家的套餐內容決定，要看菜單或問店員。','combo 永遠只有三文治。','combo 一定免費。','combo 一定不包含任何配菜。'],
    '具體配搭由店家的套餐內容決定，要看菜單或問店員。','combo meal 是組合餐的名稱，常見主餐配薯條和飲品，但實際內容、尺寸及價錢以店家為準。'),
  mc('native-060-v2-scene','scene','你要漢堡、薯條和飲品，菜單上把這組合標作 combo。哪句向店員點得最清楚？',
    ["I'll get the burger combo, please.","Just the burger, please.","I'll get a single burger with no sides.","I already ate the combo."],
    "I'll get the burger combo, please.",'已知菜單的 combo 包含你要的組合，用店內名稱點餐最清楚。'),
  mc('native-060-v2-reverse','reverse','店員問 Would you like the combo? 你今天不想要配菜或飲品。哪句自然回答？',
    ['No, thanks. Just the sandwich.','Yes, the full combo with a drink.','Please add fries on the side.','I would like two drinks instead.'],
    'No, thanks. Just the sandwich.','先婉拒套餐，再說只要主餐，店員就不會替你加配菜和飲品。'),
  blank('native-060-v2-transfer','transfer','換成雞肉三文治：菜單確認 combo 包含主餐、薯條和飲品，你要這份套餐。寫一句英文點餐。',
    ["I'll get the chicken sandwich combo, please.","I'd like the chicken sandwich combo, please.","Can I get the chicken sandwich combo?","I'll have the chicken sandwich combo, please."],
    '按菜單的套餐名稱點，別只說 sandwich。','chicken sandwich combo 把主餐和套餐選擇一起說清楚；配搭內容仍以這家店菜單為準。')
];

const steps=[
  {id:'native-060-v2-audio',style:'audio',label:'聽出選擇',title:'只要主餐，還是套餐？',intro:'先只聽顧客一句話。',model:'Just the sandwich.',zh:'只要三文治。',audioOnly:true,questions:['native-060-v2-audio']},
  {id:'native-060-v2-explain',style:'explain',label:'核實內容',title:'combo 包甚麼？',intro:'名稱告訴你是組合，但細節仍要看菜單。',questions:['native-060-v2-explain']},
  {id:'native-060-v2-scene',style:'scene',label:'點漢堡套餐',title:'想要薯條和飲品',intro:'已確認套餐內容後，用店內名稱點。',questions:['native-060-v2-scene']},
  {id:'native-060-v2-reverse',style:'reverse',label:'拒絕套餐',title:'今天只要主餐',intro:'接住店員的推薦，說清楚你不加配搭。',questions:['native-060-v2-reverse']},
  {id:'native-060-v2-transfer',style:'transfer',label:'換款主餐',title:'雞肉三文治套餐',intro:'套餐概念不變，主餐換了。',questions:['native-060-v2-transfer']}
];

export default {revision:2,summary:'分清 combo meal 與單點主餐，按店家菜單確認配搭後清楚點餐。',steps,questions,takeaways:['combo / combo meal','Just the sandwich.'],completionTitle:'你能分清套餐與單點，也會先核實套餐包含甚麼了！'};
