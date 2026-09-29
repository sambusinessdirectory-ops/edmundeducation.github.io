import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-020-v2-reverse','reverse',
    '點餐單寫 extra sauce。廚房應該怎樣處理？',
    ['比平常多給一些醬。','完全不要醬。','只把原本的醬另外裝。','把醬換成另一種口味。'],
    '比平常多給一些醬。',
    'extra 改的是份量；on the side 才是改擺放方式。'),
  mc('native-020-v2-audio','audio',
    '只聽客人一句請求。他想多要的是甚麼？',
    ['番茄醬。','芥末醬。','整份薯條。','一杯飲品。'],
    '番茄醬。',
    'Can I get extra ketchup? 是問能否多給番茄醬，沒有要求增加薯條份量。'),
  mc('native-020-v2-contrast','contrast',
    '你的雞翼醬汁不夠，但並不介意醬直接淋在雞翼上。哪句最切中需要？',
    ['Can I get extra sauce?','Can I get the sauce on the side?','No sauce, please.','Can you change the sauce?'],
    'Can I get extra sauce?',
    '你想增加的是醬的份量，因此用 extra sauce；on the side 只改擺放方式。'),
  blank('native-020-v2-final','final',
    '最後挑戰：你買薯條，標準的一包番茄醬不夠。你想再要兩包，不是改成另外放。用一句自然英文向店員提出請求。',
    ['Can I get two extra packets of ketchup?','Could I get two extra packets of ketchup?','Can I have two extra packets of ketchup?','Could I have two extra packets of ketchup?','Can I get two more packets of ketchup?','Could I get two more packets of ketchup?'],
    '說明多要的數量和醬料；不要只說擺放位置。',
    'Can I get two extra packets of ketchup? 同時說清楚數量、醬料和「額外」的意思。')
];

const steps=[
  {id:'native-020-v2-reverse',style:'reverse',label:'讀懂訂單',title:'extra 改的是甚麼？',intro:'先從餐點備註判斷廚房應該怎樣做。',questions:['native-020-v2-reverse']},
  {id:'native-020-v2-audio',style:'audio',label:'聽清醬料',title:'客人要多給甚麼？',intro:'只聽聲音，答完才看句子。',model:'Can I get extra ketchup?',zh:'可以多給我一些番茄醬嗎？',audioOnly:true,questions:['native-020-v2-audio']},
  {id:'native-020-v2-contrast',style:'contrast',label:'分清要求',title:'多一點，不是另外放',intro:'份量和擺放是兩回事；這次你只想增加份量。',questions:['native-020-v2-contrast']},
  {id:'native-020-v2-speak',style:'speak',label:'口說加醬',title:'薯條的番茄醬不夠，自己開口',intro:'先向店員請求，錄音或跳過後才看示範。',model:'Can I get extra ketchup?',zh:'可以多給我一些番茄醬嗎？',speakingPrompt:'你拿着薯條，想多要一些番茄醬。店員問 Anything else? 請直接回答。',recording:'phrase',questions:[]},
  {id:'native-020-v2-final',style:'final',label:'數量挑戰',title:'多要兩包番茄醬',intro:'沒有選項；這次要把數量也說清楚。',questions:['native-020-v2-final']}
];

export default {revision:2,summary:'用 extra sauce 或 extra ketchup 說明需要加量，分清份量、擺放和數量。',steps,questions,takeaways:['extra sauce','Can I get extra ketchup?'],completionTitle:'你能清楚要求多一點醬，也能說明數量了！'};
